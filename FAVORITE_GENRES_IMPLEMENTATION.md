# Favorite Genres Implementation

## Overview
This implementation adds the ability to save, parse, and display users' favorite genres based on their swipe analytics data within the discover matches tab and profile views.

## Problem Solved
Users' favorite genres, derived from their actual viewing behavior (swiped movies/shows), are now:
1. **Saved**: Automatically calculated and stored when users swipe
2. **Parsed**: Analyzed to extract top genres with percentages
3. **Displayed**: Shown in discover match cards and profile views

## Architecture

### Backend Changes

#### 1. User Model (`backend/models/User.js`)
- **Existing Fields Used**:
  - `swipedMovies`: Array of swiped content with genre IDs
  - `swipePreferences`: Cached analytics including `topGenres`
  
- **Methods**:
  - `updateSwipePreferences(analytics)`: Saves calculated analytics
  - `getSwipePreferences()`: Retrieves cached analytics

#### 2. Swipe Analytics (`backend/utils/swipeAnalytics.js`)
- **Function**: `analyzeSwipePreferences(swipedMovies)`
  - Processes all swiped movies to extract genre preferences
  - Returns analytics object with:
    - `topGenres`: Array of favorite genres with counts and percentages
    - `totalLikes`: Count of liked content
    - `genrePreferences`: Detailed breakdown by genre category
    - Other statistics (like percentage, content type breakdown)

#### 3. Swipe Route (`backend/routes/swipe.js`)
- **POST `/api/swipe/action/:userId`**:
  - Records swipe action (like/dislike)
  - Automatically calculates analytics using `analyzeSwipePreferences()`
  - Saves analytics to `user.swipePreferences`
  - Updates happen in real-time after each swipe

#### 4. Match Controller (`backend/controllers/matchController.js`)
- **Updated**: Added `swipePreferences` to user objects in match responses
- **GET `/api/matches/find/:userId`**: Now includes favorite genres data
- **GET `/api/matches/history/:userId`**: Also includes swipePreferences

#### 5. Migration Script (`backend/scripts/updateSwipeAnalytics.js`)
- **Purpose**: Calculate analytics for existing users with swipe data
- **Usage**: 
  ```bash
  npm run update:analytics          # For file-based database
  npm run update:analytics:mongodb  # For MongoDB
  ```
- **Features**:
  - Processes all users with swipe data
  - Skips users without swipes or with existing analytics
  - Shows progress and summary statistics
  - Safe to run multiple times (idempotent)

### Frontend Changes

#### 1. Discover Component (`frontend/src/components/discover.js`)

**Profile Cards (`createCard` method)**:
- Prioritizes `user.swipePreferences.topGenres` over `user.preferences.genres`
- Displays top 3 favorite genres with ❤️ icon
- Falls back to preference genres if no swipe data exists
- Shows genre names only (e.g., "❤️ Drama", "❤️ Comedy")

**Profile Modal (`showUserInfoModal` method)**:
- Shows "❤️ Favorite Genres" section
- Displays up to 5 top genres with percentages
- Includes source label: "Based on viewing activity"
- Shows genre tags with percentage values (e.g., "Drama 70%")
- Falls back to preference genres with "Preferences" label

#### 2. Profile View Component (`frontend/src/components/profile-view.js`)

**Profile Popup (`showProfileViewPopup` method)**:
- Adds dedicated "❤️ Favorite Genres" section
- Shows top 5 genres with percentages from swipe analytics
- Displays total liked movies/shows count
- Styled with red accent color (#E50914) for emphasis
- Positioned between personality bio and movie preferences

## Data Flow

```
User Swipes on Movie/Show
        ↓
POST /api/swipe/action/:userId
        ↓
Add to user.swipedMovies array
        ↓
analyzeSwipePreferences(swipedMovies)
        ↓
Calculate topGenres with percentages
        ↓
Save to user.swipePreferences
        ↓
Data persists in database
        ↓
GET /api/matches/find/:userId
        ↓
Match API includes swipePreferences
        ↓
Frontend displays favorite genres
```

## Example Data Structure

### swipePreferences Object
```json
{
  "totalSwipes": 75,
  "totalLikes": 50,
  "totalDislikes": 25,
  "likePercentage": 67,
  "topGenres": [
    {
      "genre": "Drama",
      "count": 35,
      "percentage": 70
    },
    {
      "genre": "Comedy",
      "count": 15,
      "percentage": 30
    },
    {
      "genre": "Action",
      "count": 12,
      "percentage": 24
    }
  ],
  "genrePreferences": {
    "Drama": 35,
    "Comedy": 15,
    "Action": 12,
    "Sci-Fi": 8
  },
  "contentTypeBreakdown": {
    "movies": 30,
    "tvShows": 20,
    "moviePercentage": 60,
    "tvShowPercentage": 40
  }
}
```

## UI/UX Features

### Discover Match Cards
- **Visual Indicator**: ❤️ emoji distinguishes analytics-based genres from preferences
- **Top 3 Display**: Shows user's top 3 favorite genres
- **Compact Format**: Genre names only, no percentages
- **Fallback**: Shows preference genres if no swipe data

### Profile Modals
- **Detailed View**: Up to 5 top genres with percentages
- **Source Label**: "Based on viewing activity" or "Preferences"
- **Statistics**: Shows total liked movies/shows count
- **Color Coding**: Red background for analytics-based genres

## Benefits

1. **Authenticity**: Genres based on actual behavior, not just stated preferences
2. **Discovery**: Users can find matches with similar viewing tastes
3. **Engagement**: Encourages users to swipe more to build their profile
4. **Accuracy**: Percentages show strength of preference
5. **Transparency**: Clear labeling of data source

## Testing

### Automated Testing
```bash
# Seed test data
npm run seed:all

# Calculate analytics for all users
npm run update:analytics

# Verify analytics
curl http://localhost:3000/api/users/<userId> | jq '.swipePreferences.topGenres'
```

### Manual Testing
1. Start server: `npm start`
2. Login with test credentials (see TEST_CREDENTIALS.md)
3. Navigate to discover page
4. Observe favorite genres on match cards (with ❤️ icon)
5. Click info button to see detailed genre breakdown
6. Visit profile page to see favorite genres section

### Test Results
- ✅ 100 users seeded with 50-100 swipes each
- ✅ Analytics calculated successfully for all users
- ✅ API returns swipePreferences in match responses
- ✅ Genres display correctly in discover cards
- ✅ Profile modals show detailed genre information
- ✅ Migration script runs without errors

## Future Enhancements

1. **Genre Filtering**: Allow users to filter matches by favorite genres
2. **Genre Compatibility Score**: Calculate match scores based on genre overlap
3. **Trending Genres**: Show users' trending genres over time
4. **Genre Insights**: "You've been watching more Action lately!"
5. **Genre-Based Recommendations**: Suggest movies based on favorite genres
6. **Privacy Controls**: Let users hide/show favorite genres

## Maintenance

### Recalculating Analytics
If analytics need to be recalculated (e.g., after algorithm changes):
```bash
npm run update:analytics
```

### Database Migration
When deploying to production with existing users:
1. Run the migration script before deploying frontend changes
2. This ensures all users have analytics before the UI tries to display them

### Monitoring
- Check that swipePreferences is populated after swipes
- Monitor analytics calculation performance
- Verify genre mappings are accurate

## Related Files

### Backend
- `backend/models/User.js` - User model with swipe data
- `backend/utils/swipeAnalytics.js` - Analytics calculation logic
- `backend/routes/swipe.js` - Swipe action handling
- `backend/controllers/matchController.js` - Match API responses
- `backend/scripts/updateSwipeAnalytics.js` - Migration script

### Frontend
- `frontend/src/components/discover.js` - Match card display
- `frontend/src/components/profile-view.js` - Profile popup
- `frontend/src/components/swipeAnalytics.js` - Analytics visualization

## Support

For questions or issues:
1. Check the API response includes swipePreferences
2. Verify analytics were calculated (run migration script)
3. Check browser console for errors
4. Review server logs for analytics calculation issues
