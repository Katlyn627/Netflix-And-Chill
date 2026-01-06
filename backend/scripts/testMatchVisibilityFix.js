/**
 * Test script to verify match visibility fix
 * This script tests that:
 * 1. Matches are not duplicated when seeding
 * 2. Both users can see the same match on their profiles
 */

require('dotenv').config();
const DatabaseFactory = require('../database/databaseFactory');
const User = require('../models/User');
const MatchingEngine = require('../utils/matchingEngine');

async function testMatchVisibilityFix() {
  let database;
  
  try {
    console.log('🧪 Testing Match Visibility Fix');
    console.log('================================\n');
    
    // Initialize database
    console.log('🔌 Connecting to database...');
    database = await DatabaseFactory.createDatabase();
    console.log('✅ Database connected\n');
    
    // Load users
    console.log('👥 Loading users from database...');
    const allUsers = await database.loadUsers();
    
    if (!allUsers || allUsers.length < 2) {
      console.error('❌ Need at least 2 users to test matches. Please run npm run seed first.');
      process.exit(1);
    }
    
    console.log(`  ✓ Loaded ${allUsers.length} users\n`);
    
    // Test 1: Check matchExists function
    console.log('🧪 Test 1: Testing matchExists function');
    const user1 = allUsers[0];
    const user2 = allUsers[1];
    
    const existsBefore = await database.matchExists(user1.id, user2.id);
    console.log(`  Match between ${user1.username} and ${user2.username} exists: ${existsBefore}`);
    
    // Test 2: Create a new match and verify it's not duplicated
    console.log('\n🧪 Test 2: Testing match creation and deduplication');
    const currentUser = new User(user1);
    const otherUser = new User(user2);
    
    const matchResult = MatchingEngine.calculateMatch(currentUser, otherUser);
    console.log(`  Match score: ${matchResult.score}%`);
    
    const Match = require('../models/Match');
    const testMatch = new Match(
      user1.id,
      user2.id,
      matchResult.score,
      matchResult.sharedContent,
      matchResult.matchDescription
    );
    
    // Try to add match
    const existsCheck = await database.matchExists(user1.id, user2.id);
    if (!existsCheck) {
      await database.addMatch(testMatch);
      console.log(`  ✓ Created match between ${user1.username} and ${user2.username}`);
    } else {
      console.log(`  ℹ Match already exists between ${user1.username} and ${user2.username}`);
    }
    
    // Try to add the reverse (should be caught by matchExists)
    const reverseExists = await database.matchExists(user2.id, user1.id);
    console.log(`  Reverse check (user2->user1): ${reverseExists}`);
    
    if (reverseExists) {
      console.log('  ✓ Correctly detected that reverse match exists');
    } else {
      console.log('  ❌ Failed to detect reverse match');
    }
    
    // Test 3: Verify both users can see the match
    console.log('\n🧪 Test 3: Testing match visibility from both perspectives');
    const user1Matches = await database.findMatchesForUser(user1.id);
    const user2Matches = await database.findMatchesForUser(user2.id);
    
    console.log(`  Matches for ${user1.username}: ${user1Matches.length}`);
    console.log(`  Matches for ${user2.username}: ${user2Matches.length}`);
    
    // Check if both users can see a common match
    const commonMatch = user1Matches.find(m => 
      (m.user1Id === user1.id && m.user2Id === user2.id) ||
      (m.user1Id === user2.id && m.user2Id === user1.id)
    );
    
    const reverseMatch = user2Matches.find(m => 
      (m.user1Id === user1.id && m.user2Id === user2.id) ||
      (m.user1Id === user2.id && m.user2Id === user1.id)
    );
    
    if (commonMatch && reverseMatch && commonMatch.id === reverseMatch.id) {
      console.log(`  ✓ Both users can see the same match (ID: ${commonMatch.id})`);
    } else {
      console.log('  ❌ Users cannot see the same match');
    }
    
    // Test 4: Count total unique matches
    console.log('\n🧪 Test 4: Checking for duplicate matches');
    const allMatches = await database.loadMatches();
    const matchPairs = new Set();
    let duplicates = 0;
    
    for (const match of allMatches) {
      const pair1 = `${match.user1Id}:${match.user2Id}`;
      const pair2 = `${match.user2Id}:${match.user1Id}`;
      
      if (matchPairs.has(pair1) || matchPairs.has(pair2)) {
        duplicates++;
        console.log(`  ⚠ Duplicate found: ${match.user1Id} <-> ${match.user2Id}`);
      }
      
      matchPairs.add(pair1);
    }
    
    if (duplicates === 0) {
      console.log(`  ✓ No duplicate matches found in ${allMatches.length} total matches`);
    } else {
      console.log(`  ❌ Found ${duplicates} duplicate matches`);
    }
    
    console.log('\n✅ All tests completed!');
    console.log('\n📝 Summary:');
    console.log(`   - Total users: ${allUsers.length}`);
    console.log(`   - Total matches: ${allMatches.length}`);
    console.log(`   - Unique match pairs: ${matchPairs.size}`);
    console.log(`   - Duplicates: ${duplicates}`);
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
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
  testMatchVisibilityFix()
    .then(() => {
      console.log('\n🎉 Testing completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Testing failed:', error);
      process.exit(1);
    });
}

module.exports = { testMatchVisibilityFix };
