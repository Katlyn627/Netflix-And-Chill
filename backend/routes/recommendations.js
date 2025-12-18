const express = require('express');
const router = express.Router();
const recommendationService = require('../services/recommendationService');
const DataStore = require('../utils/dataStore');

const dataStore = new DataStore();

/**
 * GET /api/recommendations/:userId
 * Get personalized recommendations for a user
 */
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    const user = await dataStore.findUserById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const recommendations = await recommendationService.getRecommendationsForUser(user, limit);

    res.json({
      userId,
      count: recommendations.length,
      recommendations
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

module.exports = router;
