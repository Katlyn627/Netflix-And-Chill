const config = require('../config/config');

/**
 * MongoDB adapter for data storage
 * Requires: npm install mongodb
 */
class MongoDBAdapter {
  constructor() {
    this.client = null;
    this.db = null;
  }

  async connect() {
    try {
      const { MongoClient } = require('mongodb');
      this.client = new MongoClient(config.database.mongodb.uri);
      await this.client.connect();
      this.db = this.client.db();
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
    }
  }

  // User operations
  async addUser(user) {
    const result = await this.db.collection('users').insertOne(user);
    return { ...user, _id: result.insertedId };
  }

  async findUserById(userId) {
    return await this.db.collection('users').findOne({ id: userId });
  }

  async findUserByEmail(email) {
    return await this.db.collection('users').findOne({ email });
  }

  async updateUser(userId, updates) {
    const result = await this.db.collection('users').findOneAndUpdate(
      { id: userId },
      { $set: updates },
      { returnDocument: 'after' }
    );
    return result.value;
  }

  async loadUsers() {
    return await this.db.collection('users').find({}).toArray();
  }

  // Match operations
  async addMatch(match) {
    const result = await this.db.collection('matches').insertOne(match);
    return { ...match, _id: result.insertedId };
  }

  async findMatchesForUser(userId) {
    return await this.db.collection('matches').find({
      $or: [{ user1Id: userId }, { user2Id: userId }]
    }).toArray();
  }

  // Like operations
  async addLike(like) {
    const result = await this.db.collection('likes').insertOne(like);
    return { ...like, _id: result.insertedId };
  }

  async findLikesForUser(userId) {
    return await this.db.collection('likes').find({ fromUserId: userId }).toArray();
  }

  async findLikesToUser(userId) {
    return await this.db.collection('likes').find({ toUserId: userId }).toArray();
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

module.exports = MongoDBAdapter;
