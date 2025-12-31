const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const protect = require('../middleware/auth');

// @route   GET /api/notifications
// @desc    Get current user's notifications
// @access  Private
router.get('/', protect, async (req, res, next) => {
    try {
        console.log('📡 Fetching notifications for user:', req.user.id);
        const notifications = await Notification.find({ recipient: req.user.id })
            .sort({ createdAt: -1 })
            .populate('sender', 'username fullName')
            .populate('pickup', 'wasteTypes scheduledDate location');

        console.log(`✅ Found ${notifications.length} notifications for user ${req.user.id}`);
        res.status(200).json({ success: true, data: notifications });
    } catch (error) {
        next(error);
    }
});

// @route   PATCH /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.patch('/:id/read', protect, async (req, res, next) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user.id },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        res.status(200).json({ success: true, data: notification });
    } catch (error) {
        next(error);
    }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete notification
// @access  Private
router.delete('/:id', protect, async (req, res, next) => {
    try {
        const userId = req.user.id.toString();
        const notificationId = req.params.id;

        console.log(`🗑️ DELETE Request for notification: ${notificationId} by user: ${userId}`);

        const notification = await Notification.findById(notificationId);

        if (!notification) {
            console.log(`⚠️ Notification ${notificationId} not found in database`);
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        // Check if the recipient matches
        if (notification.recipient.toString() !== userId) {
            console.warn(`🚫 Deletion denied: User ${userId} tried to delete notification belonging to ${notification.recipient}`);
            return res.status(403).json({ success: false, message: 'You are not authorized to delete this notification' });
        }

        await Notification.findByIdAndDelete(notificationId);
        console.log(`✅ Notification ${notificationId} deleted successfully by user ${userId}`);

        res.status(200).json({ success: true, message: 'Notification deleted' });
    } catch (error) {
        console.error('❌ DELETE Notification Error:', error.message);
        next(error);
    }
});

module.exports = router;
