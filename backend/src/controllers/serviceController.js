const db = require("../config/db");

/**
 * Retrieves the catalog of clinical and grooming services offered by the hospital.
 */
exports.getAllServices = async (req, res) => {
  try {
    const [services] = await db.query("SELECT * FROM services");
    res.json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Creates a new clinical or care service.
 */
exports.addService = async (req, res) => {
  try {
    const { service_name, price, duration, category } = req.body;
    if (!service_name || price === undefined || !duration) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const [result] = await db.query(
      "INSERT INTO services (service_name, price, duration, category) VALUES (?, ?, ?, ?)",
      [service_name, price, duration, category || "Medical"]
    );
    res.status(201).json({ message: "Service created successfully", service_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Modifies an existing service's description, pricing, or duration.
 */
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { service_name, price, duration, category } = req.body;
    if (!service_name || price === undefined || !duration) {
      return res.status(400).json({ message: "All fields are required" });
    }
    await db.query(
      "UPDATE services SET service_name = ?, price = ?, duration = ?, category = ? WHERE service_id = ?",
      [service_name, price, duration, category || "Medical", id]
    );
    res.json({ message: "Service updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Removes a service from the active clinic catalogue.
 */
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM services WHERE service_id = ?", [id]);
    res.json({ message: "Service deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
