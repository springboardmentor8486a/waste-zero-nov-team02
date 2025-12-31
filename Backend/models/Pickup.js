const mongoose = require('mongoose');

const PickupSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    wasteTypes: [{
        type: String,
        enum: ['plastic', 'paper', 'ewaste', 'metal'],
        required: true
    }],
    amount: {
        type: Number,
        required: true
    },
    unit: {
        type: String,
        enum: ['Kilograms (kg)', 'Bags (Standard Trash Bags)', 'Items (Count)'],
        default: 'Kilograms (kg)'
    },
    scheduledDate: {
        type: String, // Storing as string "Wed, Oct 3" or ISO date depending on requirements. 
        // Simpler to store ISO date string if possible, but frontend sends specific format.
        // Let's store text for now to match UI exactness, or better, real Date?
        // User UI sends generated days like "October 3". I will store generic string.
        required: true
    },
    timeSlot: {
        type: String,
        required: true
    },
    location: {
        address: { type: String, required: true },
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    status: {
        type: String,
        enum: ['scheduled', 'in_progress', 'awaiting_verification', 'completed', 'cancelled'],
        default: 'scheduled'
    },
    volunteer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    points_estimated: {
        type: Number,
        default: 0
    },
    rescheduleRequest: {
        proposedDate: { type: String },
        proposedTime: { type: String },
        status: {
            type: String,
            enum: ['none', 'pending', 'approved', 'rejected'],
            default: 'none'
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Pickup', PickupSchema);
