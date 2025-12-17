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

## Match Endpoints

### Find Matches
Find potential matches for a user based on streaming preferences.

**Endpoint:** `GET /matches/:userId`

**Query Parameters:**
- `limit` (optional): Number of matches to return (default: 10, max: 100)

**Example:** `GET /matches/user_123?limit=5`

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
