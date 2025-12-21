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
 * Get movies for swiping based on user preferences
 * Returns a batch of movies from TMDB filtered by user's genre preferences
 * Supports unlimited swiping with diverse movie recommendations
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

    // Get movies based on user preferences, favorite genres, and watchlist
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

    let movies = [];

    try {
      // Combine genre IDs from preferences and watch history
      const allGenreIds = [...new Set([...genreIds])];
      
      // Use new diverse movie fetching strategy that combines multiple sources
      // This ensures users get different movies each time they swipe
      movies = await fetchDiverseMovies(allGenreIds, parseInt(limit));
      
      // If no movies returned from API, fallback to popular movies
      if (!movies || movies.length === 0) {
        console.log('No movies from diverse sources, trying popular movies fallback');
        movies = await streamingAPIService.getPopularMovies();
      }
    } catch (apiError) {
      // If API fails, fallback to popular movies
      console.error('Error fetching movies from TMDB, using fallback:', apiError.message);
      try {
        movies = await streamingAPIService.getPopularMovies();
      } catch (fallbackError) {
        console.error('Error fetching popular movies fallback:', fallbackError);
        // Use hardcoded fallback from fallbackData
        const { fallbackMovies } = require('../services/fallbackData');
        movies = fallbackMovies;
      }
    }

    // Filter out already swiped movies, favorite movies, and watchlist movies
    // This ensures fresh content based on what user hasn't explicitly added
    const excludedMovieIds = new Set([...swipedMovieIds, ...favoriteMovieIds, ...watchlistMovieIds]);
    const unseenMovies = movies.filter(movie => !excludedMovieIds.has(movie.id));

    // Format movies for swipe UI
    const formattedMovies = unseenMovies.slice(0, parseInt(limit)).map(movie => ({
      tmdbId: movie.id,
      title: movie.title,
      overview: movie.overview,
      posterPath: streamingAPIService.getImageUrl(movie.poster_path, 'w500'),
      backdropPath: streamingAPIService.getImageUrl(movie.backdrop_path, 'w1280'),
      releaseDate: movie.release_date,
      rating: movie.vote_average,
      genreIds: movie.genre_ids
    }));

    // Optionally fetch streaming availability for movies if Watchmode API is configured
    // This is done asynchronously and won't block the response
    const includeStreaming = req.query.includeStreaming === 'true';
    if (includeStreaming) {
      // Fetch streaming availability for first batch of movies
      const streamingPromises = formattedMovies.slice(0, 10).map(async (movie) => {
        try {
          const availability = await watchmodeAPIService.getStreamingAvailability(movie.tmdbId, 'movie');
          movie.streamingAvailability = availability;
        } catch (error) {
          // Silently fail for optional feature
          movie.streamingAvailability = null;
        }
      });
      await Promise.all(streamingPromises);
    }

    res.json({
      success: true,
      movies: formattedMovies,
      totalReturned: formattedMovies.length,
      hasMore: unseenMovies.length > formattedMovies.length
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
 */
router.post('/action/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { tmdbId, title, posterPath, action } = req.body;

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

    // Add swiped movie - unlimited swipes
    user.addSwipedMovie({ tmdbId, title, posterPath }, action);
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

module.exports = router;
