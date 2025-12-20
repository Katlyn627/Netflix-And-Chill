# Swipe Feature Quick Start Guide

This guide will help you get the movie swipe and matching feature working.

## Overview

The swipe feature allows users to:
1. **Discover movies** from TMDB (The Movie Database)
2. **Like or dislike** movies by swiping right or left
3. **Find matches** with other users based on shared movie preferences
4. **View match scores** that show compatibility based on liked movies

## Setup Instructions

### Option 1: Use Demo Data (No API Key Required)

The app includes fallback demo data with 15 popular movies. This option works without any API keys and is perfect for testing:

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Create .env file** (if not already exists):
   ```bash
   cp .env.example .env
   ```

3. **Start the server**:
   ```bash
   npm start
   ```

4. **Access the app**:
   - Open browser to http://localhost:3000
   - Create a user profile at http://localhost:3000/profile.html
   - Start swiping at http://localhost:3000/swipe.html

The demo movies include popular titles like:
- Fight Club
- Forrest Gump
- The Dark Knight
- Inception
- The Shawshank Redemption
- And 10 more classics!

### Option 2: Use Real TMDB Data (Recommended for Production)

To get access to thousands of real movies from TMDB:

1. **Get a free TMDB API key**:
   - Visit https://www.themoviedb.org/
   - Create a free account
   - Go to Settings > API
   - Request an API Key (choose "Developer" option)
   - Fill in application details and accept terms
   - Copy your API Key

2. **Configure the API key**:
   - Open the `.env` file in the root directory
   - Find the line: `TMDB_API_KEY=YOUR_TMDB_API_KEY_HERE`
   - Replace `YOUR_TMDB_API_KEY_HERE` with your actual API key
   - Example: `TMDB_API_KEY=abc123xyz456def789`

3. **Restart the server**:
   ```bash
   # Stop the server (Ctrl+C)
   npm start
   ```

4. **Test the integration**:
   - Movies should now load from TMDB
   - You'll see current, popular movies
   - Movie posters will display properly
   - Descriptions will be up-to-date

## How It Works

### 1. Movie Discovery
- Movies are fetched from TMDB API (or demo data)
- Filtered based on user's genre preferences
- Excludes movies already swiped by the user
- Returns movie with:
  - Title
  - Poster image
  - Description/overview
  - Release date
  - Rating
  - Genre IDs

### 2. Swipe Actions
- **Swipe Right / Click ♥ Button**: Like the movie
- **Swipe Left / Click ✕ Button**: Dislike the movie
- Each action is recorded to the user's profile
- Daily limit: 50 swipes per user (resets at midnight)

### 3. Match Generation
When you click "Find Matches" or "Done Swiping":
- System compares your liked movies with other users
- Calculates match scores based on:
  - Shared liked movies (30 points each)
  - Shared favorite movies (25 points each)
  - Shared watch history (20 points each)
  - Similar genre preferences (5 points each)
  - Shared streaming services (10 points each)
  - Compatible binge-watching patterns (15 points)
  - Emotional tone alignment (up to 10 points)
- Returns matches sorted by compatibility (highest first)
- Match descriptions show what you have in common

### 4. API Endpoints

**Get Movies for Swiping:**
```
GET /api/swipe/movies/:userId?limit=20
```

**Record Swipe Action:**
```
POST /api/swipe/action/:userId
Body: { tmdbId, title, posterPath, action: "like" | "dislike" }
```

**Get User's Liked Movies:**
```
GET /api/swipe/liked/:userId
```

**Get Swipe Stats:**
```
GET /api/swipe/stats/:userId?limit=50
```

**Find Matches:**
```
GET /api/matches/:userId
```

## Testing the Feature

### Quick Test Scenario

1. **Create two test users**:
   ```bash
   # User 1
   curl -X POST http://localhost:3000/api/users \
     -H "Content-Type: application/json" \
     -d '{"username":"user1","email":"user1@test.com","password":"pass123","name":"Alice","age":25,"gender":"female","location":"New York, NY"}'
   
   # User 2
   curl -X POST http://localhost:3000/api/users \
     -H "Content-Type: application/json" \
     -d '{"username":"user2","email":"user2@test.com","password":"pass123","name":"Bob","age":27,"gender":"male","location":"New York, NY"}'
   ```

2. **Both users like the same movie**:
   ```bash
   # User 1 likes Fight Club (tmdbId: 550)
   curl -X POST http://localhost:3000/api/swipe/action/USER_1_ID \
     -H "Content-Type: application/json" \
     -d '{"tmdbId":550,"title":"Fight Club","posterPath":"...","action":"like"}'
   
   # User 2 likes Fight Club
   curl -X POST http://localhost:3000/api/swipe/action/USER_2_ID \
     -H "Content-Type: application/json" \
     -d '{"tmdbId":550,"title":"Fight Club","posterPath":"...","action":"like"}'
   ```

3. **Check matches**:
   ```bash
   curl http://localhost:3000/api/matches/USER_1_ID
   ```
   
   You should see User 2 as a match with a description like:
   ```
   "45% Movie Match – Both liked 'Fight Club'"
   ```

## Troubleshooting

### Movies Not Loading

**Problem**: No movies show up in the swipe interface

**Solutions**:
1. Check browser console for errors (F12 > Console tab)
2. Verify server is running: http://localhost:3000/health
3. Check if API endpoint returns data:
   ```bash
   curl http://localhost:3000/api/swipe/movies/YOUR_USER_ID?limit=5
   ```
4. If using TMDB API key, verify it's correctly set in `.env`
5. Check server logs for "TMDB API key not configured" warnings

### TMDB API Issues

**Problem**: Error messages about TMDB API

**Solutions**:
1. Verify your API key is active (may take a few minutes after creation)
2. Check you haven't exceeded rate limits (40 requests per 10 seconds)
3. Test API key directly:
   ```bash
   curl "https://api.themoviedb.org/3/movie/popular?api_key=YOUR_KEY"
   ```
4. If all else fails, remove or set API key to placeholder to use demo data:
   ```
   TMDB_API_KEY=YOUR_TMDB_API_KEY_HERE
   ```

### Swipe Limit Reached

**Problem**: "Daily Swipe Limit Reached!" message appears

**Solutions**:
1. Wait until next day (resets at midnight)
2. Or manually reset for testing:
   - Edit user data in `backend/data/users.json`
   - Remove swipe entries with today's date
   - Or delete all swiped movies from user record

### No Matches Found

**Problem**: No matches appear after swiping

**Solutions**:
1. Ensure other users exist in the database
   - Use `npm run seed` to generate 100 test users
2. Make sure other users have liked some of the same movies
3. Check age range and other filter settings
4. Lower the minimum match score threshold

## Features

### Daily Swipe Limit
- Users can swipe up to 50 movies per day
- Counter shows remaining swipes
- Resets automatically at midnight (based on timestamps)
- Prevents spam and encourages thoughtful selections

### Match Score Calculation
Match scores range from 0-100 and consider:
- **Shared liked movies** (highest weight: 30 points each)
- **Shared favorite movies** (25 points each)
- **Shared watch history** (20 points each)
- **Similar genres** (5 points each)
- **Same streaming services** (10 points each)
- **Similar binge patterns** (15 points bonus)
- **Emotional tone alignment** (up to 10 points)

### Smart Filtering
Movies shown are filtered by:
- User's genre preferences (if set)
- Movies not already swiped
- Popular and highly-rated content first

## Next Steps

- **View Matches**: Go to http://localhost:3000/matches.html
- **Update Profile**: Add more favorite movies and genres at http://localhost:3000/profile.html
- **Chat with Matches**: Use the chat feature to connect with matches
- **Generate Test Data**: Run `npm run seed` to create 100 users for testing

## Additional Resources

- **Full API Documentation**: See [API.md](API.md)
- **API Keys Setup Guide**: See [API_KEYS_GUIDE.md](API_KEYS_GUIDE.md)
- **Main README**: See [README.md](README.md)
- **TMDB API Docs**: https://developers.themoviedb.org/3

## Support

For issues or questions:
- Check the troubleshooting section above
- Review server logs for error messages
- Ensure all dependencies are installed (`npm install`)
- Verify `.env` file exists and is properly configured

Happy Swiping! 🎬❤️
