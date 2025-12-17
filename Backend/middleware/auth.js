const jwt = require('jsonwebtoken');
const User = require('../models/User');

// =======================================
// Protect routes middleware
// =======================================
const protect = async (req, res, next) => {
  let token;

  try {
    // 1️⃣ Get token from Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // 2️⃣ If no token
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token'
      });
    }

    // 3️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4️⃣ Attach user to request
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    req.user = user;

    // 5️⃣ VERY IMPORTANT
    next(); // ✅ this fixes "next is not a function"
  } catch (error) {
    console.error('❌ AUTH MIDDLEWARE ERROR:', error.message);

    return res.status(401).json({
      success: false,
      message: 'Not authorized'
    });
  }
};

module.exports = { protect };
