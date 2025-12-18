/**
 * Fallback data for genres and streaming providers
 * Used when TMDB API is not available or configured
 */

// Comprehensive list of genres (combined from TMDB movie and TV genres)
// Genre IDs correspond to TMDB's official genre IDs from their API
// See: https://developers.themoviedb.org/3/genres/get-movie-list
// and: https://developers.themoviedb.org/3/genres/get-tv-list
const fallbackGenres = [
  { id: 28, name: 'Action', types: ['movie'] },
  { id: 12, name: 'Adventure', types: ['movie'] },
  { id: 16, name: 'Animation', types: ['movie', 'tv'] },
  { id: 35, name: 'Comedy', types: ['movie', 'tv'] },
  { id: 80, name: 'Crime', types: ['movie', 'tv'] },
  { id: 99, name: 'Documentary', types: ['movie', 'tv'] },
  { id: 18, name: 'Drama', types: ['movie', 'tv'] },
  { id: 10751, name: 'Family', types: ['movie', 'tv'] },
  { id: 14, name: 'Fantasy', types: ['movie'] },
  { id: 36, name: 'History', types: ['movie'] },
  { id: 27, name: 'Horror', types: ['movie'] },
  { id: 10402, name: 'Music', types: ['movie'] },
  { id: 9648, name: 'Mystery', types: ['movie', 'tv'] },
  { id: 10749, name: 'Romance', types: ['movie'] },
  { id: 878, name: 'Science Fiction', types: ['movie'] },
  { id: 10765, name: 'Sci-Fi & Fantasy', types: ['tv'] },
  { id: 10770, name: 'TV Movie', types: ['movie'] },
  { id: 53, name: 'Thriller', types: ['movie'] },
  { id: 10752, name: 'War', types: ['movie'] },
  { id: 37, name: 'Western', types: ['movie', 'tv'] },
  { id: 10759, name: 'Action & Adventure', types: ['tv'] },
  { id: 10762, name: 'Kids', types: ['tv'] },
  { id: 10763, name: 'News', types: ['tv'] },
  { id: 10764, name: 'Reality', types: ['tv'] },
  { id: 10766, name: 'Soap', types: ['tv'] },
  { id: 10767, name: 'Talk', types: ['tv'] },
  { id: 10768, name: 'War & Politics', types: ['tv'] }
].sort((a, b) => a.name.localeCompare(b.name));

// Comprehensive list of popular streaming providers
// Based on major streaming services available in the US
const fallbackProviders = [
  { id: 8, name: 'Netflix', logoPath: null, logoUrl: null, displayPriority: 1 },
  { id: 9, name: 'Amazon Prime Video', logoPath: null, logoUrl: null, displayPriority: 2 },
  { id: 337, name: 'Disney+', logoPath: null, logoUrl: null, displayPriority: 3 },
  { id: 15, name: 'Hulu', logoPath: null, logoUrl: null, displayPriority: 4 },
  { id: 384, name: 'HBO Max', logoPath: null, logoUrl: null, displayPriority: 5 },
  { id: 350, name: 'Apple TV+', logoPath: null, logoUrl: null, displayPriority: 6 },
  { id: 387, name: 'Peacock', logoPath: null, logoUrl: null, displayPriority: 7 },
  { id: 531, name: 'Paramount+', logoPath: null, logoUrl: null, displayPriority: 8 },
  { id: 2, name: 'Apple iTunes', logoPath: null, logoUrl: null, displayPriority: 9 },
  { id: 3, name: 'Google Play Movies', logoPath: null, logoUrl: null, displayPriority: 10 },
  { id: 10, name: 'Amazon Video', logoPath: null, logoUrl: null, displayPriority: 11 },
  { id: 68, name: 'Microsoft Store', logoPath: null, logoUrl: null, displayPriority: 12 },
  { id: 7, name: 'Vudu', logoPath: null, logoUrl: null, displayPriority: 13 },
  { id: 192, name: 'YouTube', logoPath: null, logoUrl: null, displayPriority: 14 },
  { id: 1899, name: 'Max', logoPath: null, logoUrl: null, displayPriority: 15 },
  { id: 386, name: 'Peacock Premium', logoPath: null, logoUrl: null, displayPriority: 16 },
  { id: 257, name: 'fuboTV', logoPath: null, logoUrl: null, displayPriority: 17 },
  { id: 582, name: 'Crunchyroll', logoPath: null, logoUrl: null, displayPriority: 18 },
  { id: 283, name: 'Crackle', logoPath: null, logoUrl: null, displayPriority: 19 },
  { id: 1796, name: 'Netflix Kids', logoPath: null, logoUrl: null, displayPriority: 20 },
  { id: 11, name: 'Mubi', logoPath: null, logoUrl: null, displayPriority: 21 },
  { id: 43, name: 'Shudder', logoPath: null, logoUrl: null, displayPriority: 22 },
  { id: 613, name: 'Tubi TV', logoPath: null, logoUrl: null, displayPriority: 23 },
  { id: 1771, name: 'AMC+', logoPath: null, logoUrl: null, displayPriority: 24 },
  { id: 1773, name: 'The Roku Channel', logoPath: null, logoUrl: null, displayPriority: 25 },
  { id: 269, name: 'Plex', logoPath: null, logoUrl: null, displayPriority: 26 },
  { id: 444, name: 'Showtime', logoPath: null, logoUrl: null, displayPriority: 27 },
  { id: 1825, name: 'Starz', logoPath: null, logoUrl: null, displayPriority: 28 },
  { id: 634, name: 'BritBox', logoPath: null, logoUrl: null, displayPriority: 29 },
  { id: 1876, name: 'Pluto TV', logoPath: null, logoUrl: null, displayPriority: 30 }
];

module.exports = {
  fallbackGenres,
  fallbackProviders
};
