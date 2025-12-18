const express = require('express');
const router = express.Router();
const Opportunity = require('../models/Opportunity');
const { protect } = require('../middleware/auth');

// GET /api/opportunities - list all
router.get('/', async (req, res) => {
  try {
    const items = await Opportunity.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/opportunities - create (protected)
router.post('/', protect, async (req, res) => {
  try {
    const payload = req.body || {};
    const op = new Opportunity({ ...payload, createdBy: req.user._id });
    const saved = await op.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/opportunities/:id - update (protected)
router.put('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const op = await Opportunity.findById(id);
    if (!op) return res.status(404).json({ success: false, message: 'Not found' });
    // allow update
    Object.assign(op, req.body);
    const saved = await op.save();
    res.json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/opportunities/:id - delete (protected)
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const op = await Opportunity.findById(id);
    if (!op) return res.status(404).json({ success: false, message: 'Not found' });
    await op.remove();
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
