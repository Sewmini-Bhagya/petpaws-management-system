const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", async (req, res) => {
  try {
    const [services] = await db.query("SELECT * FROM services");
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;