const express = require("express");
const router = express.Router();

const Application = require("../models/Application");
const Opportunity = require("../models/Opportunity");
const Activity = require("../models/Activity");
const Notification = require("../models/Notification");
const User = require("../models/User");

const protect = require("../middleware/auth");
const role = require("../middleware/role");

// =====================================================
// POST /api/applications
// Volunteer applies to opportunity
// =====================================================
router.post("/", protect, role("volunteer"), async (req, res) => {
  try {
    const { opportunity_id } = req.body;

    if (!opportunity_id) {
      return res.status(400).json({
        success: false,
        message: "opportunity_id is required",
      });
    }

    const existing = await Application.findOne({
      opportunity_id,
      volunteer_id: req.user._id,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Already applied to this opportunity",
      });
    }

    // Enforce skill-match: volunteer must match at least 50% of required_skills
    const opportunityDoc = await Opportunity.findById(opportunity_id).select('required_skills title');
    if (!opportunityDoc) return res.status(404).json({ success: false, message: 'Opportunity not found' });

    const required = Array.isArray(opportunityDoc.required_skills) ? opportunityDoc.required_skills.filter(Boolean) : [];
    if (required.length > 0) {
      // Ensure we have volunteer skills; prefer req.user.skills but fall back to DB
      let volunteerSkills = Array.isArray(req.user?.skills) ? req.user.skills : null;
      if (!volunteerSkills) {
        const User = require('../models/User');
        const u = await User.findById(req.user._id).select('skills');
        volunteerSkills = Array.isArray(u?.skills) ? u.skills : [];
      }
      const matched = required.filter(rs => volunteerSkills.includes(rs));
      if (matched.length === 0) {
        return res.status(403).json({ success: false, message: 'You must have at least one matching skill to apply' });
      }
    }

    const application = await Application.create({
      opportunity_id,
      volunteer_id: req.user._id,
      status: "pending",
    });

    // Atomically increment registered_count on opportunity (prevent overbooking)
    const opportunity = await Opportunity.findOneAndUpdate(
      { _id: opportunity_id, $or: [{ capacity: null }, { $expr: { $lt: ["$registered_count", "$capacity"] } }] },
      { $inc: { registered_count: 1 } },
      { new: true }
    );

    if (!opportunity) {
      // Rollback application if capacity exceeded
      await Application.deleteOne({ _id: application._id }).catch(() => { });
      return res.status(400).json({ success: false, message: 'No slots available for this opportunity' });
    }

    await Activity.create({
      userId: req.user._id,
      action: "Applied for an opportunity",
      meta: opportunity.title,
    });

    // Notify all admins about new application
    const admins = await User.find({ role: 'admin' });
    if (admins.length > 0) {
      const notifications = admins.map(admin => ({
        recipient: admin._id,
        sender: req.user._id,
        type: 'new_application',
        message: `New volunteer application: ${req.user.username || req.user.fullName} applied for "${opportunity.title}"`,
        isRead: false
      }));
      await Notification.insertMany(notifications);

      // Emit real-time notification via WebSocket
      const io = req.app.get('io');
      if (io) {
        admins.forEach(admin => {
          io.to(admin._id.toString()).emit('notification', {
            type: 'new_application',
            message: `New volunteer application: ${req.user.username || req.user.fullName} applied for "${opportunity.title}"`,
            opportunityId: opportunity._id,
            applicationId: application._id
          });
        });
      }
    }

    return res.status(201).json({
      success: true,
      application,
    });
  } catch (error) {
    console.error("❌ APPLICATION CREATE ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to apply",
    });
  }
});

// =====================================================
// PUT /api/applications/:id/status
// NGO updates application status
// =====================================================
router.put("/:id/status", protect, role("ngo"), async (req, res) => {
  try {
    const { status } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const application = await Application.findById(req.params.id).populate("opportunity_id");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (application.opportunity_id.ngo_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not allowed",
      });
    }

    const prevStatus = application.status;
    application.status = status;
    await application.save();

    // If marking as rejected and previously not rejected, decrement registered_count
    if (prevStatus !== 'rejected' && status === 'rejected') {
      try {
        await Opportunity.updateOne({ _id: application.opportunity_id._id }, { $inc: { registered_count: -1 } });
      } catch (e) {
        console.error('Failed to decrement registered_count:', e.message);
      }
    }

    await Activity.create({
      userId: req.user._id,
      action: `Marked application as ${status}`,
      meta: application.opportunity_id.title,
    });

    if (status === "accepted") {
      await Activity.create({
        userId: application.volunteer_id,
        action: "Accepted for an opportunity",
        meta: application.opportunity_id.title,
      });
    }

    return res.json({
      success: true,
      application,
    });
  } catch (error) {
    console.error("❌ APPLICATION STATUS ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to update application",
    });
  }
});

// GET /api/applications/opportunity/:id
// Returns all applications for a specific opportunity (with volunteer details)
router.get("/opportunity/:opportunity_id", async (req, res) => {
  try {
    const applications = await Application.find({ opportunity_id: req.params.opportunity_id })
      .populate("volunteer_id", "username fullName avatar")
      .sort("-createdAt");
    res.json({ success: true, data: applications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
