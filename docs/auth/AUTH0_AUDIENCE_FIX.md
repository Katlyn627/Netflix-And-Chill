# Auth0 Audience Configuration Fix

## Problem: access_denied - Service not found

If you're seeing this error:
```
Auth0 Error: access_denied
Service not found: http://dev-xxxxx.auth0.com/api/v2/
```

**This means your AUTH0_AUDIENCE is incorrectly set to the Management API endpoint.**

## Why This Happens

The Auth0 Management API (`/api/v2/`) is designed for **Machine-to-Machine** applications, not Single Page Applications (SPAs). When an SPA tries to use the Management API as its audience:

1. ❌ Auth0 rejects the request with "access_denied"
2. ❌ The error message shows "Service not found"
3. ❌ Login fails completely

## The Fix

### Option 1: Remove AUTH0_AUDIENCE (Recommended)

For most Single Page Applications, you **don't need** to set an audience at all.

**In your `.env` file:**
```bash
AUTH0_DOMAIN=dev-xxxxx.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret
AUTH0_CALLBACK_URL=http://localhost:3000/callback.html
AUTH0_LOGOUT_URL=http://localhost:3000/login.html
# AUTH0_AUDIENCE=  # Leave this commented out or remove it entirely
```

**This is the recommended approach for SPAs.**

### Option 2: Use a Custom API Identifier

If you have a custom API that you've registered in Auth0 Dashboard (under APIs), you can use that:

```bash
# Use your custom API identifier, NOT the Management API
AUTH0_AUDIENCE=https://your-custom-api.example.com
```

**Steps to create a custom API:**
1. Go to Auth0 Dashboard → Applications → APIs
2. Click "Create API"
3. Enter a name and identifier (e.g., `https://your-app.example.com`)
4. Use that identifier as your audience

### Option 3: Already Fixed Automatically

**Good news!** The application now automatically detects and fixes this issue:

1. ✅ If `AUTH0_AUDIENCE` contains `/api/v2/`, it's automatically ignored
2. ✅ A warning is logged to help you fix your `.env` file
3. ✅ Authentication proceeds without the incorrect audience

## What NOT To Do

### ❌ NEVER Use These Values:

```bash
# WRONG - Management API endpoint
AUTH0_AUDIENCE=https://dev-xxxxx.auth0.com/api/v2/

# WRONG - Management API endpoint
AUTH0_AUDIENCE=https://YOUR_AUTH0_DOMAIN.auth0.com/api/v2/
```

These will cause the "access_denied" error.

## Verification

### Check Console Logs

When you start the server, you should see:

**If audience is misconfigured:**
```
⚠️  WARNING: AUTH0_AUDIENCE is set to Management API endpoint!
   Management API (/api/v2/) should only be used by Machine-to-Machine apps.
   For Single Page Applications, either:
   1. Remove AUTH0_AUDIENCE from .env (recommended), OR
   2. Set it to a custom API identifier (not /api/v2/)
```

**If audience is correct or omitted:**
```
Netflix and Chill server running on port 3000
```

### Check Browser Console

When Auth0 initializes, you should see:

**If audience was auto-fixed:**
```
⚠️ AUTH0_AUDIENCE is set to Management API. This is not supported for Single Page Applications.
   Removing audience to use default. Use backend API for user data operations.
```

**If audience is correct:**
```
✅ Auth0 configuration loaded successfully
```

## Understanding Audience

### What is "Audience"?

The `audience` parameter tells Auth0 which API the access token is meant for. It's like saying "I want a token that works with X API."

### When Do You Need It?

You need an audience when:
- You have a custom backend API registered in Auth0
- You want to validate tokens on your backend
- You're following Auth0's API authorization flow

You DON'T need an audience when:
- You're just using Auth0 for user authentication
- You only need user profile information
- You're building a simple SPA without a custom API

### Management API vs Custom API

| Feature | Management API | Custom API |
|---------|---------------|------------|
| Purpose | Manage Auth0 resources (users, apps, etc.) | Your application's backend API |
| Access | Machine-to-Machine apps only | SPAs and other apps |
| Audience | `https://domain.auth0.com/api/v2/` | Your custom identifier |
| Use in SPA | ❌ Never | ✅ Optional |

## Testing the Fix

### Step 1: Update .env

Remove or comment out `AUTH0_AUDIENCE`:

```bash
# AUTH0_AUDIENCE=
```

### Step 2: Restart Server

```bash
npm start
```

### Step 3: Try Logging In

1. Go to http://localhost:3000
2. Click "Login with Auth0"
3. Complete the Auth0 login flow

You should now successfully authenticate without the "access_denied" error.

## Still Having Issues?

### Check Auth0 Dashboard Settings

Ensure your Auth0 Application is configured as:
- **Application Type:** Single Page Application
- **Allowed Callback URLs:** `http://localhost:3000/callback.html`
- **Allowed Logout URLs:** `http://localhost:3000/login.html`
- **Allowed Web Origins:** `http://localhost:3000`
- **Allowed Origins (CORS):** `http://localhost:3000`

### Check Grant Types

Go to Auth0 Dashboard → Applications → Your App → Advanced Settings → Grant Types

Ensure these are enabled:
- ✅ Authorization Code
- ✅ Refresh Token

### Clear Browser Cache

Sometimes old tokens cause issues:
```javascript
// In browser console
localStorage.clear();
```

Then try logging in again.

## Related Documentation

- **AUTH0_SETUP_GUIDE.md** - Complete Auth0 setup instructions
- **AUTH0_ERRORS_QUICK_FIX.md** - Common Auth0 errors and solutions
- **AUTH0_DEBUGGING_GUIDE.md** - Detailed debugging steps

## Summary

✅ **Remove `AUTH0_AUDIENCE` from your `.env` file** (recommended for most SPAs)  
✅ **Or use a custom API identifier** (not `/api/v2/`)  
✅ **Never use Management API as audience** for Single Page Applications  
✅ **The app now auto-detects and fixes this issue**  
✅ **Clear warnings help you fix your configuration**  

**You should now be able to login without the "access_denied" error!** 🎉
