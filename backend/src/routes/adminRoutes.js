const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const { 
  createUser, 
  getAdminDashboard, 
  getAllUsers, 
  getRoles, 
  updateUserRole, 
  deleteUser, 
  getPermissionsMatrix, 
  toggleRolePermission,
  getLoyaltyMembers,
  adjustLoyaltyPoints
} = require('../controllers/adminController');

/**
 * Global Admin Route Configuration
 * All routes require valid authentication and the 'ADMIN' role.
 */
router.use(authMiddleware, roleMiddleware('ADMIN'));

router.post('/create-user', createUser);
router.get("/dashboard", getAdminDashboard);
router.get("/users", getAllUsers);
router.get('/roles', getRoles);
router.get('/permissions-matrix', getPermissionsMatrix);
router.post('/toggle-permission', toggleRolePermission);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Loyalty Management endpoints
router.get('/loyalty', getLoyaltyMembers);
router.put('/loyalty/:id', adjustLoyaltyPoints);

module.exports = router;