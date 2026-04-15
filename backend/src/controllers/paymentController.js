const db = require('../config/db');


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

    // CHECK INVOICE
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

    // SUM OF EXISTING PAYMENTS
    const [payments] = await db.promise().query(
      'SELECT SUM(amount) AS paid FROM payments WHERE invoice_id = ?',
      [invoice_id]
    );

    const paid_amount = parseFloat(payments[0].paid) || 0;

    const remaining = total_amount - paid_amount;

    // PREVENT OVERPAYMENT
    if (amount > remaining) {
      return res.status(400).json({
        message: `Payment exceeds remaining balance (${remaining})`
      });
    }

    // INSERT PAYMENT
    await db.promise().query(
      `INSERT INTO payments (invoice_id, payment_method, payment_date, amount)
       VALUES (?, ?, NOW(), ?)`,
      [invoice_id, payment_method, amount]
    );

    res.status(201).json({
      message: 'Payment recorded successfully',
      remaining_balance: (remaining - amount).toFixed(2)
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Server error'
    });
  }
};