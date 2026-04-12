const express = require('express');
const app = express();

const authRoutes = require('./routes/authRoutes');

app.use(express.json());

// routes
app.use('/api/auth', authRoutes);

// test route
app.get('/', (req, res) => {
  res.send('PetPaws API running');
});

module.exports = app;