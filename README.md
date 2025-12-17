# Netflix and Chill - Dating App

A modern dating application that matches users based on their streaming preferences, watch history, and binge-watching habits. Find your perfect streaming partner!

## Features

- **User Profiles**: Create detailed profiles with bio, age, and location
- **Streaming Service Integration**: Connect multiple streaming platforms (Netflix, Hulu, Disney+, Amazon Prime, HBO Max, Apple TV+)
- **Watch History Tracking**: Track movies, TV shows, and series you've watched
- **Smart Matching Algorithm**: Get matched with users based on:
  - Shared streaming services
  - Common shows and movies watched
  - Similar genre preferences
  - Compatible binge-watching patterns
- **Match Scoring**: Each match gets a score (0-100) indicating compatibility
- **Cross-Platform Ready**: Built with web technologies for easy deployment across platforms

## Technology Stack

### Backend
- **Node.js** with Express.js
- File-based data storage (easily upgradable to MongoDB/PostgreSQL)
- RESTful API architecture

### Frontend
- **HTML5/CSS3/JavaScript**
- Responsive design for mobile and desktop
- Modern gradient UI
- Can be enhanced with React/React Native for native apps

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

3. Start the backend server:
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
- `GET /api/matches/:userId` - Find matches for a user
- `GET /api/matches/:userId/history` - Get match history

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
│   ├── controllers/
│   │   ├── userController.js      # User management logic
│   │   └── matchController.js     # Matching logic
│   ├── models/
│   │   ├── User.js                # User model
│   │   └── Match.js               # Match model
│   ├── routes/
│   │   ├── users.js               # User routes
│   │   └── matches.js             # Match routes
│   ├── utils/
│   │   ├── dataStore.js           # Data persistence
│   │   └── matchingEngine.js     # Matching algorithm
│   └── server.js                  # Express server
├── frontend/
│   ├── index.html                 # Main HTML page
│   └── src/
│       ├── components/
│       │   └── app.js             # Frontend application logic
│       ├── services/
│       │   └── api.js             # API service layer
│       └── styles/
│           └── main.css           # Styling
├── data/                          # User data storage (auto-generated)
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

- [ ] User authentication and security
- [ ] Real-time chat between matches
- [ ] Integration with actual streaming APIs
- [ ] Mobile apps (React Native)
- [ ] Profile pictures and photo galleries
- [ ] Advanced filters (age range, location radius)
- [ ] Recommendation system for new shows
- [ ] Social features (likes, super likes)
- [ ] Database migration (MongoDB/PostgreSQL)
- [ ] Deployment guides for cloud platforms

## Cross-Platform Deployment

### Web
- The current version works in any modern web browser
- Can be hosted on platforms like Vercel, Netlify, or Heroku

### Mobile (Future)
- Frontend can be converted to React Native
- Same backend API can serve mobile apps

### Desktop (Future)
- Electron wrapper for desktop applications
- Progressive Web App (PWA) capabilities

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC

## Support

For issues and questions, please open an issue on GitHub.

---

**Happy Matching! 🎬❤️**
