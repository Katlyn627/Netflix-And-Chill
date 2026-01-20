# Auth0 SSL Error Troubleshooting Guide

## Quick Fix for ERR_SSL_PROTOCOL_ERROR

If you see this error when trying to login with Auth0:
```
This site can't provide a secure connection
localhost sent an invalid response.
ERR_SSL_PROTOCOL_ERROR
```

### Solution: Use the Setup Script

Run the automated setup script:
```bash
./setup-auth0.sh
```

This script will:
1. Create/update your `.env` file with correct HTTP localhost URLs
2. Provide step-by-step instructions for Auth0 Dashboard configuration
3. Ensure you're using HTTP (not HTTPS) for localhost

### Manual Fix

If you prefer to fix it manually:

#### 1. Check Your `.env` File

Make sure these values use **HTTP** (not HTTPS) for localhost:

```bash
# ✓ CORRECT - Use HTTP for localhost
BASE_URL=http://localhost:3000
AUTH0_CALLBACK_URL=http://localhost:3000/callback.html
AUTH0_LOGOUT_URL=http://localhost:3000/login.html

# ✗ WRONG - Do NOT use HTTPS for localhost
BASE_URL=https://localhost:3000  # This causes ERR_SSL_PROTOCOL_ERROR!
AUTH0_CALLBACK_URL=https://localhost:3000/callback.html  # Auth0 rejects this!
AUTH0_LOGOUT_URL=https://localhost:3000/login.html  # This won't work!
```

#### 2. Configure Auth0 Dashboard

Go to https://manage.auth0.com/dashboard and update your application settings:

**Allowed Callback URLs:**
```
http://localhost:3000/callback.html
```

**Allowed Logout URLs:**
```
http://localhost:3000/login.html
```

**Allowed Web Origins:**
```
http://localhost:3000
```

**Allowed Origins (CORS):**
```
http://localhost:3000
```

⚠️ **Important**: Copy these values exactly as shown. Use HTTP, not HTTPS!

#### 3. Restart Your Server

```bash
npm start
```

## Why Does This Happen?

### The Problem

Auth0 does not accept `https://localhost` URLs because:
- Localhost typically doesn't have valid SSL certificates
- SSL certificate validation would fail
- It's not a standard practice for local development

### What About Production?

For production deployments, you **should** use HTTPS:

```bash
# Production .env
NODE_ENV=production
BASE_URL=https://your-app.herokuapp.com
AUTH0_CALLBACK_URL=https://your-app.herokuapp.com/callback.html
AUTH0_LOGOUT_URL=https://your-app.herokuapp.com/login.html
```

The app automatically handles this and will upgrade HTTP to HTTPS in production.

## Common Mistakes

### ❌ Mistake 1: Using HTTPS for localhost
```bash
BASE_URL=https://localhost:3000  # WRONG!
```

**Fix**: Use HTTP for localhost
```bash
BASE_URL=http://localhost:3000  # CORRECT!
```

### ❌ Mistake 2: Mismatched URLs in Auth0 Dashboard
If your `.env` says `http://localhost:3000` but Auth0 Dashboard has `https://localhost:3000`, you'll get errors.

**Fix**: Make sure both use HTTP for localhost

### ❌ Mistake 3: Missing Port Number
```bash
BASE_URL=http://localhost  # Missing port!
```

**Fix**: Include the port number
```bash
BASE_URL=http://localhost:3000  # CORRECT!
```

### ❌ Mistake 4: Wrong Callback Path
```bash
AUTH0_CALLBACK_URL=http://localhost:3000/callback  # Missing .html!
```

**Fix**: Use the correct path
```bash
AUTH0_CALLBACK_URL=http://localhost:3000/callback.html  # CORRECT!
```

## Validation

When you start the server, it will automatically check your configuration and warn you about issues:

### Good Configuration ✓
```
Server running on http://localhost:3000
Auth0 configuration loaded successfully
```

### Bad Configuration ✗
```
❌ ERROR: BASE_URL is set to HTTPS with localhost!
   This will cause ERR_SSL_PROTOCOL_ERROR with Auth0.

   Current value: https://localhost:3000
   Should be:     http://localhost:3000

   Please update your .env file to use HTTP for localhost:
   BASE_URL=http://localhost:3000
```

## Still Having Issues?

1. **Clear browser cache and cookies**
   - Old Auth0 tokens might be cached
   - Try incognito/private browsing mode

2. **Check browser console**
   - Press F12 to open developer tools
   - Look for Auth0-related errors in the console

3. **Verify Auth0 credentials**
   - Make sure `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, and `AUTH0_CLIENT_SECRET` are correct
   - Check for typos

4. **Review detailed documentation**
   - [AUTH0_SSL_FIX.md](./AUTH0_SSL_FIX.md) - Comprehensive SSL fix explanation
   - [AUTH0_SETUP_GUIDE.md](./AUTH0_SETUP_GUIDE.md) - Complete setup instructions
   - [FRONTEND_AUTH0_CONFIG.md](./FRONTEND_AUTH0_CONFIG.md) - Frontend integration details

## Quick Reference

| Environment | Protocol | Example |
|------------|----------|---------|
| Development (localhost) | HTTP | `http://localhost:3000` |
| Production (domain) | HTTPS | `https://your-app.com` |
| Production (Heroku) | HTTPS | `https://your-app.herokuapp.com` |

## Summary

✓ Use **HTTP** for localhost  
✓ Use **HTTPS** for production domains  
✓ Match URLs exactly in `.env` and Auth0 Dashboard  
✓ Run `./setup-auth0.sh` for automated setup  
✓ Restart server after changing `.env`  

❌ Never use `https://localhost`  
❌ Don't forget port numbers  
❌ Don't mix HTTP and HTTPS  
