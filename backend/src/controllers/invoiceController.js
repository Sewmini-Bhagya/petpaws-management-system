const db = require('../config/db');
const { sendEmail } = require('../utils/emailService');


// GENERATE INVOICE
exports.generateInvoice = async (req, res) => {
  const { appointment_id } = req.params;

  try {
    // CHECK APPOINTMENT EXISTS
    const [appointments] = await db.promise().query(
      'SELECT client_id FROM appointments WHERE appointment_id = ?',
      [appointment_id]
    );

    if (appointments.length === 0) {
      return res.status(404).json({
        message: 'Appointment not found'
      });
    }

    const client_id = appointments[0].client_id;

    // GET PERFORMED SERVICES
    const [services] = await db.promise().query(
      `SELECT s.service_id, s.service_name, s.price
       FROM appointment_performed_services aps
       JOIN services s ON aps.service_id = s.service_id
       WHERE aps.appointment_id = ?`,
      [appointment_id]
    );

    if (services.length === 0) {
      return res.status(400).json({
        message: 'No performed services to generate invoice'
      });
    }

    // CALCULATE TOTAL
    const total_amount = services.reduce(
      (sum, service) => sum + parseFloat(service.price),
      0
    );

    const formattedTotal = total_amount.toFixed(2);

    // CREATE INVOICE
    const [invoiceResult] = await db.promise().query(
      `INSERT INTO invoices 
       (client_id, appointment_id, invoice_date, total_amount)
       VALUES (?, ?, NOW(), ?)`,
      [client_id, appointment_id, total_amount]
    );

    const invoice_id = invoiceResult.insertId;

    // INSERT INVOICE ITEMS
    const invoiceItems = services.map(service => [
      invoice_id,
      service.service_id,
      service.service_name,
      service.price
    ]);

    await db.promise().query(
      `INSERT INTO invoice_items (invoice_id, service_id, description, amount)
       VALUES ?`,
      [invoiceItems]
    );

    // GET USER EMAIL
    const [users] = await db.promise().query(
      `SELECT u.email
      FROM users u
      JOIN clients c ON u.user_id = c.user_id
      WHERE c.client_id = ?`,
      [client_id]
    );

    const userEmail = users[0].email;

    // SEND EMAIL
    await sendEmail(
      userEmail,
      'Your Invoice 🧾',
      `Your invoice has been generated.\nTotal: Rs. ${total_amount}`
    );

    res.status(201).json({
      message: 'Invoice generated successfully',
      invoice_id,
      total_amount: formattedTotal
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Server error'
    });
  }
};


// GET INVOICE DETAILS
exports.getInvoice = async (req, res) => {
  const { invoice_id } = req.params;

  try {
    // GET INVOICE
    const [invoices] = await db.promise().query(
      `SELECT invoice_id, client_id, appointment_id, invoice_date, total_amount, status
       FROM invoices
       WHERE invoice_id = ?`,
      [invoice_id]
    );

    if (invoices.length === 0) {
      return res.status(404).json({
        message: 'Invoice not found'
      });
    }

    const invoice = invoices[0];

    // GET ITEMS
    const [items] = await db.promise().query(
      `SELECT service_id, description, amount
       FROM invoice_items
       WHERE invoice_id = ?`,
      [invoice_id]
    );

    // GET PAYMENTS
    const [payments] = await db.promise().query(
      `SELECT payment_method, amount, payment_date
       FROM payments
       WHERE invoice_id = ?`,
      [invoice_id]
    );

    // CALCULATE PAID
    const paid = payments.reduce(
      (sum, p) => sum + parseFloat(p.amount),
      0
    );

    const remaining = (parseFloat(invoice.total_amount) - paid).toFixed(2);

    res.json({
      invoice,
      items,
      payments,
      summary: {
        total: parseFloat(invoice.total_amount).toFixed(2),
        paid: paid.toFixed(2),
        remaining
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Server error'
    });
  }
};