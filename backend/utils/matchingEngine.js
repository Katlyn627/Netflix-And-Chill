const Match = require('../models/Match');

class MatchingEngine {
  // Scoring constants
  static POINTS_PER_SHARED_SNACK = 3;
  static POINTS_PER_SHARED_DEBATE = 2;
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

    // Check for shared favorite movies
    const sharedFavoriteMovies = this.findSharedFavoriteMovies(user1, user2);
    score += sharedFavoriteMovies.length * 25;
    sharedContent.push(...sharedFavoriteMovies);

    // Bonus for similar binge-watching patterns
    const bingeDifference = Math.abs(
      (user1.preferences.bingeWatchCount || 0) - (user2.preferences.bingeWatchCount || 0)
    );
    if (bingeDifference <= 2) {
      score += 15;
    }

    // Quiz response compatibility (increased weight to 30 points)
    const quizCompatibility = this.calculateQuizCompatibility(user1, user2);
    score += quizCompatibility;

    // Snack preferences compatibility
    const snackCompatibility = this.calculateSnackCompatibility(user1, user2);
    score += snackCompatibility;

    // Movie debate topics compatibility
    const debateCompatibility = this.calculateDebateCompatibility(user1, user2);
    score += debateCompatibility;

    // Bonus for matching video chat preference
    if (user1.videoChatPreference && user2.videoChatPreference) {
      if (user1.videoChatPreference === user2.videoChatPreference || 
          user1.videoChatPreference === 'either' || 
          user2.videoChatPreference === 'either') {
        score += 5;
      }
    }

    // Normalize score to 0-100 range
    const normalizedScore = Math.min(100, score);

    return {
      score: normalizedScore,
      sharedContent: sharedContent,
      sharedServices: sharedServices,
      sharedGenres: sharedGenres,
      sharedFavoriteMovies: sharedFavoriteMovies,
      quizCompatibility: quizCompatibility,
      snackCompatibility: snackCompatibility,
      debateCompatibility: debateCompatibility
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
    
    // Handle both old format (strings) and new format (objects with id/name)
    const normalizeGenre = (genre) => {
      if (typeof genre === 'string') return genre;
      return genre.name || genre.id;
    };
    
    const user1GenreSet = new Set(user1Genres.map(normalizeGenre));
    const user2GenreSet = new Set(user2Genres.map(normalizeGenre));
    
    const shared = [];
    user1GenreSet.forEach(genre => {
      if (user2GenreSet.has(genre)) {
        shared.push(genre);
      }
    });
    
    return shared;
  }

  static findSharedFavoriteMovies(user1, user2) {
    const sharedMovies = [];
    
    // Get favorite movies for both users
    const user1Movies = user1.favoriteMovies || [];
    const user2Movies = user2.favoriteMovies || [];
    
    // Create a map of user2's favorite movies by TMDB ID for O(1) lookups
    const user2MoviesMap = new Map();
    user2Movies.forEach(movie => {
      user2MoviesMap.set(movie.tmdbId, movie);
    });
    
    // Check user1's favorite movies against user2's
    user1Movies.forEach(movie1 => {
      if (user2MoviesMap.has(movie1.tmdbId)) {
        sharedMovies.push({
          title: movie1.title,
          type: 'favorite_movie',
          tmdbId: movie1.tmdbId
        });
      }
    });
    
    return sharedMovies;
  }

  /**
   * Calculate compatibility based on quiz responses
   * @param {User} user1 
   * @param {User} user2 
   * @returns {number} Compatibility score from quiz
   */
  static calculateQuizCompatibility(user1, user2) {
    const quiz1 = user1.quizResponses || {};
    const quiz2 = user2.quizResponses || {};
    
    const commonQuestions = Object.keys(quiz1).filter(q => Object.prototype.hasOwnProperty.call(quiz2, q));
    if (commonQuestions.length === 0) return 0;

    let matches = 0;
    commonQuestions.forEach(question => {
      if (quiz1[question] === quiz2[question]) {
        matches++;
      }
    });

    // Award up to 30 points for quiz compatibility (increased from 20)
    // Quiz is now more important as it reflects viewing style compatibility
    const compatibilityScore = (matches / commonQuestions.length) * 30;
    return compatibilityScore;
  }

  /**
   * Calculate compatibility based on snack preferences
   * @param {User} user1 
   * @param {User} user2 
   * @returns {number} Compatibility score from snacks
   */
  static calculateSnackCompatibility(user1, user2) {
    const snacks1 = user1.favoriteSnacks || [];
    const snacks2 = user2.favoriteSnacks || [];
    
    if (snacks1.length === 0 || snacks2.length === 0) return 0;
    
    // Find shared snacks
    const sharedSnacks = snacks1.filter(snack => snacks2.includes(snack));
    
    // Award up to 10 points for snack compatibility
    const score = Math.min(10, sharedSnacks.length * this.POINTS_PER_SHARED_SNACK);
    return score;
  }

  /**
   * Calculate compatibility based on movie debate topics
   * @param {User} user1 
   * @param {User} user2 
   * @returns {number} Compatibility score from debate topics
   */
  static calculateDebateCompatibility(user1, user2) {
    const debates1 = user1.movieDebateTopics || [];
    const debates2 = user2.movieDebateTopics || [];
    
    if (debates1.length === 0 || debates2.length === 0) return 0;
    
    // Find shared debate topics
    const sharedDebates = debates1.filter(debate => debates2.includes(debate));
    
    // Award up to 10 points for debate compatibility
    const score = Math.min(10, sharedDebates.length * this.POINTS_PER_SHARED_DEBATE);
    return score;
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
    // Validate filters
    if (filters.ageRange) {
      if (typeof filters.ageRange.min !== 'number' || typeof filters.ageRange.max !== 'number') {
        throw new Error('Invalid ageRange filter: min and max must be numbers');
      }
      if (filters.ageRange.min < 0 || filters.ageRange.max < 0 || filters.ageRange.min > filters.ageRange.max) {
        throw new Error('Invalid ageRange filter: min must be less than max and both must be non-negative');
      }
    }
    if (filters.locationRadius !== undefined && (typeof filters.locationRadius !== 'number' || filters.locationRadius < 0)) {
      throw new Error('Invalid locationRadius filter: must be a non-negative number');
    }

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
    const MAX_GLOBAL_RADIUS = 1000; // Maximum radius to consider as "anywhere" (in miles/km)
    
    if (filters.locationRadius !== undefined || user.preferences.locationRadius !== undefined) {
      // In a real implementation, this would calculate actual distance
      // For now, we just check if locations are similar (same city/area)
      const radius = filters.locationRadius !== undefined ? filters.locationRadius : user.preferences.locationRadius;
      if (radius !== null && radius !== undefined && radius < MAX_GLOBAL_RADIUS) {
        // Simplified: if locations don't match at all and radius is set, skip
        // In production, use proper geocoding and distance calculation
        if (user.location && otherUser.location) {
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
