const express = require('express');
const chatController = require('../controllers/chatController');

const router = express.Router();

// Get Stream Chat token for a user
router.get('/token/:userId', chatController.getStreamToken.bind(chatController));

// Send a message
router.post('/send', chatController.sendMessage.bind(chatController));

// Get messages between two users
router.get('/:userId1/:userId2', chatController.getMessages.bind(chatController));

// Get unread message counts for a user
router.get('/unread/:userId', chatController.getUnreadCounts.bind(chatController));

module.exports = router;
