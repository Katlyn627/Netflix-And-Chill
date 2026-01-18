/**
 * Debate Prompts System
 * Provides controversial and thought-provoking prompts to spark conversations
 */

const DEBATE_PROMPTS = {
  CONTROVERSIAL_OPINIONS: [
    {
      id: 'debate_1',
      category: 'Hot Takes',
      prompt: 'Breaking Bad is overrated and doesn\'t deserve the hype',
      emoji: '🔥',
      sides: ['Agree', 'Disagree']
    },
    {
      id: 'debate_2',
      category: 'Hot Takes',
      prompt: 'Marvel movies are killing cinema creativity',
      emoji: '🎬',
      sides: ['True', 'False']
    },
    {
      id: 'debate_3',
      category: 'Hot Takes',
      prompt: 'Friends is not funny in 2026',
      emoji: '😅',
      sides: ['Still Hilarious', 'Hasn\'t Aged Well']
    },
    {
      id: 'debate_4',
      category: 'Viewing Habits',
      prompt: 'Watching with subtitles ON is the only way to watch',
      emoji: '📝',
      sides: ['Always Subtitles', 'Never Subtitles']
    },
    {
      id: 'debate_5',
      category: 'Viewing Habits',
      prompt: 'Spoilers actually make shows more enjoyable',
      emoji: '👀',
      sides: ['Spoilers Enhance', 'No Spoilers Ever']
    },
    {
      id: 'debate_6',
      category: 'Viewing Habits',
      prompt: 'Binge-watching ruins the experience of a great show',
      emoji: '⏱️',
      sides: ['Binge Away', 'One Per Week']
    },
    {
      id: 'debate_7',
      category: 'Content',
      prompt: 'Reality TV is just as valid as scripted shows',
      emoji: '🎭',
      sides: ['Equally Valid', 'Scripted Only']
    },
    {
      id: 'debate_8',
      category: 'Content',
      prompt: 'Anime is better than Western animation',
      emoji: '🎨',
      sides: ['Anime Wins', 'Western Wins']
    },
    {
      id: 'debate_9',
      category: 'Classics',
      prompt: 'The Office (US) is better than The Office (UK)',
      emoji: '📄',
      sides: ['US Version', 'UK Version']
    },
    {
      id: 'debate_10',
      category: 'Classics',
      prompt: 'The Godfather is boring for modern audiences',
      emoji: '🎩',
      sides: ['Still Amazing', 'Too Slow']
    },
    {
      id: 'debate_11',
      category: 'Streaming Wars',
      prompt: 'Netflix originals have declined in quality',
      emoji: '📺',
      sides: ['Quality Dropped', 'Still Great']
    },
    {
      id: 'debate_12',
      category: 'Streaming Wars',
      prompt: 'Too many streaming services is ruining entertainment',
      emoji: '💸',
      sides: ['Too Many', 'More Choice Better']
    },
    {
      id: 'debate_13',
      category: 'Movie vs TV',
      prompt: 'TV shows tell better stories than movies now',
      emoji: '🎥',
      sides: ['TV Wins', 'Movies Win']
    },
    {
      id: 'debate_14',
      category: 'Movie vs TV',
      prompt: 'Movie theaters are becoming obsolete',
      emoji: '🍿',
      sides: ['Home Is Better', 'Theater Experience']
    },
    {
      id: 'debate_15',
      category: 'Endings',
      prompt: 'Game of Thrones ending wasn\'t THAT bad',
      emoji: '🐉',
      sides: ['Ending Was Fine', 'Terrible Ending']
    },
    {
      id: 'debate_16',
      category: 'Endings',
      prompt: 'Shows should always end while they\'re still good',
      emoji: '🎬',
      sides: ['End Early', 'Keep Going']
    },
    {
      id: 'debate_17',
      category: 'Adaptations',
      prompt: 'The book is always better than the adaptation',
      emoji: '📚',
      sides: ['Books Win', 'Adaptations Can Win']
    },
    {
      id: 'debate_18',
      category: 'Adaptations',
      prompt: 'Remakes and reboots are creatively bankrupt',
      emoji: '🔄',
      sides: ['Stop Remaking', 'Some Are Good']
    },
    {
      id: 'debate_19',
      category: 'Awards',
      prompt: 'Award shows don\'t matter and have no cultural impact',
      emoji: '🏆',
      sides: ['Awards Matter', 'Awards Meaningless']
    },
    {
      id: 'debate_20',
      category: 'Preferences',
      prompt: 'Dark, gritty shows are overrated - bring back fun shows',
      emoji: '🌈',
      sides: ['Dark Is Better', 'Fun Is Better']
    }
  ],
  
  WOULD_YOU_RATHER: [
    {
      id: 'wyr_1',
      prompt: 'Would you rather never watch a TV series again or never watch a movie again?',
      emoji: '🎬',
      options: ['Only TV Series', 'Only Movies']
    },
    {
      id: 'wyr_2',
      prompt: 'Would you rather watch a 10-hour movie in one sitting or one 10-minute episode per day for 60 days?',
      emoji: '⏰',
      options: ['10-Hour Movie', '60 Days of Episodes']
    },
    {
      id: 'wyr_3',
      prompt: 'Would you rather only watch comedies or only watch dramas for the rest of your life?',
      emoji: '😄',
      options: ['Only Comedies', 'Only Dramas']
    },
    {
      id: 'wyr_4',
      prompt: 'Would you rather spoil every show for yourself or never be able to discuss shows with anyone?',
      emoji: '🤐',
      options: ['All Spoilers', 'No Discussions']
    },
    {
      id: 'wyr_5',
      prompt: 'Would you rather have unlimited streaming services but bad internet or one service with perfect 4K streaming?',
      emoji: '📶',
      options: ['All Services + Buffering', 'One Service + Perfect']
    }
  ],
  
  THIS_OR_THAT: [
    {
      id: 'tot_1',
      prompt: 'Scary movies or romantic comedies?',
      emoji: '🎃',
      options: ['Scary', 'Rom-Com']
    },
    {
      id: 'tot_2',
      prompt: 'Popcorn or candy while watching?',
      emoji: '🍿',
      options: ['Popcorn', 'Candy']
    },
    {
      id: 'tot_3',
      prompt: 'Watch alone or with someone?',
      emoji: '👥',
      options: ['Solo Viewing', 'With Someone']
    },
    {
      id: 'tot_4',
      prompt: 'Lights on or lights off?',
      emoji: '💡',
      options: ['Lights On', 'Lights Off']
    },
    {
      id: 'tot_5',
      prompt: 'Background noise or complete silence?',
      emoji: '🔊',
      options: ['Background OK', 'Total Silence']
    }
  ]
};

/**
 * Get random debate prompt
 * @param {string} category - Optional category filter
 * @returns {Object} - Random debate prompt
 */
function getRandomDebatePrompt(category = null) {
  let prompts = DEBATE_PROMPTS.CONTROVERSIAL_OPINIONS;
  
  if (category) {
    prompts = prompts.filter(p => p.category === category);
  }
  
  return prompts[Math.floor(Math.random() * prompts.length)];
}

/**
 * Get all debate categories
 * @returns {Array} - List of unique categories
 */
function getDebateCategories() {
  return [...new Set(
    DEBATE_PROMPTS.CONTROVERSIAL_OPINIONS.map(p => p.category)
  )];
}

/**
 * Get prompts by type
 * @param {string} type - 'controversial', 'would-you-rather', or 'this-or-that'
 * @returns {Array} - Prompts of specified type
 */
function getPromptsByType(type) {
  switch(type) {
    case 'controversial':
      return DEBATE_PROMPTS.CONTROVERSIAL_OPINIONS;
    case 'would-you-rather':
      return DEBATE_PROMPTS.WOULD_YOU_RATHER;
    case 'this-or-that':
      return DEBATE_PROMPTS.THIS_OR_THAT;
    default:
      return [];
  }
}

/**
 * Calculate compatibility based on debate answers
 * @param {Array} user1Answers - User 1's answers {promptId, answer}
 * @param {Array} user2Answers - User 2's answers {promptId, answer}
 * @returns {Object} - Compatibility analysis
 */
function calculateDebateCompatibility(user1Answers, user2Answers) {
  const sharedPrompts = user1Answers.filter(a1 => 
    user2Answers.some(a2 => a2.promptId === a1.promptId)
  );

  if (sharedPrompts.length === 0) {
    return { score: 50, agreements: 0, disagreements: 0, total: 0 };
  }

  let agreements = 0;
  let disagreements = 0;

  sharedPrompts.forEach(a1 => {
    const a2 = user2Answers.find(a => a.promptId === a1.promptId);
    if (a1.answer === a2.answer) {
      agreements++;
    } else {
      disagreements++;
    }
  });

  const total = sharedPrompts.length;
  const agreementRate = (agreements / total) * 100;

  // Sweet spot: 60-80% agreement (some common ground, some debate)
  let score;
  if (agreementRate >= 60 && agreementRate <= 80) {
    score = 90 + (agreementRate - 70) * 0.5; // Peak at 70%
  } else if (agreementRate >= 50 && agreementRate < 60) {
    score = 70 + (agreementRate - 50) * 2;
  } else if (agreementRate > 80 && agreementRate <= 90) {
    score = 85 - (agreementRate - 80) * 0.5;
  } else if (agreementRate < 50) {
    score = 50 + agreementRate; // Too different
  } else {
    score = 80; // Too similar
  }

  return {
    score: Math.round(score),
    agreements,
    disagreements,
    total,
    agreementRate: Math.round(agreementRate),
    interpretation: getCompatibilityInterpretation(agreementRate)
  };
}

/**
 * Get interpretation of compatibility score
 * @param {number} agreementRate - Percentage of agreements
 * @returns {string} - Human-readable interpretation
 */
function getCompatibilityInterpretation(agreementRate) {
  if (agreementRate >= 60 && agreementRate <= 80) {
    return 'Perfect balance of shared views and healthy debates! 🎯';
  } else if (agreementRate >= 80) {
    return 'You think very alike - great minds! 🧠';
  } else if (agreementRate >= 50) {
    return 'Some differences, but room for interesting discussions! 💭';
  } else if (agreementRate >= 30) {
    return 'Opposite views - could lead to exciting debates! ⚡';
  } else {
    return 'Very different perspectives - adventure awaits! 🌟';
  }
}

module.exports = {
  DEBATE_PROMPTS,
  getRandomDebatePrompt,
  getDebateCategories,
  getPromptsByType,
  calculateDebateCompatibility,
  getCompatibilityInterpretation
};
