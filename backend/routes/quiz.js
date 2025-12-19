const express = require('express');
const { QUIZ_QUESTIONS, QUIZ_CATEGORIES, DEBATE_TOPICS } = require('../constants/quizQuestions');

const router = express.Router();

// Get all quiz questions
router.get('/questions', (req, res) => {
  try {
    res.json({
      success: true,
      questions: QUIZ_QUESTIONS,
      totalQuestions: QUIZ_QUESTIONS.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get quiz categories
router.get('/categories', (req, res) => {
  try {
    res.json({
      success: true,
      categories: QUIZ_CATEGORIES
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get debate topics
router.get('/debate-topics', (req, res) => {
  try {
    res.json({
      success: true,
      topics: DEBATE_TOPICS
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
