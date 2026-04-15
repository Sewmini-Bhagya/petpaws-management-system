const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../utils/emailService');


// REGISTER USER

exports.registerUser = async (req, res) => {
  const { email, password } = req.body;

  try {

    // Check if user exists
    const [existingUsers] = await db.promise().query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Get CLIENT role
    const [roles] = await db.promise().query(
      "SELECT role_id FROM roles WHERE role_name = 'CLIENT'"
    );

    if (roles.length === 0) {
      return res.status(500).json({ message: 'CLIENT role not found' });
    }

    const roleId = roles[0].role_id;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    await db.promise().query(
      'INSERT INTO users (email, password_hash, role_id, status) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, roleId, 'ACTIVE']
    );

    await sendEmail(
      email,
      'Welcome to PetPaws 🐾',
      'Your account has been created successfully!'
    );

    res.status(201).json({ message: 'User registered as CLIENT' });


  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};



// LOGIN USER

exports.loginUser = (req, res) => {
  const { email, password } = req.body;

  db.query(
    'SELECT * FROM users WHERE email = ?',
    [email],
    async (err, results) => {
      if (err) {
        return res.status(500).json(err);
      }

      if (results.length === 0) {
        return res.status(401).json({ message: 'User not found' });
      }

      const user = results[0];

      const isMatch = await bcrypt.compare(password, user.password_hash);

      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        {
          user_id: user.user_id,
          role_id: user.role_id
        },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      res.json({
        message: 'Login successful',
        token
      });
    }
  );
};