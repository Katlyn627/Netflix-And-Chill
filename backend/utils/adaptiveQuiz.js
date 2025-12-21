/**
 * Adaptive Quiz System
 * Provides shorter quiz versions based on category importance
 */

const { QUIZ_QUESTIONS, QUIZ_CATEGORIES } = require('../constants/quizQuestions');

/**
 * Category importance weights for adaptive quiz selection
 * Higher values = more important for matching
 */
const CATEGORY_IMPORTANCE = {
  viewing_style: 10,
  social_viewing: 9,
  content: 9,
  movie_preferences: 8,
  viewing_habits: 8,
  franchises: 7,
  storytelling: 7,
  pacing: 6,
  representation: 6,
  viewing_environment: 5,
  viewing_etiquette: 5,
  production: 4,
  collecting: 3,
  engagement: 6
};

class AdaptiveQuiz {
  /**
   * Get adaptive quiz with specified number of questions
   * @param {number} questionCount - Number of questions (15, 25, or 50)
   * @param {string} quizVersion - Version identifier (default: 'v1')
   * @returns {Object} Quiz configuration with selected questions
   */
  static getAdaptiveQuiz(questionCount = 25, quizVersion = 'v1') {
    if (questionCount >= 50) {
      // Return full quiz
      return {
        version: quizVersion,
        questionCount: QUIZ_QUESTIONS.length,
        quizType: 'full',
        questions: QUIZ_QUESTIONS,
        categories: QUIZ_CATEGORIES,
        description: 'Complete 50-question movie personality assessment'
      };
    }

    // Select questions based on category importance
    const selectedQuestions = this.selectQuestionsByImportance(questionCount);

    return {
      version: quizVersion,
      questionCount: selectedQuestions.length,
      quizType: questionCount <= 15 ? 'quick' : 'standard',
      questions: selectedQuestions,
      categories: QUIZ_CATEGORIES,
      description: questionCount <= 15 
        ? 'Quick 15-question movie personality snapshot'
        : 'Standard 25-question movie personality assessment'
    };
  }

  /**
   * Select questions prioritizing important categories
   * @param {number} count - Number of questions to select
   * @returns {Array} Selected questions
   */
  static selectQuestionsByImportance(count) {
    // Group questions by category
    const questionsByCategory = {};
    QUIZ_QUESTIONS.forEach(question => {
      const category = question.category;
      if (!questionsByCategory[category]) {
        questionsByCategory[category] = [];
      }
      questionsByCategory[category].push(question);
    });

    // Calculate how many questions to take from each category
    const totalImportance = Object.values(CATEGORY_IMPORTANCE).reduce((sum, val) => sum + val, 0);
    const categoryQuestionCounts = {};
    
    Object.keys(questionsByCategory).forEach(category => {
      const importance = CATEGORY_IMPORTANCE[category] || 1;
      const proportion = importance / totalImportance;
      const questionsInCategory = questionsByCategory[category].length;
      
      // Allocate questions proportionally, but ensure at least 1 from important categories
      let allocated = Math.round(count * proportion);
      if (allocated === 0 && importance >= 7) {
        allocated = 1;
      }
      
      categoryQuestionCounts[category] = Math.min(allocated, questionsInCategory);
    });

    // Adjust to meet exact count
    let totalAllocated = Object.values(categoryQuestionCounts).reduce((sum, val) => sum + val, 0);
    
    // Sort categories by importance for adjustment
    const sortedCategories = Object.keys(CATEGORY_IMPORTANCE)
      .sort((a, b) => CATEGORY_IMPORTANCE[b] - CATEGORY_IMPORTANCE[a]);

    // Add more questions if under count
    while (totalAllocated < count) {
      for (const category of sortedCategories) {
        if (totalAllocated >= count) break;
        if (questionsByCategory[category] && 
            categoryQuestionCounts[category] < questionsByCategory[category].length) {
          categoryQuestionCounts[category]++;
          totalAllocated++;
        }
      }
    }

    // Remove questions if over count
    while (totalAllocated > count) {
      for (let i = sortedCategories.length - 1; i >= 0; i--) {
        if (totalAllocated <= count) break;
        const category = sortedCategories[i];
        if (categoryQuestionCounts[category] > 0) {
          categoryQuestionCounts[category]--;
          totalAllocated--;
        }
      }
    }

    // Select specific questions from each category
    const selectedQuestions = [];
    Object.keys(categoryQuestionCounts).forEach(category => {
      const countNeeded = categoryQuestionCounts[category];
      const availableQuestions = questionsByCategory[category] || [];
      
      // Select evenly distributed questions from category
      const step = availableQuestions.length / countNeeded;
      for (let i = 0; i < countNeeded && i < availableQuestions.length; i++) {
        const index = Math.floor(i * step);
        selectedQuestions.push(availableQuestions[index]);
      }
    });

    // Sort by original question order
    selectedQuestions.sort((a, b) => {
      const idA = parseInt(a.id.replace('q', ''));
      const idB = parseInt(b.id.replace('q', ''));
      return idA - idB;
    });

    return selectedQuestions;
  }

  /**
   * Get recommended quiz type based on user context
   * @param {Object} context - User context {hasTime, isNewUser, previousAttempts}
   * @returns {number} Recommended question count
   */
  static getRecommendedQuizLength(context = {}) {
    const { hasTime = true, isNewUser = false, previousAttempts = 0 } = context;

    // New users should take full quiz for best matching
    if (isNewUser && hasTime) {
      return 50;
    }

    // Users with previous attempts can take shorter versions
    if (previousAttempts > 0) {
      return hasTime ? 25 : 15;
    }

    // Default to standard quiz
    return hasTime ? 50 : 25;
  }

  /**
   * Get quiz metadata for all available versions
   * @returns {Array} Available quiz configurations
   */
  static getAvailableQuizzes() {
    return [
      {
        questionCount: 15,
        type: 'quick',
        estimatedTime: '3-5 minutes',
        description: 'Quick personality snapshot - perfect for busy users',
        recommended: 'returning users or time-constrained'
      },
      {
        questionCount: 25,
        type: 'standard',
        estimatedTime: '5-8 minutes',
        description: 'Balanced assessment with good accuracy',
        recommended: 'most users'
      },
      {
        questionCount: 50,
        type: 'full',
        estimatedTime: '10-15 minutes',
        description: 'Complete personality analysis for best matching',
        recommended: 'new users seeking optimal matches'
      }
    ];
  }

  /**
   * Calculate coverage of quiz compared to full version
   * @param {number} questionCount 
   * @returns {Object} Coverage statistics
   */
  static calculateCoverage(questionCount) {
    const adaptiveQuiz = this.getAdaptiveQuiz(questionCount);
    const categoriesCovered = new Set(adaptiveQuiz.questions.map(q => q.category));
    const totalCategories = Object.keys(QUIZ_CATEGORIES).length;

    return {
      questionCoverage: (questionCount / QUIZ_QUESTIONS.length) * 100,
      categoryCoverage: (categoriesCovered.size / totalCategories) * 100,
      categoriesCovered: Array.from(categoriesCovered),
      questionsPerCategory: adaptiveQuiz.questions.reduce((acc, q) => {
        acc[q.category] = (acc[q.category] || 0) + 1;
        return acc;
      }, {})
    };
  }
}

module.exports = AdaptiveQuiz;
