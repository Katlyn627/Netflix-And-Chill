const express = require('express');
const router = express.Router();
const Like = require('../models/Like');
const User = require('../models/User');
const { getDatabase } = require('../utils/database');
const MatchingEngine = require('../utils/matchingEngine');

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

    const dataStore = await getDatabase();
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

    const dataStore = await getDatabase();
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
 * Get all likes received by a user (premium feature with full details)
 */
router.get('/:userId/received', async (req, res) => {
  try {
    const { userId } = req.params;

    const dataStore = await getDatabase();
    const user = await dataStore.findUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const likes = await dataStore.findLikesToUser(userId);
    
    // Count unread likes for badge indicator
    const unreadCount = likes.filter(like => !like.read).length;

    // For premium users, include full user details of who liked them
    if (user.isPremium) {
      const likesWithUserDetails = await Promise.all(
        likes.map(async (like) => {
          const fromUser = await dataStore.findUserById(like.fromUserId);
          return {
            ...like,
            fromUser: fromUser ? {
              id: fromUser.id,
              username: fromUser.username,
              age: fromUser.age,
              location: fromUser.location,
              bio: fromUser.bio,
              profilePicture: fromUser.profilePicture,
              gender: fromUser.gender,
              sexualOrientation: fromUser.sexualOrientation,
              streamingServices: fromUser.streamingServices,
              archetype: fromUser.archetype
            } : null
          };
        })
      );

      return res.json({
        userId,
        count: likes.length,
        unreadCount: unreadCount,
        likes: likesWithUserDetails.filter(l => l.fromUser !== null),
        isPremium: true
      });
    }

    // For free users, only return count
    res.json({
      userId,
      count: likes.length,
      unreadCount: unreadCount,
      likes: [],
      isPremium: false,
      message: 'Upgrade to premium to see who liked you'
    });
  } catch (error) {
    console.error('Error getting received likes:', error);
    res.status(500).json({ error: 'Failed to get received likes' });
  }
});

/**
 * GET /api/likes/:userId/mutual
 * Get mutual likes (matches) with compatibility scores
 */
router.get('/:userId/mutual', async (req, res) => {
  try {
    const { userId } = req.params;

    const dataStore = await getDatabase();
    const user = await dataStore.findUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const mutualLikes = await dataStore.findMutualLikes(userId);

    // Enrich mutual likes with match scores calculated from all user data
    const enrichedMutualLikes = await Promise.all(
      mutualLikes.map(async (mutualLike) => {
        try {
          const otherUser = await dataStore.findUserById(mutualLike.userId);
          if (!otherUser) {
            return null;
          }

          // Calculate match score using the MatchingEngine
          const currentUser = new User(user);
          const matchedUser = new User(otherUser);
          const matchResult = MatchingEngine.calculateMatch(currentUser, matchedUser);

          return {
            fromUserId: userId,
            toUserId: mutualLike.userId,
            matched: true,
            matchScore: matchResult.score,
            matchDescription: matchResult.matchDescription,
            sharedContent: matchResult.sharedContent,
            quizCompatibility: matchResult.quizCompatibility || 0,
            snackCompatibility: matchResult.snackCompatibility || 0,
            debateCompatibility: matchResult.debateCompatibility || 0,
            emotionalToneCompatibility: matchResult.emotionalToneCompatibility || 0,
            bingeCompatibility: matchResult.bingeCompatibility || 0,
            swipeGenreCompatibility: matchResult.swipeGenreCompatibility || 0,
            contentTypeCompatibility: matchResult.contentTypeCompatibility || 0
          };
        } catch (error) {
          console.error('Error calculating match score for mutual like:', error);
          return null;
        }
      })
    );

    // Filter out any null entries
    const validMutualLikes = enrichedMutualLikes.filter(m => m !== null);

    res.json({
      userId,
      count: validMutualLikes.length,
      mutualLikes: validMutualLikes
    });
  } catch (error) {
    console.error('Error getting mutual likes:', error);
    res.status(500).json({ error: 'Failed to get mutual likes' });
  }
});

/**
 * PUT /api/likes/:likeId/read
 * Mark a like as read
 */
router.put('/:likeId/read', async (req, res) => {
  try {
    const { likeId } = req.params;

    const dataStore = await getDatabase();
    const success = await dataStore.markLikeAsRead(likeId);

    if (!success) {
      return res.status(404).json({ error: 'Like not found' });
    }

    res.json({
      success: true,
      message: 'Like marked as read',
      likeId
    });
  } catch (error) {
    console.error('Error marking like as read:', error);
    res.status(500).json({ error: 'Failed to mark like as read' });
  }
});

module.exports = router;
