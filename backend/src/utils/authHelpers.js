const db = require('../config/db');

/**
 * Retrieves the normalized role name for a given user ID.
 * Resolves against the roles lookup table.
 * 
 * @param {number} userId - The unique identifier of the user.
 * @param {import('mysql2/promise').Connection} conn - Database connection/pool.
 * @returns {Promise<string|null>} The user's role name, or null if not found.
 */
const getRoleName = async (userId, conn = db) => {
  const [rows] = await conn.query(
    `SELECT r.role_name
     FROM users u
     JOIN roles r ON u.role_id = r.role_id
     WHERE u.user_id = ?`,
    [userId]
  );

  return rows.length ? rows[0].role_name : null;
};

module.exports = {
  getRoleName
};
