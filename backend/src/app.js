const express = require('express');
const app = express();

// Routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Middleware
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Health check route
app.get('/', (req, res) => {
  res.send('PetPaws API running');
});

module.exports = app;