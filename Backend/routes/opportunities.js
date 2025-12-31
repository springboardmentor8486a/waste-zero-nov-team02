const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Opportunity = require('../models/Opportunity');
const protect = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer storage for opportunity uploads
const storageDir = path.join(__dirname, '..', 'uploads', 'opportunities');
try { fs.mkdirSync(storageDir, { recursive: true }); } catch (e) { }
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, storageDir);
  },
  filename: function (req, file, cb) {
    const name = Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.\-]/g, '_');
    cb(null, name);
  }
});
// Allowed mime types
const coverMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const attachmentMimes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/zip'
];

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'cover') {
    if (coverMimes.includes(file.mimetype)) return cb(null, true);
    return cb(new Error('Cover must be an image (jpg, png, webp, gif)'));
  }
  if (file.fieldname === 'attachments') {
    if (attachmentMimes.includes(file.mimetype)) return cb(null, true);
    return cb(new Error('Attachment type not allowed'));
  }
  cb(new Error('Unexpected file field'));
};

// 10 MB per file limit
const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

// Helper: check ObjectId
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// GET /api/opportunities
// Optional filters: ?location=&skills=sk1,sk2&status=
router.get('/', async (req, res) => {
  try {
    const { location, skills, status, q } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (skills) {
      const arr = String(skills).split(',').map((s) => s.trim()).filter(Boolean);
      if (arr.length) filter.required_skills = { $all: arr };
    }
    if (q) filter.$text = { $search: String(q) };

    const items = await Opportunity.find(filter).sort({ createdAt: -1 }).populate('ngo_id', 'name location');
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/opportunities/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ success: false, message: 'Invalid ID' });
    const op = await Opportunity.findById(id).populate('ngo_id', 'name location');
    if (!op) return res.status(404).json({ success: false, message: 'Not found' });
    res.json(op);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/opportunities - create (NGO only)
// Accept cover (single) and attachments (multiple)
router.post('/', protect, upload.fields([{ name: 'cover', maxCount: 1 }, { name: 'attachments', maxCount: 8 }]), async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'ngo') return res.status(403).json({ success: false, message: 'Only NGOs can create opportunities' });

    const { title, short, description, required_skills, duration, location, status, date, time, capacity } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title is required' });

    const opData = {
      title,
      short,
      description,
      required_skills: Array.isArray(required_skills) ? required_skills : (typeof required_skills === 'string' ? required_skills.split(',').map(s => s.trim()).filter(Boolean) : []),
      duration,
      location,
      status: status || 'open',
      ngo_id: user._id,
      date,
      time,
      capacity: capacity == null ? undefined : Number(capacity),
    };

    // Files handling and validation
    if (req.files) {
      // cover size validation (5MB)
      if (req.files.cover && req.files.cover[0]) {
        const c = req.files.cover[0];
        if (c.size > 5 * 1024 * 1024) {
          // remove the uploaded file
          try { fs.unlinkSync(path.join(storageDir, c.filename)); } catch (e) { }
          return res.status(400).json({ success: false, message: 'Cover image must be <= 5MB' });
        }
        opData.cover = `/uploads/opportunities/${c.filename}`;
      }
      if (req.files.attachments && req.files.attachments.length) {
        opData.attachments = req.files.attachments.map(f => `/uploads/opportunities/${f.filename}`);
      }
    }

    const op = new Opportunity(opData);

    const saved = await op.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/opportunities/:id - update (owner NGO only)
// Accept cover and attachments on update as well
router.put('/:id', protect, upload.fields([{ name: 'cover', maxCount: 1 }, { name: 'attachments', maxCount: 8 }]), async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ success: false, message: 'Invalid ID' });
    const op = await Opportunity.findById(id);
    if (!op) return res.status(404).json({ success: false, message: 'Not found' });

    const user = req.user;
    // Allow any NGO account to update opportunities (relaxed ownership enforcement)
    if (!user || user.role !== 'ngo') {
      return res.status(403).json({ success: false, message: 'Forbidden - NGO role required' });
    }

    // Only allow these fields to be updated
    const allowed = ['title', 'short', 'description', 'required_skills', 'duration', 'location', 'status', 'date', 'time', 'capacity'];

    // If files present for update, process them and validate cover size
    if (req.files) {
      if (req.files.cover && req.files.cover[0]) {
        const c = req.files.cover[0];
        if (c.size > 5 * 1024 * 1024) {
          try { fs.unlinkSync(path.join(storageDir, c.filename)); } catch (e) { }
          return res.status(400).json({ success: false, message: 'Cover image must be <= 5MB' });
        }
        // delete previous cover file if exists
        if (op.cover) {
          try { fs.unlinkSync(path.join(__dirname, '..', op.cover)); } catch (e) { }
        }
        op.cover = `/uploads/opportunities/${req.files.cover[0].filename}`;
      }
      if (req.files.attachments && req.files.attachments.length) {
        op.attachments = (op.attachments || []).concat(req.files.attachments.map(f => `/uploads/opportunities/${f.filename}`));
      }
    }

    allowed.forEach((k) => {
      if (k in req.body) op[k] = req.body[k];
    });

    const saved = await op.save();
    res.json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/opportunities/:id - delete (owner NGO only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ success: false, message: 'Invalid ID' });
    const op = await Opportunity.findById(id);
    if (!op) return res.status(404).json({ success: false, message: 'Not found' });

    const user = req.user;
    // Allow any NGO account to delete opportunities (relaxed ownership enforcement)
    if (!user || user.role !== 'ngo') {
      return res.status(403).json({ success: false, message: 'Forbidden - NGO role required' });
    }

    // Remove files (cover + attachments) from disk if present
    try {
      if (op.cover) {
        const name = path.basename(op.cover);
        const filePath = path.join(storageDir, name);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
      if (op.attachments && op.attachments.length) {
        for (const a of op.attachments) {
          const name = path.basename(a);
          const filePath = path.join(storageDir, name);
          if (fs.existsSync(filePath)) {
            try { fs.unlinkSync(filePath); } catch (e) { }
          }
        }
      }
    } catch (e) {
      console.error('Failed to cleanup files for opportunity:', e.message);
    }

    await op.deleteOne();
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
