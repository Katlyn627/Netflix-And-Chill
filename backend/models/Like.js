class Like {
  constructor(fromUserId, toUserId, type = 'like') {
    this.id = this.generateId();
    this.fromUserId = fromUserId;
    this.toUserId = toUserId;
    this.type = type; // 'like' or 'superlike'
    this.read = false; // Whether the recipient has viewed the like
    this.createdAt = new Date().toISOString();
  }

  generateId() {
    return 'like_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  toJSON() {
    return {
      id: this.id,
      fromUserId: this.fromUserId,
      toUserId: this.toUserId,
      type: this.type,
      read: this.read,
      createdAt: this.createdAt
    };
  }
}

module.exports = Like;
