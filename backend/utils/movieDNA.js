/**
 * Movie DNA Personality Matching System
 *
 * Instead of asking users to pick a few favorites, this system builds a
 * full "Movie DNA" profile across five dimensions:
 *   1. Favorite genres
 *   2. Emotional tone (dark, wholesome, chaotic, romantic)
 *   3. Era preference (80s, 90s, modern, indie)
 *   4. Story archetypes (Enemies-to-Lovers, Underdog, etc.)
 *   5. Character archetypes (antihero, chosen-one, reluctant-hero, etc.)
 *
 * Personality result types:
 *   - Hopeless Romantic Cinephile
 *   - Dark Thriller Intellectual
 *   - Adventure Dreamer
 *   - Indie Film Soul
 *   - Chaotic Comedy Gremlin
 *   - Nostalgic Comfort Seeker
 *   - Epic Fantasy Wanderer
 *   - Gritty Crime Analyst
 */

const EMOTIONAL_TONES = {
  dark: {
    label: 'Dark & Intense',
    emoji: '🌑',
    description: 'Drawn to complex, morally ambiguous stories with weight and consequence'
  },
  wholesome: {
    label: 'Wholesome & Uplifting',
    emoji: '☀️',
    description: 'Loves feel-good moments, warm storytelling, and hopeful endings'
  },
  chaotic: {
    label: 'Chaotic & Unpredictable',
    emoji: '⚡',
    description: 'Thrives on wild twists, genre-blending, and controlled narrative chaos'
  },
  romantic: {
    label: 'Romantic & Emotional',
    emoji: '💕',
    description: 'Connects deeply through love stories, emotional journeys, and heartfelt moments'
  },
  philosophical: {
    label: 'Philosophical & Thought-Provoking',
    emoji: '🧠',
    description: 'Seeks films that challenge assumptions and linger long after the credits roll'
  },
  adventurous: {
    label: 'Adventurous & Epic',
    emoji: '🗺️',
    description: 'Lives for grand journeys, world-building, and the thrill of the unknown'
  }
};

const ERA_PREFERENCES = {
  eighties: { label: '80s Classic', emoji: '📼', decade: 1980 },
  nineties: { label: '90s Nostalgia', emoji: '📀', decade: 1990 },
  twoThousands: { label: '2000s Gold', emoji: '💿', decade: 2000 },
  modern: { label: 'Modern (2010s–Now)', emoji: '📱', decade: 2010 },
  indie: { label: 'Indie & Timeless', emoji: '🎞️', decade: null },
  classic: { label: 'Golden Age Classic', emoji: '🎩', decade: 1950 }
};

const STORY_ARCHETYPES = {
  enemiesToLovers: {
    label: 'Enemies-to-Lovers',
    emoji: '⚔️❤️',
    description: 'The tension, the slow burn, the inevitable collision'
  },
  underdog: {
    label: 'Underdog Rise',
    emoji: '🥊',
    description: 'Against all odds — the little guy wins through grit and heart'
  },
  tragicRomance: {
    label: 'Tragic Romance',
    emoji: '🥀',
    description: 'Love stories that hurt beautifully and stay with you forever'
  },
  foundFamily: {
    label: 'Found Family',
    emoji: '👨‍👩‍👧‍👦',
    description: 'Strangers become chosen family through shared struggle'
  },
  epicAdventure: {
    label: 'Epic Adventure',
    emoji: '🏔️',
    description: 'Grand quests, world-altering stakes, and heroic sacrifice'
  },
  comingOfAge: {
    label: 'Coming of Age',
    emoji: '🌱',
    description: 'The messy, beautiful process of figuring out who you are'
  },
  revengeArc: {
    label: 'Revenge Arc',
    emoji: '🗡️',
    description: 'Wronged heroes seeking justice — or something darker'
  },
  heistCaper: {
    label: 'Heist & Caper',
    emoji: '💼',
    description: 'Elaborate plans, clever twists, and the perfect crew'
  },
  survivorStory: {
    label: 'Survivor Story',
    emoji: '🔥',
    description: 'Pushed to the edge and coming back stronger'
  },
  loveTriangle: {
    label: 'Love Triangle',
    emoji: '💔',
    description: 'Complex hearts, impossible choices, someone always gets hurt'
  }
};

const CHARACTER_ARCHETYPES = {
  antihero: { label: 'Antihero', emoji: '😈', description: 'Morally grey protagonists you root for anyway' },
  chosenOne: { label: 'Chosen One', emoji: '⭐', description: 'Destined heroes carrying the weight of the world' },
  reluctantHero: { label: 'Reluctant Hero', emoji: '🙈', description: 'Ordinary people thrust into extraordinary circumstances' },
  villain: { label: 'Compelling Villain', emoji: '🦹', description: 'Antagonists with understandable — even sympathetic — motivations' },
  mentor: { label: 'Wise Mentor', emoji: '🦉', description: 'Guides who shape the hero without stealing the spotlight' },
  trickster: { label: 'Trickster', emoji: '🃏', description: 'Chaos agents who reveal truth through mischief' }
};

const DNA_PERSONALITY_TYPES = {
  hopelessRomantic: {
    id: 'hopelessRomantic',
    name: 'Hopeless Romantic Cinephile',
    emoji: '💌🎬',
    description: 'You experience films through your heart first. Love stories, tragic romances, and emotional journeys leave you wrecked in the best way.',
    coreTraits: ['romantic tone', 'tragic romance archetype', 'enemies-to-lovers', 'modern / 90s era'],
    compatibleWith: ['nostalgicComfort', 'indieSoul', 'hopelessRomantic'],
    genreAffinity: ['Romance', 'Drama', 'Comedy']
  },
  darkThriller: {
    id: 'darkThriller',
    name: 'Dark Thriller Intellectual',
    emoji: '🕵️🧠',
    description: 'You dissect narratives like puzzles. Moral complexity, psychological depth, and ambiguous endings are your love language.',
    coreTraits: ['dark tone', 'revenge arc', 'antihero characters', 'modern era'],
    compatibleWith: ['darkThriller', 'grittyCrime', 'indieSoul'],
    genreAffinity: ['Thriller', 'Crime', 'Mystery', 'Drama']
  },
  adventureDreamer: {
    id: 'adventureDreamer',
    name: 'Adventure Dreamer',
    emoji: '🗺️✨',
    description: 'The world is not enough. You live for epic quests, found families, and stories that make you believe anything is possible.',
    coreTraits: ['adventurous tone', 'epic adventure archetype', 'found family', 'modern / 2000s era'],
    compatibleWith: ['adventureDreamer', 'epicFantasy', 'chaoticComedy'],
    genreAffinity: ['Action', 'Adventure', 'Fantasy', 'Sci-Fi']
  },
  indieSoul: {
    id: 'indieSoul',
    name: 'Indie Film Soul',
    emoji: '🎞️🌿',
    description: 'You seek the stories no one is talking about yet. Quiet moments, unconventional structures, and raw authenticity move you deeply.',
    coreTraits: ['philosophical tone', 'coming of age', 'indie era', 'reluctant hero'],
    compatibleWith: ['indieSoul', 'darkThriller', 'hopelessRomantic'],
    genreAffinity: ['Indie', 'Drama', 'Documentary', 'Foreign']
  },
  chaoticComedy: {
    id: 'chaoticComedy',
    name: 'Chaotic Comedy Gremlin',
    emoji: '⚡😂',
    description: 'Life is too short for boring films. You need energy, absurdity, clever writing, and moments that make you laugh until you cry.',
    coreTraits: ['chaotic tone', 'trickster characters', 'heist caper', 'modern era'],
    compatibleWith: ['chaoticComedy', 'adventureDreamer', 'nostalgicComfort'],
    genreAffinity: ['Comedy', 'Action Comedy', 'Heist', 'Animated']
  },
  nostalgicComfort: {
    id: 'nostalgicComfort',
    name: 'Nostalgic Comfort Seeker',
    emoji: '📼🕯️',
    description: 'Certain films feel like home. You gravitate toward classics, comfort rewatches, and the warm familiarity of beloved storytelling.',
    coreTraits: ['wholesome tone', '80s / 90s era', 'coming of age', 'found family'],
    compatibleWith: ['nostalgicComfort', 'hopelessRomantic', 'chaoticComedy'],
    genreAffinity: ['Drama', 'Family', 'Romance', 'Comedy']
  },
  epicFantasy: {
    id: 'epicFantasy',
    name: 'Epic Fantasy Wanderer',
    emoji: '🧙🔮',
    description: 'You believe in magic, prophecy, and world-building that transports you completely. The grander the stakes, the better.',
    coreTraits: ['adventurous tone', 'chosen one characters', 'epic adventure', 'found family'],
    compatibleWith: ['epicFantasy', 'adventureDreamer', 'nostalgicComfort'],
    genreAffinity: ['Fantasy', 'Sci-Fi', 'Adventure', 'Animation']
  },
  grittyCrime: {
    id: 'grittyCrime',
    name: 'Gritty Crime Analyst',
    emoji: '🚬🔍',
    description: 'You respect craft. Heists, procedurals, morally bankrupt antiheroes — you understand that the most human stories often live in the darkest places.',
    coreTraits: ['dark tone', 'heist caper', 'antihero', 'modern era'],
    compatibleWith: ['grittyCrime', 'darkThriller', 'indieSoul'],
    genreAffinity: ['Crime', 'Thriller', 'Drama', 'Mystery']
  }
};

/**
 * Build a Movie DNA profile for a user based on their preferences and history.
 * @param {Object} user
 * @returns {Object} movieDNA profile
 */
function buildMovieDNA(user) {
  const toneScores = { dark: 0, wholesome: 0, chaotic: 0, romantic: 0, philosophical: 0, adventurous: 0 };
  const eraScores = { eighties: 0, nineties: 0, twoThousands: 0, modern: 0, indie: 0, classic: 0 };
  const storyScores = {};
  Object.keys(STORY_ARCHETYPES).forEach(k => { storyScores[k] = 0; });
  const characterScores = {};
  Object.keys(CHARACTER_ARCHETYPES).forEach(k => { characterScores[k] = 0; });

  // Pull from user's explicit movieDNA field if already set
  const explicit = user.movieDNA || {};

  // Emotional tone from explicit prefs
  if (explicit.emotionalTone) {
    explicit.emotionalTone.forEach(tone => {
      if (toneScores[tone] !== undefined) toneScores[tone] += 30;
    });
  }

  // Era preferences from explicit prefs
  if (explicit.eraPreference) {
    explicit.eraPreference.forEach(era => {
      if (eraScores[era] !== undefined) eraScores[era] += 30;
    });
  }

  // Story archetypes from explicit prefs
  if (explicit.storyArchetypes) {
    explicit.storyArchetypes.forEach(arch => {
      if (storyScores[arch] !== undefined) storyScores[arch] += 30;
    });
  }

  // Character archetypes from explicit prefs
  if (explicit.characterArchetypes) {
    explicit.characterArchetypes.forEach(ch => {
      if (characterScores[ch] !== undefined) characterScores[ch] += 30;
    });
  }

  // Derive from genre preferences
  const genres = (user.preferences?.genres || []).map(g => g.toLowerCase());

  const genreToneMap = {
    romance: 'romantic', drama: 'dark', thriller: 'dark', horror: 'dark',
    comedy: 'chaotic', action: 'adventurous', adventure: 'adventurous',
    fantasy: 'adventurous', 'sci-fi': 'chaotic', documentary: 'philosophical',
    indie: 'philosophical', foreign: 'philosophical', family: 'wholesome',
    animation: 'wholesome', musical: 'romantic', mystery: 'dark', crime: 'dark'
  };

  const genreArchetypeMap = {
    romance: 'enemiesToLovers', drama: 'comingOfAge', thriller: 'revengeArc',
    action: 'epicAdventure', adventure: 'epicAdventure', fantasy: 'epicAdventure',
    comedy: 'heistCaper', crime: 'heistCaper', family: 'foundFamily',
    horror: 'survivorStory', mystery: 'revengeArc', indie: 'comingOfAge'
  };

  genres.forEach(genre => {
    if (genreToneMap[genre]) toneScores[genreToneMap[genre]] += 10;
    if (genreArchetypeMap[genre]) storyScores[genreArchetypeMap[genre]] += 10;
  });

  // Derive from swipe preferences
  const swipePrefs = user.swipePreferences || {};
  const topGenres = swipePrefs.topGenres || [];
  topGenres.forEach(genre => {
    const g = (genre.name || genre).toLowerCase();
    if (genreToneMap[g]) toneScores[genreToneMap[g]] += 8;
    if (genreArchetypeMap[g]) storyScores[genreArchetypeMap[g]] += 8;
  });

  // Red flag movies signal character preferences
  const redFlags = user.redFlagMovies || [];
  if (redFlags.length) characterScores.antihero += 5; // Users who know what they DON'T like are self-aware

  // Scene that made me cry signals emotional depth → romantic/dark tone
  if (user.sceneThatMadeMeCry?.scene) {
    toneScores.romantic += 10;
    toneScores.dark += 5;
    storyScores.tragicRomance += 10;
  }

  // Favorite directors signal era + tone
  const directors = user.favoriteDirectors || [];
  const directorSignals = {
    'Christopher Nolan': { tone: 'philosophical', era: 'modern' },
    'Quentin Tarantino': { tone: 'chaotic', era: 'modern' },
    'Greta Gerwig': { tone: 'wholesome', era: 'modern' },
    'Wes Anderson': { tone: 'chaotic', era: 'modern' },
    'Steven Spielberg': { tone: 'adventurous', era: 'eighties' },
    'Martin Scorsese': { tone: 'dark', era: 'modern' },
    'Sofia Coppola': { tone: 'philosophical', era: 'twoThousands' },
    'David Fincher': { tone: 'dark', era: 'modern' },
    'Wong Kar-wai': { tone: 'romantic', era: 'nineties' },
    'Stanley Kubrick': { tone: 'philosophical', era: 'classic' }
  };

  directors.forEach(director => {
    const sig = directorSignals[director];
    if (sig) {
      toneScores[sig.tone] = (toneScores[sig.tone] || 0) + 12;
      eraScores[sig.era] = (eraScores[sig.era] || 0) + 12;
    }
  });

  // Determine top tone
  const dominantTone = Object.entries(toneScores).sort((a, b) => b[1] - a[1])[0][0];
  const secondaryTone = Object.entries(toneScores).sort((a, b) => b[1] - a[1])[1][0];

  // Determine top era
  const dominantEra = Object.entries(eraScores).sort((a, b) => b[1] - a[1])[0][0];

  // Top story archetypes (up to 3)
  const topStoryArchetypes = Object.entries(storyScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .filter(([, score]) => score > 0)
    .map(([key]) => key);

  // Top character archetypes (up to 2)
  const topCharacterArchetypes = Object.entries(characterScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .filter(([, score]) => score > 0)
    .map(([key]) => key);

  // Map dimensions to personality type
  const personalityType = _determinePersonalityType(dominantTone, secondaryTone, topStoryArchetypes, dominantEra, genres);

  return {
    personalityType,
    personalityInfo: DNA_PERSONALITY_TYPES[personalityType],
    dimensions: {
      emotionalTone: { dominant: dominantTone, secondary: secondaryTone, scores: toneScores },
      era: { dominant: dominantEra, scores: eraScores },
      storyArchetypes: topStoryArchetypes,
      characterArchetypes: topCharacterArchetypes,
      favoriteGenres: genres.slice(0, 5)
    },
    generatedAt: new Date().toISOString()
  };
}

/**
 * Internal: map dimension scores to a personality type ID.
 */
function _determinePersonalityType(dominantTone, secondaryTone, storyArchetypes, era, genres) {
  const toneTypeMap = {
    romantic: 'hopelessRomantic',
    dark: 'darkThriller',
    adventurous: 'adventureDreamer',
    philosophical: 'indieSoul',
    chaotic: 'chaoticComedy',
    wholesome: 'nostalgicComfort'
  };

  // Override by story archetypes
  if (storyArchetypes.includes('epicAdventure') && (dominantTone === 'adventurous' || secondaryTone === 'adventurous')) {
    return genres.includes('fantasy') || genres.includes('sci-fi') ? 'epicFantasy' : 'adventureDreamer';
  }
  if (storyArchetypes.includes('heistCaper') || storyArchetypes.includes('revengeArc')) {
    if (dominantTone === 'dark') return 'grittyCrime';
  }
  if (storyArchetypes.includes('foundFamily') && (era === 'eighties' || era === 'nineties')) {
    return 'nostalgicComfort';
  }

  return toneTypeMap[dominantTone] || 'indieSoul';
}

/**
 * Calculate DNA compatibility between two users.
 * Matches are based on emotional storytelling compatibility, not just shared titles.
 * @param {Object} dna1 - buildMovieDNA result for user1
 * @param {Object} dna2 - buildMovieDNA result for user2
 * @returns {Object} { score: 0-100, reason: string, dimensions: {} }
 */
function calculateDNACompatibility(dna1, dna2) {
  let score = 0;
  const breakdown = {};

  // 1. Personality type direct match (30 pts max)
  const type1 = dna1.personalityType;
  const type2 = dna2.personalityType;
  const p1Info = DNA_PERSONALITY_TYPES[type1];
  const p2Info = DNA_PERSONALITY_TYPES[type2];

  if (type1 === type2) {
    score += 30;
    breakdown.personalityMatch = 30;
  } else if (p1Info?.compatibleWith?.includes(type2) || p2Info?.compatibleWith?.includes(type1)) {
    score += 22;
    breakdown.personalityMatch = 22;
  } else {
    score += 8;
    breakdown.personalityMatch = 8;
  }

  // 2. Emotional tone compatibility (25 pts max)
  const tone1 = dna1.dimensions?.emotionalTone;
  const tone2 = dna2.dimensions?.emotionalTone;
  if (tone1 && tone2) {
    let toneScore = 0;
    if (tone1.dominant === tone2.dominant) toneScore += 25;
    else if (tone1.dominant === tone2.secondary || tone1.secondary === tone2.dominant) toneScore += 15;
    else toneScore += 5;
    score += toneScore;
    breakdown.emotionalTone = toneScore;
  }

  // 3. Story archetype overlap (20 pts max)
  const archs1 = new Set(dna1.dimensions?.storyArchetypes || []);
  const archs2 = new Set(dna2.dimensions?.storyArchetypes || []);
  const archOverlap = [...archs1].filter(a => archs2.has(a)).length;
  const archScore = Math.min(20, archOverlap * 7);
  score += archScore;
  breakdown.storyArchetypes = archScore;

  // 4. Era preference (15 pts max)
  const era1 = dna1.dimensions?.era?.dominant;
  const era2 = dna2.dimensions?.era?.dominant;
  if (era1 && era2) {
    const eraScore = era1 === era2 ? 15 : era1 === 'indie' || era2 === 'indie' ? 10 : 5;
    score += eraScore;
    breakdown.era = eraScore;
  }

  // 5. Genre affinity overlap (10 pts max)
  const genres1 = new Set((dna1.dimensions?.favoriteGenres || []).map(g => g.toLowerCase()));
  const genres2 = new Set((dna2.dimensions?.favoriteGenres || []).map(g => g.toLowerCase()));
  const genreOverlap = [...genres1].filter(g => genres2.has(g)).length;
  const genreScore = Math.min(10, genreOverlap * 3);
  score += genreScore;
  breakdown.genreAffinity = genreScore;

  const finalScore = Math.min(100, Math.round(score));

  const reason = _buildCompatibilityReason(type1, type2, tone1?.dominant, tone2?.dominant, archOverlap);

  return { score: finalScore, reason, breakdown };
}

function _buildCompatibilityReason(type1, type2, tone1, tone2, archOverlap) {
  if (type1 === type2) return `You share the same Movie DNA — ${DNA_PERSONALITY_TYPES[type1]?.name}. Rare and powerful.`;
  if (archOverlap >= 2) return "You love the same kinds of stories. That's emotional storytelling compatibility.";
  if (tone1 === tone2) return `You both feel movies the same way — through a ${tone1} lens. That's a deep connection.`;
  return "Different DNA types that complement each other — you'll discover new favorites together.";
}

module.exports = {
  EMOTIONAL_TONES,
  ERA_PREFERENCES,
  STORY_ARCHETYPES,
  CHARACTER_ARCHETYPES,
  DNA_PERSONALITY_TYPES,
  buildMovieDNA,
  calculateDNACompatibility
};
