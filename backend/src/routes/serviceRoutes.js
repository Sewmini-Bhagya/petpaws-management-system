const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const serviceController = require("../controllers/serviceController");

/**
 * Service Catalog Routes
 * Public or authenticated access to the hospital's available services.
 */
router.get("/", serviceController.getAllServices);

// Administrator service modification endpoints
router.post("/", authMiddleware, roleMiddleware("ADMIN"), serviceController.addService);
router.put("/:id", authMiddleware, roleMiddleware("ADMIN"), serviceController.updateService);
router.delete("/:id", authMiddleware, roleMiddleware("ADMIN"), serviceController.deleteService);

module.exports = router;