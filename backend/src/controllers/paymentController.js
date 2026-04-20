const crypto = require('crypto');
const db = require('../config/db');
const { sendEmail } = require('../utils/emailService');

const schemaCache = new Map();
const EPSILON = 0.0001;
const LOYALTY_EARN_PER_LKR = Number(process.env.LOYALTY_EARN_RATE_LKR || 100);

const round2 = (value) => Number(Number(value || 0).toFixed(2));

const getTableColumns = async (tableName, conn = db) => {
  const cacheKey = `${process.env.DB_NAME}:${tableName}`;
  if (schemaCache.has(cacheKey)) {
    return schemaCache.get(cacheKey);
  }

  const [rows] = await conn.query(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
    [process.env.DB_NAME, tableName]
  );

  const columns = new Set(rows.map((row) => row.COLUMN_NAME));
  schemaCache.set(cacheKey, columns);
  return columns;
};

const getRoleName = async (userId, conn = db) => {
  const [rows] = await conn.query(
    `SELECT r.role_name
     FROM users u
     JOIN roles r ON r.role_id = u.role_id
     WHERE u.user_id = ?`,
    [userId]
  );

  return rows.length ? rows[0].role_name : null;
};

const getInvoiceForUpdate = async (conn, invoiceId) => {
  const [rows] = await conn.query(
    `SELECT i.invoice_id, i.client_id, i.total_amount, i.status, u.email
     FROM invoices i
     JOIN clients c ON c.client_id = i.client_id
     LEFT JOIN users u ON u.user_id = c.user_id
     WHERE i.invoice_id = ?
     FOR UPDATE`,
    [invoiceId]
  );

  return rows[0] || null;
};

const getCurrentPaidAmount = async (conn, invoiceId) => {
  const [rows] = await conn.query(
    'SELECT COALESCE(SUM(amount), 0) AS paid FROM payments WHERE invoice_id = ?',
    [invoiceId]
  );

  return Number(rows[0]?.paid || 0);
};

const calculateStatus = (totalAmount, paidAmount) => {
  if (paidAmount <= EPSILON) return 'UNPAID';
  if (paidAmount + EPSILON < totalAmount) return 'PARTIAL';
  return 'PAID';
};

const insertPaymentRow = async (
  conn,
  { invoiceId, amount, paymentMethod, payherePaymentId, md5sig }
) => {
  const paymentColumns = await getTableColumns('payments', conn);

  const columns = ['invoice_id', 'amount'];
  const values = [invoiceId, amount];

  if (paymentColumns.has('payment_method')) {
    columns.push('payment_method');
    values.push(paymentMethod);
  }

  if (paymentColumns.has('payment_date')) {
    columns.push('payment_date');
    values.push(new Date());
  } else if (paymentColumns.has('created_at')) {
    columns.push('created_at');
    values.push(new Date());
  }

  if (payherePaymentId && paymentColumns.has('payhere_payment_id')) {
    columns.push('payhere_payment_id');
    values.push(payherePaymentId);
  } else if (payherePaymentId && paymentColumns.has('transaction_id')) {
    columns.push('transaction_id');
    values.push(payherePaymentId);
  }

  if (md5sig && paymentColumns.has('md5sig')) {
    columns.push('md5sig');
    values.push(md5sig);
  }

  const placeholders = columns.map(() => '?').join(', ');
  const [result] = await conn.query(
    `INSERT INTO payments (${columns.join(', ')}) VALUES (${placeholders})`,
    values
  );

  return result.insertId;
};

const grantLoyaltyPointsIfEligible = async (conn, invoice, statusBefore, statusAfter) => {
  if (statusBefore === 'PAID' || statusAfter !== 'PAID') {
    return 0;
  }

  const clientColumns = await getTableColumns('clients', conn);
  if (!clientColumns.has('loyalty_points')) {
    return 0;
  }

  const totalAmount = Number(invoice.total_amount || 0);
  const earnedPoints = Math.floor(totalAmount / LOYALTY_EARN_PER_LKR);

  if (earnedPoints <= 0) {
    return 0;
  }

  await conn.query(
    'UPDATE clients SET loyalty_points = COALESCE(loyalty_points, 0) + ? WHERE client_id = ?',
    [earnedPoints, invoice.client_id]
  );

  return earnedPoints;
};

const processPayment = async ({
  invoiceId,
  amount,
  paymentMethod,
  payherePaymentId = null,
  md5sig = null,
  allowAlreadyPaid = false
}) => {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const invoice = await getInvoiceForUpdate(conn, invoiceId);
    if (!invoice) {
      await conn.rollback();
      return { statusCode: 404, body: { message: 'Invoice not found' } };
    }

    const totalAmount = Number(invoice.total_amount || 0);
    const statusBefore = invoice.status;

    const paidAmountBefore = await getCurrentPaidAmount(conn, invoiceId);
    const remaining = round2(Math.max(0, totalAmount - paidAmountBefore));

    if (remaining <= EPSILON || statusBefore === 'PAID') {
      await conn.rollback();
      if (allowAlreadyPaid) {
        return { statusCode: 200, body: { message: 'Invoice already paid' } };
      }
      return { statusCode: 400, body: { message: 'Invoice already paid' } };
    }

    if (amount > remaining + EPSILON) {
      await conn.rollback();
      return {
        statusCode: 400,
        body: { message: 'Payment exceeds remaining balance', remaining_balance: round2(remaining) }
      };
    }

    const paymentId = await insertPaymentRow(conn, {
      invoiceId,
      amount: round2(amount),
      paymentMethod,
      payherePaymentId,
      md5sig
    });

    const paidAmountAfter = round2(paidAmountBefore + Number(amount));
    const statusAfter = calculateStatus(totalAmount, paidAmountAfter);

    await conn.query(
      'UPDATE invoices SET status = ? WHERE invoice_id = ?',
      [statusAfter, invoiceId]
    );

    const loyaltyPointsAdded = await grantLoyaltyPointsIfEligible(
      conn,
      invoice,
      statusBefore,
      statusAfter
    );

    await conn.commit();

    return {
      statusCode: 201,
      body: {
        message: 'Payment recorded successfully',
        payment_id: paymentId,
        status: statusAfter,
        remaining_balance: round2(Math.max(0, totalAmount - paidAmountAfter)),
        loyalty_points_added: loyaltyPointsAdded
      },
      email: invoice.email,
      emailContext: {
        amount: round2(amount),
        statusAfter,
        remaining: round2(Math.max(0, totalAmount - paidAmountAfter)),
        loyaltyPointsAdded
      }
    };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

const sendPaymentEmails = async ({ email, invoiceId, emailContext }) => {
  if (!email) return;

  await sendEmail(
    email,
    'Payment Received 💳',
    `Your payment of Rs. ${round2(emailContext.amount).toFixed(2)} has been received for Invoice #${invoiceId}.\nRemaining balance: Rs. ${round2(emailContext.remaining).toFixed(2)}\nStatus: ${emailContext.statusAfter}`
  );

  if (emailContext.statusAfter === 'PAID') {
    let loyaltyLine = '';
    if (emailContext.loyaltyPointsAdded > 0) {
      loyaltyLine = `\nLoyalty points added: ${emailContext.loyaltyPointsAdded}`;
    }

    await sendEmail(
      email,
      'Invoice Fully Paid 🎉',
      `Invoice #${invoiceId} is now fully paid. Thank you!${loyaltyLine}`
    );
  }
};

// ADD PAYMENT (Receptionist/Admin)
exports.addPayment = async (req, res) => {
  const invoiceId = Number(req.params.invoice_id);
  const amount = Number(req.body?.amount);
  const paymentMethod = String(req.body?.payment_method || '').trim().toUpperCase();

  if (!Number.isInteger(invoiceId) || invoiceId <= 0) {
    return res.status(400).json({ message: 'Invalid invoice id' });
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ message: 'Invalid payment amount' });
  }

  if (!['CASH', 'CARD', 'ONLINE'].includes(paymentMethod)) {
    return res.status(400).json({ message: 'Invalid payment method' });
  }

  try {
    const role = await getRoleName(req.user.user_id);
    if (!['RECEPTIONIST', 'ADMIN'].includes(role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const result = await processPayment({
      invoiceId,
      amount,
      paymentMethod
    });

    if (result.statusCode !== 201) {
      return res.status(result.statusCode).json(result.body);
    }

    await sendPaymentEmails({
      email: result.email,
      invoiceId,
      emailContext: result.emailContext
    });

    return res.status(201).json(result.body);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// PAYHERE INIT
exports.payhereInit = async (req, res) => {
  const invoiceId = Number(req.params.invoice_id);

  if (!Number.isInteger(invoiceId) || invoiceId <= 0) {
    return res.status(400).json({ message: 'Invalid invoice id' });
  }

  try {
    const role = await getRoleName(req.user.user_id);
    if (role !== 'CLIENT') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const [clients] = await db.query(
      'SELECT client_id FROM clients WHERE user_id = ?',
      [req.user.user_id]
    );

    if (!clients.length) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const clientId = clients[0].client_id;

    const [invoices] = await db.query(
      `SELECT i.invoice_id, i.client_id, i.total_amount, i.status, u.email
       FROM invoices i
       JOIN clients c ON c.client_id = i.client_id
       LEFT JOIN users u ON u.user_id = c.user_id
       WHERE i.invoice_id = ?`,
      [invoiceId]
    );

    if (!invoices.length) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const invoice = invoices[0];
    if (Number(invoice.client_id) !== Number(clientId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (invoice.status === 'PAID') {
      return res.status(400).json({ message: 'Invoice already paid' });
    }

    const [paymentRows] = await db.query(
      'SELECT COALESCE(SUM(amount), 0) AS paid FROM payments WHERE invoice_id = ?',
      [invoiceId]
    );

    const paid = Number(paymentRows[0]?.paid || 0);
    const amount = round2(Math.max(0, Number(invoice.total_amount) - paid));

    if (amount <= EPSILON) {
      return res.status(400).json({ message: 'Invoice already paid' });
    }

    const merchantId = process.env.PAYHERE_MERCHANT_ID;
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;

    if (!merchantId || !merchantSecret) {
      return res.status(500).json({ message: 'PayHere configuration missing' });
    }

    const currency = 'LKR';
    const amountString = amount.toFixed(2);

    const hash = crypto
      .createHash('md5')
      .update(
        `${merchantId}${invoiceId}${amountString}${currency}${crypto
          .createHash('md5')
          .update(merchantSecret)
          .digest('hex')
          .toUpperCase()}`
      )
      .digest('hex')
      .toUpperCase();

    return res.json({
      merchant_id: merchantId,
      order_id: String(invoiceId),
      amount: amountString,
      currency,
      hash,
      return_url: process.env.PAYHERE_RETURN_URL || 'http://localhost:5173/payments/success',
      cancel_url: process.env.PAYHERE_CANCEL_URL || 'http://localhost:5173/payments/cancel',
      notify_url:
        process.env.PAYHERE_NOTIFY_URL ||
        'http://localhost:8000/api/payments/payhere/notify',
      email: invoice.email || null,
      items: `PetPaws Invoice #${invoiceId}`
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// PAYHERE NOTIFY
exports.payhereNotify = async (req, res) => {
  try {
    const orderId = Number(req.body?.order_id);
    const statusCode = String(req.body?.status_code || '');
    const payhereAmount = Number(req.body?.payhere_amount);
    const payhereCurrency = String(req.body?.payhere_currency || 'LKR');
    const receivedMd5sig = String(req.body?.md5sig || '').toUpperCase();
    const payherePaymentId = req.body?.payment_id ? String(req.body.payment_id) : null;

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).send('Invalid order id');
    }

    const merchantId = process.env.PAYHERE_MERCHANT_ID;
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
    if (!merchantId || !merchantSecret) {
      return res.status(500).send('Config error');
    }

    const amountString = Number.isFinite(payhereAmount) ? payhereAmount.toFixed(2) : '0.00';

    const localMd5sig = crypto
      .createHash('md5')
      .update(
        `${merchantId}${orderId}${amountString}${payhereCurrency}${statusCode}${crypto
          .createHash('md5')
          .update(merchantSecret)
          .digest('hex')
          .toUpperCase()}`
      )
      .digest('hex')
      .toUpperCase();

    if (!receivedMd5sig || localMd5sig !== receivedMd5sig) {
      return res.status(400).send('Invalid hash');
    }

    if (statusCode !== '2') {
      return res.status(200).send('Ignored');
    }

    if (!Number.isFinite(payhereAmount) || payhereAmount <= 0) {
      return res.status(400).send('Invalid payment amount');
    }

    const result = await processPayment({
      invoiceId: orderId,
      amount: payhereAmount,
      paymentMethod: 'ONLINE',
      payherePaymentId,
      md5sig: receivedMd5sig,
      allowAlreadyPaid: true
    });

    if (result.statusCode === 201) {
      await sendPaymentEmails({
        email: result.email,
        invoiceId: orderId,
        emailContext: result.emailContext
      });
      return res.status(200).send('OK');
    }

    if (result.body?.message === 'Invoice already paid') {
      return res.status(200).send('Already processed');
    }

    return res.status(result.statusCode).send(result.body?.message || 'Error');
  } catch (error) {
    console.error(error);
    return res.status(500).send('Error');
  }
};
