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
  - See [docs/quickstart/QUICKSTART_CHAT.md](docs/quickstart/QUICKSTART_CHAT.md) for 5-minute setup
- **Advanced Filters**: Filter matches by age range, location radius, gender, and orientation
- **Shared Filter State**: Filters persist across matches and chat pages
- **Personalized Recommendations**: AI-powered show/movie recommendations based on your watch history and preferences
- **Social Features**: Like and Super Like other users, with mutual match detection
- **Match Scoring**: Each match gets a score (0-100) indicating compatibility
- **Multiple Database Support**: Choose between file-based storage, MongoDB, or PostgreSQL
- **Native Mobile Apps**: Fully functional React Native app for iOS and Android
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

#### Web (Current)
- **HTML5/CSS3/JavaScript**
- Responsive design for mobile and desktop
- Modern gradient UI

#### Mobile (React Native)
- **React Native** with Expo
- Native iOS and Android apps
- React Navigation for seamless navigation
- Context API for state management
- Dark theme optimized design
- Full feature parity with web version
- See [docs/quickstart/QUICKSTART-REACT-NATIVE.md](docs/quickstart/QUICKSTART-REACT-NATIVE.md) for setup

### Deployment
- Docker support
- Cloud platform guides (AWS, Heroku, Vercel, Netlify)
- Kubernetes ready

## Repository Structure

This repository contains both the backend API and frontend web application in a unified structure:

```
Netflix-And-Chill/
├── backend/          # Backend API (Node.js/Express)
├── frontend/         # Frontend Web App (HTML/CSS/JS)
├── mobile/           # Mobile App (React Native)
├── docker-compose.yml # Docker orchestration
└── package.json      # Root package with convenience scripts
```

Each component has its own dependencies and can be developed/deployed independently. See individual READMEs:
- [Backend README](backend/README.md)
- [Frontend README](frontend/README.md)
- [Mobile README](mobile/README.md)

## Quick Start

### Option 1: Using Docker (Recommended)

The easiest way to run the entire application:

```bash
# Clone the repository
git clone https://github.com/Katlyn627/Netflix-And-Chill.git
cd Netflix-And-Chill

# Configure environment variables
cp .env.sample backend/.env
# Edit backend/.env and add your TMDB API key

# Build and start all services
docker compose up

# Backend will be available at http://localhost:3000
# Frontend will be available at http://localhost:8080
```

### Option 2: Manual Setup

#### Step 1: Install Dependencies

You can install all dependencies at once:
```bash
# Install all dependencies (backend + frontend + mobile)
npm run install:all
```

Or install them separately:
```bash
# Install backend dependencies
npm run install:backend

# Install frontend dependencies
npm run install:frontend

# Install mobile dependencies (optional)
npm run install:mobile
```

#### Step 2: Configure Backend

```bash
# Copy sample env file
cp .env.sample backend/.env

# Edit backend/.env and add your API keys
# See API_KEYS_GUIDE.md for detailed setup instructions
```

**Required API Keys:**
- **TMDB API Key** (Required): Get free API key at https://www.themoviedb.org/settings/api
- **Database** (Optional): MongoDB, PostgreSQL, or use file-based storage (default)
- **Authentication** (Optional): Firebase or Auth0 for user authentication
- **Chat Service** (Optional): SendBird, Twilio, or Stream for real-time messaging

📖 **For detailed setup instructions, see [API_KEYS_GUIDE.md](API_KEYS_GUIDE.md)**

#### Step 3: Start the Application

**Option A: Run both backend and frontend together**
```bash
# Start backend
npm run start:backend

# In a separate terminal, start frontend
npm run start:frontend
```

**Option B: Run just the backend**
```bash
npm run start:backend
# or
cd backend && npm start
```

Then open `frontend/index.html` directly in your browser.

The backend server will run on `http://localhost:3000`  
The frontend dev server will run on `http://localhost:8080`

## Docker Deployment

This project includes Docker support with `docker-compose.yml` for easy deployment:

### Available Services

- **backend**: Node.js API server (port 3000)
- **frontend**: Nginx web server (port 8080)
- **mongodb**: Optional MongoDB database (port 27017, commented out by default)
- **postgres**: Optional PostgreSQL database (port 5432, commented out by default)

### Docker Commands

```bash
# Build all images
npm run docker:build

# Start all services
npm run docker:up

# Stop all services
npm run docker:down

# View logs
npm run docker:logs
```

### Using Database Containers

To use MongoDB or PostgreSQL with Docker, edit `docker-compose.yml` and uncomment the respective service.

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

**With Docker:**
```bash
docker compose up
# Backend: http://localhost:3000
# Frontend: http://localhost:8080
```

**Without Docker:**
1. Start the backend server: `npm run start:backend`
2. Start the frontend server: `npm run start:frontend`
3. Open your browser to `http://localhost:8080`
4. Follow the on-screen steps to create your profile and find matches
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
├── backend/                      # Backend API Server
│   ├── config/
│   │   ├── config.js             # Configuration settings
│   │   └── firebase.js           # Firebase configuration
│   ├── controllers/
│   │   ├── userController.js     # User management logic
│   │   ├── matchController.js    # Matching logic
│   │   ├── chatController.js     # Chat logic
│   │   └── watchInvitationController.js
│   ├── database/
│   │   ├── databaseFactory.js    # Database factory
│   │   ├── mongodbAdapter.js     # MongoDB adapter
│   │   └── postgresqlAdapter.js  # PostgreSQL adapter
│   ├── models/
│   │   ├── User.js               # User model
│   │   ├── Match.js              # Match model
│   │   ├── Like.js               # Like model
│   │   ├── Chat.js               # Chat model
│   │   ├── QuizAttempt.js        # Quiz attempt model
│   │   └── WatchInvitation.js    # Watch invitation model
│   ├── routes/
│   │   ├── users.js              # User routes
│   │   ├── matches.js            # Match routes
│   │   ├── chat.js               # Chat routes
│   │   ├── likes.js              # Like routes
│   │   ├── recommendations.js    # Recommendation routes
│   │   ├── streaming.js          # Streaming routes
│   │   ├── swipe.js              # Swipe routes
│   │   ├── uploads.js            # Upload routes
│   │   └── watchInvitations.js   # Watch invitation routes
│   ├── scripts/
│   │   ├── seedUsers.js          # Seed test users
│   │   ├── seedMatches.js        # Seed test matches
│   │   └── ...                   # Other utility scripts
│   ├── services/
│   │   ├── recommendationService.js
│   │   ├── streamingAPIService.js
│   │   ├── watchmodeAPIService.js
│   │   ├── streamChatService.js
│   │   └── fallbackData.js
│   ├── utils/
│   │   ├── matchingEngine.js     # Core matching algorithm
│   │   ├── movieQuizScoring.js   # Quiz scoring logic
│   │   ├── compatibilityReport.js
│   │   └── ...                   # Other utilities
│   ├── server.js                 # Main server file
│   ├── package.json              # Backend dependencies
│   ├── Dockerfile                # Backend Docker configuration
│   ├── .env.example              # Backend environment template
│   └── README.md                 # Backend documentation
├── frontend/                     # Frontend Web Application
│   ├── assets/
│   │   ├── images/               # App icons and images
│   │   ├── onboarding/           # Onboarding assets
│   │   └── uploads/              # User uploaded content
│   ├── src/
│   │   ├── components/
│   │   │   ├── chat.js
│   │   │   ├── matches.js
│   │   │   ├── login.js
│   │   │   └── ...
│   │   ├── services/
│   │   │   └── api.js            # API service layer
│   │   ├── styles/
│   │   │   ├── base.css
│   │   │   └── components.css
│   │   └── utils/
│   │       ├── errorHandler.js
│   │       ├── navigation.js
│   │       └── sharedFilters.js
│   ├── index.html                # Landing page
│   ├── onboarding.html           # Onboarding flow
│   ├── login.html                # Login page
│   ├── homepage.html             # Main dashboard
│   ├── profile.html              # Profile management
│   ├── swipe.html                # Swipe interface
│   ├── matches.html              # Matches view
│   ├── chat.html                 # Chat interface
│   ├── watch-together.html       # Watch party coordination
│   ├── manifest.json             # PWA manifest
│   ├── package.json              # Frontend dependencies
│   ├── Dockerfile                # Frontend Docker configuration
│   ├── .env.example              # Frontend environment template
│   └── README.md                 # Frontend documentation
├── mobile/                       # Mobile Application (React Native)
│   ├── src/
│   │   ├── screens/              # Mobile screens
│   │   ├── navigation/           # Navigation configuration
│   │   ├── services/             # API services
│   │   ├── context/              # React context
│   │   └── styles/               # Mobile styles
│   ├── App.js                    # Main mobile app component
│   ├── package.json              # Mobile dependencies
│   └── README.md                 # Mobile documentation
├── assets/
│   └── onboarding/               # Shared onboarding assets
│       ├── logo.svg              # App logo
│       ├── onboard1.svg
│       ├── onboard2.svg
│       ├── onboard3.svg
│       └── README.md
├── docs/
│   ├── deployment/
│   │   ├── AWS.md                # AWS deployment guide
│   │   ├── HEROKU.md             # Heroku deployment guide
│   │   ├── VERCEL-NETLIFY.md     # Vercel/Netlify guide
│   │   └── DOCKER.md             # Docker deployment guide
│   ├── mobile/
│   │   └── REACT-NATIVE.md       # React Native guide
│   └── DATABASE-MIGRATION.md     # Database migration guide
├── src/                          # Additional Express/Next.js features
│   ├── app/                      # Next.js app directory (debates)
│   ├── server/                   # Express server (debates API)
│   ├── models/                   # Additional models
│   └── lib/                      # Shared libraries
├── data/                         # User data storage (auto-generated)
├── docker-compose.yml            # Docker orchestration
├── package.json                  # Root package with convenience scripts
├── .env.sample                   # Environment variables template
├── .gitignore
└── README.md                     # This file
```

## Dependency Management

Each part of the application (backend, frontend, mobile) has its own `package.json` with separate dependencies:

### Backend Dependencies
The backend has its own package.json in `backend/package.json` with:
- Express.js - Web framework
- MongoDB/Mongoose - Database drivers
- PostgreSQL (pg) - Database driver
- CORS - Cross-origin resource sharing
- Multer - File upload handling
- Firebase - Authentication
- Stream Chat - Real-time messaging
- And more...

To install/update backend dependencies:
```bash
cd backend
npm install
# or from root
npm run install:backend
```

### Frontend Dependencies
The frontend has its own package.json in `frontend/package.json` with:
- http-server - Development server (dev dependency only)

The frontend is built with vanilla HTML/CSS/JavaScript and has minimal dependencies. Most functionality is self-contained.

To install/update frontend dependencies:
```bash
cd frontend
npm install
# or from root
npm run install:frontend
```

### Mobile Dependencies
The mobile app has its own package.json in `mobile/package.json` with:
- React Native - Mobile framework
- Expo - Development platform
- React Navigation - Navigation library
- Axios - HTTP client
- And more...

To install/update mobile dependencies:
```bash
cd mobile
npm install
# or from root
npm run install:mobile
```

### Root Package.json
The root `package.json` provides convenience scripts to manage all parts:
- `npm run install:all` - Install all dependencies
- `npm run start:backend` - Start backend server
- `npm run start:frontend` - Start frontend dev server
- `npm run docker:up` - Start with Docker
- And more...

## Environment Variables

Each component has its own environment configuration:

### Backend Environment (backend/.env)
```bash
# Copy the sample file
cp .env.sample backend/.env

# Edit backend/.env with your values
PORT=3000
DB_TYPE=file
TMDB_API_KEY=your_key_here
JWT_SECRET=your_secret_here
```

### Frontend Environment (frontend/.env)
```bash
# Copy the sample file (if needed for frontend-specific config)
cp .env.sample frontend/.env

# Or create a minimal frontend .env with just:
API_BASE_URL=http://localhost:3000
```

The frontend also needs to update the API endpoint in `frontend/src/services/api.js` for production deployments.

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
- 📖 **[API_KEYS_GUIDE.md](API_KEYS_GUIDE.md)** - Comprehensive setup guide
- 📝 **[.env.sample](.env.sample)** - Environment variables template

**Quick Start:**
```bash
# 1. Copy environment template
cp .env.sample backend/.env

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
- [x] Native mobile apps (React Native)
- [ ] User authentication and security (JWT)
- [x] Real-time chat between matches
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

### Mobile (React Native)
- **Fully functional native iOS and Android apps**
- Built with React Native and Expo for cross-platform development
- All features available: matching, chat, recommendations, profile management
- **Quick Start**: See [docs/quickstart/QUICKSTART-REACT-NATIVE.md](docs/quickstart/QUICKSTART-REACT-NATIVE.md)
- **Full Documentation**: See [mobile/README.md](mobile/README.md)
- **Features**:
  - Native performance and smooth animations
  - Dark theme optimized for mobile viewing
  - Image picker for profile photos
  - Pull-to-refresh on all screens
  - Persistent login state
  - Gesture-based navigation
- **Deployment**: Build for App Store and Google Play with Expo EAS Build

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
- **Quick Setup:** See [docs/setup/MONGODB_SETUP.md](docs/setup/MONGODB_SETUP.md) for step-by-step MongoDB Atlas setup
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
