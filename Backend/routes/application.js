const express = require("express");
const router = express.Router();

const Application = require("../models/Application");
const Opportunity = require("../models/Opportunity");
const Activity = require("../models/Activity");

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

    const application = await Application.create({
      opportunity_id,
      volunteer_id: req.user._id,
      status: "pending",
    });

    const opportunity = await Opportunity.findById(opportunity_id);

    if (opportunity) {
      await Activity.create({
        userId: req.user._id,
        action: "Applied for an opportunity",
        meta: opportunity.title,
      });
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

    application.status = status;
    await application.save();

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

module.exports = router;
