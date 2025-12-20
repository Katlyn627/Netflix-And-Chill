# Daily Swipe Reset Implementation

## Overview
This document explains how the daily swipe reset feature works using user data and TMDB timestamps.

## Problem Statement
The previous implementation stored swipe counts in `localStorage`, which had several issues:
1. No daily reset mechanism - once limit was reached, it stayed that way forever
2. Not synchronized across devices
3. Could be manipulated by users clearing browser data
4. No timestamp tracking for when swipes occurred

## Solution
Implemented a server-side daily swipe tracking system using timestamps in the user's `swipedMovies` array.

## Architecture

### Data Model
Each swipe is stored in the user's `swipedMovies` array with:
```javascript
{
  tmdbId: 12345,
  title: "Movie Title",
  posterPath: "/path/to/poster.jpg",
  action: "like" | "dislike",
  swipedAt: "2025-12-20T02:36:42.897Z" // ISO 8601 timestamp
}
```

### Backend Components

#### User Model Methods
Located in: `backend/models/User.js`

**`getDailySwipeCount()`**
- Calculates how many swipes were made today
- Uses UTC dates for timezone consistency
- Returns: Integer count of today's swipes

**`getTodaySwipes()`**
- Returns array of swipes made today
- Uses UTC dates for timezone consistency
- Returns: Array of swipe objects with timestamps

#### API Endpoint
Located in: `backend/routes/swipe.js`

**`GET /api/swipe/stats/:userId`**
- Query params: `limit` (optional, defaults to 50)
- Returns:
  ```json
  {
    "success": true,
    "dailySwipeCount": 1,
    "swipeLimit": 50,
    "swipesRemaining": 49,
    "todaySwipes": [...],
    "totalLikes": 2
  }
  ```

### Frontend Components

#### Constants
```javascript
const DEFAULT_SWIPE_LIMIT = 50; // Daily swipe limit per user
```

#### Functions
Located in: `frontend/src/components/swipe.js`

**`initializeSwipe(userId)`**
- Fetches daily swipe stats from backend
- Loads movies for swiping
- Updates UI with current stats

**`refreshSwipeCount()`**
- Called after each swipe action
- Syncs swipe count with backend
- Updates UI in real-time

**`handleSwipeRight(card)` / `handleSwipeLeft(card)`**
- Records swipe action to backend
- Refreshes swipe count from server
- Updates UI to show next card

## Daily Reset Logic

### How It Works
1. Each swipe is recorded with an ISO 8601 timestamp
2. Backend calculates "today" using UTC: `Date.UTC(year, month, date)`
3. Filters swipes where the UTC date equals today's UTC date
4. Counts the filtered swipes to get daily count

### Why UTC?
- Ensures consistent behavior across all timezones
- Prevents timezone manipulation to bypass limits
- Single source of truth for "what day it is"

### Example
```javascript
// User makes a swipe on Dec 19, 2025
{
  swipedAt: "2025-12-19T23:30:00.000Z"  // Yesterday
}

// User makes a swipe on Dec 20, 2025
{
  swipedAt: "2025-12-20T02:36:42.897Z"  // Today
}

// When checking on Dec 20, 2025:
// - Today's UTC date: Date.UTC(2025, 11, 20) = 1766102400000
// - Yesterday's swipe date: Date.UTC(2025, 11, 19) = 1766016000000
// - Today's swipe date: Date.UTC(2025, 11, 20) = 1766102400000
// - Daily count: 1 (only today's swipe counts)
```

## Usage

### Getting Daily Stats
```javascript
const response = await fetch(`/api/swipe/stats/user_123?limit=50`);
const data = await response.json();
console.log(data.swipesRemaining); // 49
```

### Recording a Swipe
```javascript
await fetch(`/api/swipe/action/user_123`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tmdbId: 12345,
    title: "Movie Title",
    posterPath: "/path.jpg",
    action: "like"
  })
});

// Then refresh the count
await refreshSwipeCount();
```

## Configuration

### Changing the Daily Limit
Update the constant in `frontend/src/components/swipe.js`:
```javascript
const DEFAULT_SWIPE_LIMIT = 50; // Change to desired limit
```

Note: The backend accepts the limit as a query parameter, so you can also pass different limits per request.

## Testing

### Manual Testing
1. Make a swipe and verify count increases
2. Wait until next day (or modify test data)
3. Verify count resets to 0
4. Verify yesterday's swipes still show in "Movies liked" total

### Test with Past Data
```javascript
// Add a swipe from yesterday
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
user.swipedMovies.push({
  tmdbId: 99999,
  title: "Yesterday's Movie",
  action: "like",
  swipedAt: yesterday.toISOString()
});

// Check stats - should not count yesterday's swipe
```

## Future Enhancements
1. Make limit configurable per user (premium vs free users)
2. Add weekly/monthly swipe statistics
3. Implement swipe history visualization
4. Add notifications when approaching daily limit

## Troubleshooting

### Swipe count not resetting
- Check that timestamps are being saved correctly in ISO 8601 format
- Verify UTC date calculation is working
- Check server timezone settings

### Incorrect swipe count
- Verify `swipedAt` timestamps are present on all swipe records
- Check that date comparison logic uses UTC
- Test with data from different dates

### Cross-device sync issues
- Ensure backend is being queried on page load
- Verify user data is properly saved to database
- Check that `refreshSwipeCount()` is called after swipes

---
*Implementation completed: December 20, 2025*
*Swipe functionality now fully operational with automatic daily reset using user data timestamps*
