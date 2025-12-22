const { fallbackGenres } = require('../services/fallbackData');

/**
 * Swipe Analytics Utility
 * Analyzes swiped movie data to extract preferences and statistics
 */

/**
 * Genre mapping from TMDB genre IDs to genre names
 */
const GENRE_MAP = fallbackGenres.reduce((map, genre) => {
  map[genre.id] = genre.name;
  return map;
}, {});

/**
 * Categorize genre into broader categories for better visualization
 */
function categorizeGenre(genreId) {
  const categories = {
    'Action': [28, 10759], // Action, Action & Adventure
    'Comedy': [35],
    'Drama': [18],
    'Horror': [27],
    'Romance': [10749],
    'Sci-Fi': [878, 10765], // Science Fiction, Sci-Fi & Fantasy
    'Thriller': [53],
    'Animation': [16],
    'Documentary': [99],
    'Fantasy': [14],
    'Adventure': [12],
    'Crime': [80],
    'Mystery': [9648],
    'Family': [10751, 10762], // Family, Kids
    'Other': [] // Default category
  };

  for (const [category, ids] of Object.entries(categories)) {
    if (ids.includes(genreId)) {
      return category;
    }
  }
  
  return 'Other';
}

/**
 * Determine if content is TV show based on genre IDs
 */
function isTVShowGenre(genreId) {
  // TV-specific genre IDs from TMDB
  const tvGenres = [10759, 10762, 10763, 10764, 10765, 10766, 10767, 10768];
  return tvGenres.includes(genreId);
}

/**
 * Analyze user's swiped movies and extract preference statistics
 * @param {Array} swipedMovies - Array of swiped movies with action and genreIds
 * @returns {Object} Analytics object with genre preferences, content type breakdown, etc.
 */
function analyzeSwipePreferences(swipedMovies) {
  if (!swipedMovies || swipedMovies.length === 0) {
    return {
      totalSwipes: 0,
      totalLikes: 0,
      totalDislikes: 0,
      likePercentage: 0,
      genrePreferences: {},
      contentTypeBreakdown: {
        movies: 0,
        tvShows: 0
      },
      topGenres: [],
      recentActivity: {
        last7Days: 0,
        last30Days: 0
      }
    };
  }

  // Filter liked movies only for preference calculation
  const likedMovies = swipedMovies.filter(m => m.action === 'like');
  const dislikedMovies = swipedMovies.filter(m => m.action === 'dislike');

  // Genre preference tracking
  const genreCount = {};
  const genreCategories = {};
  let movieCount = 0;
  let tvShowCount = 0;

  // Analyze liked movies for preferences
  likedMovies.forEach(movie => {
    if (movie.genreIds && Array.isArray(movie.genreIds)) {
      movie.genreIds.forEach(genreId => {
        // Count by specific genre
        const genreName = GENRE_MAP[genreId] || 'Unknown';
        genreCount[genreName] = (genreCount[genreName] || 0) + 1;

        // Count by category
        const category = categorizeGenre(genreId);
        genreCategories[category] = (genreCategories[category] || 0) + 1;

        // Check if TV show
        if (isTVShowGenre(genreId)) {
          tvShowCount++;
        }
      });

      // Count movies (if no TV genre found)
      const hasTVGenre = movie.genreIds.some(id => isTVShowGenre(id));
      if (!hasTVGenre) {
        movieCount++;
      } else {
        tvShowCount++;
      }
    } else {
      // Default to movie if no genre info
      movieCount++;
    }
  });

  // Calculate top genres (sorted by count)
  const sortedGenres = Object.entries(genreCategories)
    .sort((a, b) => b[1] - a[1])
    .map(([genre, count]) => ({
      genre,
      count,
      percentage: Math.round((count / likedMovies.length) * 100)
    }));

  // Calculate recent activity
  const now = Date.now();
  const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

  const recentSwipes = swipedMovies.filter(m => {
    const swipedTime = new Date(m.swipedAt).getTime();
    return swipedTime >= sevenDaysAgo;
  });

  const monthSwipes = swipedMovies.filter(m => {
    const swipedTime = new Date(m.swipedAt).getTime();
    return swipedTime >= thirtyDaysAgo;
  });

  return {
    totalSwipes: swipedMovies.length,
    totalLikes: likedMovies.length,
    totalDislikes: dislikedMovies.length,
    likePercentage: swipedMovies.length > 0 
      ? Math.round((likedMovies.length / swipedMovies.length) * 100) 
      : 0,
    genrePreferences: genreCategories,
    genreDetails: genreCount,
    contentTypeBreakdown: {
      movies: movieCount,
      tvShows: tvShowCount,
      moviePercentage: likedMovies.length > 0 
        ? Math.round((movieCount / likedMovies.length) * 100) 
        : 0,
      tvShowPercentage: likedMovies.length > 0 
        ? Math.round((tvShowCount / likedMovies.length) * 100) 
        : 0
    },
    topGenres: sortedGenres.slice(0, 5), // Top 5 genres
    recentActivity: {
      last7Days: recentSwipes.length,
      last30Days: monthSwipes.length
    },
    lastSwipedAt: swipedMovies.length > 0 
      ? swipedMovies[swipedMovies.length - 1].swipedAt 
      : null
  };
}

/**
 * Get chart data formatted for visualization
 * @param {Object} analytics - Analytics object from analyzeSwipePreferences
 * @returns {Object} Chart-ready data
 */
function getChartData(analytics) {
  // Prepare pie chart data for genres
  const genreChartData = Object.entries(analytics.genrePreferences)
    .map(([genre, count]) => ({
      label: genre,
      value: count,
      percentage: Math.round((count / analytics.totalLikes) * 100)
    }))
    .sort((a, b) => b.value - a.value);

  // Prepare content type chart data
  const contentTypeChartData = [
    {
      label: 'Movies',
      value: analytics.contentTypeBreakdown.movies,
      percentage: analytics.contentTypeBreakdown.moviePercentage
    },
    {
      label: 'TV Shows',
      value: analytics.contentTypeBreakdown.tvShows,
      percentage: analytics.contentTypeBreakdown.tvShowPercentage
    }
  ].filter(item => item.value > 0);

  return {
    genreChart: genreChartData,
    contentTypeChart: contentTypeChartData,
    topGenres: analytics.topGenres
  };
}

/**
 * Get fun insights from swipe data
 * @param {Object} analytics - Analytics object from analyzeSwipePreferences
 * @returns {Array} Array of insight strings
 */
function getSwipeInsights(analytics) {
  const insights = [];

  if (analytics.totalSwipes === 0) {
    return ['Start swiping to see your preferences!'];
  }

  // Like percentage insight
  if (analytics.likePercentage >= 70) {
    insights.push(`You're quite generous! You liked ${analytics.likePercentage}% of movies you swiped on.`);
  } else if (analytics.likePercentage <= 30) {
    insights.push(`You're selective! Only ${analytics.likePercentage}% of movies made the cut.`);
  }

  // Top genre insight
  if (analytics.topGenres.length > 0) {
    const topGenre = analytics.topGenres[0];
    insights.push(`${topGenre.genre} is your go-to genre with ${topGenre.count} liked movies!`);
  }

  // Content type preference
  const { movies, tvShows } = analytics.contentTypeBreakdown;
  if (movies > tvShows * 2) {
    insights.push('You prefer movies over TV shows for quick entertainment!');
  } else if (tvShows > movies * 2) {
    insights.push('You love TV shows! Perfect for binge-watching sessions.');
  } else if (movies > 0 && tvShows > 0) {
    insights.push('You enjoy both movies and TV shows equally!');
  }

  // Recent activity insight
  if (analytics.recentActivity.last7Days > 10) {
    insights.push(`You've been active! ${analytics.recentActivity.last7Days} swipes in the last week.`);
  }

  // Genre diversity insight
  const genreCount = Object.keys(analytics.genrePreferences).length;
  if (genreCount >= 5) {
    insights.push(`You have diverse taste! You enjoy ${genreCount} different genres.`);
  }

  return insights;
}

module.exports = {
  analyzeSwipePreferences,
  getChartData,
  getSwipeInsights,
  GENRE_MAP
};
