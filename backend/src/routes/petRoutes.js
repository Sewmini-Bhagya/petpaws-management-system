const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const petController = require('../controllers/petController');

// CREATE PET
router.post('/', authMiddleware, petController.createPet);

// GET ALL PETS (for logged-in client)
router.get('/', authMiddleware, petController.getMyPets);

// GET SINGLE PET
router.get('/:id', authMiddleware, petController.getPetById);

// UPDATE PET
router.put('/:id', authMiddleware, petController.updatePet);

// DELETE PET
router.delete('/:id', authMiddleware, petController.deletePet);

module.exports = router;