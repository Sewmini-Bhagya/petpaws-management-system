const db = require('../config/db');

/**
 * Submits feedback from a client.
 * Uses an advanced fallback mechanism to handle schemas with or without an appointment_id column.
 */
exports.submitFeedback = async (req, res) => {
  const userId = req.user.user_id;
  const { appointment_id, rating, comments } = req.body;

  if (rating === undefined || rating === null) {
    return res.status(400).json({ message: "Rating is required" });
  }

  try {
    // 1. Resolve client_id from user_id
    const [clients] = await db.query(
      'SELECT client_id FROM clients WHERE user_id = ?',
      [userId]
    );

    if (clients.length === 0) {
      return res.status(404).json({ message: "Client profile not found" });
    }

    const clientId = clients[0].client_id;

    // 2. Perform safe insert with robust fallback if appointment_id is missing from schema
    try {
      await db.query(
        `INSERT INTO feedback (client_id, appointment_id, rating, comments, created_at)
         VALUES (?, ?, ?, ?, NOW())`,
        [clientId, appointment_id ? Number(appointment_id) : null, Number(rating), comments || ""]
      );
    } catch (dbErr) {
      // Fallback if appointment_id column does not exist
      if (dbErr.code === 'ER_BAD_FIELD_ERROR') {
        console.warn("appointment_id column missing from feedback table, falling back to client-only insert.");
        await db.query(
          `INSERT INTO feedback (client_id, rating, comments, created_at)
           VALUES (?, ?, ?, NOW())`,
          [clientId, Number(rating), comments || ""]
        );
      } else {
        throw dbErr;
      }
    }

    return res.status(201).json({
      message: "Feedback submitted successfully"
    });

  } catch (error) {
    console.error("Feedback submission error:", error);
    return res.status(500).json({ message: "Server error during feedback persistence" });
  }
};
