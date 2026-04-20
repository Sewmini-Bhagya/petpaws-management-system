const db = require('../config/db');

const POINT_VALUE_LKR = Number(process.env.LOYALTY_POINT_VALUE_LKR || 1);
const schemaCache = new Map();

const round2 = (value) => Number(Number(value || 0).toFixed(2));

const toPositiveNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
};

const getTableColumns = async (tableName, conn = db) => {
  if (schemaCache.has(tableName)) {
    return schemaCache.get(tableName);
  }

  const [rows] = await conn.query(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
    [process.env.DB_NAME, tableName]
  );

  const columns = new Set(rows.map((row) => row.COLUMN_NAME));
  schemaCache.set(tableName, columns);
  return columns;
};

const getRoleName = async (userId, conn = db) => {
  const [rows] = await conn.query(
    `SELECT r.role_name
     FROM users u
     JOIN roles r ON u.role_id = r.role_id
     WHERE u.user_id = ?`,
    [userId]
  );

  return rows.length ? rows[0].role_name : null;
};

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

const getInvoicePayload = async (invoiceId) => {
  const invoiceColumns = await getTableColumns('invoices');
  const dateColumn = invoiceColumns.has('created_at')
    ? 'i.created_at'
    : invoiceColumns.has('invoice_date')
      ? 'i.invoice_date'
      : 'NOW()';

  const [invoices] = await db.query(
    `SELECT i.invoice_id, i.client_id, i.appointment_id, i.total_amount, i.status,
            ${dateColumn} AS created_at,
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

// GENERATE INVOICE
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
    if (services.length === 0) {
      await conn.rollback();
      return res.status(400).json({ message: 'No services found to generate invoice' });
    }

    const subtotal = round2(
      services.reduce((sum, service) => sum + Number(service.price || 0), 0)
    );

    const discountResult = applyDiscounts({ subtotal, discount_type, discount_value });
    if (discountResult.error) {
      await conn.rollback();
      return res.status(400).json({ message: discountResult.error });
    }

    let totalAfterDiscount = round2(subtotal - discountResult.discountAmount);
    let loyaltyPointsUsed = 0;
    let loyaltyDiscount = 0;

    const clientColumns = await getTableColumns('clients', conn);
    if (Boolean(use_loyalty_points) && clientColumns.has('loyalty_points')) {
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

    const invoiceColumns = await getTableColumns('invoices', conn);
    const insertColumns = ['client_id', 'appointment_id', 'total_amount', 'status'];
    const insertValues = [appointments[0].client_id, appointmentId, totalAfterDiscount, 'UNPAID'];

    if (invoiceColumns.has('created_at')) {
      insertColumns.push('created_at');
      insertValues.push(new Date());
    } else if (invoiceColumns.has('invoice_date')) {
      insertColumns.push('invoice_date');
      insertValues.push(new Date());
    }

    const placeholders = insertColumns.map(() => '?').join(', ');
    const [invoiceResult] = await conn.query(
      `INSERT INTO invoices (${insertColumns.join(', ')}) VALUES (${placeholders})`,
      insertValues
    );

    const invoiceId = invoiceResult.insertId;

    const invoiceItems = services.map((service) => [
      invoiceId,
      service.service_id,
      service.service_name,
      round2(service.price)
    ]);

    await conn.query(
      `INSERT INTO invoice_items (invoice_id, service_id, description, amount)
       VALUES ?`,
      [invoiceItems]
    );

    await conn.commit();

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

// GET INVOICE DETAILS
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

// GET PRINTABLE INVOICE
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