const express = require('express');
const matchController = require('../controllers/matchController');

const router = express.Router();

// Find matches for a user
router.get('/:userId', matchController.findMatches.bind(matchController));

// Get match history for a user
router.get('/:userId/history', matchController.getMatchHistory.bind(matchController));

module.exports = router;
