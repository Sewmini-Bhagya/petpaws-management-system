const db = require('../config/db');

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const { sendEmail } = require('../utils/emailService');
const templates = require('../utils/emailTemplates');

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Creates a new appointment, handles resource allocation, vet assignment, and sends confirmation emails.
 */
exports.createAppointment = async (req, res) => {
  const userId = req.user.user_id;
  const { pet_id, appointment_start, service_ids } = req.body;

  try {
    if (!pet_id || !appointment_start || !service_ids || service_ids.length === 0) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const timezoneStr = process.env.CLINIC_TIMEZONE || "Asia/Colombo";
    const start = dayjs(appointment_start).tz(timezoneStr);

    if (!start.isValid()) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    if (start.day() === 0) {
      return res.status(400).json({ message: 'Clinic is closed on Sundays' });
    }

    if (start.isBefore(dayjs().tz(timezoneStr))) {
      return res.status(400).json({ message: 'Cannot book an appointment in the past' });
    }

    const [clients] = await db.query(
      'SELECT client_id FROM clients WHERE user_id = ?',
      [userId]
    );

    if (clients.length === 0) {
      return res.status(400).json({ message: 'Client profile not found' });
    }

    const client_id = clients[0].client_id;

    const [pets] = await db.query(
      'SELECT pet_id FROM pets WHERE pet_id = ? AND client_id = ?',
      [pet_id, client_id]
    );

    if (pets.length === 0) {
      return res.status(403).json({ message: 'Unauthorized pet access' });
    }

    const [services] = await db.query(
      `SELECT service_id, service_name, duration_minutes, resource_type, required_specialization
       FROM services
       WHERE service_id IN (${service_ids.map(() => '?').join(',')})`,
      service_ids
    );

    if (services.length !== service_ids.length) {
      return res.status(400).json({ message: 'Invalid service selection' });
    }

    // specific business rules for minimum lead time requirements
    const now = dayjs().tz(timezoneStr);
    const diffHours = start.diff(now, 'hour', true);

    const hasSurgery = services.some(s => s.service_name.toLowerCase().includes("surgery"));
    const hasGrooming = services.some(s => s.service_name.toLowerCase().includes("grooming"));

    if (hasSurgery && diffHours < 24) {
      return res.status(400).json({ message: 'Surgeries must be booked at least 24 hours in advance' });
    }

    if (hasGrooming && diffHours < 2) {
      return res.status(400).json({ message: 'Grooming services must be booked at least 2 hours in advance' });
    }

    const resourceTypes = [...new Set(services.map(s => s.resource_type))];

    if (resourceTypes.length > 1) {
      return res.status(400).json({ message: 'Selected services require different resources. Please book separately.' });
    }

    const resourceType = resourceTypes[0];

    const totalDuration = services.reduce(
      (sum, service) => sum + service.duration_minutes,
      0
    );

    const end = start.add(totalDuration, 'minute');

    const startMinutes = start.hour() * 60 + start.minute();
    const endMinutes = end.hour() * 60 + end.minute();

    const formattedStartDB = start.format('YYYY-MM-DD HH:mm:ss');
    const formattedEndDB = end.format('YYYY-MM-DD HH:mm:ss');

    const openTime = Number(process.env.CLINIC_OPEN_HOUR || 9) * 60;
    const closeTime = Number(process.env.CLINIC_CLOSE_HOUR || 21) * 60;

    if (startMinutes < openTime || endMinutes > closeTime) {
      return res.status(400).json({ message: 'Appointments must be between 9 AM and 9 PM' });
    }

    const [petOverlap] = await db.query(
      `SELECT COUNT(*) AS count
       FROM appointments
       WHERE pet_id = ?
       AND appointment_start < ?
       AND appointment_end > ?`,
      [pet_id, formattedEndDB, formattedStartDB]
    );

    if (petOverlap[0].count > 0) {
      return res.status(400).json({ message: 'This pet already has an appointment in this time slot' });
    }

    const [resource] = await db.query(
      `SELECT resource_id, capacity
       FROM resources
       WHERE resource_type = ?`,
      [resourceType]
    );

    if (resource.length === 0) {
      return res.status(500).json({ message: 'Resource not configured' });
    }

    const resource_id = resource[0].resource_id;
    const capacity = resource[0].capacity;

    const [resourceUsage] = await db.query(
      `SELECT COUNT(*) AS count
       FROM appointment_resources ar
       JOIN appointments a ON ar.appointment_id = a.appointment_id
       WHERE ar.resource_id = ?
       AND a.appointment_start < ?
       AND a.appointment_end > ?`,
      [resource_id, formattedEndDB, formattedStartDB]
    );

    if (resourceUsage[0].count >= capacity) {
      return res.status(400).json({ message: `${resourceType} not available for this time slot` });
    }

    const specializations = [...new Set(
      services.map(s => s.required_specialization).filter(s => s !== null)
    )];

    let requiredSpecialization = null;

    if (specializations.length > 1) {
      return res.status(400).json({ message: 'Selected services require different vet specializations' });
    }

    if (specializations.length === 1) {
      requiredSpecialization = specializations[0];
    }

    let vet_id = null;

    if (requiredSpecialization) {
      const [vets] = await db.query(
        `SELECT v.vet_id
        FROM veterinarians v
        WHERE v.specialization = ?
        AND v.vet_id NOT IN (
          SELECT aa.vet_id
          FROM appointment_assignments aa
          JOIN appointments a ON aa.appointment_id = a.appointment_id
          WHERE a.appointment_start < ?
          AND a.appointment_end > ?
        )
        LIMIT 1`,
        [requiredSpecialization, formattedEndDB, formattedStartDB]
      );

      if (vets.length === 0) {
        return res.status(400).json({ message: 'No available vet for this time slot' });
      }

      vet_id = vets[0].vet_id;
    }

    const [result] = await db.query(
      `INSERT INTO appointments
       (client_id, pet_id, appointment_start, appointment_end, status_id, status, created_at)
       VALUES (?, ?, ?, ?, 1, 'SCHEDULED', NOW())`,
      [client_id, pet_id, formattedStartDB, formattedEndDB]
    );

    const appointment_id = result.insertId;

    const serviceValues = service_ids.map(service_id => [
      appointment_id,
      service_id
    ]);

    await db.query(
      `INSERT INTO appointment_services (appointment_id, service_id)
       VALUES ?`,
      [serviceValues]
    );

    await db.query(
      `INSERT INTO appointment_resources (appointment_id, resource_id)
       VALUES (?, ?)`,
      [appointment_id, resource_id]
    );
    
    if (vet_id) {
      await db.query(
        `INSERT INTO appointment_assignments (appointment_id, vet_id)
        VALUES (?, ?)`,
        [appointment_id, vet_id]
      );
    }

    const formattedStart = start.tz(timezoneStr).format('YYYY-MM-DD HH:mm:ss');
    const formattedEnd = end.tz(timezoneStr).format('HH:mm:ss');
    
    const [contextRows] = await db.query(
      `SELECT u.email, up.first_name, p.pet_name
       FROM users u
       LEFT JOIN user_profiles up ON up.user_id = u.user_id
       JOIN clients c ON c.user_id = u.user_id
       JOIN pets p ON p.pet_id = ?
       WHERE u.user_id = ?`,
      [pet_id, userId]
    );

    if (contextRows.length > 0) {
      const ctx = contextRows[0];
      const { subject, text } = templates.getAppointmentConfirmed(
        ctx.first_name || "there",
        ctx.pet_name,
        start.format('YYYY-MM-DD'),
        start.format('hh:mm A'),
        "Available Doctor"
      );
      
      // email is fire-and-forget
      await sendEmail(ctx.email, subject, text);

      try {
        await db.query(
          `INSERT INTO notifications (user_id, title, message)
           VALUES (?, ?, ?)`,
          [userId, 'Appointment Scheduled 🐾', `Your appointment for ${ctx.pet_name} on ${start.format('YYYY-MM-DD')} at ${start.format('hh:mm A')} has been confirmed.`]
        );
      } catch (notiErr) {
        console.error("Booking notification failed:", notiErr.message);
      }
    }

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment_id,
      appointment_end: formattedEnd
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Records additional services performed during an ongoing appointment.
 * Restricted to staff roles to prevent clients from bypassing payment logic.
 */
exports.addPerformedService = async (req, res) => {
  const userId = req.user.user_id;
  const { appointment_id } = req.params;
  const { service_id } = req.body;

  try {
    const [users] = await db.query(
      `SELECT r.role_name 
       FROM users u 
       JOIN roles r ON u.role_id = r.role_id 
       WHERE u.user_id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const role = users[0].role_name;

    if (role !== 'VET' && role !== 'RECEPTIONIST') {
      return res.status(403).json({ message: 'Only vets or receptionists can add services' });
    }
    
    const [appointments] = await db.query(
      'SELECT appointment_id FROM appointments WHERE appointment_id = ?',
      [appointment_id]
    );

    if (appointments.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const [existing] = await db.query(
      `SELECT * FROM appointment_performed_services
       WHERE appointment_id = ? AND service_id = ?`,
      [appointment_id, service_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Service already added to this appointment' });
    }

    // Protects financial integrity by blocking additions after billing has started
    const [invoices] = await db.query(
      'SELECT * FROM invoices WHERE appointment_id = ?',
      [appointment_id]
    );

    if (invoices.length > 0) {
      return res.status(400).json({ message: 'Cannot add services after invoice is generated' });
    }

    await db.query(
      `INSERT INTO appointment_performed_services 
       (appointment_id, service_id, added_by)
       VALUES (?, ?, ?)`,
      [appointment_id, service_id, userId]
    );

    res.status(201).json({ message: 'Service added successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Retrieves all appointments for the authenticated client.
 */
exports.getMyAppointments = async (req, res) => {
  const userId = req.user.user_id;

  try {
    const [appointments] = await db.query(
      `SELECT a.*
       FROM appointments a
       JOIN clients c ON a.client_id = c.client_id
       WHERE c.user_id = ?
       ORDER BY a.appointment_start DESC`,
      [userId]
    );

    res.json(appointments);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Calculates hourly slot availability based on fixed clinic capacity.
 */
exports.getAvailableSlots = async (req, res) => {
  const { date } = req.query;

  try {
    const slots = [];

    const openHour = Number(process.env.CLINIC_OPEN_HOUR || 9);
    const closeHour = Number(process.env.CLINIC_CLOSE_HOUR || 21);

    // Clinic hours are based on environment configuration
    for (let hour = openHour; hour < closeHour; hour++) {
      const time = `${hour.toString().padStart(2, "0")}:00:00`;
      const start = `${date} ${time}`;

      const [count] = await db.query(
        `SELECT COUNT(*) AS count
         FROM appointments
         WHERE appointment_start = ?`,
        [start]
      );

      slots.push({
        time,
        available: count[0].count < Number(process.env.MAX_CONCURRENT_APPOINTMENTS || 6)
      });
    }

    res.json(slots);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};