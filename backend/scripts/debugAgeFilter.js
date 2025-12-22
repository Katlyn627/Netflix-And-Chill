const fs = require('fs');
const User = require('../models/User');
const MatchingEngine = require('../utils/matchingEngine');

// Load users
const users = JSON.parse(fs.readFileSync('./data/users.json', 'utf8'));

// Test with first user
const testUser = new User(users[0]);
console.log(`Test User: ${testUser.username}`);
console.log(`- Age: ${testUser.age}`);
console.log(`- Age range pref: ${JSON.stringify(testUser.preferences.ageRange)}`);

console.log('\nChecking other users:');
users.slice(1, 6).forEach(u => {
  const otherUser = new User(u);
  console.log(`\n${otherUser.username}:`);
  console.log(`  Age: ${otherUser.age}`);
  console.log(`  Age range pref: ${JSON.stringify(otherUser.preferences.ageRange)}`);
  
  // Test filter
  const min = testUser.preferences.ageRange.min;
  const max = testUser.preferences.ageRange.max;
  const passes = otherUser.age >= min && otherUser.age <= max;
  console.log(`  Passes test user's age filter (${min}-${max}): ${passes ? 'YES' : 'NO'}`);
  
  // Reverse test
  const revMin = otherUser.preferences.ageRange.min;
  const revMax = otherUser.preferences.ageRange.max;
  const revPasses = testUser.age >= revMin && testUser.age <= revMax;
  console.log(`  Test user passes their age filter (${revMin}-${revMax}): ${revPasses ? 'YES' : 'NO'}`);
});
