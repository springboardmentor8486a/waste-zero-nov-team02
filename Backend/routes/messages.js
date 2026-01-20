const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const Application = require('../models/Application');
const Opportunity = require('../models/Opportunity');
const protect = require('../middleware/auth');
const Notification = require('../models/Notification');

// Rate limiting map (simple in-memory, in production use Redis)
const rateLimitMap = new Map();
const MESSAGE_RATE_LIMIT = 10; // messages per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

/**
 * Simple rate limiter for messages
 */
function checkRateLimit(userId) {
  const now = Date.now();
  const userLimits = rateLimitMap.get(userId) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW };

  if (now > userLimits.resetAt) {
    // Reset window
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (userLimits.count >= MESSAGE_RATE_LIMIT) {
    return false;
  }

  userLimits.count++;
  rateLimitMap.set(userId, userLimits);
  return true;
}

/**
 * Generate conversation ID from two user IDs (consistent ordering)
 */
function generateConversationId(userId1, userId2) {
  const ids = [userId1.toString(), userId2.toString()].sort();
  return `${ids[0]}_${ids[1]}`;
}

/**
 * Check if users have a valid match (both applied to same opportunity)
 */
async function validateMatch(senderId, receiverId) {
  try {
    // Get sender's applications
    const senderApplications = await Application.find({ volunteer_id: senderId }).select('opportunity_id');
    const senderOppIds = senderApplications.map(app => app.opportunity_id.toString());

    // Get receiver's applications
    const receiverApplications = await Application.find({ volunteer_id: receiverId }).select('opportunity_id');
    const receiverOppIds = receiverApplications.map(app => app.opportunity_id.toString());

    // Check if they share any opportunity
    const sharedOpportunities = senderOppIds.filter(id => receiverOppIds.includes(id));
    
    if (sharedOpportunities.length > 0) {
      return true;
    }

    // Also check if receiver is an NGO and sender applied to their opportunity
    const receiver = await User.findById(receiverId);
    if (receiver && receiver.role === 'ngo') {
      const ngoOpportunities = await Opportunity.find({ ngo_id: receiverId }).select('_id');
      const ngoOppIds = ngoOpportunities.map(opp => opp._id.toString());
      const hasMatch = senderOppIds.some(id => ngoOppIds.includes(id));
      if (hasMatch) return true;
    }

    // Check reverse: sender is NGO, receiver applied
    const sender = await User.findById(senderId);
    if (sender && sender.role === 'ngo') {
      const ngoOpportunities = await Opportunity.find({ ngo_id: senderId }).select('_id');
      const ngoOppIds = ngoOpportunities.map(opp => opp._id.toString());
      const hasMatch = receiverOppIds.some(id => ngoOppIds.includes(id));
      if (hasMatch) return true;
    }

    return false;
  } catch (error) {
    console.error('Error validating match:', error);
    return false;
  }
}

/**
 * @route   POST /api/messages
 * @desc    Send a message
 * @access  Private
 */
router.post('/', protect, async (req, res) => {
  try {
    const { receiver_id, content } = req.body;

    if (!receiver_id || !content) {
      return res.status(400).json({
        success: false,
        message: 'Receiver ID and content are required'
      });
    }

    if (receiver_id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send message to yourself'
      });
    }

    // Validate receiver exists
    const receiver = await User.findById(receiver_id);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    // Check rate limit
    if (!checkRateLimit(req.user._id.toString())) {
      return res.status(429).json({
        success: false,
        message: 'Rate limit exceeded. Please wait before sending more messages.'
      });
    }

    // Validate match exists (users must be matched through an opportunity)
    const hasMatch = await validateMatch(req.user._id, receiver_id);
    if (!hasMatch) {
      return res.status(403).json({
        success: false,
        message: 'You can only message users you are matched with through an opportunity'
      });
    }

    // Generate conversation ID
    const conversationId = generateConversationId(req.user._id, receiver_id);

    // Create message
    const message = await Message.create({
      sender_id: req.user._id,
      receiver_id: receiver_id,
      content: content.trim(),
      conversation_id: conversationId
    });

    // Populate sender info
    await message.populate('sender_id', 'username fullName email role');
    await message.populate('receiver_id', 'username fullName email role');

    // Create notification for receiver
    await Notification.create({
      recipient: receiver_id,
      sender: req.user._id,
      type: 'new_message',
      message: `New message from ${req.user.fullName || req.user.username}`
    });

    // Emit real-time event via WebSocket
    const io = req.app.get('io');
    if (io) {
      io.to(receiver_id.toString()).emit('newMessage', {
        message: message.toObject(),
        sender: {
          id: req.user._id,
          username: req.user.username,
          fullName: req.user.fullName
        }
      });
    }

    res.status(201).json({
      success: true,
      message: message
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

/**
 * @route   GET /api/messages/:userId
 * @desc    Get message history with a specific user
 * @access  Private
 */
router.get('/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const skip = parseInt(req.query.skip) || 0;

    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot get messages with yourself'
      });
    }

    // Validate user exists
    const otherUser = await User.findById(userId);
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get messages between the two users
    const messages = await Message.find({
      $or: [
        { sender_id: req.user._id, receiver_id: userId },
        { sender_id: userId, receiver_id: req.user._id }
      ]
    })
      .populate('sender_id', 'username fullName email role')
      .populate('receiver_id', 'username fullName email role')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    // Reverse to show oldest first
    messages.reverse();

    res.json({
      success: true,
      count: messages.length,
      messages
    });
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

/**
 * @route   GET /api/messages/conversations/list
 * @desc    Get list of all conversations for the current user
 * @access  Private
 */
router.get('/conversations/list', protect, async (req, res) => {
  try {
    // Get all unique conversations
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender_id: req.user._id },
            { receiver_id: req.user._id }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: '$conversation_id',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$receiver_id', req.user._id] }, { $eq: ['$isRead', false] }] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      },
      {
        $limit: 50
      }
    ]);

    // Populate user info for each conversation
    const populatedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const lastMsg = conv.lastMessage;
        const otherUserId = lastMsg.sender_id.toString() === req.user._id.toString()
          ? lastMsg.receiver_id
          : lastMsg.sender_id;

        const otherUser = await User.findById(otherUserId).select('username fullName email role avatar').lean();
        
        return {
          conversationId: conv._id,
          otherUser,
          lastMessage: {
            content: lastMsg.content,
            createdAt: lastMsg.createdAt
          },
          unreadCount: conv.unreadCount
        };
      })
    );

    res.json({
      success: true,
      conversations: populatedConversations
    });
  } catch (error) {
    console.error('Error getting conversations:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

module.exports = router;

