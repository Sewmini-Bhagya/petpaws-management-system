const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const { generateInvoice } = require('../controllers/invoiceController');
const { getInvoice } = require('../controllers/invoiceController');

router.post('/generate/:appointment_id', authMiddleware, generateInvoice);
router.get('/:invoice_id', authMiddleware, getInvoice);

module.exports = router;