class User {
  constructor(data) {
    this.id = data.id || this.generateId();
    this.username = data.username;
    this.email = data.email;
    // NOTE: In production, passwords should be hashed using bcrypt or similar
    // This is stored in plain text for demo purposes only
    this.password = data.password; // Store password (in production, this should be hashed)
    this.bio = data.bio || '';
    this.age = data.age;
    this.location = data.location || '';
    this.gender = data.gender || '';
    this.sexualOrientation = data.sexualOrientation || '';
    this.profilePicture = data.profilePicture || null;
    this.photoGallery = data.photoGallery || [];
    this.streamingServices = data.streamingServices || [];
    this.watchHistory = data.watchHistory || [];
    // Initialize preferences with proper defaults for all nested properties
    this.preferences = {
      genres: data.preferences?.genres || [],
      bingeWatchCount: data.preferences?.bingeWatchCount !== undefined ? data.preferences.bingeWatchCount : 0,
      ageRange: data.preferences?.ageRange || { min: 18, max: 100 },
      locationRadius: data.preferences?.locationRadius !== undefined ? data.preferences.locationRadius : 50,
      genderPreference: data.preferences?.genderPreference || [],
      sexualOrientationPreference: data.preferences?.sexualOrientationPreference || []
    };
    this.likes = data.likes || [];
    this.superLikes = data.superLikes || [];
    this.leastFavoriteMovies = data.leastFavoriteMovies || [];
    this.movieDebateTopics = data.movieDebateTopics || [];
    this.favoriteSnacks = data.favoriteSnacks || [];
    this.videoChatPreference = data.videoChatPreference || null; // 'facetime', 'zoom', 'either'
    
    // ========== SWIPE HISTORY & PREFERENCES ==========
    // Comprehensive tracking system for movie/TV show discovery swipes
    // Each swipe records: tmdbId, title, posterPath, genreIds, contentType, action, swipedAt
    // This data persists across sessions and powers:
    // 1. Filtering - prevents showing already-swiped content
    // 2. Analytics - identifies genre preferences and viewing patterns
    // 3. Recommendations - enhances content suggestions based on swipe behavior
    this.swipedMovies = data.swipedMovies || []; // Array of {tmdbId, title, posterPath, action: 'like'|'dislike', swipedAt, genreIds, contentType}
    this.swipePreferences = data.swipePreferences || null; // Cached analytics: {genrePreferences, contentTypeBreakdown, topGenres, etc.}
    // ================================================
    
    // New fields for enhanced profile features
    this.favoriteMovies = data.favoriteMovies || []; // Array of movie objects with TMDB data
    this.favoriteTVShows = data.favoriteTVShows || []; // Array of TV show objects with TMDB data
    this.movieRatings = data.movieRatings || []; // Array of {tmdbId, title, rating, ratedAt}
    this.movieWatchlist = data.movieWatchlist || []; // Array of movie objects with TMDB data
    this.tvWatchlist = data.tvWatchlist || []; // Array of TV show objects with TMDB data
    // Quiz and personality fields
    this.quizAttempts = data.quizAttempts || []; // Array of QuizAttempt objects
    this.personalityProfile = data.personalityProfile || null; // Latest personality profile from quiz
    this.personalityBio = data.personalityBio || ''; // Auto-generated bio based on personality
    this.archetype = data.archetype || null; // Primary personality archetype {type, name, description, strength}
    this.lastQuizCompletedAt = data.lastQuizCompletedAt || null; // Timestamp of last quiz completion
    // Profile frame customization based on archetype
    this.profileFrame = data.profileFrame || null; // Selected profile frame theme {archetypeType, isActive, selectedAt}
    // Premium profile features
    this.isPremium = data.isPremium || false; // Premium profile status
    this.premiumSince = data.premiumSince || null; // When premium was activated
    this.premiumFeatures = data.premiumFeatures || []; // Array of enabled premium features
    this.profileBoosted = data.profileBoosted || false; // Profile boost status
    this.boostExpiresAt = data.boostExpiresAt || null; // When boost expires
    this.boostHistory = data.boostHistory || []; // Array of boost timestamps
    // Appearance preferences - comprehensive settings for visual customization
    this.appearancePreferences = data.appearancePreferences || {
      // Global Visual Settings
      theme: 'cinematic-red', // cinematic-red, noir, warm-cinema, minimal-monochrome, auto
      contrastMode: 'standard', // standard, high, soft
      motionLevel: 'full', // full, reduced, static
      // Background Style per Page
      backgrounds: {
        home: 'film-grain', // film-grain, theater-seats, velvet-curtain, matte-black, rotating-gradients
        profile: 'spotlight-fade', // spotlight-fade, film-strip, spotlight-halo, minimal-matte, poster-style
        chat: 'dark-blur', // dark-blur, soft-gradient, aisle-bokeh, solid-color
        watchTogether: 'theater-dim' // theater-dim, projection-glow, letterbox, popcorn-grain
      },
      // Background Behavior
      dynamicResponses: {
        matchWarmth: true,
        messagePulse: true,
        typingDim: true,
        sessionSpotlight: true
      },
      timeBasedChanges: true,
      // Personalization
      matchBasedAdjustments: true,
      emotionalTone: 'cozy', // cozy, romantic, playful, dramatic, minimal
      // Accessibility & Comfort
      eyeStrainReduction: false,
      reducedRedSaturation: false,
      fontBackgroundSpacing: 'normal', // compact, normal, comfortable, spacious
      focusMode: false,
      // Performance
      staticBackgroundFallback: false,
      lazyLoadTextures: true
    };
    // Ensure nested objects are properly initialized
    if (!this.appearancePreferences.backgrounds) {
      this.appearancePreferences.backgrounds = {
        home: 'film-grain',
        profile: 'spotlight-fade',
        chat: 'dark-blur',
        watchTogether: 'theater-dim'
      };
    }
    if (!this.appearancePreferences.dynamicResponses) {
      this.appearancePreferences.dynamicResponses = {
        matchWarmth: true,
        messagePulse: true,
        typingDim: true,
        sessionSpotlight: true
      };
    }
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  generateId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  addStreamingService(service) {
    if (!this.streamingServices.find(s => s.id === service.id || s.name === service.name)) {
      this.streamingServices.push({
        id: service.id || null,
        name: service.name,
        logoPath: service.logoPath || null,
        logoUrl: service.logoUrl || null,
        connected: true,
        connectedAt: new Date().toISOString()
      });
    }
  }

  removeStreamingService(serviceId, serviceName) {
    this.streamingServices = this.streamingServices.filter(s => 
      s.id !== serviceId && s.name !== serviceName
    );
  }

  updateStreamingServices(services) {
    this.streamingServices = services.map(service => ({
      id: service.id || null,
      name: service.name,
      logoPath: service.logoPath || null,
      logoUrl: service.logoUrl || null,
      connected: true,
      connectedAt: new Date().toISOString()
    }));
  }

  addToWatchHistory(item) {
    this.watchHistory.push({
      title: item.title,
      type: item.type, // 'movie', 'tvshow', 'series'
      genre: item.genre,
      service: item.service,
      episodesWatched: item.episodesWatched || 1,
      posterPath: item.posterPath || null,
      tmdbId: item.tmdbId || null,
      watchedAt: new Date().toISOString()
    });
  }

  removeFromWatchHistory(watchedAt) {
    this.watchHistory = this.watchHistory.filter(item => item.watchedAt !== watchedAt);
  }

  updateBio(bio) {
    this.bio = bio;
  }

  addPhoto(photoUrl) {
    if (this.photoGallery.length < 6) {
      this.photoGallery.push({
        url: photoUrl,
        uploadedAt: new Date().toISOString()
      });
    }
  }

  removePhoto(photoUrl) {
    this.photoGallery = this.photoGallery.filter(photo => photo.url !== photoUrl);
  }

  addLike(userId) {
    if (!this.likes.includes(userId)) {
      this.likes.push(userId);
    }
  }

  addSuperLike(userId) {
    if (!this.superLikes.includes(userId)) {
      this.superLikes.push(userId);
    }
  }

  // Methods for managing favorite movies
  addFavoriteMovie(movieData) {
    const exists = this.favoriteMovies.find(m => m.tmdbId === movieData.tmdbId);
    if (!exists) {
      this.favoriteMovies.push({
        tmdbId: movieData.tmdbId,
        title: movieData.title,
        posterPath: movieData.posterPath,
        overview: movieData.overview,
        releaseDate: movieData.releaseDate,
        addedAt: new Date().toISOString()
      });
    }
  }

  removeFavoriteMovie(tmdbId) {
    this.favoriteMovies = this.favoriteMovies.filter(m => m.tmdbId !== tmdbId);
  }

  // Methods for managing favorite TV shows
  addFavoriteTVShow(tvData) {
    const exists = this.favoriteTVShows.find(tv => tv.tmdbId === tvData.tmdbId);
    if (!exists) {
      this.favoriteTVShows.push({
        tmdbId: tvData.tmdbId,
        title: tvData.title,
        posterPath: tvData.posterPath,
        overview: tvData.overview,
        firstAirDate: tvData.firstAirDate,
        addedAt: new Date().toISOString()
      });
    }
  }

  removeFavoriteTVShow(tmdbId) {
    this.favoriteTVShows = this.favoriteTVShows.filter(tv => tv.tmdbId !== tmdbId);
  }

  // Methods for managing movie ratings
  addOrUpdateMovieRating(ratingData) {
    const existingIndex = this.movieRatings.findIndex(r => r.tmdbId === ratingData.tmdbId);
    const ratingObj = {
      tmdbId: ratingData.tmdbId,
      title: ratingData.title,
      rating: ratingData.rating,
      posterPath: ratingData.posterPath,
      ratedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      this.movieRatings[existingIndex] = ratingObj;
    } else {
      this.movieRatings.push(ratingObj);
    }
  }

  // Methods for managing movie watchlist
  addToMovieWatchlist(movieData) {
    const exists = this.movieWatchlist.find(m => m.tmdbId === movieData.tmdbId);
    if (!exists) {
      this.movieWatchlist.push({
        tmdbId: movieData.tmdbId,
        title: movieData.title,
        posterPath: movieData.posterPath,
        overview: movieData.overview,
        releaseDate: movieData.releaseDate,
        addedAt: new Date().toISOString()
      });
    }
  }

  removeFromMovieWatchlist(tmdbId) {
    this.movieWatchlist = this.movieWatchlist.filter(m => m.tmdbId !== tmdbId);
  }

  // Methods for managing TV watchlist
  addToTVWatchlist(tvData) {
    const exists = this.tvWatchlist.find(tv => tv.tmdbId === tvData.tmdbId);
    if (!exists) {
      this.tvWatchlist.push({
        tmdbId: tvData.tmdbId,
        title: tvData.title,
        posterPath: tvData.posterPath,
        overview: tvData.overview,
        firstAirDate: tvData.firstAirDate,
        addedAt: new Date().toISOString()
      });
    }
  }

  removeFromTVWatchlist(tmdbId) {
    this.tvWatchlist = this.tvWatchlist.filter(tv => tv.tmdbId !== tmdbId);
  }

  // Methods for managing swiped movies
  addSwipedMovie(movieData, action) {
    const existingIndex = this.swipedMovies.findIndex(m => m.tmdbId === movieData.tmdbId);
    const swipeObj = {
      tmdbId: movieData.tmdbId,
      title: movieData.title,
      posterPath: movieData.posterPath,
      genreIds: movieData.genreIds || [], // Store genre IDs for analytics
      contentType: movieData.contentType || 'movie', // Store content type (movie or tv)
      action: action, // 'like' or 'dislike'
      swipedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      this.swipedMovies[existingIndex] = swipeObj;
    } else {
      this.swipedMovies.push(swipeObj);
    }
  }

  getLikedMovies() {
    return this.swipedMovies.filter(m => m.action === 'like');
  }

  // Calculate and update swipe preferences analytics
  updateSwipePreferences(analytics) {
    this.swipePreferences = analytics;
  }

  // Get swipe preferences (returns cached or null)
  getSwipePreferences() {
    return this.swipePreferences;
  }

  // Get swipe count for today based on swipedAt timestamps (using UTC dates)
  getDailySwipeCount() {
    const today = new Date();
    const todayUTC = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
    
    const todaySwipes = this.swipedMovies.filter(movie => {
      const swipedDate = new Date(movie.swipedAt);
      const swipedUTC = Date.UTC(swipedDate.getUTCFullYear(), swipedDate.getUTCMonth(), swipedDate.getUTCDate());
      return swipedUTC === todayUTC;
    });
    
    return todaySwipes.length;
  }

  // Get swipes made today (using UTC dates)
  getTodaySwipes() {
    const today = new Date();
    const todayUTC = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
    
    return this.swipedMovies.filter(movie => {
      const swipedDate = new Date(movie.swipedAt);
      const swipedUTC = Date.UTC(swipedDate.getUTCFullYear(), swipedDate.getUTCMonth(), swipedDate.getUTCDate());
      return swipedUTC === todayUTC;
    });
  }

  toJSON() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      bio: this.bio,
      age: this.age,
      location: this.location,
      gender: this.gender,
      sexualOrientation: this.sexualOrientation,
      profilePicture: this.profilePicture,
      photoGallery: this.photoGallery,
      streamingServices: this.streamingServices,
      watchHistory: this.watchHistory,
      preferences: this.preferences,
      likes: this.likes,
      superLikes: this.superLikes,
      leastFavoriteMovies: this.leastFavoriteMovies,
      movieDebateTopics: this.movieDebateTopics,
      favoriteSnacks: this.favoriteSnacks,
      videoChatPreference: this.videoChatPreference,
      swipedMovies: this.swipedMovies,
      swipePreferences: this.swipePreferences,
      favoriteMovies: this.favoriteMovies,
      favoriteTVShows: this.favoriteTVShows,
      movieRatings: this.movieRatings,
      movieWatchlist: this.movieWatchlist,
      tvWatchlist: this.tvWatchlist,
      quizAttempts: this.quizAttempts,
      personalityProfile: this.personalityProfile,
      personalityBio: this.personalityBio,
      archetype: this.archetype,
      lastQuizCompletedAt: this.lastQuizCompletedAt,
      profileFrame: this.profileFrame,
      isPremium: this.isPremium,
      premiumSince: this.premiumSince,
      premiumFeatures: this.premiumFeatures,
      profileBoosted: this.profileBoosted,
      boostExpiresAt: this.boostExpiresAt,
      boostHistory: this.boostHistory,
      createdAt: this.createdAt
    };
  }

  // Method to verify password without exposing it
  verifyPassword(password) {
    return this.password === password;
  }

  // Method to update password
  updatePassword(newPassword) {
    // In production, this should hash the password
    this.password = newPassword;
  }

  // Premium profile methods
  setPremiumStatus(isPremium) {
    this.isPremium = isPremium;
    if (isPremium && !this.premiumSince) {
      this.premiumSince = new Date().toISOString();
    } else if (!isPremium) {
      this.premiumSince = null;
      this.premiumFeatures = [];
    }
  }

  addPremiumFeature(feature) {
    if (this.isPremium && !this.premiumFeatures.includes(feature)) {
      this.premiumFeatures.push(feature);
    }
  }

  removePremiumFeature(feature) {
    this.premiumFeatures = this.premiumFeatures.filter(f => f !== feature);
  }

  hasPremiumFeature(feature) {
    return this.isPremium && this.premiumFeatures.includes(feature);
  }

  // Boost profile methods
  activateBoost(durationHours = 24) {
    if (!this.isPremium) {
      return false;
    }
    this.profileBoosted = true;
    this.boostExpiresAt = new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString();
    this.boostHistory.push({
      activatedAt: new Date().toISOString(),
      expiresAt: this.boostExpiresAt
    });
    return true;
  }

  deactivateBoost() {
    this.profileBoosted = false;
    this.boostExpiresAt = null;
  }

  isBoostActive() {
    if (!this.profileBoosted || !this.boostExpiresAt) {
      return false;
    }
    const now = new Date();
    const expiresAt = new Date(this.boostExpiresAt);
    if (now >= expiresAt) {
      this.deactivateBoost();
      return false;
    }
    return true;
  }

  getBoostTimeRemaining() {
    if (!this.isBoostActive()) {
      return 0;
    }
    const now = new Date();
    const expiresAt = new Date(this.boostExpiresAt);
    return Math.max(0, expiresAt - now);
  }
}

module.exports = User;
