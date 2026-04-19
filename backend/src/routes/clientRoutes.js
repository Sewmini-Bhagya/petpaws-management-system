const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const clientController = require("../controllers/clientController");

router.get("/dashboard", authMiddleware, clientController.getDashboard);

module.exports = router;