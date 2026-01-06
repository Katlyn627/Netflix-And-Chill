/**
 * Verification script for seeded matches visibility
 * This script comprehensively tests that seeded matches appear on both users' profiles
 * 
 * Usage:
 *   node backend/scripts/verifySeededMatches.js
 *   DB_TYPE=mongodb node backend/scripts/verifySeededMatches.js
 */

require('dotenv').config();
const DatabaseFactory = require('../database/databaseFactory');

async function verifySeededMatches() {
  let database;
  
  try {
    console.log('🔍 Verifying Seeded Matches Visibility');
    console.log('=====================================\n');
    
    // Initialize database
    console.log('🔌 Connecting to database...');
    database = await DatabaseFactory.createDatabase();
    console.log('✅ Database connected\n');
    
    // Load all users and matches
    console.log('📊 Loading data from database...');
    const allUsers = await database.loadUsers();
    const allMatches = await database.loadMatches ? await database.loadMatches() : 
                       await database.db.collection('matches').find({}).toArray();
    
    if (!allUsers || allUsers.length === 0) {
      console.error('❌ No users found in database.');
      console.error('   Please run the user seeder first: npm run seed');
      process.exit(1);
    }
    
    if (!allMatches || allMatches.length === 0) {
      console.error('❌ No matches found in database.');
      console.error('   Please run the match seeder: npm run seed:matches');
      process.exit(1);
    }
    
    console.log(`  ✓ Loaded ${allUsers.length} users`);
    console.log(`  ✓ Loaded ${allMatches.length} matches\n`);
    
    // Test 1: Verify all matches are bidirectional
    console.log('🧪 Test 1: Bidirectional Visibility');
    console.log('─'.repeat(50));
    
    let bidirectionalIssues = 0;
    const checkedPairs = new Set();
    
    for (const match of allMatches) {
      const pair = [match.user1Id, match.user2Id].sort().join(':');
      if (checkedPairs.has(pair)) continue;
      checkedPairs.add(pair);
      
      // Check if user1 can see this match
      const user1Matches = await database.findMatchesForUser(match.user1Id);
      const visibleToUser1 = user1Matches.some(m => m.id === match.id);
      
      // Check if user2 can see this match
      const user2Matches = await database.findMatchesForUser(match.user2Id);
      const visibleToUser2 = user2Matches.some(m => m.id === match.id);
      
      if (!visibleToUser1 || !visibleToUser2) {
        bidirectionalIssues++;
        console.log(`  ❌ Match ${match.id}:`);
        console.log(`     - Visible to user1 (${match.user1Id}): ${visibleToUser1}`);
        console.log(`     - Visible to user2 (${match.user2Id}): ${visibleToUser2}`);
      }
    }
    
    if (bidirectionalIssues === 0) {
      console.log(`  ✅ All ${allMatches.length} matches are visible to BOTH users`);
    } else {
      console.log(`  ❌ Found ${bidirectionalIssues} matches with visibility issues`);
    }
    console.log();
    
    // Test 2: Check for users with no matches
    console.log('🧪 Test 2: Users With No Matches');
    console.log('─'.repeat(50));
    
    const usersWithNoMatches = [];
    const matchCounts = [];
    
    for (const user of allUsers) {
      const userMatches = await database.findMatchesForUser(user.id);
      matchCounts.push(userMatches.length);
      
      if (userMatches.length === 0) {
        usersWithNoMatches.push(user);
      }
    }
    
    if (usersWithNoMatches.length > 0) {
      console.log(`  ❌ Found ${usersWithNoMatches.length} users with NO matches:`);
      usersWithNoMatches.slice(0, 5).forEach(u => {
        console.log(`     - ${u.username} (${u.id})`);
      });
      if (usersWithNoMatches.length > 5) {
        console.log(`     ... and ${usersWithNoMatches.length - 5} more`);
      }
    } else {
      console.log(`  ✅ All ${allUsers.length} users have at least one match`);
    }
    console.log();
    
    // Test 3: Check for duplicate matches
    console.log('🧪 Test 3: Duplicate Matches');
    console.log('─'.repeat(50));
    
    const matchPairs = new Set();
    const duplicates = [];
    
    for (const match of allMatches) {
      const pair = [match.user1Id, match.user2Id].sort().join(':');
      if (matchPairs.has(pair)) {
        duplicates.push(match);
      } else {
        matchPairs.add(pair);
      }
    }
    
    if (duplicates.length > 0) {
      console.log(`  ❌ Found ${duplicates.length} duplicate matches:`);
      duplicates.slice(0, 5).forEach(m => {
        console.log(`     - ${m.user1Id} ↔ ${m.user2Id}`);
      });
    } else {
      console.log(`  ✅ No duplicate matches found (${allMatches.length} unique pairs)`);
    }
    console.log();
    
    // Test 4: Sample verification with actual users
    console.log('🧪 Test 4: Sample User Verification');
    console.log('─'.repeat(50));
    
    // Test with first two users
    if (allUsers.length >= 2) {
      const user1 = allUsers[0];
      const user2 = allUsers[1];
      
      console.log(`Testing with:`);
      console.log(`  User 1: ${user1.username} (${user1.id})`);
      console.log(`  User 2: ${user2.username} (${user2.id})`);
      console.log();
      
      const user1Matches = await database.findMatchesForUser(user1.id);
      const user2Matches = await database.findMatchesForUser(user2.id);
      
      console.log(`  User 1 has ${user1Matches.length} matches`);
      console.log(`  User 2 has ${user2Matches.length} matches`);
      
      // Check if they match each other
      const mutualMatch = allMatches.find(m => 
        (m.user1Id === user1.id && m.user2Id === user2.id) ||
        (m.user1Id === user2.id && m.user2Id === user1.id)
      );
      
      if (mutualMatch) {
        const inUser1List = user1Matches.some(m => m.id === mutualMatch.id);
        const inUser2List = user2Matches.some(m => m.id === mutualMatch.id);
        
        console.log(`\n  Match between them: ${mutualMatch.id}`);
        console.log(`    - Visible to ${user1.username}: ${inUser1List ? '✓' : '✗'}`);
        console.log(`    - Visible to ${user2.username}: ${inUser2List ? '✓' : '✗'}`);
        
        if (inUser1List && inUser2List) {
          console.log(`\n  ✅ Both users can see their mutual match!`);
        } else {
          console.log(`\n  ❌ Match visibility issue detected!`);
        }
      } else {
        console.log(`\n  ℹ️  No match exists between these users`);
      }
    }
    console.log();
    
    // Final Summary
    console.log('📝 VERIFICATION SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Users:           ${allUsers.length}`);
    console.log(`Total Matches:         ${allMatches.length}`);
    console.log(`Users with no matches: ${usersWithNoMatches.length}`);
    console.log(`Duplicate matches:     ${duplicates.length}`);
    console.log(`Visibility issues:     ${bidirectionalIssues}`);
    console.log();
    
    const allTestsPassed = bidirectionalIssues === 0 && 
                          usersWithNoMatches.length === 0 && 
                          duplicates.length === 0;
    
    if (allTestsPassed) {
      console.log('🎉 ALL TESTS PASSED!');
      console.log('   Seeded matches are working correctly and showing on both users\' profiles.');
    } else {
      console.log('⚠️  ISSUES DETECTED!');
      console.log('   Some seeded matches may not be showing correctly.');
      
      if (usersWithNoMatches.length > 0) {
        console.log(`\n   • ${usersWithNoMatches.length} users have no matches`);
        console.log('     Solution: Run npm run seed:matches again');
      }
      
      if (duplicates.length > 0) {
        console.log(`\n   • ${duplicates.length} duplicate matches found`);
        console.log('     Solution: Clear matches and reseed');
      }
      
      if (bidirectionalIssues > 0) {
        console.log(`\n   • ${bidirectionalIssues} matches have visibility issues`);
        console.log('     Solution: Check database adapter implementation');
      }
    }
    
  } catch (error) {
    console.error('\n❌ Verification failed:', error);
    throw error;
  } finally {
    // Disconnect from database
    if (database && typeof database.disconnect === 'function') {
      await database.disconnect();
      console.log('\n🔌 Database disconnected');
    }
  }
}

// Run verification if executed directly
if (require.main === module) {
  verifySeededMatches()
    .then(() => {
      console.log('\n✅ Verification completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Verification failed:', error);
      process.exit(1);
    });
}

module.exports = { verifySeededMatches };
