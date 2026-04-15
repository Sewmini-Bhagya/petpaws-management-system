const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../config/multer');

const {
  uploadDocument,
  getPetDocuments
} = require('../controllers/documentController');

// Upload document
router.post(
  '/:petId',
  authMiddleware,
  upload.single('file'),
  uploadDocument
);

// Get documents
router.get('/:petId', authMiddleware, getPetDocuments);

module.exports = router;