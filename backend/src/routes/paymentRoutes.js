const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const {
  addPayment
} = require('../controllers/paymentController');

/**
 * Payment Processing Routes
 * Note: Third-party integrations (like PayHere) have been removed.
 * Currently handles internal staff recording manual payments against invoices.
 */
router.use(authMiddleware);

router.post('/:invoice_id', addPayment);

module.exports = router;