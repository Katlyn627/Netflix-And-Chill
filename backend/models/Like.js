class Like {
  constructor(fromUserId, toUserId, type = 'like') {
    this.id = this.generateId();
    this.fromUserId = fromUserId;
    this.toUserId = toUserId;
    this.type = type; // 'like' or 'superlike'
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
      createdAt: this.createdAt
    };
  }
}

module.exports = Like;
