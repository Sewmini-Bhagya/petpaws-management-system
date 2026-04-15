const express = require('express');
const app = express();

// Routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const petRoutes = require('./routes/petRoutes');
const documentRoutes = require('./routes/documentRoutes');

// Middleware
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/documents', documentRoutes);

// Health check route
app.get('/', (req, res) => {
  res.send('PetPaws API running');
});


module.exports = app;