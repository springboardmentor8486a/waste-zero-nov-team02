const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const { findMatchesForVolunteer, findMatchesForOpportunity } = require('../utils/matching');
const Opportunity = require('../models/Opportunity');
const Notification = require('../models/Notification');

/**
 * @route   GET /api/matches
 * @desc    Get matched opportunities for the logged-in volunteer
 * @access  Private/Volunteer
 */
router.get('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'volunteer') {
      return res.status(403).json({
        success: false,
        message: 'Only volunteers can access this endpoint'
      });
    }

    const matches = await findMatchesForVolunteer(req.user._id);

    // Emit real-time notification if new high-score matches found
    const io = req.app.get('io');
    if (io && matches.length > 0) {
      const highScoreMatches = matches.filter(m => m.score >= 0.7);
      if (highScoreMatches.length > 0) {
        // Create notification for new high-score matches
        await Notification.create({
          recipient: req.user._id,
          sender: req.user._id, // System notification
          type: 'new_match',
          message: `You have ${highScoreMatches.length} new high-quality match${highScoreMatches.length > 1 ? 'es' : ''}!`
        });

        io.to(req.user._id.toString()).emit('newMatch', {
          count: highScoreMatches.length,
          matches: highScoreMatches.slice(0, 5) // Top 5 matches
        });
      }
    }

    res.json({
      success: true,
      count: matches.length,
      matches
    });
  } catch (error) {
    console.error('Error getting matches for volunteer:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

/**
 * @route   GET /api/matches/:opportunityId
 * @desc    Get matched volunteers for a specific opportunity (NGO only)
 * @access  Private/NGO
 */
router.get('/:opportunityId', protect, async (req, res) => {
  try {
    if (req.user.role !== 'ngo') {
      return res.status(403).json({
        success: false,
        message: 'Only NGOs can access this endpoint'
      });
    }

    const { opportunityId } = req.params;
    const matches = await findMatchesForOpportunity(opportunityId, req.user._id);

    res.json({
      success: true,
      count: matches.length,
      matches
    });
  } catch (error) {
    console.error('Error getting matches for opportunity:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

module.exports = router;

