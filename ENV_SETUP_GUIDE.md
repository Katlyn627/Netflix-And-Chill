# Environment Setup Guide

This guide explains how to set up your environment variables using the new `.env.sample` file.

## Quick Setup

### For Backend (Minimum Required)

```bash
# 1. Copy the sample file
cp .env.sample backend/.env

# 2. Edit the file and add your required API keys
nano backend/.env  # or use your preferred editor
```

**Minimum Required Variables:**
- `TMDB_API_KEY` - Get free API key at https://www.themoviedb.org/settings/api
- `JWT_SECRET` - Generate with: `openssl rand -base64 32`

**Recommended Settings:**
- `PORT=3000` (default)
- `DB_TYPE=file` (no database setup needed)
- `NODE_ENV=development`

### For Frontend (Optional)

```bash
# Only if you need to customize frontend settings
cp .env.sample frontend/.env

# Edit and keep only frontend-relevant variables:
nano frontend/.env
```

Typically, you only need:
```bash
API_BASE_URL=http://localhost:3000
FRONTEND_PORT=8080
```

## Step-by-Step Setup

### 1. Get Your TMDB API Key (Required)

1. Go to https://www.themoviedb.org/signup
2. Create a free account
3. Go to Settings > API
4. Request an API Key (choose "Developer")
5. Fill in the application details
6. Copy your API Key (v3 auth)

### 2. Generate JWT Secret (Required)

```bash
# On Linux/Mac:
openssl rand -base64 32

# Example output: 7x9Kp2mN5qRsT8vWyZ1aB3cD4eF6gH8i
```

### 3. Configure Your Environment

Edit `backend/.env` and update:

```bash
# Required
PORT=3000
NODE_ENV=development
DB_TYPE=file
TMDB_API_KEY=your_actual_tmdb_api_key_here
JWT_SECRET=your_generated_jwt_secret_here

# Optional - Add later as needed
WATCHMODE_API_KEY=
FIREBASE_API_KEY=
STREAM_API_KEY=
# ... other optional services
```

### 4. Test Your Configuration

```bash
# Start the backend
cd backend
npm install
npm start

# If successful, you should see:
# Server running on port 3000
# Database type: file
```

## Configuration Options

### Database Types

**File-based (Default - No Setup Required):**
```bash
DB_TYPE=file
# Data stored in data/ folder as JSON files
```

**MongoDB:**
```bash
DB_TYPE=mongodb
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/netflix-and-chill
```
See [docs/setup/MONGODB_SETUP.md](docs/setup/MONGODB_SETUP.md) for detailed setup.

**PostgreSQL:**
```bash
DB_TYPE=postgresql
POSTGRES_URI=postgres://username:password@host:5432/netflix_and_chill
```

### Optional Services

Add these as needed based on features you want to use:

**Authentication:**
- Firebase Auth or Auth0
- See [API_KEYS_GUIDE.md](API_KEYS_GUIDE.md) for setup

**Chat Services:**
- Stream Chat (recommended)
- SendBird
- Twilio

**Cloud Storage:**
- AWS S3
- Google Cloud Storage

**Analytics:**
- Google Analytics
- Mixpanel
- Sentry

## Environment Files Overview

```
.env.sample              # Template with all options (use this as reference)
backend/.env             # Backend configuration (copy from .env.sample)
backend/.env.example     # Backend example (legacy, use .env.sample instead)
frontend/.env            # Frontend configuration (optional)
frontend/.env.example    # Frontend example (legacy)
```

## Security Best Practices

✅ **DO:**
- Use `.env.sample` as your reference
- Copy to `backend/.env` and fill in real values
- Generate strong, unique JWT secrets
- Use different keys for development and production
- Keep your `.env` files private and never commit them

❌ **DON'T:**
- Don't commit `.env` files to Git (already in .gitignore)
- Don't share API keys publicly
- Don't use example/placeholder values in production
- Don't reuse the same JWT secret across projects

## Troubleshooting

### "Cannot find module" errors

Make sure you've installed dependencies:
```bash
cd backend
npm install
```

### "Invalid API key" errors

1. Double-check your TMDB API key
2. Make sure there are no extra spaces
3. Verify the key is active in your TMDB account

### "Database connection failed"

For file-based storage:
- No setup needed, it will auto-create data/ folder

For MongoDB/PostgreSQL:
- Check your connection string
- Verify credentials are correct
- Ensure database is accessible

### Environment variables not loading

1. Make sure file is named exactly `.env` (not `env.txt` or `.env.txt`)
2. Verify it's in the correct directory (`backend/.env`)
3. Restart your server after changing .env

## Need Help?

- **API Key Setup**: See [API_KEYS_GUIDE.md](API_KEYS_GUIDE.md)
- **MongoDB Setup**: See [docs/setup/MONGODB_SETUP.md](docs/setup/MONGODB_SETUP.md)
- **Quick Start**: See [docs/quickstart/QUICKSTART_GENERAL.md](docs/quickstart/QUICKSTART_GENERAL.md)
- **Deployment**: See [docs/deployment/](docs/deployment/)

## Example: Minimal Working Setup

```bash
# Minimum viable configuration for development
PORT=3000
NODE_ENV=development
DB_TYPE=file
TMDB_API_KEY=abc123def456ghi789jkl012mno345
JWT_SECRET=7x9Kp2mN5qRsT8vWyZ1aB3cD4eF6gH8i
```

This is all you need to get started! Add other services as you need them.
