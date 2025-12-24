const express = require('express');
const router = express.Router();
const Pickup = require('../models/Pickup');
const protect = require('../middleware/auth');

// @route   POST /api/pickups
// @desc    Schedule a new pickup (NGO Only)
// @access  Private
router.post('/', protect, async (req, res, next) => {
    try {
        if (req.user.role !== 'ngo') {
            return res.status(403).json({ success: false, message: 'Only NGOs can schedule pickups' });
        }

        const { wasteTypes, amount, unit, scheduledDate, timeSlot, location, points } = req.body;

        // Basic validation
        if (!wasteTypes || !amount || !scheduledDate || !timeSlot || !location) {
            const err = new Error('Please fill all required fields');
            err.statusCode = 400;
            throw err;
        }

        const pickup = await Pickup.create({
            user: req.user.id,
            wasteTypes,
            amount,
            unit,
            scheduledDate,
            timeSlot,
            location,
            points_estimated: points || (amount * 10)
        });

        res.status(201).json({
            success: true,
            data: pickup
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/pickups/available
// @desc    Get all available pickups (not yet accepted by a volunteer)
// @access  Private
router.get('/available', protect, async (req, res, next) => {
    try {
        // Find pickups with status 'scheduled' and no volunteer assigned
        const pickups = await Pickup.find({
            status: 'scheduled',
            $or: [
                { volunteer: { $exists: false } },
                { volunteer: null }
            ]
        }).populate('user', 'username email').sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: pickups
        });
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/pickups/:id/accept
// @desc    Accept a pickup (Volunteer Only)
// @access  Private
router.put('/:id/accept', protect, async (req, res, next) => {
    try {
        if (req.user.role !== 'volunteer') {
            return res.status(403).json({
                success: false,
                message: `Only volunteers can accept pickups. Your current role is: ${req.user.role}. (Use a @gmail.com email for volunteer access)`
            });
        }

        const pickup = await Pickup.findOneAndUpdate(
            {
                _id: req.params.id,
                status: 'scheduled',
                $or: [{ volunteer: { $exists: false } }, { volunteer: null }]
            },
            {
                volunteer: req.user._id,
                status: 'in_progress'
            },
            { new: true }
        ).populate('volunteer', 'fullName username email')
            .populate('user', 'username email');

        if (!pickup) {
            // Check why it failed
            const existing = await Pickup.findById(req.params.id);
            if (!existing) {
                return res.status(404).json({ success: false, message: 'Pickup not found' });
            }
            if (existing.status !== 'scheduled') {
                return res.status(400).json({ success: false, message: `This pickup is no longer available (Status: ${existing.status})` });
            }
            if (existing.volunteer) {
                return res.status(400).json({ success: false, message: 'This pickup has already been accepted by another volunteer' });
            }
            return res.status(400).json({ success: false, message: 'Failed to accept pickup' });
        }

        res.status(200).json({
            success: true,
            data: pickup
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/pickups/my
// @desc    Get my pickups (NGO: created by me | Volunteer: accepted by me)
// @access  Private
router.get('/my', protect, async (req, res, next) => {
    try {
        const query = req.user.role === 'ngo'
            ? { user: req.user.id }
            : { volunteer: req.user.id };

        const pickups = await Pickup.find(query)
            .populate(req.user.role === 'ngo' ? 'volunteer' : 'user', 'fullName username email')
            .sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: pickups
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
