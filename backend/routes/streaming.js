const express = require('express');
const router = express.Router();
const streamingAPIService = require('../services/streamingAPIService');
const watchmodeAPIService = require('../services/watchmodeAPIService');

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
    const { type } = req.query;
    
    let genres;
    if (type && (type === 'movie' || type === 'tv')) {
      genres = await streamingAPIService.getGenres(type);
      res.json({
        type,
        genres
      });
    } else {
      // Get all genres (both movie and TV)
      genres = await streamingAPIService.getAllGenres();
      res.json({
        type: 'all',
        genres
      });
    }
  } catch (error) {
    console.error('Error getting genres:', error);
    res.status(500).json({ error: 'Failed to get genres' });
  }
});

/**
 * GET /api/streaming/providers
 * Get list of available streaming providers
 */
router.get('/providers', async (req, res) => {
  try {
    const { region = 'US' } = req.query;
    const providers = await streamingAPIService.getStreamingProviders(region);
    
    // Format the providers with logo URLs
    const formattedProviders = providers.map(provider => ({
      id: provider.provider_id || provider.id,
      name: provider.provider_name || provider.name,
      logoPath: provider.logo_path || provider.logoPath,
      logoUrl: provider.logo_path ? streamingAPIService.getLogoUrl(provider.logo_path) : provider.logoUrl,
      displayPriority: provider.display_priority || provider.displayPriority
    })).sort((a, b) => a.displayPriority - b.displayPriority);
    
    res.json({
      region,
      count: formattedProviders.length,
      providers: formattedProviders
    });
  } catch (error) {
    console.error('Error getting streaming providers:', error);
    res.status(500).json({ error: 'Failed to get streaming providers' });
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

/**
 * GET /api/streaming/availability/:id
 * Get streaming platform availability for a specific movie or TV show
 */
router.get('/availability/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { type = 'movie', region = 'US' } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'ID parameter is required' });
    }

    const availability = await watchmodeAPIService.getStreamingAvailability(
      parseInt(id),
      type,
      region
    );
    
    res.json({
      tmdbId: parseInt(id),
      type,
      region,
      ...availability
    });
  } catch (error) {
    console.error('Error getting streaming availability:', error);
    res.status(500).json({ 
      error: 'Failed to get streaming availability',
      available: false,
      sources: { subscription: [], free: [], rent: [], buy: [] }
    });
  }
});

/**
 * GET /api/streaming/services
 * Get list of available streaming services in a region
 */
router.get('/services', async (req, res) => {
  try {
    const { region = 'US' } = req.query;
    
    const services = await watchmodeAPIService.getStreamingServices(region);
    
    res.json({
      region,
      count: services.length,
      services
    });
  } catch (error) {
    console.error('Error getting streaming services:', error);
    res.status(500).json({ error: 'Failed to get streaming services' });
  }
});

module.exports = router;
