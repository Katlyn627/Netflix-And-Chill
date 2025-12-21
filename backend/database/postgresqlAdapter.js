const config = require('../config/config');

/**
 * PostgreSQL adapter for data storage
 * Requires: npm install pg
 */
class PostgreSQLAdapter {
  constructor() {
    this.pool = null;
  }

  async connect() {
    try {
      const { Pool } = require('pg');
      this.pool = new Pool(config.database.postgresql);
      
      // Test connection
      await this.pool.query('SELECT NOW()');
      console.log('Connected to PostgreSQL');
      
      // Create tables if they don't exist
      await this.createTables();
    } catch (error) {
      console.error('PostgreSQL connection error:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.pool) {
      await this.pool.end();
    }
  }

  async createTables() {
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        bio TEXT,
        age INTEGER,
        location VARCHAR(255),
        profile_picture TEXT,
        photo_gallery JSONB DEFAULT '[]'::jsonb,
        streaming_services JSONB DEFAULT '[]'::jsonb,
        watch_history JSONB DEFAULT '[]'::jsonb,
        preferences JSONB DEFAULT '{}'::jsonb,
        likes JSONB DEFAULT '[]'::jsonb,
        super_likes JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createMatchesTable = `
      CREATE TABLE IF NOT EXISTS matches (
        id VARCHAR(255) PRIMARY KEY,
        user1_id VARCHAR(255) REFERENCES users(id),
        user2_id VARCHAR(255) REFERENCES users(id),
        match_score INTEGER,
        shared_content JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user1_id, user2_id)
      )
    `;

    const createLikesTable = `
      CREATE TABLE IF NOT EXISTS likes (
        id VARCHAR(255) PRIMARY KEY,
        from_user_id VARCHAR(255) REFERENCES users(id),
        to_user_id VARCHAR(255) REFERENCES users(id),
        type VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createChatsTable = `
      CREATE TABLE IF NOT EXISTS chats (
        id VARCHAR(255) PRIMARY KEY,
        sender_id VARCHAR(255) REFERENCES users(id),
        receiver_id VARCHAR(255) REFERENCES users(id),
        message TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        read BOOLEAN DEFAULT FALSE
      )
    `;

    await this.pool.query(createUsersTable);
    await this.pool.query(createMatchesTable);
    await this.pool.query(createLikesTable);
    await this.pool.query(createChatsTable);
  }

  // User operations
  async addUser(user) {
    const query = `
      INSERT INTO users (id, username, email, bio, age, location, profile_picture, 
        photo_gallery, streaming_services, watch_history, preferences, likes, super_likes, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;
    
    const values = [
      user.id, user.username, user.email, user.bio, user.age, user.location,
      user.profilePicture, JSON.stringify(user.photoGallery), 
      JSON.stringify(user.streamingServices), JSON.stringify(user.watchHistory),
      JSON.stringify(user.preferences), JSON.stringify(user.likes),
      JSON.stringify(user.superLikes), user.createdAt
    ];

    const result = await this.pool.query(query, values);
    return this.formatUser(result.rows[0]);
  }

  async findUserById(userId) {
    const result = await this.pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    return result.rows.length > 0 ? this.formatUser(result.rows[0]) : null;
  }

  async findUserByEmail(email) {
    const result = await this.pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows.length > 0 ? this.formatUser(result.rows[0]) : null;
  }

  async updateUser(userId, updates) {
    // Build dynamic update query
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      const snakeKey = this.camelToSnake(key);
      if (typeof updates[key] === 'object') {
        fields.push(`${snakeKey} = $${paramCount}`);
        values.push(JSON.stringify(updates[key]));
      } else {
        fields.push(`${snakeKey} = $${paramCount}`);
        values.push(updates[key]);
      }
      paramCount++;
    });

    values.push(userId);
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    
    const result = await this.pool.query(query, values);
    return result.rows.length > 0 ? this.formatUser(result.rows[0]) : null;
  }

  async loadUsers() {
    const result = await this.pool.query('SELECT * FROM users');
    return result.rows.map(row => this.formatUser(row));
  }

  // Match operations
  async addMatch(match) {
    const query = `
      INSERT INTO matches (id, user1_id, user2_id, match_score, shared_content, created_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [
      match.id, match.user1Id, match.user2Id, match.matchScore,
      JSON.stringify(match.sharedContent), match.createdAt
    ];

    const result = await this.pool.query(query, values);
    return this.formatMatch(result.rows[0]);
  }

  async findMatchesForUser(userId) {
    const query = 'SELECT * FROM matches WHERE user1_id = $1 OR user2_id = $1';
    const result = await this.pool.query(query, [userId]);
    return result.rows.map(row => this.formatMatch(row));
  }

  // Like operations
  async addLike(like) {
    const query = `
      INSERT INTO likes (id, from_user_id, to_user_id, type, created_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const values = [like.id, like.fromUserId, like.toUserId, like.type, like.createdAt];
    const result = await this.pool.query(query, values);
    return this.formatLike(result.rows[0]);
  }

  async findLikesForUser(userId) {
    const result = await this.pool.query('SELECT * FROM likes WHERE from_user_id = $1', [userId]);
    return result.rows.map(row => this.formatLike(row));
  }

  async findLikesToUser(userId) {
    const result = await this.pool.query('SELECT * FROM likes WHERE to_user_id = $1', [userId]);
    return result.rows.map(row => this.formatLike(row));
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

  // Chat operations
  async addChatMessage(chatMessage) {
    const query = `
      INSERT INTO chats (id, sender_id, receiver_id, message, timestamp, read)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [
      chatMessage.id,
      chatMessage.senderId,
      chatMessage.receiverId,
      chatMessage.message,
      chatMessage.timestamp,
      chatMessage.read || false
    ];

    const result = await this.pool.query(query, values);
    return this.formatChat(result.rows[0]);
  }

  async getChatMessages(userId1, userId2) {
    const query = `
      SELECT * FROM chats 
      WHERE (sender_id = $1 AND receiver_id = $2) 
         OR (sender_id = $2 AND receiver_id = $1)
      ORDER BY timestamp ASC
    `;
    
    const result = await this.pool.query(query, [userId1, userId2]);
    return result.rows.map(row => this.formatChat(row));
  }

  // Helper methods
  formatUser(row) {
    if (!row) return null;
    return {
      id: row.id,
      username: row.username,
      email: row.email,
      bio: row.bio,
      age: row.age,
      location: row.location,
      profilePicture: row.profile_picture,
      photoGallery: row.photo_gallery,
      streamingServices: row.streaming_services,
      watchHistory: row.watch_history,
      preferences: row.preferences,
      likes: row.likes,
      superLikes: row.super_likes,
      createdAt: row.created_at
    };
  }

  formatMatch(row) {
    if (!row) return null;
    return {
      id: row.id,
      user1Id: row.user1_id,
      user2Id: row.user2_id,
      matchScore: row.match_score,
      sharedContent: row.shared_content,
      createdAt: row.created_at
    };
  }

  formatLike(row) {
    if (!row) return null;
    return {
      id: row.id,
      fromUserId: row.from_user_id,
      toUserId: row.to_user_id,
      type: row.type,
      createdAt: row.created_at
    };
  }

  formatChat(row) {
    if (!row) return null;
    return {
      id: row.id,
      senderId: row.sender_id,
      receiverId: row.receiver_id,
      message: row.message,
      timestamp: row.timestamp,
      read: row.read
    };
  }

  camelToSnake(str) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}

module.exports = PostgreSQLAdapter;
