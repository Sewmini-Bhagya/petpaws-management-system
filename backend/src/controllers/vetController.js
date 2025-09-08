const db = require('../config/db');
const { logAction } = require('../utils/auditLogger');

/**
 * Utility to resolve a vet's internal ID from their auth user ID.
 */
const findVetIdByUserId = async (userId, conn = db) => {
  const [rows] = await conn.query(
    'SELECT vet_id FROM veterinarians WHERE user_id = ? LIMIT 1',
    [userId]
  );
  return rows[0]?.vet_id || null;
};

/**
 * Base query fragment for fetching comprehensive appointment details assigned to a specific vet.
 */
const getAssignedAppointmentBaseQuery = () => `
  SELECT
    a.appointment_id,
    a.pet_id,
    a.client_id,
    a.appointment_start,
    a.appointment_end,
    a.status_id,

    ANY_VALUE(p.pet_name) AS pet_name,
    ANY_VALUE(p.species) AS species,
    ANY_VALUE(p.breed) AS breed,

    ANY_VALUE(u.email) AS client_email,

    ANY_VALUE(CONCAT(
      COALESCE(up.first_name, ''), ' ', COALESCE(up.last_name, '')
    )) AS client_name,

    GROUP_CONCAT(DISTINCT s.service_name ORDER BY s.service_name SEPARATOR ', ') AS services

  FROM appointment_assignments aa
  JOIN appointments a ON aa.appointment_id = a.appointment_id
  JOIN pets p ON p.pet_id = a.pet_id
  JOIN clients c ON c.client_id = a.client_id
  LEFT JOIN users u ON u.user_id = c.user_id
  LEFT JOIN user_profiles up ON up.user_id = c.user_id
  LEFT JOIN appointment_services aps ON aps.appointment_id = a.appointment_id
  LEFT JOIN services s ON s.service_id = aps.service_id

  WHERE aa.vet_id = ?
`;

/**
 * Retrieves the vet's assigned appointments scheduled for the current date.
 */
exports.getVetDashboard = async (req, res) => {
  try {
    const vetId = await findVetIdByUserId(req.user.user_id);
    if (!vetId) return res.status(404).json({ message: 'Vet not found' });

    const [rows] = await db.query(
      `${getAssignedAppointmentBaseQuery()}
       AND DATE(a.appointment_start) = CURDATE()
       GROUP BY a.appointment_id
       ORDER BY a.appointment_start ASC`,
      [vetId]
    );

    res.json({ todayAppointments: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Retrieves all historical and future appointments assigned to the vet.
 */
exports.getVetAppointments = async (req, res) => {
  try {
    const vetId = await findVetIdByUserId(req.user.user_id);
    if (!vetId) return res.status(404).json({ message: 'Vet not found' });

    const [rows] = await db.query(
      `${getAssignedAppointmentBaseQuery()}
       GROUP BY a.appointment_id
       ORDER BY a.appointment_start DESC`,
      [vetId]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Retrieves the vet's schedule, ordered chronologically.
 */
exports.getVetSchedule = async (req, res) => {
  try {
    const vetId = await findVetIdByUserId(req.user.user_id);
    if (!vetId) return res.status(404).json({ message: 'Vet not found' });

    const [rows] = await db.query(
      `${getAssignedAppointmentBaseQuery()}
       GROUP BY a.appointment_id
       ORDER BY a.appointment_start ASC`,
      [vetId]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Aggregates a pet's complete medical history including appointments, diagnoses, prescriptions, and vaccinations.
 */
exports.getPetMedicalHistory = async (req, res) => {
  const petId = Number(req.params.pet_id);

  if (!Number.isInteger(petId)) {
    return res.status(400).json({ message: 'Invalid pet id' });
  }

  try {
    const [pet] = await db.query(`
      SELECT 
        p.pet_id,
        p.pet_name,
        p.species,
        p.breed,
        p.allergies,
        p.profile_picture,

        ANY_VALUE(u.email) AS owner_email,
        ANY_VALUE(CONCAT(
          COALESCE(up.first_name,''),' ',COALESCE(up.last_name,'')
        )) AS owner_name

      FROM pets p
      JOIN clients c ON c.client_id = p.client_id
      LEFT JOIN users u ON u.user_id = c.user_id
      LEFT JOIN user_profiles up ON up.user_id = c.user_id

      WHERE p.pet_id = ?
      GROUP BY p.pet_id
    `, [petId]);

    if (!pet.length) return res.status(404).json({ message: "Pet not found" });

    const [appointments] = await db.query(`
      SELECT a.*, GROUP_CONCAT(s.service_name) AS services
      FROM appointments a
      LEFT JOIN appointment_services aps ON aps.appointment_id = a.appointment_id
      LEFT JOIN services s ON s.service_id = aps.service_id
      WHERE a.pet_id = ?
      GROUP BY a.appointment_id
      ORDER BY a.appointment_start DESC
    `, [petId]);

    const [diagnoses] = await db.query(
      `SELECT d.* 
       FROM diagnoses d
       JOIN appointments a ON d.appointment_id = a.appointment_id
       WHERE a.pet_id = ?
       ORDER BY d.diagnosed_at DESC`,
      [petId]
    );

    const [prescriptions] = await db.query(
      `SELECT p.* 
       FROM prescriptions p
       JOIN appointments a ON p.appointment_id = a.appointment_id
       WHERE a.pet_id = ?
       ORDER BY p.prescribed_at DESC`,
      [petId]
    );

    const [vaccinations] = await db.query(
      "SELECT * FROM vaccinations WHERE pet_id = ? ORDER BY vaccination_date DESC",
      [petId]
    );

    res.json({
      pet: pet[0],
      past_appointments: appointments,
      diagnoses,
      prescriptions,
      vaccinations
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Records a medical diagnosis for a specific appointment and triggers an audit log.
 */
exports.addDiagnosis = async (req, res) => {
  const appointmentId = Number(req.params.id);
  const { diagnosis } = req.body;
  const userId = req.user.user_id;

  if (!appointmentId || !diagnosis) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    await db.query(
      `INSERT INTO diagnoses (appointment_id, diagnosis, diagnosed_at)
       VALUES (?, ?, NOW())`,
      [appointmentId, diagnosis]
    );

    await logAction(userId, "ADD_DIAGNOSIS", "appointment", appointmentId, null, { diagnosis });

    res.json({ message: "Diagnosis added" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Records a prescription, deducts the specified quantity from inventory, and logs the action.
 * Fails if the requested medication is out of stock.
 */
exports.addPrescription = async (req, res) => {
  const appointmentId = Number(req.params.id);
  const { medication_name, quantity } = req.body;
  const userId = req.user.user_id;

  if (!appointmentId || !medication_name || !quantity) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    const [items] = await db.query(
      `SELECT ii.inventory_item_id, ii.item_name, ii.selling_price, s.quantity_available
       FROM inventory_items ii
       JOIN inventory_stock s ON s.inventory_item_id = ii.inventory_item_id
       WHERE ii.item_name LIKE ?
       LIMIT 1`,
      [`%${medication_name}%`]
    );

    if (!items.length) {
      return res.status(404).json({ message: "Medication not found" });
    }

    const item = items[0];

    if (item.quantity_available < quantity) {
      return res.status(400).json({ message: "Out of stock" });
    }

    await db.query(
      `UPDATE inventory_stock
       SET quantity_available = quantity_available - ?
       WHERE inventory_item_id = ?`,
      [quantity, item.inventory_item_id]
    );

    await db.query(
      `INSERT INTO prescriptions (appointment_id, inventory_item_id, medication_name, quantity, unit_price, prescribed_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [appointmentId, item.inventory_item_id, item.item_name, quantity, item.selling_price]
    );

    await logAction(userId, "ADD_PRESCRIPTION", "appointment", appointmentId, null, { item_name: item.item_name, quantity });

    res.json({ message: "Prescription added" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};