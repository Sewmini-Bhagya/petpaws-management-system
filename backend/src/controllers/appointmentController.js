const db = require('../config/db');



// CREATE APPOINTMENT
exports.createAppointment = async (req, res) => {
  const userId = req.user.user_id;
  const { pet_id, appointment_start, appointment_end } = req.body;

  try {
    // VALIDATIONS

    // Required fields
    if (!pet_id || !appointment_start || !appointment_end) {
      return res.status(400).json({
        message: 'Missing required fields'
      });
    }

    const start = new Date(appointment_start);
    const end = new Date(appointment_end);

    // Invalid date format
    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({
        message: 'Invalid date format'
      });
    }

    // End must be after start
    if (end <= start) {
      return res.status(400).json({
        message: 'Invalid appointment time'
      });
    }

    // No Sundays
    if (start.getDay() === 0) {
      return res.status(400).json({
        message: 'Clinic is closed on Sundays'
      });
    }

    // Working hours (9AM - 9PM)
    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const endMinutes = end.getHours() * 60 + end.getMinutes();

    const openTime = 9 * 60;   // 9:00 AM
    const closeTime = 21 * 60; // 9:00 PM

    if (startMinutes < openTime || endMinutes > closeTime) {
      return res.status(400).json({
        message: 'Appointments must be between 9 AM and 9 PM'
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

    // BED CONSTRAINT 

    const [overlapping] = await db.promise().query(
    `SELECT COUNT(*) AS count
    FROM appointments
    WHERE appointment_start < ?
    AND appointment_end > ?`,
    [appointment_end, appointment_start]
    );

    if (overlapping[0].count >= 6) {
    return res.status(400).json({
        message: 'No available beds for this time slot'
    });
    }

    // INSERT APPOINTMENT 
    await db.promise().query(
      `INSERT INTO appointments 
       (client_id, pet_id, appointment_start, appointment_end, status_id, created_at)
       VALUES (?, ?, ?, ?, 1, NOW())`,
      [client_id, pet_id, appointment_start, appointment_end]
    );

    res.status(201).json({
      message: 'Appointment created successfully'
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