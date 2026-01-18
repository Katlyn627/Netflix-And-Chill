# Frontend Auth0 Configuration Guide

## Quick Setup

After setting up your Auth0 account and application, you need to update the Auth0 configuration in your frontend files.

### Files to Update

You need to update the following files with your Auth0 credentials:

1. **frontend/login.html**
2. **frontend/profile-view.html**
3. **frontend/callback.html**

### Configuration Values

In each file, find the script section with Auth0 configuration and replace the placeholder values:

```javascript
<script>
    // Auth0 Configuration - Update these values with your Auth0 credentials
    window.AUTH0_DOMAIN = 'YOUR_AUTH0_DOMAIN.auth0.com';  // Replace with your Auth0 domain
    window.AUTH0_CLIENT_ID = 'YOUR_AUTH0_CLIENT_ID';      // Replace with your Client ID
    window.AUTH0_AUDIENCE = 'https://YOUR_AUTH0_DOMAIN.auth0.com/api/v2/';  // Replace domain
</script>
```

### Where to Find Your Auth0 Credentials

1. **Log in to Auth0 Dashboard**: https://manage.auth0.com/
2. **Navigate to**: Applications > Applications
3. **Select your application**: "Netflix and Chill"
4. **Find these values**:
   - **Domain**: Found at the top of the settings (e.g., `dev-abc123.auth0.com`)
   - **Client ID**: Found in the "Basic Information" section
   - **Audience**: Use your Management API audience: `https://YOUR_DOMAIN.auth0.com/api/v2/`

### Example Configuration

If your Auth0 domain is `dev-xyz789.auth0.com` and your Client ID is `aBc123DeF456GhI789JkL012`:

```javascript
<script>
    window.AUTH0_DOMAIN = 'dev-xyz789.auth0.com';
    window.AUTH0_CLIENT_ID = 'aBc123DeF456GhI789JkL012';
    window.AUTH0_AUDIENCE = 'https://dev-xyz789.auth0.com/api/v2/';
</script>
```

### Alternative: Environment-Based Configuration (Recommended for Production)

For better security and easier deployment, you can create a separate configuration file:

#### Create: `frontend/src/config/auth0.config.js`

```javascript
// Auth0 Configuration
// Load from environment or use defaults
const AUTH0_CONFIG = {
    domain: 'YOUR_AUTH0_DOMAIN.auth0.com',
    clientId: 'YOUR_AUTH0_CLIENT_ID',
    audience: 'https://YOUR_AUTH0_DOMAIN.auth0.com/api/v2/'
};

// Export configuration
window.AUTH0_DOMAIN = AUTH0_CONFIG.domain;
window.AUTH0_CLIENT_ID = AUTH0_CONFIG.clientId;
window.AUTH0_AUDIENCE = AUTH0_CONFIG.audience;
```

Then include this file in your HTML pages before `auth0-config.js`:

```html
<script src="src/config/auth0.config.js"></script>
<script src="src/utils/auth0-config.js"></script>
```

### Verification

To verify your configuration is correct:

1. Open your browser's developer console
2. Navigate to your app (e.g., `http://localhost:3000/login.html`)
3. In the console, type:
   ```javascript
   console.log(window.AUTH0_DOMAIN);
   console.log(window.AUTH0_CLIENT_ID);
   ```
4. Verify the values match your Auth0 application settings

### Troubleshooting

#### "Configuration not found" error
- Ensure you've updated all three files: login.html, profile-view.html, callback.html
- Check that the script tags are in the correct order
- Verify the Auth0 SDK script is loaded before your configuration

#### "Invalid domain" error
- Double-check your Auth0 domain (should NOT include `https://`)
- Verify it ends with `.auth0.com`

#### "Client ID mismatch" error
- Ensure you copied the entire Client ID from Auth0 Dashboard
- Check for extra spaces or characters

### Security Notes

⚠️ **Important**: 
- Never commit your actual Auth0 credentials to a public repository
- Use environment variables or config files that are git-ignored in production
- Rotate your credentials if they are accidentally exposed
- Use different Auth0 tenants for development and production

### Need Help?

Refer to the main setup guide: [AUTH0_SETUP_GUIDE.md](./AUTH0_SETUP_GUIDE.md)
