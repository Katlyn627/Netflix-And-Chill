# Watchmode API 500 Error - Fix Documentation

## Issue
The application was experiencing "Watchmode API error: 500 Internal Server Error" when attempting to fetch streaming availability data for movies.

## Root Cause
The `getSourcesByTMDBId()` method in `backend/services/watchmodeAPIService.js` was using an incorrect Watchmode API endpoint:
```javascript
// INCORRECT - This endpoint doesn't exist in Watchmode API v1
const data = await this.makeRequest(`/title/source/tmdb/${tmdbId}`);
```

## Solution
Updated the method to use the correct Watchmode API v1 endpoint format:

1. **Search by TMDB ID** - Use the `/search/` endpoint with `search_field=tmdb_id`:
   ```javascript
   const searchData = await this.makeRequest('/search/', {
     search_field: 'tmdb_id',
     search_value: tmdbId
   });
   ```

2. **Extract Watchmode ID** - Get the Watchmode ID from search results:
   ```javascript
   const watchmodeId = searchData.title_results[0].id;
   ```

3. **Fetch Details** - Use the Watchmode ID to get full details:
   ```javascript
   const details = await this.getTitleDetails(watchmodeId);
   ```

## Technical Details

### Correct Watchmode API v1 Endpoint Flow
1. **Convert TMDB ID to Watchmode ID:**
   ```
   GET https://api.watchmode.com/v1/search/?search_field=tmdb_id&search_value={TMDB_ID}&apiKey={API_KEY}
   ```
   Returns: `{ title_results: [{ id: watchmodeId, ... }] }`

2. **Get Title Details:**
   ```
   GET https://api.watchmode.com/v1/title/{WATCHMODE_ID}/details/?apiKey={API_KEY}
   ```
   Returns: Full title details including streaming sources

### Why the Old Endpoint Failed
- The endpoint `/title/source/tmdb/{tmdb_id}` doesn't exist in the Watchmode API v1 specification
- Watchmode API requires a two-step process: search → details
- Direct TMDB-to-details conversion is not supported

## Changes Made
**File:** `backend/services/watchmodeAPIService.js`

**Method:** `getSourcesByTMDBId(tmdbId, type)`

**Lines Changed:** 91-106

**Change Summary:**
- Replaced single incorrect API call with proper two-step flow
- Added validation for search results
- Maintained error handling and graceful degradation

## Testing
The fix has been verified to:
- ✅ Use correct Watchmode API endpoints
- ✅ Handle API errors gracefully (returns null)
- ✅ Maintain backward compatibility
- ✅ Degrade gracefully when API key is not configured
- ✅ Return properly structured results

## Impact
- **Before:** 500 Internal Server Error from Watchmode API
- **After:** Proper API calls, correct data retrieval or graceful null response
- **User Experience:** Streaming availability now works correctly when API key is configured

## Future Considerations
1. **Caching:** Consider caching Watchmode search results to reduce API calls
2. **Rate Limiting:** Monitor API usage to stay within free tier limits (1,000 calls/day)
3. **Region Support:** Ensure region parameter is passed correctly to sources endpoint
4. **Error Monitoring:** Add monitoring for API failures to detect issues early

## References
- [Watchmode API Documentation](https://api.watchmode.com/docs/)
- [Issue: Watchmode API 500 Error](https://github.com/Katlyn627/Netflix-And-Chill/issues/)

## Related Files
- `backend/services/watchmodeAPIService.js` - Main service file (fixed)
- `backend/routes/streaming.js` - Uses watchmodeAPIService
- `backend/routes/swipe.js` - Uses watchmodeAPIService for movie cards
- `WATCHMODE_INTEGRATION.md` - Integration guide
- `QUICKSTART-WATCHMODE.md` - Quick start guide

---
**Fixed by:** GitHub Copilot  
**Date:** December 21, 2024  
**Commit:** Fix Watchmode API 500 error by using correct search endpoint
