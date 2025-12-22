# Seeded Data Information Guide

This guide shows you step-by-step how to find and access seeded user data in the Netflix & Chill application.

## Step 1: Check if Data Has Been Seeded

### Option A: Check for data files
```bash
# Check if users.json exists
ls -lh data/users.json

# Count how many users are in the database
cat data/users.json | grep '"id":' | wc -l
```

### Option B: Check for credentials file
```bash
# Look for the test credentials file
ls -lh TEST_CREDENTIALS.md TEST_CREDENTIALS.json
```

## Step 2: View Test User Credentials

### Open the credentials file:
```bash
cat TEST_CREDENTIALS.md
```

This file contains:
- **Total number of seeded users**
- **Default password** (password123)
- **Table of all users** with:
  - Username
  - Email
  - Age
  - Location

### Example output:
```
# Netflix and Chill - Test User Credentials

Generated: 2025-12-22T20:58:12.990Z
Total Users: 50
Default Password: password123

## Quick Reference

| # | Username | Email | Password | Age | Location |
|---|----------|-------|----------|-----|----------|
| 1 | reese_white | reese_white@gmail.com | password123 | 44 | Raleigh, NC |
| 2 | walker_rowan | walker_rowan@hotmail.com | password123 | 30 | Los Angeles, CA |
...
```

## Step 3: View Detailed User Data

### View all users in JSON format:
```bash
cat data/users.json | jq . | less
```

### View a specific user's complete profile:
```bash
# Get first user's details
cat data/users.json | jq '.[0]'

# Get user by username
cat data/users.json | jq '.[] | select(.username == "reese_white")'
```

### View specific user properties:
```bash
# View streaming services
cat data/users.json | jq '.[0].streamingServices'

# View favorite movies
cat data/users.json | jq '.[0].favoriteMovies'

# View preferences (age range, genres, etc.)
cat data/users.json | jq '.[0].preferences'
```

## Step 4: Access Data via API

### Start the server:
```bash
npm start
```

### Get user by ID:
```bash
# Get user ID from the data
USER_ID=$(cat data/users.json | jq -r '.[0].id')

# Fetch user via API
curl http://localhost:3000/api/users/$USER_ID | jq .
```

### Find matches for a user:
```bash
# Get matches
curl http://localhost:3000/api/matches/find/$USER_ID | jq .

# Count matches
curl -s http://localhost:3000/api/matches/find/$USER_ID | jq '.matches | length'
```

## Step 5: View Data in the Application

### 1. Open the application:
- Navigate to `http://localhost:8080/login.html` (if using local server)
- Or open `frontend/login.html` in your browser

### 2. Login with any test user:
- **Email**: Any email from `TEST_CREDENTIALS.md`
- **Password**: `password123` (for all users)

### 3. Navigate to different sections:
- **Profile**: View user's complete profile with all data
- **Matches**: See all compatible matches found
- **Chat**: Message matches
- **Swipe**: Browse and rate content

## Step 6: Verify Data Completeness

### Check user data quality:
```bash
node backend/scripts/testSeeding.js
```

This script verifies:
- All required fields are present
- Arrays have data (not empty)
- Data types are correct

### Analyze seeded data overlap:
```bash
node backend/scripts/analyzeSeededData.js
```

This shows:
- How many users share streaming services
- How many users share genres
- How many users share favorite movies

## Step 7: Test Matching Algorithm

### Run debug scripts:
```bash
# Basic matching test
node backend/scripts/debugMatching.js

# Detailed filter analysis
node backend/scripts/debugAllFilters.js

# Test multiple users
node backend/scripts/testMultipleUsers.js
```

## Common Data Locations

| Information | Location |
|-------------|----------|
| User credentials | `TEST_CREDENTIALS.md` or `TEST_CREDENTIALS.json` |
| User data (JSON) | `data/users.json` |
| Match data | `data/matches.json` |
| Like data | `data/likes.json` |
| Message data | `data/messages.json` |
| Seeder script | `backend/scripts/seedUsers.js` |
| Debug scripts | `backend/scripts/debug*.js` |

## Reseed Data

### Delete existing data and reseed:
```bash
# Remove old data
rm -rf data/ TEST_CREDENTIALS.*

# Seed 50 users
npm run seed -- --count=50

# Or seed 100 users (default)
npm run seed
```

### MongoDB (if configured):
```bash
# Seed to MongoDB
npm run seed:mongodb -- --count=50
```

## Data Structure Overview

Each seeded user includes:
- **Basic Info**: username, email, password, age, location, gender, sexual orientation
- **Profile**: bio, profile picture, photo gallery
- **Streaming**: connected streaming services
- **Watch History**: movies and TV shows watched
- **Favorites**: favorite movies and TV shows
- **Preferences**: genres, age range, location radius, gender/orientation preferences
- **Ratings**: movie ratings (1-5 stars)
- **Watchlists**: movies and TV shows to watch
- **Quiz**: personality quiz responses and archetype
- **Social**: likes, super likes, swiped movies
- **Advanced**: debate topics, favorite snacks, video chat preference

## Troubleshooting

### No matches found?
Check age range and location preferences:
```bash
cat data/users.json | jq '.[0].preferences.ageRange'
cat data/users.json | jq '.[0].preferences.locationRadius'
```

### Empty data fields?
Reseed the data:
```bash
rm -rf data/ TEST_CREDENTIALS.*
npm run seed
```

### Can't find specific user?
Search by email or username:
```bash
cat TEST_CREDENTIALS.md | grep "user@example.com"
cat data/users.json | jq '.[] | select(.email == "user@example.com")'
```

## Need Help?

- Check `backend/scripts/README.md` for seeder documentation
- Check `SEEDING_FIX_SUMMARY.md` for troubleshooting
- Run `node backend/scripts/testSeeding.js` to validate data
