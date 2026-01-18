// Auth0 Configuration Loader
// This script loads Auth0 configuration from the backend API
// Configuration is stored in environment variables on the server
// This ensures sensitive values are not hardcoded in the frontend

// Placeholder values that indicate Auth0 is not configured
const AUTH0_PLACEHOLDER_DOMAIN = 'YOUR_AUTH0_DOMAIN.auth0.com';
const AUTH0_PLACEHOLDER_CLIENT_ID = 'YOUR_AUTH0_CLIENT_ID';

// Promise that resolves when Auth0 configuration is loaded
window.auth0ConfigReady = (async function loadAuth0Config() {
    try {
        // Determine API base URL based on current environment
        const API_BASE_URL = window.location.origin;
        
        // Fetch Auth0 configuration from backend
        const response = await fetch(`${API_BASE_URL}/api/config/auth0`);
        
        if (!response.ok) {
            console.warn('Failed to fetch Auth0 configuration from server. Auth0 login disabled.');
            // Mark Auth0 as not configured
            window.AUTH0_CONFIGURED = false;
            return;
        }
        
        const config = await response.json();
        
        // Check if Auth0 is actually configured (not using placeholder values)
        const isConfigured = config.domain && 
                            config.clientId && 
                            config.domain !== AUTH0_PLACEHOLDER_DOMAIN &&
                            config.clientId !== AUTH0_PLACEHOLDER_CLIENT_ID &&
                            config.domain !== 'null' &&
                            config.domain !== null &&
                            config.clientId !== 'null' &&
                            config.clientId !== null;
        
        if (isConfigured) {
            // Set Auth0 configuration globally
            window.AUTH0_DOMAIN = config.domain;
            window.AUTH0_CLIENT_ID = config.clientId;
            window.AUTH0_AUDIENCE = config.audience;
            window.AUTH0_CONFIGURED = true;
            console.log('Auth0 configuration loaded successfully');
        } else {
            // Auth0 is not configured - disable Auth0 login
            console.info('Auth0 not configured. Auth0 login disabled. Use traditional login instead.');
            window.AUTH0_CONFIGURED = false;
        }
        
    } catch (error) {
        console.error('Error loading Auth0 configuration:', error);
        // Mark Auth0 as not configured on error
        window.AUTH0_CONFIGURED = false;
    }
})();

