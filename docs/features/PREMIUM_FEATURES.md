# Premium Features Guide

## Overview
This document describes the premium features that have been implemented in the Netflix & Chill dating app. Premium features provide enhanced functionality for paid subscribers.

## Premium Features Implemented

### 1. Premium Filter Options ⭐
Premium users can access advanced filtering options to find more compatible matches:

#### Available Filters:
- **Genre Preferences**: Filter matches by specific movie/TV genres (Action, Comedy, Drama, Horror, etc.)
- **Binge Patterns**: Filter by viewing habits (episodes per session range)
- **Streaming Services**: Filter to find matches with specific streaming platforms (Netflix, Disney+, Hulu, etc.)
- **Movie Decades**: Filter by preferred movie eras (1960s-2020s)
- **Advanced Compatibility Score**: Set a minimum compatibility threshold

#### How to Use:
1. Click the "Filters" button on the matches page
2. Premium filters section will be visible for premium users
3. Select your preferred filters
4. Click "Apply Filters" to see filtered results

### 2. See Who Liked You 💖
Premium users can see the full details of users who have liked them.

#### Backend API:
- `GET /api/likes/:userId/received` - Get users who liked you (premium feature)
  - Free users: Only see count
  - Premium users: See full user details

#### Features:
- View complete profiles of users who liked you
- See profile pictures, bio, age, location
- Direct access to chat with users who liked you

### 3. Unlimited Swipes ♾️
Premium users have unlimited content swipes (already implemented in swipe.js).

#### Features:
- No daily swipe limit
- Swipe through unlimited movies and TV shows
- All swipe history is tracked

## Backend Implementation

### User Model Updates
```javascript
// New fields in User model
this.profileBoosted = data.profileBoosted || false;
this.boostExpiresAt = data.boostExpiresAt || null;
this.boostHistory = data.boostHistory || [];
```

### New API Endpoints

#### Boost Profile
```
POST /api/users/:userId/boost
Body: { durationHours: 24 }
Response: {
  message: "Profile boost activated successfully",
  profileBoosted: true,
  boostExpiresAt: "2026-01-08T00:54:27.572Z",
  durationHours: 24
}
```

#### Get Boost Status
```
GET /api/users/:userId/boost
Response: {
  profileBoosted: true,
  boostExpiresAt: "2026-01-08T00:54:27.572Z",
  timeRemaining: 86400000,
  boostHistory: [...]
}
```

#### Get Users Who Liked You
```
GET /api/likes/:userId/received
Response (Premium): {
  userId: "user_123",
  count: 5,
  likes: [
    {
      fromUserId: "user_456",
      toUserId: "user_123",
      type: "like",
      createdAt: "2026-01-07T10:00:00Z",
      fromUser: {
        id: "user_456",
        username: "john_doe",
        age: 28,
        location: "New York, NY",
        bio: "Movie enthusiast...",
        profilePicture: "...",
        streamingServices: [...],
        archetype: {...}
      }
    }
  ],
  isPremium: true
}

Response (Free): {
  userId: "user_123",
  count: 5,
  likes: [],
  isPremium: false,
  message: "Upgrade to premium to see who liked you"
}
```

### Matching Engine Updates
Premium filters are supported in the `MatchingEngine.passesFilters()` method:

```javascript
// Premium filter structure
filters.premium = {
  genreIds: [28, 35, 18],  // Action, Comedy, Drama
  bingeRange: { min: 3, max: 10 },
  streamingServices: ['Netflix', 'Disney+'],
  decades: [2000, 2010, 2020],
  minAdvancedScore: 50
}
```

## Frontend Implementation

### Premium Filter UI
Located in `frontend/matches.html`:
- Genre multi-select dropdown
- Binge pattern number inputs (min/max)
- Streaming service checkboxes
- Movie decade checkboxes
- Advanced score slider

### CSS Classes
New CSS classes in `frontend/src/styles/matches.css`:
- `.premium-filter-controls` - Container for premium filters
- `.premium-filter-item` - Individual filter item
- `.match-boost-badge` - Boost badge with animation
- `.liked-you-section` - Section for users who liked you
- `.liked-you-card` - Individual user card in liked-you section

### Boost Badge Display
Boosted profiles show a golden "🚀 BOOSTED" badge with a pulsing animation in the top-right corner of match cards.

## Testing

### To Test Premium Features:

1. **Enable Premium for a User:**
```javascript
// Use the toggle premium button in profile-view.html
// Or make API call:
PUT /api/users/:userId/premium
Body: { isPremium: true }
```

2. **Activate Boost:**
```javascript
POST /api/users/:userId/boost
Body: { durationHours: 24 }
```

3. **Test Premium Filters:**
- Log in as premium user
- Go to matches page
- Click "Filters" button
- Premium filters section should be visible
- Select filters and apply

4. **Test "Liked You" Feature:**
- Have other users like your profile
- As a premium user, fetch received likes:
```javascript
GET /api/likes/:userId/received
```

5. **Test Unlimited Swipes:**
- Go to swipe page (swipe.html)
- Swipe content - no limits enforced

## Security Considerations

1. Premium status is checked on the backend for all premium features
2. Free users cannot access premium filter results
3. Free users only see count of users who liked them, not details
4. Boost activation requires premium status

## Future Enhancements

- Payment integration for premium subscriptions
- Multiple boost duration options (12h, 24h, 48h)
- Premium badge on profile
- Analytics for premium users (profile views, like rates)
- Premium-only content recommendations

## Notes

- Unlimited swipes were already implemented in the swipe.js routes
- The boost badge uses CSS animations for visual appeal
- Premium filters are backward compatible (work without breaking free users)
- All premium features gracefully degrade for free users
