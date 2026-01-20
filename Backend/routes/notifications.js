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

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', protect, async (req, res, next) => {
    try {
        await Notification.updateMany(
            { recipient: req.user.id, isRead: false },
            { isRead: true }
        );
        res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/notifications
// @desc    Create a new notification
// @access  Private
router.post('/', protect, async (req, res, next) => {
    try {
        const { recipient, type, message, pickup } = req.body;

        if (!recipient || !type || !message) {
            return res.status(400).json({ success: false, message: 'Recipient, type, and message are required' });
        }

        const notification = await Notification.create({
            recipient,
            sender: req.user.id,
            type,
            message,
            pickup: pickup || null
        });

        // Populate notification for response
        const populatedNotification = await Notification.findById(notification._id)
            .populate('sender', 'username fullName')
            .populate('pickup', 'wasteTypes scheduledDate location');

        // Emit socket event for real-time notification
        const io = req.app.get('io');
        if (io) {
            // Emit to the recipient's room and also broadcast to all connections
            const recipientId = recipient.toString();
            io.to(recipientId).emit('notification', populatedNotification);
            // Also emit to all sockets in case user hasn't joined their room yet
            io.emit('notification', populatedNotification);
            console.log(`📤 Emitted notification to user ${recipientId}`);
        } else {
            console.warn('⚠️ Socket.IO not available for notification emission');
        }

        res.status(201).json({ success: true, data: populatedNotification });
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
