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

/**
 * Inventory Management Routes
 * Strictly locked to administrative and reception staff.
 * Manages supply chain, stock levels, and alert thresholds.
 */
router.use(authMiddleware, roleMiddleware('ADMIN', 'RECEPTIONIST'));

router.get('/', getAllInventoryItems);
router.post('/', addInventoryItem);
router.put('/:id/stock', updateInventoryStock);
router.post('/:id/prescribe', prescribeMedicationStock);
router.get('/low-stock', getLowStockItems);
router.get('/expiry-alerts', getExpiryAlerts);
router.delete('/:id', deleteInventoryItem);

module.exports = router;
