# Streaming Service Usage Tracking API

This document describes the new API endpoints for tracking and retrieving streaming service usage data.

## Overview

The streaming service usage tracking feature allows the application to:
- Track how often users watch content from each streaming service
- Record total watch time and episode counts per service
- Calculate viewing frequency patterns (daily, weekly, occasional, etc.)
- Show recent viewing activity
- Use viewing habits in the matching algorithm

## Data Model Enhancements

### Streaming Service Object
Each streaming service now includes usage tracking metrics:

```json
{
  "id": 8,
  "name": "Netflix",
  "logoPath": "/netflix.png",
  "logoUrl": "https://image.tmdb.org/t/p/original/netflix.png",
  "connected": true,
  "connectedAt": "2026-01-18T05:00:00.000Z",
  "lastUsed": "2026-01-18T10:30:00.000Z",
  "totalWatchTime": 450,
  "watchCount": 5,
  "totalEpisodes": 12
}
```

### Watch History Entry
Watch history entries now include duration tracking:

```json
{
  "title": "Stranger Things",
  "type": "tvshow",
  "genre": "Sci-Fi",
  "service": "Netflix",
  "episodesWatched": 3,
  "posterPath": "/path.jpg",
  "tmdbId": 66732,
  "watchedAt": "2026-01-18T10:30:00.000Z",
  "watchDuration": 150,
  "sessionDate": "2026-01-18T10:30:00.000Z"
}
```

## API Endpoints

### 1. Get User Viewing Statistics

Retrieve comprehensive viewing statistics for a user across all streaming services.

**Endpoint:** `GET /api/users/:userId/viewing-stats`

**Parameters:**
- `userId` (path) - User ID

**Response:**
```json
{
  "userId": "user_123",
  "username": "john_doe",
  "viewingStatistics": {
    "totalWatchTime": 950,
    "totalWatchCount": 5,
    "totalEpisodes": 17,
    "serviceBreakdown": [
      {
        "name": "HBO Max",
        "logoUrl": "https://...",
        "watchCount": 2,
        "totalWatchTime": 480,
        "totalEpisodes": 8,
        "lastUsed": "2026-01-18T10:30:00.000Z",
        "percentageOfTotal": 51
      }
    ],
    "mostUsedService": "HBO Max",
    "averageSessionDuration": 190,
    "viewingFrequency": {
      "frequency": "daily",
      "watchesPerWeek": 1.2,
      "daysSinceLastWatch": 0
    },
    "recentActivity": [
      {
        "title": "Stranger Things",
        "type": "tvshow",
        "service": "Netflix",
        "episodesWatched": 3,
        "watchDuration": 150,
        "watchedAt": "2026-01-18T10:30:00.000Z"
      }
    ]
  }
}
```

**Viewing Frequency Levels:**
- `daily` - User watches content daily (last watch within 1 day)
- `frequent` - User watches 3+ times per week
- `weekly` - User watches 1-3 times per week
- `occasional` - User watches less than weekly but more than never
- `inactive` - No recent watching activity

### 2. Get Service-Specific Usage Statistics

Retrieve detailed usage statistics for a specific streaming service.

**Endpoint:** `GET /api/users/:userId/streaming-services/:serviceName/stats`

**Parameters:**
- `userId` (path) - User ID
- `serviceName` (path) - Name of the streaming service (e.g., "Netflix", "Hulu")

**Response:**
```json
{
  "userId": "user_123",
  "serviceStats": {
    "name": "Netflix",
    "logoUrl": "https://...",
    "connected": true,
    "connectedAt": "2026-01-15T08:00:00.000Z",
    "lastUsed": "2026-01-18T10:30:00.000Z",
    "totalWatchTime": 270,
    "watchCount": 2,
    "totalEpisodes": 5,
    "recentWatches": [
      {
        "title": "Stranger Things",
        "type": "tvshow",
        "episodesWatched": 3,
        "watchDuration": 150,
        "watchedAt": "2026-01-18T10:30:00.000Z"
      }
    ]
  }
}
```

### 3. Update Service Usage

Manually update usage statistics for a streaming service. This is useful when tracking external viewing activity.

**Endpoint:** `PUT /api/users/:userId/streaming-services/:serviceName/usage`

**Parameters:**
- `userId` (path) - User ID
- `serviceName` (path) - Name of the streaming service

**Request Body:**
```json
{
  "watchDuration": 120,
  "episodesWatched": 2
}
```

**Response:**
```json
{
  "message": "Service usage updated successfully",
  "serviceStats": {
    "name": "Netflix",
    "totalWatchTime": 390,
    "watchCount": 3,
    "totalEpisodes": 7,
    "lastUsed": "2026-01-18T10:35:00.000Z"
  }
}
```

### 4. Add to Watch History (Enhanced)

The existing watch history endpoint now supports duration tracking.

**Endpoint:** `POST /api/users/:userId/watch-history`

**Request Body:**
```json
{
  "title": "Stranger Things",
  "type": "tvshow",
  "genre": "Sci-Fi",
  "service": "Netflix",
  "episodesWatched": 3,
  "posterPath": "/path.jpg",
  "tmdbId": 66732,
  "watchDuration": 150,
  "sessionDate": "2026-01-18T10:30:00.000Z"
}
```

**New Fields:**
- `watchDuration` (optional) - Duration in minutes
- `sessionDate` (optional) - When the content was watched (defaults to current time)

**Note:** When you add watch history with a `service` field, the usage statistics for that service are automatically updated.

## Matching Algorithm Integration

The matching algorithm now considers viewing habits when calculating compatibility:

### Viewing Frequency Compatibility (0-12 points)
- Matches users with similar viewing frequencies
- Perfect match (same frequency): 12 points
- Adjacent frequencies (e.g., daily vs frequent): 8 points
- Moderate difference: 5 points
- Large difference: 2 points

### Active Service Compatibility (0-10 points)
- Prioritizes matches where both users actively use shared services
- "Active" means the service was used in the last 30 days
- 3+ actively shared services: 10 points
- 2 actively shared services: 7 points
- 1 actively shared service: 4 points
- Shared but not actively used: 1 point

## Usage Examples

### JavaScript/Fetch Example

```javascript
// Get viewing statistics
const response = await fetch(`http://localhost:3000/api/users/${userId}/viewing-stats`);
const data = await response.json();
console.log('Total watch time:', data.viewingStatistics.totalWatchTime, 'minutes');

// Update service usage
await fetch(`http://localhost:3000/api/users/${userId}/streaming-services/Netflix/usage`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    watchDuration: 120,
    episodesWatched: 2
  })
});

// Add watch history with duration
await fetch(`http://localhost:3000/api/users/${userId}/watch-history`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: "Breaking Bad",
    type: "tvshow",
    genre: "Drama",
    service: "Netflix",
    episodesWatched: 4,
    watchDuration: 200,
    tmdbId: 1396
  })
});
```

## Frontend Integration

A dedicated viewing statistics page is available at:
```
/viewing-stats.html?userId=USER_ID
```

This page displays:
- Summary cards for total watch time, sessions, and episodes
- Viewing frequency badge
- Service breakdown with visual progress bars
- Recent activity list with posters

## Testing

A test script is available to demonstrate the API:

```bash
node backend/scripts/testStreamingUsage.js
```

This creates a test user with sample data and displays the viewing statistics.

## Notes

- All time durations are in minutes
- Dates are in ISO 8601 format
- The viewing frequency calculation considers activity from the last 30 days
- Service usage stats are automatically updated when adding watch history
- Inactive services (not used in 30+ days) have lower weight in matching
