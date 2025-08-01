const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const appointmentController = require('../controllers/appointmentController');
const { createAppointment, getMyAppointments, addPerformedService } = require('../controllers/appointmentController');

/**
 * Appointment Management Routes
 * Endpoints for clients to book/view appointments, and for staff to append services.
 * All endpoints require authentication.
 */
router.use(authMiddleware);

router.post('/', createAppointment);
router.get('/', getMyAppointments);
router.get("/available-slots", appointmentController.getAvailableSlots);
router.post('/:appointment_id/add-service', addPerformedService);

module.exports = router;