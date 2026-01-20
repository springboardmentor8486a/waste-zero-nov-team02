const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['reschedule_request', 'reschedule_approved', 'reschedule_rejected', 'pickup_cancelled', 'pickup_completed_volunteer', 'pickup_verified', 'new_registration', 'admin_alert', 'new_message', 'new_match', 'new_application'],
        required: true
    },
    pickup: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pickup',
        required: false
    },
    message: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Notification', NotificationSchema);
