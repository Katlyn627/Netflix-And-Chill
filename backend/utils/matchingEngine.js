const Match = require('../models/Match');

class MatchingEngine {
  // Scoring constants
  static POINTS_PER_SHARED_SNACK = 3;
  static POINTS_PER_SHARED_DEBATE = 2;
  static POINTS_PER_EMOTIONAL_TONE = 10; // Max points for emotional tone alignment
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

    // Emotional tone alignment
    const emotionalToneCompatibility = this.calculateEmotionalToneAlignment(user1, user2);
    score += emotionalToneCompatibility;

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

    // Generate match description
    const matchDescription = this.generateMatchDescription(normalizedScore, {
      sharedFavoriteMovies,
      sharedGenres,
      sharedShows,
      quizCompatibility,
      emotionalToneCompatibility,
      user1,
      user2
    });

    return {
      score: normalizedScore,
      sharedContent: sharedContent,
      sharedServices: sharedServices,
      sharedGenres: sharedGenres,
      sharedFavoriteMovies: sharedFavoriteMovies,
      quizCompatibility: quizCompatibility,
      snackCompatibility: snackCompatibility,
      debateCompatibility: debateCompatibility,
      emotionalToneCompatibility: emotionalToneCompatibility,
      matchDescription: matchDescription
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
   * Calculate emotional tone alignment based on genre preferences
   * Emotional tone categories:
   * - Intense (Action, Thriller, Horror)
   * - Lighthearted (Comedy, Romance, Family)
   * - Emotional (Drama, Documentary)
   * - Adventurous (Adventure, Fantasy, Sci-Fi)
   * @param {User} user1 
   * @param {User} user2 
   * @returns {number} Compatibility score from emotional tone alignment
   */
  static calculateEmotionalToneAlignment(user1, user2) {
    const user1Genres = user1.preferences.genres || [];
    const user2Genres = user2.preferences.genres || [];
    
    if (user1Genres.length === 0 || user2Genres.length === 0) return 0;
    
    // Define emotional tone mappings (pre-lowercased for efficiency)
    const toneMappings = {
      intense: ['action', 'thriller', 'horror', 'crime', 'war'],
      lighthearted: ['comedy', 'romance', 'family', 'animation', 'music'],
      emotional: ['drama', 'documentary', 'biography', 'history'],
      adventurous: ['adventure', 'fantasy', 'science fiction', 'sci-fi', 'mystery', 'western']
    };
    
    // Get emotional tone profile for each user
    const getToneProfile = (genres) => {
      const profile = { intense: 0, lighthearted: 0, emotional: 0, adventurous: 0 };
      
      genres.forEach(genre => {
        const genreName = typeof genre === 'string' ? genre : (genre.name || genre.id || '');
        const lowerGenreName = genreName.toLowerCase();
        
        // Check which tone category this genre belongs to
        Object.keys(toneMappings).forEach(tone => {
          if (toneMappings[tone].some(g => lowerGenreName.includes(g) || g.includes(lowerGenreName))) {
            profile[tone]++;
          }
        });
      });
      
      return profile;
    };
    
    const user1Tone = getToneProfile(user1Genres);
    const user2Tone = getToneProfile(user2Genres);
    
    // Calculate similarity between tone profiles
    // Use normalized difference: smaller difference = higher score
    let totalDifference = 0;
    let totalGenres = 0;
    
    Object.keys(user1Tone).forEach(tone => {
      const max = Math.max(user1Tone[tone], user2Tone[tone]);
      if (max > 0) {
        const diff = Math.abs(user1Tone[tone] - user2Tone[tone]) / max;
        totalDifference += diff;
        totalGenres++;
      }
    });
    
    if (totalGenres === 0) return 0;
    
    // Calculate alignment score: less difference = higher score
    const alignmentRatio = 1 - (totalDifference / totalGenres);
    const score = alignmentRatio * this.POINTS_PER_EMOTIONAL_TONE;
    
    return Math.max(0, score);
  }

  /**
   * Generate a descriptive match message based on compatibility factors
   * @param {number} score - Match score (0-100)
   * @param {Object} matchData - Contains shared movies, genres, quiz compatibility, etc.
   * @returns {string} Descriptive match message
   */
  static generateMatchDescription(score, matchData) {
    const {
      sharedFavoriteMovies = [],
      sharedGenres = [],
      sharedShows = [],
      quizCompatibility = 0,
      emotionalToneCompatibility = 0,
      user1,
      user2
    } = matchData;
    
    const descriptions = [];
    
    // Check for shared favorite movies
    if (sharedFavoriteMovies.length > 0) {
      if (sharedFavoriteMovies.length === 1) {
        descriptions.push(`You both love "${sharedFavoriteMovies[0].title}"`);
      } else if (sharedFavoriteMovies.length === 2) {
        descriptions.push(`You both love "${sharedFavoriteMovies[0].title}" and "${sharedFavoriteMovies[1].title}"`);
      } else {
        descriptions.push(`You share ${sharedFavoriteMovies.length} favorite movies`);
      }
    }
    
    // Check for genre overlap
    if (sharedGenres.length > 0) {
      const genreList = sharedGenres.slice(0, 3).map(g => {
        const genreName = typeof g === 'string' ? g : (g.name || g.id || g);
        // Make genre names lowercase for natural reading and handle pluralization
        const lowerName = genreName.toLowerCase();
        // Improved pluralization rules for common movie genres
        if (lowerName.endsWith('y') && !['y', 'e', 'i', 'o', 'u'].includes(lowerName[lowerName.length - 2])) {
          // consonant + y -> ies (comedy -> comedies, but not toy -> toies)
          return lowerName.slice(0, -1) + 'ies';
        } else if (lowerName.endsWith('s') || lowerName.endsWith('sh') || lowerName.endsWith('ch') || lowerName.endsWith('x') || lowerName.endsWith('z')) {
          return lowerName + 'es';
        } else {
          return lowerName + 's';
        }
      });
      
      if (genreList.length === 1) {
        descriptions.push(`love ${genreList[0]}`);
      } else if (genreList.length === 2) {
        descriptions.push(`love ${genreList[0]} and ${genreList[1]}`);
      } else {
        descriptions.push(`love ${genreList.slice(0, -1).join(', ')}, and ${genreList[genreList.length - 1]}`);
      }
    }
    
    // Check for viewing style compatibility (quiz)
    if (quizCompatibility >= 20) {
      descriptions.push('have similar viewing preferences');
    }
    
    // Check for emotional tone alignment
    if (emotionalToneCompatibility >= 7) {
      descriptions.push('share the same emotional vibe');
    }
    
    // Check for binge-watching patterns
    const bingeDiff = Math.abs(
      (user1.preferences.bingeWatchCount || 0) - (user2.preferences.bingeWatchCount || 0)
    );
    if (bingeDiff <= 2 && user1.preferences.bingeWatchCount > 0 && user2.preferences.bingeWatchCount > 0) {
      descriptions.push('are both binge-watchers');
    }
    
    // Check quiz responses for specific details
    if (user1.quizResponses && user2.quizResponses) {
      const q1 = user1.quizResponses;
      const q2 = user2.quizResponses;
      
      // Check for spoiler preferences
      if (q1.q3 === q2.q3 && q1.q3 === 'hate') {
        descriptions.push('hate spoilers');
      }
      
      // Check for movie length preferences
      if (q1.q2 === q2.q2 && q1.q2 === 'over_120') {
        descriptions.push('love long epic movies');
      }
      
      // Check for talking during movies
      if (q1.q5 === q2.q5 && q1.q5 === 'never') {
        descriptions.push('prefer silence during movies');
      } else if (q1.q5 === q2.q5 && q1.q5 === 'often') {
        descriptions.push('love discussing movies while watching');
      }
      
      // Check for rewatching preferences
      if (q1.q6 === q2.q6 && q1.q6 === 'infinite') {
        descriptions.push('could rewatch favorites endlessly');
      }
    }
    
    // Build final description
    let finalDescription = `${Math.round(score)}% Movie Match`;
    
    if (descriptions.length > 0) {
      // Join descriptions naturally
      if (descriptions.length === 1) {
        finalDescription += ` – ${descriptions[0].charAt(0).toUpperCase() + descriptions[0].slice(1)}`;
      } else if (descriptions.length === 2) {
        finalDescription += ` – ${descriptions[0].charAt(0).toUpperCase() + descriptions[0].slice(1)} and ${descriptions[1]}`;
      } else {
        // Capitalize first description, join with commas and "and"
        const capitalized = descriptions[0].charAt(0).toUpperCase() + descriptions[0].slice(1);
        const rest = descriptions.slice(1, -1).join(', ');
        const last = descriptions[descriptions.length - 1];
        finalDescription += ` – ${capitalized}, ${rest}, and ${last}`;
      }
    }
    
    return finalDescription;
  }



  /**
   * Find matches for a user from a pool of users
   * @param {User} user 
   * @param {Array<User>} userPool 
   * @param {number} limit 
   * @param {Object} filters - Optional filters (ageRange, locationRadius, genderPreference, sexualOrientationPreference, minMatchScore)
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
        
        // Apply minimum match score filter
        const minMatchScore = filters.minMatchScore || 0;
        if (matchResult.score >= minMatchScore) {
          matches.push(new Match(
            user.id,
            otherUser.id,
            matchResult.score,
            matchResult.sharedContent,
            matchResult.matchDescription
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

    // Gender preference filter
    const genderPref = filters.genderPreference || user.preferences.genderPreference || [];
    if (genderPref.length > 0 && !genderPref.includes('any') && otherUser.gender) {
      if (!genderPref.includes(otherUser.gender)) {
        return false;
      }
    }

    // Sexual orientation preference filter
    const orientationPref = filters.sexualOrientationPreference || user.preferences.sexualOrientationPreference || [];
    if (orientationPref.length > 0 && !orientationPref.includes('any') && otherUser.sexualOrientation) {
      if (!orientationPref.includes(otherUser.sexualOrientation)) {
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
