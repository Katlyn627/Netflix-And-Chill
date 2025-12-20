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

  // Placeholder patterns to detect unconfigured MongoDB URIs
  // Includes angle brackets, example cluster names, and template placeholders
  static PLACEHOLDER_PATTERNS = [
    '<', '>', // Angle brackets from template syntax
    'cluster0.abcde', // Example cluster name in documentation
    'YOUR_USERNAME', 'YOUR_PASSWORD', 'YOUR_CLUSTER' // Common placeholder text
  ];

  async connect() {
    const uri = config.database.mongodb.uri;
    
    try {
      // Validate MongoDB URI is properly configured
      // Check for placeholder values or missing configuration
      const hasPlaceholder = !uri || MongoDBAdapter.PLACEHOLDER_PATTERNS.some(pattern => uri.includes(pattern));
      
      if (hasPlaceholder) {
        throw new Error(
          'MongoDB connection string is not properly configured.\n\n' +
          'Please follow these steps:\n' +
          '1. Create a .env file in the project root (or update your existing one)\n' +
          '2. Add your MongoDB Atlas connection string:\n' +
          '   DB_TYPE=mongodb\n' +
          '   MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/netflix-and-chill?retryWrites=true&w=majority\n\n' +
          '3. Replace YOUR_USERNAME, YOUR_PASSWORD, and YOUR_CLUSTER with your actual MongoDB Atlas credentials\n\n' +
          'See MONGODB_CONNECTION_SETUP.md for detailed setup instructions.\n\n' +
          'Alternatively, you can use the file-based database by setting:\n' +
          '   DB_TYPE=file\n' +
          'or by not setting DB_TYPE at all (defaults to file).'
        );
      }

      const { MongoClient } = require('mongodb');
      this.client = new MongoClient(uri);
      await this.client.connect();
      this.db = this.client.db();
      console.log('Connected to MongoDB');
    } catch (error) {
      // Provide more helpful error messages
      if (error.message.includes('MongoDB connection string is not properly configured')) {
        // Re-throw our custom validation error as-is
        throw error;
      } else if (error.code === 'ENOTFOUND' || error.syscall === 'querySrv') {
        // Redact credentials from URI for security
        const safeUri = this._redactCredentials(uri);
        throw new Error(
          'Unable to connect to MongoDB Atlas.\n\n' +
          'This error usually means:\n' +
          '1. Your MONGODB_URI connection string contains placeholder values\n' +
          '2. Your MongoDB cluster URL is incorrect\n' +
          '3. Your internet connection is not working\n\n' +
          'Current MONGODB_URI (credentials redacted): ' + safeUri + '\n\n' +
          'Please check your .env file and ensure:\n' +
          '- You have replaced placeholder values with real credentials\n' +
          '- Your MongoDB Atlas cluster is active\n' +
          '- You have internet connectivity\n\n' +
          'See MONGODB_CONNECTION_SETUP.md for detailed setup instructions.\n\n' +
          'Original error: ' + error.message
        );
      } else if (error.message.includes('ECONNREFUSED')) {
        if (uri && (uri.includes('localhost') || uri.includes('127.0.0.1'))) {
          throw new Error(
            'Unable to connect to local MongoDB server.\n\n' +
            'This error means MongoDB is not running on localhost:27017.\n\n' +
            'To use MongoDB, you have two options:\n\n' +
            '1. Use MongoDB Atlas (cloud-hosted - recommended):\n' +
            '   - Follow the setup guide in MONGODB_CONNECTION_SETUP.md\n' +
            '   - Update your .env file with your Atlas connection string\n\n' +
            '2. Install and run MongoDB locally:\n' +
            '   - Install MongoDB Community Edition\n' +
            '   - Start the MongoDB service: mongod\n\n' +
            'Alternatively, use the file-based database:\n' +
            '   - Set DB_TYPE=file in your .env file, OR\n' +
            '   - Run the seeder without DB_TYPE: npm run seed\n\n' +
            'Original error: ' + error.message
          );
        }
        // If not localhost, re-throw the original error
        throw error;
      } else {
        console.error('MongoDB connection error:', error);
        throw error;
      }
    }
  }

  /**
   * Redact credentials from MongoDB URI for safe logging
   * @private
   * @param {string} uri - The MongoDB connection URI
   * @returns {string} The URI with credentials redacted as ***:***
   */
  _redactCredentials(uri) {
    if (!uri) return '[not set]';
    
    // Match mongodb:// or mongodb+srv:// URIs with credentials
    // Format: mongodb[+srv]://username:password@host/...
    // Regex pattern breakdown:
    // - ^(mongodb(?:\+srv)?:\/\/) - Capture protocol (group 1)
    // - ([^:]+) - Capture username until colon (group 2)
    // - : - Literal colon separator
    // - ([^@]+) - Capture password until @ (group 3)
    // - @ - Literal @ separator
    // - (.+)$ - Capture rest of URI (group 4)
    const credentialPattern = /^(mongodb(?:\+srv)?:\/\/)([^:]+):([^@]+)@(.+)$/;
    const match = uri.match(credentialPattern);
    
    if (match) {
      // match[1] = protocol (mongodb:// or mongodb+srv://)
      // match[2] = username
      // match[3] = password
      // match[4] = rest of URI (host, database, params)
      return `${match[1]}***:***@${match[4]}`;
    }
    
    // If no credentials in URI (e.g., localhost without auth), return as-is
    return uri;
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
