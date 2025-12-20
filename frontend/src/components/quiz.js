/**
 * Quiz Component - 20 Question Movie Compatibility Quiz
 * Helps improve user matches based on viewing preferences and habits
 */

// Quiz questions (first 20 from the backend quiz)
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
  }
];

// Export for use in profile-view.js
if (typeof window !== 'undefined') {
  window.QUIZ_QUESTIONS = QUIZ_QUESTIONS;
}

// Export for CommonJS (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { QUIZ_QUESTIONS };
}
