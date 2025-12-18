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
    
    // Create a map of user2's watch history for O(1) lookups
    const user2Titles = new Map();
    user2.watchHistory.forEach(item => {
      const normalizedTitle = item.title.toLowerCase().trim();
      user2Titles.set(normalizedTitle, item);
    });
    
    // Check user1's watch history against user2's
    user1.watchHistory.forEach(item1 => {
      const normalizedTitle = item1.title.toLowerCase().trim();
      if (user2Titles.has(normalizedTitle)) {
        const item2 = user2Titles.get(normalizedTitle);
        sharedShows.push({
          title: item1.title,
          type: item1.type,
          genre: item1.genre
        });
      }
    });

    return sharedShows;
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
   * @param {Object} filters - Optional filters (ageRange, locationRadius)
   * @returns {Array<Match>}
   */
  static findMatches(user, userPool, limit = 10, filters = {}) {
    const matches = [];

    userPool.forEach(otherUser => {
      if (otherUser.id !== user.id) {
        // Apply filters
        if (!this.passesFilters(user, otherUser, filters)) {
          return;
        }

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

  /**
   * Check if a user passes the applied filters
   * @param {User} user 
   * @param {User} otherUser 
   * @param {Object} filters 
   * @returns {boolean}
   */
  static passesFilters(user, otherUser, filters) {
    // Age range filter
    if (filters.ageRange) {
      const { min, max } = filters.ageRange;
      if (otherUser.age < min || otherUser.age > max) {
        return false;
      }
    } else if (user.preferences.ageRange) {
      const { min, max } = user.preferences.ageRange;
      if (otherUser.age < min || otherUser.age > max) {
        return false;
      }
    }

    // Location radius filter (simplified - would need proper geolocation in production)
    if (filters.locationRadius !== undefined || user.preferences.locationRadius !== undefined) {
      // In a real implementation, this would calculate actual distance
      // For now, we just check if locations are similar (same city/area)
      const radius = filters.locationRadius || user.preferences.locationRadius;
      if (radius !== null && radius !== undefined) {
        // Simplified: if locations don't match at all and radius is set, skip
        // In production, use proper geocoding and distance calculation
        if (user.location && otherUser.location && radius < 1000) {
          const userLoc = user.location.toLowerCase();
          const otherLoc = otherUser.location.toLowerCase();
          if (!userLoc.includes(otherLoc.split(',')[0]) && !otherLoc.includes(userLoc.split(',')[0])) {
            return false;
          }
        }
      }
    }

    return true;
  }
}

module.exports = MatchingEngine;
