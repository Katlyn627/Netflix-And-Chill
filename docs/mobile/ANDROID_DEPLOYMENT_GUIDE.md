# Android Deployment Guide - Netflix & Chill Mobile App

This comprehensive guide will walk you through deploying and opening the Netflix & Chill app on your Android phone. We'll cover multiple methods from easiest (using Expo Go) to advanced (building your own APK).

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Method 1: Using Expo Go (Easiest - Recommended)](#method-1-using-expo-go-easiest---recommended)
3. [Method 2: Using Android Emulator](#method-2-using-android-emulator)
4. [Method 3: Building and Installing APK](#method-3-building-and-installing-apk)
5. [Backend Configuration](#backend-configuration)
6. [Testing the App](#testing-the-app)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have:

### Required for All Methods:
- ✅ **Android phone** with Android 5.0+ (API level 21 or higher)
- ✅ **Computer** (Windows, Mac, or Linux) with:
  - Node.js 16+ installed ([Download here](https://nodejs.org/))
  - Git installed ([Download here](https://git-scm.com/))
- ✅ **WiFi network** that both your computer and phone can connect to
- ✅ **TMDB API Key** (free) - [Get it here](https://www.themoviedb.org/settings/api)

### Additional for Emulator Method:
- ✅ **Android Studio** installed ([Download here](https://developer.android.com/studio))
- ✅ At least 8GB RAM and 20GB free disk space

### Additional for APK Method:
- ✅ **EAS CLI** (will be installed in the guide)
- ✅ **Expo account** (free) - [Sign up here](https://expo.dev/)

---

## Method 1: Using Expo Go (Easiest - Recommended)

This is the **fastest and easiest method** to get the app running on your Android phone. No building required!

### Step 1: Clone the Repository

Open a terminal/command prompt on your computer:

```bash
# Clone the repository
git clone https://github.com/Katlyn627/Netflix-And-Chill.git

# Navigate to the project directory
cd Netflix-And-Chill
```

### Step 2: Set Up the Backend

The mobile app needs a backend server to fetch data. Let's set it up:

```bash
# Install backend dependencies
cd backend
npm install

# Configure environment variables
cp ../.env.sample .env
```

Now edit the `backend/.env` file and add your TMDB API key:

```bash
# Open the file in your text editor (use notepad on Windows, nano on Linux/Mac)
# Windows:
notepad .env

# macOS:
open -e .env

# Linux:
nano .env
```

Add this line with your actual TMDB API key:
```
TMDB_API_KEY=your_tmdb_api_key_here
```

Save and close the file.

### Step 3: Start the Backend Server

```bash
# Make sure you're in the backend directory
npm start
```

You should see:
```
Server running on port 3000
Database type: file
```

**Keep this terminal window open!** The backend needs to stay running.

### Step 4: Install Mobile App Dependencies

Open a **new terminal window** (keep the backend running in the first one):

```bash
# Navigate to mobile directory from the root
cd Netflix-And-Chill/mobile

# Install dependencies
npm install
```

This will take 2-3 minutes to install all required packages.

### Step 5: Configure API Endpoint for Physical Device

Since you're testing on a physical device, you need to use your computer's local IP address instead of `localhost`.

**Find your computer's IP address:**

**On Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your active network adapter (e.g., `192.168.1.100`)

**On macOS/Linux:**
```bash
ifconfig | grep "inet "
# or
ip addr show
```
Look for an IP address like `192.168.1.100` (not 127.0.0.1)

**Update the API configuration:**

Edit `mobile/src/services/api.js`:

```bash
# Windows:
notepad src/services/api.js

# macOS:
open -e src/services/api.js

# Linux:
nano src/services/api.js
```

Find this line (around line 5-10):
```javascript
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api'
  : Constants.expoConfig?.extra?.apiUrl || 'https://your-production-api.herokuapp.com/api';
```

Replace `localhost` with your computer's IP address:
```javascript
const API_BASE_URL = __DEV__ 
  ? 'http://192.168.1.100:3000/api'  // Replace with YOUR IP address
  : Constants.expoConfig?.extra?.apiUrl || 'https://your-production-api.herokuapp.com/api';
```

Save the file.

### Step 6: Install Expo Go on Your Android Phone

1. Open **Google Play Store** on your Android phone
2. Search for **"Expo Go"**
3. Install the app (it's free)
4. Open Expo Go once installed

### Step 7: Start the Expo Development Server

Back in your terminal (in the mobile directory):

```bash
npm start
```

You'll see:
- A QR code in the terminal
- A message saying "Metro waiting on..."
- The Expo Dev Tools may open in your browser

### Step 8: Connect Your Phone to the App

**Make sure your phone and computer are on the same WiFi network!**

**Option A: Scan QR Code (Recommended)**
1. Open **Expo Go** app on your phone
2. Tap **"Scan QR code"**
3. Point your camera at the QR code in the terminal
4. The app will load automatically

**Option B: Manual Connection**
1. Open **Expo Go** app on your phone
2. Look at the terminal for the URL (e.g., `exp://192.168.1.100:8081`)
3. In Expo Go, tap **"Enter URL manually"**
4. Type the URL shown in your terminal
5. Tap **"Connect"**

### Step 9: Wait for App to Load

The first time loading might take 1-2 minutes as it bundles the JavaScript code. You'll see:
1. "Building JavaScript bundle" progress bar
2. Netflix & Chill splash screen
3. Onboarding flow (you can skip this)
4. Login/Profile creation screen

### 🎉 Success!

Your app is now running on your Android phone! You can:
- Create a profile
- Browse matches
- View recommendations
- Chat with matches
- And more!

**Note:** Any code changes you make will automatically reload on your phone (Fast Refresh).

---

## Method 2: Using Android Emulator

If you don't have an Android phone or prefer testing on an emulator, follow these steps.

### Step 1: Install Android Studio

1. Download Android Studio from https://developer.android.com/studio
2. Run the installer and follow the setup wizard
3. During setup, make sure to install:
   - Android SDK
   - Android SDK Platform
   - Android Virtual Device (AVD)

### Step 2: Set Up an Android Virtual Device (AVD)

1. Open **Android Studio**
2. Click **"More Actions"** → **"Virtual Device Manager"**
3. Click **"Create Device"**
4. Select a device (e.g., **Pixel 5**)
5. Click **"Next"**
6. Select a system image (e.g., **Android 13 (API 33)**)
   - If not downloaded, click "Download" next to it
7. Click **"Next"**, then **"Finish"**
8. Click the **▶️ Play button** to start the emulator

### Step 3: Set Up Backend and Mobile App

Follow **Steps 1-4** from Method 1 above (Clone repo, set up backend, install mobile dependencies).

### Step 4: Configure API Endpoint for Emulator

For Android emulator, use the special IP `10.0.2.2` which maps to your computer's `localhost`:

Edit `mobile/src/services/api.js`:

```javascript
const API_BASE_URL = __DEV__ 
  ? 'http://10.0.2.2:3000/api'  // Special IP for Android emulator
  : Constants.expoConfig?.extra?.apiUrl || 'https://your-production-api.herokuapp.com/api';
```

Save the file.

### Step 5: Run the App on Emulator

With the emulator running:

```bash
cd mobile
npm run android
```

This will:
1. Start the Expo development server
2. Open the app on the Android emulator
3. Load the app automatically

The app will open automatically on the emulator.

---

## Method 3: Building and Installing APK

This method creates a standalone APK file that you can install directly on any Android device without needing Expo Go.

### Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

### Step 2: Log in to Expo

```bash
eas login
```

If you don't have an Expo account, create one at https://expo.dev/signup (it's free).

### Step 3: Configure Your Build

```bash
cd mobile
eas build:configure
```

When prompted:
- Select **Android** as platform
- Choose **"apk"** for the build type (easier to install than AAB)

### Step 4: Build the APK

```bash
eas build --platform android --profile preview
```

This will:
1. Upload your code to Expo's servers
2. Build the APK in the cloud
3. Provide a download link when complete

**Note:** The build takes 10-20 minutes. You'll receive an email when it's done.

### Step 5: Download and Install APK

1. Once the build is complete, click the download link in your terminal or email
2. Transfer the APK to your Android phone via:
   - USB cable
   - Email attachment
   - Cloud storage (Google Drive, Dropbox)
   - Direct download on phone

3. On your Android phone:
   - Go to **Settings** → **Security**
   - Enable **"Install unknown apps"** for your file manager or browser
   - Open the APK file
   - Tap **"Install"**

4. Launch the app from your app drawer

### Step 6: Configure Backend URL

Since the APK is a standalone app, you need to configure the backend URL:

**Option A: Use a Public Backend**
Deploy your backend to a service like Heroku, AWS, or Railway, then rebuild the APK with the production URL.

**Option B: Use Local Network**
If your phone is on the same WiFi as your computer:
1. Before building, update `mobile/src/services/api.js` with your computer's IP:
   ```javascript
   const API_BASE_URL = 'http://192.168.1.100:3000/api';  // Your IP
   ```
2. Keep your backend server running on your computer
3. Rebuild the APK

---

## Backend Configuration

### Running the Backend

The mobile app requires the backend to be running. You have several options:

### Option 1: Local Backend (Development)

```bash
cd backend
npm start
```

- Simple and free
- Good for testing
- Requires computer to be on and backend running
- Phone must be on same network

### Option 2: Cloud Backend (Production)

Deploy your backend to a cloud service for 24/7 availability:

#### Deploy to Heroku (Easiest)

```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create app
heroku create netflix-chill-backend

# Set environment variables
heroku config:set TMDB_API_KEY=your_key_here

# Deploy
git push heroku main
```

See [docs/deployment/HEROKU.md](../deployment/HEROKU.md) for detailed instructions.

#### Other Options:
- **Railway**: https://railway.app/ (Free tier, very easy)
- **Render**: https://render.com/ (Free tier available)
- **AWS**: See [docs/deployment/AWS.md](../deployment/AWS.md)

Once deployed, update `mobile/src/services/api.js`:
```javascript
const API_BASE_URL = 'https://your-app.herokuapp.com/api';
```

---

## Testing the App

### Creating Your First Profile

1. **Launch the app**
2. **Complete onboarding** (or tap "Skip")
3. **Fill in profile details:**
   - Username (e.g., "MovieFan123")
   - Email
   - Age (must be 18+)
   - Location (e.g., "New York, NY")
   - Bio (optional)
4. **Tap "Create Profile"**

### Setting Up Your Profile

1. Go to **Profile** tab (bottom right)
2. **Add streaming services:**
   - Toggle on services you use (Netflix, Hulu, etc.)
3. **Select favorite genres:**
   - Pick 3-5 genres you enjoy
4. **Set binge-watching habits:**
   - Choose how many episodes you typically watch
5. **Tap "Save Changes"**

### Finding Matches

1. Go to **Matches** tab (bottom left)
2. Browse potential matches
3. View match scores and shared content
4. Tap ❤️ to send a like
5. Tap ⭐ to send a super like
6. Tap "Chat" to message a match

### Using Other Features

- **Swipe Tab**: Discover and rate movies
- **Discover Tab**: Get personalized recommendations
- **Quiz Tab**: Take compatibility quiz
- **Watch Tab**: Coordinate watch parties
- **Stats Tab**: View your swipe analytics

---

## Troubleshooting

### App Won't Connect to Backend

**Problem:** "Network Error" or "Cannot connect to server"

**Solutions:**

1. **Verify backend is running:**
   ```bash
   # Open http://localhost:3000 in your browser
   # You should see a response
   ```

2. **Check if phone and computer are on same WiFi:**
   - Both devices must be on the same network
   - Some public WiFi networks block device-to-device communication

3. **Verify IP address is correct:**
   - Re-check your computer's IP with `ipconfig` or `ifconfig`
   - Update `mobile/src/services/api.js` if it changed
   - Restart Expo dev server: Press `r` in the terminal

4. **Check firewall settings:**
   - Temporarily disable firewall on your computer
   - Add exception for port 3000 and 8081

5. **Use Android emulator instead:**
   - Follow Method 2 above
   - Emulator uses special IP `10.0.2.2`

### Expo Go App Won't Load / Shows Error

**Problem:** "Something went wrong" or QR code won't scan

**Solutions:**

1. **Clear Expo cache and restart:**
   ```bash
   cd mobile
   npx expo start -c
   # or if you have expo-cli installed globally:
   expo start -c
   ```

2. **Reinstall dependencies:**
   ```bash
   rm -rf node_modules
   npm install
   ```

3. **Update Expo Go app:**
   - Go to Play Store
   - Update Expo Go to latest version

4. **Update Expo packages:**
   ```bash
   npx expo install expo@latest
   ```

### App Loads But Shows Blank Screen

**Problem:** White/black screen after splash

**Solutions:**

1. **Check terminal for errors:**
   - Look for red error messages in the terminal

2. **Reload the app:**
   - Shake your phone
   - Tap "Reload" in the developer menu

3. **Check API configuration:**
   - Verify `src/services/api.js` has correct URL
   - Test backend URL in a browser

### Images/Photos Not Displaying

**Problem:** Profile pictures or movie posters don't show

**Solutions:**

1. **Check TMDB API key:**
   - Verify key is correct in `backend/.env`
   - Test the key at https://www.themoviedb.org/

2. **Check image permissions:**
   - Go to Settings → Apps → Expo Go → Permissions
   - Enable Storage permission

### Build Errors with EAS

**Problem:** `eas build` fails

**Solutions:**

1. **Check EAS account:**
   ```bash
   eas whoami
   ```

2. **Configure project:**
   ```bash
   eas build:configure
   ```

3. **Check expo/eas versions:**
   ```bash
   npm install expo@latest
   npm install -g eas-cli@latest
   ```

4. **Clear credentials:**
   ```bash
   eas credentials
   ```

### "Install Blocked" Error on Android

**Problem:** Can't install APK on phone

**Solutions:**

1. **Enable unknown sources:**
   - Settings → Security → Install unknown apps
   - Enable for your file manager or browser

2. **Check Android version:**
   - App requires Android 5.0+ (API 21+)
   - Check Settings → About Phone → Android version

3. **Use Play Protect:**
   - When installing, tap "More details"
   - Tap "Install anyway"

### App Crashes on Startup

**Problem:** App closes immediately after opening

**Solutions:**

1. **Check Android version compatibility:**
   - Need Android 5.0+ (API level 21+)

2. **Clear app data:**
   - Settings → Apps → Netflix & Chill → Storage
   - Clear cache and data
   - Restart app

3. **Reinstall the app:**
   - Uninstall completely
   - Reinstall from APK or Expo Go

### Performance Issues / App is Slow

**Problem:** App is laggy or slow to respond

**Solutions:**

1. **Enable Developer Mode:**
   - In Expo Go, shake phone
   - Enable "Fast Refresh"
   - Disable "Remote JS Debugging" (slower)

2. **Close other apps:**
   - Free up RAM
   - Close background apps

3. **Use production build:**
   - Development mode (Expo Go) is slower
   - Build APK for better performance

### Can't Scan QR Code

**Problem:** Camera won't scan the QR code

**Solutions:**

1. **Grant camera permissions:**
   - Settings → Apps → Expo Go → Permissions
   - Enable Camera

2. **Manual connection:**
   - Copy the URL from terminal (e.g., `exp://192.168.1.100:8081`)
   - In Expo Go, tap "Enter URL manually"
   - Paste the URL

3. **Increase brightness:**
   - Make sure screen brightness is high
   - Reduce distance between phone and screen

---

## Frequently Asked Questions

### Q: Do I need to pay for anything?
**A:** No! Everything is free:
- Expo Go app - Free
- TMDB API - Free tier (sufficient for testing)
- Backend hosting - Free tiers available (Heroku, Railway, Render)

### Q: How do I update the app after making code changes?
**A:** 
- **With Expo Go**: Changes auto-reload (Fast Refresh)
- **With APK**: Need to rebuild and reinstall the APK

### Q: Can I use the app without internet?
**A:** 
- App requires internet to fetch movie data and matches
- Local caching is implemented for better offline experience

### Q: Is this app available on Play Store?
**A:** 
- Not currently published
- You can build and install APK yourself
- Can submit to Play Store following [Expo's guide](https://docs.expo.dev/submit/android/)

### Q: Can I test on iOS instead?
**A:** 
- Yes! iOS setup is similar but requires macOS
- See [docs/quickstart/QUICKSTART-REACT-NATIVE.md](../quickstart/QUICKSTART-REACT-NATIVE.md)

### Q: My computer IP address keeps changing. What should I do?
**A:**
- Set a static IP in your router settings
- Or use a service like ngrok to create a public URL
- Or deploy backend to a cloud service (recommended)

### Q: How do I enable Dark Mode?
**A:** 
- The app uses dark theme by default
- Based on Netflix's design aesthetic

### Q: Can multiple users use the same backend?
**A:** 
- Yes! The backend supports multiple users
- Each user gets their own profile and data
- Great for testing with friends

---

## Next Steps

Once your app is running successfully:

1. **Customize the app:**
   - Edit `mobile/src/styles/theme.js` for colors/fonts
   - Modify screens in `mobile/src/screens/`

2. **Add real users:**
   - Share with friends to test matching
   - Or run `npm run seed` to generate test data

3. **Deploy backend to cloud:**
   - See [docs/deployment/HEROKU.md](../deployment/HEROKU.md)
   - Update API URL in mobile app

4. **Build production APK:**
   - Follow Method 3 above
   - Share APK with beta testers

5. **Publish to Play Store:**
   - Follow [Expo's submission guide](https://docs.expo.dev/submit/android/)
   - Create developer account ($25 one-time fee)

---

## Additional Resources

- **Main README**: [/README.md](../../README.md)
- **Mobile README**: [/mobile/README.md](../../mobile/README.md)
- **React Native Quickstart**: [docs/quickstart/QUICKSTART-REACT-NATIVE.md](../quickstart/QUICKSTART-REACT-NATIVE.md)
- **Backend API Documentation**: [/API.md](../../API.md)
- **Deployment Guides**: [docs/deployment/](../deployment/)
- **Expo Documentation**: https://docs.expo.dev/
- **React Native Docs**: https://reactnative.dev/

---

## Support

Need help? Here are your options:

1. **Check this troubleshooting guide** (above)
2. **Review existing documentation** (links above)
3. **Open an issue on GitHub** with:
   - What you're trying to do
   - What error you're seeing
   - Your environment (OS, Android version, etc.)
   - Steps you've already tried

---

**Happy Streaming! 🎬📱❤️**

*Built with React Native + Expo for the Netflix & Chill dating app*
