# Netflix and Chill - Dating App

A modern dating application that matches users based on their streaming preferences, watch history, and binge-watching habits. Find your perfect streaming partner!

## Features

- **User Profiles**: Create detailed profiles with bio, age, and location
- **Profile Pictures & Photo Galleries**: Upload profile pictures and up to 6 photos
- **Streaming Service Integration**: Connect multiple streaming platforms (Netflix, Hulu, Disney+, Amazon Prime, HBO Max, Apple TV+)
- **Real Streaming API Integration**: Get real movie/TV show data from TMDB API
- **Watch History Tracking**: Track movies, TV shows, and series you've watched
- **Smart Matching Algorithm**: Get matched with users based on:
  - Shared streaming services
  - Common shows and movies watched
  - Similar genre preferences
  - Compatible binge-watching patterns
- **Advanced Filters**: Filter matches by age range and location radius
- **Personalized Recommendations**: AI-powered show/movie recommendations based on your watch history and preferences
- **Social Features**: Like and Super Like other users, with mutual match detection
- **Match Scoring**: Each match gets a score (0-100) indicating compatibility
- **Multiple Database Support**: Choose between file-based storage, MongoDB, or PostgreSQL
- **Mobile Ready**: React Native guide for iOS and Android apps
- **Cloud Deployment Ready**: Comprehensive guides for AWS, Heroku, Vercel, and more
- **Cross-Platform Ready**: Built with web technologies for easy deployment across platforms

## Technology Stack

### Backend
- **Node.js** with Express.js
- Multiple database support:
  - File-based storage (default)
  - MongoDB (NoSQL)
  - PostgreSQL (SQL)
- RESTful API architecture
- TMDB API integration for real streaming data

### Frontend
- **HTML5/CSS3/JavaScript**
- Responsive design for mobile and desktop
- Modern gradient UI
- Can be enhanced with React/React Native for native apps

### Deployment
- Docker support
- Cloud platform guides (AWS, Heroku, Vercel, Netlify)
- Kubernetes ready

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Katlyn627/Netflix-And-Chill.git
cd Netflix-And-Chill
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment (optional):
```bash
# Copy example env file
cp .env.example .env

# Edit .env and add your TMDB API key (optional, for recommendations)
# Get free API key at: https://www.themoviedb.org/settings/api
```

4. Start the backend server:
```bash
npm start
```

The server will run on `http://localhost:3000`

## Usage

### Opening the App

1. Start the backend server (see Installation step 3)
2. Open `frontend/index.html` in your web browser
3. Follow the on-screen steps to create your profile and find matches

### API Endpoints

#### Users
- `POST /api/users` - Create a new user profile
- `GET /api/users/:userId` - Get user profile
- `PUT /api/users/:userId/bio` - Update user bio
- `POST /api/users/:userId/streaming-services` - Add streaming service
- `POST /api/users/:userId/watch-history` - Add to watch history
- `PUT /api/users/:userId/preferences` - Update preferences

#### Matches
- `GET /api/matches/:userId` - Find matches for a user (supports filters)
- `GET /api/matches/:userId/history` - Get match history

#### Recommendations
- `GET /api/recommendations/:userId` - Get personalized show/movie recommendations

#### Social Features
- `POST /api/likes` - Send a like or super like
- `GET /api/likes/:userId` - Get likes sent by user
- `GET /api/likes/:userId/received` - Get likes received by user
- `GET /api/likes/:userId/mutual` - Get mutual likes (matches)

### Creating a Profile

1. Fill in your basic information (username, email, age, location)
2. Write a bio about yourself and your watching habits
3. Connect your streaming services
4. Add shows and movies to your watch history
5. Set your genre preferences and binge-watching count
6. Find matches!

## Project Structure

```
Netflix-And-Chill/
├── backend/
│   ├── config/
│   │   └── config.js           # Configuration settings
│   ├── controllers/
│   │   ├── userController.js   # User management logic
│   │   └── matchController.js  # Matching logic
│   ├── database/
│   │   ├── databaseFactory.js  # Database factory
│   │   ├── mongodbAdapter.js   # MongoDB adapter
│   │   └── postgresqlAdapter.js # PostgreSQL adapter
│   ├── models/
│   │   ├── User.js             # User model
│   │   ├── Match.js            # Match model
│   │   └── Like.js             # Like model
│   ├── routes/
│   │   ├── users.js            # User routes
│   │   ├── matches.js          # Match routes
│   │   ├── recommendations.js  # Recommendation routes
│   │   └── likes.js            # Like routes
│   ├── services/
│   │   ├── streamingAPIService.js    # TMDB API integration
│   │   └── recommendationService.js  # Recommendation engine
│   ├── utils/
│   │   ├── dataStore.js        # File-based data persistence
│   │   └── matchingEngine.js   # Matching algorithm
│   └── server.js               # Express server
├── frontend/
│   ├── index.html              # Main HTML page
│   └── src/
│       ├── components/
│       │   └── app.js          # Frontend application logic
│       ├── services/
│       │   └── api.js          # API service layer
│       └── styles/
│           └── main.css        # Styling
├── docs/
│   ├── deployment/
│   │   ├── AWS.md              # AWS deployment guide
│   │   ├── HEROKU.md           # Heroku deployment guide
│   │   ├── VERCEL-NETLIFY.md   # Vercel/Netlify guide
│   │   └── DOCKER.md           # Docker deployment guide
│   ├── mobile/
│   │   └── REACT-NATIVE.md     # React Native mobile app guide
│   └── DATABASE-MIGRATION.md   # Database migration guide
├── data/                       # User data storage (auto-generated)
├── .env.example                # Environment variables template
├── package.json
├── .gitignore
└── README.md
```

## Matching Algorithm

The matching algorithm considers multiple factors:

1. **Shared Streaming Services** (10 points per service)
   - Users with the same platforms get bonus points

2. **Shared Watch History** (20 points per shared show/movie)
   - The more shows you both watch, the higher the match

3. **Shared Genre Preferences** (5 points per genre)
   - Similar taste in genres increases compatibility

4. **Binge-Watching Patterns** (15 bonus points)
   - Users with similar binge-watching habits get a bonus

Match scores are normalized to a 0-100 scale, with higher scores indicating better matches.

## Future Enhancements

- [x] Integration with actual streaming APIs (TMDB)
- [x] Mobile apps (React Native guide available)
- [x] Profile pictures and photo galleries
- [x] Advanced filters (age range, location radius)
- [x] Recommendation system for new shows
- [x] Social features (likes, super likes)
- [x] Database migration (MongoDB/PostgreSQL)
- [x] Deployment guides for cloud platforms
- [ ] User authentication and security (JWT)
- [ ] Real-time chat between matches
- [ ] Video chat integration
- [ ] Push notifications
- [ ] Advanced analytics and insights

## Cross-Platform Deployment

### Web
- The current version works in any modern web browser
- Deploy to:
  - **Heroku**: See [docs/deployment/HEROKU.md](docs/deployment/HEROKU.md)
  - **AWS**: See [docs/deployment/AWS.md](docs/deployment/AWS.md)
  - **Vercel/Netlify**: See [docs/deployment/VERCEL-NETLIFY.md](docs/deployment/VERCEL-NETLIFY.md)
  - **Docker**: See [docs/deployment/DOCKER.md](docs/deployment/DOCKER.md)

### Mobile
- React Native guide available: [docs/mobile/REACT-NATIVE.md](docs/mobile/REACT-NATIVE.md)
- Same backend API serves mobile apps
- iOS and Android support

### Desktop (Future)
- Electron wrapper for desktop applications
- Progressive Web App (PWA) capabilities

## Database Options

Choose the database that best fits your needs:

### File-Based (Default)
- No setup required
- Perfect for development and small deployments
- Data stored in JSON files

### MongoDB
- NoSQL database
- Great for flexible schema
- Free tier available on MongoDB Atlas
- See [docs/DATABASE-MIGRATION.md](docs/DATABASE-MIGRATION.md)

### PostgreSQL
- SQL database
- ACID compliance
- Free tier on Heroku, Supabase, etc.
- See [docs/DATABASE-MIGRATION.md](docs/DATABASE-MIGRATION.md)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC

## Support

For issues and questions, please open an issue on GitHub.

---

**Happy Matching! 🎬❤️**
