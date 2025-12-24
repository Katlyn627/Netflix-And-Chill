// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const userRoutes = require('./routes/users');
const matchRoutes = require('./routes/matches');
const recommendationRoutes = require('./routes/recommendations');
const likeRoutes = require('./routes/likes');
const streamingRoutes = require('./routes/streaming');
const uploadRoutes = require('./routes/uploads');
const chatRoutes = require('./routes/chat');
const swipeRoutes = require('./routes/swipe');
const watchInvitationRoutes = require('./routes/watchInvitations');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security Headers - Content Security Policy
app.use((req, res, next) => {
  // Set Content Security Policy header to prevent eval() and inline scripts
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com https://www.gstatic.com https://apis.google.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: http:",
      "connect-src 'self' https://api.themoviedb.org https://image.tmdb.org https://*.firebaseio.com https://*.googleapis.com wss://*.firebaseio.com",
      "frame-src 'self' https://*.firebaseapp.com",
      "object-src 'none'",
      "base-uri 'self'"
    ].join('; ')
  );
  
  // Additional security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
});

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/streaming', streamingRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/swipe', swipeRoutes);
app.use('/api/watch-invitations', watchInvitationRoutes);

// Handle Chrome DevTools well-known requests
app.get('/.well-known/appspecific/com.chrome.devtools.json', (_req, res) => {
  res.status(204).end();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Netflix and Chill API is running' });
});

// Root endpoint - serve the frontend HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Netflix and Chill API',
    version: '1.0.0',
    description: 'Dating app that matches users based on their streaming preferences',
    endpoints: {
      users: '/api/users',
      matches: '/api/matches'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Netflix and Chill server running on port ${PORT}`);
  });
}

module.exports = app;
