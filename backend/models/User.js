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
    this.preferences = data.preferences || {
      genres: [], // Array of genre objects with {id, name, types}
      bingeWatchCount: 0,
      ageRange: { min: 18, max: 100 },
      locationRadius: 50, // in miles/km
      genderPreference: data.preferences?.genderPreference || [], // Array of preferred genders
      sexualOrientationPreference: data.preferences?.sexualOrientationPreference || [] // Array of preferred orientations
    };
    this.likes = data.likes || [];
    this.superLikes = data.superLikes || [];
    this.leastFavoriteMovies = data.leastFavoriteMovies || [];
    this.movieDebateTopics = data.movieDebateTopics || [];
    this.favoriteSnacks = data.favoriteSnacks || [];
    this.videoChatPreference = data.videoChatPreference || null; // 'facetime', 'zoom', 'either'
    // Swipe preferences - movies liked/disliked through swipe feature
    this.swipedMovies = data.swipedMovies || []; // Array of {tmdbId, title, posterPath, action: 'like'|'dislike', swipedAt, genreIds}
    this.swipePreferences = data.swipePreferences || null; // Cached analytics: {genrePreferences, contentTypeBreakdown, topGenres, etc.}
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
}

module.exports = User;
