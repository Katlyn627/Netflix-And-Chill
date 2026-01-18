#!/bin/bash

# Netflix and Chill - Environment Setup Script
# This script helps you set up your .env file with all required API keys and credentials

echo "======================================"
echo "Netflix and Chill - Environment Setup"
echo "======================================"
echo ""

# Check if .env already exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists!"
    read -p "Do you want to overwrite it? (y/n): " overwrite
    if [ "$overwrite" != "y" ]; then
        echo "Setup cancelled."
        exit 0
    fi
fi

# Copy example file
cp .env.example .env
echo "✅ Created .env file from .env.example"
echo ""

# Function to update .env value
update_env_value() {
    local key=$1
    local value=$2
    sed -i.bak "s|${key}=.*|${key}=${value}|g" .env
}

# Server Configuration
echo "=== Server Configuration ==="
read -p "Enter server PORT (default: 3000): " port
port=${port:-3000}
update_env_value "PORT" "$port"
echo "✅ Port set to: $port"
echo ""

# Database Configuration
echo "=== Database Configuration ==="
echo "Choose your database type:"
echo "1) file (default - no setup required)"
echo "2) mongodb (requires MongoDB Atlas)"
echo "3) postgresql (requires PostgreSQL instance)"
read -p "Enter your choice (1-3): " db_choice

case $db_choice in
    2)
        update_env_value "DB_TYPE" "mongodb"
        echo ""
        echo "MongoDB Setup:"
        echo "1. Go to https://www.mongodb.com/atlas"
        echo "2. Create a free cluster"
        echo "3. Get your connection string"
        read -p "Enter MongoDB URI: " mongodb_uri
        update_env_value "MONGODB_URI" "$mongodb_uri"
        echo "✅ MongoDB configured"
        ;;
    3)
        update_env_value "DB_TYPE" "postgresql"
        echo ""
        echo "PostgreSQL Setup:"
        read -p "Enter PostgreSQL URI: " postgres_uri
        update_env_value "POSTGRES_URI" "$postgres_uri"
        echo "✅ PostgreSQL configured"
        ;;
    *)
        update_env_value "DB_TYPE" "file"
        echo "✅ Using file-based database (default)"
        ;;
esac
echo ""

# Auth0 Configuration
echo "=== Auth0 Configuration ==="
read -p "Do you want to set up Auth0 authentication? (y/n): " setup_auth0

if [ "$setup_auth0" = "y" ]; then
    echo ""
    echo "Auth0 Setup:"
    echo "1. Go to https://auth0.com/ and create an account"
    echo "2. Create a new application (Single Page Web Application)"
    echo "3. Get your credentials from the application settings"
    echo ""
    read -p "Enter Auth0 Domain (e.g., your-tenant.auth0.com): " auth0_domain
    read -p "Enter Auth0 Client ID: " auth0_client_id
    read -p "Enter Auth0 Client Secret: " auth0_client_secret
    
    update_env_value "AUTH0_DOMAIN" "$auth0_domain"
    update_env_value "AUTH0_CLIENT_ID" "$auth0_client_id"
    update_env_value "AUTH0_CLIENT_SECRET" "$auth0_client_secret"
    update_env_value "AUTH0_CALLBACK_URL" "http://localhost:${port}/callback.html"
    update_env_value "AUTH0_AUDIENCE" "https://${auth0_domain}/api/v2/"
    
    echo "✅ Auth0 configured"
    echo ""
    echo "📝 Don't forget to configure in Auth0 Dashboard:"
    echo "   - Allowed Callback URLs: http://localhost:${port}/callback.html"
    echo "   - Allowed Logout URLs: http://localhost:${port}/login.html"
    echo "   - Allowed Web Origins: http://localhost:${port}"
fi
echo ""

# TMDB API (Required)
echo "=== TMDB API Configuration (REQUIRED) ==="
echo "This API is required for movie and TV show data."
echo ""
echo "Setup Instructions:"
echo "1. Go to https://www.themoviedb.org/signup"
echo "2. Create a free account"
echo "3. Go to Settings > API"
echo "4. Request an API Key (choose 'Developer')"
echo ""
read -p "Enter your TMDB API Key: " tmdb_api_key
if [ -n "$tmdb_api_key" ]; then
    update_env_value "TMDB_API_KEY" "$tmdb_api_key"
    echo "✅ TMDB API Key configured"
else
    echo "⚠️  Warning: TMDB API Key not set. The app will not work without it!"
fi
echo ""

# Watchmode API (Optional)
echo "=== Watchmode API Configuration (OPTIONAL) ==="
read -p "Do you want to set up Watchmode API for streaming availability? (y/n): " setup_watchmode

if [ "$setup_watchmode" = "y" ]; then
    echo ""
    echo "Watchmode Setup:"
    echo "1. Go to https://api.watchmode.com/"
    echo "2. Sign up for a free account"
    echo "3. Get your API key from the dashboard"
    echo ""
    read -p "Enter Watchmode API Key: " watchmode_key
    if [ -n "$watchmode_key" ]; then
        update_env_value "WATCHMODE_API_KEY" "$watchmode_key"
        echo "✅ Watchmode API configured"
    fi
fi
echo ""

# JWT Secret
echo "=== JWT Secret Generation ==="
echo "Generating a secure JWT secret..."
jwt_secret=$(openssl rand -base64 32 2>/dev/null || cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
update_env_value "JWT_SECRET" "$jwt_secret"
echo "✅ JWT Secret generated and configured"
echo ""

# Streaming Services
echo "=== Streaming Services OAuth (OPTIONAL) ==="
echo "Note: Most streaming services have restricted API access."
echo "You'll need to apply for developer access from each platform."
echo ""
read -p "Do you want to configure streaming service OAuth? (y/n): " setup_streaming

if [ "$setup_streaming" = "y" ]; then
    echo ""
    echo "Available streaming services:"
    echo "1) Netflix"
    echo "2) Hulu"
    echo "3) Disney+"
    echo "4) Amazon Prime Video"
    echo "5) HBO Max"
    echo "6) Apple TV+"
    echo ""
    read -p "Which service do you want to configure? (1-6, or 'skip'): " service_choice
    
    case $service_choice in
        1)
            read -p "Netflix Client ID: " netflix_id
            read -p "Netflix Client Secret: " netflix_secret
            update_env_value "NETFLIX_OAUTH_ENABLED" "true"
            update_env_value "NETFLIX_CLIENT_ID" "$netflix_id"
            update_env_value "NETFLIX_CLIENT_SECRET" "$netflix_secret"
            echo "✅ Netflix configured"
            ;;
        2)
            read -p "Hulu Client ID: " hulu_id
            read -p "Hulu Client Secret: " hulu_secret
            update_env_value "HULU_OAUTH_ENABLED" "true"
            update_env_value "HULU_CLIENT_ID" "$hulu_id"
            update_env_value "HULU_CLIENT_SECRET" "$hulu_secret"
            echo "✅ Hulu configured"
            ;;
        # Add more cases for other services as needed
        *)
            echo "Skipping streaming service configuration"
            ;;
    esac
fi
echo ""

# Clean up backup file
rm -f .env.bak

echo "======================================"
echo "✅ Setup Complete!"
echo "======================================"
echo ""
echo "Your .env file has been configured."
echo ""
echo "Next steps:"
echo "1. Review and verify your .env file"
echo "2. Update frontend configuration files with Auth0 credentials:"
echo "   - frontend/login.html"
echo "   - frontend/profile-view.html"
echo "   - frontend/callback.html"
echo "3. Install dependencies: npm install"
echo "4. Start the server: npm start"
echo ""
echo "For detailed setup instructions, see:"
echo "- AUTH0_SETUP_GUIDE.md"
echo "- README.md"
echo ""
echo "Happy coding! 🎬"
