const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/pets/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

const authMiddleware = require('../middlewares/authMiddleware');
const petController = require('../controllers/petController');

/**
 * Pet Profile Routes
 * Handles the CRUD operations for pet entities owned by clients.
 * Includes profile picture upload endpoints.
 */
router.use(authMiddleware);

router.post('/', petController.createPet);
router.get('/', petController.getMyPets);
router.get('/:id', petController.getPetById);
router.put('/:id', petController.updatePet);
router.delete('/:id', petController.deletePet);

router.post('/:id/upload', upload.single('image'), petController.uploadPetImage);
router.get('/:id/history', petController.getPetHistory);

module.exports = router;