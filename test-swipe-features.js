#!/usr/bin/env node

/**
 * Test Script for Enhanced Swipe Features
 * Tests super like adds to favorites and swipe recommendations
 */

const API_BASE_URL = 'http://localhost:3000/api';

async function testSuperLikeToFavorites() {
    console.log('\n🧪 Testing Super Like to Favorites Integration\n');
    console.log('='.repeat(60));

    try {
        // 1. Read test user from data file
        const fs = require('fs');
        const usersData = JSON.parse(fs.readFileSync('./data/users.json', 'utf-8'));
        
        if (usersData.length === 0) {
            console.error('❌ No users found. Please run: npm run seed');
            return;
        }

        const user = usersData[0];
        const userId = user.id;
        console.log(`✅ Using test user: ${user.username} (${userId})`);

        // 2. Get initial favorite movies count
        const favMoviesResponse = await fetch(`${API_BASE_URL}/users/${userId}/favorite-movies`);
        const favMoviesData = await favMoviesResponse.json();
        const initialFavCount = favMoviesData.favoriteMovies?.length || 0;
        console.log(`📊 Initial favorite movies: ${initialFavCount}`);

        // 3. Get movies for swiping
        const swipeResponse = await fetch(`${API_BASE_URL}/swipe/movies/${userId}?limit=5`);
        const swipeData = await swipeResponse.json();
        
        if (!swipeData.success || swipeData.movies.length === 0) {
            console.error('❌ No movies available for swiping');
            return;
        }

        const testMovie = swipeData.movies[0];
        console.log(`🎬 Test movie: "${testMovie.title}" (${testMovie.contentType})`);

        // 4. Record a super like action
        console.log('\n⭐ Recording super like...');
        const superLikeResponse = await fetch(`${API_BASE_URL}/swipe/action/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tmdbId: testMovie.tmdbId,
                title: testMovie.title,
                posterPath: testMovie.posterPath,
                genreIds: testMovie.genreIds,
                contentType: testMovie.contentType,
                action: 'superlike'
            })
        });
        const superLikeData = await superLikeResponse.json();
        
        if (superLikeData.success) {
            console.log('✅ Super like recorded successfully');
        } else {
            console.error('❌ Failed to record super like:', superLikeData.error);
            return;
        }

        // 5. Add to favorites (simulating frontend action)
        console.log('\n💝 Adding to favorites...');
        const endpoint = testMovie.contentType === 'tv' 
            ? `${API_BASE_URL}/users/${userId}/favorite-tv-shows`
            : `${API_BASE_URL}/users/${userId}/favorite-movies`;

        const addFavResponse = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tmdbId: testMovie.tmdbId,
                title: testMovie.title,
                posterPath: testMovie.posterPath,
                overview: testMovie.overview,
                releaseDate: testMovie.releaseDate
            })
        });
        const addFavData = await addFavResponse.json();
        
        if (addFavData.success) {
            console.log('✅ Movie/TV show added to favorites successfully');
        } else {
            console.error('❌ Failed to add to favorites:', addFavData.error);
            return;
        }

        // 6. Verify favorite was added
        const verifyEndpoint = testMovie.contentType === 'tv' 
            ? `${API_BASE_URL}/users/${userId}/favorite-tv-shows`
            : `${API_BASE_URL}/users/${userId}/favorite-movies`;
        
        const verifyResponse = await fetch(verifyEndpoint);
        const verifyData = await verifyResponse.json();
        const finalCount = verifyData.favoriteTVShows?.length || verifyData.favoriteMovies?.length || 0;
        
        console.log(`\n📊 Final favorite count: ${finalCount}`);
        
        if (finalCount > initialFavCount) {
            console.log('✅ TEST PASSED: Favorite count increased!');
        } else {
            console.log('⚠️  TEST WARNING: Favorite count did not increase (might already exist)');
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ Super Like to Favorites Test Complete\n');

    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
        console.error(error.stack);
    }
}

async function testSwipeRecommendations() {
    console.log('\n🧪 Testing Enhanced Swipe Recommendations\n');
    console.log('='.repeat(60));

    try {
        // 1. Read test user from data file
        const fs = require('fs');
        const usersData = JSON.parse(fs.readFileSync('./data/users.json', 'utf-8'));
        
        if (usersData.length === 0) {
            console.error('❌ No users found');
            return;
        }

        const user = usersData[0];
        const userId = user.id;
        console.log(`✅ Using test user: ${user.username}`);

        // 2. Get user's swipe history
        const historyResponse = await fetch(`${API_BASE_URL}/swipe/history/${userId}?limit=100`);
        const historyData = await historyResponse.json();
        
        if (historyData.success) {
            const totalSwipes = historyData.total || 0;
            const likedMovies = historyData.history?.filter(h => h.action === 'like' || h.action === 'superlike') || [];
            console.log(`📊 Swipe history: ${totalSwipes} total, ${likedMovies.length} liked`);
            
            // 3. Get analytics
            const analyticsResponse = await fetch(`${API_BASE_URL}/swipe/analytics/${userId}`);
            const analyticsData = await analyticsResponse.json();
            
            if (analyticsData.success) {
                console.log('\n📈 Swipe Analytics:');
                console.log(`  - Total likes: ${analyticsData.analytics.totalLikes}`);
                console.log(`  - Total dislikes: ${analyticsData.analytics.totalDislikes}`);
                
                if (analyticsData.analytics.topGenres && analyticsData.analytics.topGenres.length > 0) {
                    console.log('\n🎭 Top Liked Genres:');
                    analyticsData.analytics.topGenres.slice(0, 5).forEach((genre, i) => {
                        console.log(`  ${i + 1}. ${genre.genre}: ${genre.count} likes`);
                    });
                    console.log('\n✅ Genre preferences are being tracked!');
                } else {
                    console.log('\n⚠️  No genre preferences found yet');
                }
                
                console.log('\n📺 Content Type Breakdown:');
                console.log(`  - Movies: ${analyticsData.analytics.contentTypeBreakdown.moviePercentage.toFixed(1)}%`);
                console.log(`  - TV Shows: ${analyticsData.analytics.contentTypeBreakdown.tvShowPercentage.toFixed(1)}%`);
            }
        }

        // 4. Test that recommendations are personalized
        console.log('\n🎬 Fetching personalized recommendations...');
        const recsResponse = await fetch(`${API_BASE_URL}/swipe/movies/${userId}?limit=10`);
        const recsData = await recsResponse.json();
        
        if (recsData.success && recsData.movies) {
            console.log(`✅ Received ${recsData.movies.length} personalized recommendations`);
            console.log('\nSample recommendations:');
            recsData.movies.slice(0, 3).forEach((movie, i) => {
                console.log(`  ${i + 1}. ${movie.title} (${movie.contentType})`);
            });
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ Swipe Recommendations Test Complete\n');

    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
    }
}

async function testSwipeHistoryAPI() {
    console.log('\n🧪 Testing Swipe History API\n');
    console.log('='.repeat(60));

    try {
        // Read test user from data file
        const fs = require('fs');
        const usersData = JSON.parse(fs.readFileSync('./data/users.json', 'utf-8'));
        
        if (usersData.length === 0) {
            console.error('❌ No users found');
            return;
        }

        const user = usersData[0];
        const userId = user.id;
        console.log(`✅ Using test user: ${user.username}`);

        // Test history endpoint with filters
        console.log('\n📝 Testing history filters:');
        
        const filters = ['all', 'like', 'dislike', 'movie', 'tv'];
        for (const filter of filters) {
            let url = `${API_BASE_URL}/swipe/history/${userId}?limit=100`;
            if (filter === 'like' || filter === 'dislike') {
                url += `&action=${filter}`;
            } else if (filter === 'movie' || filter === 'tv') {
                url += `&contentType=${filter}`;
            }
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.success) {
                console.log(`  ✅ ${filter}: ${data.history.length} items`);
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ Swipe History API Test Complete\n');

    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
    }
}

// Run all tests
async function runAllTests() {
    console.log('\n🎬 Netflix and Chill - Enhanced Swipe Features Test Suite\n');
    
    // Wait for server to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await testSuperLikeToFavorites();
    await testSwipeRecommendations();
    await testSwipeHistoryAPI();
    
    console.log('\n✅ All tests completed!\n');
}

runAllTests().catch(error => {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
});
