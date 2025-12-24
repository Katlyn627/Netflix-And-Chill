# Quick Start - Chat Feature Setup

This is a quick 5-minute guide to get the chat feature working. For detailed setup, see [CHAT_SETUP_GUIDE.md](CHAT_SETUP_GUIDE.md).

## TL;DR - Get Started Fast

### Step 1: Create Environment File (30 seconds)

```bash
cp .env.sample backend/.env
```

### Step 2: Get TMDB API Key (2 minutes) - **REQUIRED**

1. Go to https://www.themoviedb.org/signup
2. Create account → Settings → API → Request API Key
3. Choose "Developer" → Fill form → Copy API key
4. Add to `.env`:
   ```
   TMDB_API_KEY=your_api_key_here
   ```

### Step 3: Install & Run (1 minute)

```bash
npm install
npm run seed    # Optional: adds 100 test users
npm start       # Starts on http://localhost:3000
```

🎉 **Done!** Chat works with fallback storage (no Firebase/Stream needed for basic functionality).

---

## Optional: Enable Real-Time Chat Features

To enable Firebase Auth and Stream Chat (real-time messaging, typing indicators, etc.):

### Firebase (5 minutes)

1. Go to https://console.firebase.google.com/
2. Create project → Add web app
3. Copy config values to `.env`:
   ```
   FIREBASE_API_KEY=your_key
   FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=123456789
   FIREBASE_APP_ID=1:123456789:web:abc123
   ```

### Stream Chat (5 minutes)

1. Go to https://getstream.io/ → Sign up
2. Create Chat app
3. Copy credentials to `.env`:
   ```
   STREAM_API_KEY=your_api_key
   STREAM_API_SECRET=your_api_secret
   STREAM_APP_ID=your_app_id
   ```

### Restart Server

```bash
npm start
```

---

## How It Works

### Match Persistence ✅

- **Finding Matches**: When you click "Find Matches" on the matches page, they're automatically saved to the database
- **Chat Page**: Automatically loads your saved matches from match history
- **Filtering**: Apply filters on matches page or chat page - both use shared filter settings
- **Sync**: Changes on matches page are immediately available in chat

### Chat Storage Options 📦

The app uses **intelligent fallback**:

1. **With Stream Chat configured**: Real-time messaging with typing indicators, read receipts, online status
2. **Without Stream Chat**: Uses local database storage (still fully functional)

### Authentication Options 🔐

1. **With Firebase configured**: Google Sign-in, email/password, secure session management
2. **Without Firebase**: Uses simple local authentication (good for development)

---

## Test the Features

### 1. Test Match Persistence

```bash
# Open in browser: http://localhost:3000
# 1. Login with test user: email@example.com / password123
# 2. Go to Matches page → Click "Find Matches"
# 3. Go to Chat page → See your matches loaded automatically
```

### 2. Test Chat

```bash
# In Chat page:
# 1. Click on a match from the sidebar
# 2. Type a message and send
# 3. Messages are saved (even without Stream Chat)
```

### 3. Test Filters

```bash
# On Matches or Chat page:
# 1. Click "Filters" button
# 2. Adjust age, distance, gender preferences
# 3. Apply filters
# 4. Filters are shared across both pages
```

---

## Troubleshooting

### "No matches found"

- Make sure you've added movies/TV shows to your watch history
- Try running `npm run seed` to create test users with watch history
- Lower the minimum match score filter

### Chat messages not showing

- Check browser console for errors
- Verify both users exist in the database
- Try refreshing the page

### Firebase/Stream Chat not working

- Check `.env` file has correct values
- Look for warnings in terminal when starting server
- See detailed setup in [CHAT_SETUP_GUIDE.md](CHAT_SETUP_GUIDE.md)

---

## What's Next?

- 📖 **Detailed Setup**: See [CHAT_SETUP_GUIDE.md](CHAT_SETUP_GUIDE.md)
- 🔑 **All API Keys**: See [API_KEYS_GUIDE.md](API_KEYS_GUIDE.md)
- 📋 **Full Documentation**: See [README.md](README.md)

---

## Features Summary

✅ **Match Finding & Saving**
- Find matches based on watch history
- Automatically saves matches to database
- Persistent across sessions

✅ **Chat Interface**
- Loads saved matches in sidebar
- Real-time messaging (with Stream) or stored messages (without)
- Filter matches by various criteria
- Direct links from matches to chat

✅ **Shared Filters**
- Set filters once, use everywhere
- Persists across page navigation
- Apply to both matches and chat pages

✅ **Flexible Integration**
- Works without any API keys (basic mode)
- Add TMDB for movie data
- Add Firebase for authentication
- Add Stream for real-time chat
- Each feature is optional and independent

---

**Happy Chatting! 💬**

Need help? Check the detailed guides or open an issue on GitHub.
