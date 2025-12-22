/**
 * Test matching for a new user with minimal profile data
 */
const User = require('../models/User');
const { getDatabase } = require('../utils/database');
const MatchingEngine = require('../utils/matchingEngine');

async function testNewUserMatching() {
  try {
    console.log('Testing New User Matching\n');
    console.log('========================================\n');
    
    // Create a minimal new user profile (like someone who just signed up)
    const newUser = new User({
      id: 'new_test_user',
      username: 'newuser',
      email: 'newuser@test.com',
      age: 28,
      location: 'New York, NY',
      streamingServices: [
        { id: 8, name: 'Netflix', logoPath: '/9A1JSVmSxsyaBK4SUFsYVqbAYfW.jpg' },
        { id: 15, name: 'Hulu', logoPath: '/zxrVdFjIjLqkfnwyghnfywTn3Lh.jpg' }
      ],
      watchHistory: [],
      preferences: {
        genres: [
          { id: 28, name: 'Action' },
          { id: 35, name: 'Comedy' }
        ],
        bingeWatchCount: 3,
        ageRange: { min: 21, max: 40 },
        locationRadius: 250,
        genderPreference: ['any'],
        sexualOrientationPreference: ['any']
      },
      favoriteMovies: [],
      favoriteTVShows: []
    });
    
    console.log('New User Profile:');
    console.log(`- Username: ${newUser.username}`);
    console.log(`- Age: ${newUser.age}`);
    console.log(`- Location: ${newUser.location}`);
    console.log(`- Services: ${newUser.streamingServices.map(s => s.name).join(', ')}`);
    console.log(`- Genres: ${newUser.preferences.genres.map(g => g.name).join(', ')}`);
    console.log(`- Watch History: ${newUser.watchHistory.length} items`);
    console.log(`- Favorite Movies: ${newUser.favoriteMovies.length} items`);
    
    // Load seeded users
    const dataStore = await getDatabase();
    const allUsers = await dataStore.loadUsers();
    const userPool = allUsers.map(u => new User(u));
    
    console.log(`\nSeeded User Pool: ${userPool.length} users\n`);
    console.log('Finding matches...\n');
    
    // Find matches
    const matches = MatchingEngine.findMatches(newUser, userPool, 10, {});
    
    console.log(`Found ${matches.length} matches!\n`);
    
    if (matches.length === 0) {
      console.log('❌ ISSUE: New user found no matches');
      console.log('This means the matching improvements may not be working correctly\n');
      process.exit(1);
    }
    
    matches.forEach((match, index) => {
      const matchedUser = userPool.find(u => u.id === match.user2Id);
      console.log(`Match ${index + 1}: ${matchedUser.username}`);
      console.log(`  Score: ${Math.round(match.matchScore)}%`);
      console.log(`  Services: ${matchedUser.streamingServices.map(s => s.name).join(', ')}`);
      console.log(`  Genres: ${matchedUser.preferences.genres.map(g => g.name).join(', ')}`);
      console.log(`  Description: ${match.matchDescription}`);
      console.log('');
    });
    
    console.log('========================================');
    console.log('✓ SUCCESS: New user with minimal profile found matches!');
    console.log(`Match rate: ${matches.length}/${userPool.length} users (${Math.round(matches.length/userPool.length*100)}%)`);
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testNewUserMatching();
