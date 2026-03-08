/**
 * Story-Based Movie Archetypes
 *
 * Replaces the old viewing-habit archetypes with story archetypes that
 * tap into psychological attraction patterns. Matching is done by the kinds
 * of stories people love, not how often they watch.
 *
 * Story archetypes:
 *   Enemies-to-Lovers, Underdog, Tragic Romance, Found Family,
 *   Epic Adventures, Coming of Age, Revenge Arc, Heist & Caper,
 *   Survivor Story, Love Triangle
 *
 * Director Compatibility signatures:
 *   Christopher Nolan, Quentin Tarantino, Greta Gerwig, Wes Anderson, etc.
 */

const STORY_ARCHETYPES = {
  enemiesToLovers: {
    id: 'enemiesToLovers',
    name: 'Enemies-to-Lovers',
    emoji: '⚔️❤️',
    description: 'The tension, the slow burn, the inevitable collision of opposites who belong together',
    psychologicalAppeal: 'Desire for passionate, transformative connection',
    exampleFilms: ['Pride & Prejudice', 'Taming of the Shrew', 'About Time'],
    compatibleWith: ['tragicRomance', 'loveTriangle', 'comingOfAge']
  },
  underdog: {
    id: 'underdog',
    name: 'Underdog Rise',
    emoji: '🥊',
    description: 'Against all odds — the overlooked hero wins through grit, heart, and belief in themselves',
    psychologicalAppeal: 'Hope, resilience, and the triumph of the human spirit',
    exampleFilms: ['Rocky', 'The Pursuit of Happyness', 'Billy Elliot'],
    compatibleWith: ['survivorStory', 'comingOfAge', 'foundFamily']
  },
  tragicRomance: {
    id: 'tragicRomance',
    name: 'Tragic Romance',
    emoji: '🥀',
    description: 'Love stories that hurt beautifully and stay with you long after the credits roll',
    psychologicalAppeal: 'Deep emotional investment and the beauty of impermanence',
    exampleFilms: ['La La Land', 'Brokeback Mountain', 'Atonement'],
    compatibleWith: ['enemiesToLovers', 'loveTriangle', 'comingOfAge']
  },
  foundFamily: {
    id: 'foundFamily',
    name: 'Found Family',
    emoji: '👨‍👩‍👧‍👦',
    description: "Unlikely strangers become each other's chosen family through shared struggle and love",
    psychologicalAppeal: 'Belonging, acceptance, and the family we choose',
    exampleFilms: ['The Breakfast Club', 'Guardians of the Galaxy', 'Stand By Me'],
    compatibleWith: ['underdog', 'epicAdventure', 'survivorStory']
  },
  epicAdventure: {
    id: 'epicAdventure',
    name: 'Epic Adventure',
    emoji: '🏔️',
    description: 'Grand quests, world-altering stakes, and heroes who discover themselves through the journey',
    psychologicalAppeal: 'Freedom, exploration, and the belief that the world is bigger than we know',
    exampleFilms: ['The Lord of the Rings', 'Mad Max: Fury Road', 'Lawrence of Arabia'],
    compatibleWith: ['foundFamily', 'survivorStory', 'underdog']
  },
  comingOfAge: {
    id: 'comingOfAge',
    name: 'Coming of Age',
    emoji: '🌱',
    description: 'The messy, beautiful, irreversible process of figuring out who you truly are',
    psychologicalAppeal: 'Nostalgia, identity formation, and the universal experience of growing',
    exampleFilms: ['Boyhood', 'Lady Bird', 'The Perks of Being a Wallflower'],
    compatibleWith: ['enemiesToLovers', 'foundFamily', 'underdog']
  },
  revengeArc: {
    id: 'revengeArc',
    name: 'Revenge Arc',
    emoji: '🗡️',
    description: 'Wronged heroes — or antiheroes — seeking justice, satisfaction, or something far darker',
    psychologicalAppeal: 'Catharsis, justice, and the moral complexity of retribution',
    exampleFilms: ['Kill Bill', 'Oldboy', 'True Grit'],
    compatibleWith: ['survivorStory', 'underdog', 'heistCaper']
  },
  heistCaper: {
    id: 'heistCaper',
    name: 'Heist & Caper',
    emoji: '💼',
    description: 'Elaborate plans, impossible odds, clever reveals, and the perfect crew assembled for one job',
    psychologicalAppeal: 'Intelligence, collaboration, and the joy of watching genius plans unfold',
    exampleFilms: ["Ocean's Eleven", 'Heat', 'Baby Driver'],
    compatibleWith: ['revengeArc', 'foundFamily', 'comingOfAge']
  },
  survivorStory: {
    id: 'survivorStory',
    name: 'Survivor Story',
    emoji: '🔥',
    description: 'Pushed to the absolute edge of human endurance — and the fire that remains after',
    psychologicalAppeal: 'Resilience, adaptability, and the raw power of the will to live',
    exampleFilms: ['Cast Away', '127 Hours', 'The Martian'],
    compatibleWith: ['underdog', 'foundFamily', 'revengeArc']
  },
  loveTriangle: {
    id: 'loveTriangle',
    name: 'Love Triangle',
    emoji: '💔',
    description: 'Complex hearts, impossible choices, and the truth that love rarely follows a clean path',
    psychologicalAppeal: 'Complexity of desire, emotional honesty, and difficult decisions',
    exampleFilms: ['Casablanca', 'Twilight', 'Carol'],
    compatibleWith: ['enemiesToLovers', 'tragicRomance', 'comingOfAge']
  }
};

const FEATURED_DIRECTORS = {
  'Christopher Nolan': {
    emoji: '⏳',
    style: 'Mind-bending temporal narratives, philosophical scope, practical effects',
    toneSignature: 'philosophical',
    archetypeSignature: ['epicAdventure', 'survivorStory'],
    notableFilms: ['Inception', 'Interstellar', 'The Dark Knight', 'Oppenheimer']
  },
  'Quentin Tarantino': {
    emoji: '🎙️',
    style: 'Non-linear storytelling, sharp dialogue, genre subversion, pop culture reverence',
    toneSignature: 'chaotic',
    archetypeSignature: ['revengeArc', 'heistCaper'],
    notableFilms: ['Pulp Fiction', 'Kill Bill', 'Inglourious Basterds', 'Django Unchained']
  },
  'Greta Gerwig': {
    emoji: '🌸',
    style: 'Intimate female interiority, warmth, literary sensibility, vibrant optimism',
    toneSignature: 'wholesome',
    archetypeSignature: ['comingOfAge', 'foundFamily'],
    notableFilms: ['Lady Bird', 'Little Women', 'Barbie']
  },
  'Wes Anderson': {
    emoji: '🎨',
    style: 'Symmetrical cinematography, deadpan humour, pastel palettes, melancholy whimsy',
    toneSignature: 'chaotic',
    archetypeSignature: ['foundFamily', 'heistCaper'],
    notableFilms: ['The Grand Budapest Hotel', 'Moonrise Kingdom', 'Fantastic Mr. Fox']
  },
  'Steven Spielberg': {
    emoji: '🦖',
    style: 'Crowd-pleasing wonder, spectacle, family adventure, historical drama',
    toneSignature: 'adventurous',
    archetypeSignature: ['epicAdventure', 'foundFamily'],
    notableFilms: ["Schindler's List", 'Jurassic Park', 'E.T.', 'Raiders of the Lost Ark']
  },
  'Martin Scorsese': {
    emoji: '🚕',
    style: 'Visceral crime dramas, moral ambiguity, Italian-American identity, operatic violence',
    toneSignature: 'dark',
    archetypeSignature: ['revengeArc', 'survivorStory'],
    notableFilms: ['Goodfellas', 'Taxi Driver', 'The Departed', 'Raging Bull']
  },
  'Sofia Coppola': {
    emoji: '🌙',
    style: 'Quiet alienation, feminine perspective, lush aesthetics, emotional restraint',
    toneSignature: 'philosophical',
    archetypeSignature: ['comingOfAge', 'tragicRomance'],
    notableFilms: ['Lost in Translation', 'The Virgin Suicides', 'Marie Antoinette']
  },
  'David Fincher': {
    emoji: '🔦',
    style: 'Clinical precision, dark subject matter, meticulous craft, paranoid atmosphere',
    toneSignature: 'dark',
    archetypeSignature: ['revengeArc', 'survivorStory'],
    notableFilms: ['Fight Club', 'Se7en', 'Zodiac', 'Gone Girl']
  },
  'Wong Kar-wai': {
    emoji: '🕰️',
    style: 'Poetic mood, fragmented memory, unrequited longing, Hong Kong urbanism',
    toneSignature: 'romantic',
    archetypeSignature: ['tragicRomance', 'loveTriangle'],
    notableFilms: ['In the Mood for Love', 'Chungking Express', '2046']
  },
  'Stanley Kubrick': {
    emoji: '👁️',
    style: 'Cold perfectionism, existential dread, wide-angle symmetry, genre transcendence',
    toneSignature: 'philosophical',
    archetypeSignature: ['survivorStory', 'revengeArc'],
    notableFilms: ['2001: A Space Odyssey', 'The Shining', 'Full Metal Jacket', 'A Clockwork Orange']
  },
  'Pedro Almodóvar': {
    emoji: '🌹',
    style: 'Melodrama, vibrant colour, female solidarity, transgression, passion',
    toneSignature: 'romantic',
    archetypeSignature: ['tragicRomance', 'comingOfAge'],
    notableFilms: ['All About My Mother', 'Talk to Her', 'Volver']
  },
  'Bong Joon-ho': {
    emoji: '🪜',
    style: 'Class critique, genre-blending, dark satire, unexpected tonal shifts',
    toneSignature: 'chaotic',
    archetypeSignature: ['underdog', 'survivorStory'],
    notableFilms: ['Parasite', 'Memories of Murder', 'Snowpiercer']
  }
};

/**
 * Calculate compatibility between two users based on story archetype preferences.
 * @param {Array} archetypes1
 * @param {Array} archetypes2
 * @returns {Object} { score, sharedArchetypes, complementaryArchetypes, reason }
 */
function calculateArchetypeCompatibility(archetypes1, archetypes2) {
  if (!archetypes1?.length || !archetypes2?.length) return { score: 50, reason: 'Not enough archetype data' };

  const set2 = new Set(archetypes2);
  const shared = archetypes1.filter(a => set2.has(a));
  const directScore = Math.min(60, shared.length * 20);

  let complementaryScore = 0;
  const complementary = [];
  archetypes1.forEach(a1 => {
    const arch = STORY_ARCHETYPES[a1];
    if (!arch) return;
    archetypes2.forEach(a2 => {
      if (a1 !== a2 && arch.compatibleWith?.includes(a2) && !complementary.includes(a2)) {
        complementary.push(a2);
        complementaryScore += 10;
      }
    });
  });
  complementaryScore = Math.min(40, complementaryScore);

  const score = Math.min(100, directScore + complementaryScore);

  let reason;
  if (shared.length >= 2) {
    reason = `You both love ${shared.map(a => STORY_ARCHETYPES[a]?.name).join(' and ')} stories — deep narrative compatibility.`;
  } else if (shared.length === 1) {
    reason = `You share a love of ${STORY_ARCHETYPES[shared[0]]?.name} stories — a strong emotional connection point.`;
  } else if (complementary.length) {
    reason = "Your story preferences complement each other — you'll bring new narratives into each other's lives.";
  } else {
    reason = "Different story tastes — you'll challenge and expand each other's cinematic worlds.";
  }

  return { score, sharedArchetypes: shared, complementaryArchetypes: complementary, reason };
}

/**
 * Calculate director-based compatibility between two users.
 * @param {Array} directors1
 * @param {Array} directors2
 * @returns {Object} { score, sharedDirectors, toneOverlap, reason }
 */
function calculateDirectorCompatibility(directors1, directors2) {
  if (!directors1?.length || !directors2?.length) {
    return { score: 40, reason: 'Not enough director data — add your favorites!', sharedDirectors: [], toneOverlap: [] };
  }

  const set2 = new Set(directors2);
  const shared = directors1.filter(d => set2.has(d));
  const directScore = Math.min(50, shared.length * 18);

  const tones1 = new Set(directors1.map(d => FEATURED_DIRECTORS[d]?.toneSignature).filter(Boolean));
  const tones2 = new Set(directors2.map(d => FEATURED_DIRECTORS[d]?.toneSignature).filter(Boolean));
  const toneOverlap = [...tones1].filter(t => tones2.has(t));
  const toneScore = Math.min(30, toneOverlap.length * 15);

  const dArchs1 = new Set(directors1.flatMap(d => FEATURED_DIRECTORS[d]?.archetypeSignature || []));
  const dArchs2 = new Set(directors2.flatMap(d => FEATURED_DIRECTORS[d]?.archetypeSignature || []));
  const archOverlap = [...dArchs1].filter(a => dArchs2.has(a));
  const archScore = Math.min(20, archOverlap.length * 10);

  const score = Math.min(100, directScore + toneScore + archScore);

  let reason;
  if (shared.length >= 2) {
    reason = `You're both fans of ${shared.slice(0, 2).join(' and ')} — that's a cinematic soul connection.`;
  } else if (shared.length === 1) {
    reason = `You both love ${shared[0]}'s work — a strong shared cinematic taste.`;
  } else if (toneOverlap.length) {
    reason = `Your director tastes share a ${toneOverlap[0]} emotional signature.`;
  } else {
    reason = "Different directorial tastes — together you'll discover new cinematic voices.";
  }

  return { score, sharedDirectors: shared, toneOverlap, archOverlap, reason };
}

// ---------------------------------------------------------------------------
// Legacy compatibility shim — kept so existing callers don't break
// ---------------------------------------------------------------------------

/** @deprecated Use STORY_ARCHETYPES instead */
const ARCHETYPES = STORY_ARCHETYPES;

/** @deprecated Use calculateArchetypeCompatibility instead */
function determineArchetype(user) {
  const archetypes = user.movieDNA?.dimensions?.storyArchetypes ||
    user.storyArchetypes || [];
  return {
    primary: { type: archetypes[0] || 'comingOfAge', ...(STORY_ARCHETYPES[archetypes[0] || 'comingOfAge'] || {}), score: 50 },
    secondary: archetypes[1] ? { type: archetypes[1], ...(STORY_ARCHETYPES[archetypes[1]] || {}), score: 40 } : null,
    allScores: {}
  };
}

/** @deprecated Use calculateArchetypeCompatibility instead */
function getArchetypeRecommendations(archetypeKey) {
  const arch = STORY_ARCHETYPES[archetypeKey];
  if (!arch) return [];
  return (arch.compatibleWith || []).map(k => ({ type: k, ...STORY_ARCHETYPES[k] }));
}

module.exports = {
  STORY_ARCHETYPES,
  FEATURED_DIRECTORS,
  ARCHETYPES,
  calculateArchetypeCompatibility,
  calculateDirectorCompatibility,
  // Legacy exports
  determineArchetype,
  getArchetypeRecommendations
};
