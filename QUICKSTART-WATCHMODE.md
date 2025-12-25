# Quick Start: Watchmode API Integration

Get streaming platform information for movies and shows in 5 minutes! 🎬

## What You'll Get

Movie cards will show which streaming platforms have each movie/show available:

```
┌─────────────────────────────┐
│     The Dark Knight         │
│     2008 | ⭐ 9.0/10        │
│                             │
│  🎬 Available on:           │
│  [Netflix] [HBO Max]        │
│  [Amazon Prime]             │
└─────────────────────────────┘
```

## Setup (5 Minutes)

### Step 1: Get Your Free API Key (2 minutes)

1. Go to **https://api.watchmode.com/**
2. Click **"Sign Up"**
3. Verify your email
4. Log in and copy your **API Key** from the dashboard

### Step 2: Configure the App (1 minute)

1. Open your `.env` file (or create one from `.env.example`):
   ```bash
   cp .env.example .env
   ```

2. Add your Watchmode API key:
   ```bash
   # Add this line to your .env file
   WATCHMODE_API_KEY=your_api_key_here
   ```

### Step 3: Restart the Server (1 minute)

```bash
npm start
```

### Step 4: Test It Works (1 minute)

1. Open **http://localhost:3000/watchmode-test.html**
2. Click **"Show Demo Card"**
3. You should see streaming platforms displayed!

## That's It! 🎉

The app will now show streaming platform badges on all movie cards.

## Usage

### In Swipe Feature
Streaming platforms automatically appear on movie cards when swiping.

### Check Specific Movie
Visit: `http://localhost:3000/api/streaming/availability/550?type=movie`
(Replace 550 with any TMDB movie ID)

## Free Tier Limits

- **1,000 API calls per day**
- Perfect for personal use and development
- Upgrade if you need more

## Troubleshooting

### Not Seeing Streaming Platforms?

**Check 1:** Is your API key in `.env`?
```bash
# Make sure this line exists in .env
WATCHMODE_API_KEY=abc123youractualkey
```

**Check 2:** Did you restart the server after adding the key?
```bash
# Stop server (Ctrl+C) and restart
npm start
```

**Check 3:** Check server logs for warnings:
```
✓ Good: Server starts with no warnings
✗ Problem: "Watchmode API key not configured"
```

**Check 4:** Test the endpoint directly:
```bash
curl http://localhost:3000/api/streaming/availability/550?type=movie
```

Should return JSON with streaming data.

### Still Not Working?

1. **Verify your API key** - Copy it again from Watchmode dashboard
2. **Check for spaces** - Make sure there are no extra spaces in `.env`
3. **Check the format**:
   ```bash
   # Correct
   WATCHMODE_API_KEY=abc123xyz789
   
   # Wrong (no quotes needed)
   WATCHMODE_API_KEY="abc123xyz789"
   WATCHMODE_API_KEY='abc123xyz789'
   ```

## Optional: It's Okay to Skip This

The Watchmode API integration is **completely optional**. Your app works perfectly fine without it - you just won't see which streaming platforms have each movie.

To use the app without Watchmode:
- Simply don't add the `WATCHMODE_API_KEY` to your `.env` file
- Everything else works normally
- Movie cards just won't show streaming platform badges

## More Information

- **Full Documentation:** See `WATCHMODE_INTEGRATION.md`
- **API Setup Guide:** See `API_KEYS_GUIDE.md`
- **Test Page:** `http://localhost:3000/watchmode-test.html`

## Quick Reference

### API Endpoints

```bash
# Get streaming availability for a movie
GET /api/streaming/availability/:tmdbId?type=movie&region=US

# Get list of streaming services
GET /api/streaming/services?region=US

# Get movies with streaming info in swipe
GET /api/swipe/movies/:userId?includeStreaming=true
```

### Configuration

```bash
# .env file
WATCHMODE_API_KEY=your_api_key_here  # Required for feature
TMDB_API_KEY=your_tmdb_key          # Required for movies
```

### Supported Regions

- `US` - United States (default)
- `UK` - United Kingdom
- `CA` - Canada
- `AU` - Australia
- And many more...

---

**Need Help?** Open an issue on GitHub or check the documentation files.

**Happy Streaming!** 🎬🍿
