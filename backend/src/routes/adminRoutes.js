const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const { createUser, getAdminDashboard } = require('../controllers/adminController');

// Only ADMIN can access
router.post('/create-user', authMiddleware, roleMiddleware('ADMIN'), createUser);

router.get("/dashboard", authMiddleware, roleMiddleware('ADMIN'), getAdminDashboard);

module.exports = router;