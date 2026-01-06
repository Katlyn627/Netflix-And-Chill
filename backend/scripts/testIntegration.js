/**
 * Integration test demonstrating both fixes working together
 * This script:
 * 1. Creates test users
 * 2. Tests login with username and email
 * 3. Generates matches without duplication
 * 4. Verifies both users can see their matches
 */

require('dotenv').config();
const DatabaseFactory = require('../database/databaseFactory');
const User = require('../models/User');
const MatchingEngine = require('../utils/matchingEngine');
const Match = require('../models/Match');

async function integrationTest() {
  let database;
  
  try {
    console.log('🧪 Integration Test: Match Visibility & Login Fixes');
    console.log('===================================================\n');
    
    // Initialize database
    console.log('🔌 Connecting to database...');
    database = await DatabaseFactory.createDatabase();
    console.log('✅ Database connected\n');
    
    // Load existing users
    console.log('👥 Loading users from database...');
    const allUsers = await database.loadUsers();
    
    if (!allUsers || allUsers.length < 2) {
      console.error('❌ Need at least 2 users. Please run npm run seed first.');
      process.exit(1);
    }
    
    console.log(`  ✓ Loaded ${allUsers.length} users\n`);
    
    // Select two test users
    const alice = allUsers[0];
    const bob = allUsers[1];
    
    console.log('📝 Test Users:');
    console.log(`  User 1: ${alice.username} (${alice.email})`);
    console.log(`  User 2: ${bob.username} (${bob.email})\n`);
    
    // ========================================
    // PART 1: Test Login Functionality
    // ========================================
    console.log('═══════════════════════════════════════');
    console.log('PART 1: Testing Login Functionality');
    console.log('═══════════════════════════════════════\n');
    
    // Test 1a: Login with email
    console.log('Test 1a: Login with email');
    let loginUser = await database.findUserByEmail(alice.email);
    if (!loginUser) {
      loginUser = await database.findUserByUsername(alice.email);
    }
    console.log(loginUser 
      ? `  ✅ Login with email '${alice.email}' successful`
      : `  ❌ Login with email '${alice.email}' failed`
    );
    
    // Test 1b: Login with username
    console.log('\nTest 1b: Login with username');
    let loginUser2 = await database.findUserByEmail(alice.username);
    if (!loginUser2) {
      loginUser2 = await database.findUserByUsername(alice.username);
    }
    console.log(loginUser2 
      ? `  ✅ Login with username '${alice.username}' successful`
      : `  ❌ Login with username '${alice.username}' failed`
    );
    
    // Test 1c: Case-insensitive username
    console.log('\nTest 1c: Case-insensitive username login');
    const upperUsername = bob.username.toUpperCase();
    let loginUser3 = await database.findUserByEmail(upperUsername);
    if (!loginUser3) {
      loginUser3 = await database.findUserByUsername(upperUsername);
    }
    console.log(loginUser3 
      ? `  ✅ Login with '${upperUsername}' successful (case-insensitive)`
      : `  ❌ Login with '${upperUsername}' failed`
    );
    
    // ========================================
    // PART 2: Test Match Visibility
    // ========================================
    console.log('\n═══════════════════════════════════════');
    console.log('PART 2: Testing Match Visibility');
    console.log('═══════════════════════════════════════\n');
    
    // Test 2a: Check if match already exists
    console.log('Test 2a: Checking for existing match');
    const matchExists = await database.matchExists(alice.id, bob.id);
    console.log(`  Match between ${alice.username} and ${bob.username}: ${matchExists ? 'EXISTS' : 'NOT FOUND'}`);
    
    // Test 2b: Create match if it doesn't exist
    if (!matchExists) {
      console.log('\nTest 2b: Creating new match');
      const userAlice = new User(alice);
      const userBob = new User(bob);
      const matchResult = MatchingEngine.calculateMatch(userAlice, userBob);
      
      const newMatch = new Match(
        alice.id,
        bob.id,
        matchResult.score,
        matchResult.sharedContent,
        matchResult.matchDescription
      );
      
      await database.addMatch(newMatch);
      console.log(`  ✅ Created match with score: ${matchResult.score}%`);
      console.log(`  📝 Description: ${matchResult.matchDescription}`);
    } else {
      console.log('  ℹ Match already exists, skipping creation');
    }
    
    // Test 2c: Verify both users can see the match
    console.log('\nTest 2c: Verifying bidirectional match visibility');
    const aliceMatches = await database.findMatchesForUser(alice.id);
    const bobMatches = await database.findMatchesForUser(bob.id);
    
    console.log(`  ${alice.username} has ${aliceMatches.length} matches`);
    console.log(`  ${bob.username} has ${bobMatches.length} matches`);
    
    // Find the common match
    const aliceHasMatch = aliceMatches.some(m => 
      (m.user1Id === alice.id && m.user2Id === bob.id) ||
      (m.user1Id === bob.id && m.user2Id === alice.id)
    );
    
    const bobHasMatch = bobMatches.some(m => 
      (m.user1Id === alice.id && m.user2Id === bob.id) ||
      (m.user1Id === bob.id && m.user2Id === alice.id)
    );
    
    if (aliceHasMatch && bobHasMatch) {
      console.log(`  ✅ Both users can see their match!`);
    } else {
      console.log(`  ❌ Match visibility issue:`);
      console.log(`     ${alice.username} can see match: ${aliceHasMatch}`);
      console.log(`     ${bob.username} can see match: ${bobHasMatch}`);
    }
    
    // Test 2d: Verify no duplicate matches
    console.log('\nTest 2d: Checking for duplicate matches');
    const allMatches = await database.loadMatches();
    const matchPairs = new Set();
    let duplicates = 0;
    
    for (const match of allMatches) {
      const pair1 = `${match.user1Id}:${match.user2Id}`;
      const pair2 = `${match.user2Id}:${match.user1Id}`;
      
      if (matchPairs.has(pair1) || matchPairs.has(pair2)) {
        duplicates++;
      }
      matchPairs.add(pair1);
    }
    
    console.log(`  Total matches: ${allMatches.length}`);
    console.log(`  Unique pairs: ${matchPairs.size}`);
    console.log(`  Duplicates: ${duplicates}`);
    console.log(duplicates === 0 
      ? '  ✅ No duplicates found!'
      : `  ❌ Found ${duplicates} duplicate matches`
    );
    
    // ========================================
    // FINAL SUMMARY
    // ========================================
    console.log('\n═══════════════════════════════════════');
    console.log('FINAL SUMMARY');
    console.log('═══════════════════════════════════════\n');
    
    const allTestsPassed = loginUser && loginUser2 && loginUser3 && aliceHasMatch && bobHasMatch && duplicates === 0;
    
    if (allTestsPassed) {
      console.log('🎉 ALL TESTS PASSED! 🎉\n');
      console.log('✅ Users can login with email');
      console.log('✅ Users can login with username');
      console.log('✅ Username login is case-insensitive');
      console.log('✅ Matches are visible from both users\' perspectives');
      console.log('✅ No duplicate matches in the database');
    } else {
      console.log('❌ SOME TESTS FAILED\n');
      console.log(`Login with email: ${loginUser ? '✅' : '❌'}`);
      console.log(`Login with username: ${loginUser2 ? '✅' : '❌'}`);
      console.log(`Case-insensitive username: ${loginUser3 ? '✅' : '❌'}`);
      console.log(`Alice can see match: ${aliceHasMatch ? '✅' : '❌'}`);
      console.log(`Bob can see match: ${bobHasMatch ? '✅' : '❌'}`);
      console.log(`No duplicates: ${duplicates === 0 ? '✅' : '❌'}`);
    }
    
    console.log('\n═══════════════════════════════════════\n');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    throw error;
  } finally {
    // Disconnect from database
    if (database && typeof database.disconnect === 'function') {
      await database.disconnect();
      console.log('🔌 Database disconnected\n');
    }
  }
}

// Run test if executed directly
if (require.main === module) {
  integrationTest()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Integration test failed:', error);
      process.exit(1);
    });
}

module.exports = { integrationTest };
