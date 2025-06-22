const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const clientController = require("../controllers/clientController");

/**
 * Client Portal Routes
 * Serves dashboard aggregations and notification feeds for authenticated clients.
 */
router.use(authMiddleware);

router.get("/dashboard", clientController.getDashboard);
router.get("/notifications", clientController.getNotifications);
router.put("/notifications/:id/read", clientController.markNotificationRead);

module.exports = router;