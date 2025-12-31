const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();

// ======================
// Middleware
// ======================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads folder exists and serve static files
const uploadsDir = path.join(__dirname, 'uploads');
try { fs.mkdirSync(uploadsDir, { recursive: true }); } catch (e) { }
app.use('/uploads', express.static(uploadsDir));

// ======================
// API Root & Health
// ======================
app.get("/api", (req, res) => {
  res.json({
    status: "OK",
    message: "WasteZero API",
    version: "1.1.0",
  });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// ======================
// Routes
// ======================

// Register API routes (single, clean mount points)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));

// Main opportunities router (public and NGO actions)
app.use('/api/opportunities', require('./routes/opportunities'));

// Optional admin-oriented opportunity routes (keeps activity logging/role checks)
app.use('/api/opportunity-admin', require('./routes/opportunity'));

// Admin utilities for uploaded files (list / cleanup orphaned uploads)
app.use('/api/admin/uploads', require('./routes/uploads-admin'));

// User settings (persisted)
app.use('/api/settings', require('./routes/settings'));
// Assistant endpoint (uses user settings)
app.use('/api/assistant', require('./routes/assistant'));

// Pickup scheduling
app.use('/api/pickups', require('./routes/pickups'));
app.use('/api/notifications', require('./routes/notifications'));

// Applications and activity
app.use('/api/applications', require('./routes/application'));
app.use('/api/activity', require('./routes/activity'));


// ======================
// MongoDB Connection
// ======================
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not defined");
  console.log("⚠️ Starting server WITHOUT database (TEST MODE)");
} else {
  mongoose
    .connect(MONGODB_URI)
    .then(() => console.log("✅ MongoDB Atlas Connected"))
    .catch((error) => {
      console.error("❌ MongoDB connection error:", error.message);
      console.log("⚠️ MongoDB unavailable – running backend in TEST MODE");
    });
}

// ======================
// Start Server
// ======================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} [v1.0.1 - Reschedule Routes Active]`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});

// ======================
// Global Error Handler (LAST)
// ======================
const errorHandler = require('./middleware/error');
app.use(errorHandler);
