const express = require('express');
const matchController = require('../controllers/matchController');

const router = express.Router();

// Find matches for a user (and save them)
router.get('/find/:userId', matchController.findMatches.bind(matchController));

// Get saved match history for a user
router.get('/:userId/history', matchController.getMatchHistory.bind(matchController));

// Legacy route for backward compatibility
router.get('/:userId', matchController.findMatches.bind(matchController));

module.exports = router;
