const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// ======================
// Middleware
// ======================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ======================
// API Root
// ======================
app.get('/api', (req, res) => {
  res.json({
    status: 'OK',
    message: 'WasteZero API',
    version: '1.0.0'
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// ======================
// Routes
// ======================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
// Opportunities
app.use('/api/opportunities', require('./routes/opportunities'));

// ======================
// MongoDB Connection (NON-BLOCKING)
// ======================
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not defined');
  console.log('⚠️ Starting server WITHOUT database (TEST MODE)');
} else {
  mongoose
    .connect(MONGODB_URI)
    .then(() => {
      console.log('✅ MongoDB Atlas Connected');
    })
    .catch((error) => {
      console.error('❌ MongoDB connection error:', error.message);
      console.log('⚠️ MongoDB unavailable – running backend in TEST MODE');
    });
}

// ======================
// START SERVER (ALWAYS)
// ======================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});

// ======================
// Global Error Handler
// ======================
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});
