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
    this.profilePicture = data.profilePicture || null;
    this.photoGallery = data.photoGallery || [];
    this.streamingServices = data.streamingServices || [];
    this.watchHistory = data.watchHistory || [];
    this.preferences = data.preferences || {
      genres: [],
      bingeWatchCount: 0,
      ageRange: { min: 18, max: 100 },
      locationRadius: 50 // in miles/km
    };
    this.likes = data.likes || [];
    this.superLikes = data.superLikes || [];
    this.leastFavoriteMovies = data.leastFavoriteMovies || [];
    this.movieDebateTopics = data.movieDebateTopics || [];
    this.favoriteSnacks = data.favoriteSnacks || [];
    this.quizResponses = data.quizResponses || {};
    this.videoChatPreference = data.videoChatPreference || null; // 'facetime', 'zoom', 'either'
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  generateId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  addStreamingService(service) {
    if (!this.streamingServices.find(s => s.name === service.name)) {
      this.streamingServices.push({
        name: service.name,
        connected: true,
        connectedAt: new Date().toISOString()
      });
    }
  }

  addToWatchHistory(item) {
    this.watchHistory.push({
      title: item.title,
      type: item.type, // 'movie', 'tvshow', 'series'
      genre: item.genre,
      service: item.service,
      episodesWatched: item.episodesWatched || 1,
      watchedAt: new Date().toISOString()
    });
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

  toJSON() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      bio: this.bio,
      age: this.age,
      location: this.location,
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
      quizResponses: this.quizResponses,
      videoChatPreference: this.videoChatPreference,
      createdAt: this.createdAt
    };
  }

  // Method to verify password without exposing it
  verifyPassword(password) {
    return this.password === password;
  }
}

module.exports = User;
