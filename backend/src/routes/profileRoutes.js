const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");

// TEMP FAKE STORAGE (we'll replace later with DB)
let profiles = [];

// CREATE PROFILE
router.post("/", authMiddleware, (req, res) => {
  const { firstName, phone } = req.body;

  const profile = {
    userId: req.user.id,
    firstName,
    phone,
  };

  profiles.push(profile);

  res.json(profile);
});

// GET MY PROFILE
router.get("/me", authMiddleware, (req, res) => {
  const profile = profiles.find(
    (p) => p.userId === req.user.id
  );

  if (!profile) {
    return res.status(404).json({ message: "Profile not found" });
  }

  res.json(profile);
});

module.exports = router;