const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const { generateInvoice } = require('../controllers/invoiceController');

router.post('/generate/:appointment_id', authMiddleware, generateInvoice);

module.exports = router;