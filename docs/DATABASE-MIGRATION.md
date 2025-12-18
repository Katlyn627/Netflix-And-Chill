# Database Migration Guide

This guide helps you migrate from file-based storage to MongoDB or PostgreSQL.

## Overview

Netflix and Chill supports three database types:
- **File-based** (default) - JSON files
- **MongoDB** - NoSQL database
- **PostgreSQL** - SQL database

## Prerequisites

### For MongoDB
- MongoDB installed locally OR MongoDB Atlas account
- `mongodb` npm package

### For PostgreSQL
- PostgreSQL installed locally OR cloud PostgreSQL service
- `pg` npm package

## Installation

### Install Database Drivers

```bash
# For MongoDB
npm install mongodb

# For PostgreSQL
npm install pg

# Or install both
npm install mongodb pg
```

## Configuration

### Set Environment Variables

Create a `.env` file in the root directory:

**For MongoDB:**
```env
DB_TYPE=mongodb
MONGODB_URI=mongodb://localhost:27017/netflix-and-chill
```

**For PostgreSQL:**
```env
DB_TYPE=postgresql
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=netflix_and_chill
PG_USER=postgres
PG_PASSWORD=your_password
```

**For File Storage (default):**
```env
DB_TYPE=file
```

## Migration Process

### 1. Backup Existing Data

```bash
# Create backup directory
mkdir -p backups

# Backup current data
cp -r data/ backups/data-$(date +%Y%m%d-%H%M%S)/
```

### 2. Setup Target Database

#### MongoDB Setup

**Local Installation:**
```bash
# Start MongoDB
mongod --dbpath /path/to/data

# Or if using macOS with Homebrew
brew services start mongodb-community
```

**MongoDB Atlas (Cloud):**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string
4. Update MONGODB_URI in .env

**Create Collections (Optional):**
```javascript
// MongoDB will auto-create collections, but you can create them explicitly
use netflix_and_chill
db.createCollection("users")
db.createCollection("matches")
db.createCollection("likes")

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "id": 1 }, { unique: true })
db.matches.createIndex({ "user1Id": 1 })
db.matches.createIndex({ "user2Id": 1 })
db.likes.createIndex({ "fromUserId": 1 })
db.likes.createIndex({ "toUserId": 1 })
```

#### PostgreSQL Setup

**Local Installation:**
```bash
# Create database
createdb netflix_and_chill

# Or using psql
psql -U postgres
CREATE DATABASE netflix_and_chill;
\q
```

**Tables are created automatically** by the PostgreSQL adapter, but you can create them manually:

```sql
-- Connect to database
\c netflix_and_chill

-- Create users table
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
);

-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
  id VARCHAR(255) PRIMARY KEY,
  user1_id VARCHAR(255) REFERENCES users(id),
  user2_id VARCHAR(255) REFERENCES users(id),
  match_score INTEGER,
  shared_content JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create likes table
CREATE TABLE IF NOT EXISTS likes (
  id VARCHAR(255) PRIMARY KEY,
  from_user_id VARCHAR(255) REFERENCES users(id),
  to_user_id VARCHAR(255) REFERENCES users(id),
  type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_matches_user1 ON matches(user1_id);
CREATE INDEX idx_matches_user2 ON matches(user2_id);
CREATE INDEX idx_likes_from ON likes(from_user_id);
CREATE INDEX idx_likes_to ON likes(to_user_id);
```

### 3. Migration Script

Create `scripts/migrate-data.js`:

```javascript
const fs = require('fs').promises;
const path = require('path');
const DatabaseFactory = require('../backend/database/databaseFactory');

async function migrateData() {
  try {
    console.log('Starting data migration...');

    // Load data from JSON files
    const dataDir = path.join(__dirname, '../data');
    
    const usersData = await loadJSON(path.join(dataDir, 'users.json'));
    const matchesData = await loadJSON(path.join(dataDir, 'matches.json'));
    const likesData = await loadJSON(path.join(dataDir, 'likes.json'));

    console.log(`Found ${usersData.length} users`);
    console.log(`Found ${matchesData.length} matches`);
    console.log(`Found ${likesData.length} likes`);

    // Connect to target database
    const db = await DatabaseFactory.createDatabase();
    console.log('Connected to target database');

    // Migrate users
    console.log('Migrating users...');
    for (const user of usersData) {
      await db.addUser(user);
    }
    console.log('Users migrated successfully');

    // Migrate matches
    console.log('Migrating matches...');
    for (const match of matchesData) {
      await db.addMatch(match);
    }
    console.log('Matches migrated successfully');

    // Migrate likes
    console.log('Migrating likes...');
    for (const like of likesData) {
      await db.addLike(like);
    }
    console.log('Likes migrated successfully');

    // Disconnect
    if (db.disconnect) {
      await db.disconnect();
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

async function loadJSON(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.log(`File not found: ${filePath}, returning empty array`);
    return [];
  }
}

// Run migration
migrateData();
```

### 4. Run Migration

```bash
# Make sure target database is configured in .env
node scripts/migrate-data.js
```

### 5. Update Application

Update `backend/server.js` or controllers to use DatabaseFactory:

```javascript
const DatabaseFactory = require('./database/databaseFactory');

// Initialize database
let dataStore;

async function initDatabase() {
  dataStore = await DatabaseFactory.createDatabase();
  console.log('Database initialized');
}

// Call on server start
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
```

### 6. Verify Migration

```bash
# Start the server
npm start

# Test API endpoints
curl http://localhost:3000/api/users

# Check data in database
# For MongoDB:
mongosh
use netflix_and_chill
db.users.count()
db.matches.count()

# For PostgreSQL:
psql -U postgres -d netflix_and_chill
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM matches;
```

## Cloud Database Options

### MongoDB Atlas (Free Tier)

1. **Create Account**: https://www.mongodb.com/cloud/atlas
2. **Create Cluster**: Free tier (M0) available
3. **Get Connection String**:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/netflix-and-chill?retryWrites=true&w=majority
   ```
4. **Update .env**:
   ```env
   DB_TYPE=mongodb
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/netflix-and-chill?retryWrites=true&w=majority
   ```

### Heroku PostgreSQL

```bash
# Add PostgreSQL addon
heroku addons:create heroku-postgresql:mini

# Get connection details
heroku config:get DATABASE_URL

# Set DB_TYPE
heroku config:set DB_TYPE=postgresql
```

### AWS RDS (PostgreSQL)

1. Create RDS instance via AWS Console
2. Get connection details
3. Update .env:
   ```env
   DB_TYPE=postgresql
   PG_HOST=your-rds-endpoint.amazonaws.com
   PG_PORT=5432
   PG_DATABASE=netflix_and_chill
   PG_USER=admin
   PG_PASSWORD=your_password
   ```

### Supabase (PostgreSQL)

1. Create account at https://supabase.com
2. Create new project
3. Get connection string from project settings
4. Update .env

### DigitalOcean Managed Databases

1. Create database cluster
2. Get connection details
3. Update .env accordingly

## Performance Optimization

### MongoDB Indexes

```javascript
// In MongoDB shell
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ id: 1 }, { unique: true })
db.users.createIndex({ location: 1 })
db.users.createIndex({ age: 1 })
db.matches.createIndex({ user1Id: 1, user2Id: 1 })
db.likes.createIndex({ fromUserId: 1, toUserId: 1 })
```

### PostgreSQL Indexes

```sql
-- Already included in table creation above
-- Additional indexes for optimization
CREATE INDEX idx_users_location ON users(location);
CREATE INDEX idx_users_age ON users(age);
CREATE INDEX idx_matches_score ON matches(match_score DESC);
```

## Rollback Procedure

If migration fails:

```bash
# Stop the application
# Restore from backup
cp -r backups/data-TIMESTAMP/* data/

# Revert DB_TYPE in .env
DB_TYPE=file

# Restart application
npm start
```

## Data Export

### Export from MongoDB

```bash
# Export users collection
mongoexport --db netflix_and_chill --collection users --out users.json

# Export all data
mongodump --db netflix_and_chill --out backup/
```

### Export from PostgreSQL

```bash
# Export database
pg_dump -U postgres netflix_and_chill > backup.sql

# Export specific table
pg_dump -U postgres -t users netflix_and_chill > users.sql
```

## Troubleshooting

### Connection Issues

**MongoDB:**
```javascript
// Test connection
const { MongoClient } = require('mongodb');
const client = new MongoClient(process.env.MONGODB_URI);

async function testConnection() {
  try {
    await client.connect();
    console.log('Connected successfully');
    await client.close();
  } catch (error) {
    console.error('Connection failed:', error);
  }
}

testConnection();
```

**PostgreSQL:**
```javascript
// Test connection
const { Pool } = require('pg');
const pool = new Pool({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  database: process.env.PG_DATABASE,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
});

async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('Connected successfully:', result.rows[0]);
    await pool.end();
  } catch (error) {
    console.error('Connection failed:', error);
  }
}

testConnection();
```

### Common Errors

1. **"Cannot find module 'mongodb'"**: Run `npm install mongodb`
2. **"Connection refused"**: Check database is running
3. **"Authentication failed"**: Verify username/password
4. **"Database does not exist"**: Create database first
5. **"Table already exists"**: Safe to ignore if using IF NOT EXISTS

## Security Best Practices

1. **Never commit .env files** - Add to .gitignore
2. **Use strong passwords** for database users
3. **Restrict database access** to specific IPs
4. **Enable SSL/TLS** for database connections
5. **Regularly backup data**
6. **Use environment-specific credentials**

## Monitoring

### MongoDB

```javascript
// Check database stats
db.stats()

// Check collection size
db.users.stats()

// Monitor operations
db.currentOp()
```

### PostgreSQL

```sql
-- Check database size
SELECT pg_size_pretty(pg_database_size('netflix_and_chill'));

-- Check table sizes
SELECT 
  table_name,
  pg_size_pretty(pg_total_relation_size(table_name::text))
FROM information_schema.tables
WHERE table_schema = 'public';

-- Monitor active connections
SELECT * FROM pg_stat_activity;
```

## Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Heroku Postgres](https://devcenter.heroku.com/articles/heroku-postgresql)
