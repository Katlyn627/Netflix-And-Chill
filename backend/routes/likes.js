const express = require('express');
const router = express.Router();
const Like = require('../models/Like');
const DataStore = require('../utils/dataStore');

const dataStore = new DataStore();

/**
 * POST /api/likes
 * Create a like or super like
 */
router.post('/', async (req, res) => {
  try {
    const { fromUserId, toUserId, type } = req.body;

    if (!fromUserId || !toUserId) {
      return res.status(400).json({ error: 'fromUserId and toUserId are required' });
    }

    if (type && !['like', 'superlike'].includes(type)) {
      return res.status(400).json({ error: 'type must be "like" or "superlike"' });
    }

    const fromUser = await dataStore.findUserById(fromUserId);
    const toUser = await dataStore.findUserById(toUserId);

    if (!fromUser || !toUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const like = new Like(fromUserId, toUserId, type || 'like');
    await dataStore.addLike(like);

    // Check for mutual like
    const likesToFrom = await dataStore.findLikesToUser(fromUserId);
    const isMutual = likesToFrom.some(l => l.fromUserId === toUserId);

    res.status(201).json({
      message: 'Like created successfully',
      like: like.toJSON(),
      isMutual
    });
  } catch (error) {
    console.error('Error creating like:', error);
    res.status(500).json({ error: 'Failed to create like' });
  }
});

/**
 * GET /api/likes/:userId
 * Get all likes from a user
 */
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await dataStore.findUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const likes = await dataStore.findLikesForUser(userId);

    res.json({
      userId,
      count: likes.length,
      likes
    });
  } catch (error) {
    console.error('Error getting likes:', error);
    res.status(500).json({ error: 'Failed to get likes' });
  }
});

/**
 * GET /api/likes/:userId/received
 * Get all likes received by a user
 */
router.get('/:userId/received', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await dataStore.findUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const likes = await dataStore.findLikesToUser(userId);

    res.json({
      userId,
      count: likes.length,
      likes
    });
  } catch (error) {
    console.error('Error getting received likes:', error);
    res.status(500).json({ error: 'Failed to get received likes' });
  }
});

/**
 * GET /api/likes/:userId/mutual
 * Get mutual likes (matches)
 */
router.get('/:userId/mutual', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await dataStore.findUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const mutualLikes = await dataStore.findMutualLikes(userId);

    res.json({
      userId,
      count: mutualLikes.length,
      mutualLikes
    });
  } catch (error) {
    console.error('Error getting mutual likes:', error);
    res.status(500).json({ error: 'Failed to get mutual likes' });
  }
});

module.exports = router;
