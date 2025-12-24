# Netflix and Chill - Backend API

This is the backend API server for the Netflix and Chill dating application. It provides RESTful endpoints for user management, matching, chat, and recommendations.

## Technology Stack

- **Node.js** with Express.js
- Multiple database support:
  - File-based storage (default)
  - MongoDB (NoSQL)
  - PostgreSQL (SQL)
- RESTful API architecture
- TMDB API integration for real streaming data

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
# Copy example env file to backend directory
cp ../.env.example .env

# Edit .env and add your API keys
```

**Required API Keys:**
- **TMDB API Key** (Required): Get free API key at https://www.themoviedb.org/settings/api
- **Database** (Optional): MongoDB, PostgreSQL, or use file-based storage (default)
- **Stream Chat API** (Optional): For real-time chat features
- **Firebase** (Optional): For authentication

For detailed setup instructions, see the main repository's [API_KEYS_GUIDE.md](../API_KEYS_GUIDE.md)

## Running the Server

Start the backend server:
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The server will run on `http://localhost:3000` by default.

## Database Configuration

### File-based Storage (Default)
No configuration needed. Data is stored in `data/` directory.

### MongoDB
1. Set up MongoDB (local or cloud)
2. Add to `.env`:
```
DB_TYPE=mongodb
MONGODB_URI=mongodb://localhost:27017/netflix-and-chill
```

### PostgreSQL
1. Set up PostgreSQL database
2. Add to `.env`:
```
DB_TYPE=postgresql
POSTGRESQL_URI=postgresql://user:password@localhost:5432/netflix_and_chill
```

## Test Data Generation

To quickly populate the database with test users:

```bash
# Generate 100 users (default)
npm run seed

# With MongoDB
npm run seed:mongodb

# Generate matches
npm run seed:matches
```

After running the seeder:
- Check `../TEST_CREDENTIALS.md` for all user login credentials
- All users have the same password: `password123`

## API Endpoints

### Users
- `POST /api/users` - Create a new user profile
- `GET /api/users/:userId` - Get user profile
- `PUT /api/users/:userId/bio` - Update user bio
- `POST /api/users/:userId/streaming-services` - Add streaming service
- `POST /api/users/:userId/watch-history` - Add to watch history
- `PUT /api/users/:userId/preferences` - Update preferences

### Matches
- `GET /api/matches/find/:userId` - Find matches for a user (supports filters)
- `GET /api/matches/:userId/history` - Get saved match history
- `GET /api/matches/:userId` - Find matches (legacy endpoint)

### Chat
- `POST /api/chat/send` - Send a message to another user
- `GET /api/chat/:userId1/:userId2` - Get message history between two users
- `GET /api/chat/token/:userId` - Get Stream Chat token (if configured)

### Recommendations
- `GET /api/recommendations/:userId` - Get personalized show/movie recommendations

### Social Features
- `POST /api/likes` - Send a like or super like
- `GET /api/likes/:userId` - Get likes sent by user
- `GET /api/likes/:userId/received` - Get likes received by user
- `GET /api/likes/:userId/mutual` - Get mutual likes (matches)

### Streaming
- `GET /api/streaming/search` - Search for movies and TV shows
- `GET /api/streaming/providers/:mediaType/:mediaId` - Get streaming providers for specific content

### Watch Invitations
- `POST /api/watch-invitations` - Create a watch invitation
- `GET /api/watch-invitations/:userId` - Get user's watch invitations
- `PUT /api/watch-invitations/:invitationId` - Update invitation status

## Project Structure

```
backend/
├── config/
│   ├── config.js           # Configuration settings
│   └── firebase.js         # Firebase configuration
├── constants/
│   ├── profileFrames.js    # Profile frame data
│   ├── quizQuestions.js    # Quiz questions
│   └── userConstants.js    # User-related constants
├── controllers/
│   ├── userController.js   # User management logic
│   ├── matchController.js  # Matching logic
│   ├── chatController.js   # Chat logic
│   └── watchInvitationController.js
├── database/
│   ├── databaseFactory.js  # Database factory pattern
│   ├── mongodbAdapter.js   # MongoDB adapter
│   └── postgresqlAdapter.js # PostgreSQL adapter
├── models/
│   ├── User.js             # User model
│   ├── Match.js            # Match model
│   ├── Like.js             # Like model
│   ├── Chat.js             # Chat model
│   ├── QuizAttempt.js      # Quiz attempt model
│   └── WatchInvitation.js  # Watch invitation model
├── routes/
│   ├── users.js            # User routes
│   ├── matches.js          # Match routes
│   ├── chat.js             # Chat routes
│   ├── likes.js            # Like routes
│   ├── recommendations.js  # Recommendation routes
│   ├── streaming.js        # Streaming routes
│   ├── swipe.js            # Swipe routes
│   ├── uploads.js          # Upload routes
│   └── watchInvitations.js # Watch invitation routes
├── scripts/
│   ├── seedUsers.js        # Seed test users
│   ├── seedMatches.js      # Seed test matches
│   └── ...                 # Other utility scripts
├── services/
│   ├── recommendationService.js
│   ├── streamingAPIService.js
│   ├── watchmodeAPIService.js
│   ├── streamChatService.js
│   └── fallbackData.js
├── utils/
│   ├── matchingEngine.js   # Core matching algorithm
│   ├── movieQuizScoring.js # Quiz scoring logic
│   ├── compatibilityReport.js
│   └── ...                 # Other utilities
├── server.js               # Main server file
├── package.json            # Backend dependencies
└── README.md               # This file
```

## Environment Variables

Create a `.env` file in the backend directory with:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database (choose one)
DB_TYPE=file
# DB_TYPE=mongodb
# DB_TYPE=postgresql

# MongoDB (if using)
MONGODB_URI=mongodb://localhost:27017/netflix-and-chill

# PostgreSQL (if using)
POSTGRESQL_URI=postgresql://user:password@localhost:5432/netflix_and_chill

# TMDB API (Required)
TMDB_API_KEY=your_tmdb_api_key_here

# Stream Chat (Optional)
STREAM_CHAT_API_KEY=your_stream_chat_api_key
STREAM_CHAT_API_SECRET=your_stream_chat_secret

# Firebase (Optional)
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
```

## Development

### Running Scripts

The backend includes several utility scripts:

```bash
# Seed test users
npm run seed

# Seed with MongoDB
npm run seed:mongodb

# Analyze seeded data
node scripts/analyzeSeededData.js

# Test matching algorithm
node scripts/testMatchingImprovements.js

# Test streaming providers
node scripts/testStreamingProviders.js
```

### Testing

```bash
npm test
```

## Docker Support

To run the backend in Docker:

```bash
# Build the image
docker build -t netflix-and-chill-backend .

# Run the container
docker run -p 3000:3000 --env-file .env netflix-and-chill-backend
```

Or use docker compose from the root directory:

```bash
cd ..
docker compose up backend
```

## Troubleshooting

### Port already in use
If port 3000 is already in use, change the PORT in `.env` file.

### Database connection issues
- Ensure MongoDB/PostgreSQL is running
- Check connection strings in `.env`
- For file-based storage, ensure write permissions

### API Key errors
- Verify TMDB API key is valid
- Check API key format in `.env`

## Additional Resources

- [Main README](../README.md) - Project overview
- [API Documentation](../API.md) - Detailed API reference
- [API Keys Guide](../API_KEYS_GUIDE.md) - How to get API keys
- [MongoDB Setup](../MONGODB_SETUP.md) - MongoDB configuration
- [Quick Start](../QUICKSTART.md) - Quick start guide
