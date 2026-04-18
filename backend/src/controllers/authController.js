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
    const [result] = await db.promise().query(
      'INSERT INTO users (email, password_hash, role_id, status) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, roleId, 'ACTIVE']
    );

    const user_id = result.insertId;

    const token = jwt.sign(
      {
        user_id: user_id,
        role_id: roleId
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token
    });


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

// FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const [users] = await db.promise().query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = users[0];

    // create reset token 
    const resetToken = jwt.sign(
      { user_id: user.user_id },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

    // send email
    await sendEmail(
      email,
      "Reset your password 🔐",
      `Click here to reset your password:\n${resetLink}`
    );

    res.json({ message: "Reset link sent to email" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// RESET PASSWORD

exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.promise().query(
      "UPDATE users SET password_hash = ? WHERE user_id = ?",
      [hashedPassword, decoded.user_id]
    );

    res.json({ message: "Password reset successful" });

  } catch (error) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }
};