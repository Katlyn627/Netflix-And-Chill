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
// Limited to top 20 most popular streaming services in USA
const fallbackProviders = [
  { id: 8, name: 'Netflix', logoPath: null, logoUrl: null, displayPriority: 1 },
  { id: 9, name: 'Amazon Prime Video', logoPath: null, logoUrl: null, displayPriority: 2 },
  { id: 337, name: 'Disney+', logoPath: null, logoUrl: null, displayPriority: 3 },
  { id: 15, name: 'Hulu', logoPath: null, logoUrl: null, displayPriority: 4 },
  { id: 384, name: 'HBO Max', logoPath: null, logoUrl: null, displayPriority: 5 },
  { id: 350, name: 'Apple TV+', logoPath: null, logoUrl: null, displayPriority: 6 },
  { id: 387, name: 'Peacock', logoPath: null, logoUrl: null, displayPriority: 7 },
  { id: 531, name: 'Paramount+', logoPath: null, logoUrl: null, displayPriority: 8 },
  { id: 1899, name: 'Max', logoPath: null, logoUrl: null, displayPriority: 9 },
  { id: 386, name: 'Peacock Premium', logoPath: null, logoUrl: null, displayPriority: 10 },
  { id: 2, name: 'Apple iTunes', logoPath: null, logoUrl: null, displayPriority: 11 },
  { id: 3, name: 'Google Play Movies', logoPath: null, logoUrl: null, displayPriority: 12 },
  { id: 10, name: 'Amazon Video', logoPath: null, logoUrl: null, displayPriority: 13 },
  { id: 68, name: 'Microsoft Store', logoPath: null, logoUrl: null, displayPriority: 14 },
  { id: 7, name: 'Vudu', logoPath: null, logoUrl: null, displayPriority: 15 },
  { id: 192, name: 'YouTube', logoPath: null, logoUrl: null, displayPriority: 16 },
  { id: 257, name: 'fuboTV', logoPath: null, logoUrl: null, displayPriority: 17 },
  { id: 582, name: 'Crunchyroll', logoPath: null, logoUrl: null, displayPriority: 18 },
  { id: 444, name: 'Showtime', logoPath: null, logoUrl: null, displayPriority: 19 },
  { id: 1825, name: 'Starz', logoPath: null, logoUrl: null, displayPriority: 20 }
];

// Sample movies for demo/testing when TMDB API is not available
const fallbackMovies = [
  {
    id: 550,
    title: 'Fight Club',
    overview: 'An insomniac office worker and a devil-may-care soap maker form an underground fight club.',
    poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
    backdrop_path: '/fCayJrkfRaCRCTh8GqN30f8oyQF.jpg',
    release_date: '1999-10-15',
    vote_average: 8.4,
    genre_ids: [18, 53, 35]
  },
  {
    id: 13,
    title: 'Forrest Gump',
    overview: 'A man with a low IQ accomplishes great things and is present during significant historical events.',
    poster_path: '/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg',
    backdrop_path: '/3h1JZGDhZ8nzxdgvkxha0qBqi05.jpg',
    release_date: '1994-07-06',
    vote_average: 8.5,
    genre_ids: [35, 18, 10749]
  },
  {
    id: 155,
    title: 'The Dark Knight',
    overview: 'Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    backdrop_path: '/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg',
    release_date: '2008-07-18',
    vote_average: 8.5,
    genre_ids: [18, 28, 80, 53]
  },
  {
    id: 27205,
    title: 'Inception',
    overview: 'A skilled thief is given a chance at redemption if he can successfully perform inception.',
    poster_path: '/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    backdrop_path: '/s3TBrRGB1iav7gFOCNx3H31MoES.jpg',
    release_date: '2010-07-16',
    vote_average: 8.4,
    genre_ids: [28, 878, 12]
  },
  {
    id: 278,
    title: 'The Shawshank Redemption',
    overview: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption.',
    poster_path: '/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
    backdrop_path: '/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg',
    release_date: '1994-09-23',
    vote_average: 8.7,
    genre_ids: [18, 80]
  },
  {
    id: 238,
    title: 'The Godfather',
    overview: 'The aging patriarch of an organized crime dynasty transfers control to his reluctant son.',
    poster_path: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
    backdrop_path: '/tmU7GeKVybMWFButWEGl2M4GeiP.jpg',
    release_date: '1972-03-14',
    vote_average: 8.7,
    genre_ids: [18, 80]
  },
  {
    id: 496243,
    title: 'Parasite',
    overview: 'A poor family schemes to become employed by a wealthy family.',
    poster_path: '/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    backdrop_path: '/TU9NIjwzjoKPwQHoHshkFcQUCG.jpg',
    release_date: '2019-05-30',
    vote_average: 8.5,
    genre_ids: [35, 53, 18]
  },
  {
    id: 680,
    title: 'Pulp Fiction',
    overview: 'Various interconnected stories in the Los Angeles criminal underworld.',
    poster_path: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    backdrop_path: '/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg',
    release_date: '1994-09-10',
    vote_average: 8.5,
    genre_ids: [53, 80]
  },
  {
    id: 122,
    title: 'The Lord of the Rings: The Return of the King',
    overview: 'Gandalf and Aragorn lead the World of Men against Sauron\'s army.',
    poster_path: '/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg',
    backdrop_path: '/2u7zbn8EudG6kLlBzUYqP8RyFU4.jpg',
    release_date: '2003-12-17',
    vote_average: 8.5,
    genre_ids: [12, 14, 28]
  },
  {
    id: 429,
    title: 'The Good, the Bad and the Ugly',
    overview: 'A bounty hunting scam joins two men in an uneasy alliance.',
    poster_path: '/bX2xnavhMYjWDoZp1VM6VnU1xwe.jpg',
    backdrop_path: '/yFuKvT4Vm3sKHdFY4eG6I4ldAnn.jpg',
    release_date: '1966-12-23',
    vote_average: 8.5,
    genre_ids: [37]
  },
  {
    id: 19404,
    title: 'Dilwale Dulhania Le Jayenge',
    overview: 'Two young people fall in love on a Europe trip.',
    poster_path: '/lfRkUr7DYdHldAqi3PwdQGBRBPM.jpg',
    backdrop_path: '/90ez6ArvpO8bvpyIngBuwXOqJm5.jpg',
    release_date: '1995-10-20',
    vote_average: 8.7,
    genre_ids: [35, 18, 10749]
  },
  {
    id: 372058,
    title: 'Your Name',
    overview: 'Two teenagers share a profound connection after mysteriously swapping bodies.',
    poster_path: '/q719jXXEzOoYaps6babgKnONONX.jpg',
    backdrop_path: '/7prYzufdIOy1KCTZKVWpw4AuaAN.jpg',
    release_date: '2016-08-26',
    vote_average: 8.5,
    genre_ids: [16, 10749, 18]
  },
  {
    id: 424,
    title: "Schindler's List",
    overview: 'A German industrialist saves his Jewish employees during the Holocaust.',
    poster_path: '/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg',
    backdrop_path: '/loRmRzQXZeqG78TqZuyvSlEQfZb.jpg',
    release_date: '1993-12-15',
    vote_average: 8.6,
    genre_ids: [18, 36, 10752]
  },
  {
    id: 769,
    title: 'GoodFellas',
    overview: 'The story of Henry Hill and his life in the mob.',
    poster_path: '/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg',
    backdrop_path: '/rSPw7tgCH9c6NqICZef4kZjFOQ5.jpg',
    release_date: '1990-09-19',
    vote_average: 8.5,
    genre_ids: [18, 80]
  },
  {
    id: 324857,
    title: 'Spider-Man: Into the Spider-Verse',
    overview: 'Teen Miles Morales becomes Spider-Man of his reality.',
    poster_path: '/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg',
    backdrop_path: '/7d6EY00g1c39SGZOoCJ5Py9nNth.jpg',
    release_date: '2018-12-14',
    vote_average: 8.4,
    genre_ids: [28, 12, 16, 878]
  }
];

// Sample TV shows for demo/testing when TMDB API is not available
const fallbackTVShows = [
  {
    id: 1396,
    name: 'Breaking Bad',
    overview: 'A high school chemistry teacher turned methamphetamine manufacturer partners with a former student.',
    poster_path: '/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
    backdrop_path: '/9faGSFi5jam6pDWGNd0p8JcJgXQ.jpg',
    first_air_date: '2008-01-20',
    vote_average: 8.9,
    genre_ids: [18, 80]
  },
  {
    id: 1399,
    name: 'Game of Thrones',
    overview: 'Nine noble families fight for control over the lands of Westeros.',
    poster_path: '/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg',
    backdrop_path: '/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg',
    first_air_date: '2011-04-17',
    vote_average: 8.4,
    genre_ids: [10759, 10765, 18]
  },
  {
    id: 60735,
    name: 'The Flash',
    overview: 'After being struck by lightning, Barry Allen wakes up from a coma to discover he has superpowers.',
    poster_path: '/lJA2RCMfsWoskqlQhXPSLFQGXEJ.jpg',
    backdrop_path: '/9Jmd1OumCjaXDkpllbSGi2EpJvl.jpg',
    first_air_date: '2014-10-07',
    vote_average: 7.8,
    genre_ids: [18, 10765]
  },
  {
    id: 1668,
    name: 'Friends',
    overview: 'Six friends navigate their way through life and love in New York City.',
    poster_path: '/f496cm9enuEsZkSPzCwnTESEK5s.jpg',
    backdrop_path: '/l0qVZIpXtIo7km9u5Yqh0nKPOr5.jpg',
    first_air_date: '1994-09-22',
    vote_average: 8.4,
    genre_ids: [35]
  },
  {
    id: 1434,
    name: 'Family Guy',
    overview: 'The adventures of an eccentric family in the fictional city of Quahog, Rhode Island.',
    poster_path: '/hw2vi8agaJZ7oeSZcpLbpNEZz7m.jpg',
    backdrop_path: '/pH38r4TWTqq7Mcs6XAlwgzNUuml.jpg',
    first_air_date: '1999-01-31',
    vote_average: 7.3,
    genre_ids: [16, 35]
  },
  {
    id: 1408,
    name: 'House',
    overview: 'An antisocial maverick doctor specializes in diagnostic medicine.',
    poster_path: '/3Cz7ySOQJmqiuTdrc6CY0r65yDI.jpg',
    backdrop_path: '/2O5jeHvZEL9hMWPuU8RRsMGxLDB.jpg',
    first_air_date: '2004-11-16',
    vote_average: 8.6,
    genre_ids: [18, 9648]
  },
  {
    id: 46952,
    name: 'The Mandalorian',
    overview: 'A lone gunfighter makes his way through the outer reaches of the galaxy.',
    poster_path: '/eU1i6eHXlzMOlEq0ku1Rzq7Y4wA.jpg',
    backdrop_path: '/9ijMGlJKqcslswWUzTEwScm82Gs.jpg',
    first_air_date: '2019-11-12',
    vote_average: 8.5,
    genre_ids: [10765, 10759, 37]
  },
  {
    id: 1416,
    name: 'Grey\'s Anatomy',
    overview: 'Follows the personal and professional lives of surgical interns and residents.',
    poster_path: '/daSFbrt8QCXV2hSwB0hqYjbj681.jpg',
    backdrop_path: '/edmk8xjGBsYVIf4QtLY9WMaMcXZ.jpg',
    first_air_date: '2005-03-27',
    vote_average: 8.2,
    genre_ids: [18]
  },
  {
    id: 66732,
    name: 'Stranger Things',
    overview: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments.',
    poster_path: '/x2LSRK2Cm7MZhjluni1msVJ3wDF.jpg',
    backdrop_path: '/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
    first_air_date: '2016-07-15',
    vote_average: 8.6,
    genre_ids: [18, 10765, 9648]
  },
  {
    id: 60059,
    name: 'Better Call Saul',
    overview: 'The trials and tribulations of criminal lawyer Jimmy McGill in the years before Breaking Bad.',
    poster_path: '/fC2HDm5t0kHl7mTm7jxMR31b7by.jpg',
    backdrop_path: '/9faGSFi5jam6pDWGNd0p8JcJgXQ.jpg',
    first_air_date: '2015-02-08',
    vote_average: 8.7,
    genre_ids: [80, 18]
  },
  {
    id: 1402,
    name: 'The Walking Dead',
    overview: 'Sheriff Deputy Rick Grimes wakes up from a coma to learn the world is in ruins.',
    poster_path: '/xf9wuDcqlUPWABZNeDKPbZUjWx0.jpg',
    backdrop_path: '/wvdWb5kTQipdMDqCclC6Y3zr4j3.jpg',
    first_air_date: '2010-10-31',
    vote_average: 8.1,
    genre_ids: [10759, 18, 10765]
  },
  {
    id: 1622,
    name: 'Supernatural',
    overview: 'Two brothers follow their father\'s footsteps as hunters, fighting evil supernatural beings.',
    poster_path: '/KoYWXbnYuS3b0GyQPkbuexlVK9.jpg',
    backdrop_path: '/o9OKe3M06QMLOzTl3l6GStYtnE9.jpg',
    first_air_date: '2005-09-13',
    vote_average: 8.3,
    genre_ids: [18, 9648, 10765]
  },
  {
    id: 31910,
    name: 'Narcos',
    overview: 'A chronicled look at the criminal exploits of Colombian drug lord Pablo Escobar.',
    poster_path: '/rTmal9fDbwh5F0waol2hq35U4ah.jpg',
    backdrop_path: '/rQBRHAl9xMT3PjqO7SRJBh1qT0M.jpg',
    first_air_date: '2015-08-28',
    vote_average: 8.2,
    genre_ids: [80, 18]
  },
  {
    id: 4194,
    name: 'The Big Bang Theory',
    overview: 'Five friends living in Pasadena, California, explore the world through their geeky lens.',
    poster_path: '/ooBGRQBdbGzBxAVfExiO8r7kloA.jpg',
    backdrop_path: '/f5uNbUC76oowt5mt5J9QlqrIYQ6.jpg',
    first_air_date: '2007-09-24',
    vote_average: 7.9,
    genre_ids: [35]
  },
  {
    id: 63174,
    name: 'Lucifer',
    overview: 'Bored with being the Lord of Hell, the devil relocates to Los Angeles.',
    poster_path: '/ekZobS8isE6mA53RAiGDG93hBxL.jpg',
    backdrop_path: '/ta5oblpMlEcIPIS33xbpZy1MH83.jpg',
    first_air_date: '2016-01-25',
    vote_average: 8.5,
    genre_ids: [80, 10765]
  }
];

module.exports = {
  fallbackGenres,
  fallbackProviders,
  fallbackMovies,
  fallbackTVShows
};
