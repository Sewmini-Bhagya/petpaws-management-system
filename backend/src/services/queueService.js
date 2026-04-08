const db = require('../config/db');

/**
 * Rebuilds and synchronizes the daily appointment queue.
 * Assigns queue positions and token numbers for walk-ins and pre-booked appointments scheduled for the current date.
 * 
 * @param {import('mysql2/promise').Connection} conn - Database connection/pool to execute the transaction.
 */
const upsertQueueForToday = async (conn = db) => {
  const [todayAppointments] = await conn.query(
    `SELECT appointment_id
     FROM appointments
     WHERE DATE(appointment_start) = CURDATE()
     ORDER BY appointment_start ASC, appointment_id ASC`
  );

  for (let i = 0; i < todayAppointments.length; i += 1) {
    const position = i + 1;
    const appointmentId = todayAppointments[i].appointment_id;

    const [exists] = await conn.query(
      'SELECT appointment_id, token_number FROM appointment_queue WHERE appointment_id = ? LIMIT 1',
      [appointmentId]
    );

    if (exists.length) {
      if (!exists[0].token_number) {
        const [maxTokenRows] = await conn.query(
          'SELECT MAX(token_number) AS max_token FROM appointment_queue WHERE DATE(updated_at) = CURDATE()'
        );
        const nextToken = (maxTokenRows[0].max_token || 0) + 1;
        await conn.query(
          'UPDATE appointment_queue SET queue_position = ?, token_number = ?, updated_at = NOW() WHERE appointment_id = ?',
          [position, nextToken, appointmentId]
        );
      } else {
        await conn.query(
          'UPDATE appointment_queue SET queue_position = ?, updated_at = NOW() WHERE appointment_id = ?',
          [position, appointmentId]
        );
      }
    } else {
      const [maxTokenRows] = await conn.query(
        'SELECT MAX(token_number) AS max_token FROM appointment_queue WHERE DATE(updated_at) = CURDATE()'
      );
      const nextToken = (maxTokenRows[0].max_token || 0) + 1;

      await conn.query(
        'INSERT INTO appointment_queue (appointment_id, queue_position, token_number, is_emergency, updated_at) VALUES (?, ?, ?, 0, NOW())',
        [appointmentId, position, nextToken]
      );
    }
  }
};

module.exports = {
  upsertQueueForToday
};
