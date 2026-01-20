# Auth0 Authentication Debugging Guide

## Overview

This guide helps you debug Auth0 authentication issues in the Netflix and Chill application. The app now includes comprehensive logging and error handling to help identify authentication problems.

## Recent Improvements (2026-01-20)

We've significantly improved the Auth0 authentication flow with:

### ✅ Enhanced Logging
- **Console logging** throughout the entire Auth0 flow
- **Step-by-step progress tracking** from config loading to user creation
- **Detailed error messages** that show exactly where authentication fails

### ✅ Better Error Handling
- **API_BASE_URL validation** - automatically determined based on environment
- **Config validation** - checks if Auth0 is properly configured before attempting login
- **User-friendly error messages** - explains what went wrong and how to fix it

### ✅ Production-Ready
- **Dynamic API URLs** - works in both development (localhost) and production (Heroku, etc.)
- **Protocol handling** - automatically uses HTTP for localhost, HTTPS for production

## How to Debug Auth0 Issues

### Step 1: Open Browser Console

Open your browser's developer tools (F12) and go to the Console tab.

### Step 2: Monitor the Auth0 Flow

#### On Login Page (login.html)

You should see these console messages:

```
🔧 Loading Auth0 configuration...
📡 Fetching config from: http://localhost:3000/api/config/auth0
✅ Auth0 config received: {domain: YOUR_AUTH0_DOMAIN.auth0.com, clientId: ***, audience: ...}
```

**If Auth0 is NOT configured:**
```
ℹ️ Auth0 not configured. Auth0 login disabled. Use traditional login instead.
⚠️ Auth0 is not configured
```
- ✅ **Expected**: Auth0 login button will be hidden
- ✅ **Action**: Configure Auth0 following AUTH0_SETUP_GUIDE.md

**If Auth0 IS configured:**
```
✅ Auth0 is configured, showing login button
```
- ✅ **Expected**: Auth0 login button will be visible

#### On Callback Page (callback.html)

After clicking "Login with Auth0", you should see:

```
📋 URL parameters: {code: abc123..., state: xyz789...}
✅ Auth0 callback parameters detected
🔐 Starting Auth0 callback handling...
⏳ Waiting for Auth0 config to load...
✅ Auth0 is configured
📥 Handling redirect callback...
✅ Callback handled successfully
🔑 Getting access token...
✅ User info retrieved: {email: user@example.com, sub: auth0|...}
📡 Using API base URL: http://localhost:3000/api
👤 Creating/updating user in backend...
✅ User created/updated in backend: user_12345_abc
✅ User data stored in localStorage
🎯 Redirecting to: /profile-view.html?userId=user_12345_abc
```

## Common Issues and Solutions

### Issue 1: "Auth0 not configured"

**Symptoms:**
- ℹ️ Console log: "Auth0 not configured"
- Auth0 login button is not visible
- Config shows placeholder values like `YOUR_AUTH0_DOMAIN.auth0.com`

**Cause:**
Auth0 environment variables are not set in the `.env` file.

**Solution:**
1. Copy `.env.example` to `.env`
2. Set up Auth0 account at https://auth0.com/
3. Create a Single Page Application in Auth0 Dashboard
4. Update `.env` file:
   ```bash
   AUTH0_DOMAIN=your-tenant.auth0.com
   AUTH0_CLIENT_ID=your_client_id_here
   AUTH0_CLIENT_SECRET=your_client_secret_here
   AUTH0_CALLBACK_URL=http://localhost:3000/callback.html
   AUTH0_LOGOUT_URL=http://localhost:3000/login.html
   ```
5. Configure Auth0 Dashboard:
   - **Allowed Callback URLs**: `http://localhost:3000/callback.html`
   - **Allowed Logout URLs**: `http://localhost:3000/login.html`
   - **Allowed Web Origins**: `http://localhost:3000`
6. Restart the server

### Issue 2: "Failed to create/update user in backend"

**Symptoms:**
- ❌ Console log: "Backend user creation failed: 500"
- Error message shown on callback page
- Redirects back to login after 3 seconds

**Cause:**
The backend `/api/users/auth0` endpoint is failing.

**Solution:**
1. Check server console for errors
2. Verify database is accessible
3. Check if `findUserByAuth0Id` method exists in dataStore
4. Ensure proper error handling in userController

**Debug Command:**
```bash
# Test the endpoint directly
curl -X POST http://localhost:3000/api/users/auth0 \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","auth0Id":"auth0|123","profilePicture":""}'
```

### Issue 3: Infinite Redirect Loop

**Symptoms:**
- Page keeps redirecting between login.html and callback.html
- Console shows repeated messages

**Cause:**
- Auth0 configuration is partially correct
- Callback URL mismatch between Auth0 Dashboard and .env file

**Solution:**
1. Verify callback URL in `.env` matches Auth0 Dashboard exactly
2. Check for typos in domain/client ID
3. Ensure no trailing slashes in URLs
4. Clear browser cache and localStorage:
   ```javascript
   localStorage.clear();
   ```

### Issue 4: "ERR_SSL_PROTOCOL_ERROR"

**Symptoms:**
- SSL error when trying to login
- "This site can't provide a secure connection"

**Cause:**
Using `https://localhost:3000` in development.

**Solution:**
1. Always use `http://` (not `https://`) for localhost
2. Update `.env`:
   ```bash
   BASE_URL=http://localhost:3000
   AUTH0_CALLBACK_URL=http://localhost:3000/callback.html
   AUTH0_LOGOUT_URL=http://localhost:3000/login.html
   ```
3. Update Auth0 Dashboard to use `http://localhost:3000`
4. See AUTH0_SSL_FIX.md for details

### Issue 5: "No callback parameters found"

**Symptoms:**
- ⚠️ Console log: "No callback parameters found, redirecting to login"
- Immediately redirected from callback.html to login.html

**Cause:**
- Accessing callback.html directly without Auth0 redirect
- Auth0 redirect not including `code` and `state` parameters

**Solution:**
1. Don't access callback.html directly - only via Auth0 redirect
2. Verify Allowed Callback URLs in Auth0 Dashboard
3. Check browser network tab for Auth0 redirect URL
4. Ensure Auth0 application type is "Single Page Application"

## Testing Auth0 Integration

### Manual Test Checklist

1. **Config Loading**
   - [ ] Open login.html
   - [ ] Check console for "Auth0 config received"
   - [ ] Verify domain and clientId are not placeholders

2. **Login Button**
   - [ ] Auth0 login button is visible
   - [ ] Clicking button initiates Auth0 Universal Login

3. **Auth0 Universal Login**
   - [ ] Auth0 login page loads
   - [ ] Can login with test credentials
   - [ ] Redirects back to callback.html with code/state params

4. **Callback Processing**
   - [ ] callback.html processes the redirect
   - [ ] Console shows all success messages
   - [ ] User is created/updated in backend
   - [ ] localStorage has currentUserId and auth0User

5. **Redirect to Profile**
   - [ ] Redirects to profile-view.html
   - [ ] User info displays correctly
   - [ ] Can access protected pages

### Automated Testing

```javascript
// Test Auth0 config endpoint
fetch('http://localhost:3000/api/config/auth0')
  .then(r => r.json())
  .then(config => {
    console.log('Domain:', config.domain);
    console.log('Configured:', config.domain !== 'YOUR_AUTH0_DOMAIN.auth0.com');
  });

// Test backend user creation
fetch('http://localhost:3000/api/users/auth0', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    username: 'testuser',
    auth0Id: 'auth0|test123',
    profilePicture: ''
  })
})
  .then(r => r.json())
  .then(data => console.log('User created:', data))
  .catch(err => console.error('Error:', err));
```

## Console Log Reference

### Login Page (login.html)

| Log Message | Meaning | Action |
|-------------|---------|--------|
| 🔧 Loading Auth0 configuration... | Starting to load config | Wait for result |
| 📡 Fetching config from: ... | Fetching from backend API | Check API is running |
| ✅ Auth0 config received | Config loaded successfully | Check if values are valid |
| ℹ️ Auth0 not configured | Using placeholder values | Configure Auth0 in .env |
| 🔐 Setting up Auth0 login... | Initializing login button | Normal operation |
| ✅ Auth0 is configured | Ready to use Auth0 | Can proceed with login |
| 🔑 Initiating Auth0 login... | Button clicked | Auth0 redirect starting |

### Callback Page (callback.html)

| Log Message | Meaning | Action |
|-------------|---------|--------|
| 📋 URL parameters: {...} | Shows callback params | Verify code/state present |
| ✅ Auth0 callback parameters detected | Valid callback | Continue processing |
| 🔐 Starting Auth0 callback handling... | Processing callback | Normal operation |
| ✅ Callback handled successfully | Auth0 processing done | Continue to backend |
| 👤 Creating/updating user in backend... | Calling backend API | Check for errors |
| ✅ User created/updated in backend | User saved | Normal operation |
| 🎯 Redirecting to: ... | Final redirect | Success! |
| ❌ Error during authentication callback | Something failed | Check error details |

## Environment-Specific Configuration

### Development (localhost)

```bash
NODE_ENV=development
BASE_URL=http://localhost:3000
AUTH0_CALLBACK_URL=http://localhost:3000/callback.html
AUTH0_LOGOUT_URL=http://localhost:3000/login.html
```

**Important:** Always use `http://` (not `https://`) for localhost!

### Production (Heroku/Cloud)

```bash
NODE_ENV=production
BASE_URL=https://your-app.herokuapp.com
AUTH0_CALLBACK_URL=https://your-app.herokuapp.com/callback.html
AUTH0_LOGOUT_URL=https://your-app.herokuapp.com/login.html
```

**Important:** Always use `https://` for production domains!

## Getting Help

If you're still experiencing issues after following this guide:

1. **Collect Debug Information**
   - Copy all console logs from browser console
   - Copy server logs from terminal
   - Note exact error messages
   - Screenshot of error state

2. **Check Related Documentation**
   - AUTH0_SETUP_GUIDE.md - Initial setup instructions
   - AUTH0_SSL_FIX.md - SSL/HTTPS troubleshooting
   - AUTH0_ERROR_FIXED.md - Previous known issues

3. **Common Questions**
   - **Q**: Why is Auth0 button not showing?
     - **A**: Auth0 is not configured. Set up .env file with Auth0 credentials.
   
   - **Q**: Why does it keep redirecting to login?
     - **A**: Check console logs. Most likely backend user creation is failing or Auth0 config is invalid.
   
   - **Q**: Can I use Auth0 and traditional login together?
     - **A**: Yes! The app supports both. Users can choose either method.

## Summary

The enhanced Auth0 implementation now provides:
- ✅ **Clear debugging** - Console logs show exactly what's happening
- ✅ **Better errors** - Detailed error messages explain problems
- ✅ **Flexible configuration** - Works in dev and production
- ✅ **Graceful fallback** - Traditional login still works if Auth0 fails

Follow the console logs, and you'll quickly identify and fix any Auth0 issues!
