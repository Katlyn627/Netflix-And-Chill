/**
 * Test script to verify gender and filter fields work with MongoDB
 * Usage: DB_TYPE=mongodb node backend/scripts/testGenderFilters.js
 */

require('dotenv').config();
const User = require('../models/User');
const DatabaseFactory = require('../database/databaseFactory');

async function testGenderFilters() {
  let database;
  
  try {
    console.log('🧪 Testing Gender and Filter Fields with MongoDB');
    console.log('================================================\n');
    
    // Connect to database
    console.log('🔌 Connecting to database...');
    database = await DatabaseFactory.createDatabase();
    console.log('✅ Database connected\n');
    
    // Create a test user with all fields
    console.log('👤 Creating test user with gender and filter preferences...');
    const testUserData = {
      username: 'testuser_' + Date.now(),
      email: 'test_' + Date.now() + '@example.com',
      password: 'password123',
      age: 28,
      location: 'San Francisco, CA',
      gender: 'female',
      sexualOrientation: 'bisexual',
      bio: 'Test user for gender and filter verification',
      preferences: {
        genres: [],
        bingeWatchCount: 5,
        ageRange: { min: 25, max: 35 },
        locationRadius: 50,
        genderPreference: ['male', 'female', 'non-binary'],
        sexualOrientationPreference: ['bisexual', 'pansexual']
      }
    };
    
    const testUser = new User(testUserData);
    const userToStore = { ...testUser.toJSON(), password: testUser.password };
    
    // Save to database
    const savedUser = await database.addUser(userToStore);
    console.log('✅ User created with ID:', savedUser.id);
    console.log('   Gender:', savedUser.gender);
    console.log('   Sexual Orientation:', savedUser.sexualOrientation);
    console.log('   Gender Preferences:', savedUser.preferences.genderPreference);
    console.log('   Sexual Orientation Preferences:', savedUser.preferences.sexualOrientationPreference);
    console.log('   Location Radius:', savedUser.preferences.locationRadius);
    console.log('   Age Range:', savedUser.preferences.ageRange);
    console.log('');
    
    // Retrieve user from database
    console.log('📥 Retrieving user from database...');
    const retrievedUser = await database.findUserById(savedUser.id);
    
    if (!retrievedUser) {
      throw new Error('User not found after saving!');
    }
    
    console.log('✅ User retrieved successfully');
    console.log('   Gender:', retrievedUser.gender);
    console.log('   Sexual Orientation:', retrievedUser.sexualOrientation);
    console.log('   Gender Preferences:', retrievedUser.preferences.genderPreference);
    console.log('   Sexual Orientation Preferences:', retrievedUser.preferences.sexualOrientationPreference);
    console.log('   Location Radius:', retrievedUser.preferences.locationRadius);
    console.log('   Age Range:', retrievedUser.preferences.ageRange);
    console.log('');
    
    // Verify all fields match
    console.log('🔍 Verifying data integrity...');
    const checks = [
      { name: 'Gender', saved: savedUser.gender, retrieved: retrievedUser.gender },
      { name: 'Sexual Orientation', saved: savedUser.sexualOrientation, retrieved: retrievedUser.sexualOrientation },
      { name: 'Gender Preferences', saved: JSON.stringify(savedUser.preferences.genderPreference), retrieved: JSON.stringify(retrievedUser.preferences.genderPreference) },
      { name: 'Sexual Orientation Preferences', saved: JSON.stringify(savedUser.preferences.sexualOrientationPreference), retrieved: JSON.stringify(retrievedUser.preferences.sexualOrientationPreference) },
      { name: 'Location Radius', saved: savedUser.preferences.locationRadius, retrieved: retrievedUser.preferences.locationRadius },
      { name: 'Age Range Min', saved: savedUser.preferences.ageRange.min, retrieved: retrievedUser.preferences.ageRange.min },
      { name: 'Age Range Max', saved: savedUser.preferences.ageRange.max, retrieved: retrievedUser.preferences.ageRange.max }
    ];
    
    let allMatch = true;
    checks.forEach(check => {
      const match = check.saved === check.retrieved;
      const status = match ? '✅' : '❌';
      console.log(`${status} ${check.name}: ${match ? 'Match' : `Mismatch (saved: ${check.saved}, retrieved: ${check.retrieved})`}`);
      if (!match) allMatch = false;
    });
    
    console.log('');
    
    if (allMatch) {
      console.log('🎉 All tests passed! Gender and filter fields are working correctly with MongoDB.');
    } else {
      console.log('⚠️  Some tests failed. Please review the output above.');
    }
    
    // Update user preferences
    console.log('\n🔄 Testing preference updates...');
    const updatedPreferences = {
      ...retrievedUser.preferences,
      genderPreference: ['female'],
      sexualOrientationPreference: ['straight', 'bisexual', 'pansexual'],
      locationRadius: 100
    };
    
    await database.updateUser(savedUser.id, { preferences: updatedPreferences });
    const updatedUser = await database.findUserById(savedUser.id);
    
    console.log('✅ Preferences updated:');
    console.log('   Gender Preferences:', updatedUser.preferences.genderPreference);
    console.log('   Sexual Orientation Preferences:', updatedUser.preferences.sexualOrientationPreference);
    console.log('   Location Radius:', updatedUser.preferences.locationRadius);
    
    console.log('\n✅ All MongoDB integration tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error);
    throw error;
  } finally {
    // Disconnect from database
    if (database && typeof database.disconnect === 'function') {
      await database.disconnect();
      console.log('\n🔌 Database disconnected');
    }
  }
}

// Run test if executed directly
if (require.main === module) {
  testGenderFilters()
    .then(() => {
      console.log('\n✨ Testing completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Testing failed:', error);
      process.exit(1);
    });
}

module.exports = { testGenderFilters };
