const crypto = require('crypto');
const db = require('../config/db');
const { sendEmail } = require('../utils/emailService');
const templates = require('../utils/emailTemplates');
const dayjs = require('dayjs');
const { getRoleName } = require('../utils/authHelpers');

const EPSILON = 0.0001;
const LOYALTY_EARN_PER_LKR = Number(process.env.LOYALTY_EARN_RATE_LKR || 100);

const round2 = (value) => Number(Number(value || 0).toFixed(2));

/**
 * Retrieves the invoice inside a transaction with an exclusive lock.
 */
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

/**
 * Sums all existing payments for an invoice.
 */
const getCurrentPaidAmount = async (conn, invoiceId) => {
  const [rows] = await conn.query(
    'SELECT COALESCE(SUM(amount), 0) AS paid FROM payments WHERE invoice_id = ?',
    [invoiceId]
  );

  return Number(rows[0]?.paid || 0);
};

/**
 * Determines the invoice status based on the total vs paid amount delta.
 */
const calculateStatus = (totalAmount, paidAmount) => {
  if (paidAmount <= EPSILON) return 'UNPAID';
  if (paidAmount + EPSILON < totalAmount) return 'PARTIAL';
  return 'PAID';
};

/**
 * Persists a new payment record.
 */
const insertPaymentRow = async (
  conn,
  { invoiceId, amount, paymentMethod, payherePaymentId, md5sig }
) => {
  const [result] = await conn.query(
    `INSERT INTO payments (invoice_id, amount, payment_method, payment_date, transaction_id, md5sig)
     VALUES (?, ?, ?, NOW(), ?, ?)`,
    [invoiceId, amount, paymentMethod, payherePaymentId, md5sig]
  );

  return result.insertId;
};

/**
 * Awards loyalty points to a client once their invoice transitions fully to PAID.
 */
const grantLoyaltyPointsIfEligible = async (conn, invoice, statusBefore, statusAfter) => {
  if (statusBefore === 'PAID' || statusAfter !== 'PAID') {
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

/**
 * Handles the core business logic of applying a payment against an invoice securely.
 */
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

/**
 * Triggers payment confirmation emails asynchronously.
 */
const sendPaymentEmails = async ({ email, invoiceId, emailContext }) => {
  if (!email) return;

  try {
    const [userRows] = await db.query(
      `SELECT up.first_name 
       FROM users u
       LEFT JOIN user_profiles up ON up.user_id = u.user_id
       WHERE u.email = ?`,
      [email]
    );

    const clientName = userRows[0]?.first_name || "there";
    const dateStr = dayjs().format('YYYY-MM-DD');

    const received = templates.getPaymentReceived(
      clientName,
      round2(emailContext.amount).toFixed(2),
      dateStr,
      `INV-${invoiceId}`
    );
    await sendEmail(email, received.subject, received.text);

    if (emailContext.statusAfter === 'PAID') {
      const completed = templates.getPaymentCompleted(clientName);
      await sendEmail(email, completed.subject, completed.text);
    }
  } catch (err) {
    console.error("Payment emails failed:", err.message);
  }
};

/**
 * Manual payment entry endpoint for administrative staff.
 */
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
