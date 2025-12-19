const express = require("express");
const router = express.Router();
const Activity = require("../models/Activity");
const protect = require("../middleware/auth");

// =====================================================
// GET /api/activity/my
// Get recent activity of logged-in user
// =====================================================
router.get("/my", protect, async (req, res) => {
  try {
    // protect middleware GUARANTEES req.user
    const userId = req.user._id;

    const activities = await Activity.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5);

    return res.json({
      success: true,
      activities,
    });
  } catch (error) {
    console.error("❌ ACTIVITY FETCH ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch activity",
    });
  }
});

module.exports = router;
