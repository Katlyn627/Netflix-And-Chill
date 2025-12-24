# Netflix and Chill - Frontend

This is the frontend web application for the Netflix and Chill dating app. It's built with vanilla HTML, CSS, and JavaScript for maximum compatibility and ease of deployment.

## Technology Stack

- **HTML5/CSS3** - Modern, responsive design
- **Vanilla JavaScript** - No framework dependencies
- **Modern gradient UI** - Beautiful, intuitive interface
- **Responsive design** - Works on mobile and desktop

## Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install development dependencies (optional, for local dev server):
```bash
npm install
```

## Running the Frontend

### Option 1: Simple File Server (Recommended)
You can use any static file server. With Node.js installed:

```bash
npm start
# or
npm run dev
```

This will start a development server on `http://localhost:8080`

### Option 2: Direct File Access
Simply open `index.html` in your web browser. However, note that some features may not work due to CORS restrictions.

### Option 3: Python SimpleHTTPServer
If you have Python installed:

```bash
# Python 3
python -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080
```

### Option 4: VS Code Live Server
If you use VS Code, install the "Live Server" extension and right-click on `index.html` -> "Open with Live Server"

## Configuration

The frontend connects to the backend API. Update the API endpoint in your configuration:

1. Open `src/services/api.js`
2. Update the `API_BASE_URL` to point to your backend:

```javascript
// For local development
const API_BASE_URL = 'http://localhost:3000';

// For production
const API_BASE_URL = 'https://your-backend-domain.com';
```

## Features

### User Interface
- **Splash Screen** - Welcome screen with app branding
- **Onboarding Flow** - Interactive introduction to app features
- **Login/Signup** - User authentication interface
- **Profile Management** - Create and edit user profiles
- **Photo Upload** - Profile pictures and photo galleries
- **Swipe Interface** - Tinder-style matching interface
- **Matches View** - See all your matches
- **Chat Interface** - Message your matches
- **Watch Together** - Coordinate watching shows together
- **Profile Frames** - Customize your profile with frames
- **Debate Rooms** - Participate in movie/TV debates

### Pages
- `index.html` - Landing/splash page
- `onboarding.html` - User onboarding flow
- `login.html` - Login page
- `homepage.html` - Main dashboard
- `profile.html` - User profile management
- `profile-view.html` - View other user profiles
- `swipe.html` - Swipe/matching interface
- `matches.html` - View matches with filters
- `chat.html` - Messaging interface
- `watch-together.html` - Watch party coordination
- `debate-prompts.html` - Movie/TV debates
- `analytics.html` - Swipe analytics dashboard

## Project Structure

```
frontend/
├── assets/
│   ├── images/          # App images and icons
│   ├── onboarding/      # Onboarding assets
│   └── uploads/         # User uploaded content
├── src/
│   ├── components/      # Reusable JS components
│   │   ├── chat.js
│   │   ├── matches.js
│   │   ├── login.js
│   │   └── ...
│   ├── services/        # API and service integrations
│   │   └── api.js       # Backend API client
│   ├── styles/          # CSS stylesheets
│   │   ├── base.css
│   │   ├── components.css
│   │   └── ...
│   └── utils/           # Utility functions
│       ├── errorHandler.js
│       ├── navigation.js
│       └── sharedFilters.js
├── *.html               # Page templates
├── manifest.json        # PWA manifest
├── package.json         # Frontend dependencies
└── README.md            # This file
```

## Development

### Testing
The frontend is designed to work with the backend API. Ensure the backend is running before testing frontend features.

```bash
# In backend directory
npm start

# In frontend directory (separate terminal)
npm start
```

Then navigate to `http://localhost:8080` in your browser.

### Making Changes
1. Edit HTML, CSS, or JavaScript files
2. Refresh your browser to see changes
3. No build process required!

## Docker Support

To run the frontend in Docker:

```bash
# Build the image
docker build -t netflix-and-chill-frontend .

# Run the container
docker run -p 8080:80 netflix-and-chill-frontend
```

Or use docker-compose from the root directory:

```bash
cd ..
docker-compose up frontend
```

## API Integration

The frontend communicates with the backend through RESTful API calls. The API client is located at `src/services/api.js`.

### Key Endpoints Used
- `/api/users` - User management
- `/api/matches` - Finding and managing matches
- `/api/chat` - Messaging functionality
- `/api/likes` - Like/super like actions
- `/api/recommendations` - Get personalized recommendations
- `/api/streaming` - Search movies and TV shows
- `/api/watch-invitations` - Watch together feature

## Deployment

### Static Hosting
The frontend can be deployed to any static hosting service:

- **Netlify**: Drag and drop the frontend folder
- **Vercel**: Deploy with `vercel` CLI
- **GitHub Pages**: Push to gh-pages branch
- **AWS S3**: Upload to S3 bucket with static website hosting
- **Firebase Hosting**: Use `firebase deploy`

### Environment Variables
When deploying, make sure to update the API endpoint in `src/services/api.js` to point to your production backend.

## Progressive Web App (PWA)

The frontend includes a `manifest.json` for PWA capabilities:

- Add to home screen on mobile devices
- Offline support (future enhancement)
- Native app-like experience

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### CORS Errors
If you see CORS errors:
1. Ensure the backend is running
2. Check that the backend has CORS enabled
3. Verify the API_BASE_URL in `src/services/api.js`

### API Connection Issues
If the frontend can't connect to the backend:
1. Check that backend is running on the correct port
2. Verify the API_BASE_URL in `src/services/api.js`
3. Check browser console for error messages

### Images Not Loading
If images don't load:
1. Check the `assets/` directory exists
2. Verify image paths in HTML files
3. Check browser console for 404 errors

## Additional Resources

- [Main README](../README.md) - Project overview
- [Backend README](../backend/README.md) - Backend setup
- [API Documentation](../API.md) - API reference
- [Quick Start Guide](../QUICKSTART.md) - Quick start guide
