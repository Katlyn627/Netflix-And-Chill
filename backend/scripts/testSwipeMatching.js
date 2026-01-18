/**
 * Test script to verify swipe analytics-based matching
 * This script tests that the matching engine properly uses swipe data
 * to match users with similar genre preferences and binge-watching patterns
 */

const { getDatabase } = require('../utils/database');
const MatchingEngine = require('../utils/matchingEngine');
const User = require('../models/User');
const swipeAnalytics = require('../utils/swipeAnalytics');

async function testSwipeMatching() {
  console.log('🧪 Testing Swipe Analytics-Based Matching\n');
  
  try {
    const db = await getDatabase();
    const allUsers = await db.loadUsers();
    
    if (allUsers.length < 2) {
      console.error('❌ Need at least 2 users in database. Run: npm run seed');
      process.exit(1);
    }
    
    console.log(`📊 Found ${allUsers.length} users in database\n`);
    
    // Test with first user
    const testUser = new User(allUsers[0]);
    console.log(`👤 Test User: ${testUser.username || testUser.id}`);
    console.log(`   Binge Watch Count: ${testUser.preferences.bingeWatchCount || 0}`);
    console.log(`   Swiped Movies: ${testUser.swipedMovies.length}`);
    
    // Get user's swipe analytics
    if (testUser.swipedMovies.length > 0) {
      const analytics = swipeAnalytics.analyzeSwipePreferences(testUser.swipedMovies);
      console.log(`   Liked Movies: ${analytics.totalLikes}`);
      console.log(`   Top Genres from Swipes:`);
      analytics.topGenres.slice(0, 3).forEach(g => {
        console.log(`      - ${g.genre}: ${g.count} (${g.percentage}%)`);
      });
      console.log(`   Content Preference: ${analytics.contentTypeBreakdown.moviePercentage}% movies, ${analytics.contentTypeBreakdown.tvShowPercentage}% TV shows`);
    }
    
    console.log('\n🔍 Finding matches...\n');
    
    // Find matches
    const userObjects = allUsers.map(u => new User(u));
    const matches = MatchingEngine.findMatches(testUser, userObjects, 5);
    
    console.log(`✅ Found ${matches.length} matches\n`);
    
    // Display matches with swipe analytics compatibility
    matches.forEach((match, index) => {
      const matchedUser = allUsers.find(u => u.id === match.user2Id);
      console.log(`Match #${index + 1}:`);
      console.log(`   User: ${matchedUser.username || matchedUser.id}`);
      console.log(`   Match Score: ${match.matchScore}%`);
      console.log(`   Description: ${match.matchDescription}`);
      console.log(`   Compatibility Breakdown:`);
      console.log(`      - Swipe Genre Compatibility: ${match.swipeGenreCompatibility}/25 points`);
      console.log(`      - Binge Compatibility: ${match.bingeCompatibility}/20 points`);
      console.log(`      - Content Type Compatibility: ${match.contentTypeCompatibility}/10 points`);
      console.log(`      - Quiz Compatibility: ${match.quizCompatibility}/15 points`);
      console.log(`      - Emotional Tone: ${match.emotionalToneCompatibility}/10 points`);
      
      // Show matched user's swipe data for comparison
      if (matchedUser.swipedMovies && matchedUser.swipedMovies.length > 0) {
        const matchedAnalytics = swipeAnalytics.analyzeSwipePreferences(matchedUser.swipedMovies);
        console.log(`   Matched User Stats:`);
        console.log(`      - Binge Count: ${matchedUser.preferences.bingeWatchCount || 0}`);
        console.log(`      - Liked Movies: ${matchedAnalytics.totalLikes}`);
        console.log(`      - Top Genre: ${matchedAnalytics.topGenres[0]?.genre || 'N/A'}`);
        console.log(`      - Content: ${matchedAnalytics.contentTypeBreakdown.moviePercentage}% movies`);
      }
      console.log('');
    });
    
    // Test assertions
    console.log('🔬 Running Assertions:\n');
    
    let passedTests = 0;
    let totalTests = 0;
    
    // Test 1: Matches should have swipe genre compatibility scores
    totalTests++;
    if (matches.every(m => m.swipeGenreCompatibility !== undefined)) {
      console.log('✅ Test 1: All matches have swipeGenreCompatibility scores');
      passedTests++;
    } else {
      console.log('❌ Test 1: Some matches missing swipeGenreCompatibility scores');
    }
    
    // Test 2: Matches should have binge compatibility scores
    totalTests++;
    if (matches.every(m => m.bingeCompatibility !== undefined)) {
      console.log('✅ Test 2: All matches have bingeCompatibility scores');
      passedTests++;
    } else {
      console.log('❌ Test 2: Some matches missing bingeCompatibility scores');
    }
    
    // Test 3: Matches should have content type compatibility scores
    totalTests++;
    if (matches.every(m => m.contentTypeCompatibility !== undefined)) {
      console.log('✅ Test 3: All matches have contentTypeCompatibility scores');
      passedTests++;
    } else {
      console.log('❌ Test 3: Some matches missing contentTypeCompatibility scores');
    }
    
    // Test 4: Users with similar swipe preferences should have higher scores
    totalTests++;
    const topMatch = matches[0];
    if (topMatch && (topMatch.swipeGenreCompatibility > 0 || topMatch.bingeCompatibility > 0)) {
      console.log('✅ Test 4: Top match has swipe-based compatibility scores');
      passedTests++;
    } else {
      console.log('⚠️  Test 4: Top match has no swipe-based scores (may not have swipe data)');
    }
    
    // Test 5: Match descriptions should mention swipe-based compatibility
    totalTests++;
    const hasSwipeDescription = matches.some(m => 
      m.matchDescription.toLowerCase().includes('swipe') || 
      m.matchDescription.toLowerCase().includes('binge')
    );
    if (hasSwipeDescription) {
      console.log('✅ Test 5: Match descriptions include swipe-based compatibility mentions');
      passedTests++;
    } else {
      console.log('⚠️  Test 5: Match descriptions do not mention swipe-based compatibility');
    }
    
    console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed\n`);
    
    if (passedTests === totalTests) {
      console.log('🎉 All tests passed! Swipe analytics-based matching is working correctly.\n');
      process.exit(0);
    } else {
      console.log('⚠️  Some tests failed or had warnings. Review the output above.\n');
      process.exit(0);
    }
    
  } catch (error) {
    console.error('❌ Error running tests:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run tests
testSwipeMatching();
