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

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/streaming', streamingRoutes);

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
