class Match {
  constructor(user1Id, user2Id, score, sharedContent, matchDescription, compatibilityScores = {}) {
    this.id = this.generateId();
    this.user1Id = user1Id;
    this.user2Id = user2Id;
    this.matchScore = score;
    this.sharedContent = sharedContent || [];
    this.matchDescription = matchDescription || `${Math.round(score)}% Movie Match`;
    this.quizCompatibility = compatibilityScores.quizCompatibility || 0;
    this.snackCompatibility = compatibilityScores.snackCompatibility || 0;
    this.debateCompatibility = compatibilityScores.debateCompatibility || 0;
    this.emotionalToneCompatibility = compatibilityScores.emotionalToneCompatibility || 0;
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
      matchDescription: this.matchDescription,
      quizCompatibility: this.quizCompatibility,
      snackCompatibility: this.snackCompatibility,
      debateCompatibility: this.debateCompatibility,
      emotionalToneCompatibility: this.emotionalToneCompatibility,
      createdAt: this.createdAt
    };
  }
}

module.exports = Match;
