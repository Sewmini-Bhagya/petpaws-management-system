const db = require('../config/db');
const bcrypt = require('bcrypt');

/**
 * Creates a new user account and initializes role-specific profiles.
 */
exports.createUser = async (req, res) => {
  const { email, password, role_name, specialization, license_number } = req.body;

  try {
    const [existing] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const [roles] = await db.query(
      'SELECT role_id FROM roles WHERE role_name = ?',
      [role_name]
    );

    if (roles.length === 0) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const roleId = roles[0].role_id;
    const hashedPassword = await bcrypt.hash(password, 10);

    const [userResult] = await db.query(
      'INSERT INTO users (email, password_hash, role_id, status) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, roleId, 'ACTIVE']
    );

    const userId = userResult.insertId;

    // Parse email prefix to seed a human-readable default profile
    const namePart = email.split("@")[0];
    const nameWords = namePart.split(/[._-]/);
    const firstName = nameWords[0] ? nameWords[0].charAt(0).toUpperCase() + nameWords[0].slice(1) : "Staff";
    const lastName = nameWords[1] ? nameWords[1].charAt(0).toUpperCase() + nameWords[1].slice(1) : `(${role_name})`;

    await db.query(
      "INSERT INTO user_profiles (user_id, first_name, last_name, phone, city) VALUES (?, ?, ?, 'N/A', 'N/A')",
      [userId, firstName, lastName]
    );

    // Vets and Receptionists require separate tables for specific metadata
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

/**
 * Aggregates core system metrics and fetches active announcements/feedback.
 */
exports.getAdminDashboard = async (req, res) => {
  try {
    const [announcements] = await db.query(`
      SELECT announcement_id, title, content, created_at
      FROM announcements
      WHERE is_active = 1
      ORDER BY created_at DESC
      LIMIT 10
    `);

    const [feedback] = await db.query(`
      SELECT f.feedback_id, f.rating, f.comments, f.created_at, u.email
      FROM feedback f
      JOIN clients c ON f.client_id = c.client_id
      JOIN users u ON c.user_id = u.user_id
      ORDER BY f.created_at DESC
      LIMIT 5
    `);

    const [revenueRows] = await db.query("SELECT SUM(total_amount) AS total FROM invoices WHERE status = 'PAID'");
    const [appointmentRows] = await db.query("SELECT COUNT(*) AS count FROM appointments");
    const [serviceRows] = await db.query("SELECT COUNT(*) AS count FROM services");
    const [stockRows] = await db.query("SELECT SUM(quantity_available) AS total FROM inventory_stock");
    const [visitRows] = await db.query("SELECT COUNT(*) AS count FROM appointments WHERE status = 'COMPLETED'");

    res.json({
      announcements,
      feedback,
      revenue: revenueRows[0]?.total || 0,
      appointments: appointmentRows[0]?.count || 0,
      services: serviceRows[0]?.count || 0,
      stock: stockRows[0]?.total || 0,
      visits: visitRows[0]?.count || 0
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Creates a new system-wide announcement.
 */
exports.createAnnouncement = async (req, res) => {
  const { title, content } = req.body;
  if (!title) return res.status(400).json({ message: "Title is required" });

  try {
    await db.query(
      "INSERT INTO announcements (title, content) VALUES (?, ?)",
      [title, content || ""]
    );
    res.status(201).json({ message: "Announcement created" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Soft deletes an announcement.
 */
exports.deleteAnnouncement = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("UPDATE announcements SET is_active = 0 WHERE announcement_id = ?", [id]);
    res.json({ message: "Announcement removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Retrieves all non-deleted users along with their roles.
 */
exports.getAllUsers = async (req, res) => {
  try {
    // 1. Identify existing users missing profile records
    const [noProfileUsers] = await db.query(`
      SELECT u.user_id, u.email, r.role_name
      FROM users u
      JOIN roles r ON u.role_id = r.role_id
      LEFT JOIN user_profiles up ON up.user_id = u.user_id
      WHERE up.user_id IS NULL AND u.deleted_at IS NULL
    `);

    // 2. Proactively seed default profile names from email prefixes
    for (const u of noProfileUsers) {
      const namePart = u.email.split("@")[0];
      const nameWords = namePart.split(/[._-]/);
      const firstName = nameWords[0] ? nameWords[0].charAt(0).toUpperCase() + nameWords[0].slice(1) : "Staff";
      const lastName = nameWords[1] ? nameWords[1].charAt(0).toUpperCase() + nameWords[1].slice(1) : `(${u.role_name})`;

      await db.query(
        "INSERT INTO user_profiles (user_id, first_name, last_name, phone, city) VALUES (?, ?, ?, 'N/A', 'N/A')",
        [u.user_id, firstName, lastName]
      );
    }

    // 3. Return the fully populated list containing all human names
    const [users] = await db.query(`
      SELECT u.user_id, u.email, u.status, r.role_name, up.first_name, up.last_name, u.created_at
      FROM users u
      JOIN roles r ON u.role_id = r.role_id
      LEFT JOIN user_profiles up ON up.user_id = u.user_id
      WHERE u.deleted_at IS NULL
      ORDER BY u.user_id DESC
    `);

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Soft deletes a user by marking them INACTIVE.
 */
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query(
      "UPDATE users SET deleted_at = NOW(), status = 'INACTIVE' WHERE user_id = ?",
      [id]
    );
    res.json({ message: "User deleted (soft)" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Updates a user's role and ensures their role-specific profile exists.
 */
exports.updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role_name } = req.body;

  try {
    const [roles] = await db.query("SELECT role_id FROM roles WHERE role_name = ?", [role_name]);
    if (!roles.length) return res.status(400).json({ message: "Invalid role" });
    const roleId = roles[0].role_id;

    await db.query("UPDATE users SET role_id = ? WHERE user_id = ?", [roleId, id]);

    // Ensure role-specific tables are initialized when switching roles
    if (role_name === 'VET') {
      const [vets] = await db.query("SELECT vet_id FROM veterinarians WHERE user_id = ?", [id]);
      if (!vets.length) {
        await db.query("INSERT INTO veterinarians (user_id, specialization) VALUES (?, 'General')", [id]);
      }
    } else if (role_name === 'RECEPTIONIST') {
      const [receps] = await db.query("SELECT receptionist_id FROM receptionists WHERE user_id = ?", [id]);
      if (!receps.length) {
        await db.query("INSERT INTO receptionists (user_id) VALUES (?)", [id]);
      }
    }

    res.json({ message: `User role updated to ${role_name}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Retrieves all available roles.
 */
exports.getRoles = async (req, res) => {
  try {
    const [roles] = await db.query("SELECT role_id, role_name FROM roles");
    res.json(roles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Retrieves all permissions and their current mapping to roles.
 */
exports.getPermissionsMatrix = async (req, res) => {
  try {
    const [allPermissions] = await db.query("SELECT * FROM permissions");
    const [roleMappings] = await db.query("SELECT * FROM role_permissions");

    res.json({
      allPermissions,
      roleMappings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Toggles a specific permission for a role.
 */
exports.toggleRolePermission = async (req, res) => {
  const { role_id, permission_id } = req.body;

  try {
    const [existing] = await db.query(
      "SELECT * FROM role_permissions WHERE role_id = ? AND permission_id = ?",
      [role_id, permission_id]
    );

    if (existing.length > 0) {
      await db.query(
        "DELETE FROM role_permissions WHERE role_id = ? AND permission_id = ?",
        [role_id, permission_id]
      );
      res.json({ message: "Permission removed from role" });
    } else {
      await db.query(
        "INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)",
        [role_id, permission_id]
      );
      res.json({ message: "Permission added to role" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Retrieves all registered clients and their loyalty points balances.
 */
exports.getLoyaltyMembers = async (req, res) => {
  try {
    const [members] = await db.query(`
      SELECT c.client_id, c.user_id, c.loyalty_points, up.first_name, up.last_name, u.email
      FROM clients c
      JOIN users u ON c.user_id = u.user_id
      LEFT JOIN user_profiles up ON up.user_id = u.user_id
      WHERE u.deleted_at IS NULL
      ORDER BY c.loyalty_points DESC
    `);
    res.json(members);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Adjusts a client's loyalty points balance in the database.
 */
exports.adjustLoyaltyPoints = async (req, res) => {
  const { id } = req.params; // client_id
  const { loyalty_points } = req.body;

  if (loyalty_points === undefined || isNaN(Number(loyalty_points))) {
    return res.status(400).json({ message: "Valid points balance is required" });
  }

  try {
    await db.query(
      "UPDATE clients SET loyalty_points = ? WHERE client_id = ?",
      [Number(loyalty_points), id]
    );
    res.json({ message: "Loyalty points balance updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};