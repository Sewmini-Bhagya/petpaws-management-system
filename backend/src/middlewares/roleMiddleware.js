const db = require('../config/db');

const roleMiddleware = (requiredRole) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.user_id;

      const [rows] = await db.promise().query(
        `SELECT roles.role_name 
         FROM users 
         JOIN roles ON users.role_id = roles.role_id 
         WHERE users.user_id = ?`,
        [userId]
      );

      if (rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      const userRole = rows[0].role_name;

      if (userRole !== requiredRole) {
        return res.status(403).json({ message: 'Access denied' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };
};

module.exports = roleMiddleware;