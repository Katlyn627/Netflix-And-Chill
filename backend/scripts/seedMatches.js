/**
 * Match Database Seeder
 * Pre-generates matches between seeded users for testing
 * 
 * Usage:
 *   node backend/scripts/seedMatches.js
 *   DB_TYPE=mongodb node backend/scripts/seedMatches.js
 *   node backend/scripts/seedMatches.js --matches-per-user=5
 */

require('dotenv').config();
const DatabaseFactory = require('../database/databaseFactory');
const User = require('../models/User');
const MatchingEngine = require('../utils/matchingEngine');

// Configuration
const DEFAULT_MATCHES_PER_USER = 10;

/**
 * Generate matches for a specific user
 */
async function generateMatchesForUser(userId, allUsers, matchesPerUser, database) {
  const user = allUsers.find(u => u.id === userId);
  if (!user) {
    console.warn(`User ${userId} not found`);
    return [];
  }

  const currentUser = new User(user);
  const userObjects = allUsers
    .filter(u => u.id !== userId) // Exclude self
    .map(u => new User(u));

  // Generate matches using the matching engine with very permissive filters
  // This ensures we get matches even with small test datasets
  const filters = { 
    minMatchScore: 0, // Accept all matches regardless of score
    ageRange: { min: 18, max: 100 }, // Override age restrictions for testing
    locationRadius: 10000, // Global matching for testing
    genderPreference: ['any'], // Accept all genders
    sexualOrientationPreference: ['any'] // Accept all orientations
  };
  const matches = MatchingEngine.findMatches(currentUser, userObjects, matchesPerUser, filters);

  // Save matches to database, checking for duplicates
  const savedMatches = [];
  for (const match of matches) {
    // Check if match already exists (in either direction)
    const exists = await database.matchExists(match.user1Id, match.user2Id);
    if (!exists) {
      await database.addMatch(match);
      savedMatches.push(match);
    }
  }

  return savedMatches;
}

/**
 * Main seeder function
 */
async function seedMatches(matchesPerUser = DEFAULT_MATCHES_PER_USER) {
  let database;
  
  try {
    console.log('🎬 Netflix and Chill Match Seeder');
    console.log('================================\n');
    
    // Parse command line arguments
    const args = process.argv.slice(2);
    const matchesArg = args.find(arg => arg.startsWith('--matches-per-user='));
    if (matchesArg) {
      const matchesValue = matchesArg.split('=')[1];
      if (!matchesValue || matchesValue.trim() === '') {
        console.error('❌ Invalid matches-per-user value. Please provide a value like: --matches-per-user=5');
        process.exit(1);
      }
      const parsedMatches = parseInt(matchesValue, 10);
      if (isNaN(parsedMatches) || parsedMatches < 1) {
        console.error('❌ Invalid matches-per-user value. Please provide a positive integer.');
        process.exit(1);
      }
      matchesPerUser = parsedMatches;
    }
    
    console.log(`📊 Generating up to ${matchesPerUser} matches per user...\n`);
    
    // Initialize database
    console.log('🔌 Connecting to database...');
    database = await DatabaseFactory.createDatabase();
    console.log('✅ Database connected\n');
    
    // Load all users
    console.log('👥 Loading users from database...');
    const allUsers = await database.loadUsers();
    
    if (!allUsers || allUsers.length === 0) {
      console.error('❌ No users found in database. Please run the user seeder first:');
      console.error('   npm run seed');
      process.exit(1);
    }
    
    console.log(`  ✓ Loaded ${allUsers.length} users\n`);
    
    // Generate matches for each user
    console.log('💕 Generating matches...');
    let totalMatches = 0;
    const matchesPerUserMap = new Map();
    
    for (let i = 0; i < allUsers.length; i++) {
      const user = allUsers[i];
      const matches = await generateMatchesForUser(user.id, allUsers, matchesPerUser, database);
      matchesPerUserMap.set(user.id, matches.length);
      totalMatches += matches.length;
      
      // Show progress
      if ((i + 1) % 10 === 0 || i === allUsers.length - 1) {
        console.log(`  Generated matches for ${i + 1}/${allUsers.length} users...`);
      }
    }
    
    console.log('\n✅ Successfully generated all matches!');
    
    // Statistics
    const avgMatches = totalMatches / allUsers.length;
    const maxMatches = Math.max(...Array.from(matchesPerUserMap.values()));
    const minMatches = Math.min(...Array.from(matchesPerUserMap.values()));
    
    console.log(`\n📝 Summary:`);
    console.log(`   - Total users: ${allUsers.length}`);
    console.log(`   - Total match pairs: ${totalMatches}`);
    console.log(`   - Average matches per user: ${avgMatches.toFixed(1)}`);
    console.log(`   - Max matches for a user: ${maxMatches}`);
    console.log(`   - Min matches for a user: ${minMatches}`);
    console.log(`   - Database type: ${process.env.DB_TYPE || 'file'}`);
    console.log(`\n💡 Users now have pre-generated matches that will show on the matches page!`);
    
  } catch (error) {
    console.error('\n❌ Error seeding matches:', error);
    throw error;
  } finally {
    // Disconnect from database
    if (database && typeof database.disconnect === 'function') {
      await database.disconnect();
      console.log('\n🔌 Database disconnected');
    }
  }
}

// Run seeder if executed directly
if (require.main === module) {
  seedMatches()
    .then(() => {
      console.log('\n🎉 Match seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Match seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedMatches };
