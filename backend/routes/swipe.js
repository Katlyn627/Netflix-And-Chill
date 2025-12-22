const express = require('express');
const router = express.Router();
const { getDatabase } = require('../utils/database');
const User = require('../models/User');
const streamingAPIService = require('../services/streamingAPIService');
const watchmodeAPIService = require('../services/watchmodeAPIService');

// Constants
const TMDB_PAGE_SIZE = 20; // TMDB API returns approximately 20 results per page
const MAX_PAGES_TO_FETCH = 5; // Maximum number of pages to fetch from TMDB
const MAX_TMDB_PAGE = 500; // TMDB API has 500 pages max
const YEARS_FOR_RECENT_MOVIES = 3; // Number of years to consider for recent movies
const THREE_YEARS_IN_MS = 365 * 24 * 60 * 60 * 1000 * 3; // 3 years in milliseconds

// Different sorting strategies for movie diversity
const SORT_STRATEGIES = [
  'popularity.desc',
  'vote_average.desc',
  'release_date.desc',
  'revenue.desc',
  'vote_count.desc'
];

// Time windows for trending movies
const TRENDING_TIME_WINDOWS = ['week', 'day'];

/**
 * Get a random sorting strategy
 * @returns {string} Random sort strategy
 */
function getRandomSortStrategy() {
  return SORT_STRATEGIES[Math.floor(Math.random() * SORT_STRATEGIES.length)];
}

/**
 * Get a random page number within valid TMDB range
 * @param {number} maxPage - Maximum page to consider
 * @returns {number} Random page number
 */
function getRandomPageNumber(maxPage = 50) {
  // Use a reasonable range (1-50) to ensure we get quality results
  const max = Math.min(maxPage, MAX_TMDB_PAGE);
  return Math.floor(Math.random() * max) + 1;
}

/**
 * Calculate how many pages to fetch based on requested limit
 * @param {number} limit - Number of movies requested
 * @returns {number} Number of pages to fetch
 */
function calculatePagesToFetch(limit) {
  return Math.min(MAX_PAGES_TO_FETCH, Math.ceil(limit / TMDB_PAGE_SIZE));
}

/**
 * Fetch diverse movies from multiple TMDB sources
 * @param {Array} genreIds - User's preferred genre IDs
 * @param {number} limit - Number of movies to fetch
 * @returns {Promise<Array>} Array of movies from multiple sources
 */
async function fetchDiverseMovies(genreIds, limit) {
  const movieSources = [];
  const targetPerSource = Math.ceil(limit / 4); // Split across 4 sources
  
  // Source 1: Discover with random page and random sort
  const discoverSort = getRandomSortStrategy();
  const discoverPage = getRandomPageNumber(30);
  movieSources.push(
    streamingAPIService.discover('movie', {
      with_genres: genreIds.length > 0 ? genreIds.join(',') : undefined,
      sort_by: discoverSort,
      page: discoverPage,
      'vote_count.gte': 100 // Ensure movies have enough votes
    })
      .then(movies => movies.slice(0, targetPerSource))
      .catch(err => {
        console.error('Error fetching from source 1 (discover):', err.message);
        return [];
      })
  );
  
  // Source 2: Trending movies (different time windows)
  const timeWindow = TRENDING_TIME_WINDOWS[Math.floor(Math.random() * TRENDING_TIME_WINDOWS.length)];
  movieSources.push(
    streamingAPIService.getTrending('movie', timeWindow)
      .then(movies => movies.slice(0, targetPerSource))
      .catch(err => {
        console.error('Error fetching from source 2 (trending):', err.message);
        return [];
      })
  );
  
  // Source 3: Top rated movies with random page
  const topRatedPage = getRandomPageNumber(20);
  movieSources.push(
    streamingAPIService.discover('movie', {
      sort_by: 'vote_average.desc',
      'vote_count.gte': 1000,
      page: topRatedPage
    })
      .then(movies => movies.slice(0, targetPerSource))
      .catch(err => {
        console.error('Error fetching from source 3 (top rated):', err.message);
        return [];
      })
  );
  
  // Source 4: Popular movies with different criteria
  const threeYearsAgo = new Date(Date.now() - THREE_YEARS_IN_MS).toISOString().split('T')[0];
  movieSources.push(
    streamingAPIService.discover('movie', {
      with_genres: genreIds.length > 0 ? genreIds.slice(0, 2).join(',') : undefined,
      sort_by: 'popularity.desc',
      page: getRandomPageNumber(20),
      'primary_release_date.gte': threeYearsAgo
    })
      .then(movies => movies.slice(0, targetPerSource))
      .catch(err => {
        console.error('Error fetching from source 4 (popular recent):', err.message);
        return [];
      })
  );
  
  // Fetch all sources in parallel - each source has its own error handling
  const allMovieSets = await Promise.all(movieSources);
  
  // Combine and deduplicate by movie ID
  // TMDB API consistently returns movies with an 'id' property across all endpoints
  const movieMap = new Map();
  allMovieSets.flat().forEach(movie => {
    // Validate that movie object has required properties
    if (movie && typeof movie === 'object' && movie.id && typeof movie.id === 'number') {
      if (!movieMap.has(movie.id)) {
        movieMap.set(movie.id, movie);
      }
    }
  });
  
  // Convert to array and shuffle for randomness
  const movies = Array.from(movieMap.values());
  return shuffleArray(movies);
}

/**
 * Fetch diverse TV shows from multiple TMDB sources
 * @param {Array} genreIds - User's preferred genre IDs
 * @param {number} limit - Number of TV shows to fetch
 * @returns {Promise<Array>} Array of TV shows from multiple sources
 */
async function fetchDiverseTVShows(genreIds, limit) {
  const tvSources = [];
  const targetPerSource = Math.ceil(limit / 4); // Split across 4 sources
  
  // Source 1: Discover with random page and random sort
  const discoverSort = getRandomSortStrategy();
  const discoverPage = getRandomPageNumber(30);
  tvSources.push(
    streamingAPIService.discover('tv', {
      with_genres: genreIds.length > 0 ? genreIds.join(',') : undefined,
      sort_by: discoverSort,
      page: discoverPage,
      'vote_count.gte': 100 // Ensure TV shows have enough votes
    })
      .then(shows => shows.slice(0, targetPerSource))
      .catch(err => {
        console.error('Error fetching from TV source 1 (discover):', err.message);
        return [];
      })
  );
  
  // Source 2: Trending TV shows (different time windows)
  const timeWindow = TRENDING_TIME_WINDOWS[Math.floor(Math.random() * TRENDING_TIME_WINDOWS.length)];
  tvSources.push(
    streamingAPIService.getTrending('tv', timeWindow)
      .then(shows => shows.slice(0, targetPerSource))
      .catch(err => {
        console.error('Error fetching from TV source 2 (trending):', err.message);
        return [];
      })
  );
  
  // Source 3: Top rated TV shows with random page
  const topRatedPage = getRandomPageNumber(20);
  tvSources.push(
    streamingAPIService.discover('tv', {
      sort_by: 'vote_average.desc',
      'vote_count.gte': 1000,
      page: topRatedPage
    })
      .then(shows => shows.slice(0, targetPerSource))
      .catch(err => {
        console.error('Error fetching from TV source 3 (top rated):', err.message);
        return [];
      })
  );
  
  // Source 4: Popular TV shows with different criteria
  const threeYearsAgo = new Date(Date.now() - THREE_YEARS_IN_MS).toISOString().split('T')[0];
  tvSources.push(
    streamingAPIService.discover('tv', {
      with_genres: genreIds.length > 0 ? genreIds.slice(0, 2).join(',') : undefined,
      sort_by: 'popularity.desc',
      page: getRandomPageNumber(20),
      'first_air_date.gte': threeYearsAgo
    })
      .then(shows => shows.slice(0, targetPerSource))
      .catch(err => {
        console.error('Error fetching from TV source 4 (popular recent):', err.message);
        return [];
      })
  );
  
  // Fetch all sources in parallel - each source has its own error handling
  const allTVSets = await Promise.all(tvSources);
  
  // Combine and deduplicate by TV show ID
  // TMDB API consistently returns TV shows with an 'id' property across all endpoints
  const tvMap = new Map();
  allTVSets.flat().forEach(show => {
    // Validate that TV show object has required properties
    if (show && typeof show === 'object' && show.id && typeof show.id === 'number') {
      if (!tvMap.has(show.id)) {
        tvMap.set(show.id, show);
      }
    }
  });
  
  // Convert to array and shuffle for randomness
  const tvShows = Array.from(tvMap.values());
  return shuffleArray(tvShows);
}

/**
 * Fetch diverse content (movies and TV shows) from multiple TMDB sources
 * @param {Array} genreIds - User's preferred genre IDs
 * @param {number} limit - Total number of items to fetch
 * @returns {Promise<Array>} Array of mixed movies and TV shows
 */
async function fetchDiverseContent(genreIds, limit) {
  // Split roughly 60/40 between movies and TV shows
  const movieLimit = Math.ceil(limit * 0.6);
  const tvLimit = Math.ceil(limit * 0.4);
  
  // Fetch both in parallel
  const [movies, tvShows] = await Promise.all([
    fetchDiverseMovies(genreIds, movieLimit),
    fetchDiverseTVShows(genreIds, tvLimit)
  ]);
  
  // Tag each item with its content type
  const taggedMovies = movies.map(m => ({ ...m, contentType: 'movie' }));
  const taggedTVShows = tvShows.map(tv => ({ ...tv, contentType: 'tv' }));
  
  // Combine and shuffle to mix movies and TV shows
  const allContent = [...taggedMovies, ...taggedTVShows];
  return shuffleArray(allContent);
}

/**
 * Shuffle array using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Fetch multiple pages of movies from TMDB
 * @param {Object} params - Parameters for TMDB discover endpoint
 * @param {number} startPage - Starting page number
 * @param {number} numPages - Number of pages to fetch
 * @returns {Promise<Array>} Array of movies
 */
async function fetchMultiplePages(params, startPage, numPages) {
  const pagePromises = [];
  
  for (let i = 0; i < numPages; i++) {
    pagePromises.push(
      streamingAPIService.discover('movie', {
        ...params,
        page: startPage + i
      })
    );
  }
  
  const pageResults = await Promise.all(pagePromises);
  return pageResults.flat();
}

/**
 * Get movies and TV shows for swiping based on user preferences
 * Returns a batch of movies and TV shows from TMDB filtered by user's genre preferences
 * Supports unlimited swiping with diverse content recommendations
 */
router.get('/movies/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, page = 1 } = req.query;
    
    // Get user profile
    const dataStore = await getDatabase();
    const userData = await dataStore.findUserById(userId);
    if (!userData) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    const user = new User(userData);

    // Get content based on user preferences, favorite genres, and watchlist
    const genreIds = user.preferences?.genres?.map(g => g.id).filter(Boolean) || [];
    const swipedMovieIds = (user.swipedMovies || []).map(m => m.tmdbId);
    
    // Get genre IDs from favorite movies and watchlist to enhance recommendations
    const favoriteMovieIds = (user.favoriteMovies || []).map(m => m.tmdbId);
    const watchlistMovieIds = (user.movieWatchlist || []).map(m => m.tmdbId);
    
    // Get genre IDs from user's watch history to enhance recommendations
    const watchHistoryGenres = [];
    if (user.watchHistory && user.watchHistory.length > 0) {
      user.watchHistory.forEach(item => {
        if (item.genre && !watchHistoryGenres.includes(item.genre)) {
          watchHistoryGenres.push(item.genre);
        }
      });
    }

    let content = [];

    try {
      // Combine genre IDs from preferences and watch history
      const allGenreIds = [...new Set([...genreIds])];
      
      // Use new diverse content fetching strategy that combines movies and TV shows from multiple sources
      // This ensures users get different content each time they swipe
      content = await fetchDiverseContent(allGenreIds, parseInt(limit));
      
      // If no content returned from API, fallback to popular movies and TV shows
      if (!content || content.length === 0) {
        console.log('No content from diverse sources, trying popular content fallback');
        const [movies, tvShows] = await Promise.all([
          streamingAPIService.getPopularMovies(),
          streamingAPIService.getPopularTVShows()
        ]);
        content = [
          ...movies.map(m => ({ ...m, contentType: 'movie' })),
          ...tvShows.map(tv => ({ ...tv, contentType: 'tv' }))
        ];
        content = shuffleArray(content);
      }
    } catch (apiError) {
      // If API fails, fallback to popular content
      console.error('Error fetching content from TMDB, using fallback:', apiError.message);
      try {
        const [movies, tvShows] = await Promise.all([
          streamingAPIService.getPopularMovies(),
          streamingAPIService.getPopularTVShows()
        ]);
        content = [
          ...movies.map(m => ({ ...m, contentType: 'movie' })),
          ...tvShows.map(tv => ({ ...tv, contentType: 'tv' }))
        ];
        content = shuffleArray(content);
      } catch (fallbackError) {
        console.error('Error fetching popular content fallback:', fallbackError);
        // Use hardcoded fallback from fallbackData
        const { fallbackMovies, fallbackTVShows } = require('../services/fallbackData');
        content = [
          ...fallbackMovies.map(m => ({ ...m, contentType: 'movie' })),
          ...fallbackTVShows.map(tv => ({ ...tv, contentType: 'tv' }))
        ];
        content = shuffleArray(content);
      }
    }

    // Filter out already swiped content, favorite movies, and watchlist movies
    // This ensures fresh content based on what user hasn't explicitly added
    const excludedMovieIds = new Set([...swipedMovieIds, ...favoriteMovieIds, ...watchlistMovieIds]);
    const unseenContent = content.filter(item => !excludedMovieIds.has(item.id));

    // Format content for swipe UI - handle both movies and TV shows
    const formattedContent = unseenContent.slice(0, parseInt(limit)).map(item => ({
      tmdbId: item.id,
      contentType: item.contentType || 'movie',
      title: item.title || item.name, // TV shows use 'name' instead of 'title'
      overview: item.overview,
      posterPath: streamingAPIService.getImageUrl(item.poster_path, 'w500'),
      backdropPath: streamingAPIService.getImageUrl(item.backdrop_path, 'w1280'),
      releaseDate: item.release_date || item.first_air_date, // TV shows use 'first_air_date'
      rating: item.vote_average,
      genreIds: item.genre_ids
    }));

    // Optionally fetch streaming availability for content if Watchmode API is configured
    // Note: This adds ~2 seconds of processing time for 20 items (100ms delay between requests)
    // Trade-off: More comprehensive streaming data vs. slightly longer response time
    // Future improvement: Implement caching or background processing for better performance
    const includeStreaming = req.query.includeStreaming === 'true';
    if (includeStreaming && formattedContent.length > 0) {
      // Fetch streaming availability for first batch of content with rate limiting
      // Batch size of 20 provides good coverage while respecting API rate limits
      const batchSize = Math.min(20, formattedContent.length);
      
      for (let i = 0; i < batchSize; i++) {
        try {
          const item = formattedContent[i];
          const availability = await watchmodeAPIService.getStreamingAvailability(item.tmdbId, item.contentType);
          item.streamingAvailability = availability;
          
          // Small delay to respect API rate limits (100ms between requests)
          if (i < batchSize - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (error) {
          // Silently fail for optional feature
          console.warn(`Failed to get streaming availability for ${formattedContent[i].contentType} ${formattedContent[i].tmdbId}:`, error.message);
          formattedContent[i].streamingAvailability = null;
        }
      }
    }

    res.json({
      success: true,
      movies: formattedContent, // Keep the key as 'movies' for backward compatibility with frontend
      totalReturned: formattedContent.length,
      hasMore: unseenContent.length > formattedContent.length
    });
  } catch (error) {
    console.error('Error getting swipe movies:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Record a swipe action (like or dislike)
 * Unlimited swipes enabled - no daily limits
 * Supports both movies and TV shows
 */
router.post('/action/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { tmdbId, title, posterPath, action, genreIds, contentType } = req.body;

    if (!['like', 'dislike'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: 'Action must be "like" or "dislike"'
      });
    }

    // Get user
    const dataStore = await getDatabase();
    const userData = await dataStore.findUserById(userId);
    if (!userData) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    const user = new User(userData);

    // Add swiped content (movie or TV show) with genre IDs and content type - unlimited swipes
    user.addSwipedMovie({ tmdbId, title, posterPath, genreIds, contentType: contentType || 'movie' }, action);
    
    // Update swipe preferences analytics after each swipe
    const { analyzeSwipePreferences } = require('../utils/swipeAnalytics');
    const analytics = analyzeSwipePreferences(user.swipedMovies);
    user.updateSwipePreferences(analytics);
    
    await dataStore.updateUser(userId, user);

    res.json({
      success: true,
      message: `Movie ${action}d successfully`,
      totalLikes: user.getLikedMovies().length,
      totalSwipes: user.swipedMovies.length,
      unlimited: true
    });
  } catch (error) {
    console.error('Error recording swipe action:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get user's liked movies
 */
router.get('/liked/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const dataStore = await getDatabase();
    const userData = await dataStore.findUserById(userId);
    if (!userData) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    const user = new User(userData);
    const likedMovies = user.getLikedMovies();

    res.json({
      success: true,
      likedMovies,
      total: likedMovies.length
    });
  } catch (error) {
    console.error('Error getting liked movies:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get user's swipe statistics
 * Returns unlimited swipe stats - no daily limits
 */
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const dataStore = await getDatabase();
    const userData = await dataStore.findUserById(userId);
    if (!userData) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    const user = new User(userData);
    const totalSwipes = user.swipedMovies.length;
    const totalLikes = user.getLikedMovies().length;

    res.json({
      success: true,
      totalSwipes,
      totalLikes,
      unlimited: true, // Indicate that swipes are unlimited
      message: 'Unlimited swipes enabled'
    });
  } catch (error) {
    console.error('Error getting swipe stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get user's swipe analytics and preferences
 * Returns genre preferences, content type breakdown, and insights
 */
router.get('/analytics/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const dataStore = await getDatabase();
    const userData = await dataStore.findUserById(userId);
    if (!userData) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    const user = new User(userData);
    const { analyzeSwipePreferences, getChartData, getSwipeInsights } = require('../utils/swipeAnalytics');
    
    // Calculate fresh analytics
    const analytics = analyzeSwipePreferences(user.swipedMovies);
    const chartData = getChartData(analytics);
    const insights = getSwipeInsights(analytics);
    
    // Update cached analytics in user profile
    user.updateSwipePreferences(analytics);
    await dataStore.updateUser(userId, user);

    res.json({
      success: true,
      analytics,
      chartData,
      insights
    });
  } catch (error) {
    console.error('Error getting swipe analytics:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
