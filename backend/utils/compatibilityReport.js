/**
 * Compatibility Report Generator
 * Generates detailed compatibility reports explaining why users match or don't match
 */

const MovieQuizScoring = require('./movieQuizScoring');
const { QUIZ_CATEGORIES } = require('../constants/quizQuestions');

class CompatibilityReport {
  /**
   * Generate comprehensive compatibility report between two users
   * @param {Object} user1 - First user with quiz data
   * @param {Object} user2 - Second user with quiz data
   * @returns {Object} Detailed compatibility report
   */
  static generateReport(user1, user2) {
    const report = {
      users: {
        user1: { id: user1.id, username: user1.username },
        user2: { id: user2.id, username: user2.username }
      },
      overallCompatibility: 0,
      quizCompatibility: null,
      archetypeAnalysis: null,
      categoryBreakdown: null,
      strengths: [],
      challenges: [],
      recommendations: [],
      summary: '',
      generatedAt: new Date().toISOString()
    };

    // Check if both users have quiz data
    if (!this.hasQuizData(user1) || !this.hasQuizData(user2)) {
      report.summary = 'One or both users have not completed the quiz. Complete the personality quiz for detailed compatibility insights.';
      return report;
    }

    // Get latest quiz attempts
    const attempt1 = MovieQuizScoring.getLatestAttempt(user1.quizAttempts);
    const attempt2 = MovieQuizScoring.getLatestAttempt(user2.quizAttempts);

    // Calculate quiz compatibility
    const quizCompatibility = MovieQuizScoring.calculateQuizCompatibility(attempt1, attempt2);
    report.quizCompatibility = quizCompatibility;
    report.overallCompatibility = quizCompatibility.score;

    // Analyze archetypes
    report.archetypeAnalysis = this.analyzeArchetypes(
      user1.personalityProfile?.archetypes || [],
      user2.personalityProfile?.archetypes || []
    );

    // Category breakdown
    report.categoryBreakdown = this.analyzeCategoryCompatibility(
      attempt1.categoryScores,
      attempt2.categoryScores
    );

    // Identify strengths and challenges
    report.strengths = this.identifyStrengths(report.categoryBreakdown, report.archetypeAnalysis);
    report.challenges = this.identifyChallenges(report.categoryBreakdown);

    // Generate recommendations
    report.recommendations = this.generateRecommendations(report);

    // Create summary
    report.summary = this.generateSummary(report);

    return report;
  }

  /**
   * Check if user has completed quiz
   * @param {Object} user 
   * @returns {boolean}
   */
  static hasQuizData(user) {
    return user.quizAttempts && user.quizAttempts.length > 0;
  }

  /**
   * Analyze archetype compatibility
   * @param {Array} archetypes1 
   * @param {Array} archetypes2 
   * @returns {Object}
   */
  static analyzeArchetypes(archetypes1, archetypes2) {
    const shared = [];
    const complementary = [];
    const different = [];

    // Create maps for O(1) lookups instead of using find()
    const archetypes2Map = new Map(archetypes2.map(a => [a.type, a]));
    const archetypes1Map = new Map(archetypes1.map(a => [a.type, a]));

    // Find shared archetypes
    archetypes1.forEach(a1 => {
      const match = archetypes2Map.get(a1.type);
      if (match) {
        shared.push({
          type: a1.type,
          name: a1.name,
          description: a1.description,
          user1Strength: a1.strength,
          user2Strength: match.strength,
          impact: 'positive'
        });
      }
    });

    // Define complementary archetype pairs
    const complementaryPairs = {
      'cinephile': ['critic', 'collector'],
      'casual_viewer': ['social_butterfly', 'binge_watcher'],
      'binge_watcher': ['casual_viewer', 'social_butterfly'],
      'social_butterfly': ['casual_viewer', 'binge_watcher'],
      'tech_enthusiast': ['cinephile', 'collector'],
      'critic': ['cinephile', 'tech_enthusiast'],
      'collector': ['cinephile', 'tech_enthusiast']
    };

    // Create a Set of shared types for O(1) lookups
    const sharedTypes = new Set(shared.map(s => s.type));

    // Find complementary archetypes - optimized to avoid nested array searches
    archetypes1.forEach(a1 => {
      const complements = complementaryPairs[a1.type] || [];
      complements.forEach(complementType => {
        const a2 = archetypes2Map.get(complementType);
        if (a2 && !sharedTypes.has(a2.type)) {
          complementary.push({
            user1: { type: a1.type, name: a1.name },
            user2: { type: a2.type, name: a2.name },
            reason: this.getComplementaryReason(a1.type, a2.type),
            impact: 'positive'
          });
        }
      });
    });

    // Create a Set of complementary user1 types for O(1) lookups
    const complementaryUser1Types = new Set(complementary.map(c => c.user1.type));

    // Find different archetypes (not shared or complementary) - optimized
    archetypes1.forEach(a1 => {
      if (!sharedTypes.has(a1.type) && !complementaryUser1Types.has(a1.type)) {
        archetypes2.forEach(a2 => {
          if (a1.type !== a2.type) {
            different.push({
              user1: { type: a1.type, name: a1.name },
              user2: { type: a2.type, name: a2.name },
              impact: 'neutral'
            });
          }
        });
      }
    });

    return {
      shared,
      complementary,
      different: different.slice(0, 3), // Limit to top 3
      compatibility: this.calculateArchetypeCompatibility(shared, complementary, different)
    };
  }

  /**
   * Get reason for complementary archetypes
   * @param {string} type1 
   * @param {string} type2 
   * @returns {string}
   */
  static getComplementaryReason(type1, type2) {
    const reasons = {
      'cinephile-critic': 'Both appreciate deep film analysis and quality',
      'cinephile-collector': 'Shared passion for preserving and celebrating cinema',
      'casual_viewer-social_butterfly': 'Enjoy relaxed, social viewing experiences',
      'binge_watcher-social_butterfly': 'Love marathon viewing sessions together',
      'tech_enthusiast-cinephile': 'Combine technical appreciation with artistic sensibility',
      'tech_enthusiast-collector': 'Value quality presentation and preservation'
    };

    const key = `${type1}-${type2}`;
    return reasons[key] || reasons[`${type2}-${type1}`] || 'Compatible viewing styles';
  }

  /**
   * Calculate archetype-based compatibility score
   * @param {Array} shared 
   * @param {Array} complementary 
   * @param {Array} different 
   * @returns {number} 0-100
   */
  static calculateArchetypeCompatibility(shared, complementary, different) {
    const sharedScore = shared.length * 30;
    const complementaryScore = complementary.length * 20;
    const differentPenalty = different.length * 5;

    return Math.min(100, Math.max(0, sharedScore + complementaryScore - differentPenalty));
  }

  /**
   * Analyze category-level compatibility
   * @param {Object} scores1 
   * @param {Object} scores2 
   * @returns {Array}
   */
  static analyzeCategoryCompatibility(scores1, scores2) {
    const categories = new Set([...Object.keys(scores1), ...Object.keys(scores2)]);
    const breakdown = [];

    categories.forEach(category => {
      const score1 = scores1[category] || 50;
      const score2 = scores2[category] || 50;
      const difference = Math.abs(score1 - score2);
      const compatibility = 100 - difference;

      breakdown.push({
        category,
        name: QUIZ_CATEGORIES[category] || category,
        user1Score: Math.round(score1),
        user2Score: Math.round(score2),
        compatibility: Math.round(compatibility),
        difference: Math.round(difference),
        level: this.getCompatibilityLevel(compatibility)
      });
    });

    // Sort by compatibility (best first)
    breakdown.sort((a, b) => b.compatibility - a.compatibility);

    return breakdown;
  }

  /**
   * Get compatibility level label
   * @param {number} score 
   * @returns {string}
   */
  static getCompatibilityLevel(score) {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'great';
    if (score >= 60) return 'good';
    if (score >= 45) return 'moderate';
    return 'challenging';
  }

  /**
   * Identify relationship strengths
   * @param {Array} categoryBreakdown 
   * @param {Object} archetypeAnalysis 
   * @returns {Array}
   */
  static identifyStrengths(categoryBreakdown, archetypeAnalysis) {
    const strengths = [];

    // Top compatible categories
    const topCategories = categoryBreakdown.filter(c => c.compatibility >= 75).slice(0, 3);
    topCategories.forEach(category => {
      strengths.push({
        type: 'category',
        title: `Aligned ${category.name}`,
        description: `Both users have similar preferences in ${category.name.toLowerCase()}, making this a strong foundation for compatibility.`,
        score: category.compatibility
      });
    });

    // Shared archetypes
    archetypeAnalysis.shared.forEach(shared => {
      strengths.push({
        type: 'archetype',
        title: `Shared ${shared.name}`,
        description: shared.description,
        score: (shared.user1Strength + shared.user2Strength) / 2
      });
    });

    // Complementary archetypes
    archetypeAnalysis.complementary.forEach(comp => {
      strengths.push({
        type: 'complementary',
        title: `${comp.user1.name} meets ${comp.user2.name}`,
        description: comp.reason,
        score: 80
      });
    });

    return strengths.sort((a, b) => b.score - a.score).slice(0, 5);
  }

  /**
   * Identify potential challenges
   * @param {Array} categoryBreakdown 
   * @returns {Array}
   */
  static identifyChallenges(categoryBreakdown) {
    const challenges = [];

    // Categories with significant differences
    const difficultCategories = categoryBreakdown.filter(c => c.compatibility < 50);
    
    difficultCategories.forEach(category => {
      challenges.push({
        category: category.name,
        description: this.getChallengeDescription(category),
        severity: category.difference > 50 ? 'high' : 'moderate',
        suggestions: this.getChallengeSuggestions(category)
      });
    });

    return challenges.slice(0, 3);
  }

  /**
   * Get description for category challenge
   * @param {Object} category 
   * @returns {string}
   */
  static getChallengeDescription(category) {
    const descriptions = {
      'viewing_style': 'Different preferences for how to watch content',
      'social_viewing': 'Different comfort levels with social viewing',
      'viewing_habits': 'Different viewing routines and schedules',
      'pacing': 'Different tolerance for film pacing',
      'content': 'Different content preferences and comfort zones'
    };

    return descriptions[category.category] || `Different preferences in ${category.name.toLowerCase()}`;
  }

  /**
   * Get suggestions for overcoming challenges
   * @param {Object} category 
   * @returns {Array}
   */
  static getChallengeSuggestions(category) {
    const suggestions = {
      'viewing_style': [
        'Take turns choosing viewing formats',
        'Discuss preferences before watching together'
      ],
      'social_viewing': [
        'Establish viewing etiquette guidelines',
        'Balance social and quiet viewing sessions'
      ],
      'pacing': [
        'Choose films that satisfy both preferences',
        "Be patient with each other's pace preferences"
      ]
    };

    return suggestions[category.category] || [
      'Communicate openly about preferences',
      'Find middle ground that works for both'
    ];
  }

  /**
   * Generate personalized recommendations
   * @param {Object} report 
   * @returns {Array}
   */
  static generateRecommendations(report) {
    const recommendations = [];

    // Based on overall compatibility
    if (report.overallCompatibility >= 80) {
      recommendations.push({
        type: 'general',
        priority: 'high',
        title: 'Excellent Match!',
        suggestion: 'Your viewing styles are highly compatible. Consider planning a movie marathon together!'
      });
    } else if (report.overallCompatibility >= 60) {
      recommendations.push({
        type: 'general',
        priority: 'medium',
        title: 'Good Match',
        suggestion: 'You have solid compatibility. Focus on your shared preferences for best results.'
      });
    } else {
      recommendations.push({
        type: 'general',
        priority: 'medium',
        title: 'Growing Compatibility',
        suggestion: 'While you have some differences, these can complement each other. Focus on communication and compromise.'
      });
    }

    // Recommendations based on strengths
    if (report.strengths.length > 0) {
      const topStrength = report.strengths[0];
      recommendations.push({
        type: 'strength',
        priority: 'high',
        title: `Leverage Your ${topStrength.title}`,
        suggestion: `Your shared ${topStrength.title.toLowerCase()} is a strong foundation. Build on this compatibility for successful watch sessions.`
      });
    }

    // Recommendations based on challenges
    if (report.challenges.length > 0) {
      const topChallenge = report.challenges[0];
      recommendations.push({
        type: 'challenge',
        priority: topChallenge.severity === 'high' ? 'high' : 'medium',
        title: `Navigate ${topChallenge.category} Differences`,
        suggestion: topChallenge.suggestions[0]
      });
    }

    return recommendations;
  }

  /**
   * Generate summary text
   * @param {Object} report 
   * @returns {string}
   */
  static generateSummary(report) {
    const compatScore = report.overallCompatibility;
    let summary = '';

    if (compatScore >= 80) {
      summary = '🎬 Excellent compatibility! ';
    } else if (compatScore >= 60) {
      summary = '✨ Good compatibility. ';
    } else if (compatScore >= 40) {
      summary = '🤝 Moderate compatibility. ';
    } else {
      summary = '💭 Growing compatibility. ';
    }

    // Add archetype info
    if (report.archetypeAnalysis.shared.length > 0) {
      const sharedCount = report.archetypeAnalysis.shared.length;
      summary += `You share ${sharedCount} personality archetype${sharedCount > 1 ? 's' : ''}, `;
    }

    if (report.archetypeAnalysis.complementary.length > 0) {
      summary += 'and your different traits complement each other well. ';
    }

    // Add strength count
    if (report.strengths.length > 0) {
      summary += `You have ${report.strengths.length} key strength${report.strengths.length > 1 ? 's' : ''} to build on. `;
    }

    // Add challenge note if present
    if (report.challenges.length > 0) {
      summary += `Be mindful of ${report.challenges.length} area${report.challenges.length > 1 ? 's' : ''} that may need compromise.`;
    } else {
      summary += 'Your preferences align smoothly across most areas.';
    }

    return summary;
  }

  /**
   * Generate compatibility report for multiple users (group compatibility)
   * @param {Array} users - Array of user objects with quiz data
   * @returns {Object} Group compatibility report
   */
  static generateGroupReport(users) {
    if (!users || users.length < 2) {
      return {
        error: 'At least 2 users required for group compatibility',
        groupSize: users?.length || 0
      };
    }

    const report = {
      groupSize: users.length,
      users: users.map(u => ({ id: u.id, username: u.username })),
      overallCompatibility: 0,
      pairwiseCompatibility: [],
      commonArchetypes: [],
      groupStrengths: [],
      groupChallenges: [],
      recommendations: [],
      summary: '',
      generatedAt: new Date().toISOString()
    };

    // Calculate pairwise compatibility
    for (let i = 0; i < users.length; i++) {
      for (let j = i + 1; j < users.length; j++) {
        if (this.hasQuizData(users[i]) && this.hasQuizData(users[j])) {
          const pairReport = this.generateReport(users[i], users[j]);
          report.pairwiseCompatibility.push({
            user1: users[i].username,
            user2: users[j].username,
            score: pairReport.overallCompatibility
          });
        }
      }
    }

    // Calculate average compatibility
    if (report.pairwiseCompatibility.length > 0) {
      report.overallCompatibility = Math.round(
        report.pairwiseCompatibility.reduce((sum, pair) => sum + pair.score, 0) / 
        report.pairwiseCompatibility.length
      );
    }

    // Find common archetypes
    report.commonArchetypes = this.findCommonArchetypes(users);

    // Generate group summary
    report.summary = this.generateGroupSummary(report);

    // Group recommendations
    report.recommendations = this.generateGroupRecommendations(report);

    return report;
  }

  /**
   * Find archetypes common across multiple users
   * @param {Array} users 
   * @returns {Array}
   */
  static findCommonArchetypes(users) {
    const archetypeCounts = {};
    const usersWithQuiz = users.filter(u => this.hasQuizData(u));

    if (usersWithQuiz.length === 0) return [];

    usersWithQuiz.forEach(user => {
      const archetypes = user.personalityProfile?.archetypes || [];
      archetypes.forEach(archetype => {
        if (!archetypeCounts[archetype.type]) {
          archetypeCounts[archetype.type] = {
            type: archetype.type,
            name: archetype.name,
            description: archetype.description,
            count: 0,
            users: []
          };
        }
        archetypeCounts[archetype.type].count++;
        archetypeCounts[archetype.type].users.push(user.username);
      });
    });

    return Object.values(archetypeCounts)
      .filter(a => a.count >= 2)
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Generate group summary
   * @param {Object} report 
   * @returns {string}
   */
  static generateGroupSummary(report) {
    let summary = `Group of ${report.groupSize} users `;

    if (report.overallCompatibility >= 75) {
      summary += 'has excellent compatibility for group watching! ';
    } else if (report.overallCompatibility >= 60) {
      summary += 'has good compatibility for group watching. ';
    } else {
      summary += 'has moderate compatibility - communication will be key. ';
    }

    if (report.commonArchetypes.length > 0) {
      const topArchetype = report.commonArchetypes[0];
      summary += `${topArchetype.count} members share the ${topArchetype.name} archetype. `;
    }

    return summary;
  }

  /**
   * Generate recommendations for groups
   * @param {Object} report 
   * @returns {Array}
   */
  static generateGroupRecommendations(report) {
    const recommendations = [];

    if (report.overallCompatibility >= 70) {
      recommendations.push({
        type: 'general',
        title: 'Great Group Dynamic',
        suggestion: 'Your group has strong compatibility. Consider hosting regular watch parties!'
      });
    }

    if (report.commonArchetypes.length > 0) {
      const topArchetype = report.commonArchetypes[0];
      const description = topArchetype.description || 'this viewing style';
      recommendations.push({
        type: 'archetype',
        title: `Embrace Your ${topArchetype.name} Majority`,
        suggestion: `With ${topArchetype.count} members sharing this archetype, lean into ${description.toLowerCase()}`
      });
    }

    recommendations.push({
      type: 'logistics',
      title: 'Plan for Everyone',
      suggestion: 'With a group, establish clear viewing guidelines and rotate who picks the content.'
    });

    return recommendations;
  }
}

module.exports = CompatibilityReport;
