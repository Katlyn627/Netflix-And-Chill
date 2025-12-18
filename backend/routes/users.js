const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

// Create a new user profile
router.post('/', userController.createUser.bind(userController));

// Login user
router.post('/login', userController.loginUser.bind(userController));

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

// Upload profile picture
router.post('/:userId/profile-picture', userController.uploadProfilePicture.bind(userController));

// Add photo to gallery
router.post('/:userId/photos', userController.addPhotoToGallery.bind(userController));

// Remove photo from gallery
router.delete('/:userId/photos', userController.removePhotoFromGallery.bind(userController));

// Update extended profile details
router.put('/:userId/profile-details', userController.updateProfileDetails.bind(userController));

// Submit quiz responses
router.put('/:userId/quiz', userController.submitQuizResponses.bind(userController));

// Update password
router.put('/:userId/password', userController.updatePassword.bind(userController));

// Reset password (forgot password)
router.post('/reset-password', userController.resetPassword.bind(userController));

module.exports = router;
