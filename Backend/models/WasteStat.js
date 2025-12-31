const mongoose = require('mongoose');

const wasteStatSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['plastic', 'paper', 'ewaste', 'metal', 'glass', 'organic']
    },
    weight: {
        type: Number,
        required: true,
        min: 0
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('WasteStat', wasteStatSchema);
