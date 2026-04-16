const db = require('../config/db');
const { sendEmail } = require('../utils/emailService');
const crypto = require('crypto');


// ADD PAYMENT
exports.addPayment = async (req, res) => {
  const { invoice_id } = req.params;
  const { amount, payment_method } = req.body;

  try {
    // VALIDATION
    if (!amount || amount <= 0) {
      return res.status(400).json({
        message: 'Invalid payment amount'
      });
    }

    // GET INVOICE
    const [invoices] = await db.promise().query(
      'SELECT total_amount FROM invoices WHERE invoice_id = ?',
      [invoice_id]
    );

    if (invoices.length === 0) {
      return res.status(404).json({
        message: 'Invoice not found'
      });
    }

    const total_amount = parseFloat(invoices[0].total_amount);

    // GET EXISTING PAYMENTS
    const [payments] = await db.promise().query(
      'SELECT SUM(amount) AS paid FROM payments WHERE invoice_id = ?',
      [invoice_id]
    );

    const paid_amount = parseFloat(payments[0].paid) || 0;

    const remaining = total_amount - paid_amount;

    // PREVENT OVERPAYMENT
    if (amount > remaining) {
      return res.status(400).json({
        message: `Payment exceeds remaining balance (${remaining.toFixed(2)})`
      });
    }

    // INSERT PAYMENT
    await db.promise().query(
      `INSERT INTO payments (invoice_id, payment_method, payment_date, amount)
       VALUES (?, ?, NOW(), ?)`,
      [invoice_id, payment_method, amount]
    );

    const newPaid = paid_amount + parseFloat(amount);

    // DETERMINE STATUS
    let status = 'UNPAID';

    if (newPaid === 0) {
      status = 'UNPAID';
    } else if (newPaid < total_amount) {
      status = 'PARTIAL';
    } else {
      status = 'PAID';
    }


    // UPDATE INVOICE STATUS
    await db.promise().query(
      'UPDATE invoices SET status = ? WHERE invoice_id = ?',
      [status, invoice_id]
    );

    // GET USER EMAIL
    const [users] = await db.promise().query(
      `SELECT u.email
      FROM users u
      JOIN clients c ON u.user_id = c.user_id
      JOIN invoices i ON c.client_id = i.client_id
      WHERE i.invoice_id = ?`,
      [invoice_id]
    );

    const userEmail = users[0].email;

    // SEND EMAIL 
    if (status === 'PAID') {
      await sendEmail(
        userEmail,
        'Invoice Fully Paid 🎉',
        `Your invoice of Rs. ${amount} has been fully paid. Thank you!`
      );
    } else {
      await sendEmail(
        userEmail,
        'Payment Received 💳',
        `Your payment of Rs. ${amount} has been received.\nRemaining balance: Rs. ${(total_amount - newPaid).toFixed(2)}\nStatus: ${status}`
      );
    }

    // SINGLE RESPONSE
    res.status(201).json({
      message: 'Payment recorded successfully',
      remaining_balance: (total_amount - newPaid).toFixed(2),
      status
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Server error'
    });
  }
};


// PAYHERE INIT

exports.payhereInit = async (req, res) => {
  const { invoice_id } = req.params;

  try {
    // GET INVOICE
    const [invoices] = await db.promise().query(
      `SELECT i.invoice_id, i.total_amount, u.email
       FROM invoices i
       JOIN clients c ON i.client_id = c.client_id
       JOIN users u ON c.user_id = u.user_id
       WHERE i.invoice_id = ?`,
      [invoice_id]
    );

    if (invoices.length === 0) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const invoice = invoices[0];

    const amount = parseFloat(invoice.total_amount).toFixed(2);
    const currency = 'LKR';

    // TEMP VALUES (sandbox)
    const merchant_id = "1231221";
    const merchant_secret = "abc123xyz456";

    // GENERATE HASH
    const hash = crypto
      .createHash('md5')
      .update(
        merchant_id +
        invoice_id +
        amount +
        currency +
        crypto.createHash('md5').update(merchant_secret).digest('hex')
      )
      .digest('hex')
      .toUpperCase();

    // SEND RESPONSE
    res.json({
      merchant_id,
      return_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
      notify_url: "http://localhost:8000/api/payments/payhere/notify",

      order_id: invoice_id,
      items: `Invoice #${invoice_id}`,
      amount,
      currency,
      hash,

      email: invoice.email
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


// PAYHERE NOTIFY

exports.payhereNotify = async (req, res) => {
  const { order_id, status_code, payhere_amount } = req.body;

  try {
    const invoice_id = parseInt(order_id);

    // Check invoice
    const [invoices] = await db.promise().query(
      `SELECT i.invoice_id, i.total_amount, i.status, u.email
       FROM invoices i
       JOIN clients c ON i.client_id = c.client_id
       JOIN users u ON c.user_id = u.user_id
       WHERE i.invoice_id = ?`,
      [invoice_id]
    );

    if (invoices.length === 0) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const invoice = invoices[0];

    // Only process successful payments
    if (status_code == 2) {

      // Check if already paid
      if (invoices[0].status === 'PAID') {
        return res.status(200).send('Already processed');
      }

      const amount = parseFloat(payhere_amount);

      // Insert payment
      await db.promise().query(
        `INSERT INTO payments (invoice_id, payment_method, payment_date, amount)
         VALUES (?, 'PAYHERE', NOW(), ?)`,
        [invoice_id, amount]
      );

      // Update invoice status
      await db.promise().query(
        'UPDATE invoices SET status = ? WHERE invoice_id = ?',
        ['PAID', invoice_id]
      );

      // SEND EMAIL
      await sendEmail(
        invoice.email,
        'Payment Successful 💳',
        `Your payment of Rs. ${amount.toFixed(2)} has been received.\n\nInvoice #${invoice_id} is now PAID.`
      );
    }

    res.status(200).send('OK');

  } catch (error) {
    console.error(error);
    res.status(500).send('Error');
  }
};