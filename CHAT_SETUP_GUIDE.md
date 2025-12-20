# Chat Setup Guide - Firebase & Stream Chat Integration

This guide will walk you through setting up Firebase Authentication and Stream Chat API to make the chat feature fully functional.

## Prerequisites

- Node.js and npm installed
- A Google account (for Firebase)
- A Stream account (free tier available)

## Step 1: Firebase Setup

### 1.1 Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: **"Netflix and Chill"**
4. Enable or disable Google Analytics (optional)
5. Click **"Create project"** and wait for it to be created

### 1.2 Enable Firebase Authentication

1. In your Firebase project, click **"Authentication"** in the left sidebar
2. Click **"Get started"**
3. Navigate to the **"Sign-in method"** tab
4. Enable the following methods:
   - **Email/Password** - Click and toggle "Enable"
   - **Google** (optional but recommended)
   - **Anonymous** (optional for guest users)
5. Click **"Save"**

### 1.3 Get Firebase Configuration

1. In Firebase Console, click the **gear icon** (⚙️) next to "Project Overview"
2. Select **"Project settings"**
3. Scroll down to **"Your apps"** section
4. Click the **Web icon** (`</>`) to add a web app
5. Register your app with nickname: **"Netflix and Chill Web"**
6. Copy the Firebase configuration values:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123..."
};
```

7. Add these values to your `.env` file:

```env
FIREBASE_API_KEY=AIza...
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abc123...
```

### 1.4 Configure Authorized Domains

1. In Firebase Console, go to **Authentication** > **Settings** > **Authorized domains**
2. Add your domain(s):
   - For local development: `localhost`
   - For production: `yourdomain.com`

## Step 2: Stream Chat Setup

### 2.1 Create a Stream Account

1. Go to [Stream Dashboard](https://getstream.io/)
2. Click **"Sign up"** or **"Get started for free"**
3. Create an account (free tier includes 25 monthly active users)
4. Verify your email address

### 2.2 Create a Chat App

1. In the Stream Dashboard, click **"Create App"**
2. Choose **"Chat"** as the product
3. Enter app name: **"Netflix and Chill Chat"**
4. Select a region closest to your users (e.g., US East, EU West)
5. Click **"Create App"**

### 2.3 Get Stream API Credentials

1. In your Stream app dashboard, you'll see:
   - **App ID** (also called Stream App ID)
   - **API Key**
   - **API Secret**

2. Copy these values and add them to your `.env` file:

```env
STREAM_APP_ID=your_app_id_here
STREAM_API_KEY=your_api_key_here
STREAM_API_SECRET=your_api_secret_here
```

⚠️ **Important**: Keep your API Secret secure! Never commit it to version control or expose it in client-side code.

### 2.4 Configure Stream Chat Settings (Optional)

1. In Stream Dashboard, go to **App Settings**
2. Configure the following (recommended):
   - **Enable Push Notifications** (for mobile apps later)
   - **Enable Webhooks** (for server-side notifications)
   - **Message Retention**: Set according to your needs
   - **Rate Limiting**: Keep default settings or adjust

## Step 3: TMDB API Key (Required)

The app also requires TMDB API for movie/TV show data:

1. Go to [TMDB Website](https://www.themoviedb.org/)
2. Create a free account
3. Go to **Settings** > **API**
4. Request an API Key (choose "Developer" option)
5. Fill in application details
6. Copy your API Key and add to `.env`:

```env
TMDB_API_KEY=your_tmdb_api_key_here
```

## Step 4: Verify Your .env File

Your `.env` file should now look like this:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
DB_TYPE=file

# TMDB API (Required)
TMDB_API_KEY=your_actual_tmdb_key

# Firebase Authentication
FIREBASE_API_KEY=your_actual_firebase_key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abc123

# Stream Chat
STREAM_API_KEY=your_actual_stream_key
STREAM_API_SECRET=your_actual_stream_secret
STREAM_APP_ID=your_actual_stream_app_id

# JWT Secret
JWT_SECRET=change_this_to_a_random_string
```

## Step 5: Start the Application

1. Install dependencies (if you haven't already):
```bash
npm install
```

2. Seed test users (optional):
```bash
npm run seed
```

3. Start the server:
```bash
npm start
```

4. Open your browser to `http://localhost:3000`

## Features Enabled

With Firebase and Stream Chat configured, you now have:

✅ **User Authentication**
- Email/password login
- Google Sign-in (if enabled)
- Secure session management

✅ **Real-time Chat**
- Send and receive messages instantly
- Online/offline status
- Typing indicators
- Read receipts
- Message history

✅ **Match Persistence**
- Matches from the match page are automatically saved
- Chat page loads your saved matches
- Filter matches in chat sidebar
- Quick navigation between conversations

## Troubleshooting

### Firebase Issues

**Problem**: "Firebase: Error (auth/configuration-not-found)"
- **Solution**: Check that all Firebase environment variables are set correctly in `.env`

**Problem**: "Firebase: Error (auth/unauthorized-domain)"
- **Solution**: Add your domain to Firebase Console > Authentication > Settings > Authorized domains

### Stream Chat Issues

**Problem**: "API key is invalid"
- **Solution**: Verify you copied the API key correctly from Stream Dashboard

**Problem**: "Authentication failed"
- **Solution**: Ensure API Secret is correct and not exposed in client-side code

**Problem**: Chat messages not appearing
- **Solution**: Check browser console for errors. Verify Stream credentials are loaded correctly.

### General Issues

**Problem**: `.env` file not being read
- **Solution**: Ensure `.env` is in the root directory and restart the server

**Problem**: CORS errors in browser
- **Solution**: Check that your frontend URL is in the CORS_ORIGINS environment variable

## Security Best Practices

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Use environment variables for all secrets**
3. **Rotate API keys regularly** in production
4. **Use HTTPS in production**
5. **Keep dependencies updated**: `npm audit fix`
6. **Use different keys** for development and production

## Free Tier Limits

### Firebase
- **Authentication**: 10,000 email/password auth per month (free)
- **Storage**: 1 GB (free)
- **Generous free tier** for most features

### Stream Chat
- **Free Tier**: 25 monthly active users
- **Message History**: Last 14 days
- **Upgrade** for more users and features

### TMDB API
- **Free Tier**: 40 requests per 10 seconds
- Sufficient for most use cases

## Next Steps

1. Customize chat UI in `frontend/chat.html`
2. Add push notifications for new messages
3. Implement typing indicators
4. Add file/image sharing in chat
5. Set up production environment with real domain

## Support

For issues:
- Check [Firebase Documentation](https://firebase.google.com/docs)
- Check [Stream Chat Documentation](https://getstream.io/chat/docs/)
- Check [TMDB API Documentation](https://developers.themoviedb.org/3)
- Open an issue on GitHub

---

**Happy Chatting! 💬**
