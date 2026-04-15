const db = require('../config/db');

// CREATE PET
exports.createPet = async (req, res) => {
  const { pet_name, date_of_birth, species, breed, gender } = req.body;
  const userId = req.user.user_id;

  try {
    // Get client_id from user_id
    const [clients] = await db.promise().query(
      'SELECT client_id FROM clients WHERE user_id = ?',
      [userId]
    );

    if (clients.length === 0) {
      return res.status(400).json({ message: 'Client profile not found' });
    }

    const clientId = clients[0].client_id;

    // Insert pet
    await db.promise().query(
      `INSERT INTO pets (client_id, pet_name, date_of_birth, species, breed, gender)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [clientId, pet_name, date_of_birth, species, breed, gender]
    );

    res.status(201).json({ message: 'Pet created successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


// GET MY PETS
exports.getMyPets = async (req, res) => {
  const userId = req.user.user_id;

  try {
    const [pets] = await db.promise().query(
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



// GET SINGLE PET

exports.getPetById = async (req, res) => {
  const userId = req.user.user_id;
  const petId = req.params.id;

  try {
    const [pets] = await db.promise().query(
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



// UPDATE PET

exports.updatePet = async (req, res) => {
  const userId = req.user.user_id;
  const petId = req.params.id;
  const { pet_name, date_of_birth, species, breed, gender } = req.body;

  try {
    // Check ownership
    const [pets] = await db.promise().query(
      `SELECT p.pet_id 
       FROM pets p
       JOIN clients c ON p.client_id = c.client_id
       WHERE p.pet_id = ? AND c.user_id = ?`,
      [petId, userId]
    );

    if (pets.length === 0) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Update
    await db.promise().query(
      `UPDATE pets 
       SET pet_name=?, date_of_birth=?, species=?, breed=?, gender=? 
       WHERE pet_id=?`,
      [pet_name, date_of_birth, species, breed, gender, petId]
    );

    res.json({ message: 'Pet updated successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};



// DELETE PET

exports.deletePet = async (req, res) => {
  const userId = req.user.user_id;
  const petId = req.params.id;

  try {
    // Check ownership
    const [pets] = await db.promise().query(
      `SELECT p.pet_id 
       FROM pets p
       JOIN clients c ON p.client_id = c.client_id
       WHERE p.pet_id = ? AND c.user_id = ?`,
      [petId, userId]
    );

    if (pets.length === 0) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Delete
    await db.promise().query(
      'DELETE FROM pets WHERE pet_id = ?',
      [petId]
    );

    res.json({ message: 'Pet deleted successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};