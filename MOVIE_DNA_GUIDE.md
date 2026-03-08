# 🧬 Movie DNA Algorithm — Complete Guide

Netflix & Chill now uses the **Movie DNA Algorithm** as its sole matching system. The old swipe algorithm and personality quiz have been removed. This guide explains the algorithm in depth and walks you through every step to run, use, and extend it.

---

## Table of Contents

1. [What Is Movie DNA?](#1-what-is-movie-dna)
2. [How the Algorithm Works](#2-how-the-algorithm-works)
3. [Quick Start — Running the App](#3-quick-start--running-the-app)
4. [Step-by-Step User Guide](#4-step-by-step-user-guide)
5. [API Reference](#5-api-reference)
6. [Scoring Breakdown](#6-scoring-breakdown)
7. [Personality Types Reference](#7-personality-types-reference)
8. [Configuration & Environment Variables](#8-configuration--environment-variables)
9. [Extending the Algorithm](#9-extending-the-algorithm)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. What Is Movie DNA?

Movie DNA is a multi-dimensional personality system that captures *how* you experience films — not just *what* you have watched. Instead of asking you to swipe through hundreds of movies or answer 50 generic quiz questions, Movie DNA builds a rich profile from five core dimensions:

| Dimension | What It Captures |
|-----------|-----------------|
| **Emotional Tone** | How you *feel* films (dark, wholesome, chaotic, romantic, philosophical, adventurous) |
| **Era Preference** | Which decade's storytelling resonates with you (80s–now, indie, classic) |
| **Story Archetypes** | The narrative structures you love (Enemies-to-Lovers, Underdog, Found Family…) |
| **Character Archetypes** | The character types you gravitate toward (Antihero, Chosen One, Trickster…) |
| **Genre Affinity** | Your top genres, used as a cross-reference signal |

These five dimensions combine to assign you one of **8 Movie DNA Personality Types** (e.g., *Hopeless Romantic Cinephile*, *Dark Thriller Intellectual*). Compatibility between two users is then calculated across all five dimensions — plus four bonus signals — to produce a **0–100 compatibility score**.

---

## 2. How the Algorithm Works

The matching engine (`backend/utils/matchingEngine.js`) scores two users across **10 features**:

```
Feature                           Max Points   Source
──────────────────────────────────────────────────────
1. Movie DNA Personality Match       35 pts    movieDNA.js → calculateDNACompatibility()
2. Story Archetype Compatibility     20 pts    movieArchetypes.js
3. Director Compatibility            15 pts    movieArchetypes.js
4. Scene That Made Me Cry            10 pts    User profile field
5. Movie Mood Matching               10 pts    Real-time mood field
6. Red Flag Movies                  -15 pts    Dealbreaker penalty per conflict
                                   ──────
   MAXIMUM SCORE                    100 pts
```

> Feature 1 (Movie DNA) is the dominant signal at 35 % of the total score, calculated by comparing personality types, emotional tone, story archetypes, era preference, and genre affinity.

### DNA Compatibility Sub-scoring (Feature 1 detail)

| Sub-dimension | Max pts |
|---------------|---------|
| Personality type match | 30 |
| Emotional tone match | 25 |
| Story archetype overlap | 20 |
| Era preference match | 15 |
| Genre affinity overlap | 10 |
| **Total → normalised to 35 pts** | **100** |

### Relationship Genre Prediction

After scoring, the engine predicts your **Relationship Genre** — the cinematic genre that best describes your dynamic as a couple:

- 😂❤️ **Romantic Comedy** — playful, chaotic, happy ending guaranteed
- 🎞️🕯️ **Slow Burn Indie Romance** — quiet, philosophical, everything unsaid
- 💥🗺️ **Action-Adventure Couple** — epic quests together
- 🎭🌊 **Epic Drama** — grand emotions, high stakes
- 📺⚡ **Chaotic Sitcom Energy** — every day is an episode
- 📼💛 **Nostalgic Romance** — comfort, warmth, home
- 🧠🤝 **Intellectual Partnership** — debates and documentaries

---

## 3. Quick Start — Running the App

### Prerequisites

- **Node.js** v18 or later
- **npm** v9 or later
- **TMDB API key** (free) — [get one here](https://www.themoviedb.org/settings/api)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Katlyn627/Netflix-And-Chill.git
cd Netflix-And-Chill

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
```

Open `.env` and set at minimum:

```dotenv
PORT=3000
NODE_ENV=development
DB_TYPE=file          # file | mongodb | postgresql
TMDB_API_KEY=your_tmdb_key_here
```

### Start the Server

```bash
# Development
npm run dev

# Production
npm start
```

The app is now running at **http://localhost:3000**.

### Seed Test Users (optional)

```bash
# Generate 50 test users with random Movie DNA profiles
npm run seed

# Or with MongoDB
npm run seed:mongodb

# Seed matches between users
npm run seed:matches
```

---

## 4. Step-by-Step User Guide

### Step 1 — Register / Log In

1. Open **http://localhost:3000** in your browser.
2. You are redirected to the splash screen if you have no account, or directly to **Movie DNA** if already logged in.
3. Click **Get Started** and complete the onboarding profile form (name, age, bio, profile photo).

### Step 2 — Build Your Movie DNA Profile

After registering, you land on **movie-dna.html** — the heart of the app.

#### 2a. DNA Profile Tab 🧬

1. Under **"Emotional Tone"**, tap the chips that match how you *feel* films. You can pick multiple.
   - Examples: *Dark & Intense*, *Romantic & Emotional*, *Philosophical & Thought-Provoking*
2. Under **"Era Preference"**, pick the decade whose storytelling speaks to you.
   - Examples: *90s Nostalgia*, *Modern (2010s–Now)*, *Indie & Timeless*
3. Under **"Favourite Character Types"**, select the characters you root for.
   - Examples: *Antihero*, *Trickster*, *Wise Mentor*
4. Click **"Reveal My Movie DNA"** — your personality type appears instantly.

> **Tip:** Click *"See All DNA Types"* to browse all 8 personality types and manually select the one that fits you best.

#### 2b. Story Archetypes Tab 📖

1. Select the story archetypes that resonate most deeply with you.
   - Examples: *Enemies-to-Lovers*, *Found Family*, *Coming of Age*
2. Click **"Save My Story Archetypes"** — this feeds directly into your compatibility score.

#### 2c. Directors Tab 🎬

1. Browse the featured directors grid.
2. Select up to **5 directors** whose work consistently moves you.
3. Click **"Save My Directors"** — director taste is a strong compatibility signal.

#### 2d. "That Scene" Tab 😭

Share three things that reveal your emotional depth:
1. **A scene that wrecked you** — a specific film moment that hit hard.
2. **A movie that changed you** — a film that altered how you see the world.
3. **A villain you secretly agree with** — signals moral complexity appreciation.
4. Click **"Save My Moments"**.

> Sharing your emotional moments unlocks up to **10 bonus compatibility points**.

#### 2e. Movie Mood Tab 🎭

1. Select your **current movie mood** — what do you feel like watching *tonight*?
   - Options: Romantic comedy night, Horror marathon, Comfort movie vibes, Documentary deep dive, etc.
2. Click **"Set My Mood"** — the algorithm finds others in the same mood right now.

#### 2f. Red Flags Tab 🚩

1. Type in a movie title that would be a dealbreaker for you if a partner loved it.
2. Click **"Add 🚩"** to add it to your list.
3. Click **"Save Red Flags"** — red flag conflicts apply a **-15 point penalty per conflict** in match scores.

### Step 3 — View Your Matches

1. Navigate to **Matches** (❤️) from the bottom navigation.
2. Your top matches are ranked by Movie DNA compatibility score (0–100).
3. Click any match card to expand the full compatibility breakdown:
   - **Compatibility Score** — overall 0–100
   - **DNA Type** — your personality types and whether they're compatible
   - **Relationship Genre** — the predicted dynamic between you
   - **Love Story Movie** — a generated movie poster for your potential romance
   - **Score Breakdown** — points from each of the 10 features
   - **Red Flag Report** — any movie conflicts detected

### Step 4 — Connect with Matches

- Click **💬 Chat** to open a conversation with any match.
- Click **📺 Watch Together** to schedule a watch party.

---

## 5. API Reference

All endpoints require the server to be running (`npm start`). Base URL: `http://localhost:3000/api`

### Movie DNA Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/movie-dna/types` | List all 8 DNA personality types |
| `GET` | `/movie-dna/dimensions` | List all tones, eras, archetypes, directors |
| `POST` | `/movie-dna/build/:userId` | Build / rebuild a user's DNA profile |
| `GET` | `/movie-dna/profile/:userId` | Get a user's current DNA profile |
| `POST` | `/movie-dna/update/:userId` | Update specific DNA dimensions |
| `GET` | `/movie-dna/archetypes` | List all story archetypes |
| `GET` | `/movie-dna/directors` | List featured directors |
| `POST` | `/movie-dna/directors/:userId` | Save user's favourite directors |
| `POST` | `/movie-dna/mood/:userId` | Set user's current movie mood |
| `GET` | `/movie-dna/mood-matches/:userId` | Find mood-compatible users |
| `POST` | `/movie-dna/scene/:userId` | Save "Scene That Made Me Cry" |
| `GET` | `/movie-dna/scene/:userId` | Get user's scene profile |
| `GET`/`POST` | `/movie-dna/red-flags/:userId` | Manage red flag movies |
| `GET` | `/movie-dna/love-story/:id1/:id2` | Generate a Love Story Movie poster |
| `GET` | `/movie-dna/relationship-genre/:id1/:id2` | Predict relationship genre |
| `GET` | `/movie-dna/challenges` | List all first-date challenges |
| `GET` | `/movie-dna/challenges/random` | Get a random challenge |

### Matching Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/matches/find/:userId` | Find & rank DNA-based matches |
| `GET` | `/matches/:userId/history` | Get saved match history |

### Example: Build a DNA Profile

```bash
curl -X POST http://localhost:3000/api/movie-dna/build/user123 \
  -H "Content-Type: application/json" \
  -d '{
    "emotionalTone": ["romantic", "dark"],
    "eraPreference": ["modern", "nineties"],
    "storyArchetypes": ["enemiesToLovers", "foundFamily"],
    "characterArchetypes": ["antihero", "reluctantHero"]
  }'
```

### Example: Find Matches

```bash
curl http://localhost:3000/api/matches/find/user123
```

Response:
```json
[
  {
    "userId": "user456",
    "username": "alice_films",
    "score": 84,
    "relationshipGenre": { "name": "Slow Burn Indie Romance", "emoji": "🎞️🕯️" },
    "dnaCompatibility": { "score": 78, "reason": "You both feel films through a romantic lens." },
    "loveStory": { "title": "The Distance Between Stars", "genre": "Indie Romance" },
    "matchDescription": "💕 Deeply compatible — same emotional storytelling frequency.",
    "breakdown": {
      "movieDNA": { "points": 27 },
      "storyArchetypes": { "points": 16 },
      "directorCompatibility": { "points": 10 }
    }
  }
]
```

---

## 6. Scoring Breakdown

### How the 100-point Score Is Calculated

```
Score = DNA_score + Archetype_score + Director_score + Emotional_score + Mood_score - RedFlag_penalty
```

| Feature | Calculation | Max |
|---------|-------------|-----|
| Movie DNA | `(dnaCompatibility.score / 100) × 35` | 35 |
| Story Archetypes | `(archetypeCompatibility.score / 100) × 20` | 20 |
| Director Match | `(directorCompatibility.score / 100) × 15` | 15 |
| Emotional Depth | `(emotionalDepth.score / 60) × 10` | 10 |
| Mood Match | `(moodCompatibility.score / 100) × 10` *(only if matched)* | 10 |
| **Total** | | **100** |
| Red Flags | `-15 per conflict` *(up to -30)* | -30 |

### DNA Compatibility Sub-scoring

| Sub-feature | Same | Compatible | Different |
|-------------|------|-----------|-----------|
| Personality type | 30 pts | 22 pts | 8 pts |
| Emotional tone (dominant) | 25 pts | 15 pts (secondary match) | 5 pts |
| Story archetype overlap | 7 pts per shared archetype | — | — |
| Era preference | 15 pts (same) | 10 pts (indie flex) | 5 pts |
| Genre overlap | 3 pts per shared genre | — | — |

---

## 7. Personality Types Reference

| Type | Emoji | Core Traits | Compatible With |
|------|-------|------------|-----------------|
| **Hopeless Romantic Cinephile** | 💌🎬 | Romantic tone, tragic romance, enemies-to-lovers | Nostalgic Comfort, Indie Soul |
| **Dark Thriller Intellectual** | 🕵️🧠 | Dark tone, revenge arc, antihero | Gritty Crime, Indie Soul |
| **Adventure Dreamer** | 🗺️✨ | Adventurous tone, epic adventure, found family | Epic Fantasy, Chaotic Comedy |
| **Indie Film Soul** | 🎞️🌿 | Philosophical tone, coming-of-age, indie era | Dark Thriller, Hopeless Romantic |
| **Chaotic Comedy Gremlin** | ⚡😂 | Chaotic tone, heist caper, trickster | Adventure Dreamer, Nostalgic Comfort |
| **Nostalgic Comfort Seeker** | 📼🕯️ | Wholesome tone, 80s/90s era, found family | Hopeless Romantic, Chaotic Comedy |
| **Epic Fantasy Wanderer** | 🧙🔮 | Adventurous tone, chosen one, epic adventure | Adventure Dreamer, Nostalgic Comfort |
| **Gritty Crime Analyst** | 🚬🔍 | Dark tone, heist caper, antihero | Dark Thriller, Indie Soul |

---

## 8. Configuration & Environment Variables

Copy `.env.example` to `.env` and configure:

```dotenv
# ── REQUIRED ──────────────────────────────────────────────
PORT=3000
NODE_ENV=development
DB_TYPE=file               # file | mongodb | postgresql
TMDB_API_KEY=              # https://www.themoviedb.org/settings/api

# ── DATABASE (optional — defaults to file storage) ───────
MONGODB_URI=               # mongodb://localhost:27017/netflix-chill
POSTGRESQL_URI=            # postgres://user:pass@localhost:5432/netflix-chill

# ── AUTHENTICATION (optional) ─────────────────────────────
AUTH0_DOMAIN=              # your-tenant.auth0.com
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=

# ── REAL-TIME CHAT (optional) ─────────────────────────────
STREAM_API_KEY=
STREAM_API_SECRET=
```

### Database Selection

| `DB_TYPE` | Storage | Notes |
|-----------|---------|-------|
| `file` | JSON files on disk | Default. No setup required. |
| `mongodb` | MongoDB | Requires `MONGODB_URI` |
| `postgresql` | PostgreSQL | Requires `POSTGRESQL_URI` |

---

## 9. Extending the Algorithm

### Adding a New DNA Personality Type

1. Open `backend/utils/movieDNA.js`.
2. Add an entry to `DNA_PERSONALITY_TYPES`:
   ```js
   myNewType: {
     id: 'myNewType',
     name: 'My New Personality Type',
     emoji: '🎭',
     description: 'Description of this type.',
     coreTraits: ['romantic tone', 'epic adventure'],
     compatibleWith: ['hopelessRomantic', 'adventureDreamer'],
     genreAffinity: ['Romance', 'Adventure']
   }
   ```
3. Update `_determinePersonalityType()` to include rules that assign users to this new type.

### Adding a New Story Archetype

1. In `backend/utils/movieDNA.js`, add to `STORY_ARCHETYPES`:
   ```js
   myArchetype: {
     label: 'My Archetype',
     emoji: '🎯',
     description: 'What makes this archetype unique.'
   }
   ```
2. Update `genreArchetypeMap` and the scoring logic in `buildMovieDNA()` if needed.

### Adding a New Scoring Dimension

1. In `backend/utils/matchingEngine.js`, add a new scoring block inside `MatchingEngine.calculateMatch()`.
2. Adjust the max-point allocations so they still sum to ≤ 100 (or update `generateMatchDescription` thresholds).

### Adding a New Relationship Genre

1. In `backend/utils/matchingEngine.js`, add to `RELATIONSHIP_GENRES`:
   ```js
   myGenre: {
     id: 'myGenre',
     name: 'My Relationship Genre',
     emoji: '🎬',
     description: 'What this relationship dynamic looks like.',
     signals: ['indieSoul', 'philosophical']
   }
   ```

---

## 10. Troubleshooting

### Server won't start

```
Error: Cannot find module 'dotenv'
```
Run `npm install` to install dependencies.

### Movie DNA profile returns empty

- Ensure the user has completed the DNA questionnaire on the **movie-dna.html** page.
- Or POST to `/api/movie-dna/build/:userId` with at least `emotionalTone` and `storyArchetypes`.
- If neither is set, `buildMovieDNA()` falls back to `user.preferences.genres`. Add genres via `/api/users/:userId/preferences`.

### Match score is 0 for all users

- Both users need at least one dimension set (emotional tone, story archetypes, or favourite genres).
- Seed test users with `npm run seed` — seeded users have full DNA profiles.

### Red flag penalty exceeds score

- Check your red-flag movies list: each conflict costs 15 points (max -30).
- You can clear red flags via the 🚩 Red Flags tab on movie-dna.html.

### `TMDB_API_KEY` missing warning

- The app still works without TMDB for the DNA matching system.
- TMDB is only needed for movie search/browsing features on the profile page.
- Get a free key at https://www.themoviedb.org/settings/api and add it to `.env`.

---

## Architecture Overview

```
Netflix-And-Chill/
├── backend/
│   ├── utils/
│   │   ├── movieDNA.js          ← DNA profiles & compatibility
│   │   ├── matchingEngine.js    ← 10-feature scoring engine
│   │   ├── movieArchetypes.js   ← Archetype & director scoring
│   │   ├── loveStoryGenerator.js← Love Story Movie poster
│   │   └── compatibilityReport.js ← Detailed reports (DNA-based)
│   ├── routes/
│   │   ├── movieDNA.js          ← /api/movie-dna/* endpoints
│   │   └── matches.js           ← /api/matches/* endpoints
│   └── server.js                ← Express app
├── frontend/
│   ├── movie-dna.html           ← Main DNA questionnaire UI ← START HERE
│   ├── matches.html             ← Match discovery & details
│   ├── chat.html                ← Messaging
│   └── watch-together.html      ← Watch party scheduling
└── MOVIE_DNA_GUIDE.md           ← This file
```

---

*Built with ❤️ and 🎬 — Netflix & Chill, Movie DNA Edition*
