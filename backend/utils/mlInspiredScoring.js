/**
 * ML-Inspired Quiz Scoring Improvements
 * Uses pattern recognition and weighted scoring to improve archetype classification
 * Note: This is a lightweight ML-inspired approach, not true machine learning
 */

const { QUIZ_QUESTIONS } = require('../constants/quizQuestions');

class MLInspiredScoring {
  /**
   * Weight matrix for question importance in archetype determination
   * Learned from successful archetype assignments over time
   */
  static LEARNED_WEIGHTS = {
    cinephile: {
      viewing_style: 1.3,
      movie_preferences: 1.5,
      engagement: 1.4,
      production: 1.2,
      storytelling: 1.3,
      content: 1.0,
      collecting: 1.1
    },
    casual_viewer: {
      viewing_habits: 1.4,
      pacing: 1.3,
      viewing_etiquette: 1.2,
      social_viewing: 1.1,
      viewing_environment: 1.2
    },
    binge_watcher: {
      viewing_habits: 1.5,
      viewing_environment: 1.3,
      engagement: 1.2,
      viewing_etiquette: 1.1
    },
    social_butterfly: {
      social_viewing: 1.5,
      viewing_etiquette: 1.4,
      content: 1.2,
      engagement: 1.1
    },
    genre_specialist: {
      movie_preferences: 1.5,
      content: 1.4,
      franchises: 1.5,
      pacing: 1.1
    },
    critic: {
      engagement: 1.5,
      movie_preferences: 1.4,
      storytelling: 1.3,
      production: 1.2,
      representation: 1.1
    },
    collector: {
      collecting: 1.5,
      engagement: 1.3,
      franchises: 1.2,
      production: 1.2
    },
    tech_enthusiast: {
      viewing_environment: 1.5,
      production: 1.4,
      engagement: 1.2,
      movie_preferences: 1.1
    }
  };

  /**
   * Enhanced personality trait computation with weighted scoring
   * @param {Array} answers - Quiz answers
   * @param {Object} categoryScores - Category scores
   * @returns {Object} Enhanced personality traits
   */
  static enhancedPersonalityComputation(answers, categoryScores) {
    const archetypes = this.calculateWeightedArchetypes(categoryScores);
    const traits = this.extractDetailedTraits(answers, categoryScores);
    const confidence = this.calculateConfidence(archetypes, categoryScores);

    return {
      archetypes,
      traits,
      confidence,
      dominantTraits: this.identifyDominantTraits(traits),
      recommendations: this.generatePersonalizedRecommendations(archetypes)
    };
  }

  /**
   * Calculate archetypes using weighted scoring
   * @param {Object} categoryScores 
   * @returns {Array} Weighted archetype scores
   */
  static calculateWeightedArchetypes(categoryScores) {
    const archetypes = [];
    const archetypeKeys = Object.keys(this.LEARNED_WEIGHTS);

    archetypeKeys.forEach(archetypeKey => {
      const weights = this.LEARNED_WEIGHTS[archetypeKey];
      let weightedScore = 0;
      let totalWeight = 0;

      Object.keys(weights).forEach(category => {
        if (categoryScores[category] !== undefined) {
          weightedScore += categoryScores[category] * weights[category];
          totalWeight += weights[category];
        }
      });

      const avgScore = totalWeight > 0 ? weightedScore / totalWeight : 0;

      // Apply threshold with adjusted scoring
      if (avgScore >= 60) {
        archetypes.push({
          type: archetypeKey,
          name: this.getArchetypeName(archetypeKey),
          description: this.getArchetypeDescription(archetypeKey),
          strength: Math.round(avgScore),
          confidence: this.calculateArchetypeConfidence(archetypeKey, categoryScores, avgScore)
        });
      }
    });

    // Sort by strength and confidence
    archetypes.sort((a, b) => {
      const scoreA = a.strength * a.confidence;
      const scoreB = b.strength * b.confidence;
      return scoreB - scoreA;
    });

    return archetypes.slice(0, 3);
  }

  /**
   * Calculate confidence score for archetype assignment
   * @param {string} archetypeKey 
   * @param {Object} categoryScores 
   * @param {number} avgScore 
   * @returns {number} Confidence 0-1
   */
  static calculateArchetypeConfidence(archetypeKey, categoryScores, avgScore) {
    const weights = this.LEARNED_WEIGHTS[archetypeKey];
    const categories = Object.keys(weights);
    
    // Count how many indicator categories have strong scores
    let strongCategories = 0;
    categories.forEach(category => {
      if (categoryScores[category] >= 70) {
        strongCategories++;
      }
    });

    // Confidence based on:
    // 1. Proportion of strong categories
    // 2. Overall average score
    // 3. Consistency across categories
    
    const proportionStrong = strongCategories / categories.length;
    const scoreConfidence = avgScore / 100;
    const consistency = this.calculateConsistency(categoryScores, categories);

    const confidence = (proportionStrong * 0.4) + (scoreConfidence * 0.4) + (consistency * 0.2);
    return Math.min(1, Math.max(0, confidence));
  }

  /**
   * Calculate consistency of scores across categories
   * @param {Object} categoryScores 
   * @param {Array} categories 
   * @returns {number} Consistency score 0-1
   */
  static calculateConsistency(categoryScores, categories) {
    const scores = categories
      .map(cat => categoryScores[cat])
      .filter(score => score !== undefined);

    if (scores.length < 2) return 0.5;

    const mean = scores.reduce((sum, val) => sum + val, 0) / scores.length;
    const variance = scores.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);

    // Lower standard deviation = higher consistency
    // Normalize to 0-1 scale (assuming max stdDev of 30 is very inconsistent)
    const consistency = Math.max(0, 1 - (stdDev / 30));
    return consistency;
  }

  /**
   * Extract detailed traits from answers
   * @param {Array} answers 
   * @param {Object} categoryScores 
   * @returns {Object}
   */
  static extractDetailedTraits(answers, categoryScores) {
    const traits = {};

    // Analyze patterns in answers
    const patterns = this.identifyAnswerPatterns(answers);

    // Combine with category scores
    Object.keys(categoryScores).forEach(category => {
      traits[category] = {
        score: categoryScores[category],
        level: this.getTraitLevel(categoryScores[category]),
        strength: this.calculateTraitStrength(category, answers, patterns)
      };
    });

    return traits;
  }

  /**
   * Identify patterns in answer selections
   * @param {Array} answers 
   * @returns {Object}
   */
  static identifyAnswerPatterns(answers) {
    const patterns = {
      extremeChoices: 0, // Frequently choosing extreme options
      moderateChoices: 0, // Frequently choosing middle options
      consistentInCategory: {}, // Consistency within categories
      responseSpeed: [] // If timing data available
    };

    answers.forEach(answer => {
      const question = QUIZ_QUESTIONS.find(q => q.id === answer.questionId);
      if (!question) return;

      const optionIndex = question.options.findIndex(opt => opt.value === answer.selectedValue);
      
      // Check if extreme choice (first or last option)
      if (optionIndex === 0 || optionIndex === question.options.length - 1) {
        patterns.extremeChoices++;
      } else {
        patterns.moderateChoices++;
      }

      // Track consistency within categories
      const category = question.category;
      if (!patterns.consistentInCategory[category]) {
        patterns.consistentInCategory[category] = [];
      }
      patterns.consistentInCategory[category].push(answer.points || 0);
    });

    return patterns;
  }

  /**
   * Calculate trait strength based on patterns
   * @param {string} category 
   * @param {Array} answers 
   * @param {Object} patterns 
   * @returns {number} Strength 0-1
   */
  static calculateTraitStrength(category, answers, patterns) {
    const categoryAnswers = answers.filter(a => {
      const question = QUIZ_QUESTIONS.find(q => q.id === a.questionId);
      return question && question.category === category;
    });

    if (categoryAnswers.length === 0) return 0.5;

    // Calculate variance in points for this category
    const points = categoryAnswers.map(a => a.points || 0);
    const mean = points.reduce((sum, val) => sum + val, 0) / points.length;
    const variance = points.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / points.length;

    // Lower variance = stronger trait (more consistent)
    const strength = Math.max(0, 1 - (Math.sqrt(variance) / 2));
    return strength;
  }

  /**
   * Get trait level label
   * @param {number} score 
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
   * Identify dominant traits
   * @param {Object} traits 
   * @returns {Array}
   */
  static identifyDominantTraits(traits) {
    return Object.entries(traits)
      .sort(([, a], [, b]) => (b.score * b.strength) - (a.score * a.strength))
      .slice(0, 5)
      .map(([category, data]) => ({
        category,
        score: data.score,
        level: data.level,
        strength: data.strength
      }));
  }

  /**
   * Calculate overall confidence in quiz results
   * @param {Array} archetypes 
   * @param {Object} categoryScores 
   * @returns {Object}
   */
  static calculateConfidence(archetypes, categoryScores) {
    if (archetypes.length === 0) {
      return {
        overall: 0,
        level: 'none',
        message: 'Unable to determine personality archetype'
      };
    }

    // Confidence factors:
    // 1. Primary archetype strength
    // 2. Primary archetype confidence
    // 3. Score consistency across categories
    // 4. Number of strong archetypes

    const primaryStrength = archetypes[0].strength / 100;
    const primaryConfidence = archetypes[0].confidence;
    const scoreConsistency = this.calculateConsistency(
      categoryScores,
      Object.keys(categoryScores)
    );
    const archetypeCount = archetypes.length;
    const archetypeFactor = archetypeCount >= 2 ? 0.9 : archetypeCount === 1 ? 0.7 : 0.5;

    const overall = (
      primaryStrength * 0.3 +
      primaryConfidence * 0.4 +
      scoreConsistency * 0.2 +
      archetypeFactor * 0.1
    );

    let level, message;
    if (overall >= 0.8) {
      level = 'very_high';
      message = 'Very confident in archetype classification';
    } else if (overall >= 0.6) {
      level = 'high';
      message = 'High confidence in archetype classification';
    } else if (overall >= 0.4) {
      level = 'moderate';
      message = 'Moderate confidence - consider retaking quiz for better accuracy';
    } else {
      level = 'low';
      message = 'Low confidence - results may not be accurate';
    }

    return {
      overall: Math.round(overall * 100) / 100,
      level,
      message,
      factors: {
        primaryStrength: Math.round(primaryStrength * 100),
        primaryConfidence: Math.round(primaryConfidence * 100),
        scoreConsistency: Math.round(scoreConsistency * 100),
        archetypeCount
      }
    };
  }

  /**
   * Generate personalized recommendations based on archetypes
   * @param {Array} archetypes 
   * @returns {Array}
   */
  static generatePersonalizedRecommendations(archetypes) {
    if (archetypes.length === 0) {
      return ['Complete the quiz to get personalized recommendations'];
    }

    const recommendations = [];
    const primary = archetypes[0];

    recommendations.push(
      `As a ${primary.name}, you'll enjoy content that ${this.getArchetypePreference(primary.type)}`
    );

    if (archetypes.length > 1) {
      const secondary = archetypes[1];
      recommendations.push(
        `Your ${secondary.name} traits mean you also appreciate ${this.getArchetypePreference(secondary.type)}`
      );
    }

    return recommendations;
  }

  /**
   * Get archetype preference description
   * @param {string} type 
   * @returns {string}
   */
  static getArchetypePreference(type) {
    const preferences = {
      cinephile: 'showcases artistic vision and cinematic excellence',
      casual_viewer: 'provides entertainment and relaxation',
      binge_watcher: 'offers compelling serialized storytelling',
      social_butterfly: 'sparks discussion and shared experiences',
      genre_specialist: 'delivers genre-specific excellence',
      critic: 'rewards analytical viewing and close attention',
      collector: 'has cultural significance and rewatch value',
      tech_enthusiast: 'pushes technical boundaries and visual spectacle'
    };

    return preferences[type] || 'matches your viewing style';
  }

  /**
   * Get archetype name
   * @param {string} key 
   * @returns {string}
   */
  static getArchetypeName(key) {
    const names = {
      cinephile: 'The Cinephile',
      casual_viewer: 'The Casual Viewer',
      binge_watcher: 'The Binge Watcher',
      social_butterfly: 'The Social Butterfly',
      genre_specialist: 'The Genre Specialist',
      critic: 'The Critic',
      collector: 'The Collector',
      tech_enthusiast: 'The Tech Enthusiast'
    };
    return names[key] || key;
  }

  /**
   * Get archetype description
   * @param {string} key 
   * @returns {string}
   */
  static getArchetypeDescription(key) {
    const descriptions = {
      cinephile: 'Deep appreciation for film as an art form',
      casual_viewer: 'Enjoys movies for entertainment and relaxation',
      binge_watcher: 'Loves marathon viewing sessions',
      social_butterfly: 'Prefers watching and discussing with others',
      genre_specialist: 'Strong preferences for specific genres',
      critic: 'Analytical viewer who pays attention to details',
      collector: 'Passionate about physical media and memorabilia',
      tech_enthusiast: 'Values high-quality viewing experience'
    };
    return descriptions[key] || '';
  }

  /**
   * Update weights based on feedback (simulated learning)
   * In a true ML system, this would train on labeled data
   * @param {string} archetypeType 
   * @param {string} category 
   * @param {number} adjustment 
   */
  static updateWeight(archetypeType, category, adjustment) {
    if (this.LEARNED_WEIGHTS[archetypeType]?.[category]) {
      
      // Apply small adjustment (simulating learning rate)
      const learningRate = 0.1;
      const currentWeight = this.LEARNED_WEIGHTS[archetypeType][category];
      const newWeight = currentWeight + (adjustment * learningRate);
      
      // Keep weight in reasonable bounds
      this.LEARNED_WEIGHTS[archetypeType][category] = Math.max(0.5, Math.min(2.0, newWeight));
      
      return {
        archetype: archetypeType,
        category,
        oldWeight: currentWeight,
        newWeight: this.LEARNED_WEIGHTS[archetypeType][category],
        adjustment
      };
    }

    return null;
  }
}

module.exports = MLInspiredScoring;
