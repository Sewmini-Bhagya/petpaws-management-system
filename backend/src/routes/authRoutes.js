const express = require('express');
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const authController = require('../controllers/authController');

const {
  registerUser,
  loginUser
} = require('../controllers/authController');

router.get("/me", authMiddleware, (req, res) => {
  res.json(req.user);
});

router.post('/register', registerUser);
router.post('/login', loginUser);

router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

module.exports = router;