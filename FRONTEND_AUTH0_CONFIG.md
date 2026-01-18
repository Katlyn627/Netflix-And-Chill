# Frontend Auth0 Configuration Guide

## Quick Setup

The Auth0 configuration is now automatically loaded from environment variables on the server. You no longer need to manually update HTML files with your Auth0 credentials.

### Setup Steps

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Update the `.env` file with your Auth0 credentials:**
   ```bash
   # Auth0 Configuration
   AUTH0_DOMAIN=your-domain.auth0.com
   AUTH0_CLIENT_ID=your-client-id
   AUTH0_CLIENT_SECRET=your-client-secret
   AUTH0_AUDIENCE=https://your-domain.auth0.com/api/v2/
   AUTH0_CALLBACK_URL=http://localhost:3000/callback.html
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

The frontend will automatically fetch the Auth0 configuration from the backend API endpoint (`/api/config/auth0`).

### How It Works

1. **Backend Configuration**: The server reads Auth0 credentials from environment variables (`.env` file)
2. **API Endpoint**: The `/api/config/auth0` endpoint serves the public configuration (domain, clientId, audience) to the frontend
3. **Frontend Loader**: The `auth0-loader.js` script automatically fetches the configuration when pages load
4. **Auth0 Integration**: The `auth0-config.js` module uses the loaded configuration to initialize Auth0

### Security Benefits

✅ **Credentials are stored on the server** - Not hardcoded in HTML files  
✅ **Secrets stay secret** - Client secret is never exposed to the frontend  
✅ **Environment-based config** - Easy to use different credentials for dev/staging/production  
✅ **No accidental commits** - `.env` is in `.gitignore`

### Where to Find Your Auth0 Credentials

1. **Log in to Auth0 Dashboard**: https://manage.auth0.com/
2. **Navigate to**: Applications > Applications
3. **Select your application**: "Netflix and Chill"
4. **Find these values**:
   - **Domain**: Found at the top of the settings (e.g., `dev-abc123.auth0.com`)
   - **Client ID**: Found in the "Basic Information" section
   - **Client Secret**: Found in the "Basic Information" section (keep this secret!)
   - **Audience**: Use your Management API audience: `https://YOUR_DOMAIN.auth0.com/api/v2/`

### Configuration Files

The following files work together to provide Auth0 configuration:

1. **`.env`** - Server-side environment variables (never commit this!)
2. **`backend/config/config.js`** - Loads Auth0 config from environment variables
3. **`backend/routes/config.js`** - API endpoint that serves public config to frontend
4. **`frontend/src/config/auth0-loader.js`** - Fetches and sets Auth0 config in the browser
5. **`frontend/src/utils/auth0-config.js`** - Auth0 client initialization and methods

### Troubleshooting

#### "Auth0 domain not configured" error
- Ensure you've created a `.env` file and set `AUTH0_DOMAIN`
- Restart the server after updating `.env`
- Check that the value doesn't include `https://`
- Verify it ends with `.auth0.com`

#### "Auth0 client ID not configured" error
- Ensure you've set `AUTH0_CLIENT_ID` in `.env`
- Restart the server after updating `.env`
- Verify the Client ID matches your Auth0 application settings

#### Configuration not loading
- Check browser console for errors
- Verify the server is running
- Test the endpoint: `curl http://localhost:3000/api/config/auth0`
- Check server logs for any errors

### Legacy Configuration (Deprecated)

**⚠️ The old method of hardcoding Auth0 credentials directly in HTML files is deprecated.**

If you're upgrading from the old system, simply:
1. Remove the inline `<script>` blocks that set `window.AUTH0_DOMAIN`, etc.
2. The `auth0-loader.js` script will automatically load configuration from the server

### Need Help?

Refer to the main setup guide: [AUTH0_SETUP_GUIDE.md](./AUTH0_SETUP_GUIDE.md)
