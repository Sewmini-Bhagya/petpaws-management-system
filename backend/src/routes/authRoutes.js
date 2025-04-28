const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const authController = require('../controllers/authController');

/**
 * Authentication & Identity Routes
 * Handles public-facing login/registration, password resets, and identity verification.
 */

// Public Auth Endpoints
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);

// Password Reset Flow
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected Identity Endpoint
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;