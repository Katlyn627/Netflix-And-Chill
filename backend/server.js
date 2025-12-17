const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/users');
const matchRoutes = require('./routes/matches');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/matches', matchRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Netflix and Chill API is running' });
});

// Root endpoint
app.get('/', (req, res) => {
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
