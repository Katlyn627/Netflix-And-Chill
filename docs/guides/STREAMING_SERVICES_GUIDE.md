# Streaming Services Integration Guide

## Overview

The Netflix and Chill dating app allows users to connect their streaming service accounts to improve matching and share watch history. This guide explains how to use the streaming services features as a user and how they work technically.

## User Guide

### Connecting Streaming Services

There are two ways to connect your streaming services:

#### 1. Manual Selection (Always Available)

1. Navigate to your profile or go directly to `/streaming-services.html`
2. Browse through the available streaming services
3. Click on services you use to select them
4. Click "Save Selected Services" to save your selections

**Services Available for Manual Selection:**
- Netflix
- Hulu
- Disney+
- Amazon Prime Video
- HBO Max
- Apple TV+
- Paramount+
- Peacock
- Showtime
- Starz
- AMC+
- BritBox
- Crunchyroll
- Sling TV
- Roku Channel

#### 2. OAuth Connection (When Configured)

Some streaming services support direct OAuth login, which allows:
- Automatic account verification
- Watch history synchronization
- Real-time viewing data updates

**To connect via OAuth:**
1. Go to `/streaming-services.html?userId=YOUR_USER_ID`
2. Look for services with "OAuth Available" badge
3. Click "Connect" button
4. Sign in with your streaming service credentials
5. Authorize the connection
6. You'll be redirected back with confirmation

**Supported OAuth Providers:** (requires API keys)
- Netflix (enterprise partnership required)
- Hulu (partner access required)
- Disney+ (restricted access)
- Amazon Prime Video (limited API access)
- HBO Max (restricted access)
- Apple TV+ (Apple Developer Program required)

### Managing Connected Services

**View Your Services:**
- Go to your profile page
- See "Connected Streaming Services" section
- Services are displayed with logos

**Update Services:**
- Click "Update Streaming Services" button
- Opens the streaming services management page
- Add or remove services as needed
- Save changes

**Disconnect OAuth Services:**
- Go to streaming services page
- Click "Disconnect" on any OAuth-connected service
- Confirm disconnection
- Service will be removed and tokens revoked

### Watch History Sync

**Automatic Sync (OAuth Only):**
- When you connect via OAuth, watch history is automatically imported
- New viewing activity is synced periodically
- Duplicates are automatically filtered

**Manual Sync:**
- Use the `/api/auth/:provider/sync-history` endpoint
- Or use the sync button in the UI (when available)

**Manual Entry:**
- Add watch history items manually from your profile
- Include title, type, genre, service, and episodes watched
- System tracks watch duration and date

## Technical Documentation

### Architecture

```
Frontend (Browser)
    ↓
Streaming Services Page (streaming-services.html)
    ↓
API Service (api.js)
    ↓
Backend Routes
    ├── /api/users/:userId/streaming-services (Manual selection)
    └── /api/auth/:provider/* (OAuth flow)
           ↓
       OAuth Service (streamingOAuthService.js)
           ↓
       User Model (User.js)
```

### API Endpoints

#### Get Available Providers

```http
GET /api/streaming/providers?region=US
```

Returns list of 15 top streaming services with logos.

**Response:**
```json
{
  "region": "US",
  "count": 15,
  "providers": [
    {
      "id": 8,
      "name": "Netflix",
      "logoPath": "/path.jpg",
      "logoUrl": "https://...",
      "displayPriority": 9
    }
  ]
}
```

#### Get OAuth-Enabled Providers

```http
GET /api/auth/providers
```

Returns list of providers that have OAuth configured.

**Response:**
```json
{
  "providers": [
    {
      "id": "netflix",
      "name": "Netflix",
      "icon": "🎬",
      "color": "#E50914",
      "enabled": true
    }
  ],
  "count": 6
}
```

#### Get User's Provider Connection Status

```http
GET /api/auth/providers/status?userId=USER_ID
```

Returns connection status for all OAuth providers for a user.

**Response:**
```json
{
  "userId": "user_123",
  "providers": [
    {
      "id": "netflix",
      "name": "Netflix",
      "icon": "🎬",
      "color": "#E50914",
      "connected": true,
      "connectedAt": "2026-01-18T06:00:00Z",
      "expiresAt": "2026-01-19T06:00:00Z",
      "expired": false
    }
  ],
  "count": 1
}
```

#### Update Streaming Services (Manual)

```http
PUT /api/users/:userId/streaming-services
Content-Type: application/json

{
  "services": [
    {
      "id": 8,
      "name": "Netflix",
      "logoPath": "/path.jpg",
      "logoUrl": "https://..."
    }
  ]
}
```

**Response:**
```json
{
  "message": "Streaming services updated successfully",
  "user": {
    "streamingServices": [...]
  }
}
```

#### OAuth Flow

**1. Initiate Connection:**
```http
GET /api/auth/:provider/connect?userId=USER_ID
```
Redirects to provider's OAuth page.

**2. Callback (Automatic):**
```http
GET /api/auth/:provider/callback?code=AUTH_CODE&state=STATE_TOKEN
```
Exchanges code for token, syncs watch history, saves to user profile.

**3. Check Status:**
```http
GET /api/auth/:provider/status?userId=USER_ID
```

**4. Disconnect:**
```http
POST /api/auth/:provider/disconnect
Content-Type: application/json

{
  "userId": "USER_ID"
}
```

**5. Refresh Token:**
```http
POST /api/auth/:provider/refresh
Content-Type: application/json

{
  "userId": "USER_ID"
}
```

**6. Manual Sync:**
```http
POST /api/auth/:provider/sync-history
Content-Type: application/json

{
  "userId": "USER_ID"
}
```

### Data Models

#### User.streamingServices

```javascript
{
  "id": 8,
  "name": "Netflix",
  "logoPath": "/path.jpg",
  "logoUrl": "https://...",
  "connected": true,
  "connectedAt": "2026-01-18T06:00:00Z",
  "lastUsed": "2026-01-18T10:00:00Z",
  "totalWatchTime": 450, // minutes
  "watchCount": 5,
  "totalEpisodes": 12
}
```

#### User.streamingOAuthTokens

```javascript
{
  "netflix": {
    "accessToken": "...",
    "refreshToken": "...",
    "tokenType": "Bearer",
    "expiresIn": 3600,
    "expiresAt": "2026-01-19T06:00:00Z",
    "connectedAt": "2026-01-18T06:00:00Z",
    "scope": "viewing_history profile"
  }
}
```

#### User.watchHistory

```javascript
{
  "title": "Stranger Things",
  "type": "tvshow",
  "genre": "Sci-Fi",
  "service": "Netflix",
  "episodesWatched": 3,
  "posterPath": "/path.jpg",
  "tmdbId": 66732,
  "watchedAt": "2026-01-18T10:30:00Z",
  "watchDuration": 150, // minutes
  "sessionDate": "2026-01-18T10:30:00Z"
}
```

### Configuration

#### Environment Variables

```bash
# OAuth Configuration (Optional)
NETFLIX_OAUTH_ENABLED=false
NETFLIX_CLIENT_ID=your_client_id
NETFLIX_CLIENT_SECRET=your_client_secret
NETFLIX_REDIRECT_URI=http://localhost:3000/api/auth/netflix/callback

# Repeat for other providers: hulu, disney, prime, hbo, appletv
```

#### Config Structure

```javascript
// backend/config/config.js
streamingOAuth: {
  providers: {
    netflix: {
      enabled: process.env.NETFLIX_OAUTH_ENABLED === 'true',
      clientId: process.env.NETFLIX_CLIENT_ID,
      clientSecret: process.env.NETFLIX_CLIENT_SECRET,
      redirectUri: process.env.NETFLIX_REDIRECT_URI,
      authUrl: 'https://www.netflix.com/oauth/authorize',
      tokenUrl: 'https://www.netflix.com/oauth/token',
      apiUrl: 'https://api.netflix.com/v1',
      revokeUrl: 'https://www.netflix.com/oauth/revoke',
      scope: 'viewing_history profile'
    }
  }
}
```

### Security Features

1. **CSRF Protection:** State tokens with 10-minute expiry
2. **Rate Limiting:** 
   - Auth endpoints: 10 requests / 15 minutes
   - API endpoints: 100 requests / 15 minutes
3. **Token Security:**
   - Tokens stored securely in user profile
   - Automatic expiry checking
   - Token refresh support
4. **Constant-Time Comparison:** For API key validation

### Matching Algorithm Integration

Services are used in the matching algorithm to calculate compatibility:

**Active Service Compatibility (0-10 points):**
- 3+ actively shared services: 10 points
- 2 actively shared services: 7 points
- 1 actively shared service: 4 points
- Shared but not actively used: 1 point

**Viewing Frequency Compatibility (0-12 points):**
- Perfect match (same frequency): 12 points
- Adjacent frequencies: 8 points
- Moderate difference: 5 points
- Large difference: 2 points

## Troubleshooting

### OAuth Not Working

1. **Check if provider is enabled:**
   ```bash
   curl http://localhost:3000/api/auth/providers
   ```

2. **Verify environment variables:**
   - Check `.env` file
   - Ensure `ENABLED=true`
   - Verify client ID/secret are not placeholders

3. **Check redirect URI:**
   - Must match exactly in OAuth provider settings
   - Include protocol (http/https)
   - Check for trailing slashes

### Services Not Saving

1. **Check request format:**
   - Must be array of service objects
   - Each service must have `name` property
   - Use correct endpoint: `PUT /api/users/:userId/streaming-services`

2. **Verify user exists:**
   ```bash
   curl http://localhost:3000/api/users/USER_ID
   ```

### Watch History Not Syncing

1. **Check OAuth token validity:**
   ```bash
   curl http://localhost:3000/api/auth/PROVIDER/status?userId=USER_ID
   ```

2. **Manual sync:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/PROVIDER/sync-history \
     -H "Content-Type: application/json" \
     -d '{"userId":"USER_ID"}'
   ```

3. **Check provider API access:**
   - Most providers have restricted APIs
   - May need enterprise partnership
   - Check provider's developer documentation

## Best Practices

### For Users

1. Connect as many services as you use for better matches
2. Keep your watch history updated
3. Disconnect services you no longer use
4. Check connection status periodically

### For Developers

1. Always check if OAuth is enabled before showing OAuth UI
2. Provide fallback to manual selection
3. Handle OAuth failures gracefully
4. Validate all user inputs
5. Rate limit API calls
6. Store tokens securely
7. Provide clear error messages
8. Test with different provider configurations

## Future Enhancements

1. **Browser Extension:** Extract watch history from streaming sites
2. **Email Parsing:** Parse viewing confirmation emails
3. **Webhook Support:** Real-time updates from providers
4. **Profile Recommendations:** Suggest new services based on matches
5. **Service Stats:** Detailed analytics per service
6. **Shared Watchlist:** Create watchlists with matches
7. **Watch Together:** Synchronized viewing sessions

## Support

For issues or questions:
- Check troubleshooting section
- Review API documentation
- Contact support team
- Submit GitHub issue
