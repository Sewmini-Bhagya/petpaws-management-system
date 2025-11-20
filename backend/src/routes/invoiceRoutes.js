const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');

const {
  generateInvoice,
  generateWalkInInvoice,
  getInvoice,
  getPrintableInvoice
} = require('../controllers/invoiceController');

/**
 * Financial Invoicing Routes
 * Endpoints for generating bills, either from booked appointments or walk-in product sales.
 */
router.use(authMiddleware);

router.post('/generate/:appointment_id', generateInvoice);
router.get('/:invoice_id/print', getPrintableInvoice);
router.get('/:invoice_id', getInvoice);
router.post('/walk-in', generateWalkInInvoice);

module.exports = router;