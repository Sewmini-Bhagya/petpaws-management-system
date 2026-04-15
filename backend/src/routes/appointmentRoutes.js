const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const {
  createAppointment,
  getMyAppointments,
  addPerformedService
} = require('../controllers/appointmentController');

// create appointment
router.post('/', authMiddleware, createAppointment);

// get user's appointments
router.get('/', authMiddleware, getMyAppointments);

// add performed services
router.post('/:appointment_id/add-service', authMiddleware, addPerformedService);

module.exports = router;