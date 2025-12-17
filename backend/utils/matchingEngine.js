const Match = require('../models/Match');

class MatchingEngine {
  /**
   * Calculate match score between two users based on shared content
   * @param {User} user1 
   * @param {User} user2 
   * @returns {Object} Match score and shared content
   */
  static calculateMatch(user1, user2) {
    let score = 0;
    const sharedContent = [];

    // Check for shared streaming services
    const sharedServices = this.findSharedServices(user1, user2);
    score += sharedServices.length * 10;

    // Check for shared watch history
    const sharedShows = this.findSharedWatchHistory(user1, user2);
    score += sharedShows.length * 20;
    sharedContent.push(...sharedShows);

    // Check for shared genre preferences
    const sharedGenres = this.findSharedGenres(user1, user2);
    score += sharedGenres.length * 5;

    // Bonus for similar binge-watching patterns
    const bingeDifference = Math.abs(
      (user1.preferences.bingeWatchCount || 0) - (user2.preferences.bingeWatchCount || 0)
    );
    if (bingeDifference <= 2) {
      score += 15;
    }

    // Normalize score to 0-100 range
    const normalizedScore = Math.min(100, score);

    return {
      score: normalizedScore,
      sharedContent: sharedContent,
      sharedServices: sharedServices,
      sharedGenres: sharedGenres
    };
  }

  static findSharedServices(user1, user2) {
    const user1Services = user1.streamingServices.map(s => s.name);
    const user2Services = user2.streamingServices.map(s => s.name);
    return user1Services.filter(service => user2Services.includes(service));
  }

  static findSharedWatchHistory(user1, user2) {
    const sharedShows = [];
    
    user1.watchHistory.forEach(item1 => {
      user2.watchHistory.forEach(item2 => {
        if (item1.title === item2.title) {
          sharedShows.push({
            title: item1.title,
            type: item1.type,
            genre: item1.genre
          });
        }
      });
    });

    // Remove duplicates
    return sharedShows.filter((show, index, self) =>
      index === self.findIndex(s => s.title === show.title)
    );
  }

  static findSharedGenres(user1, user2) {
    const user1Genres = user1.preferences.genres || [];
    const user2Genres = user2.preferences.genres || [];
    return user1Genres.filter(genre => user2Genres.includes(genre));
  }

  /**
   * Find matches for a user from a pool of users
   * @param {User} user 
   * @param {Array<User>} userPool 
   * @param {number} limit 
   * @returns {Array<Match>}
   */
  static findMatches(user, userPool, limit = 10) {
    const matches = [];

    userPool.forEach(otherUser => {
      if (otherUser.id !== user.id) {
        const matchResult = this.calculateMatch(user, otherUser);
        
        if (matchResult.score > 0) {
          matches.push(new Match(
            user.id,
            otherUser.id,
            matchResult.score,
            matchResult.sharedContent
          ));
        }
      }
    });

    // Sort by match score (highest first)
    matches.sort((a, b) => b.matchScore - a.matchScore);

    // Return top matches
    return matches.slice(0, limit);
  }
}

module.exports = MatchingEngine;
