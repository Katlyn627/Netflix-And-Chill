/**
 * Comprehensive 50-question movie compatibility quiz
 */

const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'Do you prefer subtitles or dubbing for foreign films?',
    category: 'viewing_style',
    options: [
      { value: 'subtitles', label: 'Subtitles - I want the original audio' },
      { value: 'dubbing', label: 'Dubbing - Easier to follow' },
      { value: 'no_preference', label: 'No preference' }
    ]
  },
  {
    id: 'q2',
    question: "What's your ideal movie length?",
    category: 'viewing_style',
    options: [
      { value: 'under_90', label: 'Under 90 minutes - Quick and concise' },
      { value: '90_120', label: '90-120 minutes - Just right' },
      { value: 'over_120', label: 'Over 2 hours - The longer the better!' }
    ]
  },
  {
    id: 'q3',
    question: 'How do you feel about movie spoilers?',
    category: 'viewing_style',
    options: [
      { value: 'hate', label: 'Absolutely hate them - No spoilers!' },
      { value: 'dont_mind', label: "Don't mind them" },
      { value: 'like', label: 'Actually prefer knowing what happens' }
    ]
  },
  {
    id: 'q4',
    question: "What's your preferred movie-watching time?",
    category: 'viewing_habits',
    options: [
      { value: 'morning', label: 'Morning person - Early bird gets the film' },
      { value: 'afternoon', label: 'Afternoon - Perfect matinee time' },
      { value: 'evening', label: 'Evening - Prime time viewer' },
      { value: 'late_night', label: 'Late night owl - Midnight screenings' }
    ]
  },
  {
    id: 'q5',
    question: 'When watching with someone, do you prefer to:',
    category: 'social_viewing',
    options: [
      { value: 'silent', label: 'Watch in complete silence' },
      { value: 'occasional_comments', label: 'Make occasional comments' },
      { value: 'full_discussion', label: 'Have a full running commentary' }
    ]
  },
  {
    id: 'q6',
    question: 'How do you choose what to watch?',
    category: 'viewing_habits',
    options: [
      { value: 'plan_ahead', label: 'Plan ahead - Know exactly what to watch' },
      { value: 'browse', label: 'Browse until something clicks' },
      { value: 'rewatch', label: 'Rewatch favorites' },
      { value: 'recommendations', label: 'Follow recommendations' }
    ]
  },
  {
    id: 'q7',
    question: 'How many times can you rewatch your favorite movie?',
    category: 'viewing_habits',
    options: [
      { value: 'once', label: 'Once is enough' },
      { value: 'few_times', label: '2-3 times' },
      { value: 'many_times', label: '5-10 times' },
      { value: 'infinite', label: 'Infinite rewatches!' }
    ]
  },
  {
    id: 'q8',
    question: 'What type of ending do you prefer?',
    category: 'movie_preferences',
    options: [
      { value: 'happy', label: 'Happy ending - All tied up nicely' },
      { value: 'bittersweet', label: 'Bittersweet - Emotionally complex' },
      { value: 'open', label: 'Open ending - Love the mystery' },
      { value: 'twist', label: 'Plot twist - Mind-bending' }
    ]
  },
  {
    id: 'q9',
    question: 'Marvel or DC?',
    category: 'franchises',
    options: [
      { value: 'marvel', label: 'Marvel all the way' },
      { value: 'dc', label: 'DC forever' },
      { value: 'both', label: 'Love both equally' },
      { value: 'neither', label: 'Not into superhero movies' }
    ]
  },
  {
    id: 'q10',
    question: 'Star Wars or Star Trek?',
    category: 'franchises',
    options: [
      { value: 'star_wars', label: 'Star Wars - The Force is strong' },
      { value: 'star_trek', label: 'Star Trek - Live long and prosper' },
      { value: 'both', label: 'Both are amazing' },
      { value: 'neither', label: 'Neither appeals to me' }
    ]
  },
  {
    id: 'q11',
    question: 'What do you think about book-to-movie adaptations?',
    category: 'movie_preferences',
    options: [
      { value: 'book_better', label: 'Book is always better' },
      { value: 'movie_better', label: 'Movies can improve on books' },
      { value: 'different', label: "They're different experiences" },
      { value: 'no_opinion', label: 'No strong opinion' }
    ]
  },
  {
    id: 'q12',
    question: 'How do you feel about remakes and reboots?',
    category: 'movie_preferences',
    options: [
      { value: 'hate', label: 'Hate them - Leave classics alone' },
      { value: 'cautious', label: 'Cautiously optimistic' },
      { value: 'love', label: 'Love fresh takes on classics' },
      { value: 'case_by_case', label: 'Depends on the execution' }
    ]
  },
  {
    id: 'q13',
    question: 'What era of cinema do you prefer?',
    category: 'movie_preferences',
    options: [
      { value: 'classic', label: 'Classic Hollywood (pre-1960s)' },
      { value: '70s_80s', label: '70s-80s Golden age' },
      { value: '90s_00s', label: '90s-2000s' },
      { value: 'modern', label: 'Modern cinema (2010+)' }
    ]
  },
  {
    id: 'q14',
    question: 'CGI or practical effects?',
    category: 'movie_preferences',
    options: [
      { value: 'practical', label: 'Practical effects - Real is better' },
      { value: 'cgi', label: 'CGI - Love the possibilities' },
      { value: 'blend', label: 'Best of both worlds' },
      { value: 'story_matters', label: 'Story matters more than effects' }
    ]
  },
  {
    id: 'q15',
    question: 'How important is the soundtrack to you?',
    category: 'movie_preferences',
    options: [
      { value: 'essential', label: 'Essential - Can make or break a film' },
      { value: 'important', label: 'Important but not critical' },
      { value: 'nice_bonus', label: 'Nice bonus' },
      { value: 'barely_notice', label: 'Barely notice it' }
    ]
  },
  {
    id: 'q16',
    question: 'Black and white or color films?',
    category: 'movie_preferences',
    options: [
      { value: 'bw', label: 'Black & white has artistic merit' },
      { value: 'color', label: 'Color brings films to life' },
      { value: 'both', label: 'Appreciate both styles' },
      { value: 'story_first', label: "Color doesn't matter if story is good" }
    ]
  },
  {
    id: 'q17',
    question: 'Do you prefer character-driven or plot-driven stories?',
    category: 'storytelling',
    options: [
      { value: 'character', label: 'Character-driven - Deep character development' },
      { value: 'plot', label: 'Plot-driven - Action and twists' },
      { value: 'balanced', label: 'Perfect balance of both' }
    ]
  },
  {
    id: 'q18',
    question: 'Linear or non-linear storytelling?',
    category: 'storytelling',
    options: [
      { value: 'linear', label: 'Linear - Clear chronological order' },
      { value: 'non_linear', label: 'Non-linear - Love the complexity' },
      { value: 'both', label: 'Enjoy both styles' }
    ]
  },
  {
    id: 'q19',
    question: 'How do you feel about cliffhanger endings?',
    category: 'storytelling',
    options: [
      { value: 'frustrating', label: 'Frustrating - I need closure' },
      { value: 'exciting', label: 'Exciting - Builds anticipation' },
      { value: 'depends', label: 'Depends on the execution' }
    ]
  },
  {
    id: 'q20',
    question: "What's your tolerance for slow-paced films?",
    category: 'pacing',
    options: [
      { value: 'low', label: 'Low - I need constant action' },
      { value: 'medium', label: 'Medium - Some slow scenes are fine' },
      { value: 'high', label: 'High - I appreciate slow burns' },
      { value: 'prefer_slow', label: 'Prefer slow, contemplative cinema' }
    ]
  },
  {
    id: 'q21',
    question: 'How do you feel about gore and graphic violence?',
    category: 'content',
    options: [
      { value: 'avoid', label: 'Avoid it completely' },
      { value: 'minimal', label: 'Can handle minimal amounts' },
      { value: 'fine', label: 'Fine with it in context' },
      { value: 'love', label: 'Love intense horror/action' }
    ]
  },
  {
    id: 'q22',
    question: 'Jump scares in horror movies?',
    category: 'content',
    options: [
      { value: 'hate', label: 'Hate them - Cheap tricks' },
      { value: 'fun', label: 'Fun when done right' },
      { value: 'love', label: 'Love the adrenaline rush' },
      { value: 'prefer_psychological', label: 'Prefer psychological horror' }
    ]
  },
  {
    id: 'q23',
    question: 'Romance in movies?',
    category: 'content',
    options: [
      { value: 'essential', label: 'Essential - Love romantic subplots' },
      { value: 'nice', label: 'Nice when done well' },
      { value: 'unnecessary', label: 'Often unnecessary' },
      { value: 'skip', label: 'Skip romantic scenes' }
    ]
  },
  {
    id: 'q24',
    question: "What's your stance on crude humor?",
    category: 'content',
    options: [
      { value: 'love', label: 'Love it - The cruder the better' },
      { value: 'enjoy', label: 'Enjoy in moderation' },
      { value: 'prefer_clever', label: 'Prefer clever/witty humor' },
      { value: 'dislike', label: 'Dislike crude humor' }
    ]
  },
  {
    id: 'q25',
    question: 'How important are strong female characters?',
    category: 'representation',
    options: [
      { value: 'very', label: 'Very important - Essential' },
      { value: 'important', label: 'Important consideration' },
      { value: 'nice', label: 'Nice to have' },
      { value: 'not_focus', label: 'Not my main focus' }
    ]
  },
  {
    id: 'q26',
    question: 'What about diverse representation in casting?',
    category: 'representation',
    options: [
      { value: 'crucial', label: 'Crucial - Reflects reality' },
      { value: 'important', label: 'Important factor' },
      { value: 'positive', label: 'Positive but not essential' },
      { value: 'neutral', label: 'Neutral on the topic' }
    ]
  },
  {
    id: 'q27',
    question: 'Independent films or blockbusters?',
    category: 'production',
    options: [
      { value: 'indie', label: 'Indie films - Raw and authentic' },
      { value: 'blockbuster', label: 'Blockbusters - Big budget spectacle' },
      { value: 'both', label: 'Love both equally' }
    ]
  },
  {
    id: 'q28',
    question: 'Film festivals or multiplexes?',
    category: 'viewing_environment',
    options: [
      { value: 'festivals', label: 'Film festivals - Unique experiences' },
      { value: 'multiplex', label: 'Multiplexes - Convenient and comfortable' },
      { value: 'both', label: 'Enjoy both settings' },
      { value: 'home', label: 'Prefer watching at home' }
    ]
  },
  {
    id: 'q29',
    question: 'Theater experience or streaming at home?',
    category: 'viewing_environment',
    options: [
      { value: 'theater_only', label: 'Theater only - Big screen experience' },
      { value: 'prefer_theater', label: 'Prefer theater but flexible' },
      { value: 'prefer_home', label: 'Prefer home comfort' },
      { value: 'home_only', label: 'Home only - Total control' }
    ]
  },
  {
    id: 'q30',
    question: '3D movies: yay or nay?',
    category: 'viewing_environment',
    options: [
      { value: 'love', label: 'Love them - Immersive experience' },
      { value: 'sometimes', label: 'Sometimes worth it' },
      { value: 'unnecessary', label: 'Unnecessary gimmick' },
      { value: 'hate', label: 'Hate them - Headache inducing' }
    ]
  },
  {
    id: 'q31',
    question: 'Do you read reviews before watching?',
    category: 'viewing_habits',
    options: [
      { value: 'always', label: 'Always - Need to know first' },
      { value: 'sometimes', label: 'Sometimes check ratings' },
      { value: 'after', label: 'Only after watching' },
      { value: 'never', label: 'Never - Form my own opinion' }
    ]
  },
  {
    id: 'q32',
    question: "How important are film critics' opinions to you?",
    category: 'viewing_habits',
    options: [
      { value: 'very', label: 'Very important - Trust the experts' },
      { value: 'somewhat', label: 'Somewhat influential' },
      { value: 'not_much', label: 'Not much weight' },
      { value: 'ignore', label: 'Completely ignore them' }
    ]
  },
  {
    id: 'q33',
    question: 'Watching movies in one sitting or multiple sessions?',
    category: 'viewing_habits',
    options: [
      { value: 'one_sitting', label: 'One sitting always - No interruptions' },
      { value: 'prefer_one', label: 'Prefer one sitting but flexible' },
      { value: 'multiple_ok', label: 'Multiple sessions are fine' },
      { value: 'prefer_multiple', label: 'Prefer breaking it up' }
    ]
  },
  {
    id: 'q34',
    question: "What's your phone usage during movies?",
    category: 'viewing_etiquette',
    options: [
      { value: 'off', label: 'Phone completely off' },
      { value: 'silent', label: 'Silent but nearby' },
      { value: 'occasional', label: 'Occasional glances' },
      { value: 'multitask', label: 'Frequently multitasking' }
    ]
  },
  {
    id: 'q35',
    question: 'Eating during movies?',
    category: 'viewing_etiquette',
    options: [
      { value: 'full_meal', label: 'Full meal - Part of the experience' },
      { value: 'snacks', label: 'Snacks only' },
      { value: 'minimal', label: 'Minimal eating' },
      { value: 'no_food', label: 'No food - Too distracting' }
    ]
  },
  {
    id: 'q36',
    question: "Director's cut or theatrical release?",
    category: 'movie_preferences',
    options: [
      { value: 'directors', label: "Director's cut - True vision" },
      { value: 'theatrical', label: 'Theatrical - Tighter editing' },
      { value: 'depends', label: 'Depends on the film' },
      { value: 'no_preference', label: 'No strong preference' }
    ]
  },
  {
    id: 'q37',
    question: 'Extended editions worth it?',
    category: 'movie_preferences',
    options: [
      { value: 'always', label: 'Always - More content is better' },
      { value: 'sometimes', label: 'For favorite films only' },
      { value: 'rarely', label: 'Rarely worth the extra time' },
      { value: 'never', label: 'Never - Original is best' }
    ]
  },
  {
    id: 'q38',
    question: 'Do you watch bonus features and behind-the-scenes?',
    category: 'viewing_habits',
    options: [
      { value: 'always', label: 'Always - Love learning the process' },
      { value: 'favorites', label: 'Only for favorite films' },
      { value: 'rarely', label: 'Rarely interested' },
      { value: 'never', label: 'Never - Just the movie' }
    ]
  },
  {
    id: 'q39',
    question: 'How do you feel about post-credit scenes?',
    category: 'movie_preferences',
    options: [
      { value: 'must_watch', label: 'Must watch - Never leave early' },
      { value: 'usually_stay', label: 'Usually stay for them' },
      { value: 'if_told', label: 'Only if someone tells me' },
      { value: 'skip', label: 'Always skip them' }
    ]
  },
  {
    id: 'q40',
    question: 'Watching the same movie in theaters multiple times?',
    category: 'viewing_habits',
    options: [
      { value: 'often', label: 'Often - If I love it' },
      { value: 'occasionally', label: 'Occasionally for special films' },
      { value: 'rarely', label: 'Rarely - Too expensive' },
      { value: 'never', label: 'Never - Once is enough' }
    ]
  },
  {
    id: 'q41',
    question: "What's your ideal movie night setup?",
    category: 'viewing_environment',
    options: [
      { value: 'home_theater', label: 'Home theater - High-end setup' },
      { value: 'cozy_couch', label: 'Cozy couch with blankets' },
      { value: 'laptop_bed', label: 'Laptop in bed' },
      { value: 'outdoor', label: 'Outdoor/drive-in experience' }
    ]
  },
  {
    id: 'q42',
    question: 'How important is picture quality?',
    category: 'viewing_environment',
    options: [
      { value: '4k_hdr', label: '4K HDR essential' },
      { value: 'hd_min', label: 'HD minimum' },
      { value: 'decent', label: 'Decent quality is fine' },
      { value: 'not_critical', label: 'Not critical - Story matters' }
    ]
  },
  {
    id: 'q43',
    question: 'Sound system or headphones?',
    category: 'viewing_environment',
    options: [
      { value: 'surround', label: 'Surround sound system' },
      { value: 'soundbar', label: 'Soundbar' },
      { value: 'headphones', label: 'Quality headphones' },
      { value: 'tv_speakers', label: 'TV speakers are fine' }
    ]
  },
  {
    id: 'q44',
    question: 'Do you collect physical media (DVDs/Blu-rays)?',
    category: 'collecting',
    options: [
      { value: 'avid', label: 'Avid collector - Love physical media' },
      { value: 'favorites', label: 'Only favorite films' },
      { value: 'used_to', label: 'Used to, now all digital' },
      { value: 'never', label: 'Never - Streaming only' }
    ]
  },
  {
    id: 'q45',
    question: 'Movie memorabilia and posters?',
    category: 'collecting',
    options: [
      { value: 'collector', label: 'Active collector - Display proudly' },
      { value: 'few_pieces', label: 'Have a few favorite pieces' },
      { value: 'not_interested', label: 'Not interested' },
      { value: 'want_to_start', label: 'Want to start collecting' }
    ]
  },
  {
    id: 'q46',
    question: 'How often do you watch movies?',
    category: 'viewing_habits',
    options: [
      { value: 'daily', label: "Daily - It's my lifestyle" },
      { value: 'several_week', label: 'Several times a week' },
      { value: 'weekly', label: 'About once a week' },
      { value: 'occasionally', label: 'Occasionally/monthly' }
    ]
  },
  {
    id: 'q47',
    question: 'Movie marathons?',
    category: 'viewing_habits',
    options: [
      { value: 'love', label: 'Love them - Regular marathons' },
      { value: 'special_occasions', label: 'Special occasions only' },
      { value: 'rarely', label: 'Rarely do marathons' },
      { value: 'never', label: 'Never - One movie at a time' }
    ]
  },
  {
    id: 'q48',
    question: 'Do you discuss movies after watching?',
    category: 'social_viewing',
    options: [
      { value: 'must', label: 'Must discuss immediately' },
      { value: 'enjoy', label: 'Enjoy discussion if available' },
      { value: 'sometimes', label: 'Sometimes, not always' },
      { value: 'prefer_reflect', label: 'Prefer silent reflection' }
    ]
  },
  {
    id: 'q49',
    question: "What's your approach to movie trivia and easter eggs?",
    category: 'engagement',
    options: [
      { value: 'hunt', label: 'Actively hunt for them' },
      { value: 'enjoy_finding', label: 'Enjoy finding them naturally' },
      { value: 'learn_after', label: 'Learn about them after' },
      { value: 'not_interested', label: 'Not interested' }
    ]
  },
  {
    id: 'q50',
    question: 'Would you rather discover a new favorite or rewatch a classic?',
    category: 'viewing_habits',
    options: [
      { value: 'new', label: 'Discover new favorites - Always exploring' },
      { value: 'prefer_new', label: 'Prefer new but rewatch sometimes' },
      { value: 'balanced', label: 'Balanced mix of both' },
      { value: 'rewatches', label: 'Rewatches - Comfort in familiarity' }
    ]
  }
];

// Initialize and render quiz
function initializeQuiz() {
  const container = document.getElementById('quiz-questions-container');
  if (!container) return;

  container.innerHTML = '';
  
  QUIZ_QUESTIONS.forEach((question, index) => {
    const questionDiv = document.createElement('div');
    questionDiv.className = 'form-group quiz-question';
    questionDiv.innerHTML = `
      <label><strong>Question ${index + 1} of 50:</strong> ${question.question}</label>
      <select name="${question.id}" data-question-id="${question.id}" required>
        <option value="">Select your answer...</option>
        ${question.options.map(opt => 
          `<option value="${opt.value}">${opt.label}</option>`
        ).join('')}
      </select>
    `;
    container.appendChild(questionDiv);
  });

  // Add event listeners to track progress
  setupQuizTracking();
}

// Track quiz progress
function setupQuizTracking() {
  const form = document.getElementById('compatibility-quiz-form');
  if (!form) return;

  const selects = form.querySelectorAll('select[data-question-id]');
  const progressBar = document.getElementById('quiz-progress-bar');
  const progressText = document.getElementById('quiz-progress-text');
  const submitBtn = document.getElementById('submit-quiz-btn');

  function updateProgress() {
    let answered = 0;
    selects.forEach(select => {
      if (select.value) answered++;
    });

    const percentage = (answered / 50) * 100;
    if (progressBar) progressBar.style.width = `${percentage}%`;
    if (progressText) progressText.textContent = `${answered} of 50 questions answered`;
    
    // Enable submit button when all questions are answered
    if (submitBtn) {
      submitBtn.disabled = answered < 50;
      if (answered === 50) {
        submitBtn.textContent = '✓ Complete Quiz & Find Matches!';
      } else {
        submitBtn.textContent = `Complete Quiz (${50 - answered} remaining)`;
      }
    }
  }

  selects.forEach(select => {
    select.addEventListener('change', updateProgress);
  });

  updateProgress();
}

// Get quiz responses
function getQuizResponses() {
  const form = document.getElementById('compatibility-quiz-form');
  if (!form) return {};

  const responses = {};
  const formData = new FormData(form);
  
  for (const [key, value] of formData.entries()) {
    if (key.startsWith('q') && value) {
      responses[key] = value;
    }
  }

  return responses;
}

// Validate quiz completion
function isQuizComplete() {
  const responses = getQuizResponses();
  return Object.keys(responses).length === 50;
}

// Export for use in other files
if (typeof window !== 'undefined') {
  window.QuizModule = {
    initializeQuiz,
    getQuizResponses,
    isQuizComplete,
    QUIZ_QUESTIONS
  };
}
