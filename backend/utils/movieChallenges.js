/**
 * First Date Movie Challenges
 *
 * Instead of awkward text chatting, the app suggests movie-based icebreaker
 * challenges between matched users:
 *
 *   1. 🎥 Quote Battle     — Finish the movie quote
 *   2. 🎬 Guess My Movie   — Describe a movie badly
 *   3. 🍿 Watch Together   — Watch a 10-minute scene together in the app
 *   4. 🎭 Hot Take Duel    — Share your most controversial movie opinion
 *   5. 🎯 Blind Rank       — Both rank 5 movies; compare results
 *
 * Feature 3 from requirements: "First Date Movie Challenge"
 */

const QUOTE_BATTLES = [
  {
    id: 'qb_1',
    movie: 'The Godfather',
    partial: '"I\'m gonna make him an offer…"',
    completion: 'he can\'t refuse.',
    difficulty: 'easy'
  },
  {
    id: 'qb_2',
    movie: 'Forrest Gump',
    partial: '"Life is like a box of chocolates…"',
    completion: 'you never know what you\'re gonna get.',
    difficulty: 'easy'
  },
  {
    id: 'qb_3',
    movie: 'The Dark Knight',
    partial: '"Why so…"',
    completion: 'serious?',
    difficulty: 'easy'
  },
  {
    id: 'qb_4',
    movie: 'Titanic',
    partial: '"I\'m the king…"',
    completion: 'of the world!',
    difficulty: 'easy'
  },
  {
    id: 'qb_5',
    movie: 'The Princess Bride',
    partial: '"You keep using that word. I do not think it means…"',
    completion: 'what you think it means.',
    difficulty: 'medium'
  },
  {
    id: 'qb_6',
    movie: 'Casablanca',
    partial: '"Here\'s looking at you…"',
    completion: 'kid.',
    difficulty: 'medium'
  },
  {
    id: 'qb_7',
    movie: 'La La Land',
    partial: '"Here\'s to the ones who dream…"',
    completion: 'foolish as they may seem.',
    difficulty: 'medium'
  },
  {
    id: 'qb_8',
    movie: 'Inception',
    partial: '"You mustn\'t be afraid to dream a little…"',
    completion: 'bigger, darling.',
    difficulty: 'medium'
  },
  {
    id: 'qb_9',
    movie: 'Parasite',
    partial: '"You know what kind of plan…"',
    completion: 'never fails? No plan at all.',
    difficulty: 'hard'
  },
  {
    id: 'qb_10',
    movie: 'Mulholland Drive',
    partial: '"No hay banda. There is no band. It is all…"',
    completion: 'a recording.',
    difficulty: 'hard'
  },
  {
    id: 'qb_11',
    movie: 'Spirited Away',
    partial: '"Once you\'ve met someone you never really forget them. It just takes a while…"',
    completion: 'for your memories to return.',
    difficulty: 'hard'
  },
  {
    id: 'qb_12',
    movie: 'Good Will Hunting',
    partial: '"It\'s not your fault." "I know." "No, look at me son. It\'s not…"',
    completion: 'your fault.',
    difficulty: 'medium'
  }
];

const GUESS_MY_MOVIE_PROMPTS = [
  {
    id: 'gmm_1',
    badDescription: 'Rich kid throws a bunch of parties to impress his ex. Does not go well.',
    answer: 'The Great Gatsby',
    genre: 'Drama/Romance'
  },
  {
    id: 'gmm_2',
    badDescription: 'Man gets on a bus and accidentally saves everyone\'s life by staying seated.',
    answer: 'Speed',
    genre: 'Action Thriller'
  },
  {
    id: 'gmm_3',
    badDescription: 'A fish mom forgets where she\'s going but keeps swimming anyway.',
    answer: 'Finding Dory',
    genre: 'Animation'
  },
  {
    id: 'gmm_4',
    badDescription: 'Guy wears a nice suit and shoots people. Somehow also heartwarming.',
    answer: 'John Wick',
    genre: 'Action'
  },
  {
    id: 'gmm_5',
    badDescription: 'Italian plumber eats mushrooms to get bigger. The movie.',
    answer: 'The Super Mario Bros. Movie',
    genre: 'Animation'
  },
  {
    id: 'gmm_6',
    badDescription: 'Time traveller keeps going back to make sure his parents kiss at prom.',
    answer: 'Back to the Future',
    genre: 'Sci-Fi/Comedy'
  },
  {
    id: 'gmm_7',
    badDescription: 'A man falls asleep and everything changes. His wife remarries. He\'s mad.',
    answer: 'Rip Van Winkle (but really: Avengers: Endgame)',
    genre: 'Sci-Fi/Action'
  },
  {
    id: 'gmm_8',
    badDescription: 'Two old people sit on a bench and one of them reads to the other.',
    answer: 'The Notebook',
    genre: 'Romance'
  },
  {
    id: 'gmm_9',
    badDescription: 'Kids ride bikes around town and one of their friends is an alien.',
    answer: 'E.T.',
    genre: 'Sci-Fi/Family'
  },
  {
    id: 'gmm_10',
    badDescription: 'A lawyer argues with everyone while 11 other guys are confused.',
    answer: '12 Angry Men',
    genre: 'Drama'
  },
  {
    id: 'gmm_11',
    badDescription: 'Corporate guy goes on vacation and ends up running a company.',
    answer: 'The Secret Life of Walter Mitty',
    genre: 'Drama/Adventure'
  },
  {
    id: 'gmm_12',
    badDescription: 'Two people hate each other on a boat. But the boat sinks, so now they love each other.',
    answer: 'Titanic',
    genre: 'Romance/Disaster'
  }
];

const WATCH_TOGETHER_MINI_DATES = [
  {
    id: 'wtmd_1',
    title: 'The Balcony Scene',
    movie: 'La La Land',
    description: 'Watch the opening 10-minute traffic-jam musical sequence together',
    duration: '10 min',
    mood: 'romantic',
    discussionPrompt: 'Would you have honked your horn or joined the dance?'
  },
  {
    id: 'wtmd_2',
    title: 'Opening Monologue',
    movie: 'Ferris Bueller\'s Day Off',
    description: 'Watch Ferris break the fourth wall and make his pitch for the day off',
    duration: '8 min',
    mood: 'chaotic',
    discussionPrompt: 'Would you have called in sick and dragged your best friend along?'
  },
  {
    id: 'wtmd_3',
    title: 'The Entry Scene',
    movie: 'The Grand Budapest Hotel',
    description: 'Watch Gustave H. arrive at the hotel and establish the entire world in minutes',
    duration: '12 min',
    mood: 'whimsical',
    discussionPrompt: 'Which role would you play — the guest, the concierge, or the lobby boy?'
  },
  {
    id: 'wtmd_4',
    title: 'The Coffee Scene',
    movie: 'Lost in Translation',
    description: 'Watch the quiet, charged early scenes between Bob and Charlotte',
    duration: '10 min',
    mood: 'melancholy',
    discussionPrompt: 'Have you ever felt this alone in a crowded room?'
  },
  {
    id: 'wtmd_5',
    title: 'The Negotiation',
    movie: 'Knives Out',
    description: 'Watch Benoit Blanc\'s first interview scene — pure wit and suspense',
    duration: '9 min',
    mood: 'suspenseful',
    discussionPrompt: 'Did you figure out who did it before he finished talking?'
  },
  {
    id: 'wtmd_6',
    title: 'First Arrival',
    movie: 'Spirited Away',
    description: 'Watch Chihiro arrive at the spirit world and enter the bathhouse',
    duration: '11 min',
    mood: 'wonder',
    discussionPrompt: 'What spirit world job would you want?'
  }
];

const HOT_TAKE_DUELS = [
  {
    id: 'htd_1',
    prompt: 'The ending of La La Land was perfect.',
    sides: ['It\'s perfect — bittersweet and true', 'They should have ended up together — period'],
    emoji: '🎭'
  },
  {
    id: 'htd_2',
    prompt: 'Sequels are almost always worse than the original.',
    sides: ['Sequels dilute greatness', 'Some sequels surpass the original (Aliens, The Dark Knight)'],
    emoji: '🎬'
  },
  {
    id: 'htd_3',
    prompt: 'Watching movies alone is better than watching with others.',
    sides: ['Solo viewing is purer', 'Shared reactions make movies richer'],
    emoji: '🍿'
  },
  {
    id: 'htd_4',
    prompt: 'A villain you understand is scarier than one you don\'t.',
    sides: ['Understandable evil is terrifying', 'Pure unknowable evil is worse'],
    emoji: '😈'
  },
  {
    id: 'htd_5',
    prompt: 'The book is always better than the movie.',
    sides: ['Books allow full imagination', 'Great adaptations can surpass the source'],
    emoji: '📚'
  },
  {
    id: 'htd_6',
    prompt: 'Horror movies are more about society than about scares.',
    sides: ['Horror is pure entertainment', 'The best horror is social commentary'],
    emoji: '👻'
  }
];

const BLIND_RANK_LISTS = [
  {
    id: 'br_1',
    theme: 'Greatest Opening Scenes',
    movies: ['Inglourious Basterds', 'The Dark Knight', 'Up', 'Saving Private Ryan', 'There Will Be Blood']
  },
  {
    id: 'br_2',
    theme: 'Best Movie Villains',
    characters: ['Thanos', 'Hans Landa', 'Amy Dunne', 'Anton Chigurh', 'The Joker (Heath Ledger)']
  },
  {
    id: 'br_3',
    theme: 'Most Heartbreaking Moments',
    moments: ['Up montage', 'Mufasa dies', 'Hachiko waits', 'La La Land ending', 'Toy Story 3 furnace']
  },
  {
    id: 'br_4',
    theme: 'Perfect Date Night Movies',
    movies: ['When Harry Met Sally', 'Crazy, Stupid, Love', '500 Days of Summer', 'The Notebook', 'Before Sunrise']
  }
];

/**
 * Get a random challenge for a pair of users.
 * @param {string} type - 'quote', 'guess', 'watch', 'hottake', 'rank', or null for random
 * @returns {Object} challenge object
 */
function getRandomChallenge(type) {
  const challengeTypes = ['quote', 'guess', 'watch', 'hottake', 'rank'];
  const selected = type || challengeTypes[Math.floor(Math.random() * challengeTypes.length)];

  switch (selected) {
    case 'quote':
      return { type: 'Quote Battle', emoji: '🎥', ...QUOTE_BATTLES[Math.floor(Math.random() * QUOTE_BATTLES.length)] };
    case 'guess':
      return { type: 'Guess My Movie', emoji: '🎬', ...GUESS_MY_MOVIE_PROMPTS[Math.floor(Math.random() * GUESS_MY_MOVIE_PROMPTS.length)] };
    case 'watch':
      return { type: 'Watch Together Mini-Date', emoji: '🍿', ...WATCH_TOGETHER_MINI_DATES[Math.floor(Math.random() * WATCH_TOGETHER_MINI_DATES.length)] };
    case 'hottake':
      return { type: 'Hot Take Duel', emoji: '🔥', ...HOT_TAKE_DUELS[Math.floor(Math.random() * HOT_TAKE_DUELS.length)] };
    case 'rank':
      return { type: 'Blind Rank', emoji: '🎯', ...BLIND_RANK_LISTS[Math.floor(Math.random() * BLIND_RANK_LISTS.length)] };
    default:
      return { type: 'Quote Battle', emoji: '🎥', ...QUOTE_BATTLES[0] };
  }
}

/**
 * Get all challenge types for display.
 */
function getAllChallengeTypes() {
  return [
    { id: 'quote', name: 'Quote Battle', emoji: '🎥', description: 'Finish the movie quote — easy or fiendishly hard.', count: QUOTE_BATTLES.length },
    { id: 'guess', name: 'Guess My Movie', emoji: '🎬', description: 'Describe a movie badly. Make them guess.', count: GUESS_MY_MOVIE_PROMPTS.length },
    { id: 'watch', name: 'Watch Together Mini-Date', emoji: '🍿', description: 'Watch a 10-minute scene together in the app.', count: WATCH_TOGETHER_MINI_DATES.length },
    { id: 'hottake', name: 'Hot Take Duel', emoji: '🔥', description: 'Share your most controversial movie opinion.', count: HOT_TAKE_DUELS.length },
    { id: 'rank', name: 'Blind Rank', emoji: '🎯', description: 'Both rank the same 5 movies. Compare results.', count: BLIND_RANK_LISTS.length }
  ];
}

module.exports = {
  QUOTE_BATTLES,
  GUESS_MY_MOVIE_PROMPTS,
  WATCH_TOGETHER_MINI_DATES,
  HOT_TAKE_DUELS,
  BLIND_RANK_LISTS,
  getRandomChallenge,
  getAllChallengeTypes
};
