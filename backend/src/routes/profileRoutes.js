const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const profileController = require("../controllers/profileController");

// CREATE PROFILE
router.post("/", authMiddleware, profileController.createProfile);

// GET MY PROFILE
router.get("/me", authMiddleware, profileController.getMyProfile);

module.exports = router;