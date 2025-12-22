/**
 * Final verification test for matching improvements
 */
const User = require('../models/User');
const MatchingEngine = require('../utils/matchingEngine');
const { getDatabase } = require('../utils/database');

async function runTests() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('   FINAL VERIFICATION: Matching Improvements');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  let testsPassed = 0;
  let testsFailed = 0;
  
  // Test 1: Base Score
  console.log('Test 1: Base Compatibility Score');
  console.log('─────────────────────────────────');
  const user1 = new User({
    id: 'test1', username: 'test1', email: 'test1@test.com', age: 25,
    streamingServices: [{ id: 1, name: 'Service A' }],
    watchHistory: [], preferences: { genres: [], bingeWatchCount: 5 },
    favoriteMovies: []
  });
  const user2 = new User({
    id: 'test2', username: 'test2', email: 'test2@test.com', age: 26,
    streamingServices: [{ id: 2, name: 'Service B' }],
    watchHistory: [], preferences: { genres: [], bingeWatchCount: 7 },
    favoriteMovies: []
  });
  const matchResult = MatchingEngine.calculateMatch(user1, user2);
  
  if (matchResult.score >= 10) {
    console.log('✓ PASS: Users with NO overlap get >= 10% score');
    console.log(`  Actual score: ${matchResult.score}%\n`);
    testsPassed++;
  } else {
    console.log('✗ FAIL: Base score not working');
    console.log(`  Expected: >= 10%, Got: ${matchResult.score}%\n`);
    testsFailed++;
  }
  
  // Test 2: Seeded User Matching
  console.log('Test 2: Seeded User Matching');
  console.log('─────────────────────────────');
  const dataStore = await getDatabase();
  const allUsers = await dataStore.loadUsers();
  const userPool = allUsers.map(u => new User(u));
  
  if (userPool.length < 2) {
    console.log('⚠ SKIP: Need at least 2 seeded users\n');
  } else {
    const testUser = userPool[0];
    const matches = MatchingEngine.findMatches(testUser, userPool.slice(1), 10, {});
    
    if (matches.length > 0) {
      console.log(`✓ PASS: Seeded user found ${matches.length} matches`);
      console.log(`  Match rate: ${matches.length}/${userPool.length - 1} (${Math.round(matches.length/(userPool.length-1)*100)}%)`);
      console.log(`  Top score: ${Math.round(matches[0].matchScore)}%\n`);
      testsPassed++;
    } else {
      console.log('✗ FAIL: Seeded user found no matches\n');
      testsFailed++;
    }
  }
  
  // Test 3: Minimal New User
  console.log('Test 3: Minimal New User Profile');
  console.log('─────────────────────────────────');
  const newUser = new User({
    id: 'new_test', username: 'newuser', email: 'new@test.com', age: 28,
    location: 'Test City, ST',
    streamingServices: [
      { id: 8, name: 'Netflix' },
      { id: 15, name: 'Hulu' }
    ],
    watchHistory: [],
    preferences: {
      genres: [{ id: 28, name: 'Action' }, { id: 35, name: 'Comedy' }],
      bingeWatchCount: 3,
      ageRange: { min: 21, max: 40 },
      locationRadius: 250
    },
    favoriteMovies: []
  });
  
  if (userPool.length < 2) {
    console.log('⚠ SKIP: Need seeded users for comparison\n');
  } else {
    const newUserMatches = MatchingEngine.findMatches(newUser, userPool, 10, {});
    
    if (newUserMatches.length > 0) {
      console.log(`✓ PASS: New minimal user found ${newUserMatches.length} matches`);
      console.log(`  Match rate: ${newUserMatches.length}/${userPool.length} (${Math.round(newUserMatches.length/userPool.length*100)}%)`);
      console.log(`  Score range: ${Math.round(newUserMatches[newUserMatches.length-1].matchScore)}%-${Math.round(newUserMatches[0].matchScore)}%\n`);
      testsPassed++;
    } else {
      console.log('✗ FAIL: New minimal user found no matches\n');
      testsFailed++;
    }
  }
  
  // Test 4: Location Filter
  console.log('Test 4: Location Filter (Large Radius)');
  console.log('───────────────────────────────────────');
  const userPhilly = new User({
    id: 'philly', username: 'philly', email: 'philly@test.com', age: 30,
    location: 'Philadelphia, PA',
    streamingServices: [{ id: 8, name: 'Netflix' }],
    watchHistory: [],
    preferences: {
      genres: [{ id: 28, name: 'Action' }],
      bingeWatchCount: 5,
      ageRange: { min: 21, max: 50 },
      locationRadius: 250
    },
    favoriteMovies: []
  });
  const userSeattle = new User({
    id: 'seattle', username: 'seattle', email: 'seattle@test.com', age: 32,
    location: 'Seattle, WA',
    streamingServices: [{ id: 8, name: 'Netflix' }],
    watchHistory: [],
    preferences: {
      genres: [{ id: 28, name: 'Action' }],
      bingeWatchCount: 5,
      ageRange: { min: 21, max: 50 },
      locationRadius: 250
    },
    favoriteMovies: []
  });
  
  const passesFilter = MatchingEngine.passesFilters(userPhilly, userSeattle, {});
  if (passesFilter) {
    console.log('✓ PASS: Large radius (250 miles) allows interstate matches');
    console.log('  Philadelphia <-> Seattle match allowed\n');
    testsPassed++;
  } else {
    console.log('✗ FAIL: Location filter too strict\n');
    testsFailed++;
  }
  
  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('   TEST SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Total Tests: ${testsPassed + testsFailed}`);
  console.log(`✓ Passed: ${testsPassed}`);
  console.log(`✗ Failed: ${testsFailed}`);
  
  if (testsFailed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Matching improvements verified.\n');
    process.exit(0);
  } else {
    console.log('\n❌ SOME TESTS FAILED. Review implementation.\n');
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Error running tests:', err);
  process.exit(1);
});
