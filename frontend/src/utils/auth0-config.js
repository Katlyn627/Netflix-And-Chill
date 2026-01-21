// Auth0 SPA Configuration
// This module handles Auth0 authentication for the Netflix and Chill app

let auth0Client = null;

// Standard scopes for Auth0 authentication
const AUTH0_SCOPES = 'openid profile email read:current_user update:current_user_metadata';

/**
 * Get a safe redirect URI that works with Auth0
 * Ensures localhost always uses HTTP, not HTTPS
 * @param {string} path - The path for the redirect (e.g., '/callback.html')
 * @returns {string} A valid redirect URI
 */
function getSafeRedirectUri(path) {
    let origin = window.location.origin;
    
    // Check if this is localhost
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

/**
 * Initialize Auth0 Client
 * Call this on page load to set up authentication
 */
async function initAuth0() {
    try {
        // Wait for Auth0 configuration to be loaded from backend
        if (window.auth0ConfigReady) {
            await window.auth0ConfigReady;
        }
        
        // Check if Auth0 is configured
        if (!window.AUTH0_CONFIGURED) {
            throw new Error('Auth0 is not configured. Please set AUTH0_DOMAIN and AUTH0_CLIENT_ID environment variables on the server, or use traditional login.');
        }
        
        // Get Auth0 configuration from environment
        const domain = window.AUTH0_DOMAIN;
        const clientId = window.AUTH0_CLIENT_ID;
        let audience = window.AUTH0_AUDIENCE;
        
        // IMPORTANT: Do not use Management API as audience for SPA applications
        // The Management API (/api/v2/) should only be called by Machine-to-Machine apps
        // If audience is set to Management API, remove it to use default audience
        if (audience && audience.includes('/api/v2/')) {
            console.warn('⚠️ AUTH0_AUDIENCE is set to Management API. This is not supported for Single Page Applications.');
            console.warn('   Removing audience to use default. Use backend API for user data operations.');
            audience = undefined; // Use default audience instead
        }
        
        // Import Auth0 SDK dynamically
        const { createAuth0Client } = window.auth0;
        
        const auth0Config = {
            domain: domain,
            clientId: clientId,
            authorizationParams: {
                redirect_uri: window.AUTH0_CALLBACK_URL || getSafeRedirectUri('/callback.html'),
                scope: AUTH0_SCOPES
            },
            cacheLocation: 'localstorage',
            useRefreshTokens: true
        };
        
        // Only add audience if it's defined and not the Management API
        if (audience) {
            auth0Config.authorizationParams.audience = audience;
        }
        
        auth0Client = await createAuth0Client(auth0Config);

        return auth0Client;
    } catch (error) {
        console.error('Error initializing Auth0:', error);
        throw error;
    }
}

/**
 * Login with Auth0
 * Redirects user to Auth0 Universal Login page
 * @param {Object} options - Optional login options
 * @param {Object} options.appState - State to preserve through the redirect (e.g., returnTo URL)
 */
async function login(options = {}) {
    try {
        console.log('🔐 Auth0 login initiated...');
        
        if (!auth0Client) {
            console.log('⏳ Initializing Auth0 client...');
            await initAuth0();
        }
        
        const callbackUrl = window.AUTH0_CALLBACK_URL || getSafeRedirectUri('/callback.html');
        console.log('📍 Callback URL:', callbackUrl);
        console.log('🌐 Auth0 Domain:', window.AUTH0_DOMAIN);
        
        const loginOptions = {
            authorizationParams: {
                redirect_uri: callbackUrl,
                // Add response_type and scope for better compatibility
                response_type: 'code',
                scope: AUTH0_SCOPES
            }
        };
        
        // Add appState if provided
        if (options.appState) {
            loginOptions.appState = options.appState;
            console.log('📋 AppState:', options.appState);
        }
        
        console.log('🚀 Redirecting to Auth0 Universal Login...');
        await auth0Client.loginWithRedirect(loginOptions);
    } catch (error) {
        console.error('❌ Error during login:', error);
        console.error('Error details:', {
            message: error.message,
            error_description: error.error_description,
            error: error.error
        });
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
                returnTo: window.AUTH0_LOGOUT_URL || getSafeRedirectUri('/login.html')
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
 * NOTE: This function stores metadata in the backend, not Auth0 directly.
 * Direct calls to Auth0 Management API from frontend are not supported.
 * Use the backend API to store user-specific data instead.
 */
async function updateUserMetadata(metadata) {
    try {
        console.warn('updateUserMetadata: Direct Auth0 Management API calls are not supported from the frontend.');
        console.warn('Please use the backend API to store user-specific data instead.');
        console.warn('Example: POST /api/users/:userId/metadata');
        
        // Throw error to indicate this function is not implemented
        // In a real implementation, you would call your backend API
        throw new Error('updateUserMetadata is not implemented. Use backend API endpoints to store user data.');
    } catch (error) {
        console.error('Error updating user metadata:', error);
        throw error;
    }
}

/**
 * Get user metadata (streaming API keys, etc.)
 * NOTE: User metadata is already included in the user object from Auth0.
 * For additional user data, query your backend API instead.
 */
async function getUserMetadata() {
    try {
        const user = await getUser();
        
        if (!user) {
            throw new Error('User not authenticated');
        }
        
        // User metadata is already included in the user object from Auth0
        // This includes basic metadata but not app_metadata
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
