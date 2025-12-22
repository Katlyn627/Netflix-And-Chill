const fs = require('fs');
const User = require('../models/User');
const MatchingEngine = require('../utils/matchingEngine');

// Load users
const users = JSON.parse(fs.readFileSync('./data/users.json', 'utf8'));
console.log(`Loaded ${users.length} users\n`);

// Test first 5 users
users.slice(0, 5).forEach(userData => {
  const testUser = new User(userData);
  const userPool = users
    .filter(u => u.id !== testUser.id)
    .map(u => new User(u));
  
  const matches = MatchingEngine.findMatches(testUser, userPool, 10, {});
  
  console.log(`${testUser.username} (age ${testUser.age}, ${testUser.gender}, ${testUser.sexualOrientation}):`);
  console.log(`  Age pref: ${testUser.preferences.ageRange.min}-${testUser.preferences.ageRange.max}`);
  console.log(`  Gender pref: ${JSON.stringify(testUser.preferences.genderPreference)}`);
  console.log(`  Location: ${testUser.location}, Radius: ${testUser.preferences.locationRadius}`);
  console.log(`  Found ${matches.length} matches`);
  if (matches.length > 0) {
    const scores = matches.map(m => Math.round(m.matchScore)).join(', ');
    console.log(`  Match scores: ${scores}`);
  }
  console.log('');
});
