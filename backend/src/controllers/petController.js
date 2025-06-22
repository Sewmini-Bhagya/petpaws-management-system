const db = require('../config/db');
const { logAction } = require('../utils/auditLogger');
const { sendEmail } = require('../utils/emailService');
const templates = require('../utils/emailTemplates');

/**
 * Registers a new pet profile associated with the authenticated user's client profile.
 */
exports.createPet = async (req, res) => {
  const userId = req.user.user_id;
  const { pet_name, date_of_birth, species, breed, gender, allergies } = req.body;
  try {
    if (new Date(date_of_birth) > new Date()) {
      return res.status(400).json({ message: 'Date of birth cannot be in the future' });
    }

    const [clients] = await db.query(
      'SELECT client_id FROM clients WHERE user_id = ?',
      [userId]
    );

    if (clients.length === 0) {
      return res.status(400).json({ message: 'Client profile not found' });
    }

    const clientId = clients[0].client_id;

    const [result] = await db.query(
      `INSERT INTO pets (client_id, pet_name, date_of_birth, species, breed, gender, allergies)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [clientId, pet_name, date_of_birth, species, breed, gender, allergies || ""]
    );

    const petId = result.insertId;

    await logAction(userId, "CREATE_PET", "pet", petId, null, req.body);

    try {
      const [userRows] = await db.query(
        `SELECT u.email, up.first_name 
         FROM users u
         LEFT JOIN user_profiles up ON up.user_id = u.user_id
         WHERE u.user_id = ?`,
        [userId]
      );

      if (userRows.length > 0) {
        const client = userRows[0];
        const { subject, text } = templates.getPetAdded(
          client.first_name || "there",
          pet_name,
          species,
          breed
        );
        await sendEmail(client.email, subject, text);
      }
    } catch (emailErr) {
      console.error("Pet Added email failed:", emailErr.message);
    }

    res.status(201).json({
      message: 'Pet created successfully',
      pet_id: petId
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Retrieves all pet profiles owned by the authenticated user.
 */
exports.getMyPets = async (req, res) => {
  const userId = req.user.user_id;

  try {
    const [pets] = await db.query(
      `SELECT p.* 
       FROM pets p
       JOIN clients c ON p.client_id = c.client_id
       WHERE c.user_id = ?`,
      [userId]
    );

    res.json(pets);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Retrieves a specific pet profile, ensuring the authenticated user is the owner.
 */
exports.getPetById = async (req, res) => {
  const userId = req.user.user_id;
  const petId = req.params.id;

  try {
    const [pets] = await db.query(
      `SELECT p.* 
       FROM pets p
       JOIN clients c ON p.client_id = c.client_id
       WHERE p.pet_id = ? AND c.user_id = ?`,
      [petId, userId]
    );

    if (pets.length === 0) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    res.json(pets[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Updates a pet's profile details. Limited to the pet's verified owner.
 */
exports.updatePet = async (req, res) => {
  const userId = req.user.user_id;
  const petId = req.params.id;
  const { pet_name, date_of_birth, species, breed, gender, allergies } = req.body;

  try {
    const [pets] = await db.query(
      `SELECT p.pet_id 
       FROM pets p
       JOIN clients c ON p.client_id = c.client_id
       WHERE p.pet_id = ? AND c.user_id = ?`,
      [petId, userId]
    );

    if (pets.length === 0) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await db.query(
      `UPDATE pets 
       SET pet_name=?, date_of_birth=?, species=?, breed=?, gender=?, allergies=? 
       WHERE pet_id=?`,
      [pet_name, date_of_birth, species, breed, gender, allergies, petId]
    );

    res.json({ message: 'Pet updated successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Hard deletes a pet profile from the system. Limited to the pet's verified owner.
 */
exports.deletePet = async (req, res) => {
  const userId = req.user.user_id;
  const petId = req.params.id;

  try {
    const [pets] = await db.query(
      `SELECT p.pet_id 
       FROM pets p
       JOIN clients c ON p.client_id = c.client_id
       WHERE p.pet_id = ? AND c.user_id = ?`,
      [petId, userId]
    );

    if (pets.length === 0) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await db.query(
      'DELETE FROM pets WHERE pet_id = ?',
      [petId]
    );

    res.json({ message: 'Pet deleted successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Associates a newly uploaded profile picture filename with a specific pet.
 */
exports.uploadPetImage = async (req, res) => {
  const petId = req.params.id;

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const imagePath = req.file.filename;

  try {
    await db.query(
      'UPDATE pets SET profile_picture = ? WHERE pet_id = ?',
      [imagePath, petId]
    );

    res.json({
      message: 'Image uploaded successfully',
      image: imagePath
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Upload failed' });
  }
};

/**
 * Aggregates a pet's complete medical history for the owner.
 * Includes appointments, diagnoses, prescriptions, and vaccinations with ownership verification.
 */
exports.getPetHistory = async (req, res) => {
  const userId = req.user.user_id;
  const petId = req.params.id;

  try {
    // 1. Verify Ownership
    const [pets] = await db.query(
      `SELECT p.pet_id, p.pet_name, p.species, p.breed, p.allergies, p.profile_picture
       FROM pets p
       JOIN clients c ON p.client_id = c.client_id
       WHERE p.pet_id = ? AND c.user_id = ?`,
      [petId, userId]
    );

    if (pets.length === 0) {
      return res.status(403).json({ message: 'Unauthorized access to medical records' });
    }

    const pet = pets[0];

    // 2. Fetch Appointments
    const [appointments] = await db.query(
      `SELECT a.*, GROUP_CONCAT(s.service_name) AS services
       FROM appointments a
       LEFT JOIN appointment_services aps ON aps.appointment_id = a.appointment_id
       LEFT JOIN services s ON s.service_id = aps.service_id
       WHERE a.pet_id = ?
       GROUP BY a.appointment_id
       ORDER BY a.appointment_start DESC`,
      [petId]
    );

    // 3. Fetch Diagnoses
    const [diagnoses] = await db.query(
      `SELECT d.* 
       FROM diagnoses d
       JOIN appointments a ON d.appointment_id = a.appointment_id
       WHERE a.pet_id = ?
       ORDER BY d.diagnosed_at DESC`,
      [petId]
    );

    // 4. Fetch Prescriptions
    const [prescriptions] = await db.query(
      `SELECT p.* 
       FROM prescriptions p
       JOIN appointments a ON p.appointment_id = a.appointment_id
       WHERE a.pet_id = ?
       ORDER BY p.prescribed_at DESC`,
      [petId]
    );

    // 5. Fetch Vaccinations
    const [vaccinations] = await db.query(
      "SELECT * FROM vaccinations WHERE pet_id = ? ORDER BY vaccination_date DESC",
      [petId]
    );

    res.json({
      pet,
      past_appointments: appointments,
      diagnoses,
      prescriptions,
      vaccinations
    });

  } catch (error) {
    console.error("[PetController] History fetch failed:", error);
    res.status(500).json({ message: 'Server error' });
  }
};