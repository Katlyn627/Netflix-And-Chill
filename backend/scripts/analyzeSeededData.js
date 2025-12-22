/**
 * Analyze seeded data to verify overlap improvements
 */
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../../data/users.json');
const users = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

console.log('Analyzing Seeded User Data\n');
console.log('========================================\n');

// Analyze streaming services
const serviceCount = {};
users.forEach(user => {
  user.streamingServices.forEach(service => {
    serviceCount[service.name] = (serviceCount[service.name] || 0) + 1;
  });
});

console.log('Top 10 Most Common Streaming Services:');
Object.entries(serviceCount)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .forEach(([service, count]) => {
    const percentage = ((count / users.length) * 100).toFixed(1);
    console.log(`  ${service}: ${count}/${users.length} users (${percentage}%)`);
  });

// Analyze genres
const genreCount = {};
users.forEach(user => {
  if (user.preferences && user.preferences.genres) {
    user.preferences.genres.forEach(genre => {
      const genreName = typeof genre === 'string' ? genre : genre.name;
      genreCount[genreName] = (genreCount[genreName] || 0) + 1;
    });
  }
});

console.log('\n\nTop 10 Most Common Genres:');
Object.entries(genreCount)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .forEach(([genre, count]) => {
    const percentage = ((count / users.length) * 100).toFixed(1);
    console.log(`  ${genre}: ${count}/${users.length} users (${percentage}%)`);
  });

// Analyze favorite movies
const movieCount = {};
users.forEach(user => {
  if (user.favoriteMovies) {
    user.favoriteMovies.forEach(movie => {
      movieCount[movie.title] = (movieCount[movie.title] || 0) + 1;
    });
  }
});

console.log('\n\nTop 10 Most Common Favorite Movies:');
Object.entries(movieCount)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .forEach(([movie, count]) => {
    console.log(`  ${movie}: ${count} users`);
  });

// Calculate average overlap probability
let totalPairs = 0;
let pairsWithServiceOverlap = 0;
let pairsWithGenreOverlap = 0;
let pairsWithMovieOverlap = 0;

for (let i = 0; i < users.length; i++) {
  for (let j = i + 1; j < users.length; j++) {
    totalPairs++;
    
    const user1Services = new Set(users[i].streamingServices.map(s => s.name));
    const user2Services = new Set(users[j].streamingServices.map(s => s.name));
    const serviceOverlap = [...user1Services].filter(s => user2Services.has(s)).length;
    if (serviceOverlap > 0) pairsWithServiceOverlap++;
    
    const user1Genres = new Set(users[i].preferences.genres.map(g => typeof g === 'string' ? g : g.name));
    const user2Genres = new Set(users[j].preferences.genres.map(g => typeof g === 'string' ? g : g.name));
    const genreOverlap = [...user1Genres].filter(g => user2Genres.has(g)).length;
    if (genreOverlap > 0) pairsWithGenreOverlap++;
    
    const user1Movies = new Set((users[i].favoriteMovies || []).map(m => m.tmdbId));
    const user2Movies = new Set((users[j].favoriteMovies || []).map(m => m.tmdbId));
    const movieOverlap = [...user1Movies].filter(m => user2Movies.has(m)).length;
    if (movieOverlap > 0) pairsWithMovieOverlap++;
  }
}

console.log('\n\nOverlap Statistics:');
console.log(`Total possible pairs: ${totalPairs}`);
console.log(`Pairs with shared services: ${pairsWithServiceOverlap} (${((pairsWithServiceOverlap/totalPairs)*100).toFixed(1)}%)`);
console.log(`Pairs with shared genres: ${pairsWithGenreOverlap} (${((pairsWithGenreOverlap/totalPairs)*100).toFixed(1)}%)`);
console.log(`Pairs with shared movies: ${pairsWithMovieOverlap} (${((pairsWithMovieOverlap/totalPairs)*100).toFixed(1)}%)`);

console.log('\n========================================');
console.log('Analysis complete!');
