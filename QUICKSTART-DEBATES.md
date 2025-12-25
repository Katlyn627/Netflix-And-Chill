# Quick Start Guide - Movie Debates System

This guide will help you quickly get the enhanced MongoDB schema and movie debates system up and running.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn package manager

## Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   ```env
   # For MongoDB Atlas (recommended)
   MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/netflix-and-chill?retryWrites=true&w=majority
   
   # Or for local MongoDB
   MONGODB_URI=mongodb://localhost:27017/netflix-and-chill
   
   # Express API Base (for Next.js to find Express)
   EXPRESS_API_BASE=http://localhost:4000
   
   # Server Port
   PORT=4000
   ```

## Running the Application

### Option 1: Express Server Only (Backend)

Start the Express API server:
```bash
npm run dev:express
```

The server will run on `http://localhost:4000`

Test the health endpoint:
```bash
curl http://localhost:4000/health
```

### Option 2: Full Stack (Next.js + Express)

1. **Terminal 1 - Start Express Server:**
   ```bash
   npm run dev:express
   ```

2. **Terminal 2 - Start Next.js:**
   ```bash
   npx next dev
   ```

The Next.js app will run on `http://localhost:3000`

## Testing the Features

### 1. Health Check

**Express:**
```bash
curl http://localhost:4000/health
```

**Next.js API:**
```bash
curl http://localhost:3000/api/health
```

### 2. Debate Topics

**Get all topics:**
```bash
curl http://localhost:4000/api/debates/topics
```

**Filter by category:**
```bash
curl "http://localhost:4000/api/debates/topics?category=hot-takes"
```

### 3. Create a Debate Room

```bash
curl -X POST http://localhost:4000/api/debates/rooms \
  -H "Content-Type: application/json" \
  -d '{
    "title": "The Godfather is Overrated",
    "topic": "Let'\''s debate if The Godfather deserves its #1 spot",
    "category": "hot-takes",
    "createdBy": "user123",
    "description": "Bring your best arguments!"
  }'
```

### 4. List Active Rooms

```bash
curl http://localhost:4000/api/debates/rooms
```

**Filter by category:**
```bash
curl "http://localhost:4000/api/debates/rooms?category=hot-takes"
```

### 5. Join a Room

```bash
curl -X POST http://localhost:4000/api/debates/rooms/ROOM_ID/join \
  -H "Content-Type: application/json" \
  -d '{"userId": "user123"}'
```

### 6. Post a Message

```bash
curl -X POST http://localhost:4000/api/debates/rooms/ROOM_ID/messages \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "message": "I think The Godfather is a masterpiece!"
  }'
```

### 7. Get Messages

```bash
curl "http://localhost:4000/api/debates/rooms/ROOM_ID/messages?limit=50"
```

## Using the UI

### Debate Topics Page

1. Navigate to: `http://localhost:3000/debates/topics`
2. Browse suggested topics or filter by category
3. Click "Start Debate" on any topic
4. Fill in the room details
5. Click "Create Room"

### Chat Room Page

1. Click "Join Discussion" on any active room
2. Type your message in the input field
3. Press Enter or click the send button
4. Messages will update automatically every 3 seconds

## Creating Test Data

### Create a Test User

```bash
curl -X POST http://localhost:4000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "Movie Lover",
    "email": "test@example.com",
    "passwordHash": "hashed_password",
    "identity": {
      "birthdate": "1990-01-01",
      "gender": "male"
    },
    "location": {
      "city": "Los Angeles",
      "country": "USA",
      "geo": {
        "type": "Point",
        "coordinates": [-118.2437, 34.0522]
      }
    },
    "movieTaste": {
      "favoriteGenres": ["action", "sci-fi", "thriller"],
      "moodPreferences": ["intense", "thought-provoking"]
    },
    "datingPrefs": {
      "relationshipIntent": "casual",
      "distanceMiles": 25
    }
  }'
```

## Troubleshooting

### MongoDB Connection Failed

**Error:** `Unable to connect to MongoDB`

**Solution:**
1. Verify MongoDB is running (if local)
2. Check your `MONGODB_URI` in `.env`
3. For MongoDB Atlas, ensure your IP is whitelisted
4. Verify your username and password are correct

### Port Already in Use

**Error:** `Port 4000 is already in use`

**Solution:**
1. Stop any running Express servers
2. Or change the PORT in `.env`
3. Kill the process: `lsof -ti:4000 | xargs kill`

### Dependencies Not Found

**Error:** `Cannot find module 'mongoose'`

**Solution:**
```bash
npm install
```

### Next.js Build Errors

**Error:** Build or runtime errors in Next.js

**Solution:**
1. Ensure you're using Node.js 14+
2. Delete `.next` folder: `rm -rf .next`
3. Reinstall dependencies: `rm -rf node_modules && npm install`
4. Try again: `npx next dev`

## API Documentation

For complete API documentation, see:
- `DEBATES-IMPLEMENTATION.md` - Full system documentation
- `API.md` - General API documentation

## Architecture Overview

```
┌─────────────┐
│   Next.js   │  (Frontend + API Routes)
│  Port 3000  │
└──────┬──────┘
       │ BFF Pattern
       ▼
┌─────────────┐
│   Express   │  (Backend API)
│  Port 4000  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   MongoDB   │  (Database)
│  Port 27017 │
└─────────────┘
```

## Next Steps

1. Explore the enhanced User schema in `/src/models/User.js`
2. Create debate rooms and test the chat functionality
3. Review the matching algorithm in `/src/server/routes/matches.routes.js`
4. Implement authentication (see SECURITY-SUMMARY-DEBATES.md)
5. Consider WebSocket implementation for real-time chat

## Support

For issues or questions:
1. Check the documentation in `/docs` folder
2. Review SECURITY-SUMMARY-DEBATES.md for security considerations
3. See DEBATES-IMPLEMENTATION.md for technical details

Enjoy building your movie-based dating and discussion platform! 🎬💬
