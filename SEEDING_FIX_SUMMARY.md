# MongoDB Connection and Data Seeding Fix

## Problem
The application was experiencing issues where:
1. No user data was showing in profiles after seeding
2. MongoDB connection was not properly configured
3. Seeded data was not transferring or persisting correctly

## Root Causes
1. **Missing `.env` file** - The application had no environment configuration
2. **No fallback data in seeder** - When TMDB API was unavailable, the seeder generated users with empty arrays for `favoriteMovies`, `favoriteTVShows`, `movieRatings`, etc.
3. **No seeded data** - The database was empty because the seeder had never been run successfully

## Solution Implemented

### 1. Created `.env` Configuration File
Created a properly configured `.env` file with file-based storage as the default:
```env
DB_TYPE=file
PORT=3000
NODE_ENV=development
TMDB_API_KEY=YOUR_TMDB_API_KEY_HERE
```

### 2. Updated Seeder to Use Fallback Data
Modified `backend/scripts/seedUsers.js` to use fallback movie/TV data when TMDB API is unavailable:
- Now imports `fallbackMovies` from `backend/services/fallbackData.js`
- Returns fallback movies (15 popular movies) when TMDB API fails
- Returns fallback TV shows (converted from movies) when TMDB API fails
- This ensures users are generated with complete profile data even without API access

### 3. Generated Test Data
Successfully seeded 100 test users with complete profiles including:
- Profile pictures and photo galleries
- Streaming services (2-5 services per user)
- Favorite movies (2-8 per user)
- Favorite TV shows (2-8 per user)
- Movie ratings (3-12 per user)
- Movie watchlists (3-10 per user)
- TV watchlists (3-10 per user)
- Watch history with timestamps
- Preferences (genres, age range, location radius, etc.)

## Usage

### File-Based Storage (Default - Recommended)
1. Ensure `.env` file exists with `DB_TYPE=file` (or omit DB_TYPE entirely)
2. Run the seeder:
   ```bash
   npm run seed
   ```
3. Data is saved to `data/users.json`
4. Use credentials from `TEST_CREDENTIALS.md` to login

### MongoDB Storage (Optional)
1. Get MongoDB Atlas connection string from https://www.mongodb.com/atlas
2. Update `.env` file:
   ```env
   DB_TYPE=mongodb
   MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/netflix-and-chill?retryWrites=true&w=majority
   ```
3. Run the seeder:
   ```bash
   npm run seed:mongodb
   ```
4. Data is saved to MongoDB Atlas
5. Use credentials from `TEST_CREDENTIALS.md` to login

## Test Credentials
All test users have the same password: `password123`

Example users (see TEST_CREDENTIALS.md for complete list):
- carsonw93@hotmail.com
- harper_lewis@hotmail.com
- casey1992@hotmail.com

## Verification

### Check Data Files
```bash
# Check if users were created
ls -lh data/users.json

# Count users
cat data/users.json | grep '"id":' | wc -l

# View first user
cat data/users.json | head -100
```

### Test API Endpoint
```bash
# Start the server
npm start

# In another terminal, test user retrieval
curl http://localhost:3000/api/users/USER_ID_HERE

# Or test login
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"carsonw93@hotmail.com","password":"password123"}'
```

## Files Modified
1. `backend/scripts/seedUsers.js` - Updated to use fallback movie data
2. `.env` - Created with proper configuration (not committed to git)

## Files Generated
1. `data/users.json` - 100 users with complete profiles (319KB)
2. `TEST_CREDENTIALS.md` - Markdown table of all test users
3. `TEST_CREDENTIALS.json` - JSON array of test user credentials

All generated files are excluded from git via `.gitignore`.

## Next Steps
- Start the server with `npm start`
- Open the application in your browser
- Login with any test user credentials
- Verify profile data displays correctly with all sections populated
- Test swipe, matches, and chat features with the test users

## Notes
- The seeder works without TMDB API key by using fallback data
- For production, obtain a real TMDB API key from https://www.themoviedb.org/settings/api
- File-based storage is perfect for development and testing
- MongoDB is recommended for production deployment
