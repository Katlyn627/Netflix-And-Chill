const fs = require('fs').promises;
const path = require('path');

class DataStore {
  constructor(dataDir = path.join(__dirname, '../../data')) {
    this.dataDir = dataDir;
    this.usersFile = path.join(this.dataDir, 'users.json');
    this.matchesFile = path.join(this.dataDir, 'matches.json');
    this.likesFile = path.join(this.dataDir, 'likes.json');
  }

  async ensureDataDir() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (error) {
      // Ignore if directory already exists or handle other errors
      if (error.code !== 'EEXIST') {
        console.error('Error creating data directory:', error);
      }
    }
  }

  async loadUsers() {
    try {
      const data = await fs.readFile(this.usersFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      // File doesn't exist yet
      return [];
    }
  }

  async saveUsers(users) {
    await this.ensureDataDir();
    await fs.writeFile(this.usersFile, JSON.stringify(users, null, 2));
  }

  async addUser(user) {
    const users = await this.loadUsers();
    // Save the full user object including password
    const userData = {
      ...user.toJSON(),
      password: user.password // Include password for storage
    };
    users.push(userData);
    await this.saveUsers(users);
    return user;
  }

  async findUserById(userId) {
    const users = await this.loadUsers();
    return users.find(u => u.id === userId);
  }

  async findUserByEmail(email) {
    const users = await this.loadUsers();
    return users.find(u => u.email === email);
  }

  async updateUser(userId, updates) {
    const users = await this.loadUsers();
    const index = users.findIndex(u => u.id === userId);
    
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      await this.saveUsers(users);
      return users[index];
    }
    
    return null;
  }

  async loadMatches() {
    try {
      const data = await fs.readFile(this.matchesFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  async saveMatches(matches) {
    await this.ensureDataDir();
    await fs.writeFile(this.matchesFile, JSON.stringify(matches, null, 2));
  }

  async addMatch(match) {
    const matches = await this.loadMatches();
    matches.push(match.toJSON());
    await this.saveMatches(matches);
    return match;
  }

  async findMatchesForUser(userId) {
    const matches = await this.loadMatches();
    return matches.filter(m => m.user1Id === userId || m.user2Id === userId);
  }

  async loadLikes() {
    try {
      const data = await fs.readFile(this.likesFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  async saveLikes(likes) {
    await this.ensureDataDir();
    await fs.writeFile(this.likesFile, JSON.stringify(likes, null, 2));
  }

  async addLike(like) {
    const likes = await this.loadLikes();
    likes.push(like.toJSON());
    await this.saveLikes(likes);
    return like;
  }

  async findLikesForUser(userId) {
    const likes = await this.loadLikes();
    return likes.filter(l => l.fromUserId === userId);
  }

  async findLikesToUser(userId) {
    const likes = await this.loadLikes();
    return likes.filter(l => l.toUserId === userId);
  }

  async findMutualLikes(userId) {
    const likesFrom = await this.findLikesForUser(userId);
    const likesTo = await this.findLikesToUser(userId);
    
    const mutual = [];
    likesFrom.forEach(likeFrom => {
      const mutualLike = likesTo.find(likeTo => likeTo.fromUserId === likeFrom.toUserId);
      if (mutualLike) {
        mutual.push({
          userId: likeFrom.toUserId,
          matched: true
        });
      }
    });
    
    return mutual;
  }
}

module.exports = DataStore;
