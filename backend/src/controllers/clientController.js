exports.getDashboard = async (req, res) => {
  const userId = req.user.user_id;

  try {
    // GET CLIENT ID
    const [clients] = await db.promise().query(
      "SELECT client_id FROM clients WHERE user_id = ?",
      [userId]
    );

    if (clients.length === 0) {
      return res.status(400).json({ message: "Client not found" });
    }

    const client_id = clients[0].client_id;

    // PET COUNT
    const [pets] = await db.promise().query(
      "SELECT COUNT(*) AS count FROM pets WHERE client_id = ?",
      [client_id]
    );

    // UPCOMING APPOINTMENTS
    const [appointments] = await db.promise().query(
      `SELECT COUNT(*) AS count
       FROM appointments
       WHERE client_id = ?
       AND appointment_start > NOW()`,
      [client_id]
    );

    // PENDING PAYMENTS
    const [payments] = await db.promise().query(
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