# Netflix and Chill API Documentation

Base URL: `http://localhost:3000/api`

## User Endpoints

### Create User
Create a new user profile.

**Endpoint:** `POST /users`

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "age": number,
  "location": "string",
  "bio": "string"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "user_xxx",
    "username": "johndoe",
    "email": "john@example.com",
    "age": 25,
    "location": "New York",
    "bio": "Love binge-watching sci-fi series!",
    "streamingServices": [],
    "watchHistory": [],
    "preferences": {
      "genres": [],
      "bingeWatchCount": 0
    },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get User
Retrieve user profile information.

**Endpoint:** `GET /users/:userId`

**Response:**
```json
{
  "id": "user_xxx",
  "username": "johndoe",
  "email": "john@example.com",
  ...
}
```

### Update Bio
Update user's bio.

**Endpoint:** `PUT /users/:userId/bio`

**Request Body:**
```json
{
  "bio": "Updated bio text"
}
```

**Response:**
```json
{
  "message": "Bio updated successfully",
  "user": { ... }
}
```

### Add Streaming Service
Connect a streaming service to user's profile.

**Endpoint:** `POST /users/:userId/streaming-services`

**Request Body:**
```json
{
  "serviceName": "Netflix"
}
```

**Supported Services:**
- Netflix
- Hulu
- Disney+
- Amazon Prime
- HBO Max
- Apple TV+

**Response:**
```json
{
  "message": "Streaming service added successfully",
  "user": {
    "streamingServices": [
      {
        "name": "Netflix",
        "connected": true,
        "connectedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    ...
  }
}
```

### Add Watch History
Add a movie or TV show to user's watch history.

**Endpoint:** `POST /users/:userId/watch-history`

**Request Body:**
```json
{
  "title": "Stranger Things",
  "type": "tvshow",
  "genre": "Sci-Fi",
  "service": "Netflix",
  "episodesWatched": 8
}
```

**Type Options:**
- `movie`
- `tvshow`
- `series`

**Response:**
```json
{
  "message": "Watch history updated successfully",
  "user": {
    "watchHistory": [
      {
        "title": "Stranger Things",
        "type": "tvshow",
        "genre": "Sci-Fi",
        "service": "Netflix",
        "episodesWatched": 8,
        "watchedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    ...
  }
}
```

### Update Preferences
Update user's genre preferences and binge-watching habits.

**Endpoint:** `PUT /users/:userId/preferences`

**Request Body:**
```json
{
  "genres": ["Action", "Comedy", "Sci-Fi"],
  "bingeWatchCount": 5
}
```

**Response:**
```json
{
  "message": "Preferences updated successfully",
  "user": {
    "preferences": {
      "genres": ["Action", "Comedy", "Sci-Fi"],
      "bingeWatchCount": 5
    },
    ...
  }
}
```

### Submit Quiz Responses
Submit movie quiz responses to generate personality profile and improve matching.

**Endpoint:** `PUT /users/:userId/quiz`

**Request Body (New Format - Recommended):**
```json
{
  "answers": [
    {
      "questionId": "q1",
      "selectedValue": "subtitles"
    },
    {
      "questionId": "q2",
      "selectedValue": "90_120"
    }
  ]
}
```

**Request Body (Legacy Format - Backward Compatible):**
```json
{
  "quizResponses": {
    "q1": "subtitles",
    "q2": "90_120"
  }
}
```

**Response:**
```json
{
  "message": "Quiz responses submitted successfully",
  "user": {
    "id": "user_123",
    "personalityProfile": {
      "archetypes": [
        {
          "type": "cinephile",
          "name": "The Cinephile",
          "description": "Deep appreciation for film as an art form",
          "strength": 87.5
        }
      ],
      "traits": {
        "viewing_style": {
          "score": 75.5,
          "level": "high"
        }
      },
      "dominantTraits": [
        {
          "category": "viewing_style",
          "name": "Viewing Style & Preferences",
          "score": 75.5
        }
      ]
    },
    "personalityBio": "Deep appreciation for film as an art form. Has strong preferences about how to watch.",
    "lastQuizCompletedAt": "2024-01-01T00:00:00.000Z",
    ...
  },
  "personalityProfile": { ... },
  "personalityBio": "Deep appreciation for film as an art form..."
}
```

**Notes:**
- The new `answers` format processes quiz completion with full scoring and personality analysis
- Quiz responses are used to:
  - Calculate normalized scores by category (0-100 scale)
  - Derive personality archetypes (e.g., Cinephile, Casual Viewer, Binge Watcher)
  - Generate personality-based biography
  - Enhance compatibility matching (adds up to 15 points to match score)
- Users can retake the quiz; latest attempt is used for matching

### Get Quiz Attempts
Retrieve user's quiz attempt history and personality profile.

**Endpoint:** `GET /users/:userId/quiz/attempts`

**Response:**
```json
{
  "quizAttempts": [
    {
      "id": "quiz_123",
      "userId": "user_123",
      "attemptDate": "2024-01-01T00:00:00.000Z",
      "quizVersion": "v1",
      "answers": [
        {
          "questionId": "q1",
          "selectedValue": "subtitles",
          "points": 1
        }
      ],
      "categoryScores": {
        "viewing_style": 75.5,
        "movie_preferences": 82.3
      },
      "personalityTraits": {
        "archetypes": [...],
        "traits": {...},
        "dominantTraits": [...]
      },
      "compatibilityFactors": {
        "viewingStyle": 75.5,
        "contentPreferences": 68.4,
        "socialViewing": 71.2,
        "engagement": 79.8
      },
      "completedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "personalityProfile": { ... },
  "personalityBio": "Deep appreciation for film as an art form...",
  "lastQuizCompletedAt": "2024-01-01T00:00:00.000Z"
}
```

### Add Favorite Movie
Add a movie to user's favorite movies list.

**Endpoint:** `POST /users/:userId/favorite-movies`

**Request Body:**
```json
{
  "tmdbId": "550",
  "title": "Fight Club",
  "posterPath": "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
  "overview": "A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy.",
  "releaseDate": "1999-10-15"
}
```

**Response:**
```json
{
  "message": "Movie added to favorites successfully",
  "favoriteMovies": [
    {
      "tmdbId": "550",
      "title": "Fight Club",
      "posterPath": "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
      "overview": "A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy.",
      "releaseDate": "1999-10-15",
      "addedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Favorite Movies
Retrieve user's favorite movies.

**Endpoint:** `GET /users/:userId/favorite-movies`

**Response:**
```json
{
  "userId": "user_123",
  "count": 1,
  "favoriteMovies": [
    {
      "tmdbId": "550",
      "title": "Fight Club",
      "posterPath": "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
      "overview": "A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy.",
      "releaseDate": "1999-10-15",
      "addedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Remove Favorite Movie
Remove a movie from user's favorites.

**Endpoint:** `DELETE /users/:userId/favorite-movies/:movieId`

**Response:**
```json
{
  "message": "Movie removed from favorites successfully",
  "favoriteMovies": []
}
```

## Match Endpoints

### Find Matches
Find potential matches for a user based on streaming preferences.

**Endpoint:** `GET /matches/:userId`

**Query Parameters:**
- `limit` (optional): Number of matches to return (default: 10, max: 100)
- `minAge` (optional): Minimum age filter
- `maxAge` (optional): Maximum age filter
- `locationRadius` (optional): Location radius in miles/km

**Example:** `GET /matches/user_123?limit=5&minAge=25&maxAge=35&locationRadius=50`

**Response:**
```json
{
  "userId": "user_123",
  "matches": [
    {
      "matchId": "match_xxx",
      "matchScore": 85,
      "sharedContent": [
        {
          "title": "Stranger Things",
          "type": "tvshow",
          "genre": "Sci-Fi"
        }
      ],
      "user": {
        "id": "user_456",
        "username": "janedoe",
        "age": 24,
        "location": "Los Angeles",
        "bio": "Sci-fi enthusiast and weekend binge-watcher",
        "streamingServices": [
          {
            "name": "Netflix",
            "connected": true,
            "connectedAt": "2024-01-01T00:00:00.000Z"
          }
        ]
      }
    }
  ]
}
```

### Get Match History
Retrieve all matches for a user.

**Endpoint:** `GET /matches/:userId/history`

**Response:**
```json
{
  "userId": "user_123",
  "matchCount": 15,
  "matches": [
    {
      "id": "match_xxx",
      "user1Id": "user_123",
      "user2Id": "user_456",
      "matchScore": 85,
      "sharedContent": [...],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## Recommendation Endpoints

### Get Recommendations
Get personalized show/movie recommendations based on user's watch history and preferences.

**Endpoint:** `GET /recommendations/:userId`

**Query Parameters:**
- `limit` (optional): Number of recommendations to return (default: 10, max: 50)

**Example:** `GET /recommendations/user_123?limit=5`

**Response:**
```json
{
  "userId": "user_123",
  "count": 5,
  "recommendations": [
    {
      "id": 12345,
      "title": "Stranger Things",
      "overview": "When a young boy vanishes...",
      "type": "tv",
      "posterPath": "https://image.tmdb.org/t/p/w500/poster.jpg",
      "backdropPath": "https://image.tmdb.org/t/p/w1280/backdrop.jpg",
      "rating": 8.7,
      "releaseDate": "2016-07-15",
      "genres": [18, 10765]
    }
  ]
}
```

## Streaming Endpoints

### Search Movies and TV Shows
Search for movies and TV shows using TMDB API.

**Endpoint:** `GET /streaming/search`

**Query Parameters:**
- `query` (required): Search query string
- `type` (optional): Search type - 'movie', 'tv', or 'multi' (default: 'multi')

**Example:** `GET /streaming/search?query=inception&type=movie`

**Response:**
```json
{
  "query": "inception",
  "count": 20,
  "results": [
    {
      "id": 27205,
      "title": "Inception",
      "type": "movie",
      "releaseDate": "2010-07-16",
      "overview": "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets...",
      "posterPath": "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
      "genres": [28, 878, 53],
      "popularity": 65.123,
      "voteAverage": 8.4
    }
  ]
}
```

**Note:** The `posterPath` can be used to construct full image URLs using TMDB's image service:
- Small poster: `https://image.tmdb.org/t/p/w300{posterPath}`
- Medium poster: `https://image.tmdb.org/t/p/w500{posterPath}`
- Original poster: `https://image.tmdb.org/t/p/original{posterPath}`

### Get Popular Content
Get popular movies or TV shows.

**Endpoint:** `GET /streaming/popular`

**Query Parameters:**
- `type` (optional): Content type - 'movie' or 'tv' (default: 'movie')

**Example:** `GET /streaming/popular?type=movie`

**Response:**
```json
{
  "type": "movie",
  "count": 20,
  "results": [
    {
      "id": 550,
      "title": "Fight Club",
      "type": "movie",
      "releaseDate": "1999-10-15",
      "overview": "A ticking-time-bomb insomniac and a slippery soap salesman...",
      "posterPath": "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
      "genres": [18],
      "popularity": 85.432,
      "voteAverage": 8.4
    }
  ]
}
```

### Get Genres
Get list of movie or TV genres.

**Endpoint:** `GET /streaming/genres`

**Query Parameters:**
- `type` (optional): Content type - 'movie' or 'tv' (default: 'movie')

**Example:** `GET /streaming/genres?type=movie`

**Response:**
```json
{
  "type": "movie",
  "genres": [
    {
      "id": 28,
      "name": "Action"
    },
    {
      "id": 12,
      "name": "Adventure"
    },
    {
      "id": 16,
      "name": "Animation"
    }
  ]
}
```

## Like Endpoints

### Send Like or Super Like
Send a like or super like to another user.

**Endpoint:** `POST /likes`

**Request Body:**
```json
{
  "fromUserId": "user_123",
  "toUserId": "user_456",
  "type": "like"
}
```

**Type Options:**
- `like` - Regular like
- `superlike` - Super like

**Response:**
```json
{
  "message": "Like created successfully",
  "like": {
    "id": "like_xxx",
    "fromUserId": "user_123",
    "toUserId": "user_456",
    "type": "like",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "isMutual": false
}
```

### Get Likes Sent
Get all likes sent by a user.

**Endpoint:** `GET /likes/:userId`

**Response:**
```json
{
  "userId": "user_123",
  "count": 5,
  "likes": [
    {
      "id": "like_xxx",
      "fromUserId": "user_123",
      "toUserId": "user_456",
      "type": "like",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Likes Received
Get all likes received by a user.

**Endpoint:** `GET /likes/:userId/received`

**Response:**
```json
{
  "userId": "user_123",
  "count": 8,
  "likes": [
    {
      "id": "like_xxx",
      "fromUserId": "user_789",
      "toUserId": "user_123",
      "type": "superlike",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Mutual Likes
Get mutual likes (both users liked each other).

**Endpoint:** `GET /likes/:userId/mutual`

**Response:**
```json
{
  "userId": "user_123",
  "count": 2,
  "mutualLikes": [
    {
      "userId": "user_456",
      "matched": true
    },
    {
      "userId": "user_789",
      "matched": true
    }
  ]
}
```

## Error Responses

All endpoints may return error responses in the following format:

**400 Bad Request:**
```json
{
  "error": "User with this email already exists"
}
```

**404 Not Found:**
```json
{
  "error": "User not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Error message describing the issue"
}
```

## Matching Algorithm Details

The matching algorithm calculates a score (0-100) based on:

1. **Shared Streaming Services:** +10 points per shared service
2. **Shared Watch History:** +20 points per show/movie both users watched
3. **Shared Genre Preferences:** +5 points per shared genre
4. **Similar Binge Patterns:** +15 bonus points if users have similar binge-watching counts (within 2 episodes)

Final scores are normalized to ensure they fall within the 0-100 range.

## Rate Limiting

Currently, there are no rate limits on the API. This will be implemented in future versions.

## Authentication

The current version does not include authentication. User IDs are used directly for all operations. Authentication will be added in future releases.
