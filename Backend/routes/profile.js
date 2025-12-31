const express = require('express');
const User = require('../models/User');
const NgoProfile = require('../models/NgoProfile');
const VolunteerProfile = require('../models/VolunteerProfile');
const protect = require("../middleware/auth");
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Configure Multer for Logo/Avatar Upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determine folder based on field name or generic
    const folder = file.fieldname === 'logo' ? 'logos' : 'avatars';
    const uploadPath = path.join(__dirname, '..', 'uploads', folder);
    // Ensure directory exists
    fs.mkdir(uploadPath, { recursive: true }, (err) => {
      if (err) return cb(err);
      cb(null, uploadPath);
    });
  },
  filename: function (req, file, cb) {
    cb(null, `${file.fieldname}_${req.user.id}_${Date.now()}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('Please upload an image file'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit
});

// =====================================================
// @route   GET /api/profile
// @desc    Get logged-in user profile (merges User + Specific Profile)
// @access  Private
// =====================================================
router.get('/', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let profileData = { ...user.toObject() };

    // If user is NGO, fetch extended profile
    if (user.role === 'ngo') {
      const ngoProfile = await NgoProfile.findOne({ user: req.user.id });
      if (ngoProfile) {
        profileData = { ...profileData, ngoDetails: ngoProfile };
      }
    } else if (user.role === 'volunteer') {
      const volProfile = await VolunteerProfile.findOne({ user: req.user.id });
      if (volProfile) {
        profileData = { ...profileData, volunteerDetails: volProfile };
      }
    }

    res.status(200).json({
      success: true,
      user: profileData
    });
  } catch (error) {
    next(error);
  }
});


// =====================================================
// @route   PUT /api/profile
// @desc    Update profile details (Supports Multipart for Logo/Avatar)
// @access  Private
// =====================================================
router.put('/', protect, upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'avatar', maxCount: 1 }]), async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // 1. Update basic User fields
    const { fullName, location, skills, phoneNumber, email } = req.body;
    if (fullName) user.fullName = fullName;
    if (location) user.location = location;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (email) user.email = email;

    if (skills) {
      user.skills = Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()) : []);
    }
    await user.save();

    // 2. Logic Split based on Role
    let specificProfile = null;

    if (user.role === 'ngo') {
      const {
        organizationName,
        website,
        missionStatement,
        publicEmail,
        phoneNumber,
        address,
        city,
        country
      } = req.body;

      const ngoFields = {
        user: req.user.id,
        organizationName: organizationName || fullName, // Fallback to fullName
        website,
        missionStatement,
        publicEmail,
        phoneNumber,
        address,
        city,
        country
      };

      // Handle Logo Upload (req.files is object with arrays)
      if (req.files && req.files.logo && req.files.logo[0]) {
        ngoFields.logo = `/uploads/logos/${req.files.logo[0].filename}`;
      }

      // Upsert NgoProfile
      specificProfile = await NgoProfile.findOneAndUpdate(
        { user: req.user.id },
        { $set: ngoFields },
        { new: true, upsert: true, runValidators: true }
      );
    }
    else if (user.role === 'volunteer') {
      const {
        displayName,
        bio,
        interests,
        phoneNumber,
        address,
        city,
        country,
        availability,
        goals
      } = req.body;

      const volFields = {
        user: req.user.id,
        displayName: displayName || fullName,
        bio,
        phoneNumber,
        address,
        city,
        country,
        availability,
        goals: goals ? JSON.parse(JSON.stringify(goals)) : undefined
      };

      if (skills) {
        volFields.skills = Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()) : []);
      }
      if (interests) {
        volFields.interests = Array.isArray(interests) ? interests : (interests ? interests.split(',').map(s => s.trim()) : []);
      }

      // Handle Avatar Upload
      if (req.files && req.files.avatar && req.files.avatar[0]) {
        volFields.avatar = `/uploads/avatars/${req.files.avatar[0].filename}`;
      }

      // Upsert VolunteerProfile
      specificProfile = await VolunteerProfile.findOneAndUpdate(
        { user: req.user.id },
        { $set: volFields },
        { new: true, upsert: true, runValidators: true }
      );
    }

    // Return merged data
    const profileData = {
      ...user.toObject(),
      [user.role === 'ngo' ? 'ngoDetails' : 'volunteerDetails']: specificProfile
    };

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: profileData
    });

  } catch (error) {
    next(error);
  }
});

// =====================================================
// @route   PUT /api/profile/password
// @desc    Change password
// @access  Private
// =====================================================
router.put('/password', protect, async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      const err = new Error('All fields are required');
      err.statusCode = 400;
      throw err;
    }

    if (newPassword !== confirmPassword) {
      const err = new Error('New passwords do not match');
      err.statusCode = 400;
      throw err;
    }

    if (newPassword.length < 6) {
      const err = new Error('Password must be at least 6 characters');
      err.statusCode = 400;
      throw err;
    }

    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    if (user.isGoogleUser) {
      const err = new Error('Password change not allowed for Google accounts');
      err.statusCode = 400;
      throw err;
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      const err = new Error('Current password is incorrect');
      err.statusCode = 401;
      throw err;
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
