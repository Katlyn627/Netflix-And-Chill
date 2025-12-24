# React Native Mobile App - Quick Start Guide

This guide will help you get the Netflix & Chill React Native mobile app up and running in under 10 minutes.

> **📱 Looking for Android-specific deployment instructions?**  
> See the comprehensive [Android Deployment Guide](../mobile/ANDROID_DEPLOYMENT_GUIDE.md) for step-by-step instructions on deploying and opening the app on your Android phone.

## Prerequisites

Before starting, ensure you have:
- ✅ Node.js 16+ installed
- ✅ npm or yarn package manager
- ✅ iOS Simulator (macOS) or Android Emulator

## Step 1: Start the Backend Server

The mobile app needs the backend API to be running.

```bash
# From the root directory
npm install
npm start
```

The backend should now be running on `http://localhost:3000`

## Step 2: Install Mobile App Dependencies

Open a new terminal window:

```bash
cd mobile
npm install
```

This will install all React Native dependencies (~700 packages, takes 1-2 minutes).

## Step 3: Run the Mobile App

### Option A: iOS Simulator (macOS only)

```bash
npm run ios
```

This will:
1. Start Expo development server
2. Open iOS Simulator
3. Launch the app

### Option B: Android Emulator

```bash
npm run android
```

Make sure you have an Android emulator running or a device connected.

### Option C: Physical Device (Easiest!)

```bash
npm start
```

Then:
1. Install **Expo Go** app from App Store (iOS) or Play Store (Android)
2. Scan the QR code shown in your terminal
3. App will load on your device

### Option D: Web Browser (For Testing)

```bash
npm run web
```

Opens the app in your web browser (limited functionality).

## Step 4: Create Your First Profile

1. The app will show a splash screen
2. Complete the onboarding flow (or skip it)
3. Fill in the profile creation form:
   - Username
   - Email
   - Age (must be 18+)
   - Location
   - Bio (optional)
4. Tap "Create Profile"

## Step 5: Set Up Your Profile

1. Navigate to the **Profile** tab
2. Add your streaming services (Netflix, Hulu, etc.)
3. Select your favorite genres
4. Set your binge-watching count
5. Tap "Save Changes"

## Step 6: Find Matches

1. Go to the **Home** tab
2. Browse potential matches
3. Send likes or super likes
4. Tap "Chat" to start a conversation

## Step 7: Get Recommendations

1. Navigate to the **Discover** tab
2. View personalized movie/TV show recommendations
3. Add items to your watchlist

## Connecting to Your Backend

### Local Development

By default, the app connects to `http://localhost:3000/api`.

### Testing on Physical Device

If testing on a physical device, you need to use your computer's IP address:

1. Find your local IP address:
   ```bash
   # macOS/Linux
   ifconfig | grep "inet "
   
   # Windows
   ipconfig
   ```

2. Edit `mobile/src/services/api.js`:
   ```javascript
   const API_BASE_URL = __DEV__ 
     ? 'http://YOUR_IP_ADDRESS:3000/api'  // e.g., http://192.168.1.100:3000/api
     : 'https://your-production-api.com/api';
   ```

3. Restart the app

### Android Emulator Specific

For Android Emulator, use the special IP `10.0.2.2`:

```javascript
const API_BASE_URL = __DEV__ 
  ? 'http://10.0.2.2:3000/api'
  : 'https://your-production-api.com/api';
```

## Testing with Seeded Data

To test with pre-populated users:

```bash
# In root directory
npm run seed

# Check TEST_CREDENTIALS.md for login info
```

Note: The React Native app creates new profiles, it doesn't use the web login system. But you can still browse matches created by the seeder.

## App Structure at a Glance

```
mobile/
├── src/
│   ├── navigation/      # App navigation (Stack + Tabs)
│   ├── screens/         # All app screens
│   ├── services/        # API calls
│   ├── context/         # Global state
│   ├── styles/          # Theme & styling
│   └── components/      # Reusable components
├── App.js              # Root component
└── package.json        # Dependencies
```

## Key Files to Know

| File | Purpose |
|------|---------|
| `src/services/api.js` | API endpoint configuration |
| `src/styles/theme.js` | Colors, fonts, spacing |
| `src/context/UserContext.js` | User authentication state |
| `src/navigation/AppNavigator.js` | App navigation structure |
| `app.json` | Expo configuration |

## Common Commands

```bash
# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android  
npm run android

# Run in web browser
npm run web

# Clear cache and restart
expo start -c

# View logs
expo start --dev-client
```

## Troubleshooting

### "Cannot connect to server"
- ✅ Backend server is running on port 3000
- ✅ Using correct IP address for device
- ✅ Device and computer on same WiFi

### "Metro bundler failed"
```bash
cd mobile
rm -rf node_modules
npm install
expo start -c
```

### "Module not found"
```bash
npm install
```

### Simulator not opening
- ✅ Xcode installed (iOS)
- ✅ Android Studio and emulator set up (Android)
- ✅ Try `expo start` and use Expo Go app instead

## Next Steps

Once your app is running:

1. **Explore Features**: Try all screens and features
2. **Customize Theme**: Edit `src/styles/theme.js`
3. **Add New Screens**: Follow pattern in `src/screens/`
4. **Connect Real APIs**: Update backend endpoints
5. **Build for Production**: See `mobile/README.md` for build instructions

## Need Help?

- 📖 Full documentation: `mobile/README.md`
- 🐛 Issues: Check GitHub issues
- 💬 Backend API: See main `README.md`

## What's Included

✅ **Authentication**
- Splash screen with auto-navigation
- Beautiful onboarding flow
- Profile creation and login

✅ **Core Features**
- Match discovery with scores
- Chat with matches
- Personalized recommendations
- Profile management

✅ **UI/UX**
- Dark theme design
- Smooth animations
- Pull-to-refresh
- Loading states
- Empty states

✅ **Technical**
- React Navigation
- Context API for state
- AsyncStorage for persistence
- Image picker support
- Cross-platform (iOS & Android)

## Production Deployment

For building and deploying to App Store and Play Store, see:
- `mobile/README.md` - Full build instructions
- [Expo EAS Build](https://docs.expo.dev/build/introduction/)

---

**You're all set! 🎉 Happy coding!** 🎬❤️
