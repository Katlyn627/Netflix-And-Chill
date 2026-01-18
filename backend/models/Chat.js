class Chat {
  constructor(data) {
    this.id = data.id || this.generateId();
    this.senderId = data.senderId;
    this.receiverId = data.receiverId;
    this.message = data.message;
    this.timestamp = data.timestamp || new Date().toISOString();
    this.read = data.read || false;
    this.reactions = data.reactions || []; // Array of {userId, emoji, timestamp}
    this.replyTo = data.replyTo || null; // ID of message being replied to
    this.messageType = data.messageType || 'text'; // 'text', 'voice', 'gif', 'sticker'
  }

  generateId() {
    return 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  addReaction(userId, emoji) {
    // Remove existing reaction from this user
    this.reactions = this.reactions.filter(r => r.userId !== userId);
    // Add new reaction
    this.reactions.push({
      userId,
      emoji,
      timestamp: new Date().toISOString()
    });
  }

  removeReaction(userId) {
    this.reactions = this.reactions.filter(r => r.userId !== userId);
  }

  toJSON() {
    return {
      id: this.id,
      senderId: this.senderId,
      receiverId: this.receiverId,
      message: this.message,
      timestamp: this.timestamp,
      read: this.read,
      reactions: this.reactions,
      replyTo: this.replyTo,
      messageType: this.messageType
    };
  }
}

module.exports = Chat;
