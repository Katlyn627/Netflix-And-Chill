/**
 * Quiz Evolution System
 * Tracks question performance, user feedback, and manages quiz versioning
 */

class QuizEvolution {
  /**
   * Question metadata structure for tracking performance
   */
  static getQuestionMetadataSchema() {
    return {
      questionId: '',
      version: 'v1',
      timesAnswered: 0,
      timesSkipped: 0,
      answerDistribution: {}, // {optionValue: count}
      averageResponseTime: 0, // in seconds
      feedbackScore: 0, // 0-5 rating
      feedbackCount: 0,
      lastUpdated: null,
      createdAt: null,
      trends: {
        popularAnswers: [], // Most common answers
        changingPreferences: false // If answer patterns shift over time
      }
    };
  }

  /**
   * Track user's answer to a question
   * @param {string} questionId 
   * @param {string} selectedValue 
   * @param {number} responseTime - Time taken to answer in seconds
   * @returns {Object} Updated metadata
   */
  static recordAnswer(questionId, selectedValue, responseTime = null) {
    // In production, this would update a database
    const metadata = {
      questionId,
      action: 'answered',
      selectedValue,
      responseTime,
      recordedAt: new Date().toISOString()
    };

    return metadata;
  }

  /**
   * Track when a user skips a question
   * @param {string} questionId 
   * @returns {Object} Skip record
   */
  static recordSkip(questionId) {
    return {
      questionId,
      action: 'skipped',
      recordedAt: new Date().toISOString()
    };
  }

  /**
   * Submit feedback for a specific question
   * @param {string} questionId 
   * @param {Object} feedback - {rating: 1-5, comment: '', userId}
   * @returns {Object} Feedback record
   */
  static submitQuestionFeedback(questionId, feedback) {
    const { rating, comment, userId } = feedback;

    if (!rating || rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    return {
      questionId,
      userId,
      rating,
      comment: comment || '',
      submittedAt: new Date().toISOString()
    };
  }

  /**
   * Submit feedback for overall quiz experience
   * @param {Object} feedback - Overall quiz feedback
   * @returns {Object} Quiz feedback record
   */
  static submitQuizFeedback(feedback) {
    const {
      userId,
      quizVersion,
      overallRating,
      lengthRating, // Was it too long/short?
      clarityRating, // Were questions clear?
      relevanceRating, // Were questions relevant?
      comments,
      suggestedImprovements
    } = feedback;

    if (!overallRating || overallRating < 1 || overallRating > 5) {
      throw new Error('Overall rating must be between 1 and 5');
    }

    return {
      userId,
      quizVersion: quizVersion || 'v1',
      ratings: {
        overall: overallRating,
        length: lengthRating || null,
        clarity: clarityRating || null,
        relevance: relevanceRating || null
      },
      comments: comments || '',
      suggestedImprovements: suggestedImprovements || [],
      submittedAt: new Date().toISOString()
    };
  }

  /**
   * Analyze question performance to identify issues
   * @param {Object} metadata - Question metadata
   * @returns {Object} Analysis results
   */
  static analyzeQuestionPerformance(metadata) {
    const issues = [];
    const recommendations = [];

    // High skip rate
    if (metadata.timesSkipped > metadata.timesAnswered * 0.2) {
      issues.push({
        type: 'high_skip_rate',
        severity: 'high',
        description: 'Question is skipped frequently',
        metric: `${((metadata.timesSkipped / (metadata.timesAnswered + metadata.timesSkipped)) * 100).toFixed(1)}% skip rate`
      });
      recommendations.push('Consider rewording question for clarity or relevance');
    }

    // Low feedback score
    if (metadata.feedbackCount > 10 && metadata.feedbackScore < 2.5) {
      issues.push({
        type: 'low_feedback_score',
        severity: 'high',
        description: 'Question receives poor feedback from users',
        metric: `${metadata.feedbackScore.toFixed(1)}/5.0 average rating`
      });
      recommendations.push('Review question wording and answer options');
    }

    // Unbalanced answer distribution
    const answerValues = Object.values(metadata.answerDistribution);
    if (answerValues.length > 0) {
      const max = Math.max(...answerValues);
      const total = answerValues.reduce((sum, val) => sum + val, 0);
      
      if (max / total > 0.7) {
        issues.push({
          type: 'unbalanced_answers',
          severity: 'medium',
          description: 'One answer is chosen too frequently',
          metric: `${((max / total) * 100).toFixed(1)}% choose one option`
        });
        recommendations.push('Consider revising answer options for better balance');
      }
    }

    // Very long response time
    if (metadata.averageResponseTime > 60) {
      issues.push({
        type: 'slow_response',
        severity: 'low',
        description: 'Question takes longer than average to answer',
        metric: `${metadata.averageResponseTime.toFixed(0)} seconds average`
      });
      recommendations.push('Simplify question wording or reduce number of options');
    }

    return {
      questionId: metadata.questionId,
      hasIssues: issues.length > 0,
      issues,
      recommendations,
      performanceScore: this.calculatePerformanceScore(metadata, issues),
      analyzedAt: new Date().toISOString()
    };
  }

  /**
   * Calculate overall performance score for a question
   * @param {Object} metadata 
   * @param {Array} issues 
   * @returns {number} Score 0-100
   */
  static calculatePerformanceScore(metadata, issues) {
    let score = 100;

    // Deduct for skip rate
    const skipRate = metadata.timesSkipped / (metadata.timesAnswered + metadata.timesSkipped);
    score -= skipRate * 30;

    // Deduct for low feedback
    if (metadata.feedbackCount > 0) {
      const feedbackPenalty = (5 - metadata.feedbackScore) * 5;
      score -= feedbackPenalty;
    }

    // Deduct for issues
    issues.forEach(issue => {
      if (issue.severity === 'high') score -= 15;
      else if (issue.severity === 'medium') score -= 10;
      else score -= 5;
    });

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Identify trending patterns in quiz responses
   * @param {Array} responses - Historical response data
   * @returns {Object} Trend analysis
   */
  static identifyTrends(responses) {
    if (!responses || responses.length < 100) {
      return {
        hasSufficientData: false,
        message: 'Need at least 100 responses for trend analysis'
      };
    }

    // Group responses by time period (e.g., monthly)
    const periodGroups = this.groupByTimePeriod(responses, 'month');
    
    // Analyze changes over time
    const trends = {
      hasSufficientData: true,
      analyzedPeriods: Object.keys(periodGroups).length,
      categoryTrends: this.analyzeCategoryTrends(periodGroups),
      archetypeTrends: this.analyzeArchetypeTrends(periodGroups),
      popularityShifts: this.identifyPopularityShifts(periodGroups),
      analyzedAt: new Date().toISOString()
    };

    return trends;
  }

  /**
   * Group responses by time period
   * @param {Array} responses 
   * @param {string} period - 'day', 'week', 'month'
   * @returns {Object} Grouped responses
   */
  static groupByTimePeriod(responses, period = 'month') {
    const groups = {};

    responses.forEach(response => {
      const date = new Date(response.completedAt);
      let key;

      if (period === 'month') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else if (period === 'week') {
        const week = this.getWeekNumber(date);
        key = `${date.getFullYear()}-W${String(week).padStart(2, '0')}`;
      } else {
        key = date.toISOString().split('T')[0];
      }

      if (!groups[key]) groups[key] = [];
      groups[key].push(response);
    });

    return groups;
  }

  /**
   * Get ISO week number
   * @param {Date} date 
   * @returns {number}
   */
  static getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

  /**
   * Analyze trends in category scores over time
   * @param {Object} periodGroups 
   * @returns {Array}
   */
  static analyzeCategoryTrends(periodGroups) {
    const categoryAverages = {};

    Object.keys(periodGroups).forEach(period => {
      categoryAverages[period] = this.calculateAverageCategoryScores(periodGroups[period]);
    });

    // Identify categories with significant changes
    const trends = [];
    const categories = Object.keys(categoryAverages[Object.keys(categoryAverages)[0]] || {});

    categories.forEach(category => {
      const scores = Object.keys(categoryAverages).map(period => 
        categoryAverages[period][category] || 0
      );

      const trend = this.calculateTrendDirection(scores);
      if (Math.abs(trend.change) > 10) {
        trends.push({
          category,
          direction: trend.direction,
          change: trend.change,
          significance: Math.abs(trend.change) > 20 ? 'high' : 'medium'
        });
      }
    });

    return trends;
  }

  /**
   * Calculate average category scores for a set of responses
   * @param {Array} responses 
   * @returns {Object}
   */
  static calculateAverageCategoryScores(responses) {
    const sums = {};
    const counts = {};

    responses.forEach(response => {
      Object.keys(response.categoryScores || {}).forEach(category => {
        sums[category] = (sums[category] || 0) + response.categoryScores[category];
        counts[category] = (counts[category] || 0) + 1;
      });
    });

    const averages = {};
    Object.keys(sums).forEach(category => {
      averages[category] = sums[category] / counts[category];
    });

    return averages;
  }

  /**
   * Calculate trend direction and magnitude
   * @param {Array} values - Time series values
   * @returns {Object}
   */
  static calculateTrendDirection(values) {
    if (values.length < 2) {
      return { direction: 'stable', change: 0 };
    }

    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const avgFirst = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

    const change = avgSecond - avgFirst;

    return {
      direction: change > 5 ? 'increasing' : change < -5 ? 'decreasing' : 'stable',
      change: change
    };
  }

  /**
   * Analyze trends in archetype distribution
   * @param {Object} periodGroups 
   * @returns {Array}
   */
  static analyzeArchetypeTrends(periodGroups) {
    const archetypeCounts = {};

    Object.keys(periodGroups).forEach(period => {
      archetypeCounts[period] = {};
      
      periodGroups[period].forEach(response => {
        const archetypes = response.personalityTraits?.archetypes || [];
        archetypes.forEach(archetype => {
          const type = archetype.type;
          archetypeCounts[period][type] = (archetypeCounts[period][type] || 0) + 1;
        });
      });
    });

    // Identify which archetypes are becoming more/less common
    const trends = [];
    const allArchetypes = new Set();
    
    Object.values(archetypeCounts).forEach(period => {
      Object.keys(period).forEach(type => allArchetypes.add(type));
    });

    allArchetypes.forEach(type => {
      const counts = Object.keys(archetypeCounts).map(period => 
        archetypeCounts[period][type] || 0
      );

      const trend = this.calculateTrendDirection(counts);
      if (trend.direction !== 'stable') {
        trends.push({
          archetype: type,
          trend: trend.direction,
          description: `${type} archetype is ${trend.direction}`
        });
      }
    });

    return trends;
  }

  /**
   * Identify shifts in question popularity/relevance
   * @param {Object} periodGroups 
   * @returns {Array}
   */
  static identifyPopularityShifts(periodGroups) {
    // This would analyze which questions are becoming more/less relevant
    // Based on skip rates, completion rates, etc.
    
    return [{
      message: 'Popularity shift analysis requires extended historical data',
      recommendation: 'Continue collecting data for better insights'
    }];
  }

  /**
   * Suggest quiz improvements based on collected data
   * @param {Object} analysisData - Combined analysis results
   * @returns {Array} Improvement suggestions
   */
  static suggestImprovements(analysisData) {
    const suggestions = [];

    // Based on question performance
    if (analysisData.poorPerformingQuestions && analysisData.poorPerformingQuestions.length > 0) {
      suggestions.push({
        priority: 'high',
        type: 'question_revision',
        description: 'Revise or replace poorly performing questions',
        affectedQuestions: analysisData.poorPerformingQuestions.map(q => q.questionId)
      });
    }

    // Based on trends
    if (analysisData.trends && analysisData.trends.categoryTrends.length > 0) {
      suggestions.push({
        priority: 'medium',
        type: 'category_adjustment',
        description: 'Update questions to reflect changing preferences in trending categories',
        categories: analysisData.trends.categoryTrends.map(t => t.category)
      });
    }

    // Based on feedback
    if (analysisData.feedback && analysisData.feedback.averageRating < 3.5) {
      suggestions.push({
        priority: 'high',
        type: 'overall_improvement',
        description: 'Quiz receives below-average ratings. Consider comprehensive review.',
        currentRating: analysisData.feedback.averageRating
      });
    }

    return suggestions;
  }

  /**
   * Generate new quiz version based on improvements
   * @param {string} currentVersion 
   * @param {Array} changes - Array of changes made
   * @returns {Object} New version metadata
   */
  static createNewVersion(currentVersion, changes) {
    const versionNumber = parseInt(currentVersion.replace('v', '')) + 1;
    const newVersion = `v${versionNumber}`;

    return {
      version: newVersion,
      previousVersion: currentVersion,
      changes: changes,
      releaseDate: new Date().toISOString(),
      changelog: this.generateChangelog(changes),
      status: 'active'
    };
  }

  /**
   * Generate human-readable changelog
   * @param {Array} changes 
   * @returns {string}
   */
  static generateChangelog(changes) {
    const lines = [`Quiz Version Update - ${new Date().toLocaleDateString()}\n`];
    
    changes.forEach(change => {
      lines.push(`- ${change.description}`);
      if (change.details) {
        lines.push(`  ${change.details}`);
      }
    });

    return lines.join('\n');
  }
}

module.exports = QuizEvolution;
