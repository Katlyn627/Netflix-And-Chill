const Chat = require('../models/Chat');
const { getDatabase } = require('../utils/database');
const streamChatService = require('../services/streamChatService');

class ChatController {
  async sendMessage(req, res) {
    try {
      const { senderId, receiverId, message } = req.body;

      if (!senderId || !receiverId || !message) {
        return res.status(400).json({ error: 'senderId, receiverId, and message are required' });
      }

      const dataStore = await getDatabase();

      // Verify both users exist
      const sender = await dataStore.findUserById(senderId);
      const receiver = await dataStore.findUserById(receiverId);

      if (!sender || !receiver) {
        return res.status(404).json({ error: 'Sender or receiver not found' });
      }

      // Create chat message in local database
      const chatMessage = new Chat({
        senderId,
        receiverId,
        message
      });

      await dataStore.addChatMessage(chatMessage);

      // If Stream Chat is configured, also send via Stream
      if (streamChatService.isReady()) {
        try {
          // Ensure users exist in Stream Chat
          await streamChatService.upsertUser(sender);
          await streamChatService.upsertUser(receiver);

          // Create or get the channel
          const channelInfo = await streamChatService.createOrGetChannel(senderId, receiverId);
          
          // Send message via Stream Chat
          if (channelInfo) {
            await streamChatService.sendMessage(channelInfo.channelId, senderId, message);
          }
        } catch (streamError) {
          console.error('Stream Chat error (non-fatal):', streamError.message);
          // Continue even if Stream Chat fails - we have the message in local storage
        }
      }

      res.json({
        success: true,
        message: 'Message sent successfully',
        chat: chatMessage.toJSON()
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getMessages(req, res) {
    try {
      const { userId1, userId2 } = req.params;

      if (!userId1 || !userId2) {
        return res.status(400).json({ error: 'Both user IDs are required' });
      }

      const dataStore = await getDatabase();
      
      // Try to get messages from Stream Chat first if configured
      let messages = [];
      if (streamChatService.isReady()) {
        try {
          const channelId = [userId1, userId2].sort().join('_');
          const streamMessages = await streamChatService.getMessages(channelId);
          
          if (streamMessages && streamMessages.length > 0) {
            // Convert Stream messages to our format
            messages = streamMessages.map(msg => ({
              senderId: msg.user_id || msg.user?.id,
              receiverId: msg.user_id === userId1 ? userId2 : userId1,
              message: msg.text,
              timestamp: msg.created_at
            }));
          }
        } catch (streamError) {
          console.error('Stream Chat error (falling back to local):', streamError.message);
        }
      }

      // Fallback to local database if Stream Chat not available or no messages
      if (messages.length === 0) {
        messages = await dataStore.getChatMessages(userId1, userId2);
        messages = messages.map(m => m.toJSON ? m.toJSON() : m);
      }

      res.json({
        success: true,
        userId1,
        userId2,
        messages
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // New endpoint to get Stream Chat token for client-side authentication
  async getStreamToken(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      if (!streamChatService.isReady()) {
        return res.status(503).json({ 
          error: 'Stream Chat is not configured',
          message: 'Please configure Stream Chat API keys in .env file'
        });
      }

      const dataStore = await getDatabase();
      const user = await dataStore.findUserById(userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Create user token for Stream Chat
      const token = streamChatService.createUserToken(userId);

      res.json({
        success: true,
        token,
        apiKey: process.env.STREAM_API_KEY,
        userId
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new ChatController();
