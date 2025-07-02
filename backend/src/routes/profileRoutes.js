const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const profileController = require("../controllers/profileController");

/**
 * User Profile Routes
 * Endpoints for managing the detailed profile information linked to user accounts.
 */
router.use(authMiddleware);

router.post("/", profileController.createProfile);
router.get("/me", profileController.getMyProfile);
router.put("/", profileController.updateProfile);

module.exports = router;