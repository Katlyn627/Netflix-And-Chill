/**
 * Movie Quiz Scoring and Personality Analysis System
 * Calculates scores, derives personality traits, and generates compatibility scores
 */

const { QUIZ_QUESTIONS, QUIZ_CATEGORIES } = require('../constants/quizQuestions');
const QuizAttempt = require('../models/QuizAttempt');

/**
 * Personality archetypes based on quiz responses
 */
const PERSONALITY_ARCHETYPES = {
  cinephile: {
    name: 'The Cinephile',
    description: 'Deep appreciation for film as an art form',
    indicators: ['viewing_style', 'movie_preferences', 'engagement']
  },
  casual_viewer: {
    name: 'The Casual Viewer',
    description: 'Enjoys movies for entertainment and relaxation',
    indicators: ['viewing_habits', 'pacing']
  },
  binge_watcher: {
    name: 'The Binge Watcher',
    description: 'Loves marathon viewing sessions',
    indicators: ['viewing_habits', 'viewing_environment']
  },
  social_butterfly: {
    name: 'The Social Butterfly',
    description: 'Prefers watching and discussing with others',
    indicators: ['social_viewing', 'viewing_etiquette']
  },
  genre_specialist: {
    name: 'The Genre Specialist',
    description: 'Strong preferences for specific genres',
    indicators: ['movie_preferences', 'content', 'franchises']
  },
  critic: {
    name: 'The Critic',
    description: 'Analytical viewer who pays attention to details',
    indicators: ['engagement', 'movie_preferences', 'viewing_habits']
  },
  collector: {
    name: 'The Collector',
    description: 'Passionate about physical media and memorabilia',
    indicators: ['collecting', 'engagement']
  },
  tech_enthusiast: {
    name: 'The Tech Enthusiast',
    description: 'Values high-quality viewing experience',
    indicators: ['viewing_environment', 'production']
  }
};

class MovieQuizScoring {
  /**
   * Process quiz responses and create a complete QuizAttempt
   * @param {string} userId 
   * @param {Array} answers - Array of {questionId, selectedValue}
   * @returns {QuizAttempt}
   */
  static processQuizCompletion(userId, answers) {
    const quizAttempt = new QuizAttempt({ userId });
    
    // Add points to each answer based on question configuration
    answers.forEach(answer => {
      const question = QUIZ_QUESTIONS.find(q => q.id === answer.questionId);
      if (question) {
        const option = question.options.find(opt => opt.value === answer.selectedValue);
        const points = option ? option.points : 0;
        quizAttempt.setAnswer(answer.questionId, answer.selectedValue, points);
      }
    });
    
    // Calculate category scores
    const categoryScores = this.calculateCategoryScores(quizAttempt.answers);
    Object.keys(categoryScores).forEach(category => {
      quizAttempt.setCategoryScore(category, categoryScores[category]);
    });
    
    // Compute personality traits
    const personalityTraits = this.computePersonalityTraits(quizAttempt.answers, categoryScores);
    quizAttempt.personalityTraits = personalityTraits;
    
    // Calculate compatibility factors
    quizAttempt.compatibilityFactors = this.calculateCompatibilityFactors(categoryScores);
    
    return quizAttempt;
  }

  /**
   * Calculate normalized scores by category (0-100 scale)
   * @param {Array} answers - Array of {questionId, selectedValue, points}
   * @returns {Object} Category scores
   */
  static calculateCategoryScores(answers) {
    const categoryTotals = {};
    const categoryCounts = {};
    const categoryMaxPoints = {};
    
    // Group answers by category and sum points
    answers.forEach(answer => {
      const question = QUIZ_QUESTIONS.find(q => q.id === answer.questionId);
      if (question && question.category) {
        const category = question.category;
        
        if (!categoryTotals[category]) {
          categoryTotals[category] = 0;
          categoryCounts[category] = 0;
          categoryMaxPoints[category] = 0;
        }
        
        categoryTotals[category] += answer.points || 0;
        categoryCounts[category]++;
        
        // Calculate max possible points for this question
        const maxPoints = Math.max(...question.options.map(opt => opt.points));
        categoryMaxPoints[category] += maxPoints;
      }
    });
    
    // Normalize scores to 0-100 scale
    const normalizedScores = {};
    Object.keys(categoryTotals).forEach(category => {
      if (categoryMaxPoints[category] > 0) {
        const rawScore = categoryTotals[category];
        const maxScore = categoryMaxPoints[category];
        normalizedScores[category] = (rawScore / maxScore) * 100;
      } else {
        normalizedScores[category] = 0;
      }
    });
    
    return normalizedScores;
  }

  /**
   * Compute personality traits and archetypes from quiz responses
   * @param {Array} answers 
   * @param {Object} categoryScores 
   * @returns {Object} Personality traits data
   */
  static computePersonalityTraits(answers, categoryScores) {
    const traits = {};
    const archetypes = [];
    
    // Analyze category patterns to determine personality traits
    Object.keys(categoryScores).forEach(category => {
      const score = categoryScores[category];
      traits[category] = {
        score: score,
        level: this.getTraitLevel(score)
      };
    });
    
    // Determine archetypes based on category scores
    Object.keys(PERSONALITY_ARCHETYPES).forEach(archetypeKey => {
      const archetype = PERSONALITY_ARCHETYPES[archetypeKey];
      let matchScore = 0;
      let indicatorCount = 0;
      
      archetype.indicators.forEach(indicator => {
        if (categoryScores[indicator] !== undefined) {
          matchScore += categoryScores[indicator];
          indicatorCount++;
        }
      });
      
      // Average match score for this archetype
      const avgMatch = indicatorCount > 0 ? matchScore / indicatorCount : 0;
      
      // If average match is high enough, include this archetype
      if (avgMatch >= 65) {
        archetypes.push({
          type: archetypeKey,
          name: archetype.name,
          description: archetype.description,
          strength: avgMatch
        });
      }
    });
    
    // Sort archetypes by strength
    archetypes.sort((a, b) => b.strength - a.strength);
    
    // Get dominant traits (top categories)
    const dominantTraits = Object.entries(categoryScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category, score]) => ({
        category,
        name: QUIZ_CATEGORIES[category] || category,
        score
      }));
    
    return {
      archetypes: archetypes.slice(0, 3), // Top 3 archetypes
      traits,
      dominantTraits
    };
  }

  /**
   * Get trait level description based on score
   * @param {number} score - 0-100
   * @returns {string}
   */
  static getTraitLevel(score) {
    if (score >= 80) return 'very_high';
    if (score >= 60) return 'high';
    if (score >= 40) return 'moderate';
    if (score >= 20) return 'low';
    return 'very_low';
  }

  /**
   * Calculate compatibility factors for matching
   * @param {Object} categoryScores 
   * @returns {Object}
   */
  static calculateCompatibilityFactors(categoryScores) {
    return {
      viewingStyle: categoryScores.viewing_style || 0,
      contentPreferences: (
        (categoryScores.movie_preferences || 0) +
        (categoryScores.content || 0) +
        (categoryScores.franchises || 0)
      ) / 3,
      socialViewing: (
        (categoryScores.social_viewing || 0) +
        (categoryScores.viewing_etiquette || 0)
      ) / 2,
      engagement: (
        (categoryScores.engagement || 0) +
        (categoryScores.viewing_habits || 0)
      ) / 2
    };
  }

  /**
   * Generate personality-based biography text
   * @param {Object} personalityTraits 
   * @returns {string}
   */
  static generatePersonalityBio(personalityTraits) {
    const { archetypes, dominantTraits } = personalityTraits;
    
    if (!archetypes || archetypes.length === 0) {
      return '';
    }
    
    const parts = [];
    
    // Primary archetype
    const primary = archetypes[0];
    parts.push(primary.description);
    
    // Add insights from dominant traits
    if (dominantTraits && dominantTraits.length > 0) {
      const topTrait = dominantTraits[0];
      const traitDescriptions = this.getTraitDescriptions();
      
      if (traitDescriptions[topTrait.category]) {
        parts.push(traitDescriptions[topTrait.category]);
      }
    }
    
    // Combine with secondary archetypes if present
    if (archetypes.length > 1) {
      const secondary = archetypes[1];
      parts.push(`Also ${secondary.description.toLowerCase()}.`);
    }
    
    return parts.join('. ') + '.';
  }

  /**
   * Get trait descriptions for bio generation
   * @returns {Object}
   */
  static getTraitDescriptions() {
    return {
      viewing_style: 'Has strong preferences about how to watch',
      viewing_habits: 'Well-established viewing routines',
      social_viewing: 'Enjoys the social aspects of watching together',
      movie_preferences: 'Has refined taste in films',
      franchises: 'Passionate about specific series and universes',
      storytelling: 'Appreciates narrative complexity',
      pacing: 'Particular about film pacing and rhythm',
      content: 'Has clear content preferences',
      representation: 'Values diverse representation',
      production: 'Appreciates production quality',
      viewing_environment: 'Cares about the viewing setup',
      viewing_etiquette: 'Has strong viewing etiquette preferences',
      collecting: 'Passionate about collecting',
      engagement: 'Highly engaged with film culture'
    };
  }

  /**
   * Calculate quiz-based compatibility between two users
   * @param {QuizAttempt} attempt1 
   * @param {QuizAttempt} attempt2 
   * @returns {Object} Compatibility score and details
   */
  static calculateQuizCompatibility(attempt1, attempt2) {
    if (!attempt1 || !attempt2) {
      return { score: 0, details: {} };
    }
    
    let totalScore = 0;
    const details = {};
    
    // Compare category scores (40% weight)
    const categoryCompatibility = this.compareCategoryScores(
      attempt1.categoryScores,
      attempt2.categoryScores
    );
    totalScore += categoryCompatibility * 0.4;
    details.categoryCompatibility = categoryCompatibility;
    
    // Compare personality archetypes (30% weight)
    const archetypeCompatibility = this.compareArchetypes(
      attempt1.personalityTraits.archetypes,
      attempt2.personalityTraits.archetypes
    );
    totalScore += archetypeCompatibility * 0.3;
    details.archetypeCompatibility = archetypeCompatibility;
    
    // Compare specific answer similarities (30% weight)
    const answerCompatibility = this.compareAnswers(
      attempt1.answers,
      attempt2.answers
    );
    totalScore += answerCompatibility * 0.3;
    details.answerCompatibility = answerCompatibility;
    
    return {
      score: Math.round(totalScore),
      details
    };
  }

  /**
   * Compare category scores between two quiz attempts
   * @param {Object} scores1 
   * @param {Object} scores2 
   * @returns {number} Compatibility score 0-100
   */
  static compareCategoryScores(scores1, scores2) {
    const categories = new Set([...Object.keys(scores1), ...Object.keys(scores2)]);
    let totalDifference = 0;
    let count = 0;
    
    categories.forEach(category => {
      const score1 = scores1[category] || 50; // Default to middle if missing
      const score2 = scores2[category] || 50;
      const difference = Math.abs(score1 - score2);
      totalDifference += difference;
      count++;
    });
    
    if (count === 0) return 0;
    
    // Convert difference to similarity score
    const avgDifference = totalDifference / count;
    return Math.max(0, 100 - avgDifference);
  }

  /**
   * Compare personality archetypes
   * @param {Array} archetypes1 
   * @param {Array} archetypes2 
   * @returns {number} Compatibility score 0-100
   */
  static compareArchetypes(archetypes1, archetypes2) {
    if (!archetypes1 || !archetypes2 || archetypes1.length === 0 || archetypes2.length === 0) {
      return 50; // Neutral score if no archetypes
    }
    
    const types1 = new Set(archetypes1.map(a => a.type));
    const types2 = new Set(archetypes2.map(a => a.type));
    
    // Count shared archetypes
    let sharedCount = 0;
    types1.forEach(type => {
      if (types2.has(type)) {
        sharedCount++;
      }
    });
    
    // Calculate compatibility based on overlap
    const totalUnique = new Set([...types1, ...types2]).size;
    if (totalUnique === 0) return 50;
    
    return (sharedCount / totalUnique) * 100;
  }

  /**
   * Compare individual answers between two quiz attempts
   * @param {Array} answers1 
   * @param {Array} answers2 
   * @returns {number} Compatibility score 0-100
   */
  static compareAnswers(answers1, answers2) {
    const answerMap1 = new Map(answers1.map(a => [a.questionId, a.selectedValue]));
    const answerMap2 = new Map(answers2.map(a => [a.questionId, a.selectedValue]));
    
    let matchCount = 0;
    let totalCount = 0;
    
    answerMap1.forEach((value, questionId) => {
      if (answerMap2.has(questionId)) {
        totalCount++;
        if (answerMap2.get(questionId) === value) {
          matchCount++;
        }
      }
    });
    
    if (totalCount === 0) return 0;
    
    return (matchCount / totalCount) * 100;
  }

  /**
   * Get latest quiz attempt for a user
   * @param {Array} quizAttempts 
   * @returns {QuizAttempt|null}
   */
  static getLatestAttempt(quizAttempts) {
    if (!quizAttempts || quizAttempts.length === 0) return null;
    
    return quizAttempts.reduce((latest, current) => {
      const latestDate = new Date(latest.completedAt);
      const currentDate = new Date(current.completedAt);
      return currentDate > latestDate ? current : latest;
    });
  }
}

module.exports = MovieQuizScoring;
