const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../config/multer');

const {
  uploadDocument,
  getPetDocuments
} = require('../controllers/documentController');

/**
 * Pet Medical Document Routes
 * Handles file uploads and retrievals for pet documents.
 * All endpoints require authentication and are validated against pet ownership internally.
 */
router.use(authMiddleware);

router.post('/:petId', upload.single('file'), uploadDocument);
router.get('/:petId', getPetDocuments);

module.exports = router;