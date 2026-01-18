# Netflix and Chill - API Keys & Integration Guide

This guide will walk you through setting up all the API keys and external services needed to make the Netflix and Chill app fully functional.

## Table of Contents
1. [Essential APIs](#essential-apis)
2. [API Marketplace Integration](#api-marketplace-integration)
3. [Authentication Services](#authentication-services)
4. [Chat & Messaging](#chat--messaging)
5. [Cloud Storage & Hosting](#cloud-storage--hosting)
6. [Analytics](#analytics)
7. [Email Services](#email-services)
8. [Database Setup](#database-setup)

---

## Essential APIs

### 1. TMDB (The Movie Database) API - **REQUIRED**

**Purpose:** Fetch movie/TV show data, posters, details, genres, and recommendations.

**Setup Steps:**
1. Go to [TMDB Website](https://www.themoviedb.org/)
2. Create a free account or login
3. Navigate to **Settings** > **API** section
4. Click **"Request an API Key"**
5. Select **"Developer"** option
6. Fill in the application details:
   - **Application Name:** Netflix and Chill
   - **Application URL:** http://localhost:3000 (or your domain)
   - **Application Summary:** Dating app based on streaming preferences
7. Accept the terms and submit
8. Copy your **API Key (v3 auth)**
9. Add to `.env` file:
   ```
   TMDB_API_KEY=your_api_key_here
   ```

**Cost:** FREE (rate limit: 40 requests per 10 seconds)

**Documentation:** https://developers.themoviedb.org/3/getting-started/introduction

---

### 2. Watchmode API - **OPTIONAL** (Recommended)

**Purpose:** Get streaming platform availability data - shows which services (Netflix, Hulu, Disney+, etc.) have each movie/show available.

**Setup Steps:**
1. Go to [Watchmode API Website](https://api.watchmode.com/)
2. Sign up for a free account
3. Verify your email address
4. Navigate to your **Dashboard**
5. Copy your **API Key**
6. Add to `.env` file:
   ```
   WATCHMODE_API_KEY=your_watchmode_api_key_here
   ```

**Cost:** FREE (1,000 requests per day)

**Features:**
- Shows which streaming platforms have each movie/show
- Displays subscription, rental, and purchase options
- Supports multiple regions (US, UK, CA, etc.)
- Updates daily with latest streaming availability

**Documentation:** https://api.watchmode.com/docs/

**Note:** This feature is optional. If not configured, the app will still work but won't show streaming platform information on movie cards.

---

## API Marketplace Integration

### RapidAPI - **OPTIONAL**

**Purpose:** Integrate with RapidAPI marketplace for two-way API integration:
- **Server Mode**: Publish and monetize your API on RapidAPI marketplace
- **Client Mode**: Access thousands of external APIs through standardized authentication

#### What is RapidAPI?

RapidAPI is the world's largest API marketplace, providing:
- Centralized access to 40,000+ APIs
- Standardized authentication with `X-RapidAPI-Key` headers
- Built-in rate limiting and usage analytics
- API monetization capabilities
- Easy integration with consistent patterns

#### Server Mode: Publishing Your API

If you want to publish the Netflix and Chill API on RapidAPI marketplace:

**Setup Steps:**
1. Go to [RapidAPI Hub](https://rapidapi.com/)
2. Create a free account or login
3. Navigate to **"My APIs"** > **"Add New API"**
4. Fill in your API details:
   - **API Name:** Netflix and Chill API
   - **Description:** Dating app API that matches users based on streaming preferences
   - **Category:** Entertainment
   - **Base URL:** Your server URL (e.g., https://yourapp.com)
5. Configure endpoints and documentation
6. Enable API key authentication
7. Copy the generated API keys that clients will use
8. Add to `.env` file:
   ```
   RAPIDAPI_ENABLED=true
   RAPIDAPI_API_KEYS=key1_from_rapidapi,key2_from_rapidapi,key3_from_rapidapi
   RAPIDAPI_VALIDATE_HOST=true
   RAPIDAPI_EXPECTED_HOST=your-api-name.p.rapidapi.com
   ```

**Features:**
- Automatic API key validation on all `/api/*` endpoints
- Rate limiting and usage tracking
- API monetization with subscription plans
- Developer portal and documentation
- Analytics dashboard

#### Client Mode: Consuming External APIs

If you want to use external APIs from RapidAPI marketplace (e.g., alternative movie databases, recommendation engines):

**Setup Steps:**
1. Go to [RapidAPI Hub](https://rapidapi.com/)
2. Browse and find the API you want to use
3. Click **"Subscribe to Test"** or choose a pricing plan
4. Go to your **Dashboard** > **Apps** > **Default Application**
5. Copy your **Application Key**
6. Note the **API Host** (shown in the API's code snippets as `X-RapidAPI-Host`)
7. Add to `.env` file:
   ```
   RAPIDAPI_CLIENT_KEY=your_rapidapi_key_here
   RAPIDAPI_CLIENT_HOST=api-host.p.rapidapi.com
   ```

**Usage Example:**

```javascript
const rapidAPIService = require('./backend/services/rapidAPIService');

// Make a request to an external RapidAPI API
const data = await rapidAPIService.get(
  'https://api-host.p.rapidapi.com/endpoint',
  { param1: 'value1' }
);
```

**Cost:** FREE tier available (varies by API)

**Benefits:**
- No need to manage individual API keys and authentication methods
- Consistent request/response patterns across all APIs
- Automatic retry logic and error handling
- Usage tracking and billing consolidation

**Documentation:** 
- https://docs.rapidapi.com/
- https://docs.rapidapi.com/docs/keys-and-key-rotation

**Security Notes:**
- Never commit API keys to version control
- Store keys in environment variables
- Rotate keys regularly using RapidAPI dashboard
- Monitor usage for suspicious activity
- Use different keys for development and production

---

## Authentication Services

### Option 1: Firebase Authentication (Recommended)

**Purpose:** User authentication with Google, Apple, Facebook, Email/Password login.

**Setup Steps:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add Project"** or select existing project
3. Enter project name: **"Netflix and Chill"**
4. Enable **Google Analytics** (optional)
5. Once created, go to **Project Settings** (gear icon)
6. Under **"General"** tab, scroll to **"Your apps"**
7. Click **Web icon (</>) **to add a web app
8. Register your app with a nickname
9. Copy the configuration values:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "your-project-id.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project-id.appspot.com",
     messagingSenderId: "YOUR_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```
10. Add to `.env` file:
    ```
    FIREBASE_API_KEY=YOUR_API_KEY
    FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
    FIREBASE_PROJECT_ID=your-project-id
    FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
    FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
    FIREBASE_APP_ID=YOUR_APP_ID
    ```
11. Enable authentication methods:
    - Go to **Authentication** > **Sign-in method**
    - Enable: Email/Password, Google, Apple, Facebook

**Cost:** FREE (Generous free tier)

**Documentation:** https://firebase.google.com/docs/auth

---

### Option 2: Auth0

**Purpose:** Secure authentication and authorization platform.

**Setup Steps:**
1. Go to [Auth0](https://auth0.com/)
2. Sign up for a free account
3. Create a new **Application**
4. Choose **"Single Page Web Applications"**
5. Configure settings:
   - **Allowed Callback URLs:** `http://localhost:3000/callback`
   - **Allowed Logout URLs:** `http://localhost:3000`
   - **Allowed Web Origins:** `http://localhost:3000`
6. Go to **Settings** tab
7. Copy credentials:
   ```
   AUTH0_DOMAIN=your-tenant.auth0.com
   AUTH0_CLIENT_ID=your_client_id
   AUTH0_CLIENT_SECRET=your_client_secret
   ```

**Cost:** FREE (up to 7,000 active users)

**Documentation:** https://auth0.com/docs

---

## Chat & Messaging

### Option 1: SendBird (Recommended)

**Purpose:** Real-time in-app chat between matched users.

**Setup Steps:**
1. Go to [SendBird Dashboard](https://dashboard.sendbird.com/)
2. Sign up for a free account
3. Create a new **Application**
4. Name it: **"Netflix and Chill"**
5. Go to **Settings** > **General**
6. Copy your credentials:
   ```
   SENDBIRD_APP_ID=your_app_id
   SENDBIRD_API_TOKEN=your_api_token
   ```
7. Configure features:
   - Enable **Open Channels** for group watch parties
   - Enable **Group Channels** for private chats
   - Set up **push notifications**

**Cost:** FREE (up to 5,000 MAU)

**Documentation:** https://sendbird.com/docs

---

### Option 2: Twilio

**Purpose:** SMS notifications and voice calls.

**Setup Steps:**
1. Go to [Twilio Console](https://www.twilio.com/console)
2. Create an account
3. Get a **Twilio Phone Number**:
   - Go to **Phone Numbers** > **Buy a Number**
   - Choose a number with SMS capabilities
4. Copy credentials:
   ```
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=+1234567890
   ```

**Cost:** Pay-as-you-go (FREE trial credit)

**Documentation:** https://www.twilio.com/docs

---

### Option 3: Stream Chat

**Purpose:** Scalable chat infrastructure.

**Setup Steps:**
1. Go to [Stream Dashboard](https://getstream.io/)
2. Sign up and create new app
3. Copy credentials from **Dashboard**:
   ```
   STREAM_API_KEY=your_api_key
   STREAM_API_SECRET=your_api_secret
   STREAM_APP_ID=your_app_id
   ```

**Cost:** FREE (up to 25 MAU)

**Documentation:** https://getstream.io/chat/docs/

---

## Cloud Storage & Hosting

### Option 1: AWS S3 (Profile Pictures & Media)

**Purpose:** Store user profile pictures and media files.

**Setup Steps:**
1. Go to [AWS Console](https://console.aws.amazon.com/)
2. Create an AWS account
3. Navigate to **IAM** > **Users** > **Add User**
4. Create user with **Programmatic access**
5. Attach policy: **AmazonS3FullAccess**
6. Download **Access Keys**:
   ```
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_REGION=us-east-1
   ```
7. Create S3 Bucket:
   - Go to **S3** > **Create Bucket**
   - Name: `netflix-and-chill-media`
   - Enable **Public Access** for profile pictures
   - Configure CORS settings
   ```
   AWS_S3_BUCKET=netflix-and-chill-media
   ```

**Cost:** FREE tier (5GB storage, 20,000 GET requests/month)

**Documentation:** https://docs.aws.amazon.com/s3/

---

### Option 2: Google Cloud Storage

**Setup Steps:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project
3. Enable **Cloud Storage API**
4. Create **Service Account**:
   - IAM & Admin > Service Accounts
   - Create account with Storage Admin role
5. Generate JSON key
6. Add to `.env`:
   ```
   GCP_PROJECT_ID=your-project-id
   GCP_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
   GCP_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   GCP_BUCKET=your-bucket-name
   ```

**Cost:** FREE tier (5GB storage)

**Documentation:** https://cloud.google.com/storage/docs

---

## Analytics

### Google Analytics

**Purpose:** Track user behavior, app usage, and engagement metrics.

**Setup Steps:**
1. Go to [Google Analytics](https://analytics.google.com/)
2. Create an account
3. Create a new **Property**
4. Select **Web** platform
5. Enter website details
6. Copy **Measurement ID** (format: G-XXXXXXXXXX)
7. Add to `.env`:
   ```
   GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
   ```

**Cost:** FREE

**Documentation:** https://developers.google.com/analytics

---

### Mixpanel

**Purpose:** Advanced product analytics and user insights.

**Setup Steps:**
1. Go to [Mixpanel](https://mixpanel.com/)
2. Sign up for free account
3. Create new project: **"Netflix and Chill"**
4. Copy **Project Token** from Settings
5. Add to `.env`:
   ```
   MIXPANEL_TOKEN=your_project_token
   ```

**Cost:** FREE (up to 100,000 monthly tracked users)

**Documentation:** https://developer.mixpanel.com/docs

---

## Email Services

### SendGrid (Email Notifications)

**Purpose:** Send welcome emails, password resets, match notifications.

**Setup Steps:**
1. Go to [SendGrid](https://app.sendgrid.com/)
2. Create an account
3. Navigate to **Settings** > **API Keys**
4. Click **"Create API Key"**
5. Choose **Full Access** permission
6. Copy the API key (shown only once!)
7. Add to `.env`:
   ```
   SENDGRID_API_KEY=your_api_key
   SENDGRID_FROM_EMAIL=noreply@yourapp.com
   ```
8. **Verify sender email**:
   - Settings > Sender Authentication
   - Verify your sender email address

**Cost:** FREE (100 emails/day)

**Documentation:** https://docs.sendgrid.com/

---

## Database Setup

### Option 1: MongoDB Atlas (Recommended)

**Purpose:** NoSQL database for flexible user data storage.

**Setup Steps:**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for free account
3. Create a **FREE Cluster**:
   - Choose M0 Sandbox (FREE)
   - Select cloud provider (AWS recommended)
   - Choose region closest to your users
4. Wait for cluster to be created (2-3 minutes)
5. **Set up Database Access**:
   - Database Access > Add New Database User
   - Choose **Password** authentication
   - Username: `netflixchill`
   - Password: Generate secure password
   - Database User Privileges: **Read and write to any database**
6. **Set up Network Access**:
   - Network Access > Add IP Address
   - Click **"Allow Access from Anywhere"** (for development)
   - Or add your specific IP address
7. **Get Connection String**:
   - Clusters > Connect
   - Choose **"Connect your application"**
   - Select **Node.js** driver
   - Copy connection string
   - Replace `<password>` with your actual password
8. Add to `.env`:
   ```
   DB_TYPE=mongodb
   MONGODB_URI=mongodb+srv://netflixchill:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/netflix-and-chill?retryWrites=true&w=majority
   ```

**Cost:** FREE (512MB storage)

**Documentation:** https://docs.mongodb.com/

---

### Option 2: PostgreSQL (Heroku/Supabase)

**Purpose:** SQL database for structured data.

**Heroku Setup:**
1. Install Heroku CLI
2. Create Heroku app: `heroku create netflix-and-chill`
3. Add PostgreSQL addon: `heroku addons:create heroku-postgresql:mini`
4. Get connection string: `heroku config:get DATABASE_URL`
5. Add to `.env`:
   ```
   DB_TYPE=postgresql
   POSTGRES_URI=postgres://username:password@host:5432/database
   ```

**Supabase Setup:**
1. Go to [Supabase](https://supabase.com/)
2. Create new project
3. Get connection string from Settings > Database
4. Add to `.env`

**Cost:** FREE tier available on both platforms

---

## Quick Start Checklist

### Minimum Required Setup (to get started):
- [ ] **TMDB API Key** - For movie data (REQUIRED)
- [ ] **Database** - Choose one: File-based (default), MongoDB, or PostgreSQL
- [ ] **JWT Secret** - Generate with: `openssl rand -base64 32`

### Recommended for Full Functionality:
- [ ] **Watchmode API Key** - For streaming platform availability (OPTIONAL)
- [ ] **Firebase Auth** or **Auth0** - User authentication
- [ ] **SendBird** or **Twilio** - Real-time chat
- [ ] **AWS S3** or **GCP Storage** - Profile picture uploads
- [ ] **SendGrid** - Email notifications
- [ ] **Google Analytics** - User tracking

### Optional (Future Features):
- [ ] **Mixpanel** - Advanced analytics
- [ ] **Sentry** - Error tracking
- [ ] **Stripe** - Payment processing (premium features)

---

## Environment File Setup

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file and fill in your API keys**

3. **Verify your setup:**
   ```bash
   npm start
   ```

4. **Test the APIs:**
   - Visit `http://localhost:3000/health`
   - Should see: `{"status":"OK","message":"Netflix and Chill API is running"}`

---

## Security Best Practices

1. **Never commit `.env` file to version control**
   - Already added to `.gitignore`

2. **Use different keys for development and production**

3. **Rotate API keys regularly**

4. **Enable rate limiting on all APIs**

5. **Use HTTPS in production**

6. **Validate and sanitize all user inputs**

7. **Keep dependencies updated:**
   ```bash
   npm audit fix
   ```

---

## Troubleshooting

### TMDB API Not Working
- Verify API key is correct
- Check rate limits (40 requests per 10 seconds)
- Ensure API key is activated (may take a few minutes)

### Firebase Authentication Issues
- Verify Firebase config values
- Check that authentication methods are enabled in Firebase Console
- Ensure domains are whitelisted in Firebase

### Database Connection Errors
- MongoDB: Check connection string format and password encoding
- PostgreSQL: Verify database exists and credentials are correct
- Check network/firewall settings

### Chat Not Working
- Verify chat service credentials
- Check that websocket connections are allowed
- Ensure CORS is configured properly

---

## Support

For issues or questions:
- Check the [README.md](README.md)
- Review API provider documentation
- Open an issue on GitHub

---

## Resources

- [TMDB API Docs](https://developers.themoviedb.org/3)
- [Firebase Docs](https://firebase.google.com/docs)
- [SendBird Docs](https://sendbird.com/docs)
- [AWS S3 Docs](https://docs.aws.amazon.com/s3/)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)

---

**Happy Coding! 🎬❤️**
