# MongoDB Array Fix - Empty Arrays Issue Resolution

## Problem
When viewing data in MongoDB Atlas, all arrays that are used for matching (streamingServices, favoriteMovies, swipedMovies, preferences.genres, etc.) were showing as empty, even after running the seeding script. This caused no matches to be displayed.

## Root Cause
The issue was in the `User` model constructor (`backend/models/User.js`, lines 18-25). The `preferences` object initialization had a logic error:

### Before (Buggy Code)
```javascript
this.preferences = data.preferences || {
  genres: [],
  bingeWatchCount: 0,
  ageRange: { min: 18, max: 100 },
  locationRadius: 50,
  genderPreference: data.preferences?.genderPreference || [],
  sexualOrientationPreference: data.preferences?.sexualOrientationPreference || []
};
```

**Problem**: When `data.preferences` exists (is truthy), the `||` operator returns `data.preferences` directly, and the default object with its nested property checks (lines with `data.preferences?.genderPreference` and `data.preferences?.sexualOrientationPreference`) is never evaluated. This meant:

1. If `data.preferences` existed but was missing nested properties like `genres`, they would be `undefined` instead of `[]`
2. The intended fallback values for `genderPreference` and `sexualOrientationPreference` were never used
3. When User objects were reconstructed from MongoDB data, any missing nested properties would be `undefined` rather than their default values

## Solution
Changed the `preferences` initialization to explicitly handle each nested property with its own fallback:

### After (Fixed Code)
```javascript
// Initialize preferences with proper defaults for all nested properties
this.preferences = {
  genres: data.preferences?.genres || [],
  bingeWatchCount: data.preferences?.bingeWatchCount !== undefined ? data.preferences.bingeWatchCount : 0,
  ageRange: data.preferences?.ageRange || { min: 18, max: 100 },
  locationRadius: data.preferences?.locationRadius !== undefined ? data.preferences.locationRadius : 50,
  genderPreference: data.preferences?.genderPreference || [],
  sexualOrientationPreference: data.preferences?.sexualOrientationPreference || []
};
```

This ensures:
- Each nested property has its own fallback value
- Arrays default to `[]` when missing
- Numeric values (bingeWatchCount, locationRadius) are checked with `!== undefined` to allow `0` as a valid value
- The preferences object is always properly structured, whether data comes from new user creation or MongoDB retrieval

## Impact
- ✅ All array fields now properly default to empty arrays instead of undefined
- ✅ User preferences are correctly preserved when saved to and retrieved from MongoDB
- ✅ Matching engine can now properly calculate matches based on shared content
- ✅ Existing seeded data will be properly reconstructed when loaded from the database

## Testing
To verify the fix works:

1. **Test the User model directly**:
   ```bash
   node backend/scripts/testMongoDBInsert.js
   ```

2. **Re-seed the database** (if arrays are already empty in MongoDB):
   ```bash
   # For MongoDB
   DB_TYPE=mongodb node backend/scripts/seedUsers.js
   
   # For file-based DB
   node backend/scripts/seedUsers.js
   ```

3. **Verify matches are working**:
   - Log in with any test user
   - Navigate to the matches/discover page
   - Matches should now appear based on shared movies, genres, and streaming services

## Files Modified
- `backend/models/User.js` - Fixed preferences object initialization

## Files Added
- `backend/scripts/testMongoDBInsert.js` - Test script to verify MongoDB array preservation
- `MONGODB_ARRAY_FIX.md` - This documentation file

## Notes
- This fix is backward compatible - existing data in MongoDB will be properly handled
- Users created before this fix will have their data correctly reconstructed when loaded
- No database migration is required
