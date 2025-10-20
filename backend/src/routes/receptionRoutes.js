const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const receptionController = require('../controllers/receptionController');

/**
 * Reception Desk Routes
 * Strictly locked to RECEPTIONIST role.
 * Interfaces for managing daily queues, live scheduling, and global patient lookups.
 */
router.use(authMiddleware, roleMiddleware('RECEPTIONIST'));

router.get('/dashboard', receptionController.getReceptionDashboard);
router.get('/appointments', receptionController.getReceptionAppointments);
router.post('/appointments', receptionController.createReceptionAppointment);
router.put('/appointments/:id', receptionController.updateReceptionAppointment);
router.delete('/appointments/:id', receptionController.cancelReceptionAppointment);

router.get('/queue', receptionController.getQueue);
router.put('/queue/reorder', receptionController.reorderQueue);
router.put('/queue/:appointment_id/emergency', receptionController.prioritizeEmergency);
router.put('/queue/:appointment_id/priority', receptionController.updatePriority);

router.get('/search', receptionController.searchClientsAndPets);

module.exports = router;
