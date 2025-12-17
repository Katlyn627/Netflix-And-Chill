const fs = require('fs').promises;
const path = require('path');

class DataStore {
  constructor(dataDir = path.join(__dirname, '../../data')) {
    this.dataDir = dataDir;
    this.usersFile = path.join(this.dataDir, 'users.json');
    this.matchesFile = path.join(this.dataDir, 'matches.json');
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
    users.push(user.toJSON());
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
}

module.exports = DataStore;
