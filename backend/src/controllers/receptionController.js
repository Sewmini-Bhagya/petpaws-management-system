const db = require('../config/db');
const { sendEmail } = require('../utils/emailService');
const templates = require('../utils/emailTemplates');
const dayjs = require('dayjs');
const { upsertQueueForToday } = require('../services/queueService');

/**
 * Calculates the total expected duration of multiple services and returns the end time.
 */
const calculateEndTime = async (serviceIds, startAt, conn = db) => {
  if (!Array.isArray(serviceIds) || serviceIds.length === 0) {
    return null;
  }

  const placeholders = serviceIds.map(() => '?').join(',');
  const [services] = await conn.query(
    `SELECT service_id, duration_minutes
     FROM services
     WHERE service_id IN (${placeholders})`,
    serviceIds
  );

  if (services.length !== serviceIds.length) {
    return { error: 'Invalid service selection' };
  }

  const duration = services.reduce(
    (sum, service) => sum + Number(service.duration_minutes || 0),
    0
  );

  const startDate = new Date(startAt);
  const endDate = new Date(startDate.getTime() + Math.max(15, duration) * 60 * 1000);
  return { endAt: endDate, services };
};

/**
 * Checks if a given time slot conflicts with a pet's existing appointments.
 */
const hasPetOverlap = async ({ petId, appointmentStart, appointmentEnd, excludeAppointmentId }, conn = db) => {
  const params = [petId, appointmentEnd, appointmentStart];
  let query = `
    SELECT COUNT(*) AS count
    FROM appointments
    WHERE pet_id = ?
      AND appointment_start < ?
      AND appointment_end > ?
  `;

  if (excludeAppointmentId) {
    query += ' AND appointment_id <> ?';
    params.push(excludeAppointmentId);
  }

  const [rows] = await conn.query(query, params);
  return Number(rows[0]?.count || 0) > 0;
};

/**
 * Updates an appointment's status to CANCELLED.
 */
const setCancelledStatus = async (appointmentId, conn = db) => {
  await conn.query(
    'UPDATE appointments SET status = ?, status_id = 3 WHERE appointment_id = ?',
    ['CANCELLED', appointmentId]
  );
};

/**
 * Aggregates today's appointments and the current queue status for the reception dashboard.
 */
exports.getReceptionDashboard = async (_req, res) => {
  try {
    const [appointments] = await db.query(
      `SELECT 
        a.appointment_id,
        a.appointment_start,
        a.appointment_end,
        a.status,
        p.pet_name,
        CONCAT(COALESCE(up.first_name, ''), ' ', COALESCE(up.last_name, '')) AS client_name,
        GROUP_CONCAT(DISTINCT s.service_name ORDER BY s.service_name SEPARATOR ', ') AS services
      FROM appointments a
      JOIN pets p ON p.pet_id = a.pet_id
      JOIN clients c ON c.client_id = a.client_id
      LEFT JOIN user_profiles up ON up.user_id = c.user_id
      LEFT JOIN appointment_services aps ON aps.appointment_id = a.appointment_id
      LEFT JOIN services s ON s.service_id = aps.service_id
      WHERE DATE(a.appointment_start) = CURDATE()
      GROUP BY a.appointment_id
      ORDER BY a.appointment_start ASC;`
    );

    await upsertQueueForToday();
    
    const [queue] = await db.query(
      `SELECT q.appointment_id, q.queue_position, q.token_number, q.is_emergency,
              p.pet_name,
              CONCAT(COALESCE(up.first_name, ''), ' ', COALESCE(up.last_name, '')) AS client_name
       FROM appointment_queue q
       JOIN appointments a ON a.appointment_id = q.appointment_id
       JOIN pets p ON p.pet_id = a.pet_id
       JOIN clients c ON c.client_id = a.client_id
       LEFT JOIN user_profiles up ON up.user_id = c.user_id
       WHERE DATE(a.appointment_start) = CURDATE()
       ORDER BY q.is_emergency DESC, q.priority_level DESC, q.is_walkin DESC, q.queue_position ASC`
    );

    return res.json({
      today_appointments: appointments,
      queue
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Provides quick global search across clients and pets for reception workflows.
 */
exports.searchClientsAndPets = async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (!q) {
    return res.status(400).json({ message: 'Search query is required' });
  }

  try {
    const like = `%${q}%`;
    const [rows] = await db.query(
      `SELECT
          c.client_id,
          p.pet_id,
          p.pet_name,
          p.profile_picture,
          CONCAT(COALESCE(up.first_name, ''), ' ', COALESCE(up.last_name, '')) AS client_name,
          up.phone,
          u.email
       FROM clients c
       LEFT JOIN pets p ON p.client_id = c.client_id
       LEFT JOIN users u ON u.user_id = c.user_id
       LEFT JOIN user_profiles up ON up.user_id = c.user_id
       WHERE CONCAT(COALESCE(up.first_name, ''), ' ', COALESCE(up.last_name, '')) LIKE ?
          OR p.pet_name LIKE ?
          OR up.phone LIKE ?
       ORDER BY client_name ASC, p.pet_name ASC
       LIMIT 50`,
      [like, like, like]
    );

    return res.json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Retrieves an optionally date-filtered list of all appointments for receptionists.
 */
exports.getReceptionAppointments = async (req, res) => {
  try {
    const { date } = req.query;
    const params = [];
    let whereClause = '';

    if (date) {
      whereClause = 'WHERE DATE(a.appointment_start) = ?';
      params.push(date);
    }

    const [rows] = await db.query(
      `SELECT 
        a.appointment_id,
        a.client_id,
        a.pet_id,
        a.appointment_start,
        a.appointment_end,
        a.status,
        p.pet_name,
        CONCAT(COALESCE(up.first_name, ''), ' ', COALESCE(up.last_name, '')) AS client_name,
        u.email AS client_email,
        GROUP_CONCAT(DISTINCT s.service_name ORDER BY s.service_name SEPARATOR ', ') AS services
      FROM appointments a
      JOIN pets p ON p.pet_id = a.pet_id
      JOIN clients c ON c.client_id = a.client_id
      LEFT JOIN users u ON u.user_id = c.user_id
      LEFT JOIN user_profiles up ON up.user_id = c.user_id
      LEFT JOIN appointment_services aps ON aps.appointment_id = a.appointment_id
      LEFT JOIN services s ON s.service_id = aps.service_id
      ${whereClause}
      GROUP BY a.appointment_id
      ORDER BY a.appointment_start DESC;`,
      params
    );

    return res.json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Handles appointment creation by reception staff, bypassing standard client booking limits.
 * Employs transactions to ensure appointment/service/assignment records stay in sync.
 */
exports.createReceptionAppointment = async (req, res) => {
  const { pet_id, appointment_start, service_ids, vet_id } = req.body || {};

  if (!pet_id || !appointment_start || !Array.isArray(service_ids) || service_ids.length === 0) {
    return res.status(400).json({ message: 'pet_id, appointment_start, service_ids are required' });
  }

  const startDate = new Date(appointment_start);
  if (Number.isNaN(startDate.getTime())) {
    return res.status(400).json({ message: 'Invalid appointment_start' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [petRows] = await conn.query(
      'SELECT pet_id, client_id FROM pets WHERE pet_id = ? LIMIT 1',
      [pet_id]
    );
    if (petRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: 'Pet not found' });
    }

    const durationResult = await calculateEndTime(service_ids, appointment_start, conn);
    if (durationResult?.error) {
      await conn.rollback();
      return res.status(400).json({ message: durationResult.error });
    }

    const endDate = durationResult.endAt;
    const overlap = await hasPetOverlap({
      petId: pet_id,
      appointmentStart: startDate,
      appointmentEnd: endDate
    }, conn);

    if (overlap) {
      await conn.rollback();
      return res.status(400).json({ message: 'This pet already has an appointment in this time slot' });
    }

    const [insertResult] = await conn.query(
      `INSERT INTO appointments
       (client_id, pet_id, appointment_start, appointment_end, status, status_id, created_at)
       VALUES (?, ?, ?, ?, 'SCHEDULED', 1, NOW())`,
      [petRows[0].client_id, pet_id, startDate, endDate]
    );

    const appointmentId = insertResult.insertId;
    const serviceValues = service_ids.map((serviceId) => [appointmentId, serviceId]);
    await conn.query(
      'INSERT INTO appointment_services (appointment_id, service_id) VALUES ?',
      [serviceValues]
    );

    if (vet_id) {
      await conn.query(
        'INSERT INTO appointment_assignments (appointment_id, vet_id) VALUES (?, ?)',
        [appointmentId, vet_id]
      );
    }

    await conn.commit();

    const [clientRows] = await db.query(
      `SELECT u.email, up.first_name, p.pet_name
       FROM clients c
       LEFT JOIN users u ON u.user_id = c.user_id
       LEFT JOIN user_profiles up ON up.user_id = u.user_id
       JOIN pets p ON p.pet_id = ?
       WHERE c.client_id = ?`,
      [pet_id, petRows[0].client_id]
    );

    if (clientRows[0]?.email) {
      const ctx = clientRows[0];
      const { subject, text } = templates.getAppointmentConfirmed(
        ctx.first_name || "there",
        ctx.pet_name,
        dayjs(startDate).format('YYYY-MM-DD'),
        dayjs(startDate).format('hh:mm A'),
        "Assigned Vet"
      );
      await sendEmail(ctx.email, subject, text);
    }

    return res.status(201).json({
      message: 'Appointment created successfully',
      appointment_id: appointmentId
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
 * Updates an existing appointment, recalculating duration and verifying overlaps.
 */
exports.updateReceptionAppointment = async (req, res) => {
  const appointmentId = Number(req.params.id);
  const { appointment_start, service_ids, vet_id } = req.body || {};

  if (!Number.isInteger(appointmentId) || appointmentId <= 0) {
    return res.status(400).json({ message: 'Invalid appointment id' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [appointments] = await conn.query(
      'SELECT appointment_id, pet_id FROM appointments WHERE appointment_id = ? LIMIT 1',
      [appointmentId]
    );

    if (appointments.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const current = appointments[0];
    let newStart = appointment_start ? new Date(appointment_start) : null;

    if (newStart && Number.isNaN(newStart.getTime())) {
      await conn.rollback();
      return res.status(400).json({ message: 'Invalid appointment_start' });
    }

    const [existingServices] = await conn.query(
      'SELECT service_id FROM appointment_services WHERE appointment_id = ?',
      [appointmentId]
    );

    const serviceIdsToUse = Array.isArray(service_ids) && service_ids.length
      ? service_ids
      : existingServices.map((row) => row.service_id);

    if (!serviceIdsToUse.length) {
      await conn.rollback();
      return res.status(400).json({ message: 'At least one service is required' });
    }

    const [currentTimes] = await conn.query(
      'SELECT appointment_start FROM appointments WHERE appointment_id = ?',
      [appointmentId]
    );

    if (!newStart) {
      newStart = new Date(currentTimes[0].appointment_start);
    }

    const durationResult = await calculateEndTime(serviceIdsToUse, newStart, conn);
    if (durationResult?.error) {
      await conn.rollback();
      return res.status(400).json({ message: durationResult.error });
    }

    const newEnd = durationResult.endAt;
    const overlap = await hasPetOverlap({
      petId: current.pet_id,
      appointmentStart: newStart,
      appointmentEnd: newEnd,
      excludeAppointmentId: appointmentId
    }, conn);

    if (overlap) {
      await conn.rollback();
      return res.status(400).json({ message: 'This pet already has an appointment in this time slot' });
    }

    await conn.query(
      'UPDATE appointments SET appointment_start = ?, appointment_end = ? WHERE appointment_id = ?',
      [newStart, newEnd, appointmentId]
    );

    if (Array.isArray(service_ids) && service_ids.length) {
      await conn.query('DELETE FROM appointment_services WHERE appointment_id = ?', [appointmentId]);
      const values = service_ids.map((serviceId) => [appointmentId, serviceId]);
      await conn.query('INSERT INTO appointment_services (appointment_id, service_id) VALUES ?', [values]);
    }

    if (vet_id) {
      await conn.query('DELETE FROM appointment_assignments WHERE appointment_id = ?', [appointmentId]);
      await conn.query(
        'INSERT INTO appointment_assignments (appointment_id, vet_id) VALUES (?, ?)',
        [appointmentId, vet_id]
      );
    }

    await conn.commit();
    return res.json({ message: 'Appointment updated successfully' });
  } catch (error) {
    await conn.rollback();
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  } finally {
    conn.release();
  }
};

/**
 * Soft cancels an appointment and triggers a notification email.
 */
exports.cancelReceptionAppointment = async (req, res) => {
  const appointmentId = Number(req.params.id);
  if (!Number.isInteger(appointmentId) || appointmentId <= 0) {
    return res.status(400).json({ message: 'Invalid appointment id' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(
      `SELECT a.appointment_id, u.email
       FROM appointments a
       JOIN clients c ON c.client_id = a.client_id
       LEFT JOIN users u ON u.user_id = c.user_id
       WHERE a.appointment_id = ?`,
      [appointmentId]
    );

    if (rows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: 'Appointment not found' });
    }

    await setCancelledStatus(appointmentId, conn);
    await conn.commit();

    if (rows[0]?.email) {
      await sendEmail(
        rows[0].email,
        'Appointment Cancelled',
        `Your appointment #${appointmentId} has been cancelled. Please contact reception for rescheduling.`
      );
    }

    return res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    await conn.rollback();
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  } finally {
    conn.release();
  }
};

/**
 * Retrieves the current day's live queue.
 */
exports.getQueue = async (_req, res) => {
  try {
    await upsertQueueForToday();
    const [rows] = await db.query(
      `SELECT q.appointment_id, q.queue_position, q.token_number, q.is_emergency, q.is_walkin, q.priority_level,
              p.pet_name,
              CONCAT(COALESCE(up.first_name, ''), ' ', COALESCE(up.last_name, '')) AS client_name,
              a.appointment_start
       FROM appointment_queue q
       JOIN appointments a ON a.appointment_id = q.appointment_id
       JOIN pets p ON p.pet_id = a.pet_id
       JOIN clients c ON c.client_id = a.client_id
       LEFT JOIN user_profiles up ON up.user_id = c.user_id
       WHERE DATE(a.appointment_start) = CURDATE()
       ORDER BY q.is_emergency DESC, q.priority_level DESC, q.is_walkin DESC, q.queue_position ASC`
    );
    return res.json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Persists manual drag-and-drop reordering of the queue.
 */
exports.reorderQueue = async (req, res) => {
  const appointmentIds = req.body?.appointment_ids;
  if (!Array.isArray(appointmentIds) || appointmentIds.length === 0) {
    return res.status(400).json({ message: 'appointment_ids array is required' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await upsertQueueForToday(conn);

    for (let i = 0; i < appointmentIds.length; i += 1) {
      await conn.query(
        'UPDATE appointment_queue SET queue_position = ?, updated_at = NOW() WHERE appointment_id = ?',
        [i + 1, appointmentIds[i]]
      );
    }

    await conn.commit();
    return res.json({ message: 'Queue reordered successfully' });
  } catch (error) {
    await conn.rollback();
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  } finally {
    conn.release();
  }
};

/**
 * Immediately elevates an appointment to emergency status, bypassing standard priority.
 */
exports.prioritizeEmergency = async (req, res) => {
  const appointmentId = Number(req.params.appointment_id);

  if (!Number.isInteger(appointmentId) || appointmentId <= 0) {
    return res.status(400).json({ message: 'Invalid appointment id' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await upsertQueueForToday(conn);

    await conn.query(
      'UPDATE appointment_queue SET is_emergency = 1, priority_level = 2, queue_position = 1, updated_at = NOW() WHERE appointment_id = ?',
      [appointmentId]
    );

    await conn.commit();
    return res.json({ message: 'Appointment moved to emergency priority' });
  } catch (error) {
    await conn.rollback();
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  } finally {
    conn.release();
  }
};

/**
 * Updates priority flags (e.g., walk-in vs scheduled) for a queued appointment.
 */
exports.updatePriority = async (req, res) => {
  const appointmentId = Number(req.params.appointment_id);
  const { priority_level, is_walkin, is_emergency } = req.body;

  if (!Number.isInteger(appointmentId) || appointmentId <= 0) {
    return res.status(400).json({ message: 'Invalid appointment id' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await upsertQueueForToday(conn);

    await conn.query(
      `UPDATE appointment_queue 
       SET priority_level = ?, is_walkin = ?, is_emergency = ?, updated_at = NOW() 
       WHERE appointment_id = ?`,
      [priority_level || 0, is_walkin || 0, is_emergency || 0, appointmentId]
    );

    await conn.commit();
    return res.json({ message: 'Priority updated successfully' });
  } catch (error) {
    await conn.rollback();
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  } finally {
    conn.release();
  }
};
