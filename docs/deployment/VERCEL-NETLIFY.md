# Vercel/Netlify Deployment Guide

This guide covers deploying Netflix and Chill to Vercel (backend + frontend) or Netlify (frontend only).

## Option 1: Vercel Deployment

Vercel is excellent for Node.js applications with serverless functions.

### Prerequisites
- Vercel account (https://vercel.com)
- Git repository

### Quick Deploy

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

### Configuration

Create `vercel.json` in the root directory:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/$1"
    }
  ],
  "env": {
    "TMDB_API_KEY": "@tmdb-api-key",
    "DB_TYPE": "file"
  }
}
```

### Set Environment Variables

```bash
# Add secrets (for production)
vercel secrets add tmdb-api-key your_api_key_here

# Or set environment variables via dashboard
vercel env add TMDB_API_KEY
```

### Database Options for Vercel

#### Using MongoDB Atlas
```bash
vercel env add DB_TYPE production
# Enter: mongodb

vercel env add MONGODB_URI production
# Enter your MongoDB Atlas connection string
```

#### Using Vercel Postgres (Neon)
```bash
vercel postgres create

# This will automatically set DATABASE_URL
vercel env add DB_TYPE production
# Enter: postgresql
```

### Deploy to Production

```bash
vercel --prod
```

### GitHub Integration

1. Go to https://vercel.com/dashboard
2. Click "Import Project"
3. Connect your GitHub repository
4. Configure environment variables
5. Deploy

Vercel will automatically deploy on every push to your repository.

### Custom Domain

1. Go to Project Settings → Domains
2. Add your domain
3. Configure DNS records as shown

## Option 2: Netlify Deployment

Netlify is great for static sites and serverless functions.

### Prerequisites
- Netlify account (https://netlify.com)
- Git repository

### Quick Deploy

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Initialize Site**
   ```bash
   netlify init
   ```

### Configuration

Create `netlify.toml` in root directory:

```toml
[build]
  command = "echo 'No build needed'"
  publish = "frontend"

[functions]
  directory = "netlify/functions"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Convert Express to Netlify Functions

Create serverless functions in `netlify/functions/`:

**netlify/functions/api.js:**
```javascript
const serverless = require('serverless-http');
const app = require('../../backend/server');

module.exports.handler = serverless(app);
```

Install dependency:
```bash
npm install serverless-http
```

### Set Environment Variables

Via CLI:
```bash
netlify env:set TMDB_API_KEY "your_api_key"
netlify env:set DB_TYPE "mongodb"
netlify env:set MONGODB_URI "your_mongodb_uri"
```

Or via Dashboard:
1. Go to Site Settings → Build & Deploy → Environment
2. Add variables

### Deploy

```bash
netlify deploy --prod
```

### GitHub Integration

1. Go to https://app.netlify.com
2. Click "New site from Git"
3. Connect GitHub repository
4. Configure build settings
5. Deploy

### Database for Netlify

Netlify works best with external databases:

- **MongoDB Atlas** (Recommended)
- **Fauna DB** (Netlify's serverless database)
- **Supabase** (PostgreSQL)

## Option 3: Digital Ocean App Platform

### Prerequisites
- Digital Ocean account

### Deploy via GitHub

1. Go to https://cloud.digitalocean.com/apps
2. Click "Create App"
3. Connect GitHub repository
4. Select branch
5. Configure:
   - **Name**: netflix-and-chill
   - **Type**: Web Service
   - **Build Command**: `npm install`
   - **Run Command**: `npm start`
6. Add environment variables
7. Deploy

### Estimated Cost
- Basic: $5/month
- Professional: $12/month

## Option 4: Render

### Prerequisites
- Render account (https://render.com)

### Deploy

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect repository
4. Configure:
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add environment variables:
   ```
   TMDB_API_KEY=your_api_key
   DB_TYPE=file
   ```
6. Deploy

### Free Tier
Render offers a free tier with:
- Automatic SSL
- Auto-deploy from Git
- Sleeps after 15 minutes of inactivity

### Add PostgreSQL
1. Click "New +" → "PostgreSQL"
2. Select free tier
3. Connect to web service
4. Set environment variables

## Environment Variables (All Platforms)

Required variables:
```
TMDB_API_KEY=your_tmdb_api_key
DB_TYPE=file (or mongodb, postgresql)
NODE_ENV=production
```

Optional (for databases):
```
MONGODB_URI=mongodb+srv://...
PG_HOST=...
PG_PORT=5432
PG_DATABASE=...
PG_USER=...
PG_PASSWORD=...
```

## Static Site Optimization

For better performance, consider:

1. **Use CDN**: All platforms provide CDN
2. **Compress Assets**: Enable gzip/brotli
3. **Cache Static Files**: Set cache headers
4. **Optimize Images**: Use WebP format

## Monitoring & Analytics

### Vercel Analytics
```bash
npm install @vercel/analytics
```

Add to frontend:
```javascript
import { Analytics } from '@vercel/analytics/react';

<Analytics />
```

### Netlify Analytics
Enable in dashboard (paid feature)

## Cost Comparison

| Platform | Free Tier | Paid Tier |
|----------|-----------|-----------|
| Vercel | Hobby (free) | Pro ($20/mo) |
| Netlify | Starter (100GB/mo) | Pro ($19/mo) |
| Render | 750 hours/mo | Starter ($7/mo) |
| Digital Ocean | N/A | Basic ($5/mo) |

## Troubleshooting

### Vercel
- Check logs: `vercel logs`
- Check build: View deployment logs in dashboard

### Netlify
- Check logs: `netlify logs`
- Check functions: Netlify dashboard → Functions

### Common Issues
1. **Environment variables not set**: Check platform dashboard
2. **Build fails**: Ensure all dependencies in package.json
3. **Database connection**: Verify connection strings
4. **Port issues**: Platforms auto-assign ports

## Best Practices

1. Use environment variables for secrets
2. Enable automatic deployments from Git
3. Set up custom domain with SSL
4. Monitor logs and errors
5. Use external database for persistence
6. Enable caching for static assets

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [Render Documentation](https://render.com/docs)
- [Digital Ocean App Platform](https://docs.digitalocean.com/products/app-platform/)
