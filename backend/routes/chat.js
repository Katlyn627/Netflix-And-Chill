const express = require('express');
const chatController = require('../controllers/chatController');

const router = express.Router();

// Get Stream Chat token for a user
router.get('/token/:userId', chatController.getStreamToken.bind(chatController));

// Get all notification counts (messages + invitations) for a user
router.get('/notifications/:userId', chatController.getAllNotificationCounts.bind(chatController));

// Get unread message counts for a user - must be before /:userId1/:userId2 route
router.get('/unread/:userId', chatController.getUnreadCounts.bind(chatController));

// Mark messages as read - must be before /:userId1/:userId2 route
router.put('/read/:userId/:senderId', chatController.markAsRead.bind(chatController));

// Add reaction to a message
router.post('/reaction/add', chatController.addReaction.bind(chatController));

// Remove reaction from a message
router.post('/reaction/remove', chatController.removeReaction.bind(chatController));

// Get typing status (placeholder)
router.get('/typing/:userId/:otherUserId', chatController.getTypingStatus.bind(chatController));

// Send a message
router.post('/send', chatController.sendMessage.bind(chatController));

// Get messages between two users
router.get('/:userId1/:userId2', chatController.getMessages.bind(chatController));

module.exports = router;
