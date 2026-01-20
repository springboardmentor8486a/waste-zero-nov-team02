const express = require('express');
const router = express.Router();
const User = require('../models/User');
const protect = require('../middleware/auth');

// GET /api/settings - return current user's settings
router.get('/', protect, async (req, res) => {
  try {
    const u = await User.findById(req.user._id).select('settings');
    return res.json({ success: true, settings: u?.settings || {} });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/settings - update current user's settings (merge)
router.put('/', protect, async (req, res) => {
  try {
    const updates = req.body || {};
    const u = await User.findById(req.user._id);
    if (!u) return res.status(404).json({ success: false, message: 'User not found' });
    u.settings = { ...u.settings, ...updates };
    await u.save();
    return res.json({ success: true, settings: u.settings });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
