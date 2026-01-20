const express = require('express');
const router = express.Router();
const Pickup = require('../models/Pickup');
const Notification = require('../models/Notification');
const VolunteerProfile = require('../models/VolunteerProfile');
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
            user: { $ne: req.user.id },
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
            .populate(req.user.role === 'ngo' ? 'volunteer' : {
                path: 'user',
                select: 'fullName username email',
                populate: { path: 'ngoDetails' }
            })
            .sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: pickups
        });
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/pickups/:id/reschedule-request
// @desc    Request a reschedule (Volunteer Only)
// @access  Private
router.put('/:id/reschedule-request', protect, async (req, res, next) => {
    try {
        if (req.user.role !== 'volunteer') {
            return res.status(403).json({ success: false, message: 'Only volunteers can request rescheduling' });
        }

        const { proposedDate, proposedTime } = req.body;
        console.log('📬 Reschedule Request Body:', req.body);
        console.log('👤 User ID:', req.user.id);

        if (!proposedDate || !proposedTime) {
            return res.status(400).json({ success: false, message: 'Proposed date and time are required' });
        }

        const pickup = await Pickup.findOne({ _id: req.params.id, volunteer: req.user.id });
        if (!pickup) {
            return res.status(404).json({ success: false, message: 'Pickup not found or not assigned to you' });
        }

        pickup.rescheduleRequest = {
            proposedDate,
            proposedTime,
            status: 'pending'
        };

        await pickup.save();

        // Create notification for NGO
        console.log('📬 Creating notification for recipient:', pickup.user);
        try {
            const notification = await Notification.create({
                recipient: pickup.user,
                sender: req.user.id,
                type: 'reschedule_request',
                pickup: pickup._id,
                message: `${req.user.username} requested to reschedule pickup for ${proposedDate} at ${proposedTime}`
            });
            console.log('✅ Notification created successfully:', notification._id);
        } catch (notifError) {
            console.error('❌ Notification creation failed:', notifError.message);
        }

        res.status(200).json({ success: true, data: pickup });
    } catch (error) {
        console.error('❌ Reschedule request route error:', error.message);
        next(error);
    }
});

// @route   PUT /api/pickups/:id/reschedule-respond
// @desc    Respond to reschedule request (NGO Only)
// @access  Private
router.put('/:id/reschedule-respond', protect, async (req, res, next) => {
    try {
        if (req.user.role !== 'ngo') {
            return res.status(403).json({ success: false, message: 'Only NGOs can respond to reschedule requests' });
        }

        const { action } = req.body; // 'approve' or 'reject'
        const pickup = await Pickup.findOne({ _id: req.params.id, user: req.user.id }).populate('volunteer');

        if (!pickup || pickup.rescheduleRequest.status !== 'pending') {
            return res.status(404).json({ success: false, message: 'No pending reschedule request found' });
        }

        if (action === 'approve') {
            console.log('📝 Approving reschedule. Old:', { date: pickup.scheduledDate, time: pickup.timeSlot });
            console.log('🆕 Proposed New:', pickup.rescheduleRequest);

            pickup.scheduledDate = pickup.rescheduleRequest.proposedDate;
            pickup.timeSlot = pickup.rescheduleRequest.proposedTime;
            pickup.rescheduleRequest.status = 'approved';
            pickup.markModified('rescheduleRequest');

            console.log('✅ Updated Pickup Object (unsaved):', { date: pickup.scheduledDate, time: pickup.timeSlot, status: pickup.rescheduleRequest.status });

            await Notification.create({
                recipient: pickup.volunteer._id,
                sender: req.user.id,
                type: 'reschedule_approved',
                pickup: pickup._id,
                message: `NGO approved your reschedule request for ${pickup.scheduledDate}`
            });
        } else {
            console.log('❌ Rejecting reschedule request');
            pickup.rescheduleRequest.status = 'rejected';
            // Unassign volunteer if rejected
            const oldVolunteer = pickup.volunteer._id;
            pickup.volunteer = null;
            pickup.status = 'scheduled';

            await Notification.create({
                recipient: oldVolunteer,
                sender: req.user.id,
                type: 'reschedule_rejected',
                pickup: pickup._id,
                message: `NGO rejected your reschedule request. The pickup has been unassigned.`
            });
        }

        await pickup.save();
        console.log('💾 Pickup saved successfully. ID:', pickup._id);
        res.status(200).json({ success: true, data: pickup });
    } catch (error) {
        next(error);
    }
});

// @route   DELETE /api/pickups/:id/cancel
// @desc    Cancel/Unassign a pickup (Volunteer Only)
// @access  Private
router.delete('/:id/cancel', protect, async (req, res, next) => {
    try {
        const pickup = await Pickup.findOne({ _id: req.params.id, volunteer: req.user.id });
        if (!pickup) {
            return res.status(404).json({ success: false, message: 'Pickup not found or not assigned to you' });
        }

        // Check if there was a pending reschedule request
        const hadPendingReschedule = pickup.rescheduleRequest?.status === 'pending';

        pickup.volunteer = null;
        pickup.status = 'scheduled';
        pickup.rescheduleRequest = { status: 'none' };

        await pickup.save();

        // Only notify NGO if the cancellation was related to a failed reschedule
        if (hadPendingReschedule) {
            await Notification.create({
                recipient: pickup.user,
                sender: req.user.id,
                type: 'pickup_cancelled',
                pickup: pickup._id,
                message: `${req.user.username} cancelled the pickup after reschedule request was not approved.`
            });
        }

        res.status(200).json({ success: true, message: 'Pickup cancelled successfully' });
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/pickups/:id/mark-done
// @desc    Mark pickup as done (Volunteer Only)
// @access  Private
router.put('/:id/mark-done', protect, async (req, res, next) => {
    console.log('✅ HIT: mark-done route for ID:', req.params.id);
    try {
        if (req.user.role !== 'volunteer') {
            return res.status(403).json({ success: false, message: 'Only volunteers can mark pickups as done' });
        }

        const pickup = await Pickup.findOne({ _id: req.params.id, volunteer: req.user.id });
        if (!pickup) {
            return res.status(404).json({ success: false, message: 'Pickup not found or not assigned to you' });
        }

        if (pickup.status !== 'in_progress') {
            return res.status(400).json({ success: false, message: `Only in-progress pickups can be marked as done. Current status: ${pickup.status}` });
        }

        pickup.status = 'awaiting_verification';
        await pickup.save();

        // Notify NGO
        await Notification.create({
            recipient: pickup.user,
            sender: req.user.id,
            type: 'pickup_completed_volunteer',
            pickup: pickup._id,
            message: `${req.user.username} has marked the pickup as completed. Please verify.`
        });

        res.status(200).json({ success: true, data: pickup });
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/pickups/:id/verify
// @desc    Verify and complete pickup (NGO Only)
// @access  Private
router.put('/:id/verify', protect, async (req, res, next) => {
    console.log('✅ HIT: verify route for ID:', req.params.id);
    try {
        if (req.user.role !== 'ngo') {
            return res.status(403).json({ success: false, message: 'Only NGOs can verify completions' });
        }

        const pickup = await Pickup.findOne({ _id: req.params.id, user: req.user.id }).populate('volunteer');
        if (!pickup) {
            return res.status(404).json({ success: false, message: 'Pickup not found' });
        }

        if (pickup.status !== 'awaiting_verification') {
            return res.status(400).json({ success: false, message: 'This pickup is not awaiting verification' });
        }

        pickup.status = 'completed';
        const pointsAwarded = pickup.points_estimated || 0;
        await pickup.save();

        // Award points to volunteer
        if (pickup.volunteer) {
            let profile = await VolunteerProfile.findOne({ user: pickup.volunteer._id });
            if (!profile) {
                profile = await VolunteerProfile.create({ user: pickup.volunteer._id, totalPoints: 0 });
            }
            profile.totalPoints = (profile.totalPoints || 0) + pointsAwarded;
            await profile.save();

            // Notify Volunteer
            await Notification.create({
                recipient: pickup.volunteer._id,
                sender: req.user.id,
                type: 'pickup_verified',
                pickup: pickup._id,
                message: `NGO successfully verified your pickup! ${pointsAwarded} points have been added to your profile.`
            });
        }

        res.status(200).json({ success: true, data: pickup, pointsAwarded });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
