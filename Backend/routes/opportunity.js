const express = require("express");
const router = express.Router();
const Opportunity = require("../models/Opportunity");
const Activity = require("../models/Activity");
const protect = require("../middleware/auth");
const role = require("../middleware/role");

// 🔹 NGO: Create opportunity
router.post("/", protect, role("ngo"), async (req, res) => {
  try {
    const opportunity = await Opportunity.create({
      ...req.body,
      ngo_id: req.user._id,
    });

    // Log activity
    await Activity.create({
      userId: req.user._id,
      action: "Created a new opportunity",
      meta: opportunity.title,
    });

    res.status(201).json(opportunity);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔹 Public: Get all open opportunities
router.get("/", async (req, res) => {
  try {
    const opportunities = await Opportunity.find({ status: "open" })
      .populate("ngo_id", "name email");
    res.json(opportunities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔹 NGO or Admin: Update opportunity
router.put("/:id", protect, role("ngo", "admin"), async (req, res) => {
  try {
    const opp = await Opportunity.findById(req.params.id);

    if (!opp) {
      return res.status(404).json({ message: "Opportunity not found" });
    }

    // If NGO, ensure ownership
    if (req.user.role === "ngo" && opp.ngo_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    Object.assign(opp, req.body);
    await opp.save();

    // Log activity
    await Activity.create({
      userId: req.user._id,
      action: "Updated an opportunity",
      meta: opp.title,
    });

    res.json(opp);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔹 Admin only: Delete opportunity
router.delete("/:id", protect, role("admin"), async (req, res) => {
  try {
    const opp = await Opportunity.findById(req.params.id);

    if (!opp) {
      return res.status(404).json({ message: "Opportunity not found" });
    }

    await opp.deleteOne();

    // Log activity
    await Activity.create({
      userId: req.user._id,
      action: "Deleted an opportunity",
      meta: opp.title,
    });

    res.json({ message: "Opportunity deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
