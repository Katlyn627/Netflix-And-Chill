# Auth0 Custom Social Connections - Quick Reference

This is a quick reference guide for implementing custom social connections using Auth0's extensibility points.

## Overview

Custom social connections allow you to integrate OAuth 2.0 providers that aren't available in Auth0's marketplace. This implementation demonstrates:

1. **Getting Auth0 Permissions** - Obtaining Management API access
2. **Building Custom Connections** - Using Auth0's extensibility points
3. **Fetch User Profile** - Retrieving user data from provider's userinfo endpoint (JSON format)

## Quick Start

### 1. Set Environment Variables

Add to your `.env` file:

```bash
# Auth0 credentials with Management API access
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret
AUTH0_AUDIENCE=https://your-domain.auth0.com/api/v2/

# Custom provider OAuth credentials
NETFLIX_CLIENT_ID=your_netflix_client_id
NETFLIX_CLIENT_SECRET=your_netflix_client_secret
```

### 2. Setup Custom Connection

**Via API:**
```bash
POST /api/custom-social/setup/netflix
```

**Response:**
```json
{
  "success": true,
  "connection": {
    "name": "netflix-custom",
    "display_name": "Netflix",
    "enabled": true
  }
}
```

### 3. Use in Frontend

```javascript
// Login with custom Netflix connection
await auth0Client.loginWithRedirect({
  authorizationParams: {
    connection: 'netflix-custom'
  }
});

// Get user with custom metadata
const user = await auth0Client.getUser();
console.log(user.user_metadata);
```

## Architecture

```
User Browser
    │
    ├──> Auth0 Universal Login
    │         │
    │         ├──> Custom OAuth Provider (Netflix, etc.)
    │         │    - Authorization URL
    │         │    - Token Exchange
    │         │    - Fetch User Profile (JSON)
    │         │
    │         └──> Your App
    │              - User Profile with metadata
    │
    └──> Application receives authenticated user
```

## Key Components

### 1. Custom Connection Service
**File:** `backend/services/customSocialConnectionService.js`

**Purpose:** Manages Auth0 custom connections via Management API

**Key Methods:**
- `setupCustomConnection(providerId)` - Create/update connection
- `generateFetchUserProfileScript(provider)` - Generate profile fetch script
- `getManagementToken()` - Get Auth0 Management API token

### 2. API Routes
**File:** `backend/routes/customSocialAuth.js`

**Endpoints:**
- `GET /api/custom-social/providers` - List available providers
- `POST /api/custom-social/setup/:provider` - Setup connection
- `GET /api/custom-social/connections` - List configured connections
- `GET /api/custom-social/validate/:provider` - Validate credentials

### 3. Fetch User Profile Script

This is the core extensibility point. Example:

```javascript
function(accessToken, context, callback) {
  request.get({
    url: 'https://provider.com/api/userinfo',
    headers: {
      'Authorization': 'Bearer ' + accessToken,
      'Accept': 'application/json'
    }
  }, function(err, response, body) {
    if (err) return callback(err);
    
    const userProfile = JSON.parse(body);
    
    // Map to Auth0 profile schema
    const profile = {
      user_id: userProfile.id,
      email: userProfile.email,
      email_verified: userProfile.email_verified,
      name: userProfile.name,
      picture: userProfile.picture,
      
      user_metadata: {
        provider_data: userProfile.custom_fields
      }
    };
    
    callback(null, profile);
  });
}
```

## Auth0 Permissions Required

In Auth0 Dashboard → Applications → APIs → Auth0 Management API:

Enable these scopes:
- ✅ `read:connections`
- ✅ `create:connections`
- ✅ `update:connections`
- ✅ `delete:connections`
- ✅ `read:users`
- ✅ `update:users`
- ✅ `read:user_idp_tokens`

## Demo Page

Access the demo at: `http://localhost:3000/custom-social-demo.html`

Features:
- List available custom providers
- Validate provider credentials
- Setup custom connections
- View configured connections
- API documentation

## File Structure

```
├── AUTH0_CUSTOM_SOCIAL_CONNECTIONS.md (Complete documentation)
├── AUTH0_CUSTOM_SOCIAL_CONNECTIONS_QUICK_REFERENCE.md (This file)
├── backend/
│   ├── services/
│   │   └── customSocialConnectionService.js
│   └── routes/
│       └── customSocialAuth.js
└── frontend/
    └── custom-social-demo.html
```

## Common Use Cases

### 1. Netflix-style Streaming Service

```javascript
// Provider config
{
  name: 'Netflix',
  oauth: {
    authorizationURL: 'https://netflix.com/oauth/authorize',
    tokenURL: 'https://netflix.com/oauth/token',
    userInfoURL: 'https://api.netflix.com/v1/users/current',
    scope: ['user.read', 'viewing.history']
  }
}
```

### 2. Custom Enterprise SSO

```javascript
// Provider config
{
  name: 'Corporate SSO',
  oauth: {
    authorizationURL: 'https://sso.company.com/authorize',
    tokenURL: 'https://sso.company.com/token',
    userInfoURL: 'https://sso.company.com/userinfo',
    scope: ['openid', 'profile', 'email']
  }
}
```

### 3. Regional Social Network

```javascript
// Provider config
{
  name: 'LocalSocial',
  oauth: {
    authorizationURL: 'https://localsocial.com/oauth/authorize',
    tokenURL: 'https://localsocial.com/oauth/token',
    userInfoURL: 'https://api.localsocial.com/me',
    scope: ['basic', 'email', 'friends']
  }
}
```

## Troubleshooting

### Connection Setup Fails

**Error:** "Missing OAuth credentials"

**Solution:**
```bash
# Ensure environment variables are set
NETFLIX_CLIENT_ID=your_id
NETFLIX_CLIENT_SECRET=your_secret
```

### Profile Fetch Fails

**Error:** "Failed to fetch user profile"

**Solutions:**
1. Check access token is valid
2. Verify userinfo endpoint URL
3. Check provider API is accessible
4. Review Auth0 logs for detailed errors

### Token Expired

**Solution:** Implement token refresh:
```javascript
if (Date.now() > tokenExpiresAt) {
  await refreshProviderToken(userId, provider);
}
```

## Testing

### 1. Validate Credentials
```bash
curl http://localhost:3000/api/custom-social/validate/netflix
```

### 2. Setup Connection
```bash
curl -X POST http://localhost:3000/api/custom-social/setup/netflix
```

### 3. List Connections
```bash
curl http://localhost:3000/api/custom-social/connections
```

### 4. Test Login Flow
```javascript
// In browser console
auth0Client.loginWithRedirect({
  authorizationParams: { connection: 'netflix-custom' }
});
```

## API Response Formats

### Success Response
```json
{
  "success": true,
  "connection": {
    "id": "con_123abc",
    "name": "netflix-custom",
    "display_name": "Netflix",
    "enabled": true
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Missing OAuth credentials",
  "hint": "Set NETFLIX_CLIENT_ID and NETFLIX_CLIENT_SECRET"
}
```

## Security Best Practices

1. **Never expose client secrets** in frontend code
2. **Store tokens securely** in app_metadata, not user_metadata
3. **Use HTTPS** for all OAuth callbacks in production
4. **Implement rate limiting** on custom connection endpoints
5. **Validate all user input** from provider responses
6. **Log security events** for audit trails

## Related Documentation

- **Complete Guide:** `AUTH0_CUSTOM_SOCIAL_CONNECTIONS.md`
- **Auth0 Setup:** `AUTH0_SETUP_GUIDE.md`
- **Frontend Config:** `FRONTEND_AUTH0_CONFIG.md`
- **API Documentation:** `API_DOCUMENTATION.md`

## Support

For issues:
1. Check Auth0 logs in dashboard
2. Review server logs for errors
3. Test with Auth0 connection tester
4. Refer to complete documentation

## Summary

This implementation provides:
- ✅ Auth0 Management API integration
- ✅ Custom OAuth2 provider support
- ✅ Fetch User Profile extensibility point
- ✅ JSON format user data retrieval
- ✅ Production-ready service layer
- ✅ RESTful API endpoints
- ✅ Interactive demo page
- ✅ Comprehensive documentation

---

**Last Updated:** January 2026  
**Version:** 1.0.0
