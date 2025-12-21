/**
 * QuizAttempt Model
 * Represents a single quiz attempt by a user with answers, scores, and computed personality traits
 */

class QuizAttempt {
  constructor(data) {
    this.id = data.id || this.generateId();
    this.userId = data.userId;
    this.attemptDate = data.attemptDate || new Date().toISOString();
    this.quizVersion = data.quizVersion || 'v1'; // Track quiz version for backward compatibility
    
    // Raw answers: array of { questionId, selectedValue, points }
    this.answers = data.answers || [];
    
    // Normalized scores by category (0-100 scale)
    this.categoryScores = data.categoryScores || {};
    
    // Computed personality traits and archetypes
    this.personalityTraits = data.personalityTraits || {
      archetypes: [], // e.g., ['cinephile', 'casual_viewer', 'binge_watcher']
      traits: {}, // Detailed trait scores
      dominantTraits: [] // Top 3-5 most prominent traits
    };
    
    // Compatibility factors derived from this quiz attempt
    this.compatibilityFactors = data.compatibilityFactors || {
      viewingStyle: 0,
      contentPreferences: 0,
      socialViewing: 0,
      engagement: 0
    };
    
    this.completedAt = data.completedAt || new Date().toISOString();
  }

  generateId() {
    return 'quiz_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Get answer for a specific question
   * @param {string} questionId 
   * @returns {Object|null}
   */
  getAnswer(questionId) {
    return this.answers.find(a => a.questionId === questionId) || null;
  }

  /**
   * Add or update an answer
   * @param {string} questionId 
   * @param {string} selectedValue 
   * @param {number} points 
   */
  setAnswer(questionId, selectedValue, points) {
    const existingIndex = this.answers.findIndex(a => a.questionId === questionId);
    const answer = { questionId, selectedValue, points };
    
    if (existingIndex >= 0) {
      this.answers[existingIndex] = answer;
    } else {
      this.answers.push(answer);
    }
  }

  /**
   * Get category score (normalized 0-100)
   * @param {string} category 
   * @returns {number}
   */
  getCategoryScore(category) {
    return this.categoryScores[category] || 0;
  }

  /**
   * Set category score
   * @param {string} category 
   * @param {number} score 
   */
  setCategoryScore(category, score) {
    this.categoryScores[category] = Math.max(0, Math.min(100, score));
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      attemptDate: this.attemptDate,
      quizVersion: this.quizVersion,
      answers: this.answers,
      categoryScores: this.categoryScores,
      personalityTraits: this.personalityTraits,
      compatibilityFactors: this.compatibilityFactors,
      completedAt: this.completedAt
    };
  }
}

module.exports = QuizAttempt;
