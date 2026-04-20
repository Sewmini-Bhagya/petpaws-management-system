const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const {
  addPayment,
  payhereInit,
  payhereNotify
} = require('../controllers/paymentController');


router.post('/payhere/notify', payhereNotify);

router.post('/payhere/:invoice_id', authMiddleware, payhereInit);
router.post('/:invoice_id', authMiddleware, addPayment);



module.exports = router;