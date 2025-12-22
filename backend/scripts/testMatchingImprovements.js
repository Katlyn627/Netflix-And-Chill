/**
 * Quick test to verify matching improvements
 */
const User = require('../models/User');
const MatchingEngine = require('../utils/matchingEngine');
const { fallbackGenres, fallbackProviders } = require('../services/fallbackData');
const { 
  randomInt, 
  randomItem, 
  generateStreamingServices, 
  generateGenrePreferences 
} = require('../utils/fakeDataGenerator');

// Create test users with minimal data (like a new user might have)
function createMinimalUser(id) {
  // New user with just 1-2 streaming services and 1-2 genres
  const streamingServices = [
    { id: 8, name: 'Netflix', logoPath: '/9A1JSVmSxsyaBK4SUFsYVqbAYfW.jpg' }
  ];
  
  const genres = [
    { id: 28, name: 'Action' },
    { id: 35, name: 'Comedy' }
  ];
  
  return new User({
    id: id,
    username: `minimal_user_${id}`,
    email: `user${id}@test.com`,
    age: 25,
    location: 'Test City',
    streamingServices: streamingServices,
    watchHistory: [],
    preferences: {
      genres: genres,
      bingeWatchCount: 5,
      ageRange: { min: 21, max: 35 }
    },
    favoriteMovies: [],
    favoriteTVShows: []
  });
}

// Create test users with seeded-like data using weighted selection
function createSeededUser(id) {
  const streamingServices = generateStreamingServices(fallbackProviders);
  const genres = generateGenrePreferences(fallbackGenres);
  
  return new User({
    id: id,
    username: `seeded_user_${id}`,
    email: `seeded${id}@test.com`,
    age: randomInt(22, 40),
    location: 'Test City',
    streamingServices: streamingServices,
    watchHistory: [
      {
        title: 'Stranger Things',
        type: 'tvshow',
        service: 'Netflix',
        tmdbId: 66732
      },
      {
        title: 'Breaking Bad',
        type: 'tvshow',
        service: 'Netflix',
        tmdbId: 1396
      }
    ],
    preferences: {
      genres: genres,
      bingeWatchCount: randomInt(3, 10),
      ageRange: { min: 21, max: 35 }
    },
    favoriteMovies: [],
    favoriteTVShows: []
  });
}

// Test matching
console.log('Testing Matching Algorithm Improvements\n');
console.log('========================================\n');

// Test 1: Minimal user vs seeded users
console.log('Test 1: Minimal User vs Seeded Users');
const minimalUser = createMinimalUser('minimal_1');
const seededUsers = [];
for (let i = 0; i < 10; i++) {
  seededUsers.push(createSeededUser(`seeded_${i}`));
}

console.log(`\nMinimal User Profile:`);
console.log(`- Streaming Services: ${minimalUser.streamingServices.map(s => s.name).join(', ')}`);
console.log(`- Genres: ${minimalUser.preferences.genres.map(g => g.name).join(', ')}`);
console.log(`- Watch History: ${minimalUser.watchHistory.length} items`);

console.log(`\n\nFinding matches...`);
const matches = MatchingEngine.findMatches(minimalUser, seededUsers, 10);

console.log(`\nFound ${matches.length} matches!\n`);
matches.forEach((match, index) => {
  const matchedUser = seededUsers.find(u => u.id === match.user2Id);
  console.log(`Match ${index + 1}: ${matchedUser.username}`);
  console.log(`  Score: ${match.matchScore}%`);
  console.log(`  Services: ${matchedUser.streamingServices.map(s => s.name).join(', ')}`);
  console.log(`  Genres: ${matchedUser.preferences.genres.map(g => g.name).join(', ')}`);
  console.log(`  Description: ${match.matchDescription}`);
  console.log('');
});

// Test 2: Check that base score works
console.log('\n========================================');
console.log('Test 2: Base Score Verification\n');
const user1 = new User({
  id: 'test1',
  username: 'test1',
  email: 'test1@test.com',
  age: 25,
  location: 'City A',
  streamingServices: [{ id: 1, name: 'Service A' }],
  watchHistory: [],
  preferences: { genres: [{ id: 1, name: 'Genre A' }], bingeWatchCount: 5 },
  favoriteMovies: []
});

const user2 = new User({
  id: 'test2',
  username: 'test2',
  email: 'test2@test.com',
  age: 26,
  location: 'City B',
  streamingServices: [{ id: 2, name: 'Service B' }],
  watchHistory: [],
  preferences: { genres: [{ id: 2, name: 'Genre B' }], bingeWatchCount: 7 },
  favoriteMovies: []
});

const matchResult = MatchingEngine.calculateMatch(user1, user2);
console.log('Users with NO overlap:');
console.log(`Match Score: ${matchResult.score}%`);
console.log(`Expected: At least 10% (base score)`);
console.log(`Result: ${matchResult.score >= 10 ? '✓ PASS' : '✗ FAIL'}`);

console.log('\n========================================');
console.log('All tests completed!');
