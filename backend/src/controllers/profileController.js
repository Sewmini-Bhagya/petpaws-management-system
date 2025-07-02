const db = require("../config/db");
const { sendEmail } = require("../utils/emailService");

/**
 * Initializes a new user profile and triggers a welcome email.
 * Prevents duplicate profile creation for a single user account.
 */
exports.createProfile = async (req, res) => {
  try {
    const { first_name, last_name, phone, city } = req.body;

    if (!first_name || !last_name || !phone || !city) {
      return res.status(400).json({ message: "All fields required" });
    }

    const userId = req.user.user_id; 

    const [userRows] = await db.query(
      "SELECT email FROM users WHERE user_id = ?",
      [userId]
    );

    const email = userRows[0].email;

    const [insertResult] = await db.query(
      `INSERT INTO user_profiles (user_id, first_name, last_name, phone, city)
       SELECT ?, ?, ?, ?, ?
       FROM DUAL
       WHERE NOT EXISTS (
         SELECT 1 FROM user_profiles WHERE user_id = ?
       )`,
      [userId, first_name, last_name, phone, city, userId]
    );

    if (insertResult.affectedRows === 0) {
      return res.status(409).json({ message: "Profile already exists for this account" });
    }

    // Initialize client entry securely if it doesn't exist
    await db.query(
      `INSERT INTO clients (user_id, loyalty_points)
       SELECT ?, 0
       FROM DUAL
       WHERE NOT EXISTS (
         SELECT 1 FROM clients WHERE user_id = ?
       )`,
      [userId, userId]
    );

    await sendEmail(
      email,
      "Welcome to Pet Paws 🐾",
      `Hi ${first_name},\nYour profile has been successfully created.\n
      \nYou can now access your account to manage your pets, book appointments, and view medical records anytime.
      \nIf you need any assistance, feel free to reach out to us.
      \n\n\nWarm regards,
      \nPetPaws Animal Hospital`
    );

    res.json({ message: "Profile created successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Retrieves the profile details for the currently authenticated user.
 */
exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const [rows] = await db.query(
      "SELECT * FROM user_profiles WHERE user_id = ?",
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json(rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Updates an existing user profile.
 */
exports.updateProfile = async (req, res) => {
  try {
    const { first_name, last_name, phone, city } = req.body;
    const userId = req.user.user_id;

    if (!first_name || !last_name || !phone || !city) {
      return res.status(400).json({ message: "All fields required" });
    }

    const [updateResult] = await db.query(
      `UPDATE user_profiles 
       SET first_name = ?, last_name = ?, phone = ?, city = ?
       WHERE user_id = ?`,
      [first_name, last_name, phone, city, userId]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json({ message: "Profile updated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};