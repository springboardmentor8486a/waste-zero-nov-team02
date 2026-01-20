const express = require('express');
const router = express.Router();
const ChatRequest = require('../models/ChatRequest');
const Message = require('../models/Message');
const User = require('../models/User');
const protect = require('../middleware/auth');

// @route   POST /api/chat/request
// @desc    Send a chat request
router.post('/request', protect, async (req, res) => {
    try {
        const { receiverId, message } = req.body;

        if (receiverId === req.user.id) {
            return res.status(400).json({ success: false, message: 'Cannot request yourself' });
        }

        // Check if request already exists
        const existing = await ChatRequest.findOne({
            sender: req.user.id,
            receiver: receiverId,
            status: 'pending'
        });

        if (existing) {
            return res.status(400).json({ success: false, message: 'Request already pending' });
        }

        // Check if reverse request exists (sender is receiver)
        const reverse = await ChatRequest.findOne({
            sender: receiverId,
            receiver: req.user.id,
            status: 'pending'
        });

        if (reverse) {
            // Auto-accept locally or just let them accept?
            // Simple logic: tell user to accept the incoming request
            return res.status(400).json({ success: false, message: 'This user already sent you a request. Check incoming.' });
        }

        const newRequest = await ChatRequest.create({
            sender: req.user.id,
            receiver: receiverId,
            message: message || ""
        });

        res.json({ success: true, data: newRequest });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/chat/requests
// @desc    Get all requests (incoming and outgoing) or active chats
//          For simplicity, we'll fetch 'pending' incoming requests here mainly.
router.get('/requests', protect, async (req, res) => {
    try {
        // Incoming requests (people asking ME)
        const incoming = await ChatRequest.find({
            receiver: req.user.id,
            status: 'pending'
        })
            .populate('sender', 'username fullName email volunteerDetails.avatar ngoDetails.logo ngoDetails.organizationName role')
            .sort('-createdAt');

        // Outgoing requests (people I asked)
        const outgoing = await ChatRequest.find({
            sender: req.user.id,
            status: 'pending'
        })
            .populate('receiver', 'username fullName email volunteerDetails.avatar ngoDetails.logo ngoDetails.organizationName role')
            .sort('-createdAt');

        res.json({ success: true, incoming, outgoing });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/chat/my
// @desc    Get accepted chats (my conversations)
//          Ideally this should query a Message model or accepted ChatRequests
router.get('/my', protect, async (req, res) => {
    try {
        // Find accepted requests where I am sender or receiver
        const connections = await ChatRequest.find({
            $or: [{ sender: req.user.id }, { receiver: req.user.id }],
            status: 'accepted'
        })
            .populate('sender', 'username fullName email volunteerDetails.avatar ngoDetails.logo role')
            .populate('receiver', 'username fullName email volunteerDetails.avatar ngoDetails.logo role')

        // Format for frontend
        const chats = connections.map(conn => {
            // If I am sender, partner is receiver.
            const isSender = conn.sender._id.toString() === req.user.id;
            const partner = isSender ? conn.receiver : conn.sender;

            let displayName = partner.fullName || partner.username;
            let avatar = partner.volunteerDetails?.avatar || partner.ngoDetails?.logo;

            // Normalize avatar
            if (avatar && !avatar.startsWith('http') && avatar !== 'no-photo.jpg') {
                avatar = `http://localhost:5000${avatar}`;
            }

            return {
                id: conn._id,
                partnerId: partner._id,
                title: displayName,
                avatar: avatar || `https://ui-avatars.com/api/?name=${displayName}`,
                status: 'accepted',
                online: false // Placeholder
            };
        });

        res.json({ success: true, data: chats });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


// @route   PUT /api/chat/request/:id
// @desc    Accept or Reject
router.put('/request/:id', protect, async (req, res) => {
    try {
        const { status } = req.body; // 'accepted' or 'rejected'
        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const request = await ChatRequest.findOne({
            _id: req.params.id,
            receiver: req.user.id // Only receiver can act
        });

        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        request.status = status;
        await request.save();

        res.json({ success: true, data: request });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/chat/message
// @desc    Send a message
router.post('/message', protect, async (req, res) => {
    try {
        const { receiverId, content, connectionId } = req.body;

        // Create message
        const message = await Message.create({
            sender_id: req.user.id,
            receiver_id: receiverId,
            content
        });

        res.json({ success: true, data: message });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/chat/messages/:partnerId
// @desc    Get messages with a partner
router.get('/messages/:partnerId', protect, async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                { sender_id: req.user.id, receiver_id: req.params.partnerId },
                { sender_id: req.params.partnerId, receiver_id: req.user.id }
            ]
        }).sort('createdAt');

        res.json({ success: true, data: messages });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/chat/request/:id
// @desc    Delete a chat conversation (request)
router.delete('/request/:id', protect, async (req, res) => {
    try {
        const chat = await ChatRequest.findOne({
            _id: req.params.id,
            $or: [{ sender: req.user.id }, { receiver: req.user.id }]
        });

        if (!chat) {
            return res.status(404).json({ success: false, message: 'Chat not found' });
        }

        await ChatRequest.findByIdAndDelete(req.params.id);

        // Optionally delete messages too, but usually we keep them or cascade delete.
        // For now, just delete the connection.

        res.json({ success: true, message: 'Chat deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/chat/messages/:partnerId
// @desc    Clear chat history with a partner
router.delete('/messages/:partnerId', protect, async (req, res) => {
    try {
        await Message.deleteMany({
            $or: [
                { sender_id: req.user.id, receiver_id: req.params.partnerId },
                { sender_id: req.params.partnerId, receiver_id: req.user.id }
            ]
        });

        res.json({ success: true, message: 'Chat history cleared' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
