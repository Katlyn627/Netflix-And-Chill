# Auth0 Integration Setup Guide

This guide walks you through setting up Auth0 authentication for the Netflix and Chill app, including configuration for streaming service API keys.

## Table of Contents
1. [Auth0 Account Setup](#auth0-account-setup)
2. [Environment Configuration](#environment-configuration)
3. [Frontend Integration](#frontend-integration)
4. [Backend Integration](#backend-integration)
5. [Streaming Services API Keys Setup](#streaming-services-api-keys-setup)
6. [Testing the Integration](#testing-the-integration)

---

## Auth0 Account Setup

### Step 1: Create an Auth0 Account

1. Go to [Auth0 website](https://auth0.com/)
2. Click "Sign Up" and create a free account
3. Complete the registration process

### Step 2: Create a New Application

1. Log in to your [Auth0 Dashboard](https://manage.auth0.com/)
2. Navigate to **Applications** > **Applications** in the sidebar
3. Click **Create Application**
4. Name your application: "Netflix and Chill"
5. Choose **Single Page Web Applications**
6. Click **Create**

### Step 3: Configure Application Settings

1. In your application settings, find the following:
   - **Domain** (e.g., `your-tenant.auth0.com`)
   - **Client ID** (a long alphanumeric string)
   
2. Scroll down to **Application URIs** and configure:
   - **Allowed Callback URLs**: `http://localhost:3000/callback.html, https://your-production-domain.com/callback.html`
   - **Allowed Logout URLs**: `http://localhost:3000/login.html, https://your-production-domain.com/login.html`
   - **Allowed Web Origins**: `http://localhost:3000, https://your-production-domain.com`
   - **Allowed Origins (CORS)**: `http://localhost:3000, https://your-production-domain.com`

3. Scroll down and click **Save Changes**

### Step 4: Enable Refresh Tokens

1. Scroll to **Refresh Token Rotation** section
2. Enable **Rotation**
3. Enable **Reuse Interval**
4. Click **Save Changes**

### Step 5: Get Management API Access (Optional - for user metadata)

1. Go to **Applications** > **APIs** in the sidebar
2. Click on **Auth0 Management API**
3. Click on **Machine to Machine Applications** tab
4. Find your application and toggle it **ON**
5. Expand the application and select the following scopes:
   - `read:users`
   - `update:users`
   - `read:current_user`
   - `update:current_user_metadata`
6. Click **Update**

---

## Environment Configuration

### Step 1: Update .env File

Copy `.env.example` to `.env` and update the Auth0 section:

```bash
# ========================================
# Authentication Services
# ========================================

# Auth0 Configuration
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your_auth0_client_id_here
AUTH0_CLIENT_SECRET=your_auth0_client_secret_here
AUTH0_CALLBACK_URL=http://localhost:3000/callback.html
AUTH0_AUDIENCE=https://your-tenant.auth0.com/api/v2/

# JWT Secret for Token Generation
JWT_SECRET=generate_a_strong_random_secret_here
```

### Step 2: Generate JWT Secret

```bash
# On Linux/Mac:
openssl rand -base64 32

# On Windows (PowerShell):
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

### Step 3: Update Frontend Configuration

Create or update `frontend/src/config/auth0.config.js`:

```javascript
// Auth0 Configuration
window.AUTH0_DOMAIN = 'your-tenant.auth0.com';
window.AUTH0_CLIENT_ID = 'your_auth0_client_id_here';
window.AUTH0_AUDIENCE = 'https://your-tenant.auth0.com/api/v2/';
```

---

## Frontend Integration

### Step 1: Include Auth0 SDK

The Auth0 SPA SDK is already included in `callback.html`. Make sure it's included in other pages that need authentication:

```html
<!-- Auth0 SPA SDK -->
<script src="https://cdn.auth0.com/js/auth0-spa-js/2.0/auth0-spa-js.production.js"></script>

<!-- Auth0 Configuration -->
<script>
    window.AUTH0_DOMAIN = 'your-tenant.auth0.com';
    window.AUTH0_CLIENT_ID = 'your_auth0_client_id_here';
</script>
<script src="src/utils/auth0-config.js"></script>
```

### Step 2: Update Login Page

The login page has been updated to use Auth0. Users will be redirected to Auth0's Universal Login page.

### Step 3: Update Logout Functionality

The logout button in `profile-view.html` now uses Auth0's logout method.

---

## Backend Integration

### Step 1: Install Required Packages

```bash
npm install @auth0/auth0-spa-js jsonwebtoken express-jwt jwks-rsa
```

### Step 2: JWT Verification Middleware (Optional)

To protect API routes with Auth0 JWT tokens, you can add middleware:

Create `backend/middleware/auth0Middleware.js`:

```javascript
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
  }),
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ['RS256']
});

module.exports = { checkJwt };
```

### Step 3: Protect API Routes (Optional)

Apply the middleware to protect routes:

```javascript
const { checkJwt } = require('./middleware/auth0Middleware');

// Protected route example
app.get('/api/users/:userId', checkJwt, async (req, res) => {
  // Route logic here
});
```

---

## Streaming Services API Keys Setup

### Overview

Each streaming service requires API credentials. Follow these steps to obtain and configure them.

### 1. TMDB (The Movie Database) - REQUIRED

**Purpose**: Movie and TV show data, posters, details

1. Create account at [TMDB](https://www.themoviedb.org/signup)
2. Go to Settings > API
3. Request an API Key (choose "Developer")
4. Fill in the application details
5. Copy your API Key (v3 auth)

**Add to .env:**
```bash
TMDB_API_KEY=your_tmdb_api_key_here
```

### 2. Watchmode - OPTIONAL

**Purpose**: Streaming platform availability data

1. Sign up at [Watchmode API](https://api.watchmode.com/)
2. Go to your dashboard
3. Copy your API key

**Add to .env:**
```bash
WATCHMODE_API_KEY=your_watchmode_api_key_here
```

### 3. Netflix API

**Important**: Netflix's public API was discontinued. For development purposes:
- Use TMDB API for Netflix content data
- Use mock data for testing
- For production, consider web scraping (with proper authorization) or partner APIs

**Add to .env (for future use):**
```bash
NETFLIX_OAUTH_ENABLED=false
NETFLIX_CLIENT_ID=your_netflix_client_id
NETFLIX_CLIENT_SECRET=your_netflix_client_secret
NETFLIX_REDIRECT_URI=http://localhost:3000/api/auth/netflix/callback
```

### 4. Hulu API

**Access**: Restricted to partners only
**Alternative**: Use TMDB API for Hulu content

**Add to .env (for future use):**
```bash
HULU_OAUTH_ENABLED=false
HULU_CLIENT_ID=your_hulu_client_id
HULU_CLIENT_SECRET=your_hulu_client_secret
HULU_REDIRECT_URI=http://localhost:3000/api/auth/hulu/callback
```

### 5. Disney+ API

**Access**: Restricted to partners only
**Alternative**: Use TMDB API for Disney+ content

**Add to .env (for future use):**
```bash
DISNEY_OAUTH_ENABLED=false
DISNEY_CLIENT_ID=your_disney_client_id
DISNEY_CLIENT_SECRET=your_disney_client_secret
DISNEY_REDIRECT_URI=http://localhost:3000/api/auth/disney/callback
```

### 6. Amazon Prime Video API

**Access**: Available through Amazon Advertising API (requires approval)
**Alternative**: Use TMDB API for Prime Video content

**Add to .env (for future use):**
```bash
PRIME_OAUTH_ENABLED=false
PRIME_CLIENT_ID=your_prime_client_id
PRIME_CLIENT_SECRET=your_prime_client_secret
PRIME_REDIRECT_URI=http://localhost:3000/api/auth/prime/callback
```

### 7. HBO Max API

**Access**: Restricted to partners only
**Alternative**: Use TMDB API for HBO Max content

**Add to .env (for future use):**
```bash
HBO_OAUTH_ENABLED=false
HBO_CLIENT_ID=your_hbo_client_id
HBO_CLIENT_SECRET=your_hbo_client_secret
HBO_REDIRECT_URI=http://localhost:3000/api/auth/hbo/callback
```

### 8. Apple TV+ API

**Access**: Available through Apple's developer program
1. Enroll in [Apple Developer Program](https://developer.apple.com/)
2. Create App ID and Services ID
3. Configure Sign in with Apple

**Add to .env:**
```bash
APPLETV_OAUTH_ENABLED=false
APPLETV_CLIENT_ID=your_appletv_client_id
APPLETV_CLIENT_SECRET=your_appletv_client_secret
APPLETV_REDIRECT_URI=http://localhost:3000/api/auth/appletv/callback
```

### Storing API Keys in Auth0 User Metadata

For development and testing, you can store streaming API keys in Auth0 user metadata:

```javascript
// Example: Store API keys in user metadata
await Auth0Manager.updateUserMetadata({
  streaming_services: {
    tmdb_api_key: 'user_specific_tmdb_key',
    watchmode_api_key: 'user_specific_watchmode_key'
  }
});

// Retrieve API keys
const metadata = await Auth0Manager.getUserMetadata();
const tmdbKey = metadata.streaming_services?.tmdb_api_key;
```

---

## Testing the Integration

### Step 1: Start the Backend Server

```bash
npm start
```

### Step 2: Test Login Flow

1. Open browser to `http://localhost:3000/login.html`
2. Click "Login with Auth0" (or similar button)
3. You should be redirected to Auth0's Universal Login
4. Sign up or log in with credentials
5. You should be redirected back to `/callback.html`
6. Then redirected to your profile page

### Step 3: Test Logout Flow

1. Navigate to profile page
2. Click the "Logout" button
3. You should be logged out and redirected to login page

### Step 4: Verify User Creation

1. Check backend logs for user creation
2. Verify user exists in your data store
3. Check that Auth0 ID is properly linked

### Step 5: Test Protected Routes (if implemented)

```bash
# Get access token
const token = await Auth0Manager.getToken();

# Make API request
fetch('/api/users/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## Troubleshooting

### Issue: "Invalid Callback URL"

**Solution**: Make sure callback URLs are added to Auth0 application settings

### Issue: "Token Validation Failed"

**Solution**: 
- Check AUTH0_DOMAIN and AUTH0_AUDIENCE in .env
- Verify JWT middleware configuration
- Ensure token hasn't expired

### Issue: "CORS Error"

**Solution**: Add your domain to "Allowed Origins (CORS)" in Auth0 application settings

### Issue: "User Metadata Not Updating"

**Solution**:
- Verify Management API scopes are enabled
- Check that `update:current_user_metadata` scope is included
- Ensure token has proper permissions

---

## Security Best Practices

1. **Never expose Auth0 Client Secret in frontend code**
2. **Use HTTPS in production** for all Auth0 callbacks
3. **Rotate JWT secrets regularly**
4. **Store API keys securely** (use environment variables or secure vault)
5. **Implement rate limiting** on authentication endpoints
6. **Enable Multi-Factor Authentication** (MFA) in Auth0 dashboard
7. **Monitor Auth0 logs** for suspicious activity
8. **Use separate Auth0 tenants** for development and production

---

## Production Deployment Checklist

- [ ] Update callback URLs with production domain
- [ ] Enable HTTPS for all URLs
- [ ] Set strong JWT secret
- [ ] Enable Auth0 MFA
- [ ] Configure Auth0 custom domain (optional)
- [ ] Set up Auth0 monitoring and alerts
- [ ] Review and test all authentication flows
- [ ] Implement proper error handling
- [ ] Add logging for authentication events
- [ ] Test token refresh flow

---

## Additional Resources

- [Auth0 SPA SDK Documentation](https://auth0.com/docs/libraries/auth0-spa-js)
- [Auth0 Management API](https://auth0.com/docs/api/management/v2)
- [TMDB API Documentation](https://developers.themoviedb.org/3)
- [Watchmode API Documentation](https://api.watchmode.com/docs/)

---

## Support

For issues or questions:
- Check Auth0 logs in dashboard
- Review backend server logs
- Check browser console for frontend errors
- Refer to Auth0 documentation
- Contact support team

---

**Last Updated**: January 2026
**Version**: 1.0.0
