/**
 * Test script to verify seeding creates users with gender and filter fields
 * Usage: DB_TYPE=file node backend/scripts/testSeeding.js
 */

require('dotenv').config();
const { createFakeUser } = require('./seedUsers');
const DatabaseFactory = require('../database/databaseFactory');
const { fallbackGenres, fallbackProviders } = require('../services/fallbackData');

async function testSeeding() {
  let database;
  
  try {
    console.log('🧪 Testing Fake User Generation with Gender and Filters');
    console.log('======================================================\n');
    
    // Connect to database
    console.log('🔌 Connecting to database...');
    database = await DatabaseFactory.createDatabase();
    console.log('✅ Database connected\n');
    
    // Create test users
    console.log('👥 Creating 5 test users...');
    const users = [];
    for (let i = 0; i < 5; i++) {
      const user = await createFakeUser(i, [], [], fallbackGenres, fallbackProviders);
      users.push(user);
      console.log(`  ✓ User ${i + 1}: ${user.username} (${user.gender}, ${user.sexualOrientation})`);
    }
    
    console.log('\n📊 Verifying user data...');
    let allValid = true;
    
    users.forEach((user, index) => {
      console.log(`\nUser ${index + 1}: ${user.username}`);
      
      // Check required fields
      const checks = [
        { name: 'Gender', value: user.gender, valid: user.gender !== undefined },
        { name: 'Sexual Orientation', value: user.sexualOrientation, valid: user.sexualOrientation !== undefined },
        { name: 'Gender Preference', value: user.preferences?.genderPreference, valid: Array.isArray(user.preferences?.genderPreference) && user.preferences.genderPreference.length > 0 },
        { name: 'Sexual Orientation Preference', value: user.preferences?.sexualOrientationPreference, valid: Array.isArray(user.preferences?.sexualOrientationPreference) && user.preferences.sexualOrientationPreference.length > 0 },
        { name: 'Age Range', value: user.preferences?.ageRange, valid: user.preferences?.ageRange?.min !== undefined && user.preferences?.ageRange?.max !== undefined },
        { name: 'Location Radius', value: user.preferences?.locationRadius, valid: user.preferences?.locationRadius !== undefined }
      ];
      
      checks.forEach(check => {
        const status = check.valid ? '✅' : '❌';
        const valueStr = typeof check.value === 'object' ? JSON.stringify(check.value) : check.value;
        console.log(`  ${status} ${check.name}: ${valueStr}`);
        if (!check.valid) allValid = false;
      });
    });
    
    console.log('\n📝 Summary:');
    console.log(`   Total users created: ${users.length}`);
    console.log(`   All fields valid: ${allValid ? 'Yes ✅' : 'No ❌'}`);
    
    if (allValid) {
      console.log('\n🎉 All tests passed! Fake users are generated with correct gender and filter fields.');
    } else {
      console.log('\n⚠️  Some tests failed. Please review the output above.');
    }
    
    // Show examples of different gender/orientation combinations
    console.log('\n🌈 Gender and Orientation Distribution:');
    const genderCount = {};
    const orientationCount = {};
    users.forEach(user => {
      genderCount[user.gender || 'unspecified'] = (genderCount[user.gender || 'unspecified'] || 0) + 1;
      orientationCount[user.sexualOrientation || 'unspecified'] = (orientationCount[user.sexualOrientation || 'unspecified'] || 0) + 1;
    });
    
    console.log('  Genders:', genderCount);
    console.log('  Orientations:', orientationCount);
    
    console.log('\n✅ Seeding test completed successfully!');
    
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
  testSeeding()
    .then(() => {
      console.log('\n✨ Testing completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Testing failed:', error);
      process.exit(1);
    });
}

module.exports = { testSeeding };
