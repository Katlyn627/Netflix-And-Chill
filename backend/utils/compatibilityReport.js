/**
 * Compatibility Report Generator
 * Generates detailed compatibility reports using the Movie DNA algorithm.
 * The quiz-based scoring system has been replaced by Movie DNA personality matching.
 */

const MatchingEngine = require('./matchingEngine');

class CompatibilityReport {
  /**
   * Generate comprehensive compatibility report between two users using Movie DNA.
   * @param {Object} user1
   * @param {Object} user2
   * @returns {Object} Detailed compatibility report
   */
  static generateReport(user1, user2) {
    const matchResult = MatchingEngine.calculateMatch(user1, user2);

    const report = {
      users: {
        user1: { id: user1.id, username: user1.username },
        user2: { id: user2.id, username: user2.username }
      },
      overallCompatibility: matchResult.score,
      dnaCompatibility: matchResult.dnaCompatibility,
      breakdown: matchResult.breakdown,
      archetypeAnalysis: {
        shared: matchResult.archetypeCompatibility?.sharedArchetypes || [],
        compatibility: matchResult.archetypeCompatibility?.score || 0
      },
      relationshipGenre: matchResult.relationshipGenre,
      loveStory: matchResult.loveStory,
      redFlags: matchResult.redFlags,
      strengths: this.identifyStrengths(matchResult),
      challenges: this.identifyChallenges(matchResult),
      recommendations: this.generateRecommendations(matchResult),
      summary: matchResult.matchDescription,
      generatedAt: new Date().toISOString()
    };

    return report;
  }

  /**
   * Check if user has a Movie DNA profile
   * @param {Object} user
   * @returns {boolean}
   */
  static hasDNAData(user) {
    return !!(user.movieDNA?.personalityType || user.preferences?.genres?.length);
  }

  /**
   * Identify relationship strengths from a DNA match result
   * @param {Object} matchResult
   * @returns {Array}
   */
  static identifyStrengths(matchResult) {
    const strengths = [];
    const { breakdown, dnaCompatibility } = matchResult;

    if (dnaCompatibility?.score >= 70) {
      strengths.push({
        type: 'dna',
        title: 'Strong Movie DNA Alignment',
        description: dnaCompatibility.reason,
        score: dnaCompatibility.score
      });
    }

    if (breakdown?.storyArchetypes?.points >= 15) {
      strengths.push({
        type: 'archetypes',
        title: 'Shared Story Archetypes',
        description: 'You both love the same kinds of stories — a deep narrative connection.',
        score: breakdown.storyArchetypes.points * 5
      });
    }

    if (breakdown?.directorCompatibility?.points >= 10) {
      strengths.push({
        type: 'directors',
        title: 'Shared Directorial Tastes',
        description: 'You admire the same directors — a rare cinematic bond.',
        score: breakdown.directorCompatibility.points * 6
      });
    }

    if (breakdown?.movieMood?.points > 0) {
      strengths.push({
        type: 'mood',
        title: 'Mood Match Tonight',
        description: 'You both want to watch the same kind of film right now.',
        score: breakdown.movieMood.points * 10
      });
    }

    return strengths.sort((a, b) => b.score - a.score).slice(0, 5);
  }

  /**
   * Identify potential challenges from a DNA match result
   * @param {Object} matchResult
   * @returns {Array}
   */
  static identifyChallenges(matchResult) {
    const challenges = [];
    const { redFlags, breakdown, dnaCompatibility } = matchResult;

    if (redFlags && redFlags.length > 0) {
      challenges.push({
        category: 'Red Flag Movies',
        description: `${redFlags.length} red-flag movie conflict${redFlags.length > 1 ? 's' : ''} detected.`,
        severity: 'high',
        suggestions: ['Discuss your movie dealbreakers openly', 'Focus on the many films you both enjoy']
      });
    }

    if (dnaCompatibility?.score < 40) {
      challenges.push({
        category: 'Different Movie DNA',
        description: 'Your cinematic personalities are quite different — but opposites can attract.',
        severity: 'moderate',
        suggestions: ["Explore each other's favourite genres", 'Let your partner introduce you to new cinematic worlds']
      });
    }

    if (!breakdown?.emotionalDepth || breakdown.emotionalDepth.score === 0) {
      challenges.push({
        category: 'Emotional Depth Unknown',
        description: 'Neither of you has shared a scene that moved you deeply yet.',
        severity: 'low',
        suggestions: ['Share a film moment that changed you on your Movie DNA page', 'Deepen your emotional connection through storytelling']
      });
    }

    return challenges.slice(0, 3);
  }

  /**
   * Generate personalised recommendations from a DNA match result
   * @param {Object} matchResult
   * @returns {Array}
   */
  static generateRecommendations(matchResult) {
    const recommendations = [];
    const score = matchResult.score;

    if (score >= 80) {
      recommendations.push({
        type: 'general',
        priority: 'high',
        title: 'Cinematic Soulmates',
        suggestion: 'Your Movie DNA alignment is exceptional. Start with your shared story archetypes for the perfect first movie together.'
      });
    } else if (score >= 60) {
      recommendations.push({
        type: 'general',
        priority: 'medium',
        title: 'Strong Narrative Connection',
        suggestion: 'Great compatibility! Pick a film from your shared genre affinity for an easy first watch.'
      });
    } else {
      recommendations.push({
        type: 'general',
        priority: 'medium',
        title: 'Different Worlds, New Discoveries',
        suggestion: 'Your differing DNA types mean you can introduce each other to new cinematic perspectives.'
      });
    }

    if (matchResult.loveStory?.title) {
      recommendations.push({
        type: 'love_story',
        priority: 'high',
        title: 'Your Love Story Movie',
        suggestion: `Your relationship genre is "${matchResult.loveStory.genre}" — watch a film in that genre together as your first date movie.`
      });
    }

    if (matchResult.redFlags?.length === 0) {
      recommendations.push({
        type: 'no_red_flags',
        priority: 'low',
        title: 'No Red Flags! 🎉',
        suggestion: "No dealbreaker movie conflicts found. You're safe to share your full watchlist!"
      });
    }

    return recommendations;
  }

  /**
   * Generate compatibility report for multiple users (group compatibility)
   * @param {Array} users - Array of user objects
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
      groupStrengths: [],
      recommendations: [],
      summary: '',
      generatedAt: new Date().toISOString()
    };

    // Calculate pairwise compatibility using Movie DNA
    for (let i = 0; i < users.length; i++) {
      for (let j = i + 1; j < users.length; j++) {
        const pairResult = MatchingEngine.calculateMatch(users[i], users[j]);
        report.pairwiseCompatibility.push({
          user1: users[i].username,
          user2: users[j].username,
          score: pairResult.score,
          relationshipGenre: pairResult.relationshipGenre?.name
        });
      }
    }

    // Calculate average compatibility
    if (report.pairwiseCompatibility.length > 0) {
      report.overallCompatibility = Math.round(
        report.pairwiseCompatibility.reduce((sum, pair) => sum + pair.score, 0) /
        report.pairwiseCompatibility.length
      );
    }

    report.summary = this.generateGroupSummary(report);
    report.recommendations = this.generateGroupRecommendations(report);

    return report;
  }

  /**
   * Generate group summary
   * @param {Object} report
   * @returns {string}
   */
  static generateGroupSummary(report) {
    let summary = `Group of ${report.groupSize} users `;

    if (report.overallCompatibility >= 75) {
      summary += 'has excellent Movie DNA compatibility for group watching! 🎬';
    } else if (report.overallCompatibility >= 60) {
      summary += 'has good Movie DNA compatibility for group watching.';
    } else {
      summary += 'has diverse Movie DNA — great for discovering new genres together.';
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
        title: 'Great Group DNA Match',
        suggestion: 'Your group has strong Movie DNA compatibility. Host a watch party and let the algorithm suggest your film!'
      });
    } else {
      recommendations.push({
        type: 'general',
        title: 'Diverse Cinematic Tastes',
        suggestion: 'With varied DNA types, take turns choosing the film so everyone discovers something new.'
      });
    }

    recommendations.push({
      type: 'logistics',
      title: 'Plan for Everyone',
      suggestion: 'Use the Movie Mood feature so everyone is in the same watching headspace before you start.'
    });

    return recommendations;
  }
}

module.exports = CompatibilityReport;
