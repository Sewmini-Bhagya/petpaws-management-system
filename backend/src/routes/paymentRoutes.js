const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const { addPayment } = require('../controllers/paymentController');

router.post('/:invoice_id', authMiddleware, addPayment);

module.exports = router;