# Step-by-Step: Connect to Streaming Services and Link Watch History

## 📋 Complete Implementation Guide

This guide provides a **comprehensive, step-by-step** walkthrough of how to connect to streaming services, access watch history data, and use it for matching in the Netflix and Chill dating app.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture & Data Flow](#architecture--data-flow)
3. [Method 1: OAuth Integration (Automatic)](#method-1-oauth-integration-automatic)
4. [Method 2: Manual Selection](#method-2-manual-selection)
5. [Watch History Synchronization](#watch-history-synchronization)
6. [Matching Algorithm Integration](#matching-algorithm-integration)
7. [Testing Your Implementation](#testing-your-implementation)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The Netflix and Chill app supports **two methods** for connecting streaming services:

### Method 1: OAuth Integration (Automatic) 🔐
- Direct login to streaming platforms
- Automatic watch history synchronization
- Real-time data updates
- Requires API keys from each platform

### Method 2: Manual Selection (Always Available) ✅
- Select services you subscribe to
- Manual watch history entry
- No API keys required
- Works immediately out of the box

Both methods feed into the **matching algorithm** to find compatible users based on:
- Shared streaming platforms
- Common watch history
- Viewing patterns and preferences
- Genre compatibility

---

## Architecture & Data Flow

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer                            │
│  ┌─────────────────────┐    ┌────────────────────────┐     │
│  │ Profile View        │    │ Streaming Services     │     │
│  │ (profile-view.js)   │◄───┤ (streaming-services.   │     │
│  │                     │    │  html)                 │     │
│  └─────────────────────┘    └────────────────────────┘     │
└──────────────────┬──────────────────┬──────────────────────┘
                   │                  │
                   │ API Calls        │
                   │                  │
┌──────────────────▼──────────────────▼──────────────────────┐
│                    Backend API Layer                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────┐ │
│  │ User Routes     │  │ Auth Routes     │  │ Streaming  │ │
│  │ (users.js)      │  │ (auth.js)       │  │ (streaming │ │
│  │                 │  │                 │  │  .js)      │ │
│  └────────┬────────┘  └────────┬────────┘  └──────┬─────┘ │
│           │                    │                    │        │
└───────────┼────────────────────┼────────────────────┼───────┘
            │                    │                    │
┌───────────▼────────────────────▼────────────────────▼───────┐
│                    Service Layer                             │
│  ┌──────────────────────────┐  ┌─────────────────────────┐ │
│  │ streamingOAuthService.js │  │ streamingAPIService.js  │ │
│  │ - OAuth flow             │  │ - TMDB integration      │ │
│  │ - Token management       │  │ - Content search        │ │
│  │ - Watch history sync     │  │ - Provider lookup       │ │
│  └────────────┬─────────────┘  └───────────┬─────────────┘ │
└───────────────┼────────────────────────────┼────────────────┘
                │                            │
┌───────────────▼────────────────────────────▼────────────────┐
│                    Data Layer                                │
│  ┌─────────────────┐    ┌──────────────────────────┐       │
│  │ User Model      │    │ Matching Engine          │       │
│  │ - Profile data  │◄───┤ (matchingEngine.js)      │       │
│  │ - Services      │    │ - Compatibility scoring  │       │
│  │ - Watch history │    │ - Algorithm processing   │       │
│  │ - OAuth tokens  │    │                          │       │
│  └─────────────────┘    └──────────────────────────┘       │
└──────────────────────────────────────────────────────────────┘
```

### Data Storage Structure

**User Model - Streaming Services:**
```javascript
user.streamingServices = [
  {
    id: 8,                          // TMDB provider ID
    name: "Netflix",                // Service name
    logoPath: "/path/to/logo.jpg",  // TMDB logo path
    logoUrl: "https://...",         // Full logo URL
    connected: true,                // OAuth connected?
    connectedAt: "2026-01-18T...",  // Connection timestamp
    lastUsed: "2026-01-18T...",     // Last activity
    totalWatchTime: 450,            // Minutes watched
    watchCount: 5,                  // Items watched
    totalEpisodes: 12               // Episodes watched
  }
  // ... more services
]
```

**User Model - OAuth Tokens:**
```javascript
user.streamingOAuthTokens = {
  netflix: {
    accessToken: "encrypted_token",     // Access token
    refreshToken: "encrypted_token",    // Refresh token
    expiresAt: "2026-01-19T...",       // Token expiration
    connectedAt: "2026-01-18T...",     // Connection time
    scope: "viewing.history profile"   // Granted permissions
  }
  // ... more providers
}
```

**User Model - Watch History:**
```javascript
user.watchHistory = [
  {
    title: "Stranger Things",           // Content title
    type: "tvshow",                     // Type: movie/tvshow
    genre: "Sci-Fi",                    // Primary genre
    service: "Netflix",                 // Where watched
    episodesWatched: 3,                 // Episodes count
    tmdbId: 66732,                      // TMDB ID
    watchedAt: "2026-01-18T...",       // Watch timestamp
    watchDuration: 150,                 // Minutes watched
    season: 1,                          // Season number
    lastEpisode: 3                      // Last episode
  }
  // ... more items
]
```

---

## Method 1: OAuth Integration (Automatic)

### Step 1: Configure OAuth Provider

First, set up your environment variables for each streaming platform:

**`.env` file:**
```bash
# Netflix OAuth Configuration
NETFLIX_OAUTH_ENABLED=true
NETFLIX_CLIENT_ID=your_netflix_client_id
NETFLIX_CLIENT_SECRET=your_netflix_client_secret
NETFLIX_REDIRECT_URI=http://localhost:3000/api/auth/netflix/callback
NETFLIX_AUTH_URL=https://www.netflix.com/oauth/authorize
NETFLIX_TOKEN_URL=https://www.netflix.com/oauth/token
NETFLIX_API_BASE_URL=https://api.netflix.com/v1
NETFLIX_SCOPE=viewing.history profile

# Hulu OAuth Configuration
HULU_OAUTH_ENABLED=true
HULU_CLIENT_ID=your_hulu_client_id
HULU_CLIENT_SECRET=your_hulu_client_secret
HULU_REDIRECT_URI=http://localhost:3000/api/auth/hulu/callback
HULU_AUTH_URL=https://auth.hulu.com/v1/authorize
HULU_TOKEN_URL=https://auth.hulu.com/v1/token
HULU_API_BASE_URL=https://api.hulu.com/v1
HULU_SCOPE=viewing:read profile:read

# Add similar configs for Disney+, Prime, HBO Max, Apple TV+
```

**Important Notes:**
- Most streaming platforms require **enterprise partnerships** or **developer programs**
- Public API access is extremely limited
- You may need to apply and be approved before getting credentials
- See [API_KEYS_GUIDE.md](docs/guides/API_KEYS_GUIDE.md) for platform-specific instructions

### Step 2: User Initiates OAuth Connection

**Frontend Code (streaming-services.html):**

The user clicks a "Connect" button, which triggers:

```javascript
async function connectOAuthProvider(providerId, userId) {
  try {
    // Show loading state
    const button = document.querySelector(`[data-provider="${providerId}"]`);
    button.textContent = 'Connecting...';
    button.disabled = true;
    
    // Redirect to OAuth initiation endpoint
    // Backend will generate state token and redirect to provider
    window.location.href = `/api/auth/${providerId}/connect?userId=${encodeURIComponent(userId)}`;
  } catch (error) {
    console.error('OAuth connection error:', error);
    alert('Failed to connect. Please try again.');
  }
}
```

### Step 3: Backend Generates Authorization URL

**Backend Code (backend/routes/auth.js):**

```javascript
// GET /api/auth/:provider/connect
router.get('/:provider/connect', rateLimiters.auth, async (req, res) => {
  const { provider } = req.params;
  const { userId } = req.query;
  
  // 1. Validate user exists
  const user = await database.getUser(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  // 2. Check if OAuth is configured for this provider
  if (!streamingOAuthService.isProviderEnabled(provider)) {
    return res.status(400).json({ 
      error: `OAuth not configured for provider: ${provider}` 
    });
  }
  
  // 3. Generate CSRF state token (security measure)
  const state = crypto.randomBytes(32).toString('hex');
  
  // 4. Store state with userId (expires in 10 minutes)
  stateStore.set(state, {
    userId,
    provider,
    createdAt: Date.now()
  });
  
  // 5. Get authorization URL from OAuth service
  const authUrl = streamingOAuthService.getAuthorizationUrl(provider, state);
  
  // 6. Redirect user to streaming platform's login page
  res.redirect(authUrl);
});
```

### Step 4: User Authorizes on Streaming Platform

The user is now on the streaming platform's website (e.g., netflix.com):

```
┌─────────────────────────────────────────────┐
│  Netflix Login                               │
│                                              │
│  Email:    [user@example.com        ]       │
│  Password: [******************      ]       │
│                                              │
│  [ Sign In ]                                 │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  Authorization Request                       │
│                                              │
│  Netflix and Chill wants permission to:     │
│  ✓ View your watch history                  │
│  ✓ View your profile information            │
│                                              │
│  [ Deny ]  [ Allow ]                        │
└─────────────────────────────────────────────┘
```

When user clicks "Allow", they are redirected back to your app:
```
http://localhost:3000/api/auth/netflix/callback?code=AUTH_CODE&state=STATE_TOKEN
```

### Step 5: Backend Receives OAuth Callback

**Backend Code (backend/routes/auth.js):**

```javascript
// GET /api/auth/:provider/callback
router.get('/:provider/callback', rateLimiters.auth, async (req, res) => {
  const { provider } = req.params;
  const { code, state, error } = req.query;
  
  // 1. Check for OAuth errors from provider
  if (error) {
    console.error('OAuth error:', error);
    return res.redirect(`/streaming-services.html?error=${encodeURIComponent(error)}`);
  }
  
  // 2. Verify CSRF state token
  const stateData = stateStore.get(state);
  if (!stateData) {
    return res.status(400).json({ error: 'Invalid or expired state token' });
  }
  
  const { userId } = stateData;
  stateStore.delete(state); // Use token only once
  
  // 3. Exchange authorization code for access token
  try {
    const tokenData = await streamingOAuthService.exchangeCodeForToken(provider, code);
    
    // tokenData contains:
    // - access_token
    // - refresh_token
    // - expires_in
    // - token_type
    // - scope
    
    // 4. Store tokens securely in user profile
    await database.updateUser(userId, {
      [`streamingOAuthTokens.${provider}`]: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
        connectedAt: new Date(),
        scope: tokenData.scope
      }
    });
    
    // 5. Add service to user's streaming services list
    const providerInfo = await streamingAPIService.getProviderInfo(provider);
    await database.addStreamingService(userId, {
      id: providerInfo.id,
      name: providerInfo.name,
      logoPath: providerInfo.logoPath,
      logoUrl: providerInfo.logoUrl,
      connected: true,
      connectedAt: new Date()
    });
    
    // 6. Sync watch history from provider
    await streamingOAuthService.syncWatchHistory(userId, provider, tokenData.access_token);
    
    // 7. Redirect back to streaming services page with success
    res.redirect(`/streaming-services.html?userId=${encodeURIComponent(userId)}&success=true&provider=${provider}`);
    
  } catch (error) {
    console.error('Token exchange error:', error);
    res.redirect(`/streaming-services.html?userId=${encodeURIComponent(userId)}&error=token_exchange_failed`);
  }
});
```

### Step 6: Sync Watch History

**Backend Code (backend/services/streamingOAuthService.js):**

```javascript
/**
 * Sync watch history from streaming platform
 */
async syncWatchHistory(userId, provider, accessToken) {
  const providerConfig = this.providers[provider];
  
  if (!providerConfig || !providerConfig.enabled) {
    throw new Error(`OAuth not configured for provider: ${provider}`);
  }
  
  const fetch = (await import('node-fetch')).default;
  
  try {
    // 1. Fetch watch history from provider API
    const response = await fetch(`${providerConfig.apiBaseUrl}/viewing-history`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch watch history: ${response.status}`);
    }
    
    const data = await response.json();
    
    // 2. Normalize data format (each provider has different format)
    const normalizedHistory = this.normalizeWatchHistory(provider, data);
    
    // 3. Get user's existing watch history
    const user = await database.getUser(userId);
    const existingHistory = user.watchHistory || [];
    
    // 4. Filter out duplicates (same title + service + watch date)
    const newItems = normalizedHistory.filter(item => {
      return !existingHistory.some(existing => 
        existing.title === item.title &&
        existing.service === item.service &&
        existing.tmdbId === item.tmdbId
      );
    });
    
    // 5. Add new items to watch history
    if (newItems.length > 0) {
      await database.addToWatchHistory(userId, newItems);
      console.log(`Synced ${newItems.length} new watch history items for user ${userId}`);
    }
    
    // 6. Update service statistics
    await database.updateStreamingServiceStats(userId, provider, {
      lastUsed: new Date(),
      totalWatchTime: normalizedHistory.reduce((sum, item) => sum + (item.watchDuration || 0), 0),
      watchCount: normalizedHistory.length,
      totalEpisodes: normalizedHistory.reduce((sum, item) => sum + (item.episodesWatched || 0), 0)
    });
    
    return {
      success: true,
      itemsSynced: newItems.length,
      totalItems: normalizedHistory.length
    };
    
  } catch (error) {
    console.error(`Error syncing watch history for ${provider}:`, error);
    throw error;
  }
}

/**
 * Normalize watch history data from different providers
 */
normalizeWatchHistory(provider, rawData) {
  // Each provider returns data in different format
  switch (provider) {
    case 'netflix':
      return rawData.viewingActivity.map(item => ({
        title: item.title,
        type: item.seriesTitle ? 'tvshow' : 'movie',
        genre: item.genres?.[0] || 'Unknown',
        service: 'Netflix',
        episodesWatched: item.episodeTitle ? 1 : undefined,
        season: item.seasonDescriptor,
        lastEpisode: item.episodeDescriptor,
        watchedAt: new Date(item.dateStr),
        watchDuration: item.duration || 0,
        tmdbId: item.tmdbId // If available
      }));
      
    case 'hulu':
      return rawData.history.map(item => ({
        title: item.name,
        type: item.type,
        genre: item.genre,
        service: 'Hulu',
        episodesWatched: item.episodes_watched,
        season: item.season_number,
        watchedAt: new Date(item.watched_at),
        watchDuration: item.watch_duration,
        tmdbId: item.tmdb_id
      }));
      
    // Add cases for other providers...
    
    default:
      return [];
  }
}
```

### Step 7: Display Connection Status

**Frontend Code (streaming-services.html):**

```javascript
async function updateConnectionStatus() {
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('userId');
  
  if (!userId) return;
  
  try {
    // Fetch connection status for all providers
    const response = await fetch(`/api/auth/providers/status?userId=${encodeURIComponent(userId)}`);
    const data = await response.json();
    
    // Update UI for each provider
    data.providers.forEach(provider => {
      const card = document.querySelector(`[data-provider="${provider.id}"]`);
      if (!card) return;
      
      if (provider.connected) {
        // Show as connected
        card.classList.add('connected');
        card.querySelector('.service-status').textContent = '✓ Connected';
        card.querySelector('.connect-btn').textContent = 'Disconnect';
        
        // Show sync info if available
        if (provider.lastSynced) {
          const syncInfo = document.createElement('div');
          syncInfo.className = 'sync-info';
          syncInfo.textContent = `Last synced: ${new Date(provider.lastSynced).toLocaleDateString()}`;
          card.appendChild(syncInfo);
        }
      } else {
        // Show as disconnected
        card.classList.remove('connected');
        card.querySelector('.service-status').textContent = 'Not connected';
        card.querySelector('.connect-btn').textContent = 'Connect';
      }
    });
    
    // Show success message if just connected
    if (urlParams.get('success') === 'true') {
      const provider = urlParams.get('provider');
      showNotification(`Successfully connected to ${provider}!`, 'success');
    }
    
  } catch (error) {
    console.error('Error fetching connection status:', error);
  }
}
```

---

## Method 2: Manual Selection

Manual selection is simpler and doesn't require OAuth configuration. It's perfect for development and for services without API access.

### Step 1: Display Available Services

**Frontend Code (streaming-services.html):**

```javascript
async function loadStreamingProviders() {
  try {
    // Fetch list of available providers from TMDB
    const response = await fetch('/api/streaming/providers?region=US');
    const data = await response.json();
    
    const grid = document.querySelector('.manual-services-grid');
    grid.innerHTML = '';
    
    // Display each provider
    data.providers.forEach(provider => {
      const card = document.createElement('div');
      card.className = 'service-card';
      card.dataset.providerId = provider.id;
      
      card.innerHTML = `
        <img src="${provider.logoUrl}" 
             alt="${provider.name}" 
             class="service-logo"
             onerror="this.src='/assets/images/default-service.png'">
        <div class="service-name">${provider.name}</div>
        <div class="service-status">Click to select</div>
      `;
      
      // Add click handler for selection
      card.addEventListener('click', () => toggleServiceSelection(card, provider));
      
      grid.appendChild(card);
    });
    
    // Load user's current selections
    await loadCurrentSelections();
    
  } catch (error) {
    console.error('Error loading providers:', error);
    showNotification('Failed to load streaming services', 'error');
  }
}

function toggleServiceSelection(card, provider) {
  card.classList.toggle('selected');
  
  if (card.classList.contains('selected')) {
    card.querySelector('.service-status').textContent = '✓ Selected';
    // Add to selected services array
    selectedServices.push(provider);
  } else {
    card.querySelector('.service-status').textContent = 'Click to select';
    // Remove from selected services array
    selectedServices = selectedServices.filter(s => s.id !== provider.id);
  }
}
```

### Step 2: Save Selected Services

**Frontend Code:**

```javascript
async function saveSelectedServices() {
  const userId = getCurrentUserId();
  
  if (!userId) {
    alert('Please log in first');
    return;
  }
  
  if (selectedServices.length === 0) {
    alert('Please select at least one streaming service');
    return;
  }
  
  try {
    // Show loading state
    const saveBtn = document.querySelector('.save-btn');
    saveBtn.textContent = 'Saving...';
    saveBtn.disabled = true;
    
    // Send to backend
    const response = await fetch(`/api/users/${userId}/streaming-services`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        services: selectedServices.map(service => ({
          id: service.id,
          name: service.name,
          logoPath: service.logoPath,
          logoUrl: service.logoUrl,
          connected: false, // Manual selection = not OAuth connected
          connectedAt: new Date().toISOString()
        }))
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to save services');
    }
    
    const data = await response.json();
    
    // Show success message
    showNotification('Streaming services saved successfully!', 'success');
    
    // Redirect back to profile after 1 second
    setTimeout(() => {
      window.location.href = `/profile-view.html?userId=${encodeURIComponent(userId)}`;
    }, 1000);
    
  } catch (error) {
    console.error('Error saving services:', error);
    showNotification('Failed to save services. Please try again.', 'error');
    
    // Reset button
    saveBtn.textContent = 'Save Selected Services';
    saveBtn.disabled = false;
  }
}
```

### Step 3: Backend Saves Services

**Backend Code (backend/routes/users.js):**

```javascript
// PUT /api/users/:userId/streaming-services
router.put('/:userId/streaming-services', async (req, res) => {
  try {
    const { userId } = req.params;
    const { services } = req.body;
    
    // 1. Validate input
    if (!services || !Array.isArray(services)) {
      return res.status(400).json({ error: 'Services array is required' });
    }
    
    // 2. Validate each service
    const validatedServices = services.map(service => {
      // Validate required fields
      if (!service.id || !service.name) {
        throw new Error('Each service must have id and name');
      }
      
      // Validate logo URL (must be HTTPS)
      if (service.logoUrl && !service.logoUrl.startsWith('https://')) {
        throw new Error('Logo URL must use HTTPS');
      }
      
      return {
        id: parseInt(service.id),
        name: service.name.trim(),
        logoPath: service.logoPath || '',
        logoUrl: service.logoUrl || '',
        connected: service.connected || false,
        connectedAt: service.connectedAt || new Date().toISOString(),
        lastUsed: service.lastUsed || null,
        totalWatchTime: service.totalWatchTime || 0,
        watchCount: service.watchCount || 0,
        totalEpisodes: service.totalEpisodes || 0
      };
    });
    
    // 3. Update user's streaming services
    const updatedUser = await database.updateUser(userId, {
      streamingServices: validatedServices,
      updatedAt: new Date()
    });
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // 4. Return success
    res.json({
      success: true,
      message: 'Streaming services updated successfully',
      services: updatedUser.streamingServices
    });
    
  } catch (error) {
    console.error('Error updating streaming services:', error);
    res.status(500).json({ error: error.message || 'Failed to update streaming services' });
  }
});
```

---

## Watch History Synchronization

Watch history is the key to finding compatible matches. Here's how it works:

### Adding Watch History Manually

**Frontend Code (profile-view.js):**

```javascript
async function addToWatchHistory() {
  const userId = getCurrentUserId();
  
  // 1. Show search modal for content
  const searchTerm = prompt('Search for a movie or TV show:');
  if (!searchTerm) return;
  
  try {
    // 2. Search TMDB for content
    const response = await fetch(`/api/streaming/search?query=${encodeURIComponent(searchTerm)}`);
    const data = await response.json();
    
    if (data.results.length === 0) {
      alert('No results found');
      return;
    }
    
    // 3. Show results to user (simplified - should be a modal)
    const selectedItem = data.results[0]; // In real app, user selects from list
    
    // 4. Ask which service they watched it on
    const service = prompt('Which service did you watch this on? (e.g., Netflix, Hulu)');
    if (!service) return;
    
    // 5. Add to watch history
    const historyResponse = await fetch(`/api/users/${userId}/watch-history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: selectedItem.title,
        type: selectedItem.type,
        genre: selectedItem.genres?.[0] || 'Unknown',
        service: service,
        tmdbId: selectedItem.id,
        posterPath: selectedItem.posterPath,
        watchedAt: new Date().toISOString(),
        episodesWatched: selectedItem.type === 'tvshow' ? 
          parseInt(prompt('How many episodes did you watch?') || '1') : undefined
      })
    });
    
    if (historyResponse.ok) {
      alert('Added to watch history!');
      refreshWatchHistory();
    }
    
  } catch (error) {
    console.error('Error adding to watch history:', error);
    alert('Failed to add to watch history');
  }
}
```

### Backend Watch History Endpoint

**Backend Code (backend/routes/users.js):**

```javascript
// POST /api/users/:userId/watch-history
router.post('/:userId/watch-history', async (req, res) => {
  try {
    const { userId } = req.params;
    const historyItem = req.body;
    
    // 1. Validate input
    if (!historyItem.title || !historyItem.type || !historyItem.service) {
      return res.status(400).json({ 
        error: 'title, type, and service are required' 
      });
    }
    
    // 2. Create watch history entry
    const entry = {
      title: historyItem.title.trim(),
      type: historyItem.type,
      genre: historyItem.genre || 'Unknown',
      service: historyItem.service.trim(),
      episodesWatched: historyItem.episodesWatched || (historyItem.type === 'movie' ? undefined : 1),
      season: historyItem.season,
      lastEpisode: historyItem.lastEpisode,
      tmdbId: historyItem.tmdbId,
      posterPath: historyItem.posterPath,
      watchedAt: historyItem.watchedAt || new Date().toISOString(),
      watchDuration: historyItem.watchDuration || 0
    };
    
    // 3. Get user
    const user = await database.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // 4. Check for duplicates
    const isDuplicate = (user.watchHistory || []).some(item => 
      item.title === entry.title &&
      item.service === entry.service &&
      item.tmdbId === entry.tmdbId
    );
    
    if (isDuplicate) {
      return res.status(409).json({ 
        error: 'This item is already in your watch history' 
      });
    }
    
    // 5. Add to watch history
    const watchHistory = [...(user.watchHistory || []), entry];
    
    // 6. Update user
    await database.updateUser(userId, {
      watchHistory,
      updatedAt: new Date()
    });
    
    // 7. Update service statistics
    const service = user.streamingServices?.find(s => s.name === entry.service);
    if (service) {
      await database.updateStreamingServiceStats(userId, service.name, {
        lastUsed: new Date(),
        watchCount: (service.watchCount || 0) + 1,
        totalEpisodes: (service.totalEpisodes || 0) + (entry.episodesWatched || 0),
        totalWatchTime: (service.totalWatchTime || 0) + (entry.watchDuration || 0)
      });
    }
    
    // 8. Return success
    res.json({
      success: true,
      message: 'Added to watch history',
      entry: entry,
      totalItems: watchHistory.length
    });
    
  } catch (error) {
    console.error('Error adding to watch history:', error);
    res.status(500).json({ error: 'Failed to add to watch history' });
  }
});
```

---

## Matching Algorithm Integration

Now that we have streaming services and watch history data, let's see how it's used for matching:

### Compatibility Scoring

**Backend Code (backend/utils/matchingEngine.js):**

```javascript
/**
 * Calculate compatibility score between two users
 * Returns a score from 0-100
 */
function calculateCompatibility(user1, user2) {
  let score = 0;
  const factors = [];
  
  // Factor 1: Shared Streaming Services (0-30 points)
  const sharedServicesScore = calculateSharedServices(user1, user2);
  score += sharedServicesScore;
  factors.push({
    name: 'Shared Streaming Services',
    score: sharedServicesScore,
    maxScore: 30
  });
  
  // Factor 2: Shared Watch History (0-40 points)
  const sharedHistoryScore = calculateSharedHistory(user1, user2);
  score += sharedHistoryScore;
  factors.push({
    name: 'Shared Watch History',
    score: sharedHistoryScore,
    maxScore: 40
  });
  
  // Factor 3: Genre Preferences (0-15 points)
  const genreScore = calculateGenreCompatibility(user1, user2);
  score += genreScore;
  factors.push({
    name: 'Genre Preferences',
    score: genreScore,
    maxScore: 15
  });
  
  // Factor 4: Viewing Frequency (0-15 points)
  const frequencyScore = calculateFrequencyMatch(user1, user2);
  score += frequencyScore;
  factors.push({
    name: 'Viewing Frequency',
    score: frequencyScore,
    maxScore: 15
  });
  
  return {
    totalScore: Math.min(100, score),
    factors: factors,
    breakdown: {
      sharedServices: sharedServicesScore,
      sharedHistory: sharedHistoryScore,
      genreMatch: genreScore,
      frequencyMatch: frequencyScore
    }
  };
}

/**
 * Calculate score based on shared streaming services
 * 10 points per shared service, max 30 points
 */
function calculateSharedServices(user1, user2) {
  const services1 = user1.streamingServices || [];
  const services2 = user2.streamingServices || [];
  
  if (services1.length === 0 || services2.length === 0) {
    return 0;
  }
  
  // Find services that both users have
  const sharedServices = services1.filter(s1 => 
    services2.some(s2 => s2.id === s1.id || s2.name === s1.name)
  );
  
  // 10 points per shared service, capped at 30
  return Math.min(sharedServices.length * 10, 30);
}

/**
 * Calculate score based on shared watch history
 * 20 points per shared item, max 40 points
 */
function calculateSharedHistory(user1, user2) {
  const history1 = user1.watchHistory || [];
  const history2 = user2.watchHistory || [];
  
  if (history1.length === 0 || history2.length === 0) {
    return 0;
  }
  
  // Find items that both users have watched
  const sharedItems = history1.filter(h1 => 
    history2.some(h2 => 
      h2.tmdbId === h1.tmdbId || // Match by TMDB ID
      (h2.title.toLowerCase() === h1.title.toLowerCase() && h2.type === h1.type) // Or by title+type
    )
  );
  
  // Weight recent watches more heavily
  const weightedScore = sharedItems.reduce((sum, item) => {
    const daysSinceWatched = (Date.now() - new Date(item.watchedAt)) / (1000 * 60 * 60 * 24);
    const recencyWeight = daysSinceWatched < 30 ? 1.5 : 
                          daysSinceWatched < 90 ? 1.2 : 1.0;
    return sum + (20 * recencyWeight);
  }, 0);
  
  // Cap at 40 points
  return Math.min(weightedScore, 40);
}

/**
 * Calculate score based on genre preferences
 * 5 points per shared genre, max 15 points
 */
function calculateGenreCompatibility(user1, user2) {
  const genres1 = user1.preferences?.genres || [];
  const genres2 = user2.preferences?.genres || [];
  
  if (genres1.length === 0 || genres2.length === 0) {
    return 0;
  }
  
  // Find shared genres
  const sharedGenres = genres1.filter(g1 => 
    genres2.some(g2 => g2.toLowerCase() === g1.toLowerCase())
  );
  
  // 5 points per shared genre, capped at 15
  return Math.min(sharedGenres.length * 5, 15);
}

/**
 * Calculate score based on viewing frequency match
 * 15 points for same frequency, 10 for adjacent, 0 for very different
 */
function calculateFrequencyMatch(user1, user2) {
  const freq1 = user1.preferences?.bingeWatchingCount || 0;
  const freq2 = user2.preferences?.bingeWatchingCount || 0;
  
  const difference = Math.abs(freq1 - freq2);
  
  if (difference === 0) return 15; // Exact match
  if (difference <= 1) return 10; // Close match
  if (difference <= 2) return 5;  // Moderate match
  return 0; // Very different
}
```

### Finding Matches

**Backend Code (backend/routes/matches.js):**

```javascript
// GET /api/matches/find/:userId
router.get('/find/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { minScore = 30 } = req.query; // Minimum compatibility score
    
    // 1. Get current user
    const currentUser = await database.getUser(userId);
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // 2. Get all other users
    const allUsers = await database.getAllUsers();
    const otherUsers = allUsers.filter(u => u.userId !== userId);
    
    // 3. Calculate compatibility with each user
    const matches = otherUsers.map(otherUser => {
      const compatibility = calculateCompatibility(currentUser, otherUser);
      
      return {
        userId: otherUser.userId,
        username: otherUser.username,
        age: otherUser.age,
        location: otherUser.location,
        bio: otherUser.bio,
        profilePicture: otherUser.profilePicture,
        streamingServices: otherUser.streamingServices,
        compatibilityScore: compatibility.totalScore,
        compatibilityFactors: compatibility.factors,
        compatibilityBreakdown: compatibility.breakdown,
        // Show shared content
        sharedServices: getSharedServices(currentUser, otherUser),
        sharedWatchHistory: getSharedWatchHistory(currentUser, otherUser)
      };
    });
    
    // 4. Filter by minimum score
    const qualifiedMatches = matches.filter(m => m.compatibilityScore >= minScore);
    
    // 5. Sort by compatibility score (highest first)
    qualifiedMatches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    
    // 6. Return matches
    res.json({
      userId,
      totalMatches: qualifiedMatches.length,
      minScore,
      matches: qualifiedMatches
    });
    
  } catch (error) {
    console.error('Error finding matches:', error);
    res.status(500).json({ error: 'Failed to find matches' });
  }
});

/**
 * Get list of services both users share
 */
function getSharedServices(user1, user2) {
  const services1 = user1.streamingServices || [];
  const services2 = user2.streamingServices || [];
  
  return services1
    .filter(s1 => services2.some(s2 => s2.id === s1.id))
    .map(s => ({
      id: s.id,
      name: s.name,
      logoUrl: s.logoUrl
    }));
}

/**
 * Get list of shows/movies both users have watched
 */
function getSharedWatchHistory(user1, user2) {
  const history1 = user1.watchHistory || [];
  const history2 = user2.watchHistory || [];
  
  const shared = history1
    .filter(h1 => history2.some(h2 => 
      h2.tmdbId === h1.tmdbId || 
      (h2.title.toLowerCase() === h1.title.toLowerCase() && h2.type === h1.type)
    ))
    .map(h => ({
      title: h.title,
      type: h.type,
      genre: h.genre,
      tmdbId: h.tmdbId,
      posterPath: h.posterPath
    }));
  
  // Remove duplicates by tmdbId
  return shared.filter((item, index, self) => 
    index === self.findIndex(t => t.tmdbId === item.tmdbId)
  );
}
```

### Displaying Matches

**Frontend Code (matches page):**

```javascript
async function loadMatches() {
  const userId = getCurrentUserId();
  
  try {
    // Fetch matches
    const response = await fetch(`/api/matches/find/${userId}?minScore=40`);
    const data = await response.json();
    
    const container = document.querySelector('.matches-container');
    container.innerHTML = '';
    
    if (data.matches.length === 0) {
      container.innerHTML = '<p>No matches found. Try updating your watch history!</p>';
      return;
    }
    
    // Display each match
    data.matches.forEach(match => {
      const card = createMatchCard(match);
      container.appendChild(card);
    });
    
  } catch (error) {
    console.error('Error loading matches:', error);
  }
}

function createMatchCard(match) {
  const card = document.createElement('div');
  card.className = 'match-card';
  
  card.innerHTML = `
    <div class="match-header">
      <img src="${match.profilePicture || '/assets/images/default-avatar.png'}" 
           alt="${match.username}" 
           class="match-avatar">
      <div class="match-info">
        <h3>${match.username}, ${match.age}</h3>
        <p>${match.location}</p>
      </div>
      <div class="compatibility-badge">
        ${match.compatibilityScore}% Match
      </div>
    </div>
    
    <div class="match-body">
      <p class="bio">${match.bio}</p>
      
      <div class="shared-section">
        <h4>🎬 Shared Streaming Services (${match.sharedServices.length})</h4>
        <div class="shared-services">
          ${match.sharedServices.map(s => `
            <img src="${s.logoUrl}" alt="${s.name}" title="${s.name}" class="service-icon">
          `).join('')}
        </div>
      </div>
      
      <div class="shared-section">
        <h4>📺 Shared Watch History (${match.sharedWatchHistory.length})</h4>
        <div class="shared-history">
          ${match.sharedWatchHistory.slice(0, 5).map(h => `
            <div class="history-item" title="${h.title}">
              ${h.title}
            </div>
          `).join('')}
          ${match.sharedWatchHistory.length > 5 ? `
            <div class="more-items">+${match.sharedWatchHistory.length - 5} more</div>
          ` : ''}
        </div>
      </div>
      
      <div class="compatibility-breakdown">
        <h4>Compatibility Breakdown:</h4>
        ${match.compatibilityFactors.map(f => `
          <div class="factor">
            <span class="factor-name">${f.name}:</span>
            <span class="factor-score">${f.score}/${f.maxScore}</span>
          </div>
        `).join('')}
      </div>
    </div>
    
    <div class="match-actions">
      <button onclick="likeUser('${match.userId}')" class="like-btn">👍 Like</button>
      <button onclick="superLikeUser('${match.userId}')" class="super-like-btn">⭐ Super Like</button>
      <button onclick="viewProfile('${match.userId}')" class="view-btn">View Profile</button>
    </div>
  `;
  
  return card;
}
```

---

## Testing Your Implementation

### Test Checklist

**Manual Selection Testing:**
- [ ] Can load streaming services page
- [ ] Services display with logos
- [ ] Can select/deselect services
- [ ] Can save selections
- [ ] Services appear on profile after saving
- [ ] Can update selections later

**OAuth Testing (if configured):**
- [ ] OAuth connect button works
- [ ] Redirects to provider login page
- [ ] Can authorize successfully
- [ ] Redirects back to app after auth
- [ ] Service shows as "Connected"
- [ ] Can disconnect service
- [ ] Watch history syncs automatically

**Watch History Testing:**
- [ ] Can add items manually
- [ ] Can search for content (TMDB)
- [ ] Items appear in watch history list
- [ ] Can view watch history on profile
- [ ] OAuth services sync history automatically
- [ ] No duplicate items created

**Matching Testing:**
- [ ] Matches show compatibility scores
- [ ] Shared services displayed correctly
- [ ] Shared watch history displayed correctly
- [ ] Score calculation seems reasonable
- [ ] Can filter matches by minimum score
- [ ] Match list updates when profile changes

### API Testing with curl

**Test 1: Get Streaming Providers**
```bash
curl http://localhost:3000/api/streaming/providers?region=US
```

Expected response:
```json
{
  "region": "US",
  "count": 15,
  "providers": [
    {
      "id": 8,
      "name": "Netflix",
      "logoPath": "/t2yyOv40HZeVlLjYsCsPHnWLk4W.jpg",
      "logoUrl": "https://image.tmdb.org/t/p/original/t2yyOv40HZeVlLjYsCsPHnWLk4W.jpg",
      "displayPriority": 9
    }
    // ... more providers
  ]
}
```

**Test 2: Update User's Streaming Services**
```bash
curl -X PUT http://localhost:3000/api/users/USER_ID/streaming-services \
  -H "Content-Type: application/json" \
  -d '{
    "services": [
      {
        "id": 8,
        "name": "Netflix",
        "logoPath": "/t2yyOv40HZeVlLjYsCsPHnWLk4W.jpg",
        "logoUrl": "https://image.tmdb.org/t/p/original/t2yyOv40HZeVlLjYsCsPHnWLk4W.jpg"
      },
      {
        "id": 15,
        "name": "Hulu",
        "logoPath": "/zxrVdFjIjLqkfnwyghnfywTn3Lh.jpg",
        "logoUrl": "https://image.tmdb.org/t/p/original/zxrVdFjIjLqkfnwyghnfywTn3Lh.jpg"
      }
    ]
  }'
```

**Test 3: Add to Watch History**
```bash
curl -X POST http://localhost:3000/api/users/USER_ID/watch-history \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Stranger Things",
    "type": "tvshow",
    "genre": "Sci-Fi",
    "service": "Netflix",
    "episodesWatched": 3,
    "tmdbId": 66732,
    "watchedAt": "2026-01-18T10:30:00Z"
  }'
```

**Test 4: Get User Profile (verify services and history)**
```bash
curl http://localhost:3000/api/users/USER_ID
```

**Test 5: Find Matches**
```bash
curl http://localhost:3000/api/matches/find/USER_ID?minScore=30
```

### Automated Testing Script

Create a test script to verify the complete flow:

**test-streaming-integration.js:**
```javascript
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api';
let testUserId1, testUserId2;

async function runTests() {
  console.log('Starting streaming integration tests...\n');
  
  try {
    // Test 1: Create two test users
    console.log('Test 1: Creating test users...');
    testUserId1 = await createTestUser('alice', 'alice@example.com');
    testUserId2 = await createTestUser('bob', 'bob@example.com');
    console.log('✓ Users created\n');
    
    // Test 2: Get streaming providers
    console.log('Test 2: Fetching streaming providers...');
    const providers = await getProviders();
    console.log(`✓ Got ${providers.length} providers\n`);
    
    // Test 3: Add streaming services to both users
    console.log('Test 3: Adding streaming services...');
    await addServicesToUser(testUserId1, [providers[0], providers[1]]); // Netflix, Hulu
    await addServicesToUser(testUserId2, [providers[0], providers[2]]); // Netflix, Disney+
    console.log('✓ Services added\n');
    
    // Test 4: Add watch history with some overlap
    console.log('Test 4: Adding watch history...');
    await addWatchHistory(testUserId1, 'Stranger Things', 'Netflix');
    await addWatchHistory(testUserId1, 'The Crown', 'Netflix');
    await addWatchHistory(testUserId2, 'Stranger Things', 'Netflix'); // Shared!
    await addWatchHistory(testUserId2, 'The Mandalorian', 'Disney+');
    console.log('✓ Watch history added\n');
    
    // Test 5: Find matches
    console.log('Test 5: Finding matches...');
    const matches = await findMatches(testUserId1);
    console.log(`✓ Found ${matches.length} matches\n`);
    
    // Test 6: Verify compatibility score
    console.log('Test 6: Verifying compatibility...');
    const bobMatch = matches.find(m => m.userId === testUserId2);
    if (bobMatch) {
      console.log(`✓ Compatibility score: ${bobMatch.compatibilityScore}`);
      console.log(`  - Shared services: ${bobMatch.sharedServices.length}`);
      console.log(`  - Shared history: ${bobMatch.sharedWatchHistory.length}`);
      console.log(`  - Breakdown: ${JSON.stringify(bobMatch.compatibilityBreakdown, null, 2)}`);
    }
    
    console.log('\n✅ All tests passed!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

async function createTestUser(username, email) {
  const response = await fetch(`${BASE_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username,
      email,
      password: 'test123',
      age: 25,
      location: 'Test City'
    })
  });
  const data = await response.json();
  return data.userId;
}

async function getProviders() {
  const response = await fetch(`${BASE_URL}/streaming/providers?region=US`);
  const data = await response.json();
  return data.providers;
}

async function addServicesToUser(userId, services) {
  const response = await fetch(`${BASE_URL}/users/${userId}/streaming-services`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ services })
  });
  return response.json();
}

async function addWatchHistory(userId, title, service) {
  const response = await fetch(`${BASE_URL}/users/${userId}/watch-history`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title,
      type: 'tvshow',
      genre: 'Drama',
      service,
      episodesWatched: 3,
      watchedAt: new Date().toISOString()
    })
  });
  return response.json();
}

async function findMatches(userId) {
  const response = await fetch(`${BASE_URL}/matches/find/${userId}?minScore=0`);
  const data = await response.json();
  return data.matches;
}

// Run tests
runTests();
```

Run the test:
```bash
node test-streaming-integration.js
```

---

## Troubleshooting

### Issue: OAuth Not Working

**Symptoms:**
- "Connect" button doesn't redirect
- Error: "OAuth not configured"
- Redirect fails after authorization

**Solutions:**

1. **Check Environment Variables:**
```bash
# Verify OAuth is enabled
echo $NETFLIX_OAUTH_ENABLED

# Check credentials are set
echo $NETFLIX_CLIENT_ID
echo $NETFLIX_CLIENT_SECRET
```

2. **Verify Redirect URI:**
```bash
# Must match exactly what's configured with provider
NETFLIX_REDIRECT_URI=http://localhost:3000/api/auth/netflix/callback
```

3. **Check Provider Status:**
```javascript
// In browser console on streaming-services.html
fetch('/api/auth/providers')
  .then(r => r.json())
  .then(data => console.log('Enabled providers:', data));
```

4. **Review Logs:**
```bash
# Check backend logs for errors
tail -f logs/app.log | grep -i oauth
```

### Issue: Watch History Not Syncing

**Symptoms:**
- OAuth connected but no history items
- Sync returns success but items not appearing
- Token expired errors

**Solutions:**

1. **Check Token Validity:**
```bash
# In MongoDB or database
db.users.findOne({ userId: "USER_ID" }, { streamingOAuthTokens: 1 })

# Check expiresAt timestamp
```

2. **Manual Refresh:**
```bash
curl -X POST http://localhost:3000/api/auth/netflix/sync-history \
  -H "Content-Type: application/json" \
  -d '{"userId": "USER_ID"}'
```

3. **Disconnect and Reconnect:**
- Go to streaming services page
- Click "Disconnect"
- Click "Connect" again
- This gets fresh tokens

### Issue: Services Not Saving

**Symptoms:**
- Click "Save" but services don't persist
- Page refreshes but selections are lost
- API returns success but database not updated

**Solutions:**

1. **Check Network Requests:**
```javascript
// In browser console
// Watch network tab while clicking "Save"
// Look for 400/500 errors
```

2. **Verify User ID:**
```javascript
// Make sure user is logged in
const userId = getCurrentUserId();
console.log('User ID:', userId);
```

3. **Check Request Format:**
```javascript
// Log the request being sent
console.log('Saving services:', JSON.stringify(services, null, 2));
```

4. **Database Permissions:**
```bash
# For file-based storage
ls -la data/users/

# For MongoDB
db.users.getIndexes()
```

### Issue: Low Match Scores

**Symptoms:**
- All compatibility scores are very low
- Expected matches not appearing
- Scoring seems wrong

**Solutions:**

1. **Add More Data:**
   - Add more streaming services
   - Add more watch history items
   - Update genre preferences

2. **Check Algorithm Weights:**
```javascript
// Review scoring in matchingEngine.js
// Adjust weights if needed:
const SHARED_SERVICE_POINTS = 10;  // Increase for more weight
const SHARED_HISTORY_POINTS = 20;  // Adjust as needed
```

3. **Lower Minimum Score:**
```javascript
// When finding matches
const matches = await findMatches(userId, { minScore: 20 }); // Lower threshold
```

4. **Debug Compatibility Calculation:**
```javascript
// Add logging in matchingEngine.js
console.log('User1 services:', user1.streamingServices);
console.log('User2 services:', user2.streamingServices);
console.log('Shared services:', sharedServices);
console.log('Score:', score);
```

### Issue: TMDB API Errors

**Symptoms:**
- "Failed to load providers"
- Search not working
- Empty provider list

**Solutions:**

1. **Verify API Key:**
```bash
# Check .env file
echo $TMDB_API_KEY

# Test API key
curl "https://api.themoviedb.org/3/configuration?api_key=YOUR_KEY"
```

2. **Check Rate Limits:**
```bash
# TMDB allows 40 requests per 10 seconds
# If exceeded, wait and retry
```

3. **Use Fallback Data:**
```javascript
// In streamingAPIService.js
// Uncomment fallback provider list
const FALLBACK_PROVIDERS = [/* ... */];
```

---

## Summary

You now have a complete understanding of how to:

1. **Connect Streaming Services:**
   - Via OAuth (automatic, requires API keys)
   - Via manual selection (works immediately)

2. **Sync Watch History:**
   - Automatic OAuth sync from provider APIs
   - Manual entry via search and selection
   - Data normalization and deduplication

3. **Use Data for Matching:**
   - Compatibility scoring algorithm
   - Shared services detection
   - Shared watch history analysis
   - Match ranking and filtering

4. **Test Your Implementation:**
   - Manual testing checklist
   - API testing with curl
   - Automated test scripts

5. **Troubleshoot Issues:**
   - OAuth problems
   - Sync failures
   - Database issues
   - Score calculations

### Quick Start Commands

```bash
# 1. Set up environment
cp .env.example .env
# Edit .env and add TMDB_API_KEY (required)
# Optionally add OAuth credentials for streaming platforms

# 2. Start the server
npm start

# 3. Open the app
# Navigate to http://localhost:3000/frontend/index.html

# 4. Create a profile
# Go through profile setup flow

# 5. Add streaming services
# Click "Update Streaming Services" on your profile
# Select services manually or connect via OAuth

# 6. Add watch history
# Add items manually or wait for OAuth sync

# 7. Find matches
# Go to matches page to see compatible users
```

### Key Files Reference

- **Frontend:** `frontend/streaming-services.html`
- **Backend Routes:** `backend/routes/auth.js`, `backend/routes/users.js`, `backend/routes/matches.js`
- **Services:** `backend/services/streamingOAuthService.js`, `backend/services/streamingAPIService.js`
- **Matching:** `backend/utils/matchingEngine.js`
- **Database:** `backend/utils/database.js`
- **Config:** `backend/config/config.js`, `.env`

### Next Steps

1. Configure OAuth for platforms you have API access to
2. Add more users to test matching
3. Customize matching algorithm weights
4. Add more watch history items
5. Implement real-time sync (webhooks)
6. Build mobile app with React Native
7. Add social features (chat, watch parties)

---

**Happy matching! 🎬❤️**
