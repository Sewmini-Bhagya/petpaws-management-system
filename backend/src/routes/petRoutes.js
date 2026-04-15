const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const { createPet, getMyPets } = require('../controllers/petController');

// Create pet
router.post('/', authMiddleware, createPet);

// Get logged-in user's pets
router.get('/my', authMiddleware, getMyPets);

module.exports = router;