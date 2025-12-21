# Database Seeders

This directory contains seeder scripts that automatically generate fake data for testing the Netflix and Chill app.

## Available Seeders

### 1. User Seeder (`seedUsers.js`)

Generates 100 fake user profiles with complete data including TMDB movie/TV show information.

### 2. Match Seeder (`seedMatches.js`)

Pre-generates matches between seeded users so they appear immediately on the matches page without needing to click "Find Matches".

## Quick Start

### Seed Everything (Recommended)

```bash
npm run seed:all
```

This will:
1. Generate 100 users with complete profiles
2. Pre-generate up to 10 matches per user
3. Create a TEST_CREDENTIALS.md file with login information

### Seed Only Users

```bash
npm run seed
```

### Seed Only Matches

```bash
npm run seed:matches
```

**Note:** You must seed users before seeding matches.

## Features

The seeder generates realistic user profiles with:

### Basic User Information
- Unique username and email
- Random age (21-55)
- Random location from major US cities
- Engaging bio descriptions

### Profile Data
- Profile picture (placeholder)
- Photo gallery (2-6 photos)
- Password: `password123` (for all users)

### Streaming Preferences
- 2-5 connected streaming services (Netflix, Hulu, Disney+, etc.)
- Watch history (5-20 items) with TMDB data
- Genre preferences (3-8 genres)
- Binge-watch count (1-15 episodes)
- Age range and location radius preferences

### TMDB Integration
- Favorite movies (2-8 movies from TMDB)
- Favorite TV shows (2-8 shows from TMDB)
- Movie ratings (3-12 movies rated 1-10)
- Movie watchlist (3-10 movies)
- TV watchlist (3-10 shows)

### Extended Profile Features
- Least favorite movies
- Movie debate topics
- Favorite snacks
- Quiz responses (with personality archetypes)
- Video chat preferences
- Profile picture (using Lorem Picsum)
- Photo gallery (2-6 photos using Lorem Picsum)

## Match Seeder

The match seeder pre-generates matches between users to populate the matches page immediately without requiring users to click "Find Matches".

### Match Seeder Features
- Uses the same matching algorithm as the live app
- Generates up to 10 high-quality matches per user by default
- Includes all compatibility scores (quiz, snack, debate, etc.)
- Shows shared content between matched users
- Preserves archetype data for display on matches page
- Photo galleries work with carousel navigation

### Match Seeder Usage

```bash
# Seed matches with default settings (10 matches per user)
npm run seed:matches

# Custom number of matches per user
node backend/scripts/seedMatches.js --matches-per-user=5

# With MongoDB
npm run seed:matches:mongodb

# Seed both users and matches
npm run seed:all
```

## Usage

### Quick Start (100 users)

```bash
npm run seed
```

### Custom Number of Users

```bash
node backend/scripts/seedUsers.js --count=50
```

### With MongoDB

```bash
npm run seed:mongodb
# or
DB_TYPE=mongodb npm run seed
```

### With Custom Count and MongoDB

```bash
DB_TYPE=mongodb node backend/scripts/seedUsers.js --count=150
```

## Configuration

### Environment Variables

The seeder respects the following environment variables:

- `DB_TYPE`: Database type (`file`, `mongodb`, or `postgresql`)
- `MONGODB_URI`: MongoDB connection string (for MongoDB)
- `TMDB_API_KEY`: TMDB API key (optional - uses fallback data if not set)

### Default Settings

- **Default user count**: 100
- **Default password**: `password123`
- **Default database**: File-based storage

## TMDB API

The seeder attempts to fetch real movie and TV show data from TMDB API if an API key is configured. If no API key is available, it will:

- Use fallback genre data (27 genres)
- Use fallback streaming provider data (30 providers)
- Generate users with profile data but without movie/TV-specific content (watchlist, favorites, etc.)
- **Note**: Without TMDB data, watch history and favorite movies/shows will be empty

### With TMDB API Key (Recommended)
To get complete user data with movies and TV shows:

1. Visit https://www.themoviedb.org/settings/api
2. Sign up for an account
3. Request an API key (free)
4. Add it to your `.env` file as `TMDB_API_KEY=your_key_here`
5. Run the seeder again

With a TMDB API key, users will have:
- Watch history populated with real movies and TV shows
- Favorite movies (2-8 from popular TMDB movies)
- Favorite TV shows (2-8 from popular TMDB shows)
- Movie ratings (3-12 movies rated 1-10)
- Movie and TV watchlists

### Without TMDB API Key
Users will still have:
- Complete profile information
- Streaming service connections
- Genre preferences
- All other profile features
- But no watch history, favorites, or watchlists

## Testing Users

After running the seeder, you can login with any generated user:

1. Check the **TEST_CREDENTIALS.md** file in the root directory
2. Find user emails in the quick reference table
3. Use email and password `password123`
4. All users have complete profiles ready for testing

The seeder generates two credential files:
- **TEST_CREDENTIALS.md** - Human-readable markdown file with full user details
- **TEST_CREDENTIALS.json** - Machine-readable JSON file for programmatic access

Example from TEST_CREDENTIALS.md:
```markdown
| # | Username | Email | Password | Age | Location |
|---|----------|-------|----------|-----|----------|
| 1 | alex.smith | alex.smith123@gmail.com | password123 | 28 | New York, NY |
```

## Database Support

### File-Based Storage (Default)
```bash
npm run seed
```
Data is stored in `data/users.json`

### MongoDB
```bash
npm run seed:mongodb
```
Requires `MONGODB_URI` in `.env` file

### PostgreSQL
```bash
DB_TYPE=postgresql npm run seed
```
Requires PostgreSQL configuration in `.env` file

## Clearing Data

To start fresh, you can:

### File-based storage
```bash
rm -rf data/users.json
```

### MongoDB
Use MongoDB client to drop the users collection:
```bash
mongosh
use netflix-and-chill
db.users.drop()
```

## Output Example

```
🎬 Netflix and Chill User Seeder
================================

📊 Generating 100 fake users...

🔌 Connecting to database...
✅ Database connected

🎥 Fetching data from TMDB API...
  ✓ Fetched 20 popular movies
  ✓ Fetched 20 popular TV shows
  ✓ Fetched 27 genres
  ✓ Fetched 30 streaming providers

👥 Generating user profiles...
  Created 10/100 users...
  Created 20/100 users...
  ...
  Created 100/100 users...

💾 Saving users to database...
  Saved 10/100 users...
  Saved 20/100 users...
  ...
  Saved 100/100 users...

✅ Successfully created and saved all users!

📝 Summary:
   - Total users: 100
   - Default password: password123
   - Database type: file

💡 You can now login with any user's email and password: password123

🎉 Seeding completed successfully!
```

## Troubleshooting

### "TMDB API key not configured"
This is not an error. The seeder will still work with fallback data. To use real TMDB data, add your API key to `.env`.

### MongoDB connection errors
Ensure MongoDB is running and `MONGODB_URI` is correctly set in `.env`.

### File permission errors
Ensure the `data/` directory is writable.

## Technical Details

### Files
- `backend/scripts/seedUsers.js` - Main seeder script
- `backend/utils/fakeDataGenerator.js` - Data generation utilities
- `backend/models/User.js` - User model
- `backend/database/databaseFactory.js` - Database abstraction

### Data Pools
The seeder uses curated lists of:
- 56 first names
- 47 last names
- 40 US cities
- 20 bio templates
- 20 snack options
- 15 movie debate topics

## Contributing

To add more variety to the generated data:
1. Edit `backend/utils/fakeDataGenerator.js`
2. Add items to the data pools (names, cities, bios, etc.)
3. Run the seeder to test your changes

## License

ISC
