const db = require("../config/db");
const { sendEmail } = require("../utils/emailService");

exports.createProfile = async (req, res) => {
  try {
    const { first_name, last_name, phone, city } = req.body;

    if (!first_name || !last_name || !phone || !city) {
      return res.status(400).json({ message: "All fields required" });
    }

    const userId = req.user.user_id; 

    // get user email
    const [userRows] = await db.query(
      "SELECT email FROM users WHERE user_id = ?",
      [userId]
    );

    const email = userRows[0].email;

    // insert profile
    const [result] = await db.query(
        "INSERT INTO user_profiles (user_id, first_name, last_name, phone, city) VALUES (?, ?, ?, ?, ?)",
        [userId, first_name, last_name, phone, city]
    );

    // send email
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