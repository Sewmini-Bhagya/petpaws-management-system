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


app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payments', paymentRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/inventory", inventoryRoutes);

// Health check route
app.get('/', (req, res) => {
  res.send('PetPaws API running');
});



module.exports = app;