const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require('path');
const fs = require('fs');

dotenv.config();
console.log('✅ Env loaded: JWT_SECRET present?', !!process.env.JWT_SECRET);
console.log('✅ Env loaded: MONGODB_URI present?', !!process.env.MONGODB_URI);
console.log('✅ Env loaded: OPENROUTER_API_KEY present?', !!process.env.OPENROUTER_API_KEY);
console.log('✅ Env loaded: GEMINI_API_KEY present?', !!process.env.GEMINI_API_KEY);
if (process.env.OPENROUTER_API_KEY) {
  console.log('🤖 OpenRouter API key configured:', process.env.OPENROUTER_API_KEY.substring(0, 15) + '...');
}
if (process.env.GEMINI_API_KEY) {
  console.log('🤖 Gemini API key configured:', process.env.GEMINI_API_KEY.substring(0, 15) + '...');
}


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

app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/opportunities', require('./routes/opportunities'));
app.use('/api/opportunity-admin', require('./routes/opportunity'));
app.use('/api/admin/uploads', require('./routes/uploads-admin'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/assistant', require('./routes/assistant'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/pickups', require('./routes/pickups'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/applications', require('./routes/application'));
app.use('/api/activity', require('./routes/activity'));
app.use('/api/users', require('./routes/users'));
app.use('/api/impact', require('./routes/impact'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/matches', require('./routes/matches'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/feedback', require('./routes/feedback'));

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
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});

// ======================
// Socket.IO Setup
// ======================
const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Make io available to routes
app.set('io', io);

// Maintain online users map
const onlineUsers = new Map(); // userId -> socketId

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    socket.userId = user._id.toString();
    socket.user = user;
    next();
  } catch (error) {
    console.error('Socket authentication error:', error.message);
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log(`✅ User ${socket.user.username} (${socket.userId}) connected: ${socket.id}`);

  // Add to online users
  onlineUsers.set(socket.userId, socket.id);
  socket.join(socket.userId);

  // Broadcast user online status
  socket.broadcast.emit('userOnline', { userId: socket.userId });

  // Handle joining a room (for specific conversations)
  socket.on('joinConversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`User ${socket.userId} joined conversation ${conversationId}`);
  });

  // Handle leaving a conversation
  socket.on('leaveConversation', (conversationId) => {
    socket.leave(conversationId);
    console.log(`User ${socket.userId} left conversation ${conversationId}`);
  });

  // Handle typing indicator
  socket.on('typing', (data) => {
    const { conversationId, receiverId } = data;
    socket.to(receiverId).emit('typing', {
      userId: socket.userId,
      username: socket.user.username,
      conversationId
    });
  });

  socket.on('stopTyping', (data) => {
    const { receiverId } = data;
    socket.to(receiverId).emit('stopTyping', {
      userId: socket.userId
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`❌ User ${socket.userId} disconnected: ${socket.id}`);
    onlineUsers.delete(socket.userId);
    socket.broadcast.emit('userOffline', { userId: socket.userId });
  });
});

// Helper function to check if user is online
io.isUserOnline = (userId) => {
  return onlineUsers.has(userId.toString());
};

// Helper function to get online users count
io.getOnlineUsersCount = () => {
  return onlineUsers.size;
};

// ======================
// Global Error Handler (LAST)
// ======================
const errorHandler = require('./middleware/error');
app.use(errorHandler);
