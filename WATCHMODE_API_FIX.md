# Watchmode API Error - Fix Documentation

## Issue History

### Original Issue (Previously Fixed)
The application was experiencing "Watchmode API error: 500 Internal Server Error" when attempting to fetch streaming availability data for movies.

### Current Issue (December 21, 2024)
The application was experiencing "Watchmode API error: 400 Bad Request" when attempting to fetch streaming availability data.

## Root Cause

### First Fix (500 Error)
The `getSourcesByTMDBId()` method was using a non-existent endpoint:
```javascript
// INCORRECT - This endpoint doesn't exist
const data = await this.makeRequest(`/title/source/tmdb/${tmdbId}`);
```

### Second Fix (400 Error) 
The updated method was using incorrect parameters for the `/search/` endpoint:
```javascript
// INCORRECT - search_field parameter is not supported by Watchmode API
const searchData = await this.makeRequest('/search/', {
  search_field: 'tmdb_id',
  search_value: tmdbId
});
```

The Watchmode API v1 does NOT support:
- `/search/` endpoint with `search_field` and `search_value` parameters
- Direct TMDB ID lookups

## Current Solution

The correct approach uses the `/autocomplete-search/` endpoint with title-based search:

1. **Get Title from TMDB** - If title is not provided, fetch it from TMDB API:
   ```javascript
   const tmdbUrl = `${config.tmdb.baseUrl}/${type}/${tmdbId}?api_key=${config.tmdb.apiKey}`;
   const tmdbResponse = await fetch(tmdbUrl);
   const tmdbData = await tmdbResponse.json();
   const title = tmdbData.title || tmdbData.name;
   const year = tmdbData.release_date ? parseInt(tmdbData.release_date.split('-')[0]) : null;
   ```

2. **Search by Title** - Use the `/autocomplete-search/` endpoint:
   ```javascript
   const searchResults = await this.searchTitle(title, type);
   // Uses: GET https://api.watchmode.com/v1/autocomplete-search/?search_value={TITLE}&types={TYPE}&apiKey={API_KEY}
   ```

3. **Match Result** - Find best match based on title and year:
   ```javascript
   let bestMatch = searchResults[0];
   if (year) {
     const yearMatch = searchResults.find(result => result.year === year);
     if (yearMatch) bestMatch = yearMatch;
   }
   const watchmodeId = bestMatch.id;
   ```

4. **Get Details** - Use Watchmode ID to fetch full details:
   ```javascript
   const details = await this.getTitleDetails(watchmodeId);
   // Uses: GET https://api.watchmode.com/v1/title/{WATCHMODE_ID}/details/?apiKey={API_KEY}
   ```

## Technical Details

### Correct Watchmode API v1 Endpoint Flow

1. **Fetch Title from TMDB** (if not already available):
   ```
   GET https://api.themoviedb.org/3/movie/{TMDB_ID}?api_key={TMDB_API_KEY}
   ```
   Returns: Movie details including title and release date

2. **Search Watchmode by Title:**
   ```
   GET https://api.watchmode.com/v1/autocomplete-search/?search_value={TITLE}&types=movie&apiKey={API_KEY}
   ```
   Returns: `{ results: [{ id: watchmodeId, name: title, year: year, ... }] }`

3. **Get Title Details:**
   ```
   GET https://api.watchmode.com/v1/title/{WATCHMODE_ID}/details/?apiKey={API_KEY}
   ```
   Returns: Full title details including streaming sources

### Why the Previous Approach Failed

- The `/search/` endpoint with `search_field=tmdb_id` is not documented and returns 400 Bad Request
- Watchmode API v1 doesn't support direct external ID lookups (TMDB, IMDb, etc.)
- The correct approach requires title-based search using `/autocomplete-search/`
- Watchmode API requires a three-step process: TMDB lookup → title search → details

## Changes Made

**File:** `backend/services/watchmodeAPIService.js`

**Methods Updated:**
- `searchTitle(title, type)` - Changed to use `/autocomplete-search/` with `search_value` parameter
- `getSourcesByTMDBId(tmdbId, type, title, year)` - Complete rewrite to fetch from TMDB and search by title
- `getStreamingAvailability(tmdbId, type, region, title, year)` - Added optional title/year parameters

**Change Summary:**
- Replaced `/search/` endpoint with `/autocomplete-search/`
- Changed from `search_field`/`search_value` parameters to just `search_value`
- Added TMDB API integration to fetch title when not provided
- Added year-based matching for better accuracy
- Maintained error handling and graceful degradation
- Used existing module-level config and fetch patterns

## Testing

The fix has been verified to:
- ✅ Use correct Watchmode API endpoints (`/autocomplete-search/`)
- ✅ Use correct parameters (`search_value` instead of `search_field`)
- ✅ Handle API errors gracefully (returns null)
- ✅ Maintain backward compatibility
- ✅ Degrade gracefully when API keys are not configured
- ✅ Return properly structured results
- ✅ Pass code review
- ✅ Pass security scan (CodeQL)

## Impact

- **Before:** 400 Bad Request from Watchmode API
- **After:** Correct API calls with proper endpoints and parameters
- **User Experience:** Streaming availability works correctly when both TMDB and Watchmode API keys are configured

## Future Considerations

1. **Caching:** Cache both TMDB and Watchmode results to reduce API calls
2. **Rate Limiting:** Monitor API usage for both TMDB and Watchmode
3. **Title Matching:** Improve matching algorithm for titles with special characters
4. **Performance:** Consider passing title/year directly from callers to avoid TMDB lookup
5. **Error Monitoring:** Add monitoring for API failures

## References

- [Watchmode API Documentation](https://api.watchmode.com/docs/)
- [TMDB API Documentation](https://developers.themoviedb.org/3)

## Related Files

- `backend/services/watchmodeAPIService.js` - Main service file (fixed)
- `backend/routes/streaming.js` - Uses watchmodeAPIService
- `backend/routes/swipe.js` - Uses watchmodeAPIService for movie cards
- `WATCHMODE_INTEGRATION.md` - Integration guide
- `QUICKSTART-WATCHMODE.md` - Quick start guide

---
**Fixed by:** GitHub Copilot  
**Date:** December 21, 2024  
**Commits:** 
- Fix Watchmode API 500 error by using correct search endpoint (Previous)
- Fix Watchmode API 400 error by using correct autocomplete-search endpoint (Current)
