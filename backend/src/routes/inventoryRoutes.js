const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const {
  getAllInventoryItems,
  addInventoryItem,
  updateInventoryStock,
  prescribeMedicationStock,
  getLowStockItems,
  getExpiryAlerts,
  deleteInventoryItem
} = require('../controllers/inventoryController');

// All inventory routes: authenticated ADMIN only
router.use(authMiddleware, roleMiddleware('ADMIN'));

router.get('/', getAllInventoryItems);
router.post('/', addInventoryItem);
router.put('/:id/stock', updateInventoryStock);
router.post('/:id/prescribe', prescribeMedicationStock);
router.get('/low-stock', getLowStockItems);
router.get('/expiry-alerts', getExpiryAlerts);
router.delete('/:id', deleteInventoryItem);

module.exports = router;
