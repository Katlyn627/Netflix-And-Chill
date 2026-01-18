const express = require('express');
const router = express.Router();
const { 
  ARCHETYPES, 
  determineArchetype, 
  getArchetypeRecommendations 
} = require('../utils/movieArchetypes');
const { 
  DEBATE_PROMPTS, 
  getRandomDebatePrompt, 
  getDebateCategories, 
  getPromptsByType 
} = require('../utils/debatePrompts');
const dataStore = require('../utils/dataStore');

/**
 * GET /api/archetypes/all
 * Get all available archetypes
 */
router.get('/all', (req, res) => {
  try {
    res.json({
      success: true,
      archetypes: ARCHETYPES
    });
  } catch (error) {
    console.error('Error fetching archetypes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch archetypes'
    });
  }
});

/**
 * GET /api/archetypes/user/:userId
 * Get archetype for a specific user
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await dataStore.getUser(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const archetype = determineArchetype(user);

    res.json({
      success: true,
      archetype,
      recommendations: getArchetypeRecommendations(archetype.primary.type)
    });
  } catch (error) {
    console.error('Error determining user archetype:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to determine archetype'
    });
  }
});

/**
 * GET /api/archetypes/recommendations/:archetype
 * Get compatible archetypes for matching
 */
router.get('/recommendations/:archetype', (req, res) => {
  try {
    const { archetype } = req.params;
    const recommendations = getArchetypeRecommendations(archetype);

    res.json({
      success: true,
      recommendations
    });
  } catch (error) {
    console.error('Error fetching archetype recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recommendations'
    });
  }
});

/**
 * GET /api/archetypes/debates/prompts
 * Get debate prompts
 */
router.get('/debates/prompts', (req, res) => {
  try {
    const { type, category } = req.query;

    let prompts;
    if (type) {
      prompts = getPromptsByType(type);
    } else if (category) {
      prompts = DEBATE_PROMPTS.CONTROVERSIAL_OPINIONS.filter(p => p.category === category);
    } else {
      prompts = {
        controversial: DEBATE_PROMPTS.CONTROVERSIAL_OPINIONS,
        wouldYouRather: DEBATE_PROMPTS.WOULD_YOU_RATHER,
        thisOrThat: DEBATE_PROMPTS.THIS_OR_THAT
      };
    }

    res.json({
      success: true,
      prompts,
      categories: getDebateCategories()
    });
  } catch (error) {
    console.error('Error fetching debate prompts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch debate prompts'
    });
  }
});

/**
 * GET /api/archetypes/debates/random
 * Get a random debate prompt
 */
router.get('/debates/random', (req, res) => {
  try {
    const { category } = req.query;
    const prompt = getRandomDebatePrompt(category);

    res.json({
      success: true,
      prompt
    });
  } catch (error) {
    console.error('Error fetching random debate prompt:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch random prompt'
    });
  }
});

/**
 * POST /api/archetypes/debates/answer
 * Save user's answer to a debate prompt
 */
router.post('/debates/answer', async (req, res) => {
  try {
    const { userId, promptId, answer } = req.body;

    if (!userId || !promptId || !answer) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const user = await dataStore.getUser(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Initialize debateAnswers array if it doesn't exist
    if (!user.debateAnswers) {
      user.debateAnswers = [];
    }

    // Remove existing answer to same prompt if present
    user.debateAnswers = user.debateAnswers.filter(a => a.promptId !== promptId);

    // Add new answer
    user.debateAnswers.push({
      promptId,
      answer,
      timestamp: new Date().toISOString()
    });

    await dataStore.updateUser(userId, user);

    res.json({
      success: true,
      message: 'Debate answer saved',
      totalAnswers: user.debateAnswers.length
    });
  } catch (error) {
    console.error('Error saving debate answer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save debate answer'
    });
  }
});

/**
 * GET /api/archetypes/debates/user/:userId
 * Get user's debate answers
 */
router.get('/debates/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await dataStore.getUser(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      answers: user.debateAnswers || []
    });
  } catch (error) {
    console.error('Error fetching user debate answers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch debate answers'
    });
  }
});

module.exports = router;
