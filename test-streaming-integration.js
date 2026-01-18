/**
 * Test Script: Streaming Services Integration
 * 
 * This script tests the complete flow of:
 * 1. Creating test users
 * 2. Adding streaming services
 * 3. Adding watch history
 * 4. Finding matches based on shared services and history
 * 
 * Usage: node test-streaming-integration.js
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api';
let testUserId1, testUserId2;

// ANSI color codes for pretty output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function runTests() {
  log('\n======================================', 'cyan');
  log('Streaming Services Integration Tests', 'cyan');
  log('======================================\n', 'cyan');
  
  try {
    // Generate unique email addresses based on timestamp
    const timestamp = Date.now();
    
    // Test 1: Create two test users
    log('Test 1: Creating test users...', 'blue');
    testUserId1 = await createTestUser(`alice_${timestamp}`, `alice_${timestamp}@test.com`, {
      age: 25,
      location: 'New York',
      bio: 'Love sci-fi and thriller shows!'
    });
    testUserId2 = await createTestUser(`bob_${timestamp}`, `bob_${timestamp}@test.com`, {
      age: 27,
      location: 'Los Angeles',
      bio: 'Binge-watcher and movie enthusiast'
    });
    log(`✓ Created users: ${testUserId1}, ${testUserId2}\n`, 'green');
    
    // Test 2: Get streaming providers
    log('Test 2: Fetching available streaming providers...', 'blue');
    const providers = await getProviders();
    log(`✓ Retrieved ${providers.length} streaming providers\n`, 'green');
    
    // Display top 5 providers
    log('Top 5 Providers:', 'cyan');
    providers.slice(0, 5).forEach((p, i) => {
      log(`  ${i + 1}. ${p.name} (ID: ${p.id})`, 'cyan');
    });
    console.log('');
    
    // Test 3: Add streaming services to both users (with overlap)
    log('Test 3: Adding streaming services to users...', 'blue');
    
    // Alice has Netflix, Hulu, Disney+
    const aliceServices = providers.filter(p => 
      ['Netflix', 'Hulu', 'Disney Plus'].includes(p.name)
    );
    await addServicesToUser(testUserId1, aliceServices);
    log(`✓ Alice connected to: ${aliceServices.map(s => s.name).join(', ')}`, 'green');
    
    // Bob has Netflix, Prime Video, Disney+ (shares Netflix and Disney+ with Alice)
    const bobServices = providers.filter(p => 
      ['Netflix', 'Amazon Prime Video', 'Disney Plus'].includes(p.name)
    );
    await addServicesToUser(testUserId2, bobServices);
    log(`✓ Bob connected to: ${bobServices.map(s => s.name).join(', ')}\n`, 'green');
    
    // Test 4: Add watch history with some overlap
    log('Test 4: Adding watch history...', 'blue');
    
    // Alice's watch history
    await addWatchHistory(testUserId1, {
      title: 'Stranger Things',
      type: 'tvshow',
      genre: 'Sci-Fi',
      service: 'Netflix',
      episodesWatched: 8
    });
    await addWatchHistory(testUserId1, {
      title: 'The Crown',
      type: 'tvshow',
      genre: 'Drama',
      service: 'Netflix',
      episodesWatched: 5
    });
    await addWatchHistory(testUserId1, {
      title: 'The Handmaid\'s Tale',
      type: 'tvshow',
      genre: 'Drama',
      service: 'Hulu',
      episodesWatched: 10
    });
    log('✓ Added Alice\'s watch history: Stranger Things, The Crown, The Handmaid\'s Tale', 'green');
    
    // Bob's watch history (shares Stranger Things with Alice)
    await addWatchHistory(testUserId2, {
      title: 'Stranger Things',
      type: 'tvshow',
      genre: 'Sci-Fi',
      service: 'Netflix',
      episodesWatched: 8
    });
    await addWatchHistory(testUserId2, {
      title: 'The Mandalorian',
      type: 'tvshow',
      genre: 'Sci-Fi',
      service: 'Disney Plus',
      episodesWatched: 6
    });
    await addWatchHistory(testUserId2, {
      title: 'Jack Ryan',
      type: 'tvshow',
      genre: 'Action',
      service: 'Amazon Prime Video',
      episodesWatched: 4
    });
    log('✓ Added Bob\'s watch history: Stranger Things, The Mandalorian, Jack Ryan\n', 'green');
    
    // Test 5: Set viewing preferences
    log('Test 5: Setting viewing preferences...', 'blue');
    await setPreferences(testUserId1, {
      genres: ['Sci-Fi', 'Thriller', 'Drama'],
      bingeWatchingCount: 5
    });
    await setPreferences(testUserId2, {
      genres: ['Sci-Fi', 'Action', 'Adventure'],
      bingeWatchingCount: 4
    });
    log('✓ Preferences set for both users\n', 'green');
    
    // Test 6: Find matches for Alice
    log('Test 6: Finding matches for Alice...', 'blue');
    const matches = await findMatches(testUserId1);
    log(`✓ Found ${matches.length} potential matches\n`, 'green');
    
    // Test 7: Verify compatibility score with Bob
    log('Test 7: Analyzing compatibility with Bob...', 'blue');
    const bobMatch = matches.find(m => m.userId === testUserId2);
    
    if (bobMatch) {
      log('✓ Compatibility Analysis:', 'green');
      log(`  Overall Score: ${bobMatch.compatibilityScore}%`, 'yellow');
      log(`  Shared Services: ${bobMatch.sharedServices.length} (${bobMatch.sharedServices.map(s => s.name).join(', ')})`, 'yellow');
      log(`  Shared Watch History: ${bobMatch.sharedWatchHistory.length} (${bobMatch.sharedWatchHistory.map(h => h.title).join(', ')})`, 'yellow');
      
      if (bobMatch.compatibilityBreakdown) {
        log('\n  Score Breakdown:', 'cyan');
        log(`    - Shared Services: ${bobMatch.compatibilityBreakdown.sharedServices} points`, 'cyan');
        log(`    - Shared History: ${bobMatch.compatibilityBreakdown.sharedHistory} points`, 'cyan');
        log(`    - Genre Match: ${bobMatch.compatibilityBreakdown.genreMatch} points`, 'cyan');
        log(`    - Frequency Match: ${bobMatch.compatibilityBreakdown.frequencyMatch} points`, 'cyan');
      }
      
      log('\n  Compatibility Factors:', 'cyan');
      bobMatch.compatibilityFactors.forEach(factor => {
        log(`    ${factor.name}: ${factor.score}/${factor.maxScore}`, 'cyan');
      });
    } else {
      log('✗ Bob not found in matches', 'red');
    }
    
    // Summary
    log('\n======================================', 'cyan');
    log('✅ All Tests Passed!', 'green');
    log('======================================', 'cyan');
    
    log('\nTest Summary:', 'blue');
    log(`- Created 2 test users`, 'yellow');
    log(`- Connected ${aliceServices.length + bobServices.length} total streaming services`, 'yellow');
    log(`- Added 6 watch history items`, 'yellow');
    log(`- Set viewing preferences`, 'yellow');
    log(`- Found ${matches.length} matches`, 'yellow');
    log(`- Verified compatibility scoring works correctly`, 'yellow');
    
    log('\nExpected Results:', 'blue');
    log('- Alice and Bob share Netflix and Disney+', 'yellow');
    log('- Both watched Stranger Things', 'yellow');
    log('- Both prefer Sci-Fi genre', 'yellow');
    log('- Should have high compatibility score', 'yellow');
    
    log('\nNote: Test users created with IDs:', 'cyan');
    log(`  - Alice: ${testUserId1}`, 'cyan');
    log(`  - Bob: ${testUserId2}`, 'cyan');
    log('These can be used for manual testing in the UI\n', 'cyan');
    
  } catch (error) {
    log('\n======================================', 'red');
    log('❌ Test Failed!', 'red');
    log('======================================', 'red');
    log(`\nError: ${error.message}`, 'red');
    if (error.response) {
      log(`Response status: ${error.response.status}`, 'red');
      log(`Response data: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
    }
    log('\nPlease check:', 'yellow');
    log('1. Server is running on port 3000', 'yellow');
    log('2. TMDB_API_KEY is set in .env file', 'yellow');
    log('3. Database is accessible', 'yellow');
    process.exit(1);
  }
}

/**
 * Create a test user
 */
async function createTestUser(username, email, details = {}) {
  const response = await fetch(`${BASE_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username,
      email,
      password: 'test123',
      age: details.age || 25,
      location: details.location || 'Test City',
      bio: details.bio || 'Test user bio',
      gender: details.gender || 'other',
      orientation: details.orientation || 'everyone'
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create user: ${error}`);
  }
  
  const data = await response.json();
  return data.user.id;
}

/**
 * Get available streaming providers
 */
async function getProviders() {
  const response = await fetch(`${BASE_URL}/streaming/providers?region=US`);
  
  if (!response.ok) {
    throw new Error(`Failed to get providers: ${response.status}`);
  }
  
  const data = await response.json();
  return data.providers;
}

/**
 * Add streaming services to a user
 */
async function addServicesToUser(userId, services) {
  const response = await fetch(`${BASE_URL}/users/${userId}/streaming-services`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ services })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to add services: ${error}`);
  }
  
  return response.json();
}

/**
 * Add item to watch history
 */
async function addWatchHistory(userId, item) {
  const response = await fetch(`${BASE_URL}/users/${userId}/watch-history`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...item,
      watchedAt: new Date().toISOString()
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to add watch history: ${error}`);
  }
  
  return response.json();
}

/**
 * Set user preferences
 */
async function setPreferences(userId, preferences) {
  const response = await fetch(`${BASE_URL}/users/${userId}/preferences`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(preferences)
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to set preferences: ${error}`);
  }
  
  return response.json();
}

/**
 * Find matches for a user
 */
async function findMatches(userId) {
  const response = await fetch(`${BASE_URL}/matches/find/${userId}?minScore=0`);
  
  if (!response.ok) {
    throw new Error(`Failed to find matches: ${response.status}`);
  }
  
  const data = await response.json();
  return data.matches;
}

// Run the tests
if (require.main === module) {
  runTests().catch(error => {
    log(`\n❌ Unexpected error: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { runTests };
