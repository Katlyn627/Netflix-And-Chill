#!/bin/bash

# Netflix and Chill - Auth0 Setup Script
# This script helps you configure Auth0 authentication correctly to avoid SSL errors

echo "================================================"
echo "Netflix and Chill - Auth0 Setup Assistant"
echo "================================================"
echo ""
echo "This script will help you set up Auth0 authentication."
echo "It will guide you through creating a .env file with the correct configuration."
echo ""

# Check if .env already exists
if [ -f ".env" ]; then
    echo "⚠️  WARNING: .env file already exists!"
    echo ""
    read -p "Do you want to update it? (y/n): " update_env
    if [ "$update_env" != "y" ]; then
        echo "Setup cancelled. Your existing .env file was not modified."
        exit 0
    fi
    # Backup existing .env
    cp .env .env.backup
    echo "✓ Created backup at .env.backup"
    echo ""
else
    # Create .env from example
    cp .env.example .env
    echo "✓ Created .env file from .env.example"
    echo ""
fi

echo "================================================"
echo "Auth0 Configuration"
echo "================================================"
echo ""
echo "IMPORTANT: To avoid ERR_SSL_PROTOCOL_ERROR:"
echo "  - For localhost, ALWAYS use HTTP (not HTTPS)"
echo "  - Auth0 does not accept https://localhost URLs"
echo "  - Example: http://localhost:3000 ✓"
echo "  - Example: https://localhost:3000 ✗"
echo ""

# Get Auth0 credentials
read -p "Enter your Auth0 Domain (e.g., your-app.auth0.com): " auth0_domain
read -p "Enter your Auth0 Client ID: " auth0_client_id
read -p "Enter your Auth0 Client Secret: " auth0_client_secret

# Validate domain
if [[ "$auth0_domain" == *"https://"* ]]; then
    echo "⚠️  Removing 'https://' from domain. Domain should be just 'your-app.auth0.com'"
    auth0_domain="${auth0_domain#https://}"
fi

# Set BASE_URL to HTTP localhost for development
base_url="http://localhost:3000"

echo ""
echo "Setting up configuration:"
echo "  BASE_URL: $base_url"
echo "  AUTH0_DOMAIN: $auth0_domain"
echo "  AUTH0_CLIENT_ID: $auth0_client_id"
echo "  AUTH0_CALLBACK_URL: ${base_url}/callback.html"
echo "  AUTH0_LOGOUT_URL: ${base_url}/login.html"
echo ""

# Update .env file
sed -i.tmp "s|^BASE_URL=.*|BASE_URL=$base_url|g" .env
sed -i.tmp "s|^AUTH0_DOMAIN=.*|AUTH0_DOMAIN=$auth0_domain|g" .env
sed -i.tmp "s|^AUTH0_CLIENT_ID=.*|AUTH0_CLIENT_ID=$auth0_client_id|g" .env
sed -i.tmp "s|^AUTH0_CLIENT_SECRET=.*|AUTH0_CLIENT_SECRET=$auth0_client_secret|g" .env
sed -i.tmp "s|^AUTH0_CALLBACK_URL=.*|AUTH0_CALLBACK_URL=${base_url}/callback.html|g" .env
sed -i.tmp "s|^AUTH0_LOGOUT_URL=.*|AUTH0_LOGOUT_URL=${base_url}/login.html|g" .env
sed -i.tmp "s|^AUTH0_AUDIENCE=.*|AUTH0_AUDIENCE=https://${auth0_domain}/api/v2/|g" .env

# Clean up temp files
rm -f .env.tmp

echo "✓ Configuration saved to .env"
echo ""

echo "================================================"
echo "Configure Auth0 Dashboard"
echo "================================================"
echo ""
echo "Now you need to configure your Auth0 Application:"
echo ""
echo "1. Go to https://manage.auth0.com/dashboard"
echo "2. Select your application"
echo "3. Go to 'Settings' tab"
echo "4. Set the following URLs (copy-paste these exact values):"
echo ""
echo "   Allowed Callback URLs:"
echo "   ${base_url}/callback.html"
echo ""
echo "   Allowed Logout URLs:"
echo "   ${base_url}/login.html"
echo ""
echo "   Allowed Web Origins:"
echo "   ${base_url}"
echo ""
echo "   Allowed Origins (CORS):"
echo "   ${base_url}"
echo ""
echo "5. Click 'Save Changes' at the bottom"
echo ""
echo "================================================"
echo "⚠️  IMPORTANT NOTES"
echo "================================================"
echo ""
echo "✓ Use HTTP for localhost (not HTTPS)"
echo "✓ Auth0 rejects https://localhost URLs"
echo "✓ For production, use HTTPS with your actual domain"
echo "✓ The app will automatically upgrade to HTTPS in production"
echo ""
echo "================================================"
echo "Next Steps"
echo "================================================"
echo ""
echo "1. Configure Auth0 Dashboard (see instructions above)"
echo "2. Start the server: npm start"
echo "3. Open http://localhost:3000 in your browser"
echo "4. Click 'Login with Auth0' button"
echo ""
echo "For more information, see:"
echo "  - docs/auth/AUTH0_SETUP_GUIDE.md"
echo "  - docs/auth/AUTH0_SSL_FIX.md"
echo ""
echo "Setup complete! 🎉"
echo ""
