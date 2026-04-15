const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const {
  createPet,
  getMyPets,
  updatePet,
  deletePet,
  getPetById
} = require('../controllers/petController');

router.post('/', authMiddleware, createPet);
router.get('/my', authMiddleware, getMyPets);
router.get('/:id', authMiddleware, getPetById);
router.put('/:id', authMiddleware, updatePet);
router.delete('/:id', authMiddleware, deletePet);

module.exports = router;