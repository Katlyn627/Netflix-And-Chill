const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

// Create a new user profile
router.post('/', userController.createUser.bind(userController));

// Get user profile
router.get('/:userId', userController.getUser.bind(userController));

// Update user bio
router.put('/:userId/bio', userController.updateBio.bind(userController));

// Add streaming service
router.post('/:userId/streaming-services', userController.addStreamingService.bind(userController));

// Add to watch history
router.post('/:userId/watch-history', userController.addWatchHistory.bind(userController));

// Update preferences
router.put('/:userId/preferences', userController.updatePreferences.bind(userController));

module.exports = router;
