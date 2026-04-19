const db = require('../config/db');


// UPLOAD DOCUMENT
exports.uploadDocument = async (req, res) => {
  const userId = req.user.user_id;
  const petId = req.params.petId;
  const { document_type } = req.body;
  const file = req.file;

  try {
    // Check ownership
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

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Save in DB
    await db.query(
      `INSERT INTO pet_documents (pet_id, document_type, file_path, uploaded_at)
       VALUES (?, ?, ?, NOW())`,
      [petId, document_type, file.path]
    );

    res.status(201).json({ message: 'Document uploaded successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


// GET DOCUMENTS
exports.getPetDocuments = async (req, res) => {
  const userId = req.user.user_id;
  const petId = req.params.petId;

  try {
    // ownership check
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

    const [docs] = await db.query(
      'SELECT * FROM pet_documents WHERE pet_id = ?',
      [petId]
    );

    res.json(docs);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};