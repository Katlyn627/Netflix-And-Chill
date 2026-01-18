// Auth0 Configuration Loader
// This script loads Auth0 configuration from the backend API
// Configuration is stored in environment variables on the server
// This ensures sensitive values are not hardcoded in the frontend

(async function loadAuth0Config() {
    try {
        // Determine API base URL based on current environment
        const API_BASE_URL = window.location.origin;
        
        // Fetch Auth0 configuration from backend
        const response = await fetch(`${API_BASE_URL}/api/config/auth0`);
        
        if (!response.ok) {
            console.warn('Failed to fetch Auth0 configuration from server. Using defaults.');
            // Set default placeholder values
            window.AUTH0_DOMAIN = 'YOUR_AUTH0_DOMAIN.auth0.com';
            window.AUTH0_CLIENT_ID = 'YOUR_AUTH0_CLIENT_ID';
            window.AUTH0_AUDIENCE = 'https://YOUR_AUTH0_DOMAIN.auth0.com/api/v2/';
            return;
        }
        
        const config = await response.json();
        
        // Set Auth0 configuration globally
        window.AUTH0_DOMAIN = config.domain;
        window.AUTH0_CLIENT_ID = config.clientId;
        window.AUTH0_AUDIENCE = config.audience;
        
        console.log('Auth0 configuration loaded successfully');
        
    } catch (error) {
        console.error('Error loading Auth0 configuration:', error);
        // Set default placeholder values on error
        window.AUTH0_DOMAIN = 'YOUR_AUTH0_DOMAIN.auth0.com';
        window.AUTH0_CLIENT_ID = 'YOUR_AUTH0_CLIENT_ID';
        window.AUTH0_AUDIENCE = 'https://YOUR_AUTH0_DOMAIN.auth0.com/api/v2/';
    }
})();
