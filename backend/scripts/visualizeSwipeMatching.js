#!/usr/bin/env node

/**
 * Visual demonstration of swipe analytics-based matching
 * Shows how the enhanced matching algorithm works with real user data
 */

const { getDatabase } = require('../utils/database');
const MatchingEngine = require('../utils/matchingEngine');
const User = require('../models/User');
const swipeAnalytics = require('../utils/swipeAnalytics');

async function visualizeMatching() {
  console.log('\n╔════════════════════════════════════════════════════════════════════╗');
  console.log('║   SWIPE ANALYTICS-BASED MATCHING VISUALIZATION                    ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝\n');
  
  try {
    const db = await getDatabase();
    const allUsers = await db.loadUsers();
    
    // Select test user
    const testUser = new User(allUsers[0]);
    
    console.log('👤 TEST USER PROFILE');
    console.log('═══════════════════════════════════════════════════════════════════\n');
    console.log(`   Username: ${testUser.username || 'Anonymous'}`);
    console.log(`   Age: ${testUser.age}`);
    console.log(`   Location: ${testUser.location}`);
    console.log(`   Binge Watch Count: ${testUser.preferences.bingeWatchCount || 0} episodes/sitting\n`);
    
    // Get swipe analytics
    if (testUser.swipedMovies.length > 0) {
      const analytics = swipeAnalytics.analyzeSwipePreferences(testUser.swipedMovies);
      
      console.log('   📊 SWIPE ANALYTICS:');
      console.log('   ─────────────────────────────────────────────────────────────────');
      console.log(`   Total Swipes: ${analytics.totalSwipes} (${analytics.totalLikes} likes, ${analytics.totalDislikes} passes)`);
      console.log(`   Like Rate: ${analytics.likePercentage}%`);
      console.log(`   Content Preference: ${analytics.contentTypeBreakdown.moviePercentage}% Movies, ${analytics.contentTypeBreakdown.tvShowPercentage}% TV Shows\n`);
      
      console.log('   Top Genres from Swipes:');
      analytics.topGenres.slice(0, 5).forEach((g, i) => {
        const bar = '█'.repeat(Math.floor(g.percentage / 5));
        console.log(`   ${i + 1}. ${g.genre.padEnd(20)} ${bar} ${g.percentage}% (${g.count} movies)`);
      });
    }
    
    console.log('\n\n🔍 FINDING COMPATIBLE MATCHES');
    console.log('═══════════════════════════════════════════════════════════════════\n');
    
    // Find matches
    const userObjects = allUsers.map(u => new User(u));
    const matches = MatchingEngine.findMatches(testUser, userObjects, 3);
    
    matches.forEach((match, index) => {
      const matchedUser = allUsers.find(u => u.id === match.user2Id);
      
      console.log(`╭─────────────────────────────────────────────────────────────────╮`);
      console.log(`│ MATCH #${index + 1}: ${(matchedUser.username || 'Anonymous').padEnd(50)} │`);
      console.log(`╰─────────────────────────────────────────────────────────────────╯\n`);
      
      console.log(`   👤 User: ${matchedUser.username || 'Anonymous'}`);
      console.log(`   📍 Location: ${matchedUser.location}`);
      console.log(`   🎯 Match Score: ${match.matchScore}%\n`);
      
      console.log('   💯 COMPATIBILITY BREAKDOWN:');
      console.log('   ─────────────────────────────────────────────────────────────────');
      
      // Visual bars for compatibility scores
      const maxWidth = 25;
      
      // Swipe Genre Compatibility (0-25)
      const swipeGenreBar = '█'.repeat(Math.floor((match.swipeGenreCompatibility / 25) * maxWidth));
      console.log(`   🎬 Swipe Genre Match:    ${swipeGenreBar.padEnd(maxWidth)} ${match.swipeGenreCompatibility}/25`);
      
      // Binge Compatibility (0-20)
      const bingeBar = '█'.repeat(Math.floor((match.bingeCompatibility / 20) * maxWidth));
      console.log(`   📺 Binge Pattern Match:  ${bingeBar.padEnd(maxWidth)} ${match.bingeCompatibility}/20`);
      
      // Content Type Compatibility (0-10)
      const contentBar = '█'.repeat(Math.floor((match.contentTypeCompatibility / 10) * maxWidth));
      console.log(`   🎞️  Content Type Match:   ${contentBar.padEnd(maxWidth)} ${match.contentTypeCompatibility}/10`);
      
      // Other compatibility scores
      const quizBar = '█'.repeat(Math.floor((match.quizCompatibility / 15) * maxWidth));
      console.log(`   🧠 Quiz Compatibility:   ${quizBar.padEnd(maxWidth)} ${match.quizCompatibility}/15`);
      
      const emotionalBar = '█'.repeat(Math.floor((match.emotionalToneCompatibility / 10) * maxWidth));
      console.log(`   💭 Emotional Tone Match: ${emotionalBar.padEnd(maxWidth)} ${Math.round(match.emotionalToneCompatibility)}/10\n`);
      
      console.log(`   📝 Match Description:`);
      console.log(`   "${match.matchDescription}"\n`);
      
      // Show matched user's swipe analytics for comparison
      if (matchedUser.swipedMovies && matchedUser.swipedMovies.length > 0) {
        const matchedAnalytics = swipeAnalytics.analyzeSwipePreferences(matchedUser.swipedMovies);
        console.log(`   📊 Matched User's Viewing Profile:`);
        console.log(`   Binge Count: ${matchedUser.preferences.bingeWatchCount || 0}, Liked Movies: ${matchedAnalytics.totalLikes}`);
        console.log(`   Top Genre: ${matchedAnalytics.topGenres[0]?.genre || 'N/A'} (${matchedAnalytics.topGenres[0]?.percentage || 0}%)`);
        console.log(`   Content: ${matchedAnalytics.contentTypeBreakdown.moviePercentage}% Movies\n`);
      }
      
      console.log('');
    });
    
    console.log('╔════════════════════════════════════════════════════════════════════╗');
    console.log('║   ✨ SWIPE ANALYTICS SUCCESSFULLY POWERS INTELLIGENT MATCHING ✨   ║');
    console.log('╚════════════════════════════════════════════════════════════════════╝\n');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

visualizeMatching();
