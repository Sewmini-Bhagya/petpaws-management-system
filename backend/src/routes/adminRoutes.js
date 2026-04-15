const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const { createUser } = require('../controllers/adminController');

// Only ADMIN can access
router.post(
  '/create-user',
  authMiddleware,
  roleMiddleware('ADMIN'),
  createUser
);

module.exports = router;