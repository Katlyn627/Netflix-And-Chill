# Quick Reference: Streaming Services & Watch History Flow

## 🎯 Complete User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                    STEP 1: CONNECT SERVICES                      │
│                                                                   │
│  Option A: OAuth (Automatic)          Option B: Manual          │
│  ┌────────────────────┐               ┌──────────────────┐     │
│  │ Click "Connect"    │               │ Click on service │     │
│  │ on Netflix         │               │ logos you use    │     │
│  └──────┬─────────────┘               └────────┬─────────┘     │
│         │                                      │               │
│         ▼                                      ▼               │
│  ┌────────────────────┐               ┌──────────────────┐     │
│  │ Login on           │               │ Click "Save      │     │
│  │ Netflix.com        │               │ Selected"        │     │
│  └──────┬─────────────┘               └────────┬─────────┘     │
│         │                                      │               │
│         ▼                                      ▼               │
│  ┌────────────────────┐               ┌──────────────────┐     │
│  │ Authorize access   │               │ Services saved   │     │
│  └──────┬─────────────┘               │ to profile       │     │
│         │                              └──────────────────┘     │
│         ▼                                                       │
│  ┌────────────────────┐                                        │
│  │ Auto-sync history  │                                        │
│  │ (127 items synced) │                                        │
│  └────────────────────┘                                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    STEP 2: WATCH HISTORY                         │
│                                                                   │
│  Automatic (OAuth)            Manual Entry                       │
│  ┌────────────────────┐      ┌──────────────────┐              │
│  │ Synced from        │      │ Search for show  │              │
│  │ streaming service  │      │ "Stranger Things"│              │
│  │                    │      └────────┬─────────┘              │
│  │ • Stranger Things  │               │                        │
│  │ • The Crown        │               ▼                        │
│  │ • Breaking Bad     │      ┌──────────────────┐              │
│  │ • + 124 more       │      │ Select from      │              │
│  └────────────────────┘      │ TMDB results     │              │
│                               └────────┬─────────┘              │
│                                        │                        │
│                                        ▼                        │
│                               ┌──────────────────┐              │
│                               │ Add service &    │              │
│                               │ episodes watched │              │
│                               └────────┬─────────┘              │
│                                        │                        │
│                                        ▼                        │
│                               ┌──────────────────┐              │
│                               │ Saved to profile │              │
│                               └──────────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    STEP 3: DATA STORAGE                          │
│                                                                   │
│  User Profile Object:                                            │
│  {                                                               │
│    userId: "user_123",                                          │
│    streamingServices: [                                         │
│      {                                                          │
│        name: "Netflix",                                         │
│        connected: true,                                         │
│        lastUsed: "2026-01-18",                                 │
│        totalWatchTime: 450                                      │
│      }                                                          │
│    ],                                                           │
│    watchHistory: [                                              │
│      {                                                          │
│        title: "Stranger Things",                               │
│        type: "tvshow",                                         │
│        service: "Netflix",                                      │
│        episodesWatched: 8,                                     │
│        genre: "Sci-Fi",                                        │
│        tmdbId: 66732                                           │
│      }                                                          │
│    ],                                                           │
│    preferences: {                                               │
│      genres: ["Sci-Fi", "Thriller"],                          │
│      bingeWatchingCount: 5                                     │
│    }                                                            │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    STEP 4: MATCHING ALGORITHM                    │
│                                                                   │
│  Comparing Alice vs Bob:                                         │
│                                                                   │
│  ┌──────────────────────────────────────────────────────┐      │
│  │ Factor 1: Shared Services                             │      │
│  │ Alice: Netflix, Hulu, Disney+                         │      │
│  │ Bob:   Netflix, Prime, Disney+                        │      │
│  │ Shared: Netflix, Disney+ = 2 services                 │      │
│  │ Score: 2 × 10 = 20 points                            │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                   │
│  ┌──────────────────────────────────────────────────────┐      │
│  │ Factor 2: Shared Watch History                        │      │
│  │ Alice: Stranger Things, The Crown, Handmaid's Tale    │      │
│  │ Bob:   Stranger Things, Mandalorian, Jack Ryan        │      │
│  │ Shared: Stranger Things = 1 show                      │      │
│  │ Score: 1 × 20 = 20 points                            │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                   │
│  ┌──────────────────────────────────────────────────────┐      │
│  │ Factor 3: Genre Compatibility                         │      │
│  │ Alice: Sci-Fi, Thriller, Drama                        │      │
│  │ Bob:   Sci-Fi, Action, Adventure                      │      │
│  │ Shared: Sci-Fi = 1 genre                             │      │
│  │ Score: 1 × 5 = 5 points                              │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                   │
│  ┌──────────────────────────────────────────────────────┐      │
│  │ Factor 4: Viewing Frequency                           │      │
│  │ Alice: 5 episodes/day                                 │      │
│  │ Bob:   4 episodes/day                                 │      │
│  │ Difference: |5-4| = 1 (close match)                  │      │
│  │ Score: 10 points                                      │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                   │
│  ┌──────────────────────────────────────────────────────┐      │
│  │ TOTAL COMPATIBILITY SCORE                             │      │
│  │ 20 + 20 + 5 + 10 = 55 points (55%)                   │      │
│  └──────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    STEP 5: MATCH DISPLAY                         │
│                                                                   │
│  ┌──────────────────────────────────────────────────────┐      │
│  │ 🎬 Bob, 27                           [55% Match] ⭐  │      │
│  │ Los Angeles                                          │      │
│  │                                                      │      │
│  │ "Binge-watcher and movie enthusiast"                │      │
│  │                                                      │      │
│  │ 📺 Shared Streaming Services (2)                     │      │
│  │ [Netflix] [Disney+]                                  │      │
│  │                                                      │      │
│  │ 🎭 Shared Watch History (1)                          │      │
│  │ • Stranger Things                                    │      │
│  │                                                      │      │
│  │ 📊 Compatibility Breakdown:                          │      │
│  │ • Shared Services:    20/30 ████████░░░              │      │
│  │ • Shared History:     20/40 ██████░░░░░              │      │
│  │ • Genre Match:         5/15 ███░░░░░░░░              │      │
│  │ • Frequency Match:    10/15 ████████░░░              │      │
│  │                                                      │      │
│  │ [👍 Like] [⭐ Super Like] [View Profile]            │      │
│  └──────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

## 📋 Quick API Flow

### Connect Service (Manual)
```bash
# 1. Get available providers
GET /api/streaming/providers?region=US
Response: { providers: [{id: 8, name: "Netflix", ...}] }

# 2. Save to user profile
PUT /api/users/user_123/streaming-services
Body: { services: [{id: 8, name: "Netflix", ...}] }
Response: { success: true }
```

### Connect Service (OAuth)
```bash
# 1. Initiate OAuth
GET /api/auth/netflix/connect?userId=user_123
→ Redirects to Netflix login

# 2. User logs in on Netflix
[User enters credentials on netflix.com]

# 3. OAuth callback
GET /api/auth/netflix/callback?code=ABC123&state=XYZ
→ Exchanges code for token
→ Saves to user.streamingOAuthTokens
→ Auto-syncs watch history
→ Redirects back to app
```

### Add Watch History
```bash
POST /api/users/user_123/watch-history
Body: {
  title: "Stranger Things",
  type: "tvshow",
  genre: "Sci-Fi",
  service: "Netflix",
  episodesWatched: 8
}
Response: { success: true, entry: {...} }
```

### Find Matches
```bash
GET /api/matches/find/user_123?minScore=40
Response: {
  matches: [
    {
      userId: "user_456",
      username: "Bob",
      compatibilityScore: 55,
      sharedServices: [{name: "Netflix"}, {name: "Disney+"}],
      sharedWatchHistory: [{title: "Stranger Things"}],
      compatibilityBreakdown: {
        sharedServices: 20,
        sharedHistory: 20,
        genreMatch: 5,
        frequencyMatch: 10
      }
    }
  ]
}
```

## 🎯 Scoring Cheat Sheet

| Factor | Weight | How to Earn Points |
|--------|--------|-------------------|
| **Shared Services** | 0-30 pts | 10 pts per shared platform |
| **Shared History** | 0-40 pts | 20 pts per shared show/movie |
| **Genre Match** | 0-15 pts | 5 pts per shared genre |
| **Frequency Match** | 0-15 pts | Based on binge-watching similarity |
| **TOTAL** | 0-100 pts | Sum normalized to 0-100% |

## 🔍 Data Models Reference

### StreamingService
```javascript
{
  id: 8,                    // TMDB provider ID
  name: "Netflix",          // Service name
  logoUrl: "https://...",   // Logo image URL
  connected: true,          // OAuth connected?
  connectedAt: "ISO8601",   // Connection timestamp
  lastUsed: "ISO8601",      // Last watch activity
  totalWatchTime: 450,      // Minutes watched
  watchCount: 5,            // Items watched
  totalEpisodes: 12         // Episodes watched
}
```

### WatchHistoryItem
```javascript
{
  title: "Stranger Things",     // Content title
  type: "tvshow",                // movie or tvshow
  genre: "Sci-Fi",               // Primary genre
  service: "Netflix",            // Where watched
  episodesWatched: 8,            // Episode count
  season: 1,                     // Season number
  tmdbId: 66732,                 // TMDB ID
  posterPath: "/path.jpg",       // Poster image
  watchedAt: "ISO8601",          // Watch timestamp
  watchDuration: 240             // Minutes watched
}
```

### OAuthTokens
```javascript
{
  netflix: {
    accessToken: "encrypted",    // Access token
    refreshToken: "encrypted",   // Refresh token
    expiresAt: "ISO8601",        // Token expiration
    connectedAt: "ISO8601",      // Connection time
    scope: "viewing.history"     // Permissions
  }
}
```

## 🚀 Testing Commands

```bash
# Start the server
npm start

# Run integration tests
node test-streaming-integration.js

# Test individual endpoints
curl http://localhost:3000/api/streaming/providers?region=US
curl http://localhost:3000/api/users/USER_ID
curl -X POST http://localhost:3000/api/users/USER_ID/watch-history \
  -H "Content-Type: application/json" \
  -d '{"title":"Stranger Things","type":"tvshow","service":"Netflix"}'
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `STEP_BY_STEP_STREAMING_INTEGRATION.md` | Complete technical guide (1,730 lines) |
| `test-streaming-integration.js` | Automated test suite |
| `IMPLEMENTATION_SUMMARY_STREAMING_GUIDE.md` | User-friendly summary |
| `frontend/streaming-services.html` | UI for managing services |
| `backend/routes/auth.js` | OAuth endpoints |
| `backend/routes/users.js` | User/services endpoints |
| `backend/services/streamingOAuthService.js` | OAuth logic |
| `backend/utils/matchingEngine.js` | Compatibility algorithm |

## ✅ Success Criteria

Your implementation is working when:
- ✅ Services can be selected manually
- ✅ OAuth connection works (if configured)
- ✅ Watch history can be added
- ✅ Matches show compatibility scores
- ✅ Shared services are displayed
- ✅ Shared watch history is displayed
- ✅ Score breakdown is accurate

---

**Ready to find your streaming soulmate! 🎬❤️**
