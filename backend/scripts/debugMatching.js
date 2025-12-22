const fs = require('fs');
const User = require('../models/User');
const MatchingEngine = require('../utils/matchingEngine');

// Load users
const users = JSON.parse(fs.readFileSync('./data/users.json', 'utf8'));
console.log(`Loaded ${users.length} users\n`);

// Test with first user
const testUser = new User(users[0]);
console.log(`Test User: ${testUser.username}`);
console.log(`- ID: ${testUser.id}`);
console.log(`- Services: ${testUser.streamingServices.map(s => s.name).join(', ')}`);
console.log(`- Genres: ${testUser.preferences.genres.map(g => g.name).join(', ')}`);
console.log(`- Age: ${testUser.age}`);
console.log(`- Age range pref: ${testUser.preferences.ageRange ? `${testUser.preferences.ageRange.min}-${testUser.preferences.ageRange.max}` : 'none'}`);

// Create user pool (exclude self)
const userPool = users
  .filter(u => u.id !== testUser.id)
  .map(u => new User(u));

console.log(`\nUser pool size: ${userPool.length}`);

// Test filters
console.log('\n--- Testing Filters ---');
userPool.slice(0, 3).forEach(otherUser => {
  const passes = MatchingEngine.passesFilters(testUser, otherUser, {});
  console.log(`${otherUser.username} (age ${otherUser.age}): ${passes ? 'PASS' : 'FAIL'}`);
});

console.log('\n--- Finding Matches ---\n');
const matches = MatchingEngine.findMatches(testUser, userPool, 5, {});

console.log(`Found ${matches.length} matches\n`);
matches.forEach((match, idx) => {
  const matchedUser = userPool.find(u => u.id === match.user2Id);
  console.log(`${idx + 1}. ${matchedUser.username}: ${Math.round(match.matchScore)}%`);
  console.log(`   Services: ${matchedUser.streamingServices.map(s => s.name).join(', ')}`);
  console.log(`   Description: ${match.matchDescription}`);
});
