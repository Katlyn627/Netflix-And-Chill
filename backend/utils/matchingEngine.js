const Match = require('../models/Match');
const swipeAnalytics = require('./swipeAnalytics');
const { determineArchetype, calculateArchetypeCompatibility } = require('./movieArchetypes');
const { calculateDebateCompatibility } = require('./debatePrompts');

class MatchingEngine {
  // Scoring constants
  static POINTS_PER_SHARED_SNACK = 3;
  static POINTS_PER_SHARED_DEBATE = 2;
  static POINTS_PER_EMOTIONAL_TONE = 10; // Max points for emotional tone alignment
  static WATCHLIST_PLANNER_THRESHOLD = 10; // Watchlist size threshold for planner vs spontaneous
  /**
   * Calculate match score between two users based on shared content
   * @param {User} user1 
   * @param {User} user2 
   * @returns {Object} Match score and shared content
   */
  static calculateMatch(user1, user2) {
    let score = 0;
    const sharedContent = [];

    // Base compatibility score to ensure non-zero matches
    // Award points simply for being active users with profiles
    const BASE_SCORE = 10;
    score += BASE_SCORE;

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

    // Check for shared swiped/liked movies (from swipe feature)
    const sharedLikedMovies = this.findSharedLikedMovies(user1, user2);
    score += sharedLikedMovies.length * 30; // High weight for movies liked through swiping
    sharedContent.push(...sharedLikedMovies);

    // Check for shared watchlist movies
    const sharedWatchlistMovies = this.findSharedWatchlistMovies(user1, user2);
    score += sharedWatchlistMovies.length * 15; // Medium weight for watchlist overlap
    sharedContent.push(...sharedWatchlistMovies);

    // Bonus for similar binge-watching patterns (enhanced with analytics)
    const bingeCompatibility = this.calculateBingeWatchingCompatibility(user1, user2);
    score += bingeCompatibility;

    // Genre compatibility based on swipe analytics data
    const swipeGenreCompatibility = this.calculateSwipeGenreCompatibility(user1, user2);
    score += swipeGenreCompatibility;

    // Content type preference compatibility (movies vs TV shows) from swipe data
    const contentTypeCompatibility = this.calculateContentTypeCompatibility(user1, user2);
    score += contentTypeCompatibility;

    // Snack preferences compatibility
    const snackCompatibility = this.calculateSnackCompatibility(user1, user2);
    score += snackCompatibility;

    // Emotional tone alignment
    const emotionalToneCompatibility = this.calculateEmotionalToneAlignment(user1, user2);
    score += emotionalToneCompatibility;

    // Quiz compatibility - new enhanced feature
    const quizCompatibility = this.calculateQuizCompatibility(user1, user2);
    score += quizCompatibility;

    // Movie Personality Archetype compatibility - UNIQUE FEATURE
    const archetypeCompatibility = this.calculateArchetypeCompatibility(user1, user2);
    score += archetypeCompatibility;

    // Debate prompts compatibility - UNIQUE FEATURE
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

    // CREATIVE MATCHING FACTORS - Enhanced uniqueness
    // 1. Viewing time preferences (night owl vs early bird)
    const viewingTimeCompatibility = this.calculateViewingTimeCompatibility(user1, user2);
    score += viewingTimeCompatibility;

    // 2. Movie marathon compatibility (preference for long vs short viewing sessions)
    const marathonCompatibility = this.calculateMarathonCompatibility(user1, user2);
    score += marathonCompatibility;

    // 3. Genre diversity score (do they both like exploring or stick to favorites)
    const diversityCompatibility = this.calculateDiversityCompatibility(user1, user2);
    score += diversityCompatibility;

    // 4. Rewatch tendency compatibility (do they both rewatch favorites or always watch new content)
    const rewatchCompatibility = this.calculateRewatchCompatibility(user1, user2);
    score += rewatchCompatibility;

    // 5. Spontaneity factor (planned watching vs spontaneous browsing)
    const spontaneityCompatibility = this.calculateSpontaneityCompatibility(user1, user2);
    score += spontaneityCompatibility;

    // 6. Viewing frequency compatibility (how often they watch)
    const viewingFrequencyCompatibility = this.calculateViewingFrequencyCompatibility(user1, user2);
    score += viewingFrequencyCompatibility;

    // 7. Active streaming service usage compatibility
    const activeServiceCompatibility = this.calculateActiveServiceCompatibility(user1, user2);
    score += activeServiceCompatibility;

    // Normalize score to 0-100 range
    const normalizedScore = Math.min(100, score);

    // Generate match description
    const matchDescription = this.generateMatchDescription(normalizedScore, {
      sharedFavoriteMovies,
      sharedLikedMovies,
      sharedWatchlistMovies,
      sharedGenres,
      sharedShows,
      emotionalToneCompatibility,
      quizCompatibility,
      viewingTimeCompatibility,
      marathonCompatibility,
      diversityCompatibility,
      rewatchCompatibility,
      spontaneityCompatibility,
      bingeCompatibility,
      swipeGenreCompatibility,
      contentTypeCompatibility,
      viewingFrequencyCompatibility,
      activeServiceCompatibility,
      user1,
      user2
    });

    return {
      score: normalizedScore,
      sharedContent: sharedContent,
      sharedServices: sharedServices,
      sharedGenres: sharedGenres,
      sharedFavoriteMovies: sharedFavoriteMovies,
      sharedLikedMovies: sharedLikedMovies,
      sharedWatchlistMovies: sharedWatchlistMovies,
      snackCompatibility: snackCompatibility,
      emotionalToneCompatibility: emotionalToneCompatibility,
      quizCompatibility: quizCompatibility,
      debateCompatibility: debateCompatibility,
      bingeCompatibility: bingeCompatibility,
      swipeGenreCompatibility: swipeGenreCompatibility,
      contentTypeCompatibility: contentTypeCompatibility,
      viewingFrequencyCompatibility: viewingFrequencyCompatibility,
      activeServiceCompatibility: activeServiceCompatibility,
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
      if (movie && movie.tmdbId) {
        user2MoviesMap.set(movie.tmdbId, movie);
      }
    });
    
    // Check user1's favorite movies against user2's
    user1Movies.forEach(movie1 => {
      if (movie1 && movie1.tmdbId && user2MoviesMap.has(movie1.tmdbId)) {
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
   * Find shared movies liked through swipe feature
   * @param {User} user1 
   * @param {User} user2 
   * @returns {Array}
   */
  static findSharedLikedMovies(user1, user2) {
    const sharedMovies = [];
    
    // Get liked movies for both users - handle multiple data formats
    const user1LikedMovies = user1.getLikedMovies ? user1.getLikedMovies() : (user1.swipedMovies || []).filter(m => m.action === 'like');
    const user2LikedMovies = user2.getLikedMovies ? user2.getLikedMovies() : (user2.swipedMovies || []).filter(m => m.action === 'like');
    
    // Early return if either user has no liked movies
    if (!user1LikedMovies || user1LikedMovies.length === 0 || !user2LikedMovies || user2LikedMovies.length === 0) {
      return sharedMovies;
    }
    
    // Create a map of user2's liked movies by TMDB ID for O(1) lookups
    const user2MoviesMap = new Map();
    user2LikedMovies.forEach(movie => {
      if (movie && movie.tmdbId) {
        user2MoviesMap.set(movie.tmdbId, movie);
      }
    });
    
    // Check user1's liked movies against user2's
    user1LikedMovies.forEach(movie1 => {
      if (movie1 && movie1.tmdbId && user2MoviesMap.has(movie1.tmdbId)) {
        sharedMovies.push({
          title: movie1.title,
          type: 'liked_movie',
          tmdbId: movie1.tmdbId
        });
      }
    });
    
    return sharedMovies;
  }

  /**
   * Find shared movies in watchlists
   * @param {User} user1 
   * @param {User} user2 
   * @returns {Array}
   */
  static findSharedWatchlistMovies(user1, user2) {
    const sharedMovies = [];
    
    // Get watchlist movies for both users
    const user1Watchlist = user1.movieWatchlist || [];
    const user2Watchlist = user2.movieWatchlist || [];
    
    // Early return if either user has no watchlist movies
    if (user1Watchlist.length === 0 || user2Watchlist.length === 0) {
      return sharedMovies;
    }
    
    // Create a map of user2's watchlist movies by TMDB ID for O(1) lookups
    const user2WatchlistMap = new Map();
    user2Watchlist.forEach(movie => {
      if (movie && movie.tmdbId) {
        user2WatchlistMap.set(movie.tmdbId, movie);
      }
    });
    
    // Check user1's watchlist movies against user2's
    user1Watchlist.forEach(movie1 => {
      if (movie1 && movie1.tmdbId && user2WatchlistMap.has(movie1.tmdbId)) {
        sharedMovies.push({
          title: movie1.title,
          type: 'watchlist_movie',
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
    // Import scoring utility
    const MovieQuizScoring = require('./movieQuizScoring');
    
    // Get latest quiz attempts for both users
    const attempt1 = MovieQuizScoring.getLatestAttempt(user1.quizAttempts);
    const attempt2 = MovieQuizScoring.getLatestAttempt(user2.quizAttempts);
    
    // If either user hasn't completed the quiz, return 0
    if (!attempt1 || !attempt2) {
      return 0;
    }
    
    // Calculate quiz-based compatibility
    const compatibility = MovieQuizScoring.calculateQuizCompatibility(attempt1, attempt2);
    
    // Return normalized score (0-100), scaled down for overall match calculation
    return Math.round(compatibility.score * 0.15); // Max 15 points from quiz
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
   * Calculate compatibility based on movie debate topics (DEPRECATED - kept for backward compatibility)
   * @param {User} user1 
   * @param {User} user2 
   * @returns {number} Compatibility score from debate topics
   */
  static calculateDebateCompatibility(user1, user2) {
    return 0; // Debate topics are no longer used
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
      sharedLikedMovies = [],
      sharedWatchlistMovies = [],
      sharedGenres = [],
      sharedShows = [],
      emotionalToneCompatibility = 0,
      quizCompatibility = 0,
      user1,
      user2
    } = matchData;
    
    const descriptions = [];
    
    // Check for quiz personality compatibility
    if (quizCompatibility > 8) {
      const MovieQuizScoring = require('./movieQuizScoring');
      const attempt1 = MovieQuizScoring.getLatestAttempt(user1.quizAttempts);
      const attempt2 = MovieQuizScoring.getLatestAttempt(user2.quizAttempts);
      
      if (attempt1 && attempt2) {
        // Check for shared personality archetypes
        const archetypes1 = new Set((attempt1.personalityTraits.archetypes || []).map(a => a.type));
        const archetypes2 = new Set((attempt2.personalityTraits.archetypes || []).map(a => a.type));
        const sharedArchetypes = [...archetypes1].filter(a => archetypes2.has(a));
        
        if (sharedArchetypes.length > 0) {
          const archetype = attempt1.personalityTraits.archetypes.find(a => a.type === sharedArchetypes[0]);
          if (archetype) {
            descriptions.push(`share a ${archetype.name.toLowerCase()} personality`);
          }
        } else if (quizCompatibility >= 10) {
          descriptions.push('have compatible viewing personalities');
        }
      }
    }
    
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
    
    // Check for shared liked movies from swipe feature
    if (sharedLikedMovies.length > 0) {
      if (sharedLikedMovies.length === 1) {
        descriptions.push(`Both liked "${sharedLikedMovies[0].title}"`);
      } else if (sharedLikedMovies.length === 2) {
        descriptions.push(`Both liked "${sharedLikedMovies[0].title}" and "${sharedLikedMovies[1].title}"`);
      } else {
        descriptions.push(`Liked ${sharedLikedMovies.length} of the same movies`);
      }
    }
    
    // Check for shared watchlist movies
    if (sharedWatchlistMovies.length > 0) {
      if (sharedWatchlistMovies.length === 1) {
        descriptions.push(`Both want to watch "${sharedWatchlistMovies[0].title}"`);
      } else if (sharedWatchlistMovies.length >= 2) {
        descriptions.push(`Have ${sharedWatchlistMovies.length} movies on both watchlists`);
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
    
    // Check for emotional tone alignment
    if (emotionalToneCompatibility >= 7) {
      descriptions.push('share the same emotional vibe');
    }
    
    // Check for swipe-based genre compatibility
    const swipeGenreCompatibility = matchData.swipeGenreCompatibility || 0;
    if (swipeGenreCompatibility >= 15) {
      descriptions.push('have similar taste in movies from your swipes');
    }
    
    // Check for content type compatibility (movies vs TV shows)
    const contentTypeCompatibility = matchData.contentTypeCompatibility || 0;
    if (contentTypeCompatibility >= 8) {
      try {
        const u1Analytics = swipeAnalytics.analyzeSwipePreferences(user1.swipedMovies || []);
        const u2Analytics = swipeAnalytics.analyzeSwipePreferences(user2.swipedMovies || []);
        
        const u1MoviePref = u1Analytics.contentTypeBreakdown.moviePercentage || 0;
        const u1TvPref = u1Analytics.contentTypeBreakdown.tvShowPercentage || 0;
        
        if (u1MoviePref > 60 && u2Analytics.contentTypeBreakdown.moviePercentage > 60) {
          descriptions.push('both prefer movies over TV shows');
        } else if (u1TvPref > 60 && u2Analytics.contentTypeBreakdown.tvShowPercentage > 60) {
          descriptions.push('both love binge-watching TV series');
        }
      } catch (error) {
        // Skip if analytics fails for description generation
        console.error('Could not analyze swipe data for match description:', error.message);
      }
    }
    
    // Check for binge-watching patterns (using enhanced compatibility)
    const bingeCompatibility = matchData.bingeCompatibility || 0;
    if (bingeCompatibility >= 12) {
      descriptions.push('are both binge-watchers');
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
          // Apply premium advanced score filter if present
          const minAdvancedScore = filters.premium?.minAdvancedScore;
          if (minAdvancedScore !== undefined && matchResult.score < minAdvancedScore) {
            return; // Skip this match if it doesn't meet premium score threshold
          }
          
          matches.push(new Match(
            user.id,
            otherUser.id,
            matchResult.score,
            matchResult.sharedContent,
            matchResult.matchDescription,
            {
              quizCompatibility: matchResult.quizCompatibility,
              snackCompatibility: matchResult.snackCompatibility,
              emotionalToneCompatibility: matchResult.emotionalToneCompatibility,
              bingeCompatibility: matchResult.bingeCompatibility,
              swipeGenreCompatibility: matchResult.swipeGenreCompatibility,
              contentTypeCompatibility: matchResult.contentTypeCompatibility,
              sharedLikedMovies: matchResult.sharedLikedMovies,
              sharedWatchlistMovies: matchResult.sharedWatchlistMovies
            }
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
    if (genderPref.length > 0 && !genderPref.includes('any')) {
      // Only filter if user has specified gender AND it's not in preferences
      if (otherUser.gender && !genderPref.includes(otherUser.gender)) {
        return false;
      }
    }

    // Sexual orientation preference filter
    const orientationPref = filters.sexualOrientationPreference || user.preferences.sexualOrientationPreference || [];
    if (orientationPref.length > 0 && !orientationPref.includes('any')) {
      // Only filter if user has specified orientation AND it's not in preferences
      if (otherUser.sexualOrientation && !orientationPref.includes(otherUser.sexualOrientation)) {
        return false;
      }
    }

    // Location radius filter (simplified - would need proper geolocation in production)
    const MAX_GLOBAL_RADIUS = 1000; // Maximum radius to consider as "anywhere" (in miles/km)
    const ANYWHERE_THRESHOLD = 100; // Treat distances >= 100 miles as "anywhere"
    
    if (filters.locationRadius !== undefined || user.preferences.locationRadius !== undefined) {
      // In a real implementation, this would calculate actual distance
      const radius = filters.locationRadius !== undefined ? filters.locationRadius : user.preferences.locationRadius;
      
      // For demo/testing: if radius is >= 100 miles, don't filter by location (anywhere)
      // This allows users to match with anyone regardless of location
      if (radius !== null && radius !== undefined && radius < ANYWHERE_THRESHOLD) {
        // Only apply location filtering for distances < 100 miles
        if (user.location && otherUser.location) {
          const userLoc = user.location.toLowerCase();
          const otherLoc = otherUser.location.toLowerCase();
          
          // Extract city and state
          const userParts = userLoc.split(',').map(p => p.trim());
          const otherParts = otherLoc.split(',').map(p => p.trim());
          
          // For radii > 50 but < 100, match within same state OR same city
          if (radius > 50) {
            const sameState = userParts.length > 1 && otherParts.length > 1 && userParts[1] === otherParts[1];
            const sameCity = userParts[0] === otherParts[0];
            if (!sameState && !sameCity) {
              return false;
            }
          } else {
            // For smaller radii (<= 50), require same city
            const sameCity = userParts[0] === otherParts[0];
            if (!sameCity) {
              return false;
            }
          }
        }
      }
    }

    // Archetype preference filter
    const archetypePref = filters.archetypePreference || [];
    if (archetypePref.length > 0 && !archetypePref.includes('any')) {
      // Filter by archetype type if user has one
      if (otherUser.archetype && otherUser.archetype.type) {
        if (!archetypePref.includes(otherUser.archetype.type)) {
          return false;
        }
      } else {
        // If archetype preference is specified but other user has no archetype, exclude them
        return false;
      }
    }

    // Premium Filters (only apply if user has premium)
    if (user.isPremium && filters.premium) {
      // Filter by specific genres (premium feature)
      if (filters.premium.genreIds && filters.premium.genreIds.length > 0) {
        const otherUserGenreIds = (otherUser.preferences?.genres || []).map(g => g.id);
        const hasMatchingGenre = filters.premium.genreIds.some(genreId => 
          otherUserGenreIds.includes(genreId)
        );
        if (!hasMatchingGenre) {
          return false;
        }
      }

      // Filter by binge patterns (premium feature)
      if (filters.premium.bingeRange) {
        const { min, max } = filters.premium.bingeRange;
        const otherBingeCount = otherUser.preferences?.bingeWatchCount || 0;
        if (otherBingeCount < min || otherBingeCount > max) {
          return false;
        }
      }

      // Filter by streaming services (premium feature)
      if (filters.premium.streamingServices && filters.premium.streamingServices.length > 0) {
        const otherServices = (otherUser.streamingServices || []).map(s => s.name || s.id);
        const hasMatchingService = filters.premium.streamingServices.some(service =>
          otherServices.includes(service)
        );
        if (!hasMatchingService) {
          return false;
        }
      }

      // Filter by movie decade preferences (premium feature)
      if (filters.premium.decades && filters.premium.decades.length > 0) {
        // Check if user has movies from preferred decades in their watch history or favorites
        const userMovies = [
          ...(otherUser.favoriteMovies || []),
          ...(otherUser.watchHistory || [])
        ];
        
        const hasMatchingDecade = userMovies.some(movie => {
          if (movie.releaseDate || movie.release_date) {
            const year = new Date(movie.releaseDate || movie.release_date).getFullYear();
            const decade = Math.floor(year / 10) * 10;
            return filters.premium.decades.includes(decade);
          }
          return false;
        });
        
        if (userMovies.length > 0 && !hasMatchingDecade) {
          return false;
        }
      }

      // Advanced compatibility threshold (premium feature)
      // Note: This is now implemented in findMatches method after score calculation
    }

    return true;
  }

  /**
   * Calculate viewing time compatibility (night owl vs early bird)
   * Based on streaming service preferences and genre choices
   * Night owls tend to prefer certain genres like horror, thriller
   * Early birds might prefer news, documentary, family content
   */
  static calculateViewingTimeCompatibility(user1, user2) {
    // Define genre preferences that suggest night owl vs early bird
    const nightOwlGenres = ['horror', 'thriller', 'mystery', 'sci-fi', 'action'];
    const earlyBirdGenres = ['documentary', 'news', 'family', 'animation', 'comedy'];
    
    const u1Genres = (user1.preferences?.genres || []).map(g => 
      typeof g === 'string' ? g.toLowerCase() : (g.name || g.id || '').toLowerCase()
    );
    const u2Genres = (user2.preferences?.genres || []).map(g => 
      typeof g === 'string' ? g.toLowerCase() : (g.name || g.id || '').toLowerCase()
    );
    
    // Calculate night owl tendency (0-1 scale)
    const u1NightOwlScore = u1Genres.filter(g => nightOwlGenres.some(ng => g.includes(ng))).length / Math.max(u1Genres.length, 1);
    const u2NightOwlScore = u2Genres.filter(g => nightOwlGenres.some(ng => g.includes(ng))).length / Math.max(u2Genres.length, 1);
    
    // Calculate early bird tendency (0-1 scale)
    const u1EarlyBirdScore = u1Genres.filter(g => earlyBirdGenres.some(eg => g.includes(eg))).length / Math.max(u1Genres.length, 1);
    const u2EarlyBirdScore = u2Genres.filter(g => earlyBirdGenres.some(eg => g.includes(eg))).length / Math.max(u2Genres.length, 1);
    
    // Calculate similarity in viewing time preference
    const nightOwlSimilarity = 1 - Math.abs(u1NightOwlScore - u2NightOwlScore);
    const earlyBirdSimilarity = 1 - Math.abs(u1EarlyBirdScore - u2EarlyBirdScore);
    
    // Return average similarity score scaled to 0-8 points
    return Math.round((nightOwlSimilarity + earlyBirdSimilarity) / 2 * 8);
  }

  /**
   * Calculate marathon compatibility (long vs short viewing sessions)
   * Based on binge count patterns
   */
  static calculateMarathonCompatibility(user1, user2) {
    // Support both bingeWatchCount and bingeCount for compatibility
    const u1Binge = user1.preferences?.bingeWatchCount || user1.preferences?.bingeCount || 0;
    const u2Binge = user2.preferences?.bingeWatchCount || user2.preferences?.bingeCount || 0;
    
    // Calculate similarity in marathon preference
    const difference = Math.abs(u1Binge - u2Binge);
    
    if (difference === 0) return 10;
    if (difference <= 2) return 7;
    if (difference <= 4) return 4;
    return 1;
  }

  /**
   * Calculate diversity compatibility (exploring new genres vs favorites)
   * Based on genre count and watch history variety
   */
  static calculateDiversityCompatibility(user1, user2) {
    const u1Genres = (user1.preferences?.genres || []).length;
    const u2Genres = (user2.preferences?.genres || []).length;
    
    // Both have diverse tastes (many genres)
    if (u1Genres >= 5 && u2Genres >= 5) return 10;
    
    // Both have focused tastes (few genres)
    if (u1Genres <= 2 && u2Genres <= 2) return 8;
    
    // Mixed diversity
    return 4;
  }

  /**
   * Calculate rewatch compatibility
   * Based on watch history patterns (if they have rewatched content)
   */
  static calculateRewatchCompatibility(user1, user2) {
    // Check if users have duplicates in watch history (indicating rewatching)
    const u1Rewatcher = this.hasRewatchPattern(user1);
    const u2Rewatcher = this.hasRewatchPattern(user2);
    
    // Both rewatch or both don't
    return u1Rewatcher === u2Rewatcher ? 7 : 2;
  }

  /**
   * Helper method to detect rewatch patterns
   */
  static hasRewatchPattern(user) {
    const watchHistory = user.watchHistory || [];
    const titles = new Set();
    
    for (const item of watchHistory) {
      // Check if title exists before processing
      if (!item || !item.title) continue;
      
      const normalizedTitle = item.title.toLowerCase().trim();
      if (titles.has(normalizedTitle)) {
        return true; // Found a rewatch
      }
      titles.add(normalizedTitle);
    }
    
    return false;
  }

  /**
   * Calculate spontaneity compatibility
   * Based on watchlist size and quiz responses
   */
  static calculateSpontaneityCompatibility(user1, user2) {
    const u1Watchlist = (user1.movieWatchlist || []).length;
    const u2Watchlist = (user2.movieWatchlist || []).length;
    
    // Large watchlist = planner, small watchlist = spontaneous
    const u1Planner = u1Watchlist > this.WATCHLIST_PLANNER_THRESHOLD;
    const u2Planner = u2Watchlist > this.WATCHLIST_PLANNER_THRESHOLD;
    
    // Both are planners or both are spontaneous
    return u1Planner === u2Planner ? 6 : 2;
  }

  /**
   * Calculate enhanced binge-watching compatibility
   * Uses both explicit preferences and inferred patterns from swipe data
   * @param {User} user1 
   * @param {User} user2 
   * @returns {number} Compatibility score (0-20 points)
   */
  static calculateBingeWatchingCompatibility(user1, user2) {
    const u1Binge = user1.preferences?.bingeWatchCount || 0;
    const u2Binge = user2.preferences?.bingeWatchCount || 0;
    
    // Calculate base compatibility based on binge count difference
    const difference = Math.abs(u1Binge - u2Binge);
    let score = 0;
    
    if (difference === 0 && u1Binge > 0) {
      score = 15; // Perfect match in binge-watching habits
    } else if (difference <= 1) {
      score = 12; // Very close binge-watching habits
    } else if (difference <= 2) {
      score = 10; // Similar binge-watching habits
    } else if (difference <= 3) {
      score = 7; // Somewhat similar
    } else if (difference <= 5) {
      score = 4; // Moderately different
    } else {
      score = 1; // Very different binge-watching habits
    }
    
    // Bonus points if both users show evidence of binge-watching behavior in swipe data
    // Analyze if they liked TV shows (which are typically binge-watched)
    try {
      const u1Analytics = swipeAnalytics.analyzeSwipePreferences(user1.swipedMovies || []);
      const u2Analytics = swipeAnalytics.analyzeSwipePreferences(user2.swipedMovies || []);
      
      const u1TvPreference = u1Analytics.contentTypeBreakdown.tvShowPercentage || 0;
      const u2TvPreference = u2Analytics.contentTypeBreakdown.tvShowPercentage || 0;
      
      // If both users show preference for TV shows (>40%), add bonus
      if (u1TvPreference > 40 && u2TvPreference > 40) {
        score += 5; // Both likely enjoy binge-watching TV series
      }
    } catch (error) {
      // If analytics fails, just use the base score
      console.error('Could not analyze swipe data for binge compatibility:', error.message);
    }
    
    return Math.min(20, score); // Cap at 20 points
  }

  /**
   * Calculate genre compatibility based on swipe analytics
   * Uses genre preferences derived from liked movies in swipe data
   * @param {User} user1 
   * @param {User} user2 
   * @returns {number} Compatibility score (0-25 points)
   */
  static calculateSwipeGenreCompatibility(user1, user2) {
    try {
      // Get swipe analytics for both users
      const u1Analytics = swipeAnalytics.analyzeSwipePreferences(user1.swipedMovies || []);
      const u2Analytics = swipeAnalytics.analyzeSwipePreferences(user2.swipedMovies || []);
      
      // If either user has no swipe data, return 0
      if (u1Analytics.totalLikes === 0 || u2Analytics.totalLikes === 0) {
        return 0;
      }
      
      // Get top genre preferences from swipe data
      const u1Genres = u1Analytics.genrePreferences; // {Action: 5, Comedy: 3, ...}
      const u2Genres = u2Analytics.genrePreferences;
      
      // Calculate genre overlap similarity
      const allGenres = new Set([...Object.keys(u1Genres), ...Object.keys(u2Genres)]);
      
      if (allGenres.size === 0) {
        return 0;
      }
      
      // Calculate cosine similarity between genre preference vectors
      let dotProduct = 0;
      let u1Magnitude = 0;
      let u2Magnitude = 0;
      
      allGenres.forEach(genre => {
        const u1Count = u1Genres[genre] || 0;
        const u2Count = u2Genres[genre] || 0;
        
        dotProduct += u1Count * u2Count;
        u1Magnitude += u1Count * u1Count;
        u2Magnitude += u2Count * u2Count;
      });
      
      u1Magnitude = Math.sqrt(u1Magnitude);
      u2Magnitude = Math.sqrt(u2Magnitude);
      
      if (u1Magnitude === 0 || u2Magnitude === 0) {
        return 0;
      }
      
      const cosineSimilarity = dotProduct / (u1Magnitude * u2Magnitude);
      
      // Convert similarity (0-1) to score (0-25)
      const score = Math.round(cosineSimilarity * 25);
      
      return score;
    } catch (error) {
      console.error('Could not calculate swipe genre compatibility:', error.message);
      return 0;
    }
  }

  /**
   * Calculate content type preference compatibility (movies vs TV shows)
   * Based on swipe analytics data
   * @param {User} user1 
   * @param {User} user2 
   * @returns {number} Compatibility score (0-10 points)
   */
  static calculateContentTypeCompatibility(user1, user2) {
    try {
      // Get swipe analytics for both users
      const u1Analytics = swipeAnalytics.analyzeSwipePreferences(user1.swipedMovies || []);
      const u2Analytics = swipeAnalytics.analyzeSwipePreferences(user2.swipedMovies || []);
      
      // If either user has no swipe data, return 0
      if (u1Analytics.totalLikes === 0 || u2Analytics.totalLikes === 0) {
        return 0;
      }
      
      const u1MoviePref = u1Analytics.contentTypeBreakdown.moviePercentage || 0;
      const u2MoviePref = u2Analytics.contentTypeBreakdown.moviePercentage || 0;
      
      const u1TvPref = u1Analytics.contentTypeBreakdown.tvShowPercentage || 0;
      const u2TvPref = u2Analytics.contentTypeBreakdown.tvShowPercentage || 0;
      
      // Calculate similarity in content type preference
      // Use absolute difference in percentages
      const movieDiff = Math.abs(u1MoviePref - u2MoviePref);
      const tvDiff = Math.abs(u1TvPref - u2TvPref);
      
      // Average the differences and convert to similarity score
      const avgDiff = (movieDiff + tvDiff) / 2;
      const similarity = 100 - avgDiff; // 0-100 scale
      
      // Convert to 0-10 point score
      const score = Math.round((similarity / 100) * 10);
      
      return Math.max(0, score);
    } catch (error) {
      console.error('Could not calculate content type compatibility:', error.message);
      return 0;
    }
  }

  /**
   * Calculate viewing frequency compatibility
   * Matches users based on how often they watch content
   * @param {User} user1 
   * @param {User} user2 
   * @returns {number} Compatibility score (0-12 points)
   */
  static calculateViewingFrequencyCompatibility(user1, user2) {
    try {
      // Get viewing frequency for both users
      const u1Frequency = user1.calculateViewingFrequency ? user1.calculateViewingFrequency() : null;
      const u2Frequency = user2.calculateViewingFrequency ? user2.calculateViewingFrequency() : null;

      // If either user has no frequency data, return minimal score
      if (!u1Frequency || !u2Frequency) {
        return 2;
      }

      // Define frequency hierarchy: inactive < occasional < weekly < frequent < daily
      const frequencyHierarchy = {
        'inactive': 0,
        'occasional': 1,
        'weekly': 2,
        'frequent': 3,
        'daily': 4
      };

      const u1Level = frequencyHierarchy[u1Frequency.frequency] || 0;
      const u2Level = frequencyHierarchy[u2Frequency.frequency] || 0;
      const difference = Math.abs(u1Level - u2Level);

      // Score based on similarity
      if (difference === 0) {
        return 12; // Perfect match - same viewing frequency
      } else if (difference === 1) {
        return 8; // Close match - adjacent frequency levels
      } else if (difference === 2) {
        return 5; // Moderate match
      } else {
        return 2; // Different viewing frequencies
      }
    } catch (error) {
      console.error('Could not calculate viewing frequency compatibility:', error.message);
      return 2;
    }
  }

  /**
   * Calculate active service usage compatibility
   * Prioritizes matches where both users actively use shared streaming services
   * @param {User} user1 
   * @param {User} user2 
   * @returns {number} Compatibility score (0-10 points)
   */
  static calculateActiveServiceCompatibility(user1, user2) {
    try {
      const sharedServices = this.findSharedServices(user1, user2);
      
      if (sharedServices.length === 0) {
        return 0;
      }

      let activeSharedServices = 0;
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

      // Check each shared service to see if both users have used it recently
      sharedServices.forEach(serviceName => {
        const u1Service = user1.streamingServices.find(s => s.name === serviceName);
        const u2Service = user2.streamingServices.find(s => s.name === serviceName);

        if (u1Service && u2Service) {
          const u1Active = u1Service.lastUsed && new Date(u1Service.lastUsed) >= thirtyDaysAgo;
          const u2Active = u2Service.lastUsed && new Date(u2Service.lastUsed) >= thirtyDaysAgo;

          // Both users actively use this service
          if (u1Active && u2Active) {
            activeSharedServices++;
          }
        }
      });

      // Award points based on number of actively shared services
      if (activeSharedServices >= 3) {
        return 10; // Multiple actively shared services
      } else if (activeSharedServices === 2) {
        return 7; // Two actively shared services
      } else if (activeSharedServices === 1) {
        return 4; // One actively shared service
      } else {
        return 1; // Shared services but not actively used by both
      }
    } catch (error) {
      console.error('Could not calculate active service compatibility:', error.message);
      return 0;
    }
  }

  /**
   * Calculate Movie Personality Archetype compatibility
   * Unique feature that categorizes users by viewing personality
   */
  static calculateArchetypeCompatibility(user1, user2) {
    try {
      const user1Archetype = determineArchetype(user1);
      const user2Archetype = determineArchetype(user2);

      // Store archetype info on users for display (non-persistent)
      user1.archetype = user1Archetype.primary;
      user2.archetype = user2Archetype.primary;

      const compatScore = calculateArchetypeCompatibility(
        user1Archetype.primary.type,
        user2Archetype.primary.type
      );

      // Scale from 0-100 to 0-15 points
      return Math.round(compatScore * 0.15);
    } catch (error) {
      console.error('Could not calculate archetype compatibility:', error.message);
      return 0;
    }
  }

  /**
   * Calculate Debate Prompts compatibility
   * Unique feature based on controversial movie/show opinions
   */
  static calculateDebateCompatibility(user1, user2) {
    try {
      const user1Debates = user1.debateAnswers || [];
      const user2Debates = user2.debateAnswers || [];

      if (user1Debates.length === 0 || user2Debates.length === 0) {
        return 0; // No debate data yet
      }

      const compatibility = calculateDebateCompatibility(user1Debates, user2Debates);

      // Scale debate compatibility score (0-100) to 0-10 points
      return Math.round(compatibility.score * 0.10);
    } catch (error) {
      console.error('Could not calculate debate compatibility:', error.message);
      return 0;
    }
  }
}

module.exports = MatchingEngine;
