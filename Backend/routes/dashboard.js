const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');
const Message = require('../models/Message');

router.get('/summary', protect, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const role = req.user?.role;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const data = {
      opportunities: 0,
      applications: 0,
      messages: 0,
      impact: null
    };

    // Run counts in parallel for speed
    const counts = await Promise.all([
      role === 'ngo' ? Opportunity.countDocuments({ ngo_id: userId }) : Promise.resolve(0),
      role === 'volunteer' ? Application.countDocuments({ volunteer_id: userId }) : Promise.resolve(0),
      Message.countDocuments({ receiver_id: userId })
    ]);

    // Map results
    if (role === 'ngo') data.opportunities = counts[0];
    if (role === 'volunteer') data.applications = counts[1];
    data.messages = counts[2];

    res.json({ success: true, data });
  } catch (err) {
    console.error('SUMMARY ROUTE ERROR:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch summary' });
  }
});

module.exports = router;
