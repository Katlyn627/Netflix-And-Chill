class Chat {
  constructor(data) {
    this.id = data.id || this.generateId();
    this.senderId = data.senderId;
    this.receiverId = data.receiverId;
    this.message = data.message;
    this.timestamp = data.timestamp || new Date().toISOString();
    this.read = data.read || false;
  }

  generateId() {
    return 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  toJSON() {
    return {
      id: this.id,
      senderId: this.senderId,
      receiverId: this.receiverId,
      message: this.message,
      timestamp: this.timestamp,
      read: this.read
    };
  }
}

module.exports = Chat;
