const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const vetController = require('../controllers/vetController');

/**
 * Veterinarian Routes
 * Locked to VET role. Provides clinical interfaces for patient history and diagnosis.
 */
router.use(authMiddleware, roleMiddleware('VET'));

router.get('/dashboard', vetController.getVetDashboard);
router.get('/appointments', vetController.getVetAppointments);
router.get('/schedule', vetController.getVetSchedule);
router.get('/pets/:pet_id', vetController.getPetMedicalHistory);
router.post('/appointments/:id/diagnosis', vetController.addDiagnosis);

module.exports = router;
