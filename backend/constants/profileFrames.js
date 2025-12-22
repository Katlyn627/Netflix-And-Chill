/**
 * Profile Frame Configuration
 * Defines visual themes and color palettes for each movie personality archetype
 * Based on archetype characteristics and viewing preferences
 */

const PROFILE_FRAME_THEMES = {
  cinephile: {
    name: 'The Cinephile',
    description: 'Vintage elegance meets artistic appreciation',
    colors: {
      primary: '#D4AF37',      // Gold
      secondary: '#000000',     // Black
      accent: '#8B7355',        // Vintage brown
      gradient: 'linear-gradient(135deg, #D4AF37 0%, #8B7355 50%, #000000 100%)'
    },
    borderStyle: {
      width: '6px',
      style: 'solid',
      pattern: 'double'         // Classic double border for sophistication
    },
    icon: '🎬',
    traits: ['Artistic', 'Cultured', 'Analytical']
  },

  casual_viewer: {
    name: 'The Casual Viewer',
    description: 'Light and breezy entertainment vibes',
    colors: {
      primary: '#87CEEB',       // Sky blue (pastel)
      secondary: '#98FB98',     // Pale green
      accent: '#B0E0E6',        // Powder blue
      gradient: 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)'
    },
    borderStyle: {
      width: '4px',
      style: 'solid',
      pattern: 'rounded'        // Friendly, approachable rounded borders
    },
    icon: '🍿',
    traits: ['Relaxed', 'Easy-going', 'Fun-loving']
  },

  binge_watcher: {
    name: 'The Binge Watcher',
    description: 'Vibrant energy for marathon sessions',
    colors: {
      primary: '#9D4EDD',       // Neon purple
      secondary: '#FF6B35',     // Vibrant orange
      accent: '#F72585',        // Hot pink
      gradient: 'linear-gradient(135deg, #9D4EDD 0%, #F72585 50%, #FF6B35 100%)'
    },
    borderStyle: {
      width: '5px',
      style: 'solid',
      pattern: 'animated'       // Dynamic animated border for energy
    },
    icon: '📺',
    traits: ['Dedicated', 'Immersive', 'Passionate']
  },

  social_butterfly: {
    name: 'The Social Butterfly',
    description: 'Bright and engaging social vibes',
    colors: {
      primary: '#FFD700',       // Bright yellow
      secondary: '#FF69B4',     // Hot pink
      accent: '#FF8C00',        // Dark orange
      gradient: 'linear-gradient(135deg, #FFD700 0%, #FF69B4 100%)'
    },
    borderStyle: {
      width: '5px',
      style: 'solid',
      pattern: 'dotted-accent'  // Playful dotted accents
    },
    icon: '🎉',
    traits: ['Outgoing', 'Enthusiastic', 'Collaborative']
  },

  genre_specialist: {
    name: 'The Genre Specialist',
    description: 'Bold and focused genre expertise',
    colors: {
      primary: '#8B0000',       // Dark red
      secondary: '#006400',     // Dark green
      accent: '#2F4F4F',        // Dark slate gray (monotone)
      gradient: 'linear-gradient(135deg, #8B0000 0%, #2F4F4F 50%, #006400 100%)'
    },
    borderStyle: {
      width: '5px',
      style: 'solid',
      pattern: 'geometric'      // Sharp geometric patterns
    },
    icon: '🎯',
    traits: ['Focused', 'Expert', 'Discerning']
  },

  critic: {
    name: 'The Critic',
    description: 'Sophisticated minimalist aesthetic',
    colors: {
      primary: '#000000',       // Black
      secondary: '#FFFFFF',     // White
      accent: '#696969',        // Dim gray (muted)
      gradient: 'linear-gradient(135deg, #000000 0%, #696969 50%, #FFFFFF 100%)'
    },
    borderStyle: {
      width: '4px',
      style: 'solid',
      pattern: 'minimal'        // Clean, minimal lines
    },
    icon: '📝',
    traits: ['Analytical', 'Thoughtful', 'Detail-oriented']
  },

  collector: {
    name: 'The Collector',
    description: 'Nostalgic warmth and timeless appeal',
    colors: {
      primary: '#704214',       // Sepia brown
      secondary: '#DEB887',     // Burlywood (earthy)
      accent: '#8B4513',        // Saddle brown
      gradient: 'linear-gradient(135deg, #704214 0%, #DEB887 50%, #8B4513 100%)'
    },
    borderStyle: {
      width: '6px',
      style: 'double',
      pattern: 'vintage'        // Vintage ornamental style
    },
    icon: '📀',
    traits: ['Nostalgic', 'Passionate', 'Curator']
  },

  tech_enthusiast: {
    name: 'The Tech Enthusiast',
    description: 'Sleek futuristic innovation',
    colors: {
      primary: '#00CED1',       // Dark turquoise (cyan)
      secondary: '#C0C0C0',     // Silver
      accent: '#4682B4',        // Steel blue
      gradient: 'linear-gradient(135deg, #C0C0C0 0%, #00CED1 50%, #4682B4 100%)'
    },
    borderStyle: {
      width: '4px',
      style: 'solid',
      pattern: 'tech'           // Modern tech-inspired design
    },
    icon: '🚀',
    traits: ['Innovative', 'Quality-focused', 'Forward-thinking']
  }
};

/**
 * Get frame theme configuration for a specific archetype
 * @param {string} archetypeType - The archetype type key
 * @returns {Object|null} Frame theme configuration or null if not found
 */
function getFrameTheme(archetypeType) {
  if (!archetypeType) return null;
  return PROFILE_FRAME_THEMES[archetypeType] || null;
}

/**
 * Get all available frame themes
 * @returns {Object} All frame theme configurations
 */
function getAllFrameThemes() {
  return PROFILE_FRAME_THEMES;
}

/**
 * Get frame themes as an array with archetype type included
 * @returns {Array} Array of frame theme objects
 */
function getFrameThemesArray() {
  return Object.keys(PROFILE_FRAME_THEMES).map(type => ({
    type,
    ...PROFILE_FRAME_THEMES[type]
  }));
}

/**
 * Validate if an archetype type has a frame theme
 * @param {string} archetypeType - The archetype type to check
 * @returns {boolean} True if theme exists
 */
function hasFrameTheme(archetypeType) {
  return archetypeType && PROFILE_FRAME_THEMES.hasOwnProperty(archetypeType);
}

module.exports = {
  PROFILE_FRAME_THEMES,
  getFrameTheme,
  getAllFrameThemes,
  getFrameThemesArray,
  hasFrameTheme
};
