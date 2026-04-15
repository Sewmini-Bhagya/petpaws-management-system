const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const {
  createAppointment,
  getMyAppointments
} = require('../controllers/appointmentController');

// create appointment
router.post('/', authMiddleware, createAppointment);

// get user's appointments
router.get('/', authMiddleware, getMyAppointments);

module.exports = router;