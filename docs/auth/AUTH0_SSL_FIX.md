# Auth0 SSL Protocol Error Fix

## Problem Statement

Users were encountering the `ERR_SSL_PROTOCOL_ERROR` when trying to use Auth0 authentication. This error manifested in two ways:

1. **Production Deployment Error**: When deployed behind load balancers or proxies (like Heroku), the application would construct callback URLs with HTTP instead of HTTPS, causing Auth0 to fail with SSL protocol errors.

2. **Development Configuration Error**: When users tried to configure Auth0 with `https://localhost:3000` URLs, Auth0 would reject them with the validation error:
   ```
   Error! Something happened while trying to save your settings: 
   Payload validation error: 'Object didn't pass validation for format 
   absolute-uri-or-empty: https://localhost:3000/callback.html' on 
   property support_url (End-user support url).
   ```

## Root Causes

### Issue 1: Protocol Mismatch in Production
When deployed on platforms like Heroku, the application runs behind a proxy/load balancer:
- External users connect via HTTPS
- The load balancer terminates SSL/TLS
- The app receives HTTP internally
- `window.location.origin` returns HTTP instead of HTTPS
- Auth0 callbacks fail because Auth0 expects HTTPS in production

### Issue 2: Invalid Localhost HTTPS URLs
Auth0's validation rules do not accept `https://localhost` URLs because:
- Localhost typically doesn't have valid SSL certificates
- It's not a standard practice for local development
- Auth0's URI validation explicitly rejects this format

## Solution

The fix implements intelligent protocol detection and correction:

### Backend Fix (`backend/config/config.js`)
```javascript
// Detect if URL is localhost
const isLocalhost = baseUrl.includes('://localhost') || 
                   baseUrl.includes('://127.0.0.1') ||
                   baseUrl.includes('://192.168.') ||
                   baseUrl.includes('://10.0.');

// Only upgrade to HTTPS for non-localhost production URLs
if (process.env.NODE_ENV === 'production' && 
    baseUrl.startsWith('http://') && 
    !isLocalhost) {
  cachedBaseUrl = baseUrl.replace('http://', 'https://');
}
```

### Frontend Fix (`frontend/src/config/auth0-loader.js`)
```javascript
// Upgrade API calls to HTTPS in production, but not for localhost
const isLocalhost = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1' ||
                   window.location.hostname.startsWith('192.168.') ||
                   window.location.hostname.startsWith('10.0.');

if (window.location.protocol === 'https:' && 
    API_BASE_URL.startsWith('http://') && 
    !isLocalhost) {
    API_BASE_URL = API_BASE_URL.replace('http://', 'https://');
}
```

### Frontend Redirect URI Fix (`frontend/src/utils/auth0-config.js`)
```javascript
function getSafeRedirectUri(path) {
    let origin = window.location.origin;
    
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname.startsWith('192.168.') ||
                       window.location.hostname.startsWith('10.0.');
    
    // Force HTTP for localhost (Auth0 doesn't accept https://localhost)
    if (isLocalhost && origin.startsWith('https://')) {
        origin = origin.replace('https://', 'http://');
    }
    
    return origin + path;
}
```

## Configuration Guidelines

### Development Environment
✅ **Correct Configuration:**
```bash
BASE_URL=http://localhost:3000
AUTH0_CALLBACK_URL=http://localhost:3000/callback.html
AUTH0_LOGOUT_URL=http://localhost:3000/login.html
```

❌ **Incorrect Configuration:**
```bash
BASE_URL=https://localhost:3000  # Never use HTTPS with localhost!
AUTH0_CALLBACK_URL=https://localhost:3000/callback.html  # Auth0 rejects this!
```

### Production Environment
✅ **Correct Configuration:**
```bash
NODE_ENV=production
BASE_URL=https://your-app.herokuapp.com  # or http:// (will be auto-upgraded)
AUTH0_CALLBACK_URL=https://your-app.herokuapp.com/callback.html
AUTH0_LOGOUT_URL=https://your-app.herokuapp.com/login.html
```

Or simply:
```bash
NODE_ENV=production
BASE_URL=https://your-app.herokuapp.com
# AUTH0_CALLBACK_URL and AUTH0_LOGOUT_URL will be auto-generated
```

### Auth0 Dashboard Configuration

When configuring your Auth0 application, use:

**Development URLs:**
- Allowed Callback URLs: `http://localhost:3000/callback.html`
- Allowed Logout URLs: `http://localhost:3000/login.html`
- Allowed Web Origins: `http://localhost:3000`
- Allowed Origins (CORS): `http://localhost:3000`

**Production URLs:**
- Allowed Callback URLs: `https://your-app.herokuapp.com/callback.html`
- Allowed Logout URLs: `https://your-app.herokuapp.com/login.html`
- Allowed Web Origins: `https://your-app.herokuapp.com`
- Allowed Origins (CORS): `https://your-app.herokuapp.com`

**Both (comma-separated):**
```
http://localhost:3000/callback.html, https://your-app.herokuapp.com/callback.html
```

## How It Works

### Scenario 1: Development on Localhost
1. User accesses `http://localhost:3000`
2. Frontend detects hostname is "localhost"
3. `getSafeRedirectUri()` ensures HTTP protocol is used
4. Auth0 receives `http://localhost:3000/callback.html` ✅

### Scenario 2: Development with HTTPS Localhost (edge case)
1. User accesses `https://localhost:3000` (e.g., with local SSL cert)
2. Frontend detects hostname is "localhost"
3. `getSafeRedirectUri()` converts HTTPS to HTTP
4. Auth0 receives `http://localhost:3000/callback.html` ✅

### Scenario 3: Production Deployment
1. User accesses `https://myapp.herokuapp.com`
2. Load balancer terminates SSL, forwards to app as HTTP internally
3. `window.location.protocol` is "https:" (browser sees HTTPS)
4. Backend with `NODE_ENV=production` auto-upgrades URLs to HTTPS
5. Auth0 receives `https://myapp.herokuapp.com/callback.html` ✅

### Scenario 4: Production Misconfiguration (HTTP in env)
1. Admin sets `BASE_URL=http://myapp.herokuapp.com` in production
2. Backend detects `NODE_ENV=production` and non-localhost URL
3. Automatically upgrades to `https://myapp.herokuapp.com`
4. Logs warning: "BASE_URL uses http:// in production. Automatically converting to https://"
5. Auth0 receives `https://myapp.herokuapp.com/callback.html` ✅

## Testing

All scenarios have been tested:

### Backend Tests
```bash
✓ Development with no BASE_URL → http://localhost:3000
✓ Production with HTTP localhost → http://localhost:3000 (preserved)
✓ Production with HTTP domain → https://domain.com (upgraded)
✓ Production with HTTPS domain → https://domain.com (preserved)
✓ Production with HEROKU_APP_NAME → https://app.herokuapp.com
```

### Frontend Tests
```bash
✓ HTTP localhost → http://localhost:3000/callback.html
✓ HTTPS localhost → http://localhost:3000/callback.html (downgraded)
✓ HTTP production → http://domain.com/callback.html (fallback)
✓ HTTPS production → https://domain.com/callback.html
✓ Private IPs → treated as localhost (HTTP)
```

## Troubleshooting

### Still Getting SSL Errors?

1. **Check Auth0 Dashboard Configuration**
   - Ensure callback URLs match exactly (including protocol)
   - Verify you're using HTTP for localhost, HTTPS for production

2. **Check Environment Variables**
   ```bash
   # Development
   BASE_URL=http://localhost:3000  # NOT https://localhost:3000
   
   # Production
   NODE_ENV=production
   BASE_URL=https://your-app.com  # NOT http://
   ```

3. **Check Browser Console**
   - Look for Auth0 configuration loading messages
   - Verify "Auth0 configuration loaded successfully"
   - Check what URLs are being constructed

4. **Clear Browser Cache**
   - Old Auth0 tokens might have incorrect URLs
   - Clear localStorage and cookies
   - Try incognito/private browsing mode

## Related Documentation

- [AUTH0_SETUP_GUIDE.md](./AUTH0_SETUP_GUIDE.md) - Complete Auth0 setup instructions
- [.env.example](../../.env.example) - Environment variable configuration examples
- [FRONTEND_AUTH0_CONFIG.md](./FRONTEND_AUTH0_CONFIG.md) - Frontend Auth0 integration details

## Summary

This fix ensures:
- ✅ Localhost URLs always use HTTP (Auth0 requirement)
- ✅ Production URLs always use HTTPS (security requirement)
- ✅ Automatic protocol upgrade when misconfigured
- ✅ Works correctly behind load balancers/proxies
- ✅ Clear error messages and warnings
- ✅ Comprehensive documentation and examples

No manual intervention required - the app automatically handles protocol selection based on environment and hostname.
