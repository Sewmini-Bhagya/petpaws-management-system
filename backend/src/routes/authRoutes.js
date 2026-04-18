const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const authController = require('../controllers/authController');

// AUTH ROUTES
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);

// PASSWORD RESET
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// GET CURRENT USER
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;