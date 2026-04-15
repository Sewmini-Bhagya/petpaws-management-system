const db = require('../config/db');
const bcrypt = require('bcrypt');

exports.createUser = async (req, res) => {
  const { email, password, role_name, specialization, license_number } = req.body;

  try {
    // 1. Check if user exists
    const [existing] = await db.promise().query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 2. Get role_id
    const [roles] = await db.promise().query(
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
    const [userResult] = await db.promise().query(
      'INSERT INTO users (email, password_hash, role_id, status) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, roleId, 'ACTIVE']
    );

    const userId = userResult.insertId;

    // 5. Create role-specific profile
    if (role_name === 'VET') {
      await db.promise().query(
        'INSERT INTO veterinarians (user_id, specialization, license_number) VALUES (?, ?, ?)',
        [userId, specialization, license_number]
      );
    }

    if (role_name === 'RECEPTIONIST') {
      await db.promise().query(
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