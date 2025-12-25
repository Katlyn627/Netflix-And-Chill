# Netflix and Chill - Dating App

A modern dating application that matches users based on their streaming preferences, watch history, and binge-watching habits. Find your perfect streaming partner!

## Features

- **Onboarding Experience**: Beautiful onboarding flow introducing users to the app's core features
- **User Profiles**: Create detailed profiles with bio, age, and location
- **Profile Pictures & Photo Galleries**: Upload profile pictures and up to 6 photos
- **Favorite Movies**: Search and add your favorite movies from TMDB to your profile
- **Profile Watch History Management**: Add and update your watch history directly from your profile page
- **Viewing Preferences**: Set your favorite genres and binge-watching count for better matches
- **Streaming Service Integration**: Connect multiple streaming platforms (Netflix, Hulu, Disney+, Amazon Prime, HBO Max, Apple TV+)
- **Real Streaming API Integration**: Get real movie/TV show data from TMDB API
- **Watch History Tracking**: Track movies, TV shows, and series you've watched
- **Smart Matching Algorithm**: Get matched with users based on:
  - Shared streaming services
  - Common shows and movies watched
  - Shared favorite movies (25 points each)
  - Similar genre preferences
  - Compatible binge-watching patterns
- **Match Persistence**: Matches are automatically saved and accessible from chat page
- **Real-time Chat**: Message your matches with optional Firebase & Stream Chat integration
  - Works with fallback storage (no external APIs required)
  - Optional Stream Chat for real-time features (typing indicators, read receipts)
  - Optional Firebase for authentication
  - See [QUICKSTART_CHAT.md](docs/guides/QUICKSTART_CHAT.md) for 5-minute setup
- **Advanced Filters**: Filter matches by age range, location radius, gender, and orientation
- **Shared Filter State**: Filters persist across matches and chat pages
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

3. Configure environment:
```bash
# Copy example env file
cp .env.example .env

# Edit .env and add your API keys
# See docs/guides/API_KEYS_GUIDE.md for detailed setup instructions
```

**Required API Keys:**
- **TMDB API Key** (Required): Get free API key at https://www.themoviedb.org/settings/api
- **Database** (Optional): MongoDB, PostgreSQL, or use file-based storage (default)
- **Authentication** (Optional): Firebase or Auth0 for user authentication
- **Chat Service** (Optional): SendBird, Twilio, or Stream for real-time messaging

📖 **For detailed setup instructions, see [API_KEYS_GUIDE.md](docs/guides/API_KEYS_GUIDE.md)**

4. Start the backend server:
```bash
npm start
```

The server will run on `http://localhost:3000`

## Usage

### Test Data Generation

To quickly populate the database with 100 fake users for testing:

```bash
# Generate 100 users (default)
npm run seed

# Generate custom number of users
node backend/scripts/seedUsers.js --count=50

# With MongoDB
npm run seed:mongodb
```

After running the seeder:
- Check `TEST_CREDENTIALS.md` for all user login credentials
- All users have the same password: `password123`
- Each user has complete profile data including streaming services, preferences, and more

See [backend/scripts/README.md](backend/scripts/README.md) for detailed seeder documentation.

### Opening the App

1. Start the backend server (see Installation step 3)
2. Open `frontend/index.html` in your web browser
3. Follow the on-screen steps to create your profile and find matches
   - Or login with any user from `TEST_CREDENTIALS.md` if you've run the seeder

### API Endpoints

#### Users
- `POST /api/users` - Create a new user profile
- `GET /api/users/:userId` - Get user profile
- `PUT /api/users/:userId/bio` - Update user bio
- `POST /api/users/:userId/streaming-services` - Add streaming service
- `POST /api/users/:userId/watch-history` - Add to watch history
- `PUT /api/users/:userId/preferences` - Update preferences

#### Matches
- `GET /api/matches/find/:userId` - Find matches for a user (supports filters)
- `GET /api/matches/:userId/history` - Get saved match history
- `GET /api/matches/:userId` - Find matches (legacy endpoint)

#### Chat
- `POST /api/chat/send` - Send a message to another user
- `GET /api/chat/:userId1/:userId2` - Get message history between two users
- `GET /api/chat/token/:userId` - Get Stream Chat token (if configured)

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
├── assets/
│   └── onboarding/              # Onboarding assets
│       ├── logo.svg             # App logo and branding
│       ├── onboard1.svg         # "Chat & Watch Together"
│       ├── onboard2.svg         # "Build Real Connections"
│       ├── onboard3.svg         # "Discover Matches Through Movies"
│       └── README.md            # Asset documentation
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
│   ├── onboarding.html         # Onboarding flow
│   ├── index.html              # Main HTML page
│   ├── assets/
│   │   └── images/             # App icons and images
│   └── src/
│       ├── components/
│       │   ├── onboarding.js   # Onboarding component
│       │   └── app.js          # Frontend application logic
│       ├── services/
│       │   └── api.js          # API service layer
│       └── styles/
│           ├── onboarding.css  # Onboarding styles
│           └── main.css        # Styling
├── docs/
│   ├── api/
│   │   └── API.md                # API documentation
│   ├── database/
│   │   ├── DATABASE-MIGRATION.md # Database migration guide
│   │   ├── MONGODB_SETUP.md      # MongoDB setup guide
│   │   └── ...                   # Other database docs
│   ├── deployment/
│   │   ├── AWS.md                # AWS deployment guide
│   │   ├── HEROKU.md             # Heroku deployment guide
│   │   ├── VERCEL-NETLIFY.md     # Vercel/Netlify guide
│   │   └── DOCKER.md             # Docker deployment guide
│   ├── features/
│   │   ├── WATCH-TOGETHER-FEATURE.md     # Watch Together feature docs
│   │   ├── BROWSER_EXTENSION_COMPATIBILITY.md
│   │   └── ...                   # Other feature docs
│   ├── guides/
│   │   ├── API_KEYS_GUIDE.md     # API keys setup guide
│   │   ├── QUICKSTART.md         # Quick start guide
│   │   ├── QUICKSTART_CHAT.md    # Chat setup guide
│   │   └── ...                   # Other guides
│   ├── implementation/
│   │   └── ...                   # Implementation summaries
│   ├── mobile/
│   │   └── REACT-NATIVE.md       # React Native mobile app guide
│   ├── security/
│   │   ├── SECURITY.md           # Security documentation
│   │   └── ...                   # Security summaries
│   ├── ICON-ASSETS.md            # Icon assets documentation
│   └── PASSWORD-AND-PHOTO-GUIDE.md
├── data/                       # User data storage (auto-generated)
├── .env.example                # Environment variables template
├── package.json
├── .gitignore
└── README.md
```

## Onboarding & Brand Assets

### Brand Kit
The Netflix & Chill app uses a consistent brand identity across all user touchpoints:

**Colors:**
- **Cinematic Red**: `#E50914` - Primary brand color for CTAs and highlights
- **Black**: `#000000` - Primary background and text
- **White**: `#FFFFFF` - Secondary text and contrast elements
- **Dark Gray**: `#141414` - Secondary background for depth

**Logo Variants:**
- Full Logo: Complete branding with text and icon
- Text-free Icon: Standalone icon for app icons
- Dark Mode: Optimized for dark backgrounds  
- Rounded Icon: Circular variant for profiles

### Onboarding Flow
New users are welcomed with an engaging 4-screen onboarding experience:

1. **Welcome Screen** - Introduces the Netflix & Chill brand and value proposition
2. **Chat & Watch Together** - Explains the social viewing experience
3. **Build Real Connections** - Emphasizes meaningful relationships over superficial matching
4. **Discover Matches Through Movies** - Showcases the smart matching algorithm

**Features:**
- Smooth screen transitions with swipe gestures (mobile) and keyboard navigation
- Progress indicators showing current position in the flow
- Skip option for returning users
- Accessible design with screen reader support
- Responsive across all device sizes

**Access the onboarding:**
- First-time users: Automatically shown on first app launch
- Returning users: Can access via settings or by clearing localStorage
- Development: Use `resetOnboarding()` in browser console

For detailed asset documentation, see [assets/onboarding/README.md](assets/onboarding/README.md)

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

## API Keys & External Services

Netflix and Chill integrates with various external APIs and services to provide full functionality. Below is a summary of the services and their purposes:

### Essential Services

| Service | Purpose | Required | Cost | Get API Key |
|---------|---------|----------|------|-------------|
| **TMDB** | Movie/TV data, posters, details | ✅ Yes | FREE | [Get Key](https://www.themoviedb.org/settings/api) |
| **Database** | User data storage | ⚠️ Recommended | FREE tier | MongoDB, PostgreSQL, or file-based |

### Authentication (Choose One)

| Service | Purpose | Required | Cost | Get API Key |
|---------|---------|----------|------|-------------|
| **Firebase Auth** | User authentication, social login | 🟡 Optional | FREE | [Get Key](https://console.firebase.google.com/) |
| **Auth0** | Secure authentication platform | 🟡 Optional | FREE tier | [Get Key](https://auth0.com/) |

### Chat & Messaging (Choose One)

| Service | Purpose | Required | Cost | Get API Key |
|---------|---------|----------|------|-------------|
| **SendBird** | Real-time in-app chat | 🟡 Optional | FREE tier | [Get Key](https://dashboard.sendbird.com/) |
| **Twilio** | SMS notifications, voice calls | 🟡 Optional | Pay-as-you-go | [Get Key](https://www.twilio.com/console) |
| **Stream Chat** | Scalable chat infrastructure | 🟡 Optional | FREE tier | [Get Key](https://getstream.io/) |

### Cloud Storage (Choose One)

| Service | Purpose | Required | Cost | Get API Key |
|---------|---------|----------|------|-------------|
| **AWS S3** | Profile pictures, media storage | 🟡 Optional | FREE tier | [Get Key](https://console.aws.amazon.com/) |
| **Google Cloud Storage** | File storage | 🟡 Optional | FREE tier | [Get Key](https://console.cloud.google.com/) |

### Analytics & Monitoring

| Service | Purpose | Required | Cost | Get API Key |
|---------|---------|----------|------|-------------|
| **Google Analytics** | User behavior tracking | 🟡 Optional | FREE | [Get Key](https://analytics.google.com/) |
| **Mixpanel** | Product analytics | 🟡 Optional | FREE tier | [Get Key](https://mixpanel.com/) |
| **Sentry** | Error tracking | 🟡 Optional | FREE tier | [Get Key](https://sentry.io/) |

### Email Services

| Service | Purpose | Required | Cost | Get API Key |
|---------|---------|----------|------|-------------|
| **SendGrid** | Email notifications | 🟡 Optional | FREE tier | [Get Key](https://app.sendgrid.com/) |
| **Mailgun** | Email delivery | 🟡 Optional | FREE tier | [Get Key](https://www.mailgun.com/) |

### Setup Guide

For detailed step-by-step instructions on setting up each API key and service, see:
- 📖 **[API_KEYS_GUIDE.md](docs/guides/API_KEYS_GUIDE.md)** - Comprehensive setup guide
- 📝 **[.env.example](.env.example)** - Environment variables template

**Quick Start:**
```bash
# 1. Copy environment template
cp .env.example .env

# 2. Add your TMDB API key (minimum required)
# Edit .env and add: TMDB_API_KEY=your_key_here

# 3. Start the server
npm start
```

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
- **Quick Setup:** See [MONGODB_SETUP.md](docs/database/MONGODB_SETUP.md) for step-by-step MongoDB Atlas setup
- **Migration Guide:** See [docs/DATABASE-MIGRATION.md](docs/DATABASE-MIGRATION.md)

### PostgreSQL
- SQL database
- ACID compliance
- Free tier on Heroku, Supabase, etc.
- See [docs/DATABASE-MIGRATION.md](docs/DATABASE-MIGRATION.md)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Troubleshooting

### Browser Extension Console Errors

If you see console errors like "Host validation failed" or "Host is not supported", these are from streaming browser extensions (like Teleparty, Netflix Party) that don't recognize localhost. These errors are harmless and automatically suppressed by our error handler.

📖 **See [BROWSER_EXTENSION_COMPATIBILITY.md](BROWSER_EXTENSION_COMPATIBILITY.md) for more details**

### Other Issues

For other issues and questions, please open an issue on GitHub.

## License

ISC

## Support

For issues and questions, please open an issue on GitHub.

---

**Happy Matching! 🎬❤️**
