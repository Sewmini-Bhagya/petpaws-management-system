const express = require('express');
const app = express();
const cors = require("cors");

// Routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const petRoutes = require('./routes/petRoutes');
const documentRoutes = require('./routes/documentRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const profileRoutes = require("./routes/profileRoutes");
const clientRoutes = require("./routes/clientRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const vetRoutes = require('./routes/vetRoutes');
const receptionRoutes = require('./routes/receptionRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
/**
 * Core Application Configuration
 * Initializes Express middleware, applies CORS policies, and registers API routers.
 */

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Global API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/vet', vetRoutes);
app.use('/api/reception', receptionRoutes);
app.use('/api/feedback', feedbackRoutes);

// Static Asset Hosting
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
app.use('/uploads', express.static(uploadDir));

/**
 * Basic Health Check
 */
app.get('/', (req, res) => {
  res.send('PetPaws API running');
});



module.exports = app;