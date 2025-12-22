/**
 * Test script to verify MongoDB insertions are preserving arrays
 * This helps diagnose the issue where arrays appear empty in MongoDB Atlas
 */

require('dotenv').config();
const User = require('../models/User');
const DatabaseFactory = require('../database/databaseFactory');

async function testMongoDBInsert() {
  let database;
  
  try {
    console.log('🧪 MongoDB Array Preservation Test');
    console.log('===================================\n');
    
    // Check database type
    const dbType = process.env.DB_TYPE || 'file';
    console.log(`Database type: ${dbType}\n`);
    
    if (dbType !== 'mongodb') {
      console.log('⚠️  DB_TYPE is not set to "mongodb"');
      console.log('To test MongoDB, set DB_TYPE=mongodb in your .env file\n');
    }
    
    // Connect to database
    console.log('🔌 Connecting to database...');
    database = await DatabaseFactory.createDatabase();
    console.log('✅ Database connected\n');
    
    // Create test user with populated arrays
    console.log('👤 Creating test user with populated arrays...');
    const testUserData = {
      username: 'test_array_user',
      email: 'test_array@test.com',
      password: 'test123',
      age: 28,
      location: 'Test City, TC',
      gender: 'non-binary',
      sexualOrientation: 'pansexual',
      bio: 'Test user for array preservation',
      streamingServices: [
        { id: 8, name: 'Netflix', logoPath: '/test.jpg', connected: true },
        { id: 9, name: 'Hulu', logoPath: '/test2.jpg', connected: true }
      ],
      favoriteMovies: [
        { tmdbId: 550, title: 'Fight Club', posterPath: '/test.jpg' },
        { tmdbId: 551, title: 'The Matrix', posterPath: '/test2.jpg' }
      ],
      swipedMovies: [
        { tmdbId: 552, title: 'Inception', action: 'like', swipedAt: new Date().toISOString() },
        { tmdbId: 553, title: 'Interstellar', action: 'like', swipedAt: new Date().toISOString() }
      ],
      preferences: {
        genres: [
          { id: 28, name: 'Action' },
          { id: 35, name: 'Comedy' },
          { id: 18, name: 'Drama' }
        ],
        bingeWatchCount: 8,
        ageRange: { min: 25, max: 35 },
        locationRadius: 50,
        genderPreference: ['any'],
        sexualOrientationPreference: ['any']
      },
      favoriteSnacks: ['Popcorn', 'Candy'],
      movieDebateTopics: ['Is Die Hard a Christmas movie?'],
      watchHistory: [
        { title: 'Breaking Bad', type: 'tvshow', service: 'Netflix', watchedAt: new Date().toISOString() }
      ]
    };
    
    const testUser = new User(testUserData);
    const userToSave = testUser.toJSON();
    // Note: toJSON() excludes the password field, so we add it back for database storage
    // In production, this should be hashed. Here we preserve the plain text for testing.
    userToSave.password = testUser.password;
    
    console.log('📊 User data before saving:');
    console.log(`  - streamingServices: ${userToSave.streamingServices.length} items`);
    console.log(`  - favoriteMovies: ${userToSave.favoriteMovies.length} items`);
    console.log(`  - swipedMovies: ${userToSave.swipedMovies.length} items`);
    console.log(`  - preferences.genres: ${userToSave.preferences.genres.length} items`);
    console.log(`  - favoriteSnacks: ${userToSave.favoriteSnacks.length} items`);
    console.log(`  - movieDebateTopics: ${userToSave.movieDebateTopics.length} items`);
    console.log(`  - watchHistory: ${userToSave.watchHistory.length} items\n`);
    
    // Save to database
    console.log('💾 Saving user to database...');
    await database.addUser(userToSave);
    console.log('✅ User saved\n');
    
    // Retrieve from database
    console.log('🔍 Retrieving user from database...');
    const retrievedUser = await database.findUserByEmail('test_array@test.com');
    
    if (!retrievedUser) {
      console.log('❌ ERROR: User not found after saving!');
      process.exit(1);
    }
    
    console.log('📊 User data after retrieval:');
    console.log(`  - streamingServices: ${retrievedUser.streamingServices?.length || 0} items`);
    console.log(`  - favoriteMovies: ${retrievedUser.favoriteMovies?.length || 0} items`);
    console.log(`  - swipedMovies: ${retrievedUser.swipedMovies?.length || 0} items`);
    console.log(`  - preferences.genres: ${retrievedUser.preferences?.genres?.length || 0} items`);
    console.log(`  - favoriteSnacks: ${retrievedUser.favoriteSnacks?.length || 0} items`);
    console.log(`  - movieDebateTopics: ${retrievedUser.movieDebateTopics?.length || 0} items`);
    console.log(`  - watchHistory: ${retrievedUser.watchHistory?.length || 0} items\n`);
    
    // Verify arrays are preserved
    console.log('🔍 Verification:');
    const checks = {
      streamingServices: (retrievedUser.streamingServices?.length || 0) === 2,
      favoriteMovies: (retrievedUser.favoriteMovies?.length || 0) === 2,
      swipedMovies: (retrievedUser.swipedMovies?.length || 0) === 2,
      genres: (retrievedUser.preferences?.genres?.length || 0) === 3,
      favoriteSnacks: (retrievedUser.favoriteSnacks?.length || 0) === 2,
      movieDebateTopics: (retrievedUser.movieDebateTopics?.length || 0) === 1,
      watchHistory: (retrievedUser.watchHistory?.length || 0) === 1
    };
    
    let allPassed = true;
    for (const [key, passed] of Object.entries(checks)) {
      console.log(`  ${passed ? '✅' : '❌'} ${key}: ${passed ? 'PASSED' : 'FAILED'}`);
      if (!passed) allPassed = false;
    }
    
    console.log('\n' + (allPassed ? '🎉 All tests PASSED!' : '❌ Some tests FAILED!'));
    
    if (!allPassed) {
      console.log('\n🔍 Detailed retrieved data:');
      console.log(JSON.stringify(retrievedUser, null, 2));
    }
    
    // Cleanup test user
    console.log('\n🧹 Cleaning up test user...');
    if (dbType === 'mongodb' && database.db) {
      await database.db.collection('users').deleteOne({ email: 'test_array@test.com' });
      console.log('✅ Cleanup complete');
    } else {
      console.log('⚠️  Skipping cleanup (not using MongoDB or db property not available)');
    }
    
    process.exit(allPassed ? 0 : 1);
    
  } catch (error) {
    console.error('\n❌ Error during test:', error);
    process.exit(1);
  } finally {
    if (database && typeof database.disconnect === 'function') {
      await database.disconnect();
      console.log('\n🔌 Database disconnected');
    }
  }
}

// Run test if executed directly
if (require.main === module) {
  testMongoDBInsert();
}

module.exports = { testMongoDBInsert };
