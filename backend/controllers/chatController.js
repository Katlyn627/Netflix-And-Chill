const Chat = require('../models/Chat');
const DataStore = require('../utils/dataStore');

const dataStore = new DataStore();

class ChatController {
  async sendMessage(req, res) {
    try {
      const { senderId, receiverId, message } = req.body;

      if (!senderId || !receiverId || !message) {
        return res.status(400).json({ error: 'senderId, receiverId, and message are required' });
      }

      // Verify both users exist
      const sender = await dataStore.findUserById(senderId);
      const receiver = await dataStore.findUserById(receiverId);

      if (!sender || !receiver) {
        return res.status(404).json({ error: 'Sender or receiver not found' });
      }

      const chatMessage = new Chat({
        senderId,
        receiverId,
        message
      });

      await dataStore.addChatMessage(chatMessage);

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

      const messages = await dataStore.getChatMessages(userId1, userId2);

      res.json({
        userId1,
        userId2,
        messages: messages.map(m => m.toJSON ? m.toJSON() : m)
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new ChatController();
