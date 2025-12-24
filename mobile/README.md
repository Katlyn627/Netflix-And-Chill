# Netflix & Chill - React Native Mobile App

A fully functional React Native mobile dating app that matches users based on their streaming preferences, watch history, and binge-watching habits. Built with Expo for cross-platform compatibility (iOS and Android).

## Features

✅ **Complete Mobile Experience**
- Native iOS and Android apps
- Smooth animations and gestures
- Dark theme optimized for viewing
- Offline support with local caching

✅ **User Authentication & Onboarding**
- Beautiful splash screen
- Interactive onboarding flow
- Easy profile creation
- Persistent login state

✅ **Core Features**
- Smart matching algorithm based on streaming preferences
- Real-time chat with matches
- Personalized movie/TV show recommendations
- Swipeable match cards
- Profile management with photo upload
- Streaming service selection
- Genre preferences
- Watch history tracking

✅ **UI/UX**
- Netflix-inspired design
- Smooth animations and transitions
- Pull-to-refresh on all screens
- Loading states and error handling
- Empty states with helpful messages

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Storage**: AsyncStorage
- **Image Picker**: Expo Image Picker
- **UI**: Custom components with Netflix brand colors

## Prerequisites

- Node.js 16+ and npm
- iOS Simulator (macOS only) or Android Emulator
- Expo CLI (installed automatically with npx)
- Backend server running (see main README)

## Installation

1. **Navigate to mobile directory**:
```bash
cd mobile
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure API endpoint** (optional):
   - Edit `src/services/api.js`
   - Update `API_BASE_URL` for production environment
   - Default points to `http://localhost:3000/api` for development

## Running the App

### Start the backend server first
```bash
# From root directory
cd ..
npm start
```

### Then start the mobile app

**Start Expo development server**:
```bash
npm start
```

This will open Expo Dev Tools in your browser.

**Run on iOS Simulator** (macOS only):
```bash
npm run ios
```

**Run on Android Emulator**:
```bash
npm run android
```

**Run in web browser** (for testing):
```bash
npm run web
```

**Run on physical device**:
1. Install Expo Go app from App Store (iOS) or Play Store (Android)
2. Scan the QR code shown in terminal or Expo Dev Tools
3. App will load on your device

## Project Structure

```
mobile/
├── App.js                      # Root component
├── app.json                    # Expo configuration
├── src/
│   ├── navigation/
│   │   └── AppNavigator.js     # Navigation setup (Stack + Tabs)
│   ├── screens/
│   │   ├── SplashScreen.js     # Initial splash screen
│   │   ├── OnboardingScreen.js # Onboarding flow
│   │   ├── LoginScreen.js      # Login/Signup
│   │   ├── HomeScreen.js       # Matches feed
│   │   ├── ProfileScreen.js    # User profile
│   │   ├── ChatScreen.js       # Chat interface
│   │   └── RecommendationsScreen.js # Content recommendations
│   ├── components/
│   │   └── (reusable UI components)
│   ├── context/
│   │   └── UserContext.js      # Global user state
│   ├── services/
│   │   └── api.js              # API service layer
│   ├── styles/
│   │   └── theme.js            # Global theme and styles
│   └── utils/
│       └── (helper functions)
├── assets/                      # Images, icons, fonts
└── package.json
```

## Key Screens

### 1. Splash Screen
- Shows app logo and branding
- Checks authentication state
- Routes to appropriate screen

### 2. Onboarding
- 4-screen introduction flow
- Explains app features
- Swipeable with progress indicators
- Skip option available

### 3. Login/Signup
- Create new profile
- Input: username, email, age, location, bio
- Form validation
- Persistent session

### 4. Home (Matches)
- Browse potential matches
- View match scores and shared content
- Send likes and super likes
- Pull to refresh
- Navigate to chat

### 5. Profile
- View and edit profile information
- Upload profile photo
- Select streaming services
- Choose favorite genres
- Set binge-watching preferences
- Logout option

### 6. Recommendations
- Personalized content suggestions
- Based on watch history and preferences
- Add to watchlist
- Pull to refresh

### 7. Chat
- Real-time messaging with matches
- Message history
- Timestamp display
- Auto-scroll to latest message

## API Integration

The app communicates with the backend API at `http://localhost:3000/api` (development).

### Key Endpoints Used

```
POST   /api/users                    - Create user
GET    /api/users/:userId            - Get user profile
PUT    /api/users/:userId/bio        - Update bio
POST   /api/users/:userId/streaming-services - Add streaming service
PUT    /api/users/:userId/preferences - Update preferences
GET    /api/matches/find/:userId     - Find matches
POST   /api/likes                    - Send like/super like
GET    /api/recommendations/:userId  - Get recommendations
POST   /api/chat/send                - Send message
GET    /api/chat/:userId1/:userId2   - Get chat history
```

## Customization

### Branding
Edit `src/styles/theme.js` to customize:
- Colors (primary, background, text)
- Typography (font sizes, weights)
- Spacing and layout
- Border radius
- Shadows

### Navigation
Edit `src/navigation/AppNavigator.js` to:
- Add new screens
- Modify tab bar icons
- Change navigation structure
- Update screen options

## Building for Production

### iOS (macOS required)

1. **Install EAS CLI**:
```bash
npm install -g eas-cli
```

2. **Login to Expo**:
```bash
eas login
```

3. **Configure build**:
```bash
eas build:configure
```

4. **Build for iOS**:
```bash
eas build --platform ios
```

### Android

1. **Build APK**:
```bash
eas build --platform android
```

2. **Or build AAB for Play Store**:
```bash
eas build --platform android --profile production
```

## Testing

### Manual Testing Checklist
- [ ] App loads and shows splash screen
- [ ] Onboarding flow works (skip and complete)
- [ ] User can create profile
- [ ] Login state persists after app restart
- [ ] Matches load and display correctly
- [ ] Like/Super Like actions work
- [ ] Chat sends and receives messages
- [ ] Profile editing saves changes
- [ ] Streaming services can be toggled
- [ ] Recommendations load
- [ ] Pull-to-refresh works on all screens
- [ ] Navigation works smoothly
- [ ] Logout clears session

## Troubleshooting

### Cannot connect to backend
- Ensure backend server is running on port 3000
- For Android emulator, use `10.0.2.2:3000` instead of `localhost:3000`
- For iOS simulator, `localhost:3000` should work
- For physical device, use your computer's IP address (e.g., `192.168.1.x:3000`)

### Expo Go app won't load
- Make sure device and computer are on same WiFi network
- Try restarting Expo dev server
- Clear Expo cache: `expo start -c`

### Build errors
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear cache: `expo start -c`
- Update Expo: `npm install expo@latest`

### Image picker not working
- Check permissions in app settings
- Request permissions explicitly in code
- Test on real device (some features don't work in simulator)

## Environment Variables

For production, set these in your build configuration:

```
API_BASE_URL=https://your-production-api.com/api
```

## Performance Optimization

✅ Implemented:
- React.memo for expensive components
- FlatList for large lists (virtual scrolling)
- Image lazy loading
- Debounced search inputs
- Optimistic UI updates

## Future Enhancements

Potential additions:
- [ ] Push notifications (Expo Notifications)
- [ ] Real-time chat with WebSocket
- [ ] Video chat integration
- [ ] Swipe gestures for matches (react-native-deck-swiper)
- [ ] Photo gallery with multiple images
- [ ] Location-based matching with maps
- [ ] In-app movie/show previews
- [ ] Social sharing
- [ ] Watch party scheduling
- [ ] Advanced filters

## Support

For issues and questions:
- Check the main project README
- Review the troubleshooting section
- Open an issue on GitHub

## License

ISC - See main project LICENSE

---

**Built with ❤️ for movie lovers everywhere** 🎬
