const mongoose = require('mongoose');

const chatRequestSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    message: {
        type: String,
        default: ""
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Prevent duplicate pending requests
chatRequestSchema.index({ sender: 1, receiver: 1, status: 1 }, { unique: true, partialFilterExpression: { status: 'pending' } });

module.exports = mongoose.model('ChatRequest', chatRequestSchema);
