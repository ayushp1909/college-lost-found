const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const itemRoutes = require('./routes/itemRoutes');
const matchRoutes = require('./routes/matchRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Attempt MongoDB connection on server start
connectDB();

// Verify required configuration
if (!process.env.JWT_SECRET) {
  console.warn('[Configuration Warning] JWT_SECRET is not set in environment variables.');
}

// Test API Route
app.get('/api/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend working'
  });
});

// Auth Routes
app.use('/api/auth', authRoutes);

// Item Routes
app.use('/api/items', itemRoutes);

// AI Match Routes
app.use('/api/matches', matchRoutes);

// Admin Routes
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
