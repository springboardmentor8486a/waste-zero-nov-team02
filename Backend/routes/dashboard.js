const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');
const Message = require('../models/Message');
const Pickup = require('../models/Pickup');

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
      impact: null,
      waste_kg: 0,
      pickups: 0,
      hours: 0
    };

    // Run counts in parallel for speed
    const [oppCount, appCount, msgCount, volunteerPickups] = await Promise.all([
      role === 'ngo' ? Opportunity.countDocuments({ ngo_id: userId }) : Promise.resolve(0),
      role === 'volunteer' ? Application.countDocuments({ volunteer_id: userId }) : Promise.resolve(0),
      Message.countDocuments({ receiver_id: userId }),
      role === 'volunteer' ? Pickup.find({ volunteer: userId, status: 'completed' }) : Promise.resolve([])
    ]);

    // Map results
    if (role === 'ngo') data.opportunities = oppCount;
    if (role === 'volunteer') {
      data.applications = appCount;
      // Calculate volunteer specific stats
      data.pickups = volunteerPickups.length;
      data.waste_kg = volunteerPickups.reduce((acc, curr) => acc + (curr.amount || 0), 0);
      data.hours = data.pickups * 2; // Simple estimation: 2 hours per pickup
    }
    data.messages = msgCount;

    res.json({ success: true, data });
  } catch (err) {
    console.error('SUMMARY ROUTE ERROR:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch summary' });
  }
});

module.exports = router;
