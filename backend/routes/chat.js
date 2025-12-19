const express = require('express');
const chatController = require('../controllers/chatController');

const router = express.Router();

// Send a message
router.post('/send', chatController.sendMessage.bind(chatController));

// Get messages between two users
router.get('/:userId1/:userId2', chatController.getMessages.bind(chatController));

module.exports = router;
