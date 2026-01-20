/**
 * Authentication Router Utility
 * Centralizes authentication routing logic for the application
 * Prioritizes Auth0 when configured, falls back to traditional login
 */

/**
 * Get the appropriate login URL based on Auth0 configuration
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoLogin - Whether to auto-trigger Auth0 login
 * @param {string} options.returnTo - URL to return to after login
 * @returns {string} The login URL to redirect to
 */
async function getLoginUrl(options = {}) {
    const { autoLogin = false, returnTo = null } = options;
    
    try {
        // Wait for Auth0 config to load if it's available
        if (window.auth0ConfigReady) {
            await window.auth0ConfigReady;
        }
        
        const params = new URLSearchParams();
        
        // If Auth0 is configured, use it with auto-login
        if (window.AUTH0_CONFIGURED && autoLogin) {
            params.set('auto_login', 'true');
        }
        
        // Add return URL if provided
        if (returnTo) {
            params.set('returnTo', returnTo);
        }
        
        const queryString = params.toString();
        return queryString ? `login.html?${queryString}` : 'login.html';
        
    } catch (error) {
        console.error('Error checking Auth0 config:', error);
        // Fallback to traditional login
        return 'login.html';
    }
}

/**
 * Redirect to the appropriate login page
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoLogin - Whether to auto-trigger Auth0 login
 * @param {string} options.returnTo - URL to return to after login
 */
async function redirectToLogin(options = {}) {
    const loginUrl = await getLoginUrl(options);
    window.location.href = loginUrl;
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is logged in
 */
function isAuthenticated() {
    const userId = localStorage.getItem('currentUserId');
    const auth0User = localStorage.getItem('auth0User');
    
    // User is authenticated if they have either a userId or auth0User
    return !!(userId || auth0User);
}

/**
 * Get the current user information
 * @returns {Object|null} User info or null if not authenticated
 */
function getCurrentUser() {
    const userId = localStorage.getItem('currentUserId');
    const auth0UserStr = localStorage.getItem('auth0User');
    
    if (!userId && !auth0UserStr) {
        return null;
    }
    
    const user = {
        id: userId,
        isAuth0: !!auth0UserStr
    };
    
    if (auth0UserStr) {
        try {
            const auth0User = JSON.parse(auth0UserStr);
            user.email = auth0User.email;
            user.username = auth0User.nickname || auth0User.name;
            user.picture = auth0User.picture;
        } catch (error) {
            console.error('Error parsing auth0User:', error);
        }
    }
    
    return user;
}

/**
 * Logout the current user
 * Handles both Auth0 and traditional logout
 */
async function logout() {
    const user = getCurrentUser();
    
    // Clear local storage
    localStorage.removeItem('currentUserId');
    localStorage.removeItem('auth0User');
    
    // If user was logged in with Auth0, perform Auth0 logout
    if (user && user.isAuth0 && window.Auth0Manager) {
        try {
            await Auth0Manager.logout();
        } catch (error) {
            console.error('Error during Auth0 logout:', error);
            // Continue with redirect even if Auth0 logout fails
        }
    }
    
    // Redirect to login page
    window.location.href = 'login.html';
}

/**
 * Require authentication for a page
 * Redirects to login if user is not authenticated
 * @param {Object} options - Configuration options
 * @param {string} options.returnTo - URL to return to after login (defaults to current page)
 */
async function requireAuth(options = {}) {
    if (!isAuthenticated()) {
        const returnTo = options.returnTo || window.location.href;
        await redirectToLogin({ autoLogin: true, returnTo });
    }
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getLoginUrl,
        redirectToLogin,
        isAuthenticated,
        getCurrentUser,
        logout,
        requireAuth
    };
}

// Make functions available globally
if (typeof window !== 'undefined') {
    window.AuthRouter = {
        getLoginUrl,
        redirectToLogin,
        isAuthenticated,
        getCurrentUser,
        logout,
        requireAuth
    };
}
