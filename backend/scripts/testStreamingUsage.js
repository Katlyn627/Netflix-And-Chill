/**
 * Test script to demonstrate streaming service usage tracking
 * This script creates a test user, adds streaming services, adds watch history,
 * and retrieves viewing statistics
 */

const User = require('../models/User');
const { getDatabase } = require('../utils/database');

async function testStreamingUsageTracking() {
  console.log('🎬 Testing Streaming Service Usage Tracking\n');
  
  try {
    // Initialize database
    const dataStore = await getDatabase();
    
    // Create a test user
    console.log('1. Creating test user...');
    const testUserData = {
      username: 'test_streaming_user',
      email: 'test_streaming@example.com',
      password: 'password123',
      age: 28,
      location: 'San Francisco, CA',
      bio: 'Testing streaming usage tracking'
    };
    
    const user = new User(testUserData);
    console.log(`   ✓ Created user: ${user.username} (${user.id})\n`);
    
    // Add streaming services
    console.log('2. Adding streaming services...');
    user.addStreamingService({ 
      id: 8, 
      name: 'Netflix', 
      logoPath: '/netflix.png',
      logoUrl: 'https://image.tmdb.org/t/p/original/netflix.png'
    });
    user.addStreamingService({ 
      id: 15, 
      name: 'Hulu', 
      logoPath: '/hulu.png',
      logoUrl: 'https://image.tmdb.org/t/p/original/hulu.png'
    });
    user.addStreamingService({ 
      id: 384, 
      name: 'HBO Max', 
      logoPath: '/hbo.png',
      logoUrl: 'https://image.tmdb.org/t/p/original/hbo.png'
    });
    console.log(`   ✓ Added ${user.streamingServices.length} streaming services\n`);
    
    // Add watch history with duration tracking
    console.log('3. Adding watch history with duration tracking...');
    
    // Netflix watches
    user.addToWatchHistory({
      title: 'Stranger Things',
      type: 'tvshow',
      genre: 'Sci-Fi',
      service: 'Netflix',
      episodesWatched: 3,
      watchDuration: 150, // 150 minutes (3 episodes x 50 min)
      tmdbId: 66732
    });
    
    user.addToWatchHistory({
      title: 'The Crown',
      type: 'tvshow',
      genre: 'Drama',
      service: 'Netflix',
      episodesWatched: 2,
      watchDuration: 120, // 120 minutes
      tmdbId: 1399
    });
    
    // Hulu watches
    user.addToWatchHistory({
      title: 'The Handmaid\'s Tale',
      type: 'tvshow',
      genre: 'Drama',
      service: 'Hulu',
      episodesWatched: 4,
      watchDuration: 200, // 200 minutes
      tmdbId: 69478
    });
    
    // HBO Max watches
    user.addToWatchHistory({
      title: 'Game of Thrones',
      type: 'tvshow',
      genre: 'Fantasy',
      service: 'HBO Max',
      episodesWatched: 5,
      watchDuration: 300, // 300 minutes
      tmdbId: 1399
    });
    
    user.addToWatchHistory({
      title: 'Succession',
      type: 'tvshow',
      genre: 'Drama',
      service: 'HBO Max',
      episodesWatched: 3,
      watchDuration: 180, // 180 minutes
      tmdbId: 76479
    });
    
    console.log(`   ✓ Added ${user.watchHistory.length} watch history entries\n`);
    
    // Get viewing statistics
    console.log('4. Retrieving viewing statistics...\n');
    const viewingStats = user.getViewingStatistics();
    
    console.log('📊 VIEWING STATISTICS:');
    console.log('==================================================');
    console.log(`Total Watch Time: ${viewingStats.totalWatchTime} minutes (${(viewingStats.totalWatchTime / 60).toFixed(1)} hours)`);
    console.log(`Total Watch Count: ${viewingStats.totalWatchCount} sessions`);
    console.log(`Total Episodes: ${viewingStats.totalEpisodes} episodes`);
    console.log(`Average Session Duration: ${viewingStats.averageSessionDuration} minutes`);
    console.log(`Most Used Service: ${viewingStats.mostUsedService}`);
    console.log(`\nViewing Frequency: ${viewingStats.viewingFrequency.frequency}`);
    console.log(`Watches Per Week: ${viewingStats.viewingFrequency.watchesPerWeek}`);
    console.log(`Days Since Last Watch: ${viewingStats.viewingFrequency.daysSinceLastWatch}`);
    
    console.log('\n📺 SERVICE BREAKDOWN:');
    console.log('==================================================');
    viewingStats.serviceBreakdown.forEach((service, index) => {
      console.log(`${index + 1}. ${service.name}`);
      console.log(`   - Watch Time: ${service.totalWatchTime} minutes (${service.percentageOfTotal}% of total)`);
      console.log(`   - Watch Count: ${service.watchCount} sessions`);
      console.log(`   - Episodes: ${service.totalEpisodes}`);
      console.log(`   - Last Used: ${service.lastUsed ? new Date(service.lastUsed).toLocaleString() : 'Never'}`);
    });
    
    // Get detailed stats for Netflix
    console.log('\n🎬 NETFLIX DETAILED STATS:');
    console.log('==================================================');
    const netflixStats = user.getServiceUsageStats('Netflix');
    if (netflixStats) {
      console.log(`Service: ${netflixStats.name}`);
      console.log(`Connected: ${netflixStats.connected ? 'Yes' : 'No'}`);
      console.log(`Total Watch Time: ${netflixStats.totalWatchTime} minutes`);
      console.log(`Watch Count: ${netflixStats.watchCount} sessions`);
      console.log(`Total Episodes: ${netflixStats.totalEpisodes}`);
      console.log(`Last Used: ${new Date(netflixStats.lastUsed).toLocaleString()}`);
      console.log(`\nRecent Watches:`);
      netflixStats.recentWatches.forEach((watch, index) => {
        console.log(`  ${index + 1}. ${watch.title} (${watch.episodesWatched} episodes, ${watch.watchDuration} min)`);
      });
    }
    
    // Save to database (optional)
    console.log('\n5. Saving user data to database...');
    const userDataToStore = { ...user.toJSON(), password: user.password };
    await dataStore.addUser(userDataToStore);
    console.log(`   ✓ User data saved with ID: ${user.id}\n`);
    
    console.log('✅ Test completed successfully!');
    console.log('\n💡 API Endpoints to use:');
    console.log(`   GET  /api/users/${user.id}/viewing-stats`);
    console.log(`   GET  /api/users/${user.id}/streaming-services/Netflix/stats`);
    console.log(`   PUT  /api/users/${user.id}/streaming-services/Netflix/usage`);
    
  } catch (error) {
    console.error('❌ Error during test:', error);
    throw error;
  }
}

// Run the test
if (require.main === module) {
  testStreamingUsageTracking()
    .then(() => {
      console.log('\n🎉 All tests passed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Test failed:', error.message);
      process.exit(1);
    });
}

module.exports = testStreamingUsageTracking;
