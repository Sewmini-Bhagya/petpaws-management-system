const db = require('../config/db');
const bcrypt = require('bcrypt');

exports.createUser = async (req, res) => {
  const { email, password, role_name, specialization, license_number } = req.body;

  try {
    // 1. Check if user exists
    const [existing] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 2. Get role_id
    const [roles] = await db.query(
      'SELECT role_id FROM roles WHERE role_name = ?',
      [role_name]
    );

    if (roles.length === 0) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const roleId = roles[0].role_id;

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Insert user
    const [userResult] = await db.query(
      'INSERT INTO users (email, password_hash, role_id, status) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, roleId, 'ACTIVE']
    );

    const userId = userResult.insertId;

    // 5. Create role-specific profile
    if (role_name === 'VET') {
      await db.query(
        'INSERT INTO veterinarians (user_id, specialization, license_number) VALUES (?, ?, ?)',
        [userId, specialization, license_number]
      );
    }

    if (role_name === 'RECEPTIONIST') {
      await db.query(
        'INSERT INTO receptionists (user_id) VALUES (?)',
        [userId]
      );
    }

    res.status(201).json({
      message: `${role_name} created successfully`
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};



exports.getAdminDashboard = async (req, res) => {
  try {

    // FEEDBACK
    const [feedback] = await db.query(`
      SELECT f.feedback_id, f.rating, f.comments, f.created_at,
            u.email
      FROM feedback f
      JOIN clients c ON f.client_id = c.client_id
      JOIN users u ON c.user_id = u.user_id
      ORDER BY f.created_at DESC
      LIMIT 5
    `);

    // TOTAL REVENUE
    const [revenue] = await db.query(
      "SELECT SUM(total_amount) AS total FROM invoices WHERE status = 'PAID'"
    );

    // TOTAL APPOINTMENTS
    const [appointments] = await db.query(
      "SELECT COUNT(*) AS count FROM appointments"
    );

    // TOTAL SERVICES
    const [services] = await db.query(
      "SELECT COUNT(*) AS count FROM services"
    );

    // TOTAL STOCK (if you have inventory table)
    const [stock] = await db.query(
      "SELECT SUM(quantity_available) AS total FROM inventory_stock"
    );

    // TOTAL VISITS (appointments = visits)
    const [visits] = await db.query(
      "SELECT COUNT(*) AS count FROM appointments"
    );

    res.json({
      feedback,
      revenue: revenue[0].total || 0,
      appointments: appointments[0].count,
      services: services[0].count,
      stock: stock[0]?.count || 0,
      visits: visits[0].count
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};