const express = require('express');
const router = express.Router();
const User = require('../models/User');
const protect = require('../middleware/auth');

// @route   GET /api/users/search
// @desc    Search users by name, username, or email
// @access  Private
router.get('/search', protect, async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.json({ success: true, data: [] });
        }

        console.log("SEARCH QUERY:", q);

        let query = {
            _id: { $ne: req.user.id },
            role: { $ne: 'admin' },
            $or: [
                { username: { $regex: q, $options: 'i' } },
                { email: { $regex: q, $options: 'i' } },
                { fullName: { $regex: q, $options: 'i' } },
            ]
        };

        if (q === 'debug') {
            console.log("DEBUG MODE: Returning all users");
            query = {};
        }

        // Find users matching query (case-insensitive)
        const users = await User.find(query)
            .select('username email role fullName _id volunteerDetails.avatar ngoDetails.logo ngoDetails.organizationName')
            .limit(10);

        console.log("SEARCH HITS:", users.length);

        // Format results for frontend
        const formattedUsers = users.map(user => {
            let displayName = user.fullName;
            let displayRole = user.role;
            let avatar = null;
            let type = 'Individual'; // Default

            if (user.role === 'ngo') {
                displayName = user.ngoDetails?.organizationName || user.fullName || user.username || "Organization";
                type = 'Organization';
                avatar = user.ngoDetails?.logo;
            } else {
                type = 'Volunteer';
                avatar = user.volunteerDetails?.avatar;
                displayName = user.fullName || user.username || "Volunteer";
            }

            return {
                id: user._id,
                name: displayName,
                role: displayRole, // 'volunteer' or 'ngo'
                type: type,
                email: user.email,
                avatar: avatar
            };
        });

        res.json({ success: true, data: formattedUsers });
    } catch (err) {
        console.error('Search users error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
