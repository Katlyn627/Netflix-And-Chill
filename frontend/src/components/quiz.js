/**
 * Quiz Component - 50 Question Movie Compatibility Quiz
 * Helps improve user matches based on viewing preferences and habits
 */

// Quiz questions (all 50 from the backend quiz)
const QUIZ_QUESTIONS = [
  {
    "id": "q1",
    "question": "Do you prefer subtitles or dubbing for foreign films?",
    "category": "viewing_style",
    "options": [
      {
        "value": "subtitles",
        "label": "Subtitles - I want the original audio",
        "points": 1
      },
      {
        "value": "dubbing",
        "label": "Dubbing - Easier to follow",
        "points": 2
      },
      {
        "value": "no_preference",
        "label": "No preference",
        "points": 3
      }
    ]
  },
  {
    "id": "q2",
    "question": "What's your ideal movie length?",
    "category": "viewing_style",
    "options": [
      {
        "value": "under_90",
        "label": "Under 90 minutes - Quick and concise",
        "points": 1
      },
      {
        "value": "90_120",
        "label": "90-120 minutes - Just right",
        "points": 2
      },
      {
        "value": "over_120",
        "label": "Over 2 hours - The longer the better!",
        "points": 3
      }
    ]
  },
  {
    "id": "q3",
    "question": "How do you feel about movie spoilers?",
    "category": "viewing_style",
    "options": [
      {
        "value": "hate",
        "label": "Absolutely hate them - No spoilers!",
        "points": 1
      },
      {
        "value": "dont_mind",
        "label": "Don't mind them",
        "points": 2
      },
      {
        "value": "like",
        "label": "Actually prefer knowing what happens",
        "points": 3
      }
    ]
  },
  {
    "id": "q4",
    "question": "What's your preferred movie-watching time?",
    "category": "viewing_habits",
    "options": [
      {
        "value": "morning",
        "label": "Morning person - Early bird gets the film",
        "points": 1
      },
      {
        "value": "afternoon",
        "label": "Afternoon - Perfect matinee time",
        "points": 2
      },
      {
        "value": "evening",
        "label": "Evening - Prime time viewer",
        "points": 3
      },
      {
        "value": "late_night",
        "label": "Late night owl - Midnight screenings",
        "points": 4
      }
    ]
  },
  {
    "id": "q5",
    "question": "When watching with someone, do you prefer to:",
    "category": "social_viewing",
    "options": [
      {
        "value": "silent",
        "label": "Watch in complete silence",
        "points": 1
      },
      {
        "value": "occasional_comments",
        "label": "Make occasional comments",
        "points": 2
      },
      {
        "value": "full_discussion",
        "label": "Have a full running commentary",
        "points": 3
      }
    ]
  },
  {
    "id": "q6",
    "question": "How do you choose what to watch?",
    "category": "viewing_habits",
    "options": [
      {
        "value": "plan_ahead",
        "label": "Plan ahead - Know exactly what to watch",
        "points": 1
      },
      {
        "value": "browse",
        "label": "Browse until something clicks",
        "points": 2
      },
      {
        "value": "rewatch",
        "label": "Rewatch favorites",
        "points": 3
      },
      {
        "value": "recommendations",
        "label": "Follow recommendations",
        "points": 4
      }
    ]
  },
  {
    "id": "q7",
    "question": "How many times can you rewatch your favorite movie?",
    "category": "viewing_habits",
    "options": [
      {
        "value": "once",
        "label": "Once is enough",
        "points": 1
      },
      {
        "value": "few_times",
        "label": "2-3 times",
        "points": 2
      },
      {
        "value": "many_times",
        "label": "5-10 times",
        "points": 3
      },
      {
        "value": "infinite",
        "label": "Infinite rewatches!",
        "points": 4
      }
    ]
  },
  {
    "id": "q8",
    "question": "What type of ending do you prefer?",
    "category": "movie_preferences",
    "options": [
      {
        "value": "happy",
        "label": "Happy ending - All tied up nicely",
        "points": 1
      },
      {
        "value": "bittersweet",
        "label": "Bittersweet - Emotionally complex",
        "points": 2
      },
      {
        "value": "open",
        "label": "Open ending - Love the mystery",
        "points": 3
      },
      {
        "value": "twist",
        "label": "Plot twist - Mind-bending",
        "points": 4
      }
    ]
  },
  {
    "id": "q9",
    "question": "Marvel or DC?",
    "category": "franchises",
    "options": [
      {
        "value": "marvel",
        "label": "Marvel all the way",
        "points": 1
      },
      {
        "value": "dc",
        "label": "DC forever",
        "points": 2
      },
      {
        "value": "both",
        "label": "Love both equally",
        "points": 3
      },
      {
        "value": "neither",
        "label": "Not into superhero movies",
        "points": 4
      }
    ]
  },
  {
    "id": "q10",
    "question": "Star Wars or Star Trek?",
    "category": "franchises",
    "options": [
      {
        "value": "star_wars",
        "label": "Star Wars - The Force is strong",
        "points": 1
      },
      {
        "value": "star_trek",
        "label": "Star Trek - Live long and prosper",
        "points": 2
      },
      {
        "value": "both",
        "label": "Both are amazing",
        "points": 3
      },
      {
        "value": "neither",
        "label": "Neither appeals to me",
        "points": 4
      }
    ]
  },
  {
    "id": "q11",
    "question": "What do you think about book-to-movie adaptations?",
    "category": "movie_preferences",
    "options": [
      {
        "value": "book_better",
        "label": "Book is always better",
        "points": 1
      },
      {
        "value": "movie_better",
        "label": "Movies can improve on books",
        "points": 2
      },
      {
        "value": "different",
        "label": "They're different experiences",
        "points": 3
      },
      {
        "value": "no_opinion",
        "label": "No strong opinion",
        "points": 4
      }
    ]
  },
  {
    "id": "q12",
    "question": "How do you feel about remakes and reboots?",
    "category": "movie_preferences",
    "options": [
      {
        "value": "hate",
        "label": "Hate them - Leave classics alone",
        "points": 1
      },
      {
        "value": "cautious",
        "label": "Cautiously optimistic",
        "points": 2
      },
      {
        "value": "love",
        "label": "Love fresh takes on classics",
        "points": 3
      },
      {
        "value": "case_by_case",
        "label": "Depends on the execution",
        "points": 4
      }
    ]
  },
  {
    "id": "q13",
    "question": "What era of cinema do you prefer?",
    "category": "movie_preferences",
    "options": [
      {
        "value": "classic",
        "label": "Classic Hollywood (pre-1960s)",
        "points": 1
      },
      {
        "value": "70s_80s",
        "label": "70s-80s Golden age",
        "points": 2
      },
      {
        "value": "90s_00s",
        "label": "90s-2000s",
        "points": 3
      },
      {
        "value": "modern",
        "label": "Modern cinema (2010+)",
        "points": 4
      }
    ]
  },
  {
    "id": "q14",
    "question": "CGI or practical effects?",
    "category": "movie_preferences",
    "options": [
      {
        "value": "practical",
        "label": "Practical effects - Real is better",
        "points": 1
      },
      {
        "value": "cgi",
        "label": "CGI - Love the possibilities",
        "points": 2
      },
      {
        "value": "blend",
        "label": "Best of both worlds",
        "points": 3
      },
      {
        "value": "story_matters",
        "label": "Story matters more than effects",
        "points": 4
      }
    ]
  },
  {
    "id": "q15",
    "question": "How important is the soundtrack to you?",
    "category": "movie_preferences",
    "options": [
      {
        "value": "essential",
        "label": "Essential - Can make or break a film",
        "points": 1
      },
      {
        "value": "important",
        "label": "Important but not critical",
        "points": 2
      },
      {
        "value": "nice_bonus",
        "label": "Nice bonus",
        "points": 3
      },
      {
        "value": "barely_notice",
        "label": "Barely notice it",
        "points": 4
      }
    ]
  },
  {
    "id": "q16",
    "question": "Black and white or color films?",
    "category": "movie_preferences",
    "options": [
      {
        "value": "bw",
        "label": "Black & white has artistic merit",
        "points": 1
      },
      {
        "value": "color",
        "label": "Color brings films to life",
        "points": 2
      },
      {
        "value": "both",
        "label": "Appreciate both styles",
        "points": 3
      },
      {
        "value": "story_first",
        "label": "Color doesn't matter if story is good",
        "points": 4
      }
    ]
  },
  {
    "id": "q17",
    "question": "Do you prefer character-driven or plot-driven stories?",
    "category": "storytelling",
    "options": [
      {
        "value": "character",
        "label": "Character-driven - Deep character development",
        "points": 1
      },
      {
        "value": "plot",
        "label": "Plot-driven - Action and twists",
        "points": 2
      },
      {
        "value": "balanced",
        "label": "Perfect balance of both",
        "points": 3
      }
    ]
  },
  {
    "id": "q18",
    "question": "Linear or non-linear storytelling?",
    "category": "storytelling",
    "options": [
      {
        "value": "linear",
        "label": "Linear - Clear chronological order",
        "points": 1
      },
      {
        "value": "non_linear",
        "label": "Non-linear - Love the complexity",
        "points": 2
      },
      {
        "value": "both",
        "label": "Enjoy both styles",
        "points": 3
      }
    ]
  },
  {
    "id": "q19",
    "question": "How do you feel about cliffhanger endings?",
    "category": "storytelling",
    "options": [
      {
        "value": "frustrating",
        "label": "Frustrating - I need closure",
        "points": 1
      },
      {
        "value": "exciting",
        "label": "Exciting - Builds anticipation",
        "points": 2
      },
      {
        "value": "depends",
        "label": "Depends on the execution",
        "points": 3
      }
    ]
  },
  {
    "id": "q20",
    "question": "What's your tolerance for slow-paced films?",
    "category": "pacing",
    "options": [
      {
        "value": "low",
        "label": "Low - I need constant action",
        "points": 1
      },
      {
        "value": "medium",
        "label": "Medium - Some slow scenes are fine",
        "points": 2
      },
      {
        "value": "high",
        "label": "High - I appreciate slow burns",
        "points": 3
      },
      {
        "value": "prefer_slow",
        "label": "Prefer slow, contemplative cinema",
        "points": 4
      }
    ]
  },
  {
    "id": "q21",
    "question": "How do you feel about gore and graphic violence?",
    "category": "content",
    "options": [
      {
        "value": "avoid",
        "label": "Avoid it completely",
        "points": 1
      },
      {
        "value": "minimal",
        "label": "Can handle minimal amounts",
        "points": 2
      },
      {
        "value": "fine",
        "label": "Fine with it in context",
        "points": 3
      },
      {
        "value": "love",
        "label": "Love intense horror/action",
        "points": 4
      }
    ]
  },
  {
    "id": "q22",
    "question": "Jump scares in horror movies?",
    "category": "content",
    "options": [
      {
        "value": "hate",
        "label": "Hate them - Cheap tricks",
        "points": 1
      },
      {
        "value": "fun",
        "label": "Fun when done right",
        "points": 2
      },
      {
        "value": "love",
        "label": "Love the adrenaline rush",
        "points": 3
      },
      {
        "value": "prefer_psychological",
        "label": "Prefer psychological horror",
        "points": 4
      }
    ]
  },
  {
    "id": "q23",
    "question": "Romance in movies?",
    "category": "content",
    "options": [
      {
        "value": "essential",
        "label": "Essential - Love romantic subplots",
        "points": 1
      },
      {
        "value": "nice",
        "label": "Nice when done well",
        "points": 2
      },
      {
        "value": "unnecessary",
        "label": "Often unnecessary",
        "points": 3
      },
      {
        "value": "skip",
        "label": "Skip romantic scenes",
        "points": 4
      }
    ]
  },
  {
    "id": "q24",
    "question": "What's your stance on crude humor?",
    "category": "content",
    "options": [
      {
        "value": "love",
        "label": "Love it - The cruder the better",
        "points": 1
      },
      {
        "value": "enjoy",
        "label": "Enjoy in moderation",
        "points": 2
      },
      {
        "value": "prefer_clever",
        "label": "Prefer clever/witty humor",
        "points": 3
      },
      {
        "value": "dislike",
        "label": "Dislike crude humor",
        "points": 4
      }
    ]
  },
  {
    "id": "q25",
    "question": "How important are strong female characters?",
    "category": "representation",
    "options": [
      {
        "value": "very",
        "label": "Very important - Essential",
        "points": 1
      },
      {
        "value": "important",
        "label": "Important consideration",
        "points": 2
      },
      {
        "value": "nice",
        "label": "Nice to have",
        "points": 3
      },
      {
        "value": "not_focus",
        "label": "Not my main focus",
        "points": 4
      }
    ]
  },
  {
    "id": "q26",
    "question": "What about diverse representation in casting?",
    "category": "representation",
    "options": [
      {
        "value": "crucial",
        "label": "Crucial - Reflects reality",
        "points": 1
      },
      {
        "value": "important",
        "label": "Important factor",
        "points": 2
      },
      {
        "value": "positive",
        "label": "Positive but not essential",
        "points": 3
      },
      {
        "value": "neutral",
        "label": "Neutral on the topic",
        "points": 4
      }
    ]
  },
  {
    "id": "q27",
    "question": "Independent films or blockbusters?",
    "category": "production",
    "options": [
      {
        "value": "indie",
        "label": "Indie films - Raw and authentic",
        "points": 1
      },
      {
        "value": "blockbuster",
        "label": "Blockbusters - Big budget spectacle",
        "points": 2
      },
      {
        "value": "both",
        "label": "Love both equally",
        "points": 3
      }
    ]
  },
  {
    "id": "q28",
    "question": "Film festivals or multiplexes?",
    "category": "viewing_environment",
    "options": [
      {
        "value": "festivals",
        "label": "Film festivals - Unique experiences",
        "points": 1
      },
      {
        "value": "multiplex",
        "label": "Multiplexes - Convenient and comfortable",
        "points": 2
      },
      {
        "value": "both",
        "label": "Enjoy both settings",
        "points": 3
      },
      {
        "value": "home",
        "label": "Prefer watching at home",
        "points": 4
      }
    ]
  },
  {
    "id": "q29",
    "question": "Theater experience or streaming at home?",
    "category": "viewing_environment",
    "options": [
      {
        "value": "theater_only",
        "label": "Theater only - Big screen experience",
        "points": 1
      },
      {
        "value": "prefer_theater",
        "label": "Prefer theater but flexible",
        "points": 2
      },
      {
        "value": "prefer_home",
        "label": "Prefer home comfort",
        "points": 3
      },
      {
        "value": "home_only",
        "label": "Home only - Total control",
        "points": 4
      }
    ]
  },
  {
    "id": "q30",
    "question": "3D movies: yay or nay?",
    "category": "viewing_environment",
    "options": [
      {
        "value": "love",
        "label": "Love them - Immersive experience",
        "points": 1
      },
      {
        "value": "sometimes",
        "label": "Sometimes worth it",
        "points": 2
      },
      {
        "value": "unnecessary",
        "label": "Unnecessary gimmick",
        "points": 3
      },
      {
        "value": "hate",
        "label": "Hate them - Headache inducing",
        "points": 4
      }
    ]
  },
  {
    "id": "q31",
    "question": "Do you read reviews before watching?",
    "category": "viewing_habits",
    "options": [
      {
        "value": "always",
        "label": "Always - Need to know first",
        "points": 1
      },
      {
        "value": "sometimes",
        "label": "Sometimes check ratings",
        "points": 2
      },
      {
        "value": "after",
        "label": "Only after watching",
        "points": 3
      },
      {
        "value": "never",
        "label": "Never - Form my own opinion",
        "points": 4
      }
    ]
  },
  {
    "id": "q32",
    "question": "How important are film critics' opinions to you?",
    "category": "viewing_habits",
    "options": [
      {
        "value": "very",
        "label": "Very important - Trust the experts",
        "points": 1
      },
      {
        "value": "somewhat",
        "label": "Somewhat influential",
        "points": 2
      },
      {
        "value": "not_much",
        "label": "Not much weight",
        "points": 3
      },
      {
        "value": "ignore",
        "label": "Completely ignore them",
        "points": 4
      }
    ]
  },
  {
    "id": "q33",
    "question": "Watching movies in one sitting or multiple sessions?",
    "category": "viewing_habits",
    "options": [
      {
        "value": "one_sitting",
        "label": "One sitting always - No interruptions",
        "points": 1
      },
      {
        "value": "prefer_one",
        "label": "Prefer one sitting but flexible",
        "points": 2
      },
      {
        "value": "multiple_ok",
        "label": "Multiple sessions are fine",
        "points": 3
      },
      {
        "value": "prefer_multiple",
        "label": "Prefer breaking it up",
        "points": 4
      }
    ]
  },
  {
    "id": "q34",
    "question": "What's your phone usage during movies?",
    "category": "viewing_etiquette",
    "options": [
      {
        "value": "off",
        "label": "Phone completely off",
        "points": 1
      },
      {
        "value": "silent",
        "label": "Silent but nearby",
        "points": 2
      },
      {
        "value": "occasional",
        "label": "Occasional glances",
        "points": 3
      },
      {
        "value": "multitask",
        "label": "Frequently multitasking",
        "points": 4
      }
    ]
  },
  {
    "id": "q35",
    "question": "Eating during movies?",
    "category": "viewing_etiquette",
    "options": [
      {
        "value": "full_meal",
        "label": "Full meal - Part of the experience",
        "points": 1
      },
      {
        "value": "snacks",
        "label": "Snacks only",
        "points": 2
      },
      {
        "value": "minimal",
        "label": "Minimal eating",
        "points": 3
      },
      {
        "value": "no_food",
        "label": "No food - Too distracting",
        "points": 4
      }
    ]
  },
  {
    "id": "q36",
    "question": "Director's cut or theatrical release?",
    "category": "movie_preferences",
    "options": [
      {
        "value": "directors",
        "label": "Director's cut - True vision",
        "points": 1
      },
      {
        "value": "theatrical",
        "label": "Theatrical - Tighter editing",
        "points": 2
      },
      {
        "value": "depends",
        "label": "Depends on the film",
        "points": 3
      },
      {
        "value": "no_preference",
        "label": "No strong preference",
        "points": 4
      }
    ]
  },
  {
    "id": "q37",
    "question": "Extended editions worth it?",
    "category": "movie_preferences",
    "options": [
      {
        "value": "always",
        "label": "Always - More content is better",
        "points": 1
      },
      {
        "value": "sometimes",
        "label": "For favorite films only",
        "points": 2
      },
      {
        "value": "rarely",
        "label": "Rarely worth the extra time",
        "points": 3
      },
      {
        "value": "never",
        "label": "Never - Original is best",
        "points": 4
      }
    ]
  },
  {
    "id": "q38",
    "question": "Do you watch bonus features and behind-the-scenes?",
    "category": "viewing_habits",
    "options": [
      {
        "value": "always",
        "label": "Always - Love learning the process",
        "points": 1
      },
      {
        "value": "favorites",
        "label": "Only for favorite films",
        "points": 2
      },
      {
        "value": "rarely",
        "label": "Rarely interested",
        "points": 3
      },
      {
        "value": "never",
        "label": "Never - Just the movie",
        "points": 4
      }
    ]
  },
  {
    "id": "q39",
    "question": "How do you feel about post-credit scenes?",
    "category": "movie_preferences",
    "options": [
      {
        "value": "must_watch",
        "label": "Must watch - Never leave early",
        "points": 1
      },
      {
        "value": "usually_stay",
        "label": "Usually stay for them",
        "points": 2
      },
      {
        "value": "if_told",
        "label": "Only if someone tells me",
        "points": 3
      },
      {
        "value": "skip",
        "label": "Always skip them",
        "points": 4
      }
    ]
  },
  {
    "id": "q40",
    "question": "Watching the same movie in theaters multiple times?",
    "category": "viewing_habits",
    "options": [
      {
        "value": "often",
        "label": "Often - If I love it",
        "points": 1
      },
      {
        "value": "occasionally",
        "label": "Occasionally for special films",
        "points": 2
      },
      {
        "value": "rarely",
        "label": "Rarely - Too expensive",
        "points": 3
      },
      {
        "value": "never",
        "label": "Never - Once is enough",
        "points": 4
      }
    ]
  },
  {
    "id": "q41",
    "question": "What's your ideal movie night setup?",
    "category": "viewing_environment",
    "options": [
      {
        "value": "home_theater",
        "label": "Home theater - High-end setup",
        "points": 1
      },
      {
        "value": "cozy_couch",
        "label": "Cozy couch with blankets",
        "points": 2
      },
      {
        "value": "laptop_bed",
        "label": "Laptop in bed",
        "points": 3
      },
      {
        "value": "outdoor",
        "label": "Outdoor/drive-in experience",
        "points": 4
      }
    ]
  },
  {
    "id": "q42",
    "question": "How important is picture quality?",
    "category": "viewing_environment",
    "options": [
      {
        "value": "4k_hdr",
        "label": "4K HDR essential",
        "points": 1
      },
      {
        "value": "hd_min",
        "label": "HD minimum",
        "points": 2
      },
      {
        "value": "decent",
        "label": "Decent quality is fine",
        "points": 3
      },
      {
        "value": "not_critical",
        "label": "Not critical - Story matters",
        "points": 4
      }
    ]
  },
  {
    "id": "q43",
    "question": "Sound system or headphones?",
    "category": "viewing_environment",
    "options": [
      {
        "value": "surround",
        "label": "Surround sound system",
        "points": 1
      },
      {
        "value": "soundbar",
        "label": "Soundbar",
        "points": 2
      },
      {
        "value": "headphones",
        "label": "Quality headphones",
        "points": 3
      },
      {
        "value": "tv_speakers",
        "label": "TV speakers are fine",
        "points": 4
      }
    ]
  },
  {
    "id": "q44",
    "question": "Do you collect physical media (DVDs/Blu-rays)?",
    "category": "collecting",
    "options": [
      {
        "value": "avid",
        "label": "Avid collector - Love physical media",
        "points": 1
      },
      {
        "value": "favorites",
        "label": "Only favorite films",
        "points": 2
      },
      {
        "value": "used_to",
        "label": "Used to, now all digital",
        "points": 3
      },
      {
        "value": "never",
        "label": "Never - Streaming only",
        "points": 4
      }
    ]
  },
  {
    "id": "q45",
    "question": "Movie memorabilia and posters?",
    "category": "collecting",
    "options": [
      {
        "value": "collector",
        "label": "Active collector - Display proudly",
        "points": 1
      },
      {
        "value": "few_pieces",
        "label": "Have a few favorite pieces",
        "points": 2
      },
      {
        "value": "not_interested",
        "label": "Not interested",
        "points": 3
      },
      {
        "value": "want_to_start",
        "label": "Want to start collecting",
        "points": 4
      }
    ]
  },
  {
    "id": "q46",
    "question": "How often do you watch movies?",
    "category": "viewing_habits",
    "options": [
      {
        "value": "daily",
        "label": "Daily - It's my lifestyle",
        "points": 1
      },
      {
        "value": "several_week",
        "label": "Several times a week",
        "points": 2
      },
      {
        "value": "weekly",
        "label": "About once a week",
        "points": 3
      },
      {
        "value": "occasionally",
        "label": "Occasionally/monthly",
        "points": 4
      }
    ]
  },
  {
    "id": "q47",
    "question": "Movie marathons?",
    "category": "viewing_habits",
    "options": [
      {
        "value": "love",
        "label": "Love them - Regular marathons",
        "points": 1
      },
      {
        "value": "special_occasions",
        "label": "Special occasions only",
        "points": 2
      },
      {
        "value": "rarely",
        "label": "Rarely do marathons",
        "points": 3
      },
      {
        "value": "never",
        "label": "Never - One movie at a time",
        "points": 4
      }
    ]
  },
  {
    "id": "q48",
    "question": "Do you discuss movies after watching?",
    "category": "social_viewing",
    "options": [
      {
        "value": "must",
        "label": "Must discuss immediately",
        "points": 1
      },
      {
        "value": "enjoy",
        "label": "Enjoy discussion if available",
        "points": 2
      },
      {
        "value": "sometimes",
        "label": "Sometimes, not always",
        "points": 3
      },
      {
        "value": "prefer_reflect",
        "label": "Prefer silent reflection",
        "points": 4
      }
    ]
  },
  {
    "id": "q49",
    "question": "What's your approach to movie trivia and easter eggs?",
    "category": "engagement",
    "options": [
      {
        "value": "hunt",
        "label": "Actively hunt for them",
        "points": 1
      },
      {
        "value": "enjoy_finding",
        "label": "Enjoy finding them naturally",
        "points": 2
      },
      {
        "value": "learn_after",
        "label": "Learn about them after",
        "points": 3
      },
      {
        "value": "not_interested",
        "label": "Not interested",
        "points": 4
      }
    ]
  },
  {
    "id": "q50",
    "question": "Would you rather discover a new favorite or rewatch a classic?",
    "category": "viewing_habits",
    "options": [
      {
        "value": "new",
        "label": "Discover new favorites - Always exploring",
        "points": 1
      },
      {
        "value": "prefer_new",
        "label": "Prefer new but rewatch sometimes",
        "points": 2
      },
      {
        "value": "balanced",
        "label": "Balanced mix of both",
        "points": 3
      },
      {
        "value": "rewatches",
        "label": "Rewatches - Comfort in familiarity",
        "points": 4
      }
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
