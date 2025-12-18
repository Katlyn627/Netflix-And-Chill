const express = require('express');
const router = express.Router();
const streamingAPIService = require('../services/streamingAPIService');

/**
 * GET /api/streaming/search
 * Search for movies and TV shows using TMDB API
 */
router.get('/search', async (req, res) => {
  try {
    const { query, type = 'multi' } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const results = await streamingAPIService.search(query, type);
    
    res.json({
      query,
      count: results.length,
      results: results.map(item => ({
        id: item.id,
        title: item.title || item.name,
        type: item.media_type || type,
        releaseDate: item.release_date || item.first_air_date,
        overview: item.overview,
        posterPath: item.poster_path,
        genres: item.genre_ids,
        popularity: item.popularity,
        voteAverage: item.vote_average
      }))
    });
  } catch (error) {
    console.error('Error searching streaming content:', error);
    res.status(500).json({ error: 'Failed to search content' });
  }
});

/**
 * GET /api/streaming/popular
 * Get popular movies and TV shows
 */
router.get('/popular', async (req, res) => {
  try {
    const { type = 'movie' } = req.query;
    
    let results;
    if (type === 'movie') {
      results = await streamingAPIService.getPopularMovies();
    } else if (type === 'tv') {
      results = await streamingAPIService.getPopularTVShows();
    } else {
      return res.status(400).json({ error: 'Type must be "movie" or "tv"' });
    }
    
    res.json({
      type,
      count: results.length,
      results: results.map(item => ({
        id: item.id,
        title: item.title || item.name,
        type,
        releaseDate: item.release_date || item.first_air_date,
        overview: item.overview,
        posterPath: item.poster_path,
        genres: item.genre_ids,
        popularity: item.popularity,
        voteAverage: item.vote_average
      }))
    });
  } catch (error) {
    console.error('Error getting popular content:', error);
    res.status(500).json({ error: 'Failed to get popular content' });
  }
});

/**
 * GET /api/streaming/genres
 * Get list of genres
 */
router.get('/genres', async (req, res) => {
  try {
    const { type = 'movie' } = req.query;
    const genres = await streamingAPIService.getGenres(type);
    
    res.json({
      type,
      genres
    });
  } catch (error) {
    console.error('Error getting genres:', error);
    res.status(500).json({ error: 'Failed to get genres' });
  }
});

/**
 * GET /api/streaming/details/:id
 * Get detailed information about a specific movie or TV show
 */
router.get('/details/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { type = 'movie' } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'ID parameter is required' });
    }

    const details = await streamingAPIService.getDetails(id, type);
    
    res.json({
      id: details.id,
      title: details.title || details.name,
      type,
      releaseDate: details.release_date || details.first_air_date,
      overview: details.overview,
      posterPath: details.poster_path,
      backdropPath: details.backdrop_path,
      genres: details.genres,
      popularity: details.popularity,
      voteAverage: details.vote_average,
      voteCount: details.vote_count,
      runtime: details.runtime || (details.episode_run_time && details.episode_run_time.length > 0 ? details.episode_run_time[0] : null),
      status: details.status,
      tagline: details.tagline,
      originalLanguage: details.original_language,
      originalTitle: details.original_title || details.original_name
    });
  } catch (error) {
    console.error('Error getting details:', error);
    res.status(500).json({ error: 'Failed to get content details' });
  }
});

module.exports = router;
