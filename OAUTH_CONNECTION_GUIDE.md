# OAuth Connection Guide for Streaming Services

## Overview
This guide explains how to connect streaming services using OAuth for the Netflix-And-Chill application.

## What Was Fixed
The OAuth flow was previously failing with the error:
```
TypeError: database.getUser is not a function
```

This has been resolved by:
1. Updating the database import to use the correct `getDatabase()` function
2. Wrapping user data in User class instances to enable OAuth token methods

## How OAuth Connection Works

### 1. Initiating the Connection
**Endpoint:** `GET /api/auth/:provider/connect`

**Parameters:**
- `provider`: The streaming service (netflix, hulu, disney, prime, hbo, appletv)
- `userId`: The user's ID (passed as query parameter)

**Example:**
```
GET /api/auth/netflix/connect?userId=user_1234567890_abc123
```

This endpoint will:
- Verify the user exists
- Check if OAuth is enabled for the provider
- Generate a CSRF state token for security
- Redirect to the provider's OAuth authorization page

### 2. OAuth Callback
**Endpoint:** `GET /api/auth/:provider/callback`

**Parameters:**
- `code`: Authorization code from the provider
- `state`: CSRF state token for validation

This endpoint automatically:
- Exchanges the authorization code for access/refresh tokens
- Stores the tokens securely in the user's profile
- Adds the streaming service to the user's connected services
- Attempts to sync watch history
- Redirects to the streaming services page with success status

### 3. Checking Connection Status
**Endpoint:** `GET /api/auth/:provider/status`

**Parameters:**
- `provider`: The streaming service name
- `userId`: The user's ID (query parameter)

**Response:**
```json
{
  "provider": "netflix",
  "connected": true,
  "connectedAt": "2024-01-15T10:30:00Z",
  "expiresAt": "2024-02-15T10:30:00Z",
  "expired": false
}
```

### 4. Getting All Provider Statuses
**Endpoint:** `GET /api/auth/providers/status`

**Parameters:**
- `userId`: The user's ID (query parameter)

**Response:**
```json
{
  "userId": "user_1234567890_abc123",
  "providers": [
    {
      "id": "netflix",
      "name": "Netflix",
      "icon": "🎬",
      "color": "#E50914",
      "connected": true,
      "connectedAt": "2024-01-15T10:30:00Z",
      "expiresAt": "2024-02-15T10:30:00Z",
      "expired": false
    }
  ],
  "count": 6
}
```

### 5. Disconnecting a Service
**Endpoint:** `POST /api/auth/:provider/disconnect`

**Body:**
```json
{
  "userId": "user_1234567890_abc123"
}
```

This will:
- Remove the OAuth tokens
- Revoke the token on the provider's side
- Remove the service from the user's connected services

### 6. Refreshing Access Tokens
**Endpoint:** `POST /api/auth/:provider/refresh`

**Body:**
```json
{
  "userId": "user_1234567890_abc123"
}
```

This will refresh expired access tokens using the refresh token.

### 7. Syncing Watch History
**Endpoint:** `POST /api/auth/:provider/sync-history`

**Body:**
```json
{
  "userId": "user_1234567890_abc123"
}
```

This will fetch and merge watch history from the connected streaming service.

## Supported Providers
- **netflix** - Netflix
- **hulu** - Hulu
- **disney** - Disney+
- **prime** - Amazon Prime Video
- **hbo** - HBO Max
- **appletv** - Apple TV+

## Security Features
1. **CSRF Protection**: State tokens prevent cross-site request forgery attacks
2. **Rate Limiting**: All OAuth endpoints are rate-limited to prevent abuse
3. **Token Expiration**: Access tokens have expiration times and can be refreshed
4. **Secure Storage**: Tokens are stored securely in the user's profile

## Error Handling
All endpoints return appropriate HTTP status codes:
- `200` - Success
- `400` - Bad request (missing parameters, invalid provider)
- `401` - Unauthorized (expired token)
- `404` - User not found
- `500` - Server error

## Frontend Integration Example
```javascript
// Initiate OAuth flow
const connectStreamingService = (provider, userId) => {
  window.location.href = `/api/auth/${provider}/connect?userId=${userId}`;
};

// Check connection status
const checkConnectionStatus = async (provider, userId) => {
  const response = await fetch(`/api/auth/${provider}/status?userId=${userId}`);
  const data = await response.json();
  return data.connected;
};

// Disconnect service
const disconnectService = async (provider, userId) => {
  const response = await fetch(`/api/auth/${provider}/disconnect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });
  return response.json();
};
```

## Testing the Fix
To verify the OAuth flow is working:
1. Start the backend server: `npm start`
2. Navigate to the streaming services page
3. Click "Connect" on any streaming service
4. The OAuth flow should now work without the "database.getUser is not a function" error

## Technical Notes
- User data from the database is now properly wrapped in User class instances
- All OAuth token methods (setStreamingOAuthToken, getStreamingOAuthToken, etc.) are available
- The fix follows the same pattern used throughout the codebase (userController.js)
