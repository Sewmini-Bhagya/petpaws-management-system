const db = require('../config/db');
const { sendEmail } = require('../utils/emailService');


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