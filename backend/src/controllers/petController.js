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