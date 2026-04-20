const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../utils/emailService');


// REGISTER USER

exports.registerUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [existingUsers] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const [roles] = await db.query(
      "SELECT role_id FROM roles WHERE role_name = 'CLIENT'"
    );

    if (roles.length === 0) {
      return res.status(500).json({ message: 'CLIENT role not found' });
    }

    const roleId = roles[0].role_id;

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      'INSERT INTO users (email, password_hash, role_id, status) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, roleId, 'ACTIVE']
    );

    const user_id = result.insertId;

    const token = jwt.sign(
      { user_id, role_id: roleId },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};



// LOGIN USER

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [results] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

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

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const [users] = await db.query(
      `SELECT u.*, up.first_name 
       FROM users u
       LEFT JOIN user_profiles up ON u.user_id = up.user_id
       WHERE u.email = ?`,
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = users[0];

    const resetToken = jwt.sign(
      { user_id: user.user_id },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

    // fallback if no profile yet
    const name = user.first_name || "there";

    await sendEmail(
      email,
      "Password Reset Request",
      `Dear ${name},

We received a request to reset your password.

Please click the link below to set a new password:
${resetLink}

This link will expire in 10 minutes.

If you did not request this, please ignore this email.

Warm regards,  
PetPaws Animal Hospital`
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

    await db.query(
      "UPDATE users SET password_hash = ? WHERE user_id = ?",
      [hashedPassword, decoded.user_id]
    );

    res.json({ message: "Password reset successful" });

  } catch (error) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }
};


// GET CURRENT USER

exports.getMe = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const [users] = await db.query(
      `SELECT u.user_id, u.email, up.first_name, r.role_name
       FROM users u
       LEFT JOIN user_profiles up ON u.user_id = up.user_id
       LEFT JOIN roles r ON u.role_id = r.role_id
       WHERE u.user_id = ?`,
      [userId]
    );

    res.json(users[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};