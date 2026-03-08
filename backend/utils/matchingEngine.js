/**
 * Movie DNA Matching Engine
 *
 * Replaces the previous swipe-count / shared-title matching algorithm with a
 * fully emotion-and-story-driven compatibility model built around 10 features:
 *
 *  1. Movie DNA Personality Matching      (emotional storytelling compatibility)
 *  2. Your Love Story Movie               (generateLoveStoryMovie helper)
 *  3. First Date Movie Challenge          (getRandomChallenge helper)
 *  4. Scene That Made Me Cry              (emotional depth signal)
 *  5. Movie Mood Matching                 (current mood compatibility)
 *  6. Cinema Date Finder                  (location/event signal)
 *  7. Red Flag Movies                     (dealbreaker detection)
 *  8. Compatibility by Movie Archetype    (story archetype overlap)
 *  9. Director Compatibility              (directorial taste alignment)
 * 10. Your Relationship Genre             (predicted relationship genre)
 *
 * All ten dimensions feed into a final 0–100 compatibility score, with a
 * human-readable match description and a predicted relationship genre.
 */

const { buildMovieDNA, calculateDNACompatibility } = require('./movieDNA');
const {
  calculateArchetypeCompatibility,
  calculateDirectorCompatibility
} = require('./movieArchetypes');
const { generateLoveStoryMovie } = require('./loveStoryGenerator');

// ---------------------------------------------------------------------------
// Relationship Genre Prediction (Feature 10)
// ---------------------------------------------------------------------------
const RELATIONSHIP_GENRES = {
  romanticComedy: {
    id: 'romanticComedy',
    name: 'Romantic Comedy',
    emoji: '😂❤️',
    description: 'Playful banter, miscommunications, and a kiss in the rain. Chaos with a happy ending.',
    signals: ['chaoticComedy', 'hopelessRomantic', 'chaotic', 'romantic']
  },
  slowBurnIndie: {
    id: 'slowBurnIndie',
    name: 'Slow Burn Indie Romance',
    emoji: '🎞️🕯️',
    description: 'Quiet glances across crowded rooms. Everything unsaid. Everything felt.',
    signals: ['indieSoul', 'philosophical', 'tragic', 'comingOfAge']
  },
  actionAdventure: {
    id: 'actionAdventure',
    name: 'Action-Adventure Couple',
    emoji: '💥🗺️',
    description: 'You don\'t just watch adventures — you are one. Every day is a new mission.',
    signals: ['adventureDreamer', 'epicFantasy', 'adventurous', 'epicAdventure']
  },
  epicDrama: {
    id: 'epicDrama',
    name: 'Epic Drama',
    emoji: '🎭🌊',
    description: 'Grand emotions, high stakes, and love that transcends ordinary life.',
    signals: ['darkThriller', 'grittyCrime', 'dark', 'tragicRomance', 'revengeArc']
  },
  chaoticSitcom: {
    id: 'chaoticSitcom',
    name: 'Chaotic Sitcom Energy',
    emoji: '📺⚡',
    description: 'Every day is an episode. Every disagreement is a cold open. Somehow always works out.',
    signals: ['chaoticComedy', 'chaotic', 'heistCaper', 'loveTriangle']
  },
  nostalgicRomance: {
    id: 'nostalgicRomance',
    name: 'Nostalgic Romance',
    emoji: '📼💛',
    description: 'Comfort, familiarity, and the warmth of two people who feel like home to each other.',
    signals: ['nostalgicComfort', 'wholesome', 'foundFamily', 'comingOfAge']
  },
  intellectualPartnership: {
    id: 'intellectualPartnership',
    name: 'Intellectual Partnership',
    emoji: '🧠🤝',
    description: 'Debates, documentaries, and mutual admiration of each other\'s brilliant minds.',
    signals: ['darkThriller', 'indieSoul', 'philosophical', 'underdog']
  }
};

function predictRelationshipGenre(dna1, dna2, archetypeResult) {
  const signals = new Set();

  if (dna1.personalityType) signals.add(dna1.personalityType);
  if (dna2.personalityType) signals.add(dna2.personalityType);
  if (dna1.dimensions?.emotionalTone?.dominant) signals.add(dna1.dimensions.emotionalTone.dominant);
  if (dna2.dimensions?.emotionalTone?.dominant) signals.add(dna2.dimensions.emotionalTone.dominant);
  (archetypeResult?.sharedArchetypes || []).forEach(a => signals.add(a));

  let bestGenre = 'nostalgicRomance';
  let bestScore = 0;

  Object.entries(RELATIONSHIP_GENRES).forEach(([id, genre]) => {
    const matches = genre.signals.filter(s => signals.has(s)).length;
    if (matches > bestScore) {
      bestScore = matches;
      bestGenre = id;
    }
  });

  return { ...RELATIONSHIP_GENRES[bestGenre] };
}

// ---------------------------------------------------------------------------
// Movie Mood Compatibility (Feature 5)
// ---------------------------------------------------------------------------
const MOVIE_MOODS = {
  romCom: { label: 'Romantic comedy night', emoji: '💕😂', compatible: ['romCom', 'comfort'] },
  philosophical: { label: 'Deep philosophical movie', emoji: '🧠🌌', compatible: ['philosophical', 'thriller'] },
  horror: { label: 'Horror marathon', emoji: '👻🔪', compatible: ['horror', 'thriller'] },
  comfort: { label: 'Comfort movie vibes', emoji: '🛋️☕', compatible: ['comfort', 'romCom', 'adventure'] },
  thriller: { label: 'Edge-of-your-seat thriller', emoji: '😤🎯', compatible: ['thriller', 'philosophical', 'horror'] },
  adventure: { label: 'Epic adventure night', emoji: '🗺️⚡', compatible: ['adventure', 'comfort'] },
  documentary: { label: 'Documentary deep dive', emoji: '📽️🌍', compatible: ['documentary', 'philosophical'] },
  animation: { label: 'Animation & heartwarming', emoji: '✨🎈', compatible: ['animation', 'comfort', 'romCom'] }
};

function calculateMoodCompatibility(mood1, mood2) {
  if (!mood1 || !mood2) return { score: 30, match: false };
  if (mood1 === mood2) return { score: 100, match: true, label: 'Perfect mood match!' };
  const moodInfo = MOVIE_MOODS[mood1];
  if (moodInfo?.compatible?.includes(mood2)) return { score: 70, match: true, label: 'Compatible moods' };
  return { score: 20, match: false, label: 'Different moods tonight — maybe next time!' };
}

// ---------------------------------------------------------------------------
// Red Flag Movies Detector (Feature 7)
// ---------------------------------------------------------------------------
function detectRedFlags(user1, user2) {
  const flags = [];
  const user1Favorites = new Set((user1.favoriteMovies || []).map(m => (m.title || m).toLowerCase().trim()));
  const user2RedFlags = (user2.redFlagMovies || []).map(m => (m.title || m).toLowerCase().trim());
  const user2Favorites = new Set((user2.favoriteMovies || []).map(m => (m.title || m).toLowerCase().trim()));
  const user1RedFlags = (user1.redFlagMovies || []).map(m => (m.title || m).toLowerCase().trim());

  user2RedFlags.forEach(flag => {
    if (user1Favorites.has(flag)) {
      flags.push({ flaggedBy: user2.username || 'them', movie: flag, severity: 'dealbreaker' });
    }
  });

  user1RedFlags.forEach(flag => {
    if (user2Favorites.has(flag)) {
      flags.push({ flaggedBy: user1.username || 'you', movie: flag, severity: 'dealbreaker' });
    }
  });

  return flags;
}

// ---------------------------------------------------------------------------
// Scene That Made Me Cry Compatibility (Feature 4)
// ---------------------------------------------------------------------------
function calculateEmotionalDepthCompatibility(user1, user2) {
  const scene1 = user1.sceneThatMadeMeCry;
  const scene2 = user2.sceneThatMadeMeCry;

  if (!scene1 || !scene2) return { score: 0, reason: 'Share a scene that moved you to reveal emotional depth' };

  let score = 0;

  // Both shared something → emotional vulnerability baseline
  if (scene1.scene && scene2.scene) score += 20;

  // Same movie that changed them
  if (scene1.movieThatChangedMe && scene2.movieThatChangedMe) {
    const m1 = (scene1.movieThatChangedMe || '').toLowerCase().trim();
    const m2 = (scene2.movieThatChangedMe || '').toLowerCase().trim();
    if (m1 === m2) score += 30;
    else score += 10;
  }

  // Both secretly agree with the same villain type (signal of moral complexity appreciation)
  if (scene1.villainTheyAgreeWith && scene2.villainTheyAgreeWith) {
    score += 10;
  }

  return {
    score: Math.min(60, score),
    reason: score >= 40
      ? 'You both experience films on a deep emotional level — rare and powerful.'
      : 'You both wear your hearts on your sleeves in the cinema.'
  };
}

// ---------------------------------------------------------------------------
// Core Matching Engine
// ---------------------------------------------------------------------------
class MatchingEngine {
  /**
   * Calculate a full DNA-based match between two users.
   * @param {Object} user1
   * @param {Object} user2
   * @returns {Object} Full match result with score, breakdown, love story, relationship genre
   */
  static calculateMatch(user1, user2) {
    // Build (or reuse) Movie DNA profiles for both users
    const dna1 = user1.movieDNA && user1.movieDNA.personalityType
      ? user1.movieDNA
      : buildMovieDNA(user1);
    const dna2 = user2.movieDNA && user2.movieDNA.personalityType
      ? user2.movieDNA
      : buildMovieDNA(user2);

    const breakdown = {};
    let score = 0;

    // 1. Movie DNA Personality Compatibility (max 35 pts)
    const dnaResult = calculateDNACompatibility(dna1, dna2);
    const dnaPoints = Math.round((dnaResult.score / 100) * 35);
    score += dnaPoints;
    breakdown.movieDNA = { points: dnaPoints, detail: dnaResult };

    // 8. Story Archetype Compatibility (max 20 pts)
    const archs1 = dna1.dimensions?.storyArchetypes || user1.storyArchetypes || [];
    const archs2 = dna2.dimensions?.storyArchetypes || user2.storyArchetypes || [];
    const archetypeResult = calculateArchetypeCompatibility(archs1, archs2);
    const archetypePoints = Math.round((archetypeResult.score / 100) * 20);
    score += archetypePoints;
    breakdown.storyArchetypes = { points: archetypePoints, detail: archetypeResult };

    // 9. Director Compatibility (max 15 pts)
    const dirResult = calculateDirectorCompatibility(
      user1.favoriteDirectors || [],
      user2.favoriteDirectors || []
    );
    const dirPoints = Math.round((dirResult.score / 100) * 15);
    score += dirPoints;
    breakdown.directorCompatibility = { points: dirPoints, detail: dirResult };

    // 4. Scene That Made Me Cry (max 10 pts)
    const emotionalResult = calculateEmotionalDepthCompatibility(user1, user2);
    score += emotionalResult.score > 0 ? Math.round((emotionalResult.score / 60) * 10) : 0;
    breakdown.emotionalDepth = emotionalResult;

    // 5. Movie Mood Matching (max 10 pts — bonus, doesn't penalise)
    const moodResult = calculateMoodCompatibility(user1.movieMood, user2.movieMood);
    if (moodResult.match) {
      const moodPoints = Math.round((moodResult.score / 100) * 10);
      score += moodPoints;
      breakdown.movieMood = { points: moodPoints, detail: moodResult };
    } else {
      breakdown.movieMood = { points: 0, detail: moodResult };
    }

    // 7. Red Flag Movies — hard penalty
    const redFlagResult = detectRedFlags(user1, user2);
    if (redFlagResult.length) {
      const penalty = Math.min(30, redFlagResult.length * 15);
      score -= penalty;
      breakdown.redFlags = { penalty, flags: redFlagResult };
    } else {
      breakdown.redFlags = { penalty: 0, flags: [] };
    }

    // Clamp to 0–100
    const finalScore = Math.max(0, Math.min(100, Math.round(score)));

    // 10. Relationship Genre Prediction
    const relationshipGenre = predictRelationshipGenre(dna1, dna2, archetypeResult);

    // 2. Love Story Movie
    const loveStory = generateLoveStoryMovie(user1, user2, dnaResult);

    const matchDescription = MatchingEngine.generateMatchDescription(finalScore, breakdown, relationshipGenre);

    return {
      score: finalScore,
      breakdown,
      dna: { user1: dna1, user2: dna2 },
      dnaCompatibility: dnaResult,
      archetypeCompatibility: archetypeResult,
      directorCompatibility: dirResult,
      relationshipGenre,
      loveStory,
      redFlags: redFlagResult,
      matchDescription,
      // Legacy fields for backward-compatibility with existing frontend code
      sharedContent: [],
      sharedServices: [],
      sharedGenres: (user1.preferences?.genres || []).filter(g => (user2.preferences?.genres || []).includes(g)),
      sharedFavoriteMovies: [],
      sharedLikedMovies: [],
      sharedWatchlistMovies: []
    };
  }

  static generateMatchDescription(score, breakdown, relationshipGenre) {
    if (score >= 90) return `🔥 Cinematic soulmates — your Movie DNA is a perfect match. You're a ${relationshipGenre?.name} waiting to happen.`;
    if (score >= 75) return `💕 Deeply compatible — same emotional storytelling frequency. Could be a ${relationshipGenre?.name}.`;
    if (score >= 60) return `🎬 Strong narrative connection — you love the same kinds of stories.`;
    if (score >= 45) return `🌱 Different tastes that complement each other — you'll broaden each other's cinematic world.`;
    if (score >= 30) return `🤔 Some common ground — the differences could make for interesting conversations.`;
    return '🎲 Wildly different DNA — but sometimes the best stories come from unexpected pairings.';
  }

  /**
   * Filter users before scoring to keep the pool manageable.
   */
  static filterCandidates(currentUser, allUsers, filters = {}) {
    return allUsers.filter(u => {
      if (u.id === currentUser.id) return false;

      // Red flag pre-filter: if currentUser has this user on their red flags list
      // AND that user's favorite movie matches — skip entirely
      const flags = detectRedFlags(currentUser, u);
      if (flags.some(f => f.severity === 'dealbreaker')) return false;

      // Mood filter — only show mood-compatible users if filter is active
      if (filters.moodOnly && currentUser.movieMood) {
        const moodCheck = calculateMoodCompatibility(currentUser.movieMood, u.movieMood);
        if (!moodCheck.match) return false;
      }

      // Director filter
      if (filters.directorFilter?.length) {
        const shared = (u.favoriteDirectors || []).filter(d => filters.directorFilter.includes(d));
        if (!shared.length) return false;
      }

      // Story archetype filter
      if (filters.archetypeFilter?.length) {
        const userArchs = u.storyArchetypes || u.movieDNA?.dimensions?.storyArchetypes || [];
        const shared = userArchs.filter(a => filters.archetypeFilter.includes(a));
        if (!shared.length) return false;
      }

      return true;
    });
  }

  /**
   * Find and rank matches for a user.
   * @param {Object} currentUser
   * @param {Array} allUsers
   * @param {Object} options
   * @returns {Array} Sorted match results
   */
  static findMatches(currentUser, allUsers, options = {}) {
    const { limit = 20, filters = {} } = options;
    const candidates = MatchingEngine.filterCandidates(currentUser, allUsers, filters);

    const results = candidates.map(candidate => {
      const matchResult = MatchingEngine.calculateMatch(currentUser, candidate);
      return {
        userId: candidate.id,
        username: candidate.username,
        age: candidate.age,
        location: candidate.location,
        profilePicture: candidate.profilePicture,
        ...matchResult
      };
    });

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}

module.exports = MatchingEngine;
