/**
 * Migration script to fix existing users in MongoDB with empty arrays
 * 
 * This script:
 * 1. Loads all users from the database
 * 2. Reconstructs them with the fixed User model (which applies proper defaults)
 * 3. Saves them back to the database
 * 
 * Usage:
 *   DB_TYPE=mongodb node backend/scripts/migrateExistingUsers.js
 */

require('dotenv').config();
const DatabaseFactory = require('../database/databaseFactory');
const User = require('../models/User');

async function migrateUsers() {
  let database;
  
  try {
    console.log('🔄 User Migration Script');
    console.log('========================\n');
    
    // Check database type
    const dbType = process.env.DB_TYPE || 'file';
    console.log(`Database type: ${dbType}`);
    
    if (dbType !== 'mongodb') {
      console.log('\n⚠️  Warning: DB_TYPE is not set to "mongodb"');
      console.log('This script is designed for MongoDB. For file-based storage, re-seeding is recommended.');
      console.log('\nTo proceed with MongoDB migration, set: DB_TYPE=mongodb\n');
      process.exit(0);
    }
    
    // Connect to database
    console.log('\n🔌 Connecting to database...');
    database = await DatabaseFactory.createDatabase();
    console.log('✅ Database connected\n');
    
    // Load all users
    console.log('📥 Loading users from database...');
    const users = await database.loadUsers();
    console.log(`Found ${users.length} users to migrate\n`);
    
    if (users.length === 0) {
      console.log('No users found. Nothing to migrate.');
      process.exit(0);
    }
    
    // Track migration stats
    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    const errors = [];
    
    // Migrate each user
    console.log('🔄 Migrating users...');
    for (const userData of users) {
      try {
        // Check if user needs migration (has undefined/null arrays rather than empty arrays)
        // We check for undefined/null specifically, not empty arrays, since users might legitimately have no items
        const needsMigration = 
          userData.streamingServices === undefined || userData.streamingServices === null ||
          userData.favoriteMovies === undefined || userData.favoriteMovies === null ||
          userData.swipedMovies === undefined || userData.swipedMovies === null ||
          userData.preferences?.genres === undefined || userData.preferences?.genres === null ||
          userData.preferences?.genderPreference === undefined ||
          userData.preferences?.sexualOrientationPreference === undefined;
        
        if (!needsMigration) {
          skippedCount++;
          continue;
        }
        
        // Reconstruct user with fixed model (applies proper defaults)
        const user = new User(userData);
        const fixedData = user.toJSON();
        
        // Preserve password
        fixedData.password = userData.password;
        
        // Update in database
        await database.updateUser(userData.id, fixedData);
        
        migratedCount++;
        
        // Show progress
        if (migratedCount % 10 === 0) {
          console.log(`  Migrated ${migratedCount} users...`);
        }
      } catch (error) {
        errorCount++;
        errors.push({
          userId: userData.id,
          username: userData.username,
          error: error.message
        });
        console.error(`  ❌ Error migrating user ${userData.username}:`, error.message);
      }
    }
    
    // Summary
    console.log('\n📊 Migration Summary:');
    console.log(`  ✅ Successfully migrated: ${migratedCount} users`);
    console.log(`  ⏭️  Skipped (already valid): ${skippedCount} users`);
    console.log(`  ❌ Errors: ${errorCount} users`);
    
    if (errors.length > 0) {
      console.log('\n⚠️  Errors encountered:');
      errors.forEach(err => {
        console.log(`  - ${err.username} (${err.userId}): ${err.error}`);
      });
    }
    
    if (migratedCount > 0) {
      console.log('\n✅ Migration completed successfully!');
      console.log('💡 You can now verify the data in MongoDB Atlas');
      console.log('💡 Test matches by logging in and navigating to the discover page');
    } else {
      console.log('\n💡 No users needed migration. All users already have valid data.');
    }
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    // Disconnect from database
    if (database && typeof database.disconnect === 'function') {
      await database.disconnect();
      console.log('\n🔌 Database disconnected');
    }
  }
}

// Run migration if executed directly
if (require.main === module) {
  migrateUsers()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateUsers };
