const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const Feedback = require('../models/Feedback');
const AppRating = require('../models/AppRating');
const Opportunity = require('../models/Opportunity');
const User = require('../models/User');

// POST Feedback for an opportunity
router.post('/opportunity', protect, async (req, res) => {
    try {
        const { opportunityId, content, rating, toUser } = req.body;

        if (!opportunityId || !content || !rating) {
            return res.status(400).json({ success: false, message: 'Opportunity ID, content and rating are required' });
        }

        const feedback = await Feedback.create({
            opportunityId,
            fromUser: req.user.id,
            toUser,
            role: req.user.role,
            content,
            rating
        });

        res.status(201).json({ success: true, feedback });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET feedbacks for a specific opportunity
router.get('/opportunity/:id', async (req, res) => {
    try {
        const feedbacks = await Feedback.find({ opportunityId: req.params.id })
            .populate('fromUser', 'username fullName avatar')
            .sort('-createdAt');
        res.json({ success: true, data: feedbacks });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// POST App Rating
router.post('/app-rating', protect, async (req, res) => {
    try {
        const { rating, comment } = req.body;

        if (!rating) {
            return res.status(400).json({ success: false, message: 'Rating is required' });
        }

        const appRating = await AppRating.findOneAndUpdate(
            { user: req.user.id },
            { rating, comment },
            { upsert: true, new: true }
        );

        res.status(201).json({ success: true, data: appRating });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET App Rating status for current user
router.get('/app-rating/status', protect, async (req, res) => {
    try {
        const rating = await AppRating.findOne({ user: req.user.id });
        const user = await User.findById(req.user.id).select('loginCount');

        res.json({
            success: true,
            hasRated: !!rating,
            loginCount: user.loginCount
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET all app ratings (public)
router.get('/app-rating/all', async (req, res) => {
    try {
        const ratings = await AppRating.find()
            .populate('user', 'username fullName volunteerDetails.avatar ngoDetails.logo')
            .sort('-createdAt')
            .limit(10);
        res.json({ success: true, data: ratings });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET latest feedbacks for any opportunity (public)
router.get('/opportunity-latest', async (req, res) => {
    try {
        const feedbacks = await Feedback.find()
            .populate('fromUser', 'username fullName volunteerDetails.avatar ngoDetails.logo')
            .populate('opportunityId', 'title')
            .sort('-createdAt')
            .limit(10);
        res.json({ success: true, data: feedbacks });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

const Pickup = require('../models/Pickup');

// GET Global Stats for Impact Overview
router.get('/global-stats', async (req, res) => {
    try {
        const totalPickups = await Pickup.countDocuments({ status: 'completed' });
        const totalUsers = await User.countDocuments();

        // Calculate total amount (approximate weight)
        const pickups = await Pickup.find({ status: 'completed' }).select('amount unit');
        let totalKg = 0;
        pickups.forEach(p => {
            let kg = p.amount;
            if (p.unit.includes('Bags')) kg = p.amount * 5;
            if (p.unit.includes('Items')) kg = p.amount * 0.5;
            totalKg += kg;
        });

        // Calculate Carbon Saved (0.5kg CO2 per 1kg recycled waste - ballpark)
        const carbonSaved = (totalKg * 0.5).toFixed(1);

        // Avg Rating
        const ratings = await AppRating.find().select('rating');
        const avgRating = ratings.length > 0
            ? (ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length).toFixed(1)
            : '4.8';

        res.json({
            success: true,
            data: {
                unitsRecycled: totalKg,
                activeMissions: totalPickups + 20, // offset for empty DB demo
                carbonSaved: carbonSaved,
                avgRating: avgRating,
                totalUsers: totalUsers
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
