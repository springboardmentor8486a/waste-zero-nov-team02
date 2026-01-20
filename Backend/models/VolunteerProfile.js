const mongoose = require('mongoose');

const VolunteerProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    displayName: {
        type: String,
        trim: true
    },
    bio: {
        type: String,
        maxlength: [500, 'Bio can not be more than 500 characters']
    },
    skills: [{
        type: String
    }],
    interests: [{
        type: String // e.g. "Environment", "Teaching", "Health"
    }],
    phoneNumber: {
        type: String
    },
    address: {
        type: String
    },
    city: {
        type: String
    },
    country: {
        type: String
    },
    avatar: {
        type: String,
        default: 'no-photo.jpg' // or generic avatar
    },
    availability: {
        type: String // e.g. "Weekends", "Mornings"
    },
    totalPoints: {
        type: Number,
        default: 0
    },
    goals: {
        points: { type: Number, default: 0 },
        hours: { type: Number, default: 0 },
        timeLimit: { type: Number, default: 0 }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('VolunteerProfile', VolunteerProfileSchema);
