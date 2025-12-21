/**
 * Archetype Content Recommendations
 * Suggests movies and TV shows based on user's personality archetype
 */

/**
 * Content recommendation mappings for each archetype
 * Based on personality traits and viewing preferences
 */
const ARCHETYPE_RECOMMENDATIONS = {
  cinephile: {
    genres: [
      { id: 18, name: 'Drama', priority: 'high' },
      { id: 878, name: 'Science Fiction', priority: 'high' },
      { id: 10749, name: 'Romance', priority: 'medium' },
      { id: 36, name: 'History', priority: 'high' },
      { id: 10752, name: 'War', priority: 'medium' }
    ],
    keywords: [
      'award-winning',
      'critically acclaimed',
      'auteur',
      'arthouse',
      'criterion collection',
      'foreign film',
      'independent',
      'film festival'
    ],
    recommendedDirectors: [
      'Christopher Nolan',
      'Denis Villeneuve',
      'Wes Anderson',
      'Martin Scorsese',
      'Quentin Tarantino',
      'Bong Joon-ho',
      'Greta Gerwig'
    ],
    viewingStyle: 'Appreciates complex narratives, cinematography, and directorial vision',
    contentSuggestions: [
      'Classic cinema from different eras',
      'International films with subtitles',
      'Director retrospectives',
      'Criterion Collection films'
    ]
  },

  casual_viewer: {
    genres: [
      { id: 35, name: 'Comedy', priority: 'high' },
      { id: 28, name: 'Action', priority: 'high' },
      { id: 12, name: 'Adventure', priority: 'medium' },
      { id: 10751, name: 'Family', priority: 'medium' },
      { id: 16, name: 'Animation', priority: 'medium' }
    ],
    keywords: [
      'entertaining',
      'fun',
      'feel-good',
      'blockbuster',
      'popular',
      'mainstream',
      'easy-watching',
      'crowd-pleaser'
    ],
    recommendedDirectors: [
      'Jon Favreau',
      'Shawn Levy',
      'Adam McKay',
      'Paul Feig',
      'Rawson Marshall Thurber'
    ],
    viewingStyle: 'Prefers accessible, entertaining content for relaxation',
    contentSuggestions: [
      'Popular comedies and action films',
      'Feel-good movies',
      'Mainstream blockbusters',
      'Light-hearted series'
    ]
  },

  binge_watcher: {
    genres: [
      { id: 10765, name: 'Sci-Fi & Fantasy', priority: 'high' },
      { id: 18, name: 'Drama', priority: 'high' },
      { id: 9648, name: 'Mystery', priority: 'high' },
      { id: 80, name: 'Crime', priority: 'medium' },
      { id: 10759, name: 'Action & Adventure', priority: 'medium' }
    ],
    keywords: [
      'series',
      'multi-season',
      'episodic',
      'addictive',
      'binge-worthy',
      'cliffhanger',
      'serialized',
      'epic'
    ],
    recommendedDirectors: [
      'Vince Gilligan',
      'Shawn Ryan',
      'David Benioff',
      'Matt Duffer',
      'Dan Harmon'
    ],
    viewingStyle: 'Loves marathon viewing sessions and serialized content',
    contentSuggestions: [
      'Multi-season series with strong narratives',
      'Shows with cliffhanger endings',
      'Complete series for marathoning',
      'Epic film franchises'
    ]
  },

  social_butterfly: {
    genres: [
      { id: 35, name: 'Comedy', priority: 'high' },
      { id: 27, name: 'Horror', priority: 'high' },
      { id: 10770, name: 'TV Movie', priority: 'medium' },
      { id: 10751, name: 'Family', priority: 'medium' },
      { id: 10749, name: 'Romance', priority: 'medium' }
    ],
    keywords: [
      'group-friendly',
      'discussion-worthy',
      'social',
      'reaction-worthy',
      'communal',
      'watch party',
      'interactive',
      'cultural phenomenon'
    ],
    recommendedDirectors: [
      'Jordan Peele',
      'James Wan',
      'Judd Apatow',
      'Ryan Coogler',
      'Greta Gerwig'
    ],
    viewingStyle: 'Enjoys watching and discussing content with others',
    contentSuggestions: [
      'Conversation-starting films',
      'Horror movies for group reactions',
      'Comedies perfect for watch parties',
      'Popular series everyone is talking about'
    ]
  },

  genre_specialist: {
    genres: [
      { id: 28, name: 'Action', priority: 'high' },
      { id: 878, name: 'Science Fiction', priority: 'high' },
      { id: 14, name: 'Fantasy', priority: 'high' },
      { id: 27, name: 'Horror', priority: 'high' },
      { id: 53, name: 'Thriller', priority: 'medium' }
    ],
    keywords: [
      'genre-defining',
      'cult classic',
      'specialized',
      'niche',
      'subgenre',
      'pure genre',
      'genre-bending',
      'franchise'
    ],
    recommendedDirectors: [
      'James Cameron',
      'Ridley Scott',
      'Guillermo del Toro',
      'John Carpenter',
      'David Fincher'
    ],
    viewingStyle: 'Deep dive into specific genres with strong preferences',
    contentSuggestions: [
      'Genre-defining classics',
      'Hidden gems within favorite genres',
      'Complete franchises',
      'Genre retrospectives'
    ]
  },

  critic: {
    genres: [
      { id: 18, name: 'Drama', priority: 'high' },
      { id: 53, name: 'Thriller', priority: 'high' },
      { id: 9648, name: 'Mystery', priority: 'high' },
      { id: 80, name: 'Crime', priority: 'medium' },
      { id: 36, name: 'History', priority: 'medium' }
    ],
    keywords: [
      'analytical',
      'complex',
      'layered',
      'nuanced',
      'thought-provoking',
      'critically acclaimed',
      'technical mastery',
      'symbolism'
    ],
    recommendedDirectors: [
      'Paul Thomas Anderson',
      'David Fincher',
      'Darren Aronofsky',
      'Terrence Malick',
      'Yorgos Lanthimos'
    ],
    viewingStyle: 'Analytical viewer focused on craft, technique, and deeper meanings',
    contentSuggestions: [
      'Films with complex narratives',
      'Movies with strong technical achievements',
      'Content rich in symbolism',
      'Films that reward repeat viewing'
    ]
  },

  collector: {
    genres: [
      { id: 878, name: 'Science Fiction', priority: 'high' },
      { id: 14, name: 'Fantasy', priority: 'high' },
      { id: 28, name: 'Action', priority: 'medium' },
      { id: 16, name: 'Animation', priority: 'medium' },
      { id: 10749, name: 'Romance', priority: 'low' }
    ],
    keywords: [
      'collectible',
      'franchise',
      'special edition',
      'limited release',
      'director\'s cut',
      'box set',
      'remastered',
      'anniversary edition'
    ],
    recommendedDirectors: [
      'Peter Jackson',
      'George Lucas',
      'Hayao Miyazaki',
      'Steven Spielberg',
      'James Cameron'
    ],
    viewingStyle: 'Values ownership, special editions, and physical media',
    contentSuggestions: [
      'Films with special editions',
      'Complete franchise collections',
      'Films with extensive bonus features',
      'Limited or anniversary releases'
    ]
  },

  tech_enthusiast: {
    genres: [
      { id: 878, name: 'Science Fiction', priority: 'high' },
      { id: 28, name: 'Action', priority: 'high' },
      { id: 12, name: 'Adventure', priority: 'medium' },
      { id: 14, name: 'Fantasy', priority: 'medium' },
      { id: 16, name: 'Animation', priority: 'medium' }
    ],
    keywords: [
      'visual effects',
      'CGI',
      'IMAX',
      '4K',
      'HDR',
      'Dolby Atmos',
      'technical achievement',
      'groundbreaking'
    ],
    recommendedDirectors: [
      'Denis Villeneuve',
      'Christopher Nolan',
      'James Cameron',
      'Alfonso Cuarón',
      'Ang Lee'
    ],
    viewingStyle: 'Prioritizes technical quality, effects, and viewing experience',
    contentSuggestions: [
      'Films with groundbreaking visual effects',
      'IMAX-shot films',
      'High-budget spectacles',
      'Technical showcase films'
    ]
  }
};

class ArchetypeRecommendations {
  /**
   * Get content recommendations based on user's archetype
   * @param {Object} user - User object with archetype
   * @returns {Object} Personalized recommendations
   */
  static getRecommendations(user) {
    if (!user.archetype || !user.archetype.type) {
      return this.getGenericRecommendations();
    }

    const archetype = user.archetype.type;
    const config = ARCHETYPE_RECOMMENDATIONS[archetype];

    if (!config) {
      return this.getGenericRecommendations();
    }

    return {
      archetype: {
        type: archetype,
        name: user.archetype.name,
        description: user.archetype.description
      },
      recommendedGenres: config.genres,
      keywords: config.keywords,
      recommendedDirectors: config.recommendedDirectors,
      viewingStyle: config.viewingStyle,
      contentSuggestions: config.contentSuggestions,
      searchQueries: this.generateSearchQueries(config),
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Generate search queries for finding recommended content
   * @param {Object} config - Archetype configuration
   * @returns {Array} Search query suggestions
   */
  static generateSearchQueries(config) {
    const queries = [];

    // Genre-based queries
    config.genres.slice(0, 3).forEach(genre => {
      queries.push({
        type: 'genre',
        query: genre.name,
        description: `Top ${genre.name} films`
      });
    });

    // Keyword-based queries
    config.keywords.slice(0, 2).forEach(keyword => {
      queries.push({
        type: 'keyword',
        query: keyword,
        description: `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} films`
      });
    });

    // Director-based queries
    if (config.recommendedDirectors.length > 0) {
      const director = config.recommendedDirectors[0];
      queries.push({
        type: 'director',
        query: director,
        description: `Films by ${director}`
      });
    }

    return queries;
  }

  /**
   * Get generic recommendations when archetype is unknown
   * @returns {Object}
   */
  static getGenericRecommendations() {
    return {
      archetype: null,
      message: 'Complete the personality quiz to get personalized recommendations!',
      recommendedGenres: [
        { id: 28, name: 'Action', priority: 'medium' },
        { id: 35, name: 'Comedy', priority: 'medium' },
        { id: 18, name: 'Drama', priority: 'medium' },
        { id: 878, name: 'Science Fiction', priority: 'medium' }
      ],
      keywords: ['popular', 'trending', 'highly rated'],
      contentSuggestions: [
        'Popular recent releases',
        'Highly rated classics',
        'Trending series'
      ]
    };
  }

  /**
   * Get recommendations for multiple archetypes (for users with secondary archetypes)
   * @param {Array} archetypes - Array of archetype objects
   * @returns {Object} Combined recommendations
   */
  static getMultiArchetypeRecommendations(archetypes) {
    if (!archetypes || archetypes.length === 0) {
      return this.getGenericRecommendations();
    }

    const allGenres = new Map();
    const allKeywords = new Set();
    const allDirectors = new Set();
    const allSuggestions = new Set();

    archetypes.forEach(archetype => {
      const config = ARCHETYPE_RECOMMENDATIONS[archetype.type];
      if (!config) return;

      // Collect genres with priority weighting
      config.genres.forEach(genre => {
        const existing = allGenres.get(genre.id);
        if (!existing || this.priorityWeight(genre.priority) > this.priorityWeight(existing.priority)) {
          allGenres.set(genre.id, genre);
        }
      });

      // Collect keywords
      config.keywords.forEach(kw => allKeywords.add(kw));

      // Collect directors
      config.recommendedDirectors.forEach(dir => allDirectors.add(dir));

      // Collect suggestions
      config.contentSuggestions.forEach(sug => allSuggestions.add(sug));
    });

    return {
      archetypes: archetypes.map(a => ({
        type: a.type,
        name: a.name,
        strength: a.strength
      })),
      recommendedGenres: Array.from(allGenres.values()).sort((a, b) => 
        this.priorityWeight(b.priority) - this.priorityWeight(a.priority)
      ),
      keywords: Array.from(allKeywords).slice(0, 15),
      recommendedDirectors: Array.from(allDirectors).slice(0, 10),
      contentSuggestions: Array.from(allSuggestions),
      message: 'Recommendations based on your multiple personality archetypes',
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Convert priority label to numeric weight
   * @param {string} priority 
   * @returns {number}
   */
  static priorityWeight(priority) {
    const weights = { high: 3, medium: 2, low: 1 };
    return weights[priority] || 1;
  }

  /**
   * Get genre recommendations as TMDB-compatible format
   * @param {Object} user 
   * @returns {Array} Genre IDs for API queries
   */
  static getGenreIds(user) {
    const recommendations = this.getRecommendations(user);
    return recommendations.recommendedGenres
      .filter(g => g.priority === 'high')
      .map(g => g.id);
  }

  /**
   * Get content for a specific mood based on archetype
   * @param {Object} user 
   * @param {string} mood - 'relaxed', 'excited', 'thoughtful', 'social'
   * @returns {Object} Mood-specific recommendations
   */
  static getMoodBasedRecommendations(user, mood) {
    if (!user.archetype) {
      return { error: 'User archetype not found. Complete the quiz first.' };
    }

    const baseRecommendations = this.getRecommendations(user);
    
    const moodModifiers = {
      relaxed: {
        preferredGenres: ['Comedy', 'Animation', 'Family'],
        keywords: ['feel-good', 'light-hearted', 'comforting']
      },
      excited: {
        preferredGenres: ['Action', 'Adventure', 'Science Fiction'],
        keywords: ['thrilling', 'fast-paced', 'adrenaline']
      },
      thoughtful: {
        preferredGenres: ['Drama', 'Mystery', 'History'],
        keywords: ['thought-provoking', 'complex', 'meaningful']
      },
      social: {
        preferredGenres: ['Comedy', 'Horror', 'Romance'],
        keywords: ['group-friendly', 'discussion-worthy', 'shareable']
      }
    };

    const modifier = moodModifiers[mood] || moodModifiers.relaxed;

    // Filter genres based on mood
    const moodGenres = baseRecommendations.recommendedGenres.filter(g =>
      modifier.preferredGenres.includes(g.name)
    );

    return {
      ...baseRecommendations,
      mood,
      recommendedGenres: moodGenres.length > 0 ? moodGenres : baseRecommendations.recommendedGenres.slice(0, 3),
      keywords: [...modifier.keywords, ...baseRecommendations.keywords.slice(0, 5)],
      moodMessage: `${user.archetype.name} recommendations for a ${mood} mood`
    };
  }

  /**
   * Get all available archetypes and their content preferences
   * @returns {Object} All archetype configurations
   */
  static getAllArchetypes() {
    return Object.keys(ARCHETYPE_RECOMMENDATIONS).map(type => {
      const config = ARCHETYPE_RECOMMENDATIONS[type];
      return {
        type,
        topGenres: config.genres.filter(g => g.priority === 'high').map(g => g.name),
        viewingStyle: config.viewingStyle,
        keyCharacteristics: config.keywords.slice(0, 5)
      };
    });
  }
}

module.exports = ArchetypeRecommendations;
