/**
 * Love Story Movie Generator
 *
 * When two users match, generates a personalised "Love Story Movie" for them:
 *   - Unique title
 *   - Genre derived from their Movie DNA
 *   - Starring (their display names)
 *   - Tagline based on their compatibility story
 *   - CSS-renderable "poster" data (no external image API required)
 *
 * Feature 2 from the requirements: "Your Love Story Movie"
 */

const { DNA_PERSONALITY_TYPES } = require('./movieDNA');

const TITLE_TEMPLATES = [
  '{adj} {noun} & {noun2}',
  'The {adj} {noun} of {place}',
  '{time} {noun} and {adj2} {noun2}',
  'Two {adj} {noun}s',
  '{place} {noun} Story',
  'One {adj} {noun}',
  'The Last {noun} in {place}',
  '{adj} Hearts in {place}',
  'What We {verb} in {place}',
  '{noun} After {time}'
];

const ADJECTIVES = [
  'Midnight', 'Rainy', 'Golden', 'Electric', 'Quiet', 'Reckless',
  'Borrowed', 'Unscripted', 'Accidental', 'Perfect', 'Hopeless',
  'Beautiful', 'Chaotic', 'Tender', 'Unexpected'
];

const ADJECTIVES2 = [
  'Endless', 'Stolen', 'Secret', 'Twisted', 'Wild', 'Soft',
  'Bitter', 'Sweet', 'Honest', 'Broken', 'Shining'
];

const NOUNS = [
  'Coffee', 'Cinema', 'Playlist', 'Plot Twist', 'Credits',
  'Scene', 'Frame', 'Reel', 'Sequel', 'Flashback', 'Premiere',
  'Cameo', 'Script', 'Montage', 'Intermission'
];

const NOUNS2 = [
  'Sparks', 'Kisses', 'Daydreams', 'Adventures', 'Arguments',
  'Promises', 'Laughs', 'Secrets', 'Confessions', 'Memories'
];

const PLACES = [
  'Row G', 'the Back Row', 'Screen 3', 'the Film Festival', 'a Rooftop Cinema',
  'the Drive-In', 'the Lobby', 'Aisle 7', 'the Late Show', 'the Matinée'
];

const TIMES = [
  'Midnight', 'After Credits', 'Before Opening Night', '3 AM', 'Golden Hour',
  'Last Call', 'Opening Weekend', 'The Finale'
];

const VERBS = [
  'Watched', 'Missed', 'Found', 'Chose', 'Lost', 'Remembered', 'Forgot', 'Rewound'
];

const TAGLINE_TEMPLATES = [
  'They both swiped right… and neither saw it coming.',
  'Same taste in movies. Different taste in everything else. Until now.',
  'One streaming queue changed everything.',
  'Their first argument was about the ending. Their second was about everything after.',
  'He/She said it was "just a movie." They were both wrong.',
  'Two people. One remote. No compromises… at first.',
  'It started with a bad movie recommendation. It ended with forever.',
  'Plot twist: they were each other\'s favourite film.',
  'The credits rolled. Neither of them left.',
  'They\'d seen every great love story. They just hadn\'t lived one yet.',
  'Two cinephiles. One couch. Infinite possibilities.',
  'Neither was looking. Both found exactly what they needed.',
  'Swiped right on each other. Swiped right on every movie after.'
];

const GENRE_MAPS = {
  hopelessRomantic: { genre: 'Romantic Drama', poster_color: '#FF6B8A', accent: '#FFD1DC' },
  darkThriller: { genre: 'Psychological Thriller', poster_color: '#1A1A2E', accent: '#E94560' },
  adventureDreamer: { genre: 'Action Romance', poster_color: '#0F3460', accent: '#F5A623' },
  indieSoul: { genre: 'Indie Dramedy', poster_color: '#2D3047', accent: '#93B7BE' },
  chaoticComedy: { genre: 'Romantic Comedy', poster_color: '#FF6B35', accent: '#FFEFB5' },
  nostalgicComfort: { genre: 'Nostalgic Romance', poster_color: '#6B4226', accent: '#F2C078' },
  epicFantasy: { genre: 'Epic Fantasy Romance', poster_color: '#1B1F3B', accent: '#9B59B6' },
  grittyCrime: { genre: 'Neo-Noir Romance', poster_color: '#1C1C1C', accent: '#C0A060' }
};

function _pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function _generateTitle(seed) {
  const template = TITLE_TEMPLATES[seed % TITLE_TEMPLATES.length];
  return template
    .replace('{adj}', _pick(ADJECTIVES))
    .replace('{adj2}', _pick(ADJECTIVES2))
    .replace('{noun}', _pick(NOUNS))
    .replace('{noun2}', _pick(NOUNS2))
    .replace('{place}', _pick(PLACES))
    .replace('{time}', _pick(TIMES))
    .replace('{verb}', _pick(VERBS));
}

/**
 * Generate a "Love Story Movie" for a matched pair.
 * @param {Object} user1 - First user (must have id and username/name)
 * @param {Object} user2 - Second user
 * @param {Object} compatibilityResult - Output from calculateDNACompatibility
 * @returns {Object} loveStory poster data
 */
function generateLoveStoryMovie(user1, user2, compatibilityResult) {
  const name1 = user1.username || user1.name || 'Alex';
  const name2 = user2.username || user2.name || 'Jordan';

  // Use a deterministic seed based on user IDs for consistent generation
  const seed = (user1.id + user2.id).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);

  const title = _generateTitle(seed);
  const tagline = TAGLINE_TEMPLATES[seed % TAGLINE_TEMPLATES.length];

  // Determine genre from personality types
  const type1 = user1.movieDNA?.personalityType || 'indieSoul';
  const type2 = user2.movieDNA?.personalityType || 'indieSoul';

  // Blend genres based on both types
  const genreInfo1 = GENRE_MAPS[type1] || GENRE_MAPS.indieSoul;
  const genreInfo2 = GENRE_MAPS[type2] || GENRE_MAPS.indieSoul;

  // If same type, use that genre; otherwise pick a hybrid
  const genre = type1 === type2
    ? genreInfo1.genre
    : `${genreInfo1.genre.split(' ')[0]} ${genreInfo2.genre.split(' ').slice(-1)[0]}`;

  const posterColor = genreInfo1.poster_color;
  const accentColor = genreInfo1.accent;

  // Rating (fun, always high)
  const ratingBase = compatibilityResult?.score || 85;
  const rating = Math.max(7.5, Math.min(9.9, (ratingBase / 100) * 10)).toFixed(1);

  // Runtime (always a perfect movie length)
  const runtimes = ['1h 47m', '2h 3m', '1h 58m', '2h 14m', '1h 52m'];
  const runtime = runtimes[seed % runtimes.length];

  const compatibilityReason = compatibilityResult?.reason || 'Two people who love the same feeling in movies.';

  const dnaType1Name = DNA_PERSONALITY_TYPES[type1]?.name || type1;
  const dnaType2Name = DNA_PERSONALITY_TYPES[type2]?.name || type2;
  const starring = `${name1} & ${name2}`;

  return {
    title,
    genre,
    starring,
    tagline,
    posterColor,
    accentColor,
    rating,
    runtime,
    year: new Date().getFullYear(),
    compatibilityScore: compatibilityResult?.score || 0,
    compatibilityReason,
    dnaProfiles: { user1: dnaType1Name, user2: dnaType2Name },
    shareText: `🎬 "${title}" — ${genre}\n⭐ ${starring}\n💬 "${tagline}"\n\nFound on Netflix & Chill #MovieDNA`,
    generatedAt: new Date().toISOString()
  };
}

module.exports = { generateLoveStoryMovie };
