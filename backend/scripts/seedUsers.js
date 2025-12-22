/**
 * User Database Seeder
 * Generates 100 fake users with complete profiles including TMDB data
 * 
 * Usage:
 *   node backend/scripts/seedUsers.js
 *   DB_TYPE=mongodb node backend/scripts/seedUsers.js
 *   node backend/scripts/seedUsers.js --count 50
 */

require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const User = require('../models/User');
const DatabaseFactory = require('../database/databaseFactory');
const streamingAPIService = require('../services/streamingAPIService');
const { fallbackGenres, fallbackProviders, fallbackMovies, fallbackTVShows } = require('../services/fallbackData');
const {
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
  generateQuizAttempts,
  generateGender,
  generateSexualOrientation,
  generateGenderPreference,
  generateSexualOrientationPreference
} = require('../utils/fakeDataGenerator');

// Configuration
const DEFAULT_USER_COUNT = 100;
const DEFAULT_PASSWORD = 'password123'; // Simple password for testing

/**
 * Fetch popular movies from TMDB API with retry logic
 * Falls back to sample movies if API is unavailable
 */
async function fetchPopularMovies() {
  try {
    const movies = await streamingAPIService.getPopularMovies();
    if (movies && movies.length > 0) {
      return movies;
    }
  } catch (error) {
    console.warn('Could not fetch popular movies from TMDB:', error.message);
  }
  // Return fallback movies when API is unavailable
  return fallbackMovies;
}

/**
 * Fetch popular TV shows from TMDB API with retry logic
 * Falls back to sample TV shows if API is unavailable
 */
async function fetchPopularTVShows() {
  try {
    const shows = await streamingAPIService.getPopularTVShows();
    if (shows && shows.length > 0) {
      return shows;
    }
  } catch (error) {
    console.warn('Could not fetch popular TV shows from TMDB:', error.message);
  }
  // Return fallback TV shows when API is unavailable
  return fallbackTVShows;
}

/**
 * Fetch genres from TMDB API
 */
async function fetchGenres() {
  try {
    const genres = await streamingAPIService.getAllGenres();
    if (genres && genres.length > 0) {
      return genres;
    }
  } catch (error) {
    console.warn('Could not fetch genres from TMDB:', error.message);
  }
  return fallbackGenres;
}

/**
 * Fetch streaming providers from TMDB API
 */
async function fetchProviders() {
  try {
    const providers = await streamingAPIService.getStreamingProviders('US');
    if (providers && providers.length > 0) {
      return providers;
    }
  } catch (error) {
    console.warn('Could not fetch providers from TMDB:', error.message);
  }
  return fallbackProviders;
}

/**
 * Generate watch history from movies and TV shows with weighted selection
 * Favors popular content to increase match probability
 */
function generateWatchHistory(movies, tvShows, streamingServices) {
  const watchHistory = [];
  const totalItems = randomInt(5, 20);
  
  // Use weighted selection - 70% probability from top 50% popular content
  const popularMovies = movies.slice(0, Math.ceil(movies.length / 2));
  const popularShows = tvShows.slice(0, Math.ceil(tvShows.length / 2));
  
  for (let i = 0; i < totalItems; i++) {
    const useMovie = Math.random() > 0.5;
    
    // 70% chance to pick from popular content (Math.random() > 0.3)
    const usePopular = Math.random() > 0.3; // 70% probability
    
    let item;
    if (useMovie) {
      const pool = usePopular && popularMovies.length > 0 ? popularMovies : movies;
      item = randomItem(pool.length > 0 ? pool : []);
    } else {
      const pool = usePopular && popularShows.length > 0 ? popularShows : tvShows;
      item = randomItem(pool.length > 0 ? pool : []);
    }
    
    if (!item) continue;
    
    const service = streamingServices.length > 0 
      ? randomItem(streamingServices)
      : { name: 'Netflix' };
    
    watchHistory.push({
      title: useMovie ? item.title : item.name,
      type: useMovie ? 'movie' : 'tvshow',
      genre: item.genre_ids ? item.genre_ids[0] : null,
      service: service.name,
      episodesWatched: useMovie ? 1 : randomInt(1, 24),
      posterPath: item.poster_path,
      tmdbId: item.id,
      watchedAt: new Date(Date.now() - randomInt(1, 365) * 24 * 60 * 60 * 1000).toISOString()
    });
  }
  
  return watchHistory;
}

/**
 * Generate favorite movies with weighted selection
 * Favors popular movies to increase match probability
 */
function generateFavoriteMovies(movies) {
  if (!movies || movies.length === 0) return [];
  
  const count = randomInt(2, 8);
  
  // Use weighted selection - 70% probability from top 50% popular content
  const popularMovies = movies.slice(0, Math.ceil(movies.length / 2));
  const selected = [];
  
  for (let i = 0; i < count; i++) {
    const usePopular = Math.random() > 0.3; // 70% probability
    const pool = usePopular && popularMovies.length > 0 ? popularMovies : movies;
    
    // Avoid duplicates
    const available = pool.filter(m => 
      !selected.some(s => s.id === m.id)
    );
    
    if (available.length > 0) {
      selected.push(randomItem(available));
    }
  }
  
  return selected.map(movie => ({
    tmdbId: movie.id,
    title: movie.title,
    posterPath: movie.poster_path,
    overview: movie.overview,
    releaseDate: movie.release_date,
    addedAt: new Date(Date.now() - randomInt(1, 365) * 24 * 60 * 60 * 1000).toISOString()
  }));
}

/**
 * Generate favorite TV shows with weighted selection
 * Favors popular shows to increase match probability
 */
function generateFavoriteTVShows(tvShows) {
  if (!tvShows || tvShows.length === 0) return [];
  
  const count = randomInt(2, 8);
  
  // Use weighted selection - 70% probability from top 50% popular content
  const popularShows = tvShows.slice(0, Math.ceil(tvShows.length / 2));
  const selected = [];
  
  for (let i = 0; i < count; i++) {
    const usePopular = Math.random() > 0.3; // 70% probability
    const pool = usePopular && popularShows.length > 0 ? popularShows : tvShows;
    
    // Avoid duplicates
    const available = pool.filter(s => 
      !selected.some(sel => sel.id === s.id)
    );
    
    if (available.length > 0) {
      selected.push(randomItem(available));
    }
  }
  
  return selected.map(show => ({
    tmdbId: show.id,
    title: show.name,
    posterPath: show.poster_path,
    overview: show.overview,
    firstAirDate: show.first_air_date,
    addedAt: new Date(Date.now() - randomInt(1, 365) * 24 * 60 * 60 * 1000).toISOString()
  }));
}

/**
 * Generate movie ratings
 */
function generateMovieRatings(movies) {
  if (!movies || movies.length === 0) return [];
  
  const count = randomInt(3, 12);
  const selected = randomItems(movies, count);
  
  return selected.map(movie => ({
    tmdbId: movie.id,
    title: movie.title,
    rating: randomInt(1, 10),
    posterPath: movie.poster_path,
    ratedAt: new Date(Date.now() - randomInt(1, 365) * 24 * 60 * 60 * 1000).toISOString()
  }));
}

/**
 * Generate movie watchlist
 */
function generateMovieWatchlist(movies) {
  if (!movies || movies.length === 0) return [];
  
  const count = randomInt(3, 10);
  const selected = randomItems(movies, count);
  
  return selected.map(movie => ({
    tmdbId: movie.id,
    title: movie.title,
    posterPath: movie.poster_path,
    overview: movie.overview,
    releaseDate: movie.release_date,
    addedAt: new Date(Date.now() - randomInt(1, 90) * 24 * 60 * 60 * 1000).toISOString()
  }));
}

/**
 * Generate TV watchlist
 */
function generateTVWatchlist(tvShows) {
  if (!tvShows || tvShows.length === 0) return [];
  
  const count = randomInt(3, 10);
  const selected = randomItems(tvShows, count);
  
  return selected.map(show => ({
    tmdbId: show.id,
    title: show.name,
    posterPath: show.poster_path,
    overview: show.overview,
    firstAirDate: show.first_air_date,
    addedAt: new Date(Date.now() - randomInt(1, 90) * 24 * 60 * 60 * 1000).toISOString()
  }));
}

/**
 * Generate least favorite movies (random selection for debate)
 */
function generateLeastFavoriteMovies(movies) {
  if (!movies || movies.length === 0) return [];
  
  const count = randomInt(0, 3);
  const selected = randomItems(movies, count);
  
  return selected.map(movie => movie.title);
}

/**
 * Create a single fake user with all data
 */
async function createFakeUser(index, movies, tvShows, genres, providers) {
  const firstName = randomItem(firstNames);
  const lastName = randomItem(lastNames);
  const username = generateUsername(firstName, lastName);
  const email = generateEmail(username);
  
  const streamingServices = generateStreamingServices(providers);
  const genrePreferences = generateGenrePreferences(genres);
  
  const gender = generateGender();
  const sexualOrientation = generateSexualOrientation();
  const genderPreference = generateGenderPreference(gender, sexualOrientation);
  const sexualOrientationPreference = generateSexualOrientationPreference();
  
  const userData = {
    username,
    email,
    password: DEFAULT_PASSWORD,
    age: randomInt(21, 55),
    location: randomItem(cities),
    gender,
    sexualOrientation,
    bio: generateBio(),
    profilePicture: generateProfilePicture(`${firstName} ${lastName}`),
    photoGallery: generatePhotoGallery(`${firstName} ${lastName}`, randomInt(2, 6)),
    streamingServices,
    watchHistory: generateWatchHistory(movies, tvShows, streamingServices),
    preferences: {
      genres: genrePreferences,
      bingeWatchCount: randomInt(1, 15),
      ageRange: {
        min: randomInt(18, 30),
        max: randomInt(40, 65)
      },
      locationRadius: randomItem([10, 25, 50, 100, 250]),
      genderPreference,
      sexualOrientationPreference
    },
    favoriteMovies: generateFavoriteMovies(movies),
    favoriteTVShows: generateFavoriteTVShows(tvShows),
    movieRatings: generateMovieRatings(movies),
    movieWatchlist: generateMovieWatchlist(movies),
    tvWatchlist: generateTVWatchlist(tvShows),
    leastFavoriteMovies: generateLeastFavoriteMovies(movies),
    movieDebateTopics: generateMovieDebateTopics(),
    favoriteSnacks: generateFavoriteSnacks(),
    quizResponses: generateQuizResponses(),
    videoChatPreference: generateVideoChatPreference()
  };
  
  const user = new User(userData);
  
  // Generate quiz attempts for approximately 70% of users
  if (Math.random() < 0.7) {
    const MovieQuizScoring = require('../utils/movieQuizScoring');
    const quizAttempts = generateQuizAttempts(user.id, 1);
    user.quizAttempts = quizAttempts;
    
    // Set personality profile and bio from latest attempt
    if (quizAttempts.length > 0) {
      const latestAttempt = quizAttempts[0];
      user.personalityProfile = latestAttempt.personalityTraits;
      user.personalityBio = MovieQuizScoring.generatePersonalityBio(latestAttempt.personalityTraits);
      user.lastQuizCompletedAt = latestAttempt.completedAt;
      
      // Assign primary archetype to user (same as API does)
      if (latestAttempt.personalityTraits.archetypes && latestAttempt.personalityTraits.archetypes.length > 0) {
        user.archetype = latestAttempt.personalityTraits.archetypes[0];
      }
    }
  }
  
  // Return user data with password for storage
  return { ...user.toJSON(), password: user.password };
}

/**
 * Generate test credentials file
 */
async function generateCredentialsFile(users, outputPath) {
  const timestamp = new Date().toISOString();
  
  // Create markdown table
  let markdown = `# Netflix and Chill - Test User Credentials\n\n`;
  markdown += `Generated: ${timestamp}\n`;
  markdown += `Total Users: ${users.length}\n`;
  markdown += `Default Password: ${DEFAULT_PASSWORD}\n\n`;
  markdown += `## Quick Reference\n\n`;
  markdown += `| # | Username | Email | Password | Age | Location |\n`;
  markdown += `|---|----------|-------|----------|-----|----------|\n`;
  
  users.forEach((user, index) => {
    markdown += `| ${index + 1} | ${user.username} | ${user.email} | ${user.password} | ${user.age} | ${user.location} |\n`;
  });
  
  markdown += `\n## Login Instructions\n\n`;
  markdown += `1. Start the server: \`npm start\`\n`;
  markdown += `2. Open the app in your browser\n`;
  markdown += `3. Use any email from above with password: \`${DEFAULT_PASSWORD}\`\n\n`;
  
  markdown += `## Sample Users for Testing\n\n`;
  markdown += `Here are the first 5 users for quick copy-paste:\n\n`;
  
  users.slice(0, 5).forEach((user, index) => {
    markdown += `### User ${index + 1}: ${user.username}\n`;
    markdown += `- **Email**: \`${user.email}\`\n`;
    markdown += `- **Password**: \`${user.password}\`\n`;
    markdown += `- **Age**: ${user.age}\n`;
    markdown += `- **Location**: ${user.location}\n`;
    markdown += `- **Bio**: ${user.bio}\n`;
    markdown += `- **Streaming Services**: ${user.streamingServices.map(s => s.name).join(', ')}\n`;
    markdown += `- **Favorite Genres**: ${user.preferences.genres.map(g => g.name).join(', ')}\n`;
    markdown += `- **Favorite Movies**: ${user.favoriteMovies.length}\n`;
    markdown += `- **Favorite TV Shows**: ${user.favoriteTVShows.length}\n\n`;
  });
  
  // Also create a simple JSON file for programmatic access
  const jsonCredentials = users.map((user, index) => ({
    number: index + 1,
    username: user.username,
    email: user.email,
    password: user.password,
    age: user.age,
    location: user.location
  }));
  
  const jsonPath = outputPath.replace('.md', '.json');
  
  await fs.writeFile(outputPath, markdown, 'utf8');
  await fs.writeFile(jsonPath, JSON.stringify(jsonCredentials, null, 2), 'utf8');
  
  return { markdown: outputPath, json: jsonPath };
}

/**
 * Main seeder function
 */
async function seedUsers(count = DEFAULT_USER_COUNT) {
  let database;
  
  try {
    console.log('🎬 Netflix and Chill User Seeder');
    console.log('================================\n');
    
    // Parse command line arguments
    const args = process.argv.slice(2);
    const countArg = args.find(arg => arg.startsWith('--count='));
    if (countArg) {
      const countValue = countArg.split('=')[1];
      if (!countValue || countValue.trim() === '') {
        console.error('❌ Invalid count value. Please provide a count like: --count=50');
        process.exit(1);
      }
      const parsedCount = parseInt(countValue, 10);
      if (isNaN(parsedCount) || parsedCount < 1) {
        console.error('❌ Invalid count value. Please provide a positive integer.');
        process.exit(1);
      }
      count = parsedCount;
    }
    
    console.log(`📊 Generating ${count} fake users...\n`);
    
    // Initialize database
    console.log('🔌 Connecting to database...');
    database = await DatabaseFactory.createDatabase();
    console.log('✅ Database connected\n');
    
    // Fetch TMDB data
    console.log('🎥 Fetching data from TMDB API...');
    const [movies, tvShows, genres, providers] = await Promise.all([
      fetchPopularMovies(),
      fetchPopularTVShows(),
      fetchGenres(),
      fetchProviders()
    ]);
    
    console.log(`  ✓ Fetched ${movies.length} popular movies`);
    console.log(`  ✓ Fetched ${tvShows.length} popular TV shows`);
    console.log(`  ✓ Fetched ${genres.length} genres`);
    console.log(`  ✓ Fetched ${providers.length} streaming providers\n`);
    
    // Generate users
    console.log('👥 Generating user profiles...');
    const users = [];
    for (let i = 0; i < count; i++) {
      const user = await createFakeUser(i, movies, tvShows, genres, providers);
      users.push(user);
      
      // Show progress
      if ((i + 1) % 10 === 0 || i === count - 1) {
        console.log(`  Created ${i + 1}/${count} users...`);
      }
    }
    
    // Save users to database
    console.log('\n💾 Saving users to database...');
    for (let i = 0; i < users.length; i++) {
      await database.addUser(users[i]);
      
      // Show progress
      if ((i + 1) % 10 === 0 || i === users.length - 1) {
        console.log(`  Saved ${i + 1}/${users.length} users...`);
      }
    }
    
    console.log('\n✅ Successfully created and saved all users!');
    
    // Generate credentials file
    console.log('\n📄 Generating test credentials file...');
    const credentialsPath = path.join(__dirname, '../../TEST_CREDENTIALS.md');
    const { markdown: markdownPath, json: jsonPath } = await generateCredentialsFile(users, credentialsPath);
    console.log(`  ✓ Markdown file: ${path.relative(process.cwd(), markdownPath)}`);
    console.log(`  ✓ JSON file: ${path.relative(process.cwd(), jsonPath)}`);
    
    console.log(`\n📝 Summary:`);
    console.log(`   - Total users: ${count}`);
    console.log(`   - Default password: ${DEFAULT_PASSWORD}`);
    console.log(`   - Database type: ${process.env.DB_TYPE || 'file'}`);
    console.log(`   - Credentials file: ${path.relative(process.cwd(), markdownPath)}`);
    console.log(`\n💡 You can now login with any user's email and password: ${DEFAULT_PASSWORD}`);
    console.log(`\n💡 To pre-generate matches for testing, run: npm run seed:matches`);
    
  } catch (error) {
    console.error('\n❌ Error seeding users:', error);
    throw error;
  } finally {
    // Disconnect from database
    if (database && typeof database.disconnect === 'function') {
      await database.disconnect();
      console.log('\n🔌 Database disconnected');
    }
  }
}

// Run seeder if executed directly
if (require.main === module) {
  seedUsers()
    .then(() => {
      console.log('\n🎉 Seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedUsers, createFakeUser };
