const db = require('../config/db');

/**
 * Aggregates high-level metrics (pets, upcoming appointments, pending invoices) for the client dashboard.
 */
exports.getDashboard = async (req, res) => {
  const userId = req.user.user_id;

  try {
    const [clients] = await db.query(
      "SELECT client_id FROM clients WHERE user_id = ?",
      [userId]
    );

    if (clients.length === 0) {
      return res.status(400).json({ message: "Client not found" });
    }

    const client_id = clients[0].client_id;

    const [pets] = await db.query(
      "SELECT COUNT(*) AS count FROM pets WHERE client_id = ?",
      [client_id]
    );

    const [appointments] = await db.query(
      `SELECT COUNT(*) AS count
       FROM appointments
       WHERE client_id = ?
       AND appointment_start > NOW()`,
      [client_id]
    );

    const [payments] = await db.query(
      `SELECT COUNT(*) AS count
       FROM invoices
       WHERE client_id = ?
       AND status != 'PAID'`,
      [client_id]
    );

    res.json({
      petCount: pets[0].count,
      upcomingAppointments: appointments[0].count,
      pendingPayments: payments[0].count
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Retrieves a combined chronological feed of global announcements and personal notifications.
 */
exports.getNotifications = async (req, res) => {
  const userId = req.user.user_id;

  try {
    const [personal] = await db.query(
      `SELECT notification_id as id, title, message, is_read, created_at, 'personal' as type
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    const [announcements] = await db.query(
      `SELECT announcement_id as id, title, content as message, 0 as is_read, created_at, 'announcement' as type
       FROM announcements
       WHERE is_active = 1
       ORDER BY created_at DESC`
    );

    const all = [...personal, ...announcements].sort((a,b) => new Date(b.created_at) - new Date(a.created_at));

    res.json(all);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Flags a specific personal notification as read.
 */
exports.markNotificationRead = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.user_id;

  try {
    await db.query(
      "UPDATE notifications SET is_read = 1 WHERE notification_id = ? AND user_id = ?",
      [id, userId]
    );
    res.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};