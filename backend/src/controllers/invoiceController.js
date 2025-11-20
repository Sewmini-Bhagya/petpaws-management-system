const db = require('../config/db');
const { sendEmail } = require('../utils/emailService');
const templates = require('../utils/emailTemplates');
const dayjs = require('dayjs');
const { getRoleName } = require('../utils/authHelpers');

const POINT_VALUE_LKR = Number(process.env.LOYALTY_POINT_VALUE_LKR || 1);

const round2 = (value) => Number(Number(value || 0).toFixed(2));

const toPositiveNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
};

/**
 * Retrieves billable items for an appointment, prioritizing actually performed services over planned ones.
 */
const getInvoiceItemsFromAppointment = async (appointmentId, conn) => {
  const [performedServices] = await conn.query(
    `SELECT s.service_id, s.service_name, s.price
     FROM appointment_performed_services aps
     JOIN services s ON aps.service_id = s.service_id
     WHERE aps.appointment_id = ?`,
    [appointmentId]
  );

  if (performedServices.length > 0) {
    return performedServices;
  }

  const [plannedServices] = await conn.query(
    `SELECT s.service_id, s.service_name, s.price
     FROM appointment_services aps
     JOIN services s ON aps.service_id = s.service_id
     WHERE aps.appointment_id = ?`,
    [appointmentId]
  );

  return plannedServices;
};

/**
 * Calculates discount amounts and normalizes discount types for invoice generation.
 */
const applyDiscounts = ({ subtotal, discount_type, discount_value }) => {
  if (!discount_type && (discount_value === undefined || discount_value === null)) {
    return { discountAmount: 0, normalizedDiscountType: null };
  }

  const normalizedType = String(discount_type || '').trim().toUpperCase();
  const amount = toPositiveNumber(discount_value);

  if (!['FLAT', 'PERCENTAGE'].includes(normalizedType) || amount === null) {
    return { error: 'Invalid discount configuration' };
  }

  let discountAmount = 0;

  if (normalizedType === 'FLAT') {
    discountAmount = amount;
  } else {
    if (amount > 100) {
      return { error: 'Percentage discount cannot exceed 100' };
    }
    discountAmount = (subtotal * amount) / 100;
  }

  return {
    discountAmount: Math.min(round2(discountAmount), subtotal),
    normalizedDiscountType: normalizedType
  };
};

/**
 * Aggregates all data required to render a complete invoice (items, payments, client info).
 */
const getInvoicePayload = async (invoiceId) => {
  const [invoices] = await db.query(
    `SELECT i.invoice_id, i.client_id, i.appointment_id, i.total_amount, i.status,
            i.created_at,
            u.email
     FROM invoices i
     JOIN clients c ON c.client_id = i.client_id
     LEFT JOIN users u ON u.user_id = c.user_id
     WHERE i.invoice_id = ?`,
    [invoiceId]
  );

  if (invoices.length === 0) {
    return null;
  }

  const invoice = invoices[0];

  const [services] = await db.query(
    `SELECT service_id, description, amount
     FROM invoice_items
     WHERE invoice_id = ?`,
    [invoiceId]
  );

  const [payments] = await db.query(
    `SELECT payment_id, payment_method, amount, payment_date
     FROM payments
     WHERE invoice_id = ?
     ORDER BY payment_date ASC, payment_id ASC`,
    [invoiceId]
  );

  const paid = round2(
    payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0)
  );

  return {
    invoice,
    client: {
      client_id: invoice.client_id,
      email: invoice.email || null
    },
    services,
    payments,
    summary: {
      total: round2(invoice.total_amount),
      paid,
      remaining: round2(Math.max(0, Number(invoice.total_amount) - paid)),
      status: invoice.status
    }
  };
};

/**
 * Generates an invoice for an appointment, applying discounts and loyalty points if requested.
 */
exports.generateInvoice = async (req, res) => {
  const { appointment_id } = req.params;
  const { discount_type, discount_value, use_loyalty_points } = req.body || {};

  const appointmentId = Number(appointment_id);
  if (!Number.isInteger(appointmentId) || appointmentId <= 0) {
    return res.status(400).json({ message: 'Invalid appointment id' });
  }

  const conn = await db.getConnection();

  try {
    const role = await getRoleName(req.user.user_id, conn);
    if (!['RECEPTIONIST', 'ADMIN'].includes(role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await conn.beginTransaction();

    const [appointments] = await conn.query(
      'SELECT appointment_id, client_id FROM appointments WHERE appointment_id = ?',
      [appointmentId]
    );

    if (appointments.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const [existingInvoices] = await conn.query(
      'SELECT invoice_id FROM invoices WHERE appointment_id = ? LIMIT 1',
      [appointmentId]
    );

    if (existingInvoices.length > 0) {
      await conn.rollback();
      return res.status(400).json({
        message: 'Invoice already exists for this appointment',
        invoice_id: existingInvoices[0].invoice_id
      });
    }

    const services = await getInvoiceItemsFromAppointment(appointmentId, conn);

    const [prescriptions] = await conn.query(
      `SELECT medication_name, quantity, unit_price, inventory_item_id
       FROM prescriptions
       WHERE appointment_id = ?`,
      [appointmentId]
    );

    const subtotal = round2(
      services.reduce((sum, s) => sum + Number(s.price || 0), 0) +
      prescriptions.reduce((sum, p) => sum + (Number(p.unit_price || 0) * Number(p.quantity || 0)), 0)
    );

    const discountResult = applyDiscounts({ subtotal, discount_type, discount_value });
    if (discountResult.error) {
      await conn.rollback();
      return res.status(400).json({ message: discountResult.error });
    }

    let totalAfterDiscount = round2(subtotal - discountResult.discountAmount);
    let loyaltyPointsUsed = 0;
    let loyaltyDiscount = 0;

    // Process loyalty point redemption dynamically locking the client row to prevent race conditions
    if (Boolean(use_loyalty_points)) {
      const [clientRows] = await conn.query(
        'SELECT loyalty_points FROM clients WHERE client_id = ? FOR UPDATE',
        [appointments[0].client_id]
      );

      const currentPoints = Number(clientRows[0]?.loyalty_points || 0);
      const maxPointsUsable = Math.floor(totalAfterDiscount / POINT_VALUE_LKR);
      loyaltyPointsUsed = Math.max(0, Math.min(currentPoints, maxPointsUsable));
      loyaltyDiscount = round2(loyaltyPointsUsed * POINT_VALUE_LKR);
      totalAfterDiscount = round2(totalAfterDiscount - loyaltyDiscount);

      if (loyaltyPointsUsed > 0) {
        await conn.query(
          'UPDATE clients SET loyalty_points = loyalty_points - ? WHERE client_id = ?',
          [loyaltyPointsUsed, appointments[0].client_id]
        );
      }
    }

    const [invoiceResult] = await conn.query(
      `INSERT INTO invoices (client_id, appointment_id, total_amount, status, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [appointments[0].client_id, appointmentId, totalAfterDiscount, 'UNPAID']
    );

    const invoiceId = invoiceResult.insertId;

    const invoiceItems = [
      ...services.map((s) => [
        invoiceId,
        s.service_id,
        s.service_name,
        round2(s.price)
      ]),
      ...prescriptions.map((p) => [
        invoiceId,
        null,
        `${p.medication_name} (x${p.quantity})`,
        round2(p.unit_price * p.quantity)
      ])
    ];

    await conn.query(
      `INSERT INTO invoice_items (invoice_id, service_id, description, amount)
       VALUES ?`,
      [invoiceItems]
    );

    await conn.commit();

    try {
      const [userRows] = await db.query(
        `SELECT u.email, up.first_name 
         FROM users u
         JOIN clients c ON c.user_id = u.user_id
         LEFT JOIN user_profiles up ON up.user_id = u.user_id
         WHERE c.client_id = ?`,
        [appointments[0].client_id]
      );

      if (userRows.length > 0) {
        const client = userRows[0];
        const dueDate = dayjs().add(7, 'day').format('YYYY-MM-DD'); 
        const { subject, text } = templates.getInvoiceEmail(
          client.first_name || "there",
          invoiceId,
          totalAfterDiscount,
          dueDate,
          appointmentId
        );
        await sendEmail(client.email, subject, text);
      }
    } catch (emailErr) {
      console.error("Invoice email failed:", emailErr.message);
    }

    return res.status(201).json({
      message: 'Invoice generated successfully',
      invoice_id: invoiceId,
      breakdown: {
        subtotal,
        discount_amount: round2(discountResult.discountAmount),
        loyalty_discount: loyaltyDiscount,
        total_amount: totalAfterDiscount,
        loyalty_points_used: loyaltyPointsUsed,
        discount_type: discountResult.normalizedDiscountType
      },
      status: 'UNPAID'
    });
  } catch (error) {
    await conn.rollback();
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  } finally {
    conn.release();
  }
};

/**
 * Retrieves JSON payload for an existing invoice.
 */
exports.getInvoice = async (req, res) => {
  const invoiceId = Number(req.params.invoice_id);
  if (!Number.isInteger(invoiceId) || invoiceId <= 0) {
    return res.status(400).json({ message: 'Invalid invoice id' });
  }

  try {
    const payload = await getInvoicePayload(invoiceId);
    if (!payload) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    return res.json(payload);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Retrieves a printable version of an invoice payload.
 */
exports.getPrintableInvoice = async (req, res) => {
  const invoiceId = Number(req.params.invoice_id);
  if (!Number.isInteger(invoiceId) || invoiceId <= 0) {
    return res.status(400).json({ message: 'Invalid invoice id' });
  }

  try {
    const payload = await getInvoicePayload(invoiceId);
    if (!payload) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    return res.json({
      printable: true,
      generated_at: new Date().toISOString(),
      ...payload
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Facilitates point-of-sale transactions for walk-in customers buying inventory items directly.
 */
exports.generateWalkInInvoice = async (req, res) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "No items provided" });
  }

  const WALKIN_CLIENT_ID = Number(process.env.WALKIN_CLIENT_ID);
  
  if (!WALKIN_CLIENT_ID) {
    return res.status(500).json({ message: "Walk-in client ID not configured" });
  }

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    let total = 0;
    const invoiceItems = [];

    for (const item of items) {
      const { inventory_item_id, quantity, price } = item;

      if (!inventory_item_id || !quantity || !price) {
        throw new Error("Invalid item data");
      }

      const [stockRows] = await conn.query(
        `SELECT quantity_available FROM inventory_stock WHERE inventory_item_id = ? FOR UPDATE`,
        [inventory_item_id]
      );

      if (!stockRows.length || stockRows[0].quantity_available < quantity) {
        throw new Error("Insufficient stock");
      }

      await conn.query(
        `UPDATE inventory_stock
         SET quantity_available = quantity_available - ?
         WHERE inventory_item_id = ?`,
        [quantity, inventory_item_id]
      );

      await conn.query(
        `INSERT INTO inventory_transactions
        (inventory_item_id, user_id, transaction_type, quantity, created_at, remarks)
        VALUES (?, ?, 'SALE', ?, NOW(), 'Walk-in sale')`,
        [inventory_item_id, req.user.user_id, quantity]
      );

      const amount = quantity * price;
      total += amount;

      invoiceItems.push([
        inventory_item_id,
        quantity,
        amount
      ]);
    }

    const [invoiceResult] = await conn.query(
      `INSERT INTO invoices (client_id, total_amount, status, created_at)
       VALUES (?, ?, 'UNPAID', NOW())`,
      [WALKIN_CLIENT_ID, total]
    );

    const invoiceId = invoiceResult.insertId;

    const formattedItems = invoiceItems.map(i => [
      invoiceId,
      null,
      `Product sale`,
      i[2],
      i[0]
    ]);

    await conn.query(
      `INSERT INTO invoice_items (invoice_id, service_id, description, amount, inventory_item_id)
       VALUES ?`,
      [formattedItems]
    );

    await conn.commit();

    res.status(201).json({
      message: "Walk-in invoice created",
      invoice_id: invoiceId,
      total
    });

  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ message: err.message });
  } finally {
    conn.release();
  }
};