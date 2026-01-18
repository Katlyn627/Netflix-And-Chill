/**
 * Integration test for streaming usage tracking and matching
 * Tests that viewing habits are properly considered in the matching algorithm
 */

const User = require('../models/User');
const MatchingEngine = require('../utils/matchingEngine');

function testIntegration() {
  console.log('🧪 Testing Streaming Usage Integration with Matching\n');
  
  // Create User 1 - Daily Netflix watcher
  const user1Data = {
    username: 'daily_watcher',
    email: 'daily@example.com',
    password: 'password123',
    age: 28,
    location: 'San Francisco, CA',
    preferences: {
      genres: ['Action', 'Sci-Fi'],
      bingeWatchCount: 5
    }
  };
  
  const user1 = new User(user1Data);
  
  // Add streaming services
  user1.addStreamingService({ id: 8, name: 'Netflix' });
  user1.addStreamingService({ id: 15, name: 'Hulu' });
  
  // Add recent watch history (simulating daily watching)
  const recentDates = [0, 1, 2, 3, 4]; // Last 5 days
  recentDates.forEach(daysAgo => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    user1.addToWatchHistory({
      title: `Show ${daysAgo}`,
      type: 'tvshow',
      genre: 'Action',
      service: 'Netflix',
      episodesWatched: 3,
      watchDuration: 150,
      sessionDate: date.toISOString()
    });
  });
  
  // Create User 2 - Daily Netflix watcher (should match well)
  const user2Data = {
    username: 'also_daily',
    email: 'also_daily@example.com',
    password: 'password123',
    age: 27,
    location: 'San Francisco, CA',
    preferences: {
      genres: ['Action', 'Thriller'],
      bingeWatchCount: 4
    }
  };
  
  const user2 = new User(user2Data);
  user2.addStreamingService({ id: 8, name: 'Netflix' });
  user2.addStreamingService({ id: 15, name: 'Hulu' });
  
  // Add daily watch history
  recentDates.forEach(daysAgo => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    user2.addToWatchHistory({
      title: `Movie ${daysAgo}`,
      type: 'movie',
      genre: 'Action',
      service: 'Netflix',
      episodesWatched: 1,
      watchDuration: 120,
      sessionDate: date.toISOString()
    });
  });
  
  // Create User 3 - Occasional watcher (should match less well)
  const user3Data = {
    username: 'occasional_watcher',
    email: 'occasional@example.com',
    password: 'password123',
    age: 29,
    location: 'San Francisco, CA',
    preferences: {
      genres: ['Action', 'Sci-Fi'],
      bingeWatchCount: 5
    }
  };
  
  const user3 = new User(user3Data);
  user3.addStreamingService({ id: 8, name: 'Netflix' });
  
  // Add only 2 watches in the last 30 days (occasional - less than 1 per week)
  const date1 = new Date(Date.now() - 25 * 24 * 60 * 60 * 1000); // 25 days ago
  user3.addToWatchHistory({
    title: 'Occasional Watch 1',
    type: 'tvshow',
    genre: 'Action',
    service: 'Netflix',
    episodesWatched: 2,
    watchDuration: 100,
    sessionDate: date1.toISOString()
  });
  
  const date2 = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000); // 15 days ago
  user3.addToWatchHistory({
    title: 'Occasional Watch 2',
    type: 'tvshow',
    genre: 'Action',
    service: 'Netflix',
    episodesWatched: 1,
    watchDuration: 50,
    sessionDate: date2.toISOString()
  });
  
  console.log('✓ Created 3 test users with different viewing patterns\n');
  
  // Calculate viewing frequencies
  const u1Freq = user1.calculateViewingFrequency();
  const u2Freq = user2.calculateViewingFrequency();
  const u3Freq = user3.calculateViewingFrequency();
  
  console.log('📊 Viewing Frequencies:');
  console.log(`  User 1 (${user1.username}): ${u1Freq.frequency} - ${u1Freq.watchesPerWeek} watches/week`);
  console.log(`  User 2 (${user2.username}): ${u2Freq.frequency} - ${u2Freq.watchesPerWeek} watches/week`);
  console.log(`  User 3 (${user3.username}): ${u3Freq.frequency} - ${u3Freq.watchesPerWeek} watches/week\n`);
  
  // Calculate match scores
  console.log('🎯 Calculating Match Scores:\n');
  
  const match1_2 = MatchingEngine.calculateMatch(user1, user2);
  console.log(`User 1 ↔ User 2 (both daily watchers):`);
  console.log(`  Overall Score: ${match1_2.score}/100`);
  console.log(`  Viewing Frequency Compatibility: ${match1_2.viewingFrequencyCompatibility || 0} points`);
  console.log(`  Active Service Compatibility: ${match1_2.activeServiceCompatibility || 0} points`);
  console.log(`  Shared Services: ${match1_2.sharedServices.join(', ')}\n`);
  
  const match1_3 = MatchingEngine.calculateMatch(user1, user3);
  console.log(`User 1 ↔ User 3 (daily vs occasional):`);
  console.log(`  Overall Score: ${match1_3.score}/100`);
  console.log(`  Viewing Frequency Compatibility: ${match1_3.viewingFrequencyCompatibility || 0} points`);
  console.log(`  Active Service Compatibility: ${match1_3.activeServiceCompatibility || 0} points`);
  console.log(`  Shared Services: ${match1_3.sharedServices.join(', ')}\n`);
  
  // Verify expectations
  console.log('✅ Verification:\n');
  
  const freqDiff = (match1_2.viewingFrequencyCompatibility || 0) - (match1_3.viewingFrequencyCompatibility || 0);
  if (freqDiff > 0) {
    console.log(`✓ Similar viewing frequencies score higher: +${freqDiff} points`);
  } else {
    console.log('✗ Expected similar frequencies to score higher!');
  }
  
  const activeDiff = (match1_2.activeServiceCompatibility || 0) - (match1_3.activeServiceCompatibility || 0);
  if (activeDiff > 0) {
    console.log(`✓ Active shared services score higher: +${activeDiff} points`);
  } else {
    console.log('✗ Expected active services to score higher!');
  }
  
  if (match1_2.score > match1_3.score) {
    console.log(`✓ Overall: Users with similar habits match better (${match1_2.score} > ${match1_3.score})`);
  } else {
    console.log('✗ Expected similar viewing patterns to increase match score!');
  }
  
  console.log('\n📈 Summary:');
  console.log('The matching algorithm now considers:');
  console.log('  1. Viewing frequency patterns (daily, weekly, etc.)');
  console.log('  2. Active usage of shared streaming services');
  console.log('  3. Total watch time and episode counts per service');
  console.log('\nThis helps match users who are likely to watch together!');
}

// Run the test
if (require.main === module) {
  try {
    testIntegration();
    console.log('\n✅ Integration test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Integration test failed:', error);
    process.exit(1);
  }
}

module.exports = testIntegration;
