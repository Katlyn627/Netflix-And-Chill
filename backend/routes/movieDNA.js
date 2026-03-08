/**
 * Movie DNA API Routes
 *
 * Exposes all 10 new feature endpoints:
 *
 *  GET  /api/movie-dna/types                    — list all DNA personality types
 *  GET  /api/movie-dna/dimensions               — list emotional tones, eras, story archetypes, directors
 *  POST /api/movie-dna/build/:userId            — build/rebuild DNA profile for a user
 *  GET  /api/movie-dna/profile/:userId          — get a user's DNA profile
 *  POST /api/movie-dna/update/:userId           — update a user's DNA input dimensions
 *
 *  GET  /api/movie-dna/love-story/:userId1/:userId2  — generate Love Story Movie for a pair
 *
 *  GET  /api/movie-dna/challenges               — list all challenge types
 *  GET  /api/movie-dna/challenges/random        — random challenge
 *  GET  /api/movie-dna/challenges/:type         — challenges of a specific type
 *
 *  POST /api/movie-dna/scene/:userId            — save Scene That Made Me Cry profile
 *  GET  /api/movie-dna/scene/:userId            — get Scene That Made Me Cry profile
 *
 *  POST /api/movie-dna/mood/:userId             — set current Movie Mood
 *  GET  /api/movie-dna/mood-matches/:userId     — users with compatible mood right now
 *
 *  POST /api/movie-dna/red-flags/:userId        — save red flag movies list
 *  GET  /api/movie-dna/red-flags/:userId        — get red flag movies list
 *
 *  GET  /api/movie-dna/archetypes               — all story archetypes
 *  GET  /api/movie-dna/directors                — all featured directors
 *  POST /api/movie-dna/directors/:userId        — save favorite directors
 *
 *  GET  /api/movie-dna/relationship-genre/:userId1/:userId2  — predict relationship genre
 *
 *  GET  /api/movie-dna/cinema-finder/:userId    — cinema date opportunities nearby
 */

const express = require('express');
const router = express.Router();

const {
  EMOTIONAL_TONES,
  ERA_PREFERENCES,
  STORY_ARCHETYPES: DNA_STORY_ARCHETYPES,
  CHARACTER_ARCHETYPES,
  DNA_PERSONALITY_TYPES,
  buildMovieDNA,
  calculateDNACompatibility
} = require('../utils/movieDNA');

const {
  STORY_ARCHETYPES,
  FEATURED_DIRECTORS,
  calculateArchetypeCompatibility,
  calculateDirectorCompatibility
} = require('../utils/movieArchetypes');

const { generateLoveStoryMovie } = require('../utils/loveStoryGenerator');
const {
  getAllChallengeTypes,
  getRandomChallenge,
  QUOTE_BATTLES,
  GUESS_MY_MOVIE_PROMPTS,
  WATCH_TOGETHER_MINI_DATES,
  HOT_TAKE_DUELS,
  BLIND_RANK_LISTS
} = require('../utils/movieChallenges');

const dataStore = require('../utils/dataStore');
const MatchingEngine = require('../utils/matchingEngine');

// ---------------------------------------------------------------------------
// Feature 1 — Movie DNA Reference Data
// ---------------------------------------------------------------------------

router.get('/types', (req, res) => {
  res.json({ success: true, types: DNA_PERSONALITY_TYPES });
});

router.get('/dimensions', (req, res) => {
  res.json({
    success: true,
    emotionalTones: EMOTIONAL_TONES,
    eraPreferences: ERA_PREFERENCES,
    storyArchetypes: DNA_STORY_ARCHETYPES,
    characterArchetypes: CHARACTER_ARCHETYPES,
    featuredDirectors: FEATURED_DIRECTORS
  });
});

// ---------------------------------------------------------------------------
// Feature 1 — Build / Get DNA Profile
// ---------------------------------------------------------------------------

router.post('/build/:userId', async (req, res) => {
  try {
    const user = await dataStore.getUser(req.params.userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const dna = buildMovieDNA(user);
    user.movieDNA = dna;
    await dataStore.updateUser(req.params.userId, user);

    res.json({ success: true, movieDNA: dna });
  } catch (err) {
    console.error('Error building Movie DNA:', err);
    res.status(500).json({ success: false, error: 'Failed to build Movie DNA' });
  }
});

router.get('/profile/:userId', async (req, res) => {
  try {
    const user = await dataStore.getUser(req.params.userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const dna = user.movieDNA?.personalityType ? user.movieDNA : buildMovieDNA(user);
    res.json({ success: true, movieDNA: dna, user: { id: user.id, username: user.username } });
  } catch (err) {
    console.error('Error fetching DNA profile:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
});

router.post('/update/:userId', async (req, res) => {
  try {
    const user = await dataStore.getUser(req.params.userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const { emotionalTone, eraPreference, storyArchetypes, characterArchetypes, favoriteDirectors } = req.body;

    if (!user.movieDNA) user.movieDNA = { dimensions: {} };
    if (!user.movieDNA.dimensions) user.movieDNA.dimensions = {};

    if (emotionalTone) user.movieDNA.dimensions.emotionalTone = { dominant: emotionalTone[0], secondary: emotionalTone[1] || null };
    if (eraPreference) user.movieDNA.dimensions.eraPreference = eraPreference;
    if (storyArchetypes) {
      user.movieDNA.dimensions.storyArchetypes = storyArchetypes;
      user.storyArchetypes = storyArchetypes;
    }
    if (characterArchetypes) user.movieDNA.dimensions.characterArchetypes = characterArchetypes;
    if (favoriteDirectors) user.favoriteDirectors = favoriteDirectors;

    // Rebuild DNA with updated inputs
    const dna = buildMovieDNA(user);
    user.movieDNA = dna;

    await dataStore.updateUser(req.params.userId, user);
    res.json({ success: true, movieDNA: dna });
  } catch (err) {
    console.error('Error updating DNA:', err);
    res.status(500).json({ success: false, error: 'Failed to update DNA profile' });
  }
});

// ---------------------------------------------------------------------------
// Feature 2 — Your Love Story Movie
// ---------------------------------------------------------------------------

router.get('/love-story/:userId1/:userId2', async (req, res) => {
  try {
    const [user1, user2] = await Promise.all([
      dataStore.getUser(req.params.userId1),
      dataStore.getUser(req.params.userId2)
    ]);

    if (!user1 || !user2) return res.status(404).json({ success: false, error: 'One or both users not found' });

    const dna1 = user1.movieDNA?.personalityType ? user1.movieDNA : buildMovieDNA(user1);
    const dna2 = user2.movieDNA?.personalityType ? user2.movieDNA : buildMovieDNA(user2);
    const compatibility = calculateDNACompatibility(dna1, dna2);
    const loveStory = generateLoveStoryMovie(user1, user2, compatibility);

    res.json({ success: true, loveStory, compatibility });
  } catch (err) {
    console.error('Error generating love story:', err);
    res.status(500).json({ success: false, error: 'Failed to generate love story' });
  }
});

// ---------------------------------------------------------------------------
// Feature 3 — First Date Movie Challenges
// ---------------------------------------------------------------------------

router.get('/challenges', (req, res) => {
  res.json({ success: true, challengeTypes: getAllChallengeTypes() });
});

router.get('/challenges/random', (req, res) => {
  const { type } = req.query;
  const challenge = getRandomChallenge(type || null);
  res.json({ success: true, challenge });
});

router.get('/challenges/:type', (req, res) => {
  const typeMap = {
    quote: QUOTE_BATTLES,
    guess: GUESS_MY_MOVIE_PROMPTS,
    watch: WATCH_TOGETHER_MINI_DATES,
    hottake: HOT_TAKE_DUELS,
    rank: BLIND_RANK_LISTS
  };

  const challenges = typeMap[req.params.type];
  if (!challenges) return res.status(404).json({ success: false, error: 'Unknown challenge type' });

  res.json({ success: true, type: req.params.type, challenges });
});

// ---------------------------------------------------------------------------
// Feature 4 — Scene That Made Me Cry
// ---------------------------------------------------------------------------

router.post('/scene/:userId', async (req, res) => {
  try {
    const user = await dataStore.getUser(req.params.userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const { scene, movieThatChangedMe, villainTheyAgreeWith } = req.body;
    if (!scene && !movieThatChangedMe && !villainTheyAgreeWith) {
      return res.status(400).json({ success: false, error: 'At least one field required' });
    }

    user.sceneThatMadeMeCry = {
      scene: scene || user.sceneThatMadeMeCry?.scene || null,
      movieThatChangedMe: movieThatChangedMe || user.sceneThatMadeMeCry?.movieThatChangedMe || null,
      villainTheyAgreeWith: villainTheyAgreeWith || user.sceneThatMadeMeCry?.villainTheyAgreeWith || null,
      updatedAt: new Date().toISOString()
    };

    // Rebuild DNA to incorporate new emotional data
    user.movieDNA = buildMovieDNA(user);
    await dataStore.updateUser(req.params.userId, user);

    res.json({ success: true, sceneThatMadeMeCry: user.sceneThatMadeMeCry });
  } catch (err) {
    console.error('Error saving scene:', err);
    res.status(500).json({ success: false, error: 'Failed to save scene' });
  }
});

router.get('/scene/:userId', async (req, res) => {
  try {
    const user = await dataStore.getUser(req.params.userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, sceneThatMadeMeCry: user.sceneThatMadeMeCry || null });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch scene' });
  }
});

// ---------------------------------------------------------------------------
// Feature 5 — Movie Mood Matching
// ---------------------------------------------------------------------------

const MOVIE_MOODS_LIST = {
  romCom: { label: 'Romantic comedy night', emoji: '💕😂' },
  philosophical: { label: 'Deep philosophical movie', emoji: '🧠🌌' },
  horror: { label: 'Horror marathon', emoji: '👻🔪' },
  comfort: { label: 'Comfort movie vibes', emoji: '🛋️☕' },
  thriller: { label: 'Edge-of-your-seat thriller', emoji: '😤🎯' },
  adventure: { label: 'Epic adventure night', emoji: '🗺️⚡' },
  documentary: { label: 'Documentary deep dive', emoji: '📽️🌍' },
  animation: { label: 'Animation & heartwarming', emoji: '✨🎈' }
};

router.get('/moods', (req, res) => {
  res.json({ success: true, moods: MOVIE_MOODS_LIST });
});

router.post('/mood/:userId', async (req, res) => {
  try {
    const user = await dataStore.getUser(req.params.userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const { mood } = req.body;
    if (!mood || !MOVIE_MOODS_LIST[mood]) {
      return res.status(400).json({ success: false, error: 'Invalid mood ID', validMoods: Object.keys(MOVIE_MOODS_LIST) });
    }

    user.movieMood = mood;
    user.movieMoodSetAt = new Date().toISOString();
    await dataStore.updateUser(req.params.userId, user);

    res.json({ success: true, mood, moodInfo: MOVIE_MOODS_LIST[mood] });
  } catch (err) {
    console.error('Error setting mood:', err);
    res.status(500).json({ success: false, error: 'Failed to set mood' });
  }
});

router.get('/mood-matches/:userId', async (req, res) => {
  try {
    const user = await dataStore.getUser(req.params.userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    if (!user.movieMood) {
      return res.json({ success: true, matches: [], message: 'Set your movie mood to find matches!' });
    }

    const allUsers = await dataStore.getAllUsers();
    const moodCompatible = {
      romCom: ['romCom', 'comfort'],
      philosophical: ['philosophical', 'thriller'],
      horror: ['horror', 'thriller'],
      comfort: ['comfort', 'romCom', 'adventure'],
      thriller: ['thriller', 'philosophical', 'horror'],
      adventure: ['adventure', 'comfort'],
      documentary: ['documentary', 'philosophical'],
      animation: ['animation', 'comfort', 'romCom']
    };
    const compatibleMoods = moodCompatible[user.movieMood] || [user.movieMood];

    const matches = allUsers
      .filter(u => u.id !== user.id && u.movieMood && compatibleMoods.includes(u.movieMood))
      .map(u => ({
        userId: u.id,
        username: u.username,
        profilePicture: u.profilePicture,
        mood: u.movieMood,
        moodLabel: MOVIE_MOODS_LIST[u.movieMood]?.label,
        moodEmoji: MOVIE_MOODS_LIST[u.movieMood]?.emoji
      }));

    res.json({ success: true, yourMood: user.movieMood, matches });
  } catch (err) {
    console.error('Error finding mood matches:', err);
    res.status(500).json({ success: false, error: 'Failed to find mood matches' });
  }
});

// ---------------------------------------------------------------------------
// Feature 6 — Cinema Date Finder
// ---------------------------------------------------------------------------

router.get('/cinema-finder/:userId', async (req, res) => {
  try {
    const user = await dataStore.getUser(req.params.userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    // In a real integration this would hit a ticketing API (Fandango, Atom, etc.)
    // For now we return the user's saved cinema date data plus nearby users
    const allUsers = await dataStore.getAllUsers();
    const nearbyUsers = allUsers.filter(u => {
      if (u.id === user.id) return false;
      // If location data is available, check proximity
      if (user.location && u.location) {
        return u.location.toLowerCase().includes(user.location.toLowerCase().split(',')[0]);
      }
      return false;
    }).slice(0, 10).map(u => ({
      userId: u.id,
      username: u.username,
      profilePicture: u.profilePicture,
      location: u.location,
      cinemaDates: u.cinemaDates || null
    }));

    res.json({
      success: true,
      cinemaDates: user.cinemaDates || null,
      nearbyUsers,
      note: 'Connect a ticketing service to see real theater showtimes'
    });
  } catch (err) {
    console.error('Error in cinema finder:', err);
    res.status(500).json({ success: false, error: 'Failed to load cinema finder' });
  }
});

router.post('/cinema-finder/:userId', async (req, res) => {
  try {
    const user = await dataStore.getUser(req.params.userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const { movie, theater, date, seats } = req.body;
    if (!movie) return res.status(400).json({ success: false, error: 'movie is required' });

    if (!user.cinemaDates) user.cinemaDates = { upcoming: [] };
    if (!user.cinemaDates.upcoming) user.cinemaDates.upcoming = [];

    user.cinemaDates.upcoming.push({ movie, theater, date, seats, addedAt: new Date().toISOString() });

    // Keep only the most recent 5
    user.cinemaDates.upcoming = user.cinemaDates.upcoming.slice(-5);
    await dataStore.updateUser(req.params.userId, user);

    res.json({ success: true, cinemaDates: user.cinemaDates });
  } catch (err) {
    console.error('Error saving cinema date:', err);
    res.status(500).json({ success: false, error: 'Failed to save cinema date' });
  }
});

// ---------------------------------------------------------------------------
// Feature 7 — Red Flag Movies
// ---------------------------------------------------------------------------

router.get('/red-flags/:userId', async (req, res) => {
  try {
    const user = await dataStore.getUser(req.params.userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, redFlagMovies: user.redFlagMovies || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch red flags' });
  }
});

router.post('/red-flags/:userId', async (req, res) => {
  try {
    const user = await dataStore.getUser(req.params.userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const { movies } = req.body;
    if (!Array.isArray(movies)) return res.status(400).json({ success: false, error: 'movies must be an array' });

    user.redFlagMovies = movies.slice(0, 10); // Max 10 red flags
    await dataStore.updateUser(req.params.userId, user);

    res.json({ success: true, redFlagMovies: user.redFlagMovies });
  } catch (err) {
    console.error('Error saving red flags:', err);
    res.status(500).json({ success: false, error: 'Failed to save red flags' });
  }
});

// ---------------------------------------------------------------------------
// Feature 8 — Story Archetype Compatibility
// ---------------------------------------------------------------------------

router.get('/archetypes', (req, res) => {
  res.json({ success: true, archetypes: STORY_ARCHETYPES });
});

router.get('/archetypes/compatibility', (req, res) => {
  const { archetypes1, archetypes2 } = req.query;
  if (!archetypes1 || !archetypes2) {
    return res.status(400).json({ success: false, error: 'archetypes1 and archetypes2 query params required' });
  }
  const a1 = Array.isArray(archetypes1) ? archetypes1 : archetypes1.split(',');
  const a2 = Array.isArray(archetypes2) ? archetypes2 : archetypes2.split(',');
  const result = calculateArchetypeCompatibility(a1, a2);
  res.json({ success: true, ...result });
});

// ---------------------------------------------------------------------------
// Feature 9 — Director Compatibility
// ---------------------------------------------------------------------------

router.get('/directors', (req, res) => {
  res.json({ success: true, directors: FEATURED_DIRECTORS });
});

router.post('/directors/:userId', async (req, res) => {
  try {
    const user = await dataStore.getUser(req.params.userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const { directors } = req.body;
    if (!Array.isArray(directors)) return res.status(400).json({ success: false, error: 'directors must be an array' });

    user.favoriteDirectors = directors.slice(0, 5); // Max 5 favorite directors
    user.movieDNA = buildMovieDNA(user); // Rebuild DNA with new director data
    await dataStore.updateUser(req.params.userId, user);

    res.json({ success: true, favoriteDirectors: user.favoriteDirectors, movieDNA: user.movieDNA });
  } catch (err) {
    console.error('Error saving directors:', err);
    res.status(500).json({ success: false, error: 'Failed to save directors' });
  }
});

router.get('/directors/compatibility', (req, res) => {
  const { directors1, directors2 } = req.query;
  if (!directors1 || !directors2) {
    return res.status(400).json({ success: false, error: 'directors1 and directors2 query params required' });
  }
  const d1 = Array.isArray(directors1) ? directors1 : directors1.split(',');
  const d2 = Array.isArray(directors2) ? directors2 : directors2.split(',');
  const result = calculateDirectorCompatibility(d1, d2);
  res.json({ success: true, ...result });
});

// ---------------------------------------------------------------------------
// Feature 10 — Relationship Genre Prediction
// ---------------------------------------------------------------------------

router.get('/relationship-genre/:userId1/:userId2', async (req, res) => {
  try {
    const [user1, user2] = await Promise.all([
      dataStore.getUser(req.params.userId1),
      dataStore.getUser(req.params.userId2)
    ]);

    if (!user1 || !user2) return res.status(404).json({ success: false, error: 'One or both users not found' });

    const matchResult = MatchingEngine.calculateMatch(user1, user2);

    res.json({
      success: true,
      relationshipGenre: matchResult.relationshipGenre,
      score: matchResult.score,
      loveStory: matchResult.loveStory
    });
  } catch (err) {
    console.error('Error predicting relationship genre:', err);
    res.status(500).json({ success: false, error: 'Failed to predict relationship genre' });
  }
});

module.exports = router;
