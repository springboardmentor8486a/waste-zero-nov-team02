const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const Opportunity = require('../models/Opportunity');
const protect = require('../middleware/auth');
const role = require('../middleware/role');

// GET /api/admin/uploads/orphans - list orphaned files under uploads/opportunities
router.get('/orphaned', protect, role('admin'), async (req, res) => {
  try {
    const uploadsDir = path.join(__dirname, '..', 'uploads', 'opportunities');
    let files = [];
    try { files = fs.readdirSync(uploadsDir); } catch (e) { files = []; }

    const ops = await Opportunity.find({}, 'cover attachments').lean();
    const referenced = new Set();
    for (const o of ops) {
      if (o.cover) referenced.add(path.basename(o.cover));
      if (o.attachments && o.attachments.length) o.attachments.forEach(a => referenced.add(path.basename(a)));
    }

    const orphans = files.filter(f => !referenced.has(f));
    res.json({ success: true, orphans });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/admin/uploads/cleanup - delete orphaned files (admin only)
router.post('/cleanup', protect, role('admin'), async (req, res) => {
  try {
    const uploadsDir = path.join(__dirname, '..', 'uploads', 'opportunities');
    let files = [];
    try { files = fs.readdirSync(uploadsDir); } catch (e) { files = []; }

    const ops = await Opportunity.find({}, 'cover attachments').lean();
    const referenced = new Set();
    for (const o of ops) {
      if (o.cover) referenced.add(path.basename(o.cover));
      if (o.attachments && o.attachments.length) o.attachments.forEach(a => referenced.add(path.basename(a)));
    }

    const orphans = files.filter(f => !referenced.has(f));
    const deleted = [];
    for (const f of orphans) {
      try { fs.unlinkSync(path.join(uploadsDir, f)); deleted.push(f); } catch (e) { /* ignore */ }
    }

    res.json({ success: true, deleted, count: deleted.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
