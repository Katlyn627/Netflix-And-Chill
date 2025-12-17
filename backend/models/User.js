class User {
  constructor(data) {
    this.id = data.id || this.generateId();
    this.username = data.username;
    this.email = data.email;
    this.bio = data.bio || '';
    this.age = data.age;
    this.location = data.location || '';
    this.streamingServices = data.streamingServices || [];
    this.watchHistory = data.watchHistory || [];
    this.preferences = data.preferences || {
      genres: [],
      bingeWatchCount: 0
    };
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

  toJSON() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      bio: this.bio,
      age: this.age,
      location: this.location,
      streamingServices: this.streamingServices,
      watchHistory: this.watchHistory,
      preferences: this.preferences,
      createdAt: this.createdAt
    };
  }
}

module.exports = User;
