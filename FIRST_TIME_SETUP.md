# First Time Setup Guide

If you're encountering a **401 Unauthorized** error when trying to login, it's likely because the database hasn't been seeded with test users yet.

## Quick Fix (2 minutes)

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Seed the Database
```bash
# This creates 100 test users
npm run seed
```

You should see output like:
```
✅ Successfully created and saved all users!
📄 Generating test credentials file...
💡 You can now login with any user's email and password: password123
```

### Step 3: Start the Backend Server
```bash
npm start
```

### Step 4: Login
Open the login page and use any credentials from `TEST_CREDENTIALS.md`:
- **Email**: Any email from the credentials file (e.g., `brooks_roberts@gmail.com`)
- **Password**: `password123` (same for all test users)

## What This Does

The seeder script:
- Creates 100 fake user profiles
- Generates complete profile data including:
  - Streaming services
  - Favorite movies and TV shows
  - Watch history
  - Viewing preferences
  - Quiz responses and personality data
- Saves all data to `data/users.json`
- Generates `TEST_CREDENTIALS.md` with login information

## Why You Need This

The Netflix and Chill app requires users in the database to:
- Test the login functionality
- View and test the matching algorithm
- Explore profiles and chat features

Without running the seeder first, the login endpoint will return a **401 Unauthorized** error because no users exist in the database.

## Alternative: Create Your Own User

If you prefer to create your own user instead of using test data:

1. Start the backend server: `npm start`
2. Open the frontend: `http://localhost:8080`
3. Click "Sign Up" and create a new account
4. Complete the onboarding process

## Troubleshooting

### Error: "Invalid email or password"
- **Cause**: No users exist in the database
- **Solution**: Run `npm run seed` in the backend directory

### Error: "Cannot find module"
- **Cause**: Dependencies not installed
- **Solution**: Run `npm install` in the backend directory

### Server won't start
- **Cause**: Port 3000 is already in use
- **Solution**: Either:
  - Stop the other process using port 3000
  - Change the port in `backend/.env`: `PORT=3001`

## Next Steps

After successfully logging in:
- Explore the profile page
- View matches based on streaming preferences
- Test the chat functionality
- Try the movie swipe feature

For more detailed documentation, see:
- [README.md](README.md) - Main documentation
- [API_KEYS_GUIDE.md](API_KEYS_GUIDE.md) - API setup instructions
- [docs/quickstart/QUICK_START_SEEDED_DATA.md](docs/quickstart/QUICK_START_SEEDED_DATA.md) - Working with test data
