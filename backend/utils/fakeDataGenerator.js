/**
 * Fake data generator utilities for creating realistic user profiles
 */

// Sample data pools
const firstNames = [
  'Alex', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Avery', 'Quinn',
  'Blake', 'Jamie', 'Cameron', 'Dakota', 'Reese', 'Skyler', 'Parker', 'Sage',
  'River', 'Phoenix', 'Charlie', 'Rowan', 'Hayden', 'Emerson', 'Finley', 'Drew',
  'Sam', 'Pat', 'Chris', 'Jesse', 'Kai', 'Ellis', 'Peyton', 'Logan',
  'Dylan', 'Ryan', 'Adrian', 'Andy', 'Robin', 'Ash', 'Kendall', 'Micah',
  'Spencer', 'Remy', 'Oakley', 'Lennon', 'Ari', 'Bailey', 'Blair', 'Brooks',
  'Carson', 'Eden', 'Eliot', 'Gray', 'Harper', 'Indigo', 'Jules'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White',
  'Harris', 'Clark', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King',
  'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams',
  'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'
];

const cities = [
  'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ',
  'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX', 'San Jose, CA',
  'Austin, TX', 'Jacksonville, FL', 'Fort Worth, TX', 'Columbus, OH', 'Charlotte, NC',
  'San Francisco, CA', 'Indianapolis, IN', 'Seattle, WA', 'Denver, CO', 'Boston, MA',
  'Nashville, TN', 'Portland, OR', 'Las Vegas, NV', 'Detroit, MI', 'Memphis, TN',
  'Louisville, KY', 'Baltimore, MD', 'Milwaukee, WI', 'Albuquerque, NM', 'Tucson, AZ',
  'Mesa, AZ', 'Atlanta, GA', 'Colorado Springs, CO', 'Raleigh, NC', 'Miami, FL',
  'Long Beach, CA', 'Oakland, CA', 'Minneapolis, MN', 'Tampa, FL', 'Cleveland, OH'
];

const bioTemplates = [
  'Movie buff looking for someone to share popcorn with 🍿',
  'Binge-watcher seeking a partner in crime for late-night marathons',
  'Love rom-coms and horror equally. Let\'s debate which is better!',
  'Netflix addict ready to find my streaming soulmate',
  'Sci-fi enthusiast looking for someone who gets my references',
  'Documentary lover who also enjoys a good comedy',
  'Action movie fan who needs someone to watch explosions with',
  'Hopeless romantic seeking my co-star in life',
  'Mystery and thriller lover looking for plot twists in dating',
  'Animation fan - from Pixar to anime, I love it all',
  'Looking for someone to discuss cliffhangers and plot holes with',
  'Weekend warrior binge-watcher seeking my perfect match',
  'Marvel or DC? Let\'s settle this over coffee and streaming',
  'True crime documentaries are my guilty pleasure',
  'Can quote entire movies. Is that a red flag or a green flag?',
  'Streaming service collector looking for someone to share accounts with (jk... unless?)',
  'Love indie films and blockbusters equally',
  'Seeking someone who won\'t judge my guilty pleasure shows',
  'Film critic wannabe looking for a co-reviewer',
  'Just here to find someone who won\'t spoil the ending'
];

const snacks = [
  'Popcorn (Classic Butter)', 'Sweet & Salty Popcorn', 'Caramel Popcorn',
  'Nachos with Cheese', 'M&Ms', 'Skittles', 'Sour Patch Kids', 'Gummy Bears',
  'Chocolate Covered Pretzels', 'Trail Mix', 'Ice Cream', 'Pizza',
  'Chips and Salsa', 'Cookie Dough', 'Brownies', 'Candy Corn',
  'Fruit Snacks', 'Cheese and Crackers', 'Pretzels', 'Peanut Butter Cups'
];

const movieDebateTopics = [
  'Is Die Hard a Christmas movie?',
  'Books vs Movies: Which is better?',
  'Are sequels ever better than originals?',
  'Subtitles: On or Off?',
  'Marvel vs DC: The eternal debate',
  'Are remakes necessary?',
  'Theater experience vs Home streaming?',
  'Should I watch in chronological or release order?',
  'Are plot holes deal-breakers?',
  'Is it okay to use your phone during a movie?',
  'Dubbed vs Subtitled foreign films?',
  'Are biopics accurate enough?',
  'Should actors\' personal lives affect our viewing?',
  'Are superhero movies getting too repetitive?',
  'Is rewatching movies a waste of time?'
];

/**
 * Generate a random integer between min and max (inclusive)
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Get random item from an array
 */
function randomItem(array) {
  if (array.length === 0) {
    return null;
  }
  return array[randomInt(0, array.length - 1)];
}

/**
 * Get random items from an array using Fisher-Yates shuffle
 */
function randomItems(array, count) {
  if (array.length === 0) {
    return [];
  }
  const shuffled = [...array];
  // Fisher-Yates shuffle
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(count, array.length));
}

/**
 * Generate a fake username
 */
function generateUsername(firstName, lastName) {
  const patterns = [
    () => `${firstName}${lastName}${randomInt(1, 999)}`,
    () => `${firstName.toLowerCase()}_${lastName.toLowerCase()}`,
    () => `${firstName.toLowerCase()}${randomInt(1990, 2005)}`,
    () => `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
    () => `${lastName.toLowerCase()}_${firstName.toLowerCase()}`,
    () => `${firstName.toLowerCase()}${lastName.charAt(0).toLowerCase()}${randomInt(1, 99)}`
  ];
  return randomItem(patterns)();
}

/**
 * Generate a fake email
 */
function generateEmail(username) {
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'];
  return `${username.toLowerCase()}@${randomItem(domains)}`;
}

/**
 * Generate a fake bio
 */
function generateBio() {
  return randomItem(bioTemplates);
}

/**
 * Generate a profile picture URL (using placeholder service)
 */
function generateProfilePicture(seed) {
  // Using UI Avatars as a placeholder service
  // Using a hash-based background for consistency
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colors = ['007bff', 'dc3545', '28a745', 'ffc107', '17a2b8', '6f42c1', 'e83e8c', 'fd7e14'];
  const bgColor = colors[hash % colors.length];
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(seed)}&size=200&background=${bgColor}&color=fff`;
}

/**
 * Generate photo gallery URLs
 */
function generatePhotoGallery(seed, count = 3) {
  const photos = [];
  const colors = ['007bff', 'dc3545', '28a745', 'ffc107', '17a2b8', '6f42c1', 'e83e8c', 'fd7e14'];
  for (let i = 0; i < count; i++) {
    const hash = (seed + i).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const bgColor = colors[hash % colors.length];
    photos.push({
      url: `https://ui-avatars.com/api/?name=${encodeURIComponent(seed + i)}&size=400&background=${bgColor}&color=fff`,
      uploadedAt: new Date(Date.now() - randomInt(1, 365) * 24 * 60 * 60 * 1000).toISOString()
    });
  }
  return photos;
}

/**
 * Generate streaming services for a user
 */
function generateStreamingServices(providers) {
  const count = randomInt(2, 5);
  const selectedProviders = randomItems(providers, count);
  
  return selectedProviders.map(provider => ({
    id: provider.id,
    name: provider.name,
    logoPath: provider.logoPath,
    logoUrl: provider.logoUrl,
    connected: true,
    connectedAt: new Date(Date.now() - randomInt(30, 365) * 24 * 60 * 60 * 1000).toISOString()
  }));
}

/**
 * Generate genre preferences
 */
function generateGenrePreferences(genres) {
  const count = randomInt(3, 8);
  return randomItems(genres, count);
}

/**
 * Generate favorite snacks
 */
function generateFavoriteSnacks() {
  const count = randomInt(1, 4);
  return randomItems(snacks, count);
}

/**
 * Generate movie debate topics
 */
function generateMovieDebateTopics() {
  const count = randomInt(1, 3);
  return randomItems(movieDebateTopics, count);
}

/**
 * Generate video chat preference
 */
function generateVideoChatPreference() {
  const options = ['facetime', 'zoom', 'either', null];
  return randomItem(options);
}

/**
 * Generate quiz responses
 */
function generateQuizResponses() {
  return {
    watchAlone: randomItem(['Always', 'Sometimes', 'Rarely', 'Never']),
    pauseForSnacks: randomItem(['Yes', 'No', 'Depends']),
    spoilerTolerance: randomItem(['Love them', 'Hate them', 'Neutral']),
    criticalViewer: randomItem(['Very critical', 'Somewhat critical', 'Not critical']),
    rewatch: randomItem(['Often', 'Sometimes', 'Rarely', 'Never'])
  };
}

/**
 * Generate gender
 */
function generateGender() {
  const genders = ['male', 'female', 'non-binary', 'other', ''];
  const weights = [45, 45, 5, 3, 2]; // Weighted distribution
  const total = weights.reduce((sum, w) => sum + w, 0);
  const rand = Math.random() * total;
  let sum = 0;
  for (let i = 0; i < genders.length; i++) {
    sum += weights[i];
    if (rand < sum) {
      return genders[i];
    }
  }
  return genders[0];
}

/**
 * Generate sexual orientation
 */
function generateSexualOrientation() {
  const orientations = ['straight', 'gay', 'lesbian', 'bisexual', 'pansexual', 'asexual', 'other', ''];
  const weights = [60, 15, 10, 8, 3, 2, 1, 1]; // Weighted distribution
  const total = weights.reduce((sum, w) => sum + w, 0);
  const rand = Math.random() * total;
  let sum = 0;
  for (let i = 0; i < orientations.length; i++) {
    sum += weights[i];
    if (rand < sum) {
      return orientations[i];
    }
  }
  return orientations[0];
}

/**
 * Generate gender preferences based on sexual orientation
 */
function generateGenderPreference(gender, sexualOrientation) {
  // If no orientation specified, return any
  if (!sexualOrientation) {
    return ['any'];
  }
  
  // Generate preferences based on orientation
  switch (sexualOrientation) {
    case 'straight':
      if (gender === 'male') return ['female'];
      if (gender === 'female') return ['male'];
      return ['any'];
    case 'gay':
      return ['male'];
    case 'lesbian':
      return ['female'];
    case 'bisexual':
    case 'pansexual':
      return ['male', 'female', 'non-binary', 'other'];
    case 'asexual':
      // Asexual people can still have romantic preferences
      return Math.random() > 0.5 ? ['any'] : randomItems(['male', 'female', 'non-binary'], randomInt(1, 3));
    default:
      return ['any'];
  }
}

/**
 * Generate sexual orientation preferences
 */
function generateSexualOrientationPreference() {
  // Most people are open to any orientation
  const options = [
    ['any'],
    ['straight', 'bisexual', 'pansexual'],
    ['gay', 'bisexual', 'pansexual'],
    ['lesbian', 'bisexual', 'pansexual'],
    ['bisexual', 'pansexual'],
    ['any']
  ];
  const weights = [70, 10, 8, 8, 2, 2];
  const total = weights.reduce((sum, w) => sum + w, 0);
  const rand = Math.random() * total;
  let sum = 0;
  for (let i = 0; i < options.length; i++) {
    sum += weights[i];
    if (rand < sum) {
      return options[i];
    }
  }
  return ['any'];
}

module.exports = {
  firstNames,
  lastNames,
  cities,
  randomInt,
  randomItem,
  randomItems,
  generateUsername,
  generateEmail,
  generateBio,
  generateProfilePicture,
  generatePhotoGallery,
  generateStreamingServices,
  generateGenrePreferences,
  generateFavoriteSnacks,
  generateMovieDebateTopics,
  generateVideoChatPreference,
  generateQuizResponses,
  generateGender,
  generateSexualOrientation,
  generateGenderPreference,
  generateSexualOrientationPreference
};
