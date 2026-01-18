# Swipe Analytics-Based Matching Implementation

## Overview

This document describes the enhancement to the Netflix and Chill matching algorithm that uses swipe analytics data to match users based on their favorite genres and binge-watching profiles derived from their swipe behavior.

## Problem Statement

The original matching algorithm primarily matched users based on:
- Explicitly selected genre preferences
- Shared favorite movies
- Shared watch history
- Similar binge-watching counts

However, it didn't fully leverage the **swipe analytics data** that captures users' actual viewing preferences through their swipe behavior on the discovery page.

## Solution

We enhanced the matching engine to use swipe analytics data to:
1. **Derive genre preferences** from liked movies in swipe data (not just explicit preferences)
2. **Match binge-watching patterns** using both explicit preferences and inferred patterns from TV show swipes
3. **Match content type preferences** (movies vs TV shows) based on swipe behavior

## Implementation Details

### New Compatibility Scoring Methods

#### 1. Swipe Genre Compatibility (0-25 points)
- Uses **cosine similarity** algorithm to compare genre preference vectors
- Analyzes liked movies from swipe data to extract genre preferences
- Calculates similarity between users' genre preferences
- Higher scores indicate users who liked similar genres

**Algorithm:**
```javascript
// Get genre counts from liked movies
user1Genres = {Action: 5, Comedy: 3, Drama: 2}
user2Genres = {Action: 4, Comedy: 2, Drama: 3}

// Calculate cosine similarity
similarity = dotProduct(user1, user2) / (magnitude(user1) * magnitude(user2))
score = similarity * 25  // Scale to 0-25 points
```

#### 2. Enhanced Binge Compatibility (0-20 points)
- Base score from explicit binge watch count difference
- Bonus points if both users show TV show preference in swipes (>40%)
- More nuanced scoring with gradual decline

**Scoring:**
- 15 points: Identical binge counts (>0)
- 12 points: Difference ≤1
- 10 points: Difference ≤2
- 7 points: Difference ≤3
- 4 points: Difference ≤5
- +5 bonus: Both users like TV shows (>40% from swipes)

#### 3. Content Type Compatibility (0-10 points)
- Compares movie vs TV show preferences from swipe data
- Uses percentage difference between users
- Perfect match if both prefer same content type

**Algorithm:**
```javascript
movieDiff = abs(user1MoviePref - user2MoviePref)
tvDiff = abs(user1TvPref - user2TvPref)
avgDiff = (movieDiff + tvDiff) / 2
similarity = 100 - avgDiff
score = (similarity / 100) * 10  // Scale to 0-10 points
```

### Match Description Enhancements

Match descriptions now include swipe-based compatibility mentions:
- "have similar taste in movies from your swipes"
- "both prefer movies over TV shows"
- "both love binge-watching TV series"

### API Response Changes

The match API now returns additional compatibility fields:

```json
{
  "matchScore": 100,
  "matchDescription": "100% Movie Match – ...",
  "bingeCompatibility": 12,
  "swipeGenreCompatibility": 23,
  "contentTypeCompatibility": 10,
  "quizCompatibility": 8,
  "emotionalToneCompatibility": 7
}
```

## Files Modified

1. **backend/utils/matchingEngine.js**
   - Added `calculateBingeWatchingCompatibility()` method
   - Added `calculateSwipeGenreCompatibility()` method
   - Added `calculateContentTypeCompatibility()` method
   - Updated `calculateMatch()` to use new methods
   - Enhanced `generateMatchDescription()` with swipe-based mentions

2. **backend/models/Match.js**
   - Added `bingeCompatibility` field
   - Added `swipeGenreCompatibility` field
   - Added `contentTypeCompatibility` field

3. **backend/controllers/matchController.js**
   - Updated response to include new compatibility scores

4. **backend/scripts/testSwipeMatching.js** (NEW)
   - Comprehensive test suite for swipe-based matching
   - Validates all compatibility scores are calculated
   - Verifies match descriptions include swipe mentions

## How It Works

### User Journey

1. **User swipes on movies/TV shows** in the discovery page
2. **Swipe data is saved** with genre IDs and content type
3. **Swipe analytics analyzes** the data to extract:
   - Top genres from liked content
   - Content type preferences (movies vs TV shows)
   - Viewing patterns

4. **Matching engine uses analytics** to find compatible users:
   - Compares genre preference vectors using cosine similarity
   - Matches users with similar binge-watching patterns
   - Matches users with similar content type preferences

5. **Match results show** enhanced compatibility scores and descriptions

### Example Match Output

```
User: BrooksMartinez195
   Binge Watch Count: 5
   Liked Movies: 9 (Drama 78%, Crime 56%, Thriller 33%)
   Content Preference: 100% movies

Match: andyw32 (100% match)
   Swipe Genre Compatibility: 22/25 points
   Binge Compatibility: 10/20 points
   Content Type Compatibility: 10/10 points
   
   Description: "100% Movie Match – You share 3 favorite movies,
   Have 3 movies on both watchlists, love documentaries, science
   fictions, and thrillers, have similar taste in movies from
   your swipes, and both prefer movies over TV shows"
```

## Testing

### Test Script
Run the comprehensive test suite:
```bash
node backend/scripts/testSwipeMatching.js
```

The test script validates:
1. All matches have swipe genre compatibility scores
2. All matches have binge compatibility scores
3. All matches have content type compatibility scores
4. Top matches use swipe-based scoring
5. Match descriptions mention swipe-based compatibility

### Manual Testing
```bash
# Seed database with test users
npm run seed

# Start server
npm start

# Test matching API
curl "http://localhost:3000/api/matches/find/{userId}?limit=5"
```

## Benefits

1. **More Accurate Matching**: Uses actual behavior (swipes) rather than just explicit preferences
2. **Automatic Preference Learning**: Users don't need to manually select all genre preferences
3. **Nuanced Compatibility**: Multiple dimensions of compatibility (genres, binge patterns, content types)
4. **Better User Experience**: Users see matches that truly align with their viewing habits

## Performance Considerations

- Swipe analytics are calculated on-demand (not cached)
- Cosine similarity calculation is O(n) where n is number of unique genres
- All calculations are fast enough for real-time matching (<100ms per user pair)

## Future Enhancements

Potential improvements:
1. Cache swipe analytics results for frequently accessed users
2. Weight recent swipes more heavily than older swipes
3. Add time-of-day preference matching based on swipe timestamps
4. Consider swipe velocity (how quickly user swipes) as engagement indicator

## Conclusion

The swipe analytics-based matching enhancement successfully uses behavioral data to improve match quality. Users are now matched based on their actual viewing preferences as demonstrated through their swipe behavior, resulting in more compatible and satisfying matches.
