class Match {
  constructor(user1Id, user2Id, score, sharedContent) {
    this.id = this.generateId();
    this.user1Id = user1Id;
    this.user2Id = user2Id;
    this.matchScore = score;
    this.sharedContent = sharedContent || [];
    this.createdAt = new Date().toISOString();
  }

  generateId() {
    return 'match_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  toJSON() {
    return {
      id: this.id,
      user1Id: this.user1Id,
      user2Id: this.user2Id,
      matchScore: this.matchScore,
      sharedContent: this.sharedContent,
      createdAt: this.createdAt
    };
  }
}

module.exports = Match;
