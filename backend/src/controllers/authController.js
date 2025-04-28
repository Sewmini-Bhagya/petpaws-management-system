const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../utils/emailService');
const templates = require('../utils/emailTemplates');
const { logAction } = require('../utils/auditLogger');

/**
 * Handles new user registration.
 * Defaults all new sign-ups to the 'CLIENT' role with an 'ACTIVE' status.
 */
exports.registerUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long' });
  }

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
      { expiresIn: process.env.JWT_EXPIRY || '1d' }
    );

      await logAction(user_id, 'USER_REGISTERED', 'user', user_id, null, { email, role: 'CLIENT' });

      res.status(201).json({
        message: 'User registered successfully',
        token
      });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Authenticates a user and returns a JWT for session management.
 */
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

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
      { expiresIn: process.env.JWT_EXPIRY || '1d' }
    );

    res.json({
      message: 'Login successful',
      token
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Initiates the password reset flow by sending a short-lived token via email.
 */
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
      { expiresIn: process.env.JWT_RESET_EXPIRY || '10m' }
    );

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetLink = `${frontendUrl}/reset-password/${resetToken}`;
    const name = user.first_name || "there";

    await sendEmail(
      email,
      "Password Reset Request",
      `Dear ${name},\n\nWe received a request to reset your password.\n\nPlease click the link below to set a new password:\n${resetLink}\n\nThis link will expire in 10 minutes.\n\nIf you did not request this, please ignore this email.\n\nWarm regards,\nPetPaws Animal Hospital`
    );

    res.json({ message: "Reset link sent to email" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Validates the reset token and updates the user's password.
 */
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const [users] = await db.query(
      "SELECT u.*, up.first_name FROM users u LEFT JOIN user_profiles up ON u.user_id = up.user_id WHERE u.user_id = ?",
      [decoded.user_id]
    );

    await db.query(
      "UPDATE users SET password_hash = ? WHERE user_id = ?",
      [hashedPassword, decoded.user_id]
    );

    if (users.length > 0) {
      const { subject, text } = templates.getPasswordResetConfirmation(users[0].first_name || "there");
      await sendEmail(users[0].email, subject, text);
    }

    await logAction(decoded.user_id, 'PASSWORD_RESET_COMPLETE', 'user', decoded.user_id);

    res.json({ message: "Password reset successful" });

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    console.error('Reset password DB error:', error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Returns the currently authenticated user's core data.
 */
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

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(users[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};