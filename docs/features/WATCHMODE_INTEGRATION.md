# Watchmode API Integration Guide

This guide explains how to set up and use the Watchmode API integration to display streaming platform availability for movies and TV shows.

## Overview

The Watchmode API integration adds the ability to show users which streaming platforms (Netflix, Hulu, Disney+, Amazon Prime, etc.) have each movie or TV show available. This helps users make informed decisions about what to watch based on their existing subscriptions.

## Features

- **Streaming Platform Display**: Shows which services have the movie/show available
- **Multiple Access Types**: Displays subscription, rental, and purchase options
- **Region Support**: Works with different geographic regions (US, UK, CA, etc.)
- **Optional Integration**: The app continues to work without the API key
- **Graceful Fallback**: If API is not configured, features degrade gracefully

## Setup Instructions

### 1. Get Your Watchmode API Key

1. Visit [https://api.watchmode.com/](https://api.watchmode.com/)
2. Click **"Sign Up"** to create a free account
3. Verify your email address
4. Log in to your dashboard
5. Copy your **API Key** from the dashboard

### 2. Configure the API Key

Add the API key to your `.env` file:

```bash
WATCHMODE_API_KEY=your_actual_watchmode_api_key_here
```

Example `.env` file:
```bash
# Movie Database API (Required)
TMDB_API_KEY=your_tmdb_api_key_here

# Streaming Availability API (Optional)
WATCHMODE_API_KEY=abc123xyz789youractualkey

# Other configuration...
PORT=3000
```

### 3. Restart the Server

```bash
npm start
```

## API Endpoints

### Get Streaming Availability for a Movie/Show

**Endpoint:** `GET /api/streaming/availability/:id`

**Parameters:**
- `id` (required): TMDB ID of the movie or TV show
- `type` (optional): `movie` or `tv` (default: `movie`)
- `region` (optional): Region code like `US`, `UK`, `CA` (default: `US`)

**Example Request:**
```bash
curl "http://localhost:3000/api/streaming/availability/550?type=movie&region=US"
```

**Example Response:**
```json
{
  "tmdbId": 550,
  "type": "movie",
  "region": "US",
  "available": true,
  "sources": {
    "subscription": [
      {
        "id": 8,
        "name": "Netflix",
        "type": "sub",
        "region": "US",
        "webUrl": "https://www.netflix.com/title/...",
        "format": "HD"
      },
      {
        "id": 15,
        "name": "Hulu",
        "type": "sub",
        "region": "US",
        "webUrl": "https://www.hulu.com/movie/...",
        "format": "4K"
      }
    ],
    "free": [],
    "rent": [
      {
        "id": 2,
        "name": "iTunes",
        "type": "rent",
        "region": "US",
        "webUrl": "https://tv.apple.com/...",
        "format": "4K",
        "price": 3.99
      }
    ],
    "buy": []
  },
  "watchmodeId": 12345,
  "title": "Fight Club",
  "year": 1999
}
```

### Get Available Streaming Services

**Endpoint:** `GET /api/streaming/services`

**Parameters:**
- `region` (optional): Region code (default: `US`)

**Example Request:**
```bash
curl "http://localhost:3000/api/streaming/services?region=US"
```

**Example Response:**
```json
{
  "region": "US",
  "count": 50,
  "services": [
    {
      "id": 8,
      "name": "Netflix",
      "logo_path": "/path/to/logo.jpg"
    },
    {
      "id": 15,
      "name": "Hulu",
      "logo_path": "/path/to/logo.jpg"
    }
  ]
}
```

## Frontend Integration

### Swipe Feature

The swipe feature automatically includes streaming availability when you add the `includeStreaming=true` query parameter:

```javascript
// In frontend/src/components/swipe.js
const response = await fetch(
  `${API_BASE_URL}/swipe/movies/${userId}?limit=50&includeStreaming=true`
);
```

Movie cards will automatically display streaming platforms:

```
┌─────────────────────────┐
│   Movie Poster Image    │
│                         │
├─────────────────────────┤
│ The Dark Knight         │
│ 2008 | ⭐ 9.0/10       │
│                         │
│ 🎬 Available on:        │
│ [Netflix] [HBO Max]     │
│                         │
│ A vigilante takes on... │
└─────────────────────────┘
```

### Custom Implementation

To fetch streaming availability for any movie:

```javascript
async function getStreamingInfo(tmdbId, type = 'movie') {
  const response = await fetch(
    `${API_BASE_URL}/api/streaming/availability/${tmdbId}?type=${type}`
  );
  const data = await response.json();
  
  if (data.available) {
    console.log('Available on:', data.sources.subscription.map(s => s.name));
  }
  
  return data;
}
```

## Pricing and Limits

### Free Tier
- **1,000 requests per day**
- All features included
- Perfect for development and small apps

### Rate Limiting
The service automatically handles rate limiting gracefully:
- Failed requests return empty results
- No app crashes or errors
- Logs warnings for debugging

## Troubleshooting

### No Streaming Data Appearing

1. **Check API Key**: Ensure `WATCHMODE_API_KEY` is set in `.env`
2. **Verify Format**: Make sure there are no extra spaces or quotes
3. **Check Logs**: Look for warnings like:
   ```
   Watchmode API key not configured. Streaming availability data will not be available.
   ```
4. **Test Endpoint**: Try accessing `/api/streaming/availability/550?type=movie` directly

### API Rate Limits Exceeded

If you exceed 1,000 requests per day:
1. The app will continue to work without streaming data
2. Consider caching responses in your database
3. Upgrade to a paid plan if needed

### Wrong Region Data

Make sure to pass the correct region parameter:
```javascript
// For UK users
const availability = await fetch(
  `/api/streaming/availability/${id}?region=UK`
);
```

## Best Practices

### 1. Caching
Cache streaming availability data to reduce API calls:
```javascript
// Example: Cache for 24 hours
const CACHE_DURATION = 24 * 60 * 60 * 1000;
```

### 2. Batch Requests
Only fetch streaming data for visible movies:
```javascript
// Only fetch for first 10 movies in swipe stack
const streamingPromises = movies.slice(0, 10).map(movie => 
  getStreamingInfo(movie.tmdbId)
);
```

### 3. Graceful Degradation
Always handle missing data gracefully:
```javascript
if (movie.streamingAvailability?.available) {
  displayStreamingPlatforms(movie.streamingAvailability.sources);
} else {
  // Show movie without streaming info
  displayMovieCard(movie);
}
```

## Additional Resources

- [Watchmode API Documentation](https://api.watchmode.com/docs/)
- [TMDB API Documentation](https://developers.themoviedb.org/3)
- [Netflix and Chill API Guide](./API.md)

## Support

If you encounter issues:
1. Check the [Watchmode API Status](https://status.watchmode.com/)
2. Review server logs for error messages
3. Test endpoints with curl or Postman
4. Open an issue on GitHub with details

---

**Note**: The Watchmode API integration is completely optional. The app will function normally without it, but users won't see which streaming platforms have each movie/show available.
