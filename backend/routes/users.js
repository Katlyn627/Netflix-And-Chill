const express = require('express');
const userController = require('../controllers/userController');
const { rateLimiters } = require('../middleware/rateLimiter');

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

// Update streaming services
router.put('/:userId/streaming-services', userController.updateStreamingServices.bind(userController));

// Add to watch history
router.post('/:userId/watch-history', userController.addWatchHistory.bind(userController));

// Remove from watch history
router.delete('/:userId/watch-history', userController.removeWatchHistory.bind(userController));

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

// Get quiz attempts
router.get('/:userId/quiz/attempts', userController.getQuizAttempts.bind(userController));

// Update password
router.put('/:userId/password', userController.updatePassword.bind(userController));

// Reset password (forgot password)
router.post('/reset-password', userController.resetPassword.bind(userController));

// Favorite Movies routes
// Note: movieId in the route is the TMDB ID of the movie
router.post('/:userId/favorite-movies', userController.addFavoriteMovie.bind(userController));
router.get('/:userId/favorite-movies', userController.getFavoriteMovies.bind(userController));
router.delete('/:userId/favorite-movies/:movieId', userController.removeFavoriteMovie.bind(userController));

// Delete user profile
router.delete('/:userId', userController.deleteUser.bind(userController));

// Adaptive Quiz routes
router.get('/quiz/adaptive', userController.getAdaptiveQuiz.bind(userController));
router.get('/quiz/options', userController.getQuizOptions.bind(userController));

// Compatibility Report routes
router.get('/:userId/compatibility/report', userController.getCompatibilityReport.bind(userController));
router.post('/compatibility/group', userController.getGroupCompatibilityReport.bind(userController));

// Archetype Recommendations routes
router.get('/:userId/recommendations/archetype', userController.getArchetypeRecommendations.bind(userController));
router.get('/:userId/recommendations/mood', userController.getMoodBasedRecommendations.bind(userController));

// Quiz Feedback routes
router.post('/:userId/quiz/feedback', userController.submitQuizFeedback.bind(userController));
router.post('/:userId/quiz/question-feedback', userController.submitQuestionFeedback.bind(userController));

// Profile Frame routes
router.get('/:userId/profile-frames', userController.getAvailableFrames.bind(userController));
router.put('/:userId/profile-frames', userController.updateProfileFrame.bind(userController));
router.delete('/:userId/profile-frames', userController.removeProfileFrame.bind(userController));

// Premium profile routes
router.get('/:userId/premium', userController.getPremiumStatus.bind(userController));
router.put('/:userId/premium', userController.updatePremiumStatus.bind(userController));
router.post('/:userId/premium/features', userController.addPremiumFeature.bind(userController));

// Boost profile routes (premium feature)
router.post('/:userId/boost', userController.activateBoost.bind(userController));
router.get('/:userId/boost', userController.getBoostStatus.bind(userController));

// Streaming service usage tracking routes
router.get('/:userId/viewing-stats', userController.getViewingStatistics.bind(userController));
router.get('/:userId/streaming-services/:serviceName/stats', userController.getServiceUsageStats.bind(userController));
router.put('/:userId/streaming-services/:serviceName/usage', userController.updateServiceUsage.bind(userController));

// Auth0 integration route (with rate limiting for security)
router.post('/auth0', rateLimiters.auth, userController.createOrUpdateAuth0User.bind(userController));

module.exports = router;
