const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const VolunteerProfile = require('../models/VolunteerProfile');
const NgoProfile = require('../models/NgoProfile');
const protect = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const { sendEmail } = require('../utils/sendOTP');
const AdminLog = require('../models/AdminLog');

// Middleware to check for Admin role
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    };
};

const Opportunity = require('../models/Opportunity');
const Message = require('../models/Message');
const Application = require('../models/Application');
const Pickup = require('../models/Pickup');

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
// @access  Private/Admin
router.get('/stats', protect, authorize('admin'), async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const volunteers = await User.countDocuments({ role: 'volunteer' });
        const ngos = await User.countDocuments({ role: 'ngo' });
        const opportunities = await Opportunity.countDocuments();
        const activeChats = await Message.distinct('conversation_id').countDocuments();

        const stats = {
            totalUsers,
            volunteers,
            ngos,
            opportunities,
            activeChats
        };

        res.json(stats);
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/admin/overview
// @desc    Get admin dashboard overview with recent activity
// @access  Private/Admin
router.get('/overview', protect, authorize('admin'), async (req, res) => {
    try {
        const stats = {
            totalUsers: await User.countDocuments(),
            volunteers: await User.countDocuments({ role: 'volunteer' }),
            ngos: await User.countDocuments({ role: 'ngo' }),
            opportunities: await Opportunity.countDocuments(),
            activeChats: await Message.distinct('conversation_id').countDocuments(),
            applications: await Application.countDocuments(),
            completedPickups: await Pickup.countDocuments({ status: 'completed' })
        };

        // Recent activity (last 10 admin actions)
        const recentActivity = await AdminLog.find()
            .populate('performedBy', 'username email')
            .populate('targetUser', 'username email')
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        // Recent registrations (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentRegistrations = await User.find({
            createdAt: { $gte: sevenDaysAgo }
        })
            .select('username email role createdAt')
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        res.json({
            success: true,
            stats,
            recentActivity,
            recentRegistrations
        });
    } catch (err) {
        console.error('Admin overview error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/admin/dashboard-data
// @desc    Get comprehensive dashboard data with charts
// @access  Private/Admin
router.get('/dashboard-data', protect, authorize('admin'), async (req, res) => {
    try {
        const { days = 30 } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));
        const endDate = new Date();

        // Overall stats
        const stats = {
            totalUsers: await User.countDocuments(),
            volunteers: await User.countDocuments({ role: 'volunteer' }),
            ngos: await User.countDocuments({ role: 'ngo' }),
            opportunities: await Opportunity.countDocuments(),
            applications: await Application.countDocuments(),
            activeChats: await Message.distinct('conversation_id').countDocuments(),
            completedPickups: await Pickup.countDocuments({ status: 'completed' })
        };

        // User registration trends (daily for last N days)
        const userGrowth = await User.aggregate([
            {
                $match: { createdAt: { $gte: startDate, $lte: endDate } }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    total: { $sum: 1 },
                    volunteers: { $sum: { $cond: [{ $eq: ['$role', 'volunteer'] }, 1, 0] } },
                    ngos: { $sum: { $cond: [{ $eq: ['$role', 'ngo'] }, 1, 0] } }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Opportunity creation trends
        const opportunityTrends = await Opportunity.aggregate([
            {
                $match: { createdAt: { $gte: startDate, $lte: endDate } }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 },
                    open: { $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] } },
                    closed: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Application trends
        const applicationTrends = await Application.aggregate([
            {
                $match: { createdAt: { $gte: startDate, $lte: endDate } }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    total: { $sum: 1 },
                    pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
                    accepted: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] } },
                    rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Role distribution
        const roleDistribution = [
            { name: 'Volunteers', value: stats.volunteers, color: '#10b981' },
            { name: 'NGOs', value: stats.ngos, color: '#3b82f6' },
            { name: 'Admins', value: await User.countDocuments({ role: 'admin' }), color: '#ef4444' }
        ];

        // Recent events (last 20)
        const recentEvents = await Opportunity.find()
            .populate('ngo_id', 'username')
            .sort({ createdAt: -1 })
            .limit(20)
            .select('title ngo_id createdAt status location')
            .lean();

        // Top performing NGOs (by opportunities created)
        const topNgos = await Opportunity.aggregate([
            {
                $group: {
                    _id: '$ngo_id',
                    opportunityCount: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'ngo'
                }
            },
            { $unwind: '$ngo' },
            {
                $project: {
                    ngoName: '$ngo.username',
                    ngoEmail: '$ngo.email',
                    opportunityCount: 1
                }
            },
            { $sort: { opportunityCount: -1 } },
            { $limit: 5 }
        ]);

        // Recent admin logs (Last 10)
        const recentActivity = await AdminLog.find()
            .populate('performedBy', 'username avatar')
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        // System Health Stats (Real Atlas/DB Stats)
        let dbStats = { dataSize: 0, storageSize: 0, collections: 0 };
        try {
            // In Atlas, some stats might require command instead of db.stats()
            const statsCmd = await mongoose.connection.db.command({ dbStats: 1 });
            dbStats = {
                dataSize: statsCmd.dataSize || 0,
                storageSize: statsCmd.storageSize || 0,
                collections: statsCmd.collections || (await mongoose.connection.db.listCollections().toArray()).length
            };
        } catch (dbErr) {
            console.error('Error fetching DB stats:', dbErr);
            // Fallback for collection count
            try {
                dbStats.collections = (await mongoose.connection.db.listCollections().toArray()).length;
            } catch (e) { }
        }

        const systemStats = {
            memoryUsage: Math.round(process.memoryUsage().rss / 1024 / 1024) + ' MB',
            uptime: Math.round(process.uptime() / 3600) + ' Hours',
            nodeVersion: process.version,
            platform: process.platform,
            dbSize: (dbStats.storageSize / 1024 / 1024).toFixed(2) + ' MB',
            atlasMemory: (dbStats.dataSize / 1024 / 1024).toFixed(2) + ' MB',
            collections: dbStats.collections || 0
        };

        res.json({
            success: true,
            stats,
            systemStats,
            charts: {
                userGrowth,
                opportunityTrends,
                applicationTrends,
                roleDistribution
            },
            recentEvents,
            topNgos,
            recentActivity
        });
    } catch (err) {
        console.error('Admin dashboard data error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/admin/opportunities
// @desc    Get all opportunities with filters and applications
// @access  Private/Admin
router.get('/opportunities', protect, authorize('admin'), async (req, res) => {
    try {
        const { status, ngo, location, search } = req.query;
        const query = {};

        if (status) query.status = status;
        if (ngo) query.ngo_id = ngo;
        if (location) query.location = { $regex: location, $options: 'i' };
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { short: { $regex: search, $options: 'i' } }
            ];
        }

        const opportunities = await Opportunity.find(query)
            .populate('ngo_id', 'username fullName email')
            .populate('createdBy', 'username fullName email')
            .sort({ createdAt: -1 })
            .lean();

        // Get applications for each opportunity
        const opportunitiesWithApplications = await Promise.all(
            opportunities.map(async (opp) => {
                const applications = await Application.find({ opportunity_id: opp._id })
                    .populate('volunteer_id', 'username fullName email role')
                    .sort({ createdAt: -1 })
                    .lean();

                return {
                    ...opp,
                    applications: applications,
                    applicationCount: applications.length,
                    pendingCount: applications.filter(app => app.status === 'pending').length,
                    acceptedCount: applications.filter(app => app.status === 'accepted').length,
                    rejectedCount: applications.filter(app => app.status === 'rejected').length
                };
            })
        );

        res.json({ success: true, data: opportunitiesWithApplications });
    } catch (err) {
        console.error('Admin opportunities error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/admin/opportunities
// @desc    Create an opportunity (admin)
// @access  Private/Admin
router.post('/opportunities', protect, authorize('admin'), async (req, res) => {
    try {
        const {
            title, short, description, date, time, endTime, location, category,
            required_skills, duration, capacity, ngo_id, cover, attachments
        } = req.body;

        if (!title || !ngo_id) {
            return res.status(400).json({ success: false, message: 'Title and NGO ID are required' });
        }

        const opportunity = await Opportunity.create({
            title,
            short,
            description,
            date,
            time,
            endTime,
            location,
            category,
            required_skills: required_skills || [],
            duration,
            capacity,
            ngo_id,
            createdBy: req.user._id, // Admin who created it
            cover,
            attachments: attachments || [],
            status: 'open'
        });

        // Create Admin Log
        await AdminLog.create({
            action: 'CREATE_OPPORTUNITY',
            performedBy: req.user._id,
            details: `Created opportunity: ${title} for NGO ${ngo_id}`
        });

        res.status(201).json({ success: true, data: opportunity });
    } catch (err) {
        console.error('Create opportunity error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/admin/opportunities/:id
// @desc    Update an opportunity (admin)
// @access  Private/Admin
router.put('/opportunities/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const {
            title, short, description, date, time, endTime, location, category,
            required_skills, duration, capacity, status, cover, attachments
        } = req.body;

        const opportunity = await Opportunity.findById(req.params.id);
        if (!opportunity) {
            return res.status(404).json({ success: false, message: 'Opportunity not found' });
        }

        // Update fields
        if (title) opportunity.title = title;
        if (short !== undefined) opportunity.short = short;
        if (description !== undefined) opportunity.description = description;
        if (date !== undefined) opportunity.date = date;
        if (time !== undefined) opportunity.time = time;
        if (endTime !== undefined) opportunity.endTime = endTime;
        if (location !== undefined) opportunity.location = location;
        if (category !== undefined) opportunity.category = category;
        if (required_skills !== undefined) opportunity.required_skills = required_skills;
        if (duration !== undefined) opportunity.duration = duration;
        if (capacity !== undefined) opportunity.capacity = capacity;
        if (status !== undefined) opportunity.status = status;
        if (cover !== undefined) opportunity.cover = cover;
        if (attachments !== undefined) opportunity.attachments = attachments;

        await opportunity.save();

        // Create Admin Log
        await AdminLog.create({
            action: 'UPDATE_OPPORTUNITY',
            performedBy: req.user._id,
            details: `Updated opportunity: ${opportunity.title}`
        });

        res.json({ success: true, data: opportunity });
    } catch (err) {
        console.error('Update opportunity error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/admin/opportunities/:id
// @desc    Delete an opportunity
// @access  Private/Admin
router.delete('/opportunities/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const opportunity = await Opportunity.findById(req.params.id);
        if (!opportunity) {
            return res.status(404).json({ success: false, message: 'Opportunity not found' });
        }

        const title = opportunity.title;

        // Delete all applications for this opportunity
        await Application.deleteMany({ opportunity_id: req.params.id });

        // Delete the opportunity
        await Opportunity.findByIdAndDelete(req.params.id);

        // Create Admin Log
        await AdminLog.create({
            action: 'DELETE_OPPORTUNITY',
            performedBy: req.user._id,
            details: `Deleted opportunity: ${title} (and all associated applications)`
        });

        res.json({ success: true, message: 'Opportunity deleted successfully' });
    } catch (err) {
        console.error('Delete opportunity error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/admin/reports
// @desc    Get analytics and reports data
// @access  Private/Admin
router.get('/reports', protect, authorize('admin'), async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default: last 30 days
        const end = endDate ? new Date(endDate) : new Date();

        // User growth over time
        const userGrowth = await User.aggregate([
            {
                $match: { createdAt: { $gte: start, $lte: end } }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 },
                    volunteers: {
                        $sum: { $cond: [{ $eq: ['$role', 'volunteer'] }, 1, 0] }
                    },
                    ngos: {
                        $sum: { $cond: [{ $eq: ['$role', 'ngo'] }, 1, 0] }
                    }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Opportunity creation trends
        const opportunityTrends = await Opportunity.aggregate([
            {
                $match: { createdAt: { $gte: start, $lte: end } }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 },
                    open: {
                        $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] }
                    },
                    closed: {
                        $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] }
                    }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Volunteer participation (applications)
        const volunteerParticipation = await Application.aggregate([
            {
                $lookup: {
                    from: 'opportunities',
                    localField: 'opportunity_id',
                    foreignField: '_id',
                    as: 'opportunity'
                }
            },
            {
                $match: {
                    'opportunity.createdAt': { $gte: start, $lte: end }
                }
            },
            {
                $group: {
                    _id: '$volunteer_id',
                    applications: { $sum: 1 },
                    accepted: {
                        $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] }
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalApplications: { $sum: '$applications' },
                    uniqueVolunteers: { $sum: 1 },
                    acceptedApplications: { $sum: '$accepted' }
                }
            }
        ]);

        // Top NGOs by opportunities created
        const topNgos = await Opportunity.aggregate([
            {
                $match: { createdAt: { $gte: start, $lte: end } }
            },
            {
                $group: {
                    _id: '$ngo_id',
                    opportunityCount: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'ngo'
                }
            },
            { $unwind: '$ngo' },
            {
                $project: {
                    ngoId: '$_id',
                    ngoName: '$ngo.username',
                    ngoEmail: '$ngo.email',
                    opportunityCount: 1
                }
            },
            { $sort: { opportunityCount: -1 } },
            { $limit: 10 }
        ]);

        res.json({
            success: true,
            data: {
                userGrowth,
                opportunityTrends,
                volunteerParticipation: volunteerParticipation[0] || {
                    totalApplications: 0,
                    uniqueVolunteers: 0,
                    acceptedApplications: 0
                },
                topNgos
            }
        });
    } catch (err) {
        console.error('Admin reports error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PATCH /api/admin/users/:id/status
// @desc    Suspend/Activate user (alias for block/unblock)
// @access  Private/Admin
router.patch('/users/:id/status', protect, authorize('admin'), async (req, res) => {
    try {
        const { status } = req.body; // 'active' or 'suspended'
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (status === 'suspended') {
            user.isBlocked = true;
            user.blockedReason = req.body.reason || 'Suspended by admin';
            user.blockedBy = req.user._id;
            user.blockedAt = new Date();
        } else if (status === 'active') {
            user.isBlocked = false;
            user.blockedReason = null;
            user.blockedBy = null;
            user.blockedAt = null;
        } else {
            return res.status(400).json({ success: false, message: 'Invalid status. Use "active" or "suspended"' });
        }

        await user.save();

        await AdminLog.create({
            action: status === 'suspended' ? 'SUSPEND_USER' : 'ACTIVATE_USER',
            performedBy: req.user._id,
            targetUser: user._id,
            reason: req.body.reason,
            details: `${status === 'suspended' ? 'Suspended' : 'Activated'} user ${user.username}`
        });

        res.json({ success: true, message: `User ${status === 'suspended' ? 'suspended' : 'activated'} successfully` });
    } catch (err) {
        console.error('Update user status error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', protect, authorize('admin'), async (req, res) => {
    try {
        // Fetch users and populate their respective profiles
        const users = await User.find()
            .select('-password')
            .sort({ createdAt: -1 })
            .lean(); // Use lean for performance since we'll merge manually or just use as is

        // Since we have separate models, we might need to populate or merge.
        // Mongoose doesn't support conditional population based on role in one go easily without separate refs.
        // But our User model doesn't have refs to profiles.

        // Manual merging for high-fidelity registry with automatic cleanup:
        const enrichedUsers = await Promise.all(users.map(async (u) => {
            if (u.role === 'ngo') {
                const [ngoProfile, volProfile] = await Promise.all([
                    NgoProfile.findOne({ user: u._id }).lean(),
                    VolunteerProfile.findOne({ user: u._id })
                ]);

                // Cleanup: Remove volunteer profile if it exists (NGOs should only have NGO profile)
                if (volProfile) {
                    await VolunteerProfile.findByIdAndDelete(volProfile._id);
                    console.log(`[ADMIN] Cleaned: Removed VolunteerProfile from NGO user ${u.email}`);
                }

                return { ...u, ngoDetails: ngoProfile, volunteerDetails: null };
            } else if (u.role === 'volunteer') {
                const [volProfile, ngoProfile] = await Promise.all([
                    VolunteerProfile.findOne({ user: u._id }).lean(),
                    NgoProfile.findOne({ user: u._id })
                ]);

                // Cleanup: Remove NGO profile if it exists (Volunteers should only have Volunteer profile)
                if (ngoProfile) {
                    await NgoProfile.findByIdAndDelete(ngoProfile._id);
                    console.log(`[ADMIN] Cleaned: Removed NgoProfile from volunteer user ${u.email}`);
                }

                return { ...u, volunteerDetails: volProfile, ngoDetails: null };
            }
            // Admin users - no profiles
            return { ...u, volunteerDetails: null, ngoDetails: null };
        }));

        console.log(`[ADMIN] Registry synchronizing: ${enrichedUsers.length} agents retrieved and enriched.`);
        res.json({ success: true, data: enrichedUsers });
    } catch (err) {
        console.error(`[ADMIN] Registry error: ${err.message}`);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});



// @route   POST /api/admin/users
// @desc    Create a new user
// @access  Private/Admin
router.post('/users', protect, authorize('admin'), async (req, res) => {
    try {
        const { username, email, password, role, fullName, sendEmail: shouldSendEmail, orgName, website, phoneNumber, address } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        user = await User.create({
            username,
            email,
            password, // Will be hashed by pre-save middleware in Model
            role,
            fullName
        });

        // Automatic Profile Initialization protocol
        if (role === 'volunteer') {
            await VolunteerProfile.create({
                user: user._id,
                displayName: fullName || username,
                avatar: 'no-photo.jpg'
            });
        } else if (role === 'ngo') {
            await NgoProfile.create({
                user: user._id,
                organizationName: orgName || fullName || username,
                website: website || '',
                phoneNumber: phoneNumber || '',
                address: address || '',
                logo: 'no-photo.jpg'
            });
        }

        // Create Admin Log
        await AdminLog.create({
            action: 'CREATE_USER',
            performedBy: req.user._id,
            targetUser: user._id,
            details: `Created user ${username} with role ${role}`
        });

        // Send Credentials Email if requested
        if (shouldSendEmail) {
            const emailContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
                  <h2 style="color: #065f46; margin-bottom: 24px;">Welcome to WasteZero</h2>
                  <p style="color: #374151; margin-bottom: 16px;">Hello <strong>${fullName || username}</strong>,</p>
                  <p style="color: #374151; margin-bottom: 24px;">Your account has been created by the platform administrator. You can now access the WasteZero portal.</p>
                  
                  <div style="background-color: #f0fdf4; border: 1px solid #dcfce7; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                    <p style="margin: 0 0 8px 0; color: #166534; font-size: 12px; text-transform: uppercase; font-weight: bold; letter-spacing: 1px;">Your Credentials</p>
                    <p style="margin: 0 0 8px 0; color: #1f2937;"><strong>Email:</strong> ${email}</p>
                    <p style="margin: 0; color: #1f2937;"><strong>Password:</strong> ${password}</p>
                  </div>
                  
                  <p style="color: #6b7280; font-size: 14px;">For security, please change your password after your first login.</p>
                  
                  <a href="http://localhost:5173/login" style="display: inline-block; background-color: #065f46; color: white; text-decoration: none; padding: 12px 24px; border-radius: 9999px; font-weight: bold; font-size: 14px; margin-top: 16px;">Login Now</a>
                </div>
             `;

            try {
                await sendEmail(email, {
                    subject: 'Your WasteZero Account Credentials',
                    html: emailContent
                });
                console.log(`[ADMIN] Credentials emailed to ${email}`);
            } catch (emailErr) {
                console.error(`[ADMIN] Failed to send credentials email: ${emailErr.message}`);
            }
        }

        console.log(`[ADMIN] Authorized new ${role} agent: ${username} (${user._id})`);
        res.status(201).json({ success: true, data: user });
    } catch (err) {
        console.error(`[ADMIN] Creation protocol failure: ${err.message}`);
        res.status(500).json({ success: false, message: err.message });
    }
});

// @route   PUT /api/admin/users/:id
// @desc    Update a user
// @access  Private/Admin
router.put('/users/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const { username, fullName, role, email, orgName, website, phoneNumber, address } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { username, fullName, role, email },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Update Profiles accordingly
        if (role === 'ngo') {
            await NgoProfile.findOneAndUpdate(
                { user: user._id },
                {
                    organizationName: orgName || fullName,
                    website,
                    phoneNumber,
                    address
                },
                { upsert: true, new: true }
            );
        } else if (role === 'volunteer') {
            await VolunteerProfile.findOneAndUpdate(
                { user: user._id },
                { displayName: fullName },
                { upsert: true, new: true }
            );
        }

        // Create Admin Log
        await AdminLog.create({
            action: 'UPDATE_USER',
            performedBy: req.user._id,
            targetUser: user._id,
            details: `Updated details for ${username}`
        });

        res.json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @route   GET /api/admin/deletion-count
// @desc    Get today's deletion count for current admin
// @access  Private/Admin
router.get('/deletion-count', protect, authorize('admin'), async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const deletionCount = await AdminLog.countDocuments({
            action: 'DELETE_USER',
            performedBy: req.user._id,
            createdAt: {
                $gte: today,
                $lt: tomorrow
            }
        });

        res.json({ success: true, count: deletionCount, limit: 3 });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
// @access  Private/Admin
router.delete('/users/:id', protect, authorize('admin'), async (req, res) => {
    try {
        // Check daily deletion limit (3 per day)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const deletionCount = await AdminLog.countDocuments({
            action: 'DELETE_USER',
            performedBy: req.user._id,
            createdAt: {
                $gte: today,
                $lt: tomorrow
            }
        });

        if (deletionCount >= 3) {
            return res.status(403).json({
                success: false,
                message: 'Daily deletion limit reached. You can only delete 3 users per day. Please try again tomorrow.'
            });
        }

        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Create Admin Log
        await AdminLog.create({
            action: 'DELETE_USER',
            performedBy: req.user._id,
            targetUser: req.params.id,
            details: `Deleted user ${user.username || req.params.id}`
        });

        res.json({ success: true, message: 'User deleted', remainingDeletions: 3 - deletionCount - 1 });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/admin/users/:id/block
// @desc    Block a user
// @access  Private/Admin
router.post('/users/:id/block', protect, authorize('admin'), async (req, res) => {
    try {
        const { reason } = req.body;
        if (!reason) {
            return res.status(400).json({ success: false, message: 'Reason is required for blocking' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.isBlocked = true;
        user.blockedReason = reason;
        user.blockedBy = req.user._id;
        user.blockedAt = new Date();
        await user.save();

        await AdminLog.create({
            action: 'BLOCK_USER',
            performedBy: req.user._id,
            targetUser: user._id,
            reason: reason,
            details: `Blocked user ${user.username}`
        });

        res.json({ success: true, message: 'User blocked successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @route   POST /api/admin/users/:id/unblock
// @desc    Unblock a user
// @access  Private/Admin
router.post('/users/:id/unblock', protect, authorize('admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.isBlocked = false;
        user.blockedReason = null;
        user.blockedBy = null;
        user.blockedAt = null;
        await user.save();

        await AdminLog.create({
            action: 'UNBLOCK_USER',
            performedBy: req.user._id,
            targetUser: user._id,
            details: `Unblocked user ${user.username}`
        });

        res.json({ success: true, message: 'User unblocked successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @route   GET /api/admin/logs
// @desc    Get audit logs
// @access  Private/Admin
router.get('/logs', protect, authorize('admin'), async (req, res) => {
    try {
        const logs = await AdminLog.find()
            .populate('performedBy', 'username email role')
            .populate('targetUser', 'username email role')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: logs });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
