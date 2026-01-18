// Auth0 SPA Configuration
// This module handles Auth0 authentication for the Netflix and Chill app

let auth0Client = null;

/**
 * Initialize Auth0 Client
 * Call this on page load to set up authentication
 */
async function initAuth0() {
    try {
        // Get Auth0 configuration from environment
        const domain = window.AUTH0_DOMAIN;
        const clientId = window.AUTH0_CLIENT_ID;
        const audience = window.AUTH0_AUDIENCE;
        
        // Validate required configuration
        if (!domain || domain === 'YOUR_AUTH0_DOMAIN.auth0.com') {
            throw new Error('Auth0 domain not configured. Please update AUTH0_DOMAIN in your configuration.');
        }
        
        if (!clientId || clientId === 'YOUR_AUTH0_CLIENT_ID') {
            throw new Error('Auth0 client ID not configured. Please update AUTH0_CLIENT_ID in your configuration.');
        }
        
        // Import Auth0 SDK dynamically
        const { createAuth0Client } = window.auth0;
        
        auth0Client = await createAuth0Client({
            domain: domain,
            clientId: clientId,
            authorizationParams: {
                redirect_uri: window.location.origin + '/callback.html',
                audience: audience,
                scope: 'openid profile email read:current_user update:current_user_metadata'
            },
            cacheLocation: 'localstorage',
            useRefreshTokens: true
        });

        return auth0Client;
    } catch (error) {
        console.error('Error initializing Auth0:', error);
        throw error;
    }
}

/**
 * Login with Auth0
 * Redirects user to Auth0 Universal Login page
 */
async function login() {
    try {
        if (!auth0Client) {
            await initAuth0();
        }
        
        await auth0Client.loginWithRedirect({
            authorizationParams: {
                redirect_uri: window.location.origin + '/callback.html'
            }
        });
    } catch (error) {
        console.error('Error during login:', error);
        throw error;
    }
}

/**
 * Logout from Auth0
 * Clears local session and redirects to Auth0 logout
 */
async function logout() {
    try {
        if (!auth0Client) {
            await initAuth0();
        }
        
        // Clear local storage
        localStorage.removeItem('currentUserId');
        
        // Logout from Auth0
        await auth0Client.logout({
            logoutParams: {
                returnTo: window.location.origin + '/login.html'
            }
        });
    } catch (error) {
        console.error('Error during logout:', error);
        throw error;
    }
}

/**
 * Handle Auth0 callback after login
 * Extracts user information and sets up local session
 */
async function handleCallback() {
    try {
        if (!auth0Client) {
            await initAuth0();
        }

        // Handle the redirect callback
        const result = await auth0Client.handleRedirectCallback();
        
        // Get user info
        const user = await auth0Client.getUser();
        
        // Get access token
        const token = await auth0Client.getTokenSilently();
        
        return {
            user,
            token,
            appState: result.appState
        };
    } catch (error) {
        console.error('Error handling callback:', error);
        throw error;
    }
}

/**
 * Check if user is authenticated
 */
async function isAuthenticated() {
    try {
        if (!auth0Client) {
            await initAuth0();
        }
        return await auth0Client.isAuthenticated();
    } catch (error) {
        console.error('Error checking authentication:', error);
        return false;
    }
}

/**
 * Get current user
 */
async function getUser() {
    try {
        if (!auth0Client) {
            await initAuth0();
        }
        
        const authenticated = await auth0Client.isAuthenticated();
        if (!authenticated) {
            return null;
        }
        
        return await auth0Client.getUser();
    } catch (error) {
        console.error('Error getting user:', error);
        return null;
    }
}

/**
 * Get access token
 */
async function getToken() {
    try {
        if (!auth0Client) {
            await initAuth0();
        }
        
        return await auth0Client.getTokenSilently();
    } catch (error) {
        console.error('Error getting token:', error);
        throw error;
    }
}

/**
 * Update user metadata (for storing streaming API keys)
 */
async function updateUserMetadata(metadata) {
    try {
        const token = await getToken();
        const user = await getUser();
        
        if (!user) {
            throw new Error('User not authenticated');
        }
        
        // Call Auth0 Management API to update user metadata
        const response = await fetch(`https://${window.AUTH0_DOMAIN}/api/v2/users/${user.sub}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_metadata: metadata
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to update user metadata');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error updating user metadata:', error);
        throw error;
    }
}

/**
 * Get user metadata (streaming API keys, etc.)
 */
async function getUserMetadata() {
    try {
        const user = await getUser();
        
        if (!user) {
            throw new Error('User not authenticated');
        }
        
        // User metadata is included in the user object
        return user.user_metadata || {};
    } catch (error) {
        console.error('Error getting user metadata:', error);
        throw error;
    }
}

// Export functions
window.Auth0Manager = {
    initAuth0,
    login,
    logout,
    handleCallback,
    isAuthenticated,
    getUser,
    getToken,
    updateUserMetadata,
    getUserMetadata
};
