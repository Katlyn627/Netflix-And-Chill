const streamingAPIService = require('./streamingAPIService');

/**
 * Recommendation service that suggests new shows/movies to users
 * Based on their watch history and preferences
 */
class RecommendationService {
  /**
   * Get personalized recommendations for a user
   * @param {Object} user 
   * @param {number} limit 
   * @returns {Promise<Array>}
   */
  async getRecommendationsForUser(user, limit = 10) {
    const seenTitles = new Set(user.watchHistory.map(item => item.title.toLowerCase()));

    try {
      // Execute all recommendation strategies in parallel for better performance
      const [trending, genreBasedRecs, watchHistoryRecs] = await Promise.all([
        // Strategy 1: Get trending content
        streamingAPIService.getTrending('all', 'week'),
        
        // Strategy 2: Based on user's favorite genres
        user.preferences.genres && user.preferences.genres.length > 0
          ? this.getRecommendationsByGenres(user.preferences.genres)
          : Promise.resolve([]),
        
        // Strategy 3: Based on watch history (collaborative filtering simulation)
        user.watchHistory.length > 0
          ? this.getRecommendationsByWatchHistory(user.watchHistory)
          : Promise.resolve([])
      ]);

      // Combine and deduplicate recommendations
      const allRecs = [...trending, ...genreBasedRecs, ...watchHistoryRecs];
      const uniqueRecs = this.deduplicateRecommendations(allRecs);

      // Filter out already watched content
      const filtered = uniqueRecs.filter(rec => {
        const title = (rec.title || rec.name || '').toLowerCase();
        return !seenTitles.has(title);
      });

      // Take top recommendations up to limit
      return filtered.slice(0, limit).map(rec => this.formatRecommendation(rec));
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  }

  /**
   * Get recommendations based on user's favorite genres
   * @param {Array<string|Object>} genres - Array of genre names (strings) or genre objects with id/name
   * @returns {Promise<Array>}
   */
  async getRecommendationsByGenres(genres) {
    try {
      // Handle both genre formats: strings and objects with id/name
      let genreIds = [];
      
      // Check if genres are already objects with IDs
      const hasGenreObjects = genres.some(g => typeof g === 'object' && g.id);
      
      if (hasGenreObjects) {
        // Extract IDs directly from genre objects
        genreIds = genres
          .filter(g => typeof g === 'object' && g.id)
          .map(g => g.id);
      } else {
        // Get genre IDs from TMDB (legacy format with genre names as strings)
        // Fetch both movie and TV genres in parallel
        const [movieGenres, tvGenres] = await Promise.all([
          streamingAPIService.getGenres('movie'),
          streamingAPIService.getGenres('tv')
        ]);
        
        const genreMap = {};
        [...movieGenres, ...tvGenres].forEach(g => {
          genreMap[g.name.toLowerCase()] = g.id;
        });

        // Convert user genre preferences to TMDB genre IDs
        genreIds = genres
          .map(g => {
            const genreName = typeof g === 'string' ? g : (g.name || '');
            // Skip empty genre names
            if (!genreName || !genreName.trim()) {
              return undefined;
            }
            return genreMap[genreName.toLowerCase()];
          })
          .filter(id => id !== undefined);
      }

      if (genreIds.length === 0) {
        return [];
      }

      // Discover movies and TV shows with these genres in parallel
      const [movies, tvShows] = await Promise.all([
        streamingAPIService.discover('movie', {
          with_genres: genreIds.join(','),
          sort_by: 'popularity.desc'
        }),
        streamingAPIService.discover('tv', {
          with_genres: genreIds.join(','),
          sort_by: 'popularity.desc'
        })
      ]);

      return [...movies.slice(0, 5), ...tvShows.slice(0, 5)];
    } catch (error) {
      console.error('Error getting genre-based recommendations:', error);
      return [];
    }
  }

  /**
   * Get recommendations based on watch history
   * @param {Array} watchHistory 
   * @returns {Promise<Array>}
   */
  async getRecommendationsByWatchHistory(watchHistory) {
    try {
      // For simplicity, get recommendations from the most recent watched items
      const recentItems = watchHistory.slice(-3);
      
      // Parallelize all API calls to improve performance
      const recommendationPromises = recentItems.map(async (item) => {
        try {
          // Search for the item to get its ID
          const searchResults = await streamingAPIService.search(item.title);
          
          if (searchResults.length > 0) {
            const match = searchResults[0];
            const mediaType = match.media_type || (item.type === 'movie' ? 'movie' : 'tv');
            
            // Get recommendations based on this item
            const recs = await streamingAPIService.getRecommendations(match.id, mediaType);
            return recs.slice(0, 3);
          }
          return [];
        } catch (error) {
          console.error(`Error getting recommendations for ${item.title}:`, error);
          return [];
        }
      });

      // Wait for all promises to resolve and flatten results
      const allRecommendations = await Promise.all(recommendationPromises);
      return allRecommendations.flat();
    } catch (error) {
      console.error('Error getting watch history-based recommendations:', error);
      return [];
    }
  }

  /**
   * Remove duplicate recommendations
   * @param {Array} recommendations 
   * @returns {Array}
   */
  deduplicateRecommendations(recommendations) {
    const seen = new Set();
    const unique = [];

    for (const rec of recommendations) {
      const id = rec.id;
      if (!seen.has(id)) {
        seen.add(id);
        unique.push(rec);
      }
    }

    return unique;
  }

  /**
   * Format recommendation for response
   * @param {Object} rec 
   * @returns {Object}
   */
  formatRecommendation(rec) {
    return {
      id: rec.id,
      title: rec.title || rec.name,
      overview: rec.overview,
      type: rec.media_type || (rec.title ? 'movie' : 'tv'),
      posterPath: streamingAPIService.getImageUrl(rec.poster_path, 'w500'),
      backdropPath: streamingAPIService.getImageUrl(rec.backdrop_path, 'w1280'),
      rating: rec.vote_average,
      releaseDate: rec.release_date || rec.first_air_date,
      genres: rec.genre_ids || []
    };
  }
}

module.exports = new RecommendationService();
