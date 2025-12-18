# Heroku Deployment Guide

This guide will help you deploy Netflix and Chill to Heroku.

## Prerequisites

- A Heroku account (sign up at https://heroku.com)
- Heroku CLI installed (https://devcenter.heroku.com/articles/heroku-cli)
- Git installed

## Deployment Steps

### 1. Login to Heroku

```bash
heroku login
```

### 2. Create a New Heroku App

```bash
heroku create your-app-name
```

Replace `your-app-name` with your desired app name (must be unique across Heroku).

### 3. Set Environment Variables

```bash
# Set TMDB API key (optional, for recommendations)
heroku config:set TMDB_API_KEY=your_tmdb_api_key

# Set database type (optional, default is 'file')
heroku config:set DB_TYPE=file

# For MongoDB (if using MongoDB Atlas)
heroku config:set DB_TYPE=mongodb
heroku config:set MONGODB_URI=your_mongodb_connection_string

# For PostgreSQL (Heroku provides free PostgreSQL)
heroku addons:create heroku-postgresql:mini
heroku config:set DB_TYPE=postgresql
```

### 4. Deploy to Heroku

```bash
git push heroku main
```

If you're on a different branch:

```bash
git push heroku your-branch:main
```

### 5. Open Your App

```bash
heroku open
```

## Using Heroku PostgreSQL

Heroku provides a free PostgreSQL database addon:

```bash
# Add PostgreSQL addon
heroku addons:create heroku-postgresql:mini

# Set database type
heroku config:set DB_TYPE=postgresql

# View database credentials
heroku config:get DATABASE_URL
```

The PostgreSQL adapter will automatically use Heroku's `DATABASE_URL` environment variable.

## Using MongoDB Atlas

For MongoDB, use MongoDB Atlas (free tier available):

1. Create a free cluster at https://www.mongodb.com/cloud/atlas
2. Get your connection string
3. Set environment variables:

```bash
heroku config:set DB_TYPE=mongodb
heroku config:set MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/netflix-and-chill"
```

## Logs and Monitoring

View logs:
```bash
heroku logs --tail
```

View app info:
```bash
heroku apps:info
```

## Scaling

Scale your dynos:
```bash
# Scale web dyno
heroku ps:scale web=1

# For higher traffic
heroku ps:scale web=2
```

## Custom Domain

Add a custom domain:
```bash
heroku domains:add www.yourdomain.com
```

## Troubleshooting

### Port Issues
Heroku automatically sets the PORT environment variable. The app uses `process.env.PORT`.

### Build Failures
Check logs:
```bash
heroku logs --tail
```

### Database Connection
Verify environment variables:
```bash
heroku config
```

## Cost Optimization

- **Free Tier**: Heroku offers 550-1000 free dyno hours per month
- **Sleep Mode**: Free dynos sleep after 30 minutes of inactivity
- **Add-ons**: Use free tier for PostgreSQL or MongoDB Atlas free tier

## Continuous Deployment

Enable GitHub integration for automatic deployments:

1. Go to Heroku Dashboard
2. Select your app
3. Go to "Deploy" tab
4. Connect to GitHub
5. Enable automatic deploys from your branch

## Environment Files

Create a `.env` file for local development (never commit to Git):

```env
PORT=3000
TMDB_API_KEY=your_api_key
DB_TYPE=file
NODE_ENV=development
```

For Heroku, use `heroku config:set` instead.

## Maintenance Mode

Enable maintenance mode:
```bash
heroku maintenance:on
heroku maintenance:off
```

## Backup (PostgreSQL)

Create a backup:
```bash
heroku pg:backups:capture
heroku pg:backups:download
```

## Resources

- [Heroku Node.js Guide](https://devcenter.heroku.com/articles/getting-started-with-nodejs)
- [Heroku PostgreSQL](https://devcenter.heroku.com/articles/heroku-postgresql)
- [Heroku CLI Commands](https://devcenter.heroku.com/articles/heroku-cli-commands)
