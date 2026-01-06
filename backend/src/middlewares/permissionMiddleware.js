const db = require('../config/db');

/**
 * Validates if the authenticated user's role possesses a specific granular permission.
 * Bypasses checks entirely for users possessing the 'ADMIN' role.
 * 
 * @param {string} requiredPermission - The name of the required permission (e.g., 'MANAGE_USERS').
 */
const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const { role_id } = req.user;

      const [roleRows] = await db.query(
        "SELECT role_name FROM roles WHERE role_id = ?",
        [role_id]
      );

      if (roleRows.length === 0) {
        return res.status(404).json({ message: "Role not found" });
      }

      const roleName = roleRows[0].role_name;

      if (roleName === 'ADMIN') {
        return next();
      }

      const [rows] = await db.query(
        `SELECT p.permission_name
         FROM permissions p
         JOIN role_permissions rp ON p.permission_id = rp.permission_id
         WHERE rp.role_id = ? AND p.permission_name = ?`,
        [role_id, requiredPermission]
      );

      if (rows.length === 0) {
        return res.status(403).json({ 
          message: 'Access Denied: You do not have the required permission for this action.',
          permission_required: requiredPermission
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ message: 'Server error during authorization.' });
    }
  };
};

module.exports = { checkPermission };
