const express = require('express');
const router = express.Router();
const { getDatabase } = require('../utils/database');
const User = require('../models/User');
const streamingAPIService = require('../services/streamingAPIService');

// Constants
const TMDB_PAGE_SIZE = 20; // TMDB API returns approximately 20 results per page
const MAX_PAGES_TO_FETCH = 5; // Maximum number of pages to fetch from TMDB

/**
 * Calculate how many pages to fetch based on requested limit
 * @param {number} limit - Number of movies requested
 * @returns {number} Number of pages to fetch
 */
function calculatePagesToFetch(limit) {
  return Math.min(MAX_PAGES_TO_FETCH, Math.ceil(limit / TMDB_PAGE_SIZE));
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
      const numPages = calculatePagesToFetch(parseInt(limit));
      
      if (genreIds.length > 0 || watchHistoryGenres.length > 0) {
        // Combine genre IDs from preferences and watch history
        const allGenreIds = [...new Set([...genreIds])];
        
        // Fetch multiple pages for more diverse recommendations
        movies = await fetchMultiplePages(
          {
            with_genres: allGenreIds.join(','),
            sort_by: 'popularity.desc'
          },
          parseInt(page),
          numPages
        );
      } else {
        // If no genre preferences, get popular movies from multiple pages
        movies = await fetchMultiplePages(
          {
            sort_by: 'popularity.desc'
          },
          parseInt(page),
          numPages
        );
      }
      
      // If no movies returned from API, fallback to popular movies
      if (!movies || movies.length === 0) {
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
