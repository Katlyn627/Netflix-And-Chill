/**
 * Migration Script: Update Swipe Analytics
 * 
 * This script calculates and saves swipe preferences analytics for all users
 * who have swiped movies but don't have cached analytics yet.
 * 
 * Run with: node backend/scripts/updateSwipeAnalytics.js
 */

require('dotenv').config();
const { getDatabase } = require('../utils/database');
const User = require('../models/User');
const { analyzeSwipePreferences } = require('../utils/swipeAnalytics');

async function updateSwipeAnalytics() {
  console.log('🔄 Starting swipe analytics update...\n');
  
  try {
    const dataStore = await getDatabase();
    const allUsers = await dataStore.loadUsers();
    
    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    console.log(`Found ${allUsers.length} users to process\n`);
    
    for (const userData of allUsers) {
      const user = new User(userData);
      
      // Skip users with no swipe data
      if (!user.swipedMovies || user.swipedMovies.length === 0) {
        skippedCount++;
        continue;
      }
      
      // Skip users who already have analytics
      if (user.swipePreferences && user.swipePreferences.topGenres && user.swipePreferences.topGenres.length > 0) {
        skippedCount++;
        continue;
      }
      
      try {
        // Calculate analytics
        const analytics = analyzeSwipePreferences(user.swipedMovies);
        
        // Update user with new analytics
        user.updateSwipePreferences(analytics);
        await dataStore.updateUser(user.id, user);
        
        updatedCount++;
        
        // Log progress for users with analytics
        if (analytics.topGenres && analytics.topGenres.length > 0) {
          const topGenre = analytics.topGenres[0];
          console.log(`✅ Updated ${user.username}: ${analytics.totalLikes} likes, top genre: ${topGenre.genre} (${topGenre.percentage}%)`);
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ Error updating ${user.username}:`, error.message);
      }
    }
    
    console.log('\n📊 Update Summary:');
    console.log(`   ✅ Updated: ${updatedCount} users`);
    console.log(`   ⏭️  Skipped: ${skippedCount} users (no swipe data or already has analytics)`);
    console.log(`   ❌ Errors: ${errorCount} users`);
    
    if (updatedCount > 0) {
      console.log('\n✨ Swipe analytics have been successfully calculated and saved!');
      console.log('   Users can now see their favorite genres based on viewing activity.');
    } else {
      console.log('\n✨ No updates needed. All users with swipe data already have analytics.');
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

// Run the migration
updateSwipeAnalytics();
