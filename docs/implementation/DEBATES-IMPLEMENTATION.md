# Movie Debates & Chat Rooms Implementation

This document describes the newly implemented movie debates and chat room system.

## Overview

The Movie Debates system allows users to:
- Browse debate topics and prompts about movies, cinema, and hot takes
- Create custom debate rooms
- Join existing debate rooms
- Participate in real-time discussions with other users
- View active participants in rooms

## Architecture

### Backend (Express API)

#### Models
- **User** (`/src/models/User.js`): Enhanced Mongoose schema with detailed movie taste, dating preferences, and social preferences
- **DebateRoom** (`/src/models/DebateRoom.js`): Mongoose schema for debate rooms with messages, participants, and metadata

#### API Routes
- **Matches** (`/src/server/routes/matches.routes.js`): Matching candidates based on preferences
- **Debates** (`/src/server/routes/debates.routes.js`): 
  - GET `/api/debates/rooms` - List all debate rooms
  - GET `/api/debates/topics` - Get suggested debate topics
  - GET `/api/debates/rooms/:roomId` - Get specific room details
  - POST `/api/debates/rooms` - Create new debate room
  - POST `/api/debates/rooms/:roomId/join` - Join a room
  - POST `/api/debates/rooms/:roomId/messages` - Post a message
  - GET `/api/debates/rooms/:roomId/messages` - Get room messages

### Frontend (Next.js)

#### API Routes (BFF Pattern)
Located in `/src/app/api/`:
- `/api/health` - Health check endpoint
- `/api/matches` - Match candidates endpoint
- `/api/debates/rooms` - Debate rooms list and creation
- `/api/debates/topics` - Debate topics/prompts
- `/api/debates/rooms/[roomId]` - Individual room details
- `/api/debates/rooms/[roomId]/join` - Join room
- `/api/debates/rooms/[roomId]/messages` - Room messages

#### Pages
- `/src/app/debates/topics/page.js` - Main debates page with:
  - Filterable debate categories
  - Suggested debate topics/prompts
  - List of active debate rooms
  - Modal to create custom rooms
  
- `/src/app/debates/room/[roomId]/page.js` - Individual chat room with:
  - Real-time message display (polling every 3 seconds)
  - Message input and sending
  - Participant list sidebar
  - Room metadata display

## Features

### Debate Categories
- Hot Takes 🔥
- Director Showdown 🎬
- Genre Debates 🎭
- Best of Decade 📅
- Overrated/Underrated 📉
- Plot Holes 🕳️
- Character Analysis 🦹
- Cinematography 📸
- Soundtracks 🎵
- Remakes vs Originals 🔄
- Franchise Discussion ⭐
- Casting Choices 🎭
- General

### Predefined Topics
13 curated debate topics including:
- "The Godfather is Overrated"
- "Marvel vs DC: The Ultimate Showdown"
- "Nolan vs Tarantino"
- "Horror: Jump Scares vs Psychological Terror"
- And more...

## Enhanced User Schema

The User model now includes extensive classification fields:

### Movie Taste Classifiers
- Favorite and dealbreaker genres (40+ genres including sub-genres)
- Mood preferences (12 mood types)
- Content rating preferences
- Viewing style (binge watching, preferred watch time, subtitles, dubbing)
- Favorite directors, actors, writers
- Decade preferences
- International cinema preferences (14 regions)
- Format preferences (movies, series, documentaries, etc.)
- Length preferences
- Thematic interests (20+ themes)
- Pacing and ending preferences
- Comfort rewatches
- Watched and rated content

### Social & Dating Preferences
- Commentary style
- Watching preference (in-person vs virtual)
- Discussion level
- Spoiler tolerance
- Movie date preferences
- Snack and drink preferences

### Identity & Demographics
- Detailed gender and pronouns
- Sexual orientation
- Ethnicity and languages
- Location with geo-indexing

### Engagement & Safety
- Profile completion tracking
- Verification status
- Blocked/reported users
- Privacy settings
- Premium features

## Usage

### Starting the Servers

1. **Express Server** (runs on port 4000 by default):
```bash
npm run dev:express
```

2. **Next.js Server** (if using Next.js for frontend):
```bash
npx next dev
```

### Environment Variables

Required in `.env`:
```
MONGODB_URI=mongodb://localhost:27017/netflix-and-chill
EXPRESS_API_BASE=http://localhost:4000
PORT=4000
```

### Creating a Debate Room

1. Navigate to `/debates/topics`
2. Click on a suggested topic or create a custom room
3. Fill in the room details
4. Click "Create Room"
5. You'll be redirected to the new room

### Joining and Chatting

1. Browse active rooms on `/debates/topics`
2. Click "Join Discussion" on any room
3. Start typing in the message input
4. Press Enter or click the send button
5. Messages appear in real-time (3-second polling)

## Database Indexes

The implementation includes optimized indexes for:
- Geospatial queries (location.geo)
- Status and activity filters
- Category filtering
- Date-based queries (birthdate, lastActive)
- Participant lookups

## Future Enhancements

Potential improvements:
- WebSocket/Socket.IO for true real-time messaging
- Message editing and deletion
- Reactions to messages
- Rich text formatting
- File/image sharing
- Voice/video chat integration
- Moderation tools
- Private messaging
- Notifications system
- Advanced search and filters
- Trending topics
- User reputation system
