const express = require('express');
const router = express.Router();

const { payhereInit } = require('../controllers/paymentController');
const authMiddleware = require('../middlewares/authMiddleware');
const { addPayment } = require('../controllers/paymentController');
const paymentController = require('../controllers/paymentController');


router.post('/payhere/notify', paymentController.payhereNotify);

router.post('/payhere/:invoice_id', authMiddleware, payhereInit);
router.post('/:invoice_id', authMiddleware, addPayment);



module.exports = router;