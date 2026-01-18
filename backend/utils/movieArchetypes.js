/**
 * Movie Personality Archetypes System
 * Categorizes users based on their viewing patterns and preferences
 */

const ARCHETYPES = {
  BINGE_WARRIOR: {
    name: 'Binge Warrior',
    emoji: '🎯',
    description: 'Masters of marathon viewing who can finish entire seasons in a weekend',
    traits: ['High episode count', 'Long viewing sessions', 'Fast completion rate'],
    compatibility: ['BINGE_WARRIOR', 'LOYAL_FAN', 'GENRE_EXPLORER']
  },
  CASUAL_VIEWER: {
    name: 'Casual Viewer',
    emoji: '🌙',
    description: 'Enjoys watching at their own pace, one or two episodes at a time',
    traits: ['Moderate viewing frequency', 'Balanced content consumption', 'Diverse interests'],
    compatibility: ['CASUAL_VIEWER', 'CRITIC', 'COMFORT_WATCHER']
  },
  CRITIC: {
    name: 'The Critic',
    emoji: '🎭',
    description: 'Appreciates quality over quantity, seeking thought-provoking content',
    traits: ['Selective choices', 'High-rated content', 'Documentary and film preference'],
    compatibility: ['CRITIC', 'INDIE_LOVER', 'CASUAL_VIEWER']
  },
  GENRE_EXPLORER: {
    name: 'Genre Explorer',
    emoji: '🗺️',
    description: 'Adventurous viewer who loves discovering new genres and styles',
    traits: ['Wide genre variety', 'International content', 'Experimental choices'],
    compatibility: ['GENRE_EXPLORER', 'INDIE_LOVER', 'BINGE_WARRIOR']
  },
  COMFORT_WATCHER: {
    name: 'Comfort Watcher',
    emoji: '☕',
    description: 'Rewatches favorites and seeks familiar, cozy content',
    traits: ['Rewatches favorites', 'Feel-good content', 'Nostalgic choices'],
    compatibility: ['COMFORT_WATCHER', 'CASUAL_VIEWER', 'LOYAL_FAN']
  },
  LOYAL_FAN: {
    name: 'Loyal Fan',
    emoji: '⭐',
    description: 'Dedicates to specific franchises, actors, or directors',
    traits: ['Franchise completion', 'Actor/director following', 'Deep knowledge'],
    compatibility: ['LOYAL_FAN', 'BINGE_WARRIOR', 'GENRE_EXPLORER']
  },
  INDIE_LOVER: {
    name: 'Indie Lover',
    emoji: '🎬',
    description: 'Seeks hidden gems and independent productions',
    traits: ['Obscure content', 'Festival films', 'Unique storytelling'],
    compatibility: ['INDIE_LOVER', 'CRITIC', 'GENRE_EXPLORER']
  },
  TREND_SURFER: {
    name: 'Trend Surfer',
    emoji: '🌊',
    description: 'Always watching what\'s trending and currently popular',
    traits: ['Popular content', 'Social media influenced', 'Current releases'],
    compatibility: ['TREND_SURFER', 'BINGE_WARRIOR', 'GENRE_EXPLORER']
  }
};

/**
 * Determine user's archetype based on viewing patterns
 * @param {Object} user - User object with watch history and preferences
 * @returns {Object} - Archetype with score
 */
function determineArchetype(user) {
  const scores = {};
  
  // Initialize scores
  Object.keys(ARCHETYPES).forEach(key => {
    scores[key] = 0;
  });

  // Analyze binge patterns
  const bingeCount = user.preferences?.bingeCount || 0;
  if (bingeCount >= 5) {
    scores.BINGE_WARRIOR += 30;
  } else if (bingeCount >= 3) {
    scores.CASUAL_VIEWER += 20;
  } else {
    scores.CASUAL_VIEWER += 10;
    scores.CRITIC += 10;
  }

  // Analyze watch history diversity
  const watchHistory = user.watchHistory || [];
  const uniqueGenres = new Set(
    watchHistory
      .filter(item => item.genres)
      .flatMap(item => item.genres)
  );

  if (uniqueGenres.size >= 8) {
    scores.GENRE_EXPLORER += 25;
  } else if (uniqueGenres.size >= 5) {
    scores.CASUAL_VIEWER += 15;
  } else if (uniqueGenres.size <= 3) {
    scores.LOYAL_FAN += 20;
    scores.COMFORT_WATCHER += 15;
  }

  // Analyze genre preferences
  const genres = user.preferences?.genres || [];
  const genreMap = {
    'Documentary': 'CRITIC',
    'Drama': 'CRITIC',
    'Foreign': 'INDIE_LOVER',
    'Independent': 'INDIE_LOVER',
    'Romance': 'COMFORT_WATCHER',
    'Comedy': 'COMFORT_WATCHER',
    'Action': 'TREND_SURFER',
    'Thriller': 'GENRE_EXPLORER'
  };

  genres.forEach(genre => {
    if (genreMap[genre]) {
      scores[genreMap[genre]] += 15;
    }
  });

  // Analyze watch history size
  if (watchHistory.length > 50) {
    scores.BINGE_WARRIOR += 20;
    scores.GENRE_EXPLORER += 10;
  } else if (watchHistory.length > 30) {
    scores.LOYAL_FAN += 15;
  } else if (watchHistory.length > 10) {
    scores.CASUAL_VIEWER += 15;
  }

  // Analyze content types
  const hasRewatches = watchHistory.some(item => item.rewatch);
  if (hasRewatches) {
    scores.COMFORT_WATCHER += 25;
  }

  // Find the archetype with highest score
  let topArchetype = 'CASUAL_VIEWER';
  let topScore = scores[topArchetype];

  Object.entries(scores).forEach(([archetype, score]) => {
    if (score > topScore) {
      topArchetype = archetype;
      topScore = score;
    }
  });

  // Get secondary archetype
  const sortedScores = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2);

  return {
    primary: {
      type: topArchetype,
      ...ARCHETYPES[topArchetype],
      score: topScore
    },
    secondary: sortedScores.length > 1 ? {
      type: sortedScores[1][0],
      ...ARCHETYPES[sortedScores[1][0]],
      score: sortedScores[1][1]
    } : null,
    allScores: scores
  };
}

/**
 * Calculate archetype compatibility between two users
 * @param {string} archetype1 - First user's archetype
 * @param {string} archetype2 - Second user's archetype
 * @returns {number} - Compatibility score (0-100)
 */
function calculateArchetypeCompatibility(archetype1, archetype2) {
  const arch1 = ARCHETYPES[archetype1];
  const arch2 = ARCHETYPES[archetype2];

  if (!arch1 || !arch2) return 50; // Default neutral score

  // Same archetype = very compatible
  if (archetype1 === archetype2) {
    return 95;
  }

  // Check if archetypes are in each other's compatibility list
  if (arch1.compatibility.includes(archetype2)) {
    return 85;
  }

  // Partial compatibility based on traits overlap
  return 60;
}

/**
 * Get archetype recommendations for better matches
 * @param {string} archetype - User's archetype
 * @returns {Array} - Recommended archetypes to match with
 */
function getArchetypeRecommendations(archetype) {
  const arch = ARCHETYPES[archetype];
  if (!arch) return [];

  return arch.compatibility.map(compatType => ({
    type: compatType,
    ...ARCHETYPES[compatType]
  }));
}

module.exports = {
  ARCHETYPES,
  determineArchetype,
  calculateArchetypeCompatibility,
  getArchetypeRecommendations
};
