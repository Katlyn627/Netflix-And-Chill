const fs = require('fs').promises;
const path = require('path');

/**
 * File-based data storage (default storage mechanism)
 */
class DataStore {
  constructor() {
    this.dataDir = path.join(__dirname, '../../data');
    this.usersFile = path.join(this.dataDir, 'users.json');
    this.matchesFile = path.join(this.dataDir, 'matches.json');
    this.likesFile = path.join(this.dataDir, 'likes.json');
    this.chatsFile = path.join(this.dataDir, 'chats.json');
  }

  async ensureDataDir() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (error) {
      // Only ignore if directory already exists
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }
  }

  async ensureFile(filePath, defaultContent = '[]') {
    try {
      await fs.access(filePath);
    } catch {
      await fs.writeFile(filePath, defaultContent);
    }
  }

  // User operations
  async addUser(user) {
    await this.ensureDataDir();
    await this.ensureFile(this.usersFile);
    
    const users = await this.loadUsers();
    users.push(user);
    await fs.writeFile(this.usersFile, JSON.stringify(users, null, 2));
    return user;
  }

  async findUserById(userId) {
    const users = await this.loadUsers();
    return users.find(u => u.id === userId);
  }

  async findUserByEmail(email) {
    const users = await this.loadUsers();
    return users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
  }

  async updateUser(userId, updates) {
    await this.ensureDataDir();
    await this.ensureFile(this.usersFile);
    
    const users = await this.loadUsers();
    const index = users.findIndex(u => u.id === userId);
    
    if (index === -1) {
      return null;
    }
    
    users[index] = { ...users[index], ...updates };
    await fs.writeFile(this.usersFile, JSON.stringify(users, null, 2));
    return users[index];
  }

  async deleteUser(userId) {
    await this.ensureDataDir();
    await this.ensureFile(this.usersFile);
    
    const users = await this.loadUsers();
    const index = users.findIndex(u => u.id === userId);
    
    if (index === -1) {
      return null;
    }
    
    // Clean up related data first before deleting the user
    // This ensures data consistency if cleanup fails
    await this.deleteUserLikes(userId);
    await this.deleteUserMatches(userId);
    
    // Now delete the user
    const deletedUser = users[index];
    users.splice(index, 1);
    await fs.writeFile(this.usersFile, JSON.stringify(users, null, 2));
    
    return deletedUser;
  }

  async loadUsers() {
    await this.ensureDataDir();
    await this.ensureFile(this.usersFile);
    
    try {
      const data = await fs.readFile(this.usersFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  // Match operations
  async addMatch(match) {
    await this.ensureDataDir();
    await this.ensureFile(this.matchesFile);
    
    const matches = await this.loadMatches();
    matches.push(match);
    await fs.writeFile(this.matchesFile, JSON.stringify(matches, null, 2));
    return match;
  }

  async findMatchesForUser(userId) {
    const matches = await this.loadMatches();
    return matches.filter(m => m.user1Id === userId || m.user2Id === userId);
  }

  async loadMatches() {
    await this.ensureDataDir();
    await this.ensureFile(this.matchesFile);
    
    try {
      const data = await fs.readFile(this.matchesFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  // Like operations
  async addLike(like) {
    await this.ensureDataDir();
    await this.ensureFile(this.likesFile);
    
    const likes = await this.loadLikes();
    likes.push(like);
    await fs.writeFile(this.likesFile, JSON.stringify(likes, null, 2));
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

  async deleteUserLikes(userId) {
    await this.ensureDataDir();
    await this.ensureFile(this.likesFile);
    
    const likes = await this.loadLikes();
    // Remove all likes from and to the user
    const filteredLikes = likes.filter(l => l.fromUserId !== userId && l.toUserId !== userId);
    await fs.writeFile(this.likesFile, JSON.stringify(filteredLikes, null, 2));
  }

  async deleteUserMatches(userId) {
    await this.ensureDataDir();
    await this.ensureFile(this.matchesFile);
    
    const matches = await this.loadMatches();
    // Remove all matches involving the user
    const filteredMatches = matches.filter(m => m.user1Id !== userId && m.user2Id !== userId);
    await fs.writeFile(this.matchesFile, JSON.stringify(filteredMatches, null, 2));
  }

  async loadLikes() {
    await this.ensureDataDir();
    await this.ensureFile(this.likesFile);
    
    try {
      const data = await fs.readFile(this.likesFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  // Chat operations
  async addChatMessage(chatMessage) {
    await this.ensureDataDir();
    await this.ensureFile(this.chatsFile);
    
    const chats = await this.loadChats();
    chats.push(chatMessage);
    await fs.writeFile(this.chatsFile, JSON.stringify(chats, null, 2));
    return chatMessage;
  }

  async getChatMessages(userId1, userId2) {
    const chats = await this.loadChats();
    // Get all messages between the two users (both directions)
    return chats.filter(c => 
      (c.senderId === userId1 && c.receiverId === userId2) ||
      (c.senderId === userId2 && c.receiverId === userId1)
    ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }

  async loadChats() {
    await this.ensureDataDir();
    await this.ensureFile(this.chatsFile);
    
    try {
      const data = await fs.readFile(this.chatsFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }
}

module.exports = DataStore;