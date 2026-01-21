# Auth0 Common Errors - Quick Fix Guide

## When You See an Error During Login

If you're getting an error when trying to login with Auth0, the error will be displayed on the callback page and then you'll be redirected to the login page.

### Error Format

You'll see something like:
```
Auth0 Error: access_denied
Description of the error
```

## Common Auth0 Errors and Solutions

### 1. `access_denied` - Callback URL Mismatch

**Error Message:**
```
error: access_denied
error_description: Callback URL mismatch. The provided redirect_uri is not in the list of allowed callback URLs
```

**Cause:**
The callback URL in your application doesn't match what's configured in Auth0 Dashboard.

**Solution:**
1. Go to [Auth0 Dashboard](https://manage.auth0.com/)
2. Navigate to Applications → Your App → Settings
3. Find "Allowed Callback URLs"
4. Add your callback URL:
   - **Development**: `http://localhost:3000/callback.html`
   - **Production**: `https://your-app.herokuapp.com/callback.html`
5. Click "Save Changes"
6. Try logging in again

**Important:** 
- Use `http://` for localhost (NOT `https://`)
- Use `https://` for production domains
- No trailing slash
- Exact match required

---

### 2. `unauthorized` - Application Not Enabled

**Error Message:**
```
error: unauthorized_client
error_description: The client is not authorized to use this authorization flow
```

**Cause:**
Application type is incorrect or required grant types are not enabled.

**Solution:**
1. Go to Auth0 Dashboard → Applications → Your App
2. Verify "Application Type" is set to **"Single Page Application"**
3. Go to "Advanced Settings" → "Grant Types"
4. Ensure these are checked:
   - ✅ Authorization Code
   - ✅ Refresh Token
5. Click "Save Changes"

---

### 3. `login_required` - Session Expired

**Error Message:**
```
error: login_required
error_description: Login required
```

**Cause:**
Auth0 session expired or user cancelled login.

**Solution:**
- Simply try logging in again
- This is normal behavior if you wait too long on the Auth0 login page

---

### 4. Origin Not Allowed - CORS Error

**Error Message:**
```
error: access_denied  
error_description: Origin not allowed
```

**Cause:**
Your application's origin is not in the allowed list.

**Solution:**
1. Go to Auth0 Dashboard → Applications → Your App → Settings
2. Find "Allowed Web Origins"
3. Add your origin:
   - **Development**: `http://localhost:3000`
   - **Production**: `https://your-app.herokuapp.com`
4. Also add to "Allowed Origins (CORS)"
5. Click "Save Changes"

---

### 5. Invalid State - CSRF Protection

**Error Message:**
```
error: invalid_state
error_description: State does not match
```

**Cause:**
CSRF state token mismatch (usually happens if you reload during auth).

**Solution:**
- Clear browser localStorage: Open console and run `localStorage.clear()`
- Try logging in again
- Don't refresh the page during authentication

---

### 6. Configuration Error - Wrong Client ID/Domain

**Console Error:**
```
Failed to load Auth0 configuration
```

**Cause:**
Wrong Auth0 domain or client ID in `.env` file.

**Solution:**
1. Open your `.env` file
2. Verify these match your Auth0 Dashboard:
   ```bash
   AUTH0_DOMAIN=your-tenant.auth0.com  # NOT your custom domain
   AUTH0_CLIENT_ID=your_client_id       # From Auth0 Dashboard
   ```
3. Restart your server
4. Clear browser cache
5. Try again

---

## Debugging Steps

### Step 1: Check Browser Console
Press F12 → Console tab

Look for messages like:
- ❌ Auth0 returned an error: [error type]
- 🔑 Initiating Auth0 login...
- 📍 Callback URL: [your callback url]

### Step 2: Verify Auth0 Dashboard Settings

Required URLs in Auth0 Dashboard (Applications → Your App → Settings):

**For Development (localhost):**
```
Allowed Callback URLs:
http://localhost:3000/callback.html

Allowed Logout URLs:
http://localhost:3000/login.html

Allowed Web Origins:
http://localhost:3000

Allowed Origins (CORS):
http://localhost:3000
```

**For Production:**
```
Allowed Callback URLs:
https://your-app.herokuapp.com/callback.html

Allowed Logout URLs:
https://your-app.herokuapp.com/login.html

Allowed Web Origins:
https://your-app.herokuapp.com

Allowed Origins (CORS):
https://your-app.herokuapp.com
```

### Step 3: Check .env File

Your `.env` should have:
```bash
# Development
BASE_URL=http://localhost:3000
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret
AUTH0_CALLBACK_URL=http://localhost:3000/callback.html
AUTH0_LOGOUT_URL=http://localhost:3000/login.html

# Production - change BASE_URL to your domain
# BASE_URL=https://your-app.herokuapp.com
# AUTH0_CALLBACK_URL=https://your-app.herokuapp.com/callback.html
# AUTH0_LOGOUT_URL=https://your-app.herokuapp.com/login.html
```

### Step 4: Restart Everything

1. Restart your server
2. Clear browser cache (Ctrl+Shift+Delete)
3. Clear localStorage: `localStorage.clear()`
4. Try logging in again

## Still Having Issues?

### Collect This Information:
1. **Error code** from callback page
2. **Full error description**
3. **Console logs** (F12 → Console)
4. **Network tab** showing the redirect to Auth0
5. **Your Auth0 domain** (e.g., dev-xxxxx.us.auth0.com)
6. **Environment** (development/production)

### Check These Files:
- `frontend/callback.html` - Should have detailed error messages
- `frontend/login.html` - Should show Auth0 button if configured
- `.env` - Should have correct Auth0 credentials
- Server console - Should show "Auth0 configuration loaded"

## Quick Checklist

Before asking for help, verify:

- [ ] Auth0 application type is "Single Page Application"
- [ ] Callback URL in Auth0 matches exactly (check http/https, port, path)
- [ ] Web Origins are configured in Auth0
- [ ] .env file has correct AUTH0_DOMAIN and AUTH0_CLIENT_ID
- [ ] Using http:// for localhost, https:// for production
- [ ] Server is running and .env is loaded
- [ ] Browser console shows "✅ Auth0 is configured"
- [ ] No typos in domain or client ID

## Common Mistakes

❌ **Wrong:** `https://localhost:3000/callback.html`  
✅ **Right:** `http://localhost:3000/callback.html`

❌ **Wrong:** `AUTH0_DOMAIN=https://dev-xxxxx.us.auth0.com`  
✅ **Right:** `AUTH0_DOMAIN=dev-xxxxx.us.auth0.com`

❌ **Wrong:** `AUTH0_CALLBACK_URL=http://localhost:3000/callback.html/`  
✅ **Right:** `AUTH0_CALLBACK_URL=http://localhost:3000/callback.html`

## Need More Help?

See these guides:
- **AUTH0_SETUP_GUIDE.md** - Complete setup instructions
- **AUTH0_DEBUGGING_GUIDE.md** - Detailed debugging steps
- **AUTH0_SSL_FIX.md** - SSL/HTTPS issues
- **AUTH0_ERROR_FIXED.md** - Known issues and fixes
