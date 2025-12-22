const fs = require('fs');
const User = require('../models/User');
const MatchingEngine = require('../utils/matchingEngine');

// Load users
const users = JSON.parse(fs.readFileSync('./data/users.json', 'utf8'));

// Test with first user
const testUser = new User(users[0]);
console.log(`Test User: ${testUser.username}`);
console.log(`- Age: ${testUser.age}`);
console.log(`- Gender: ${testUser.gender}`);
console.log(`- Orientation: ${testUser.sexualOrientation}`);
console.log(`- Age pref: ${testUser.preferences.ageRange.min}-${testUser.preferences.ageRange.max}`);
console.log(`- Gender pref: ${JSON.stringify(testUser.preferences.genderPreference)}`);
console.log(`- Orientation pref: ${JSON.stringify(testUser.preferences.sexualOrientationPreference)}`);
console.log(`- Location: ${testUser.location}`);
console.log(`- Location radius: ${testUser.preferences.locationRadius}`);

console.log('\n--- Testing Each User ---\n');
users.slice(1, 21).forEach(u => {
  const otherUser = new User(u);
  console.log(`${otherUser.username}:`);
  console.log(`  Age: ${otherUser.age}, Gender: ${otherUser.gender}, Orient: ${otherUser.sexualOrientation}`);
  console.log(`  Location: ${otherUser.location}`);
  
  // Test each filter manually
  const agePass = otherUser.age >= testUser.preferences.ageRange.min && otherUser.age <= testUser.preferences.ageRange.max;
  console.log(`  Age filter: ${agePass ? 'PASS' : 'FAIL'}`);
  
  const genderPass = !testUser.preferences.genderPreference || testUser.preferences.genderPreference.length === 0 || testUser.preferences.genderPreference.includes('any') || testUser.preferences.genderPreference.includes(otherUser.gender);
  console.log(`  Gender filter: ${genderPass ? 'PASS' : 'FAIL'}`);
  
  const orientPass = !testUser.preferences.sexualOrientationPreference || testUser.preferences.sexualOrientationPreference.length === 0 || testUser.preferences.sexualOrientationPreference.includes('any') || testUser.preferences.sexualOrientationPreference.includes(otherUser.sexualOrientation);
  console.log(`  Orientation filter: ${orientPass ? 'PASS' : 'FAIL'}`);
  
  // Test actual filter
  try {
    const actualPass = MatchingEngine.passesFilters(testUser, otherUser, {});
    console.log(`  Overall: ${actualPass ? 'PASS' : 'FAIL'}`);
  } catch (err) {
    console.log(`  Overall: ERROR - ${err.message}`);
  }
  console.log('');
});
