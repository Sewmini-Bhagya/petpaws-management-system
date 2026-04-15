const db = require('../config/db');

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);


// CREATE APPOINTMENT
exports.createAppointment = async (req, res) => {
  const userId = req.user.user_id;
  const { pet_id, appointment_start, service_ids } = req.body;

  try {
    // VALIDATIONS

    if (!pet_id || !appointment_start || !service_ids || service_ids.length === 0) {
      return res.status(400).json({
        message: 'Missing required fields'
      });
    }

    const start = new Date(appointment_start);

    if (isNaN(start)) {
      return res.status(400).json({
        message: 'Invalid date format'
      });
    }

    // No Sundays
    if (start.getDay() === 0) {
      return res.status(400).json({
        message: 'Clinic is closed on Sundays'
      });
    }

    // GET CLIENT
    const [clients] = await db.promise().query(
      'SELECT client_id FROM clients WHERE user_id = ?',
      [userId]
    );

    if (clients.length === 0) {
      return res.status(400).json({
        message: 'Client profile not found'
      });
    }

    const client_id = clients[0].client_id;

    // VALIDATE PET OWNERSHIP
    const [pets] = await db.promise().query(
      'SELECT pet_id FROM pets WHERE pet_id = ? AND client_id = ?',
      [pet_id, client_id]
    );

    if (pets.length === 0) {
      return res.status(403).json({
        message: 'Unauthorized pet access'
      });
    }

    // GET SERVICES
    const [services] = await db.promise().query(
      `SELECT service_id, duration_minutes, resource_type, required_specialization
       FROM services
       WHERE service_id IN (${service_ids.map(() => '?').join(',')})`,
      service_ids
    );

    if (services.length !== service_ids.length) {
      return res.status(400).json({
        message: 'Invalid service selection'
      });
    }


    // CHECK SINGLE RESOURCE TYPE
    const resourceTypes = [...new Set(services.map(s => s.resource_type))];

    if (resourceTypes.length > 1) {
      return res.status(400).json({
        message: 'Selected services require different resources. Please book separately.'
      });
    }

    const resourceType = resourceTypes[0];

    // CALCULATE TOTAL DURATION
    const totalDuration = services.reduce(
      (sum, service) => sum + service.duration_minutes,
      0
    );

    const end = new Date(start.getTime() + totalDuration * 60000);

    // TIME VALIDATION
    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const endMinutes = end.getHours() * 60 + end.getMinutes();

    const openTime = 9 * 60;
    const closeTime = 21 * 60;

    if (startMinutes < openTime || endMinutes > closeTime) {
      return res.status(400).json({
        message: 'Appointments must be between 9 AM and 9 PM'
      });
    }

    // PET OVERLAP CHECK
    const [petOverlap] = await db.promise().query(
      `SELECT COUNT(*) AS count
       FROM appointments
       WHERE pet_id = ?
       AND appointment_start < ?
       AND appointment_end > ?`,
      [pet_id, end, start]
    );

    if (petOverlap[0].count > 0) {
      return res.status(400).json({
        message: 'This pet already has an appointment in this time slot'
      });
    }

    // GET RESOURCE
    const [resource] = await db.promise().query(
      `SELECT resource_id, capacity
       FROM resources
       WHERE resource_type = ?`,
      [resourceType]
    );

    if (resource.length === 0) {
      return res.status(500).json({
        message: 'Resource not configured'
      });
    }

    const resource_id = resource[0].resource_id;
    const capacity = resource[0].capacity;

    // RESOURCE AVAILABILITY CHECK
    const [resourceUsage] = await db.promise().query(
      `SELECT COUNT(*) AS count
       FROM appointment_resources ar
       JOIN appointments a ON ar.appointment_id = a.appointment_id
       WHERE ar.resource_id = ?
       AND a.appointment_start < ?
       AND a.appointment_end > ?`,
      [resource_id, end, start]
    );

    if (resourceUsage[0].count >= capacity) {
      return res.status(400).json({
        message: `${resourceType} not available for this time slot`
      });
    }

    // GET SPECIALIZATION
    const specializations = [...new Set(
      services.map(s => s.required_specialization).filter(s => s !== null)
    )];

    let requiredSpecialization = null;

    if (specializations.length > 1) {
      return res.status(400).json({
        message: 'Selected services require different vet specializations'
      });
    }

    if (specializations.length === 1) {
      requiredSpecialization = specializations[0];
    }


    // FIND AVAILABLE VET
    let vet_id = null;

    if (requiredSpecialization) {
      const [vets] = await db.promise().query(
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
        [requiredSpecialization, end, start]
      );

      if (vets.length === 0) {
        return res.status(400).json({
          message: 'No available vet for this time slot'
        });
      }

      vet_id = vets[0].vet_id;
    }

    // INSERT APPOINTMENT
    const [result] = await db.promise().query(
      `INSERT INTO appointments
       (client_id, pet_id, appointment_start, appointment_end, status_id, created_at)
       VALUES (?, ?, ?, ?, 1, NOW())`,
      [client_id, pet_id, start, end]
    );

    const appointment_id = result.insertId;

    // INSERT APPOINTMENT SERVICES
    const serviceValues = service_ids.map(service_id => [
      appointment_id,
      service_id
    ]);

    await db.promise().query(
      `INSERT INTO appointment_services (appointment_id, service_id)
       VALUES ?`,
      [serviceValues]
    );

    // ASSIGN RESOURCE
    await db.promise().query(
      `INSERT INTO appointment_resources (appointment_id, resource_id)
       VALUES (?, ?)`,
      [appointment_id, resource_id]
    );
    
    // ASSIGN VET
    if (vet_id) {
      await db.promise().query(
        `INSERT INTO appointment_assignments (appointment_id, vet_id)
        VALUES (?, ?)`,
        [appointment_id, vet_id]
      );
    }

    // FORMAT TIME (timezone safe)
    const formattedEnd = dayjs(end)
      .tz('Asia/Colombo')
      .format('YYYY-MM-DD HH:mm:ss');

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment_id,
      appointment_end: formattedEnd
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Server error'
    });
  }
};


// GET MY APPOINTMENTS
exports.getMyAppointments = async (req, res) => {
  const userId = req.user.user_id;

  try {
    const [appointments] = await db.promise().query(
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
    res.status(500).json({
      message: 'Server error'
    });
  }
};