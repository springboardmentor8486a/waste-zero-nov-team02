const express = require('express');
const User = require('../models/User');
const protect = require("../middleware/auth");
const router = express.Router();


// =====================================================
// @route   GET /api/profile
// @desc    Get logged-in user profile
// @access  Private
// =====================================================
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      '_id email username role fullName location skills createdAt'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});


// =====================================================
// @route   PUT /api/profile
// @desc    Update profile details (NOT email/username)
// @access  Private
// =====================================================
router.put('/', protect, async (req, res) => {
  try {
    const { fullName, location, skills } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // 🔒 Explicitly block sensitive fields
    delete req.body.email;
    delete req.body.username;
    delete req.body.role;
    delete req.body.password;

    if (fullName !== undefined) {
      user.fullName = fullName;
    }

    if (location !== undefined) {
      user.location = location;
    }

    if (skills !== undefined) {
      if (Array.isArray(skills)) {
        user.skills = skills;
      } else if (typeof skills === 'string') {
        user.skills = skills
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        fullName: user.fullName,
        location: user.location,
        skills: user.skills
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});


// =====================================================
// @route   PUT /api/profile/password
// @desc    Change password
// @access  Private
// =====================================================
router.put('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New passwords do not match'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // 🚫 Google users cannot change password here
    if (user.isGoogleUser) {
      return res.status(400).json({
        success: false,
        message: 'Password change not allowed for Google accounts'
      });
    }

    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
