const express = require('express');
const router = express.Router();
const { getDatabase } = require('../utils/database');
const User = require('../models/User');
const streamingAPIService = require('../services/streamingAPIService');

/**
 * Get movies for swiping based on user preferences
 * Returns a batch of movies from TMDB filtered by user's genre preferences
 */
router.get('/movies/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20 } = req.query;
    
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
      if (genreIds.length > 0 || watchHistoryGenres.length > 0) {
        // Combine genre IDs from preferences and watch history
        const allGenreIds = [...new Set([...genreIds])];
        
        // Discover movies with user's preferred genres
        movies = await streamingAPIService.discover('movie', {
          with_genres: allGenreIds.join(','),
          sort_by: 'popularity.desc',
          page: 1
        });
      } else {
        // If no genre preferences, get popular movies
        movies = await streamingAPIService.getPopularMovies();
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
      totalReturned: formattedMovies.length
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

    // Add swiped movie
    user.addSwipedMovie({ tmdbId, title, posterPath }, action);
    await dataStore.updateUser(userId, user);

    res.json({
      success: true,
      message: `Movie ${action}d successfully`,
      totalLikes: user.getLikedMovies().length,
      totalSwipes: user.swipedMovies.length
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
 * Get user's daily swipe statistics
 * Returns current swipe count for today based on user data timestamps
 */
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50 } = req.query;
    
    const dataStore = await getDatabase();
    const userData = await dataStore.findUserById(userId);
    if (!userData) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    const user = new User(userData);
    const dailySwipeCount = user.getDailySwipeCount();
    const todaySwipes = user.getTodaySwipes();
    const swipeLimit = parseInt(limit);

    res.json({
      success: true,
      dailySwipeCount,
      swipeLimit,
      swipesRemaining: Math.max(0, swipeLimit - dailySwipeCount),
      todaySwipes: todaySwipes.map(s => ({
        tmdbId: s.tmdbId,
        title: s.title,
        action: s.action,
        swipedAt: s.swipedAt
      })),
      totalLikes: user.getLikedMovies().length
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
