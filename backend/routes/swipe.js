const express = require('express');
const router = express.Router();
const dataStore = require('../utils/dataStore');
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
    const user = await dataStore.findUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get movies based on user preferences
    const genreIds = user.preferences?.genres?.map(g => g.id).filter(Boolean) || [];
    const swipedMovieIds = (user.swipedMovies || []).map(m => m.tmdbId);

    let movies = [];

    if (genreIds.length > 0) {
      // Discover movies with user's preferred genres
      movies = await streamingAPIService.discover('movie', {
        with_genres: genreIds.join(','),
        sort_by: 'popularity.desc',
        page: 1
      });
    } else {
      // If no genre preferences, get popular movies
      movies = await streamingAPIService.getPopularMovies();
    }

    // Filter out already swiped movies
    const unseenMovies = movies.filter(movie => !swipedMovieIds.includes(movie.id));

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
    const user = await dataStore.findUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

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
    
    const user = await dataStore.findUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

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

module.exports = router;
