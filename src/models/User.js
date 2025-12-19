import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    // Basic Identity
    displayName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "banned", "suspended"],
      default: "active",
    },

    // Detailed Identity Information
    identity: {
      birthdate: {
        type: Date,
        required: true,
      },
      gender: {
        type: String,
        enum: ["male", "female", "non-binary", "genderfluid", "agender", "other", "prefer-not-to-say"],
        required: true,
      },
      pronouns: {
        type: String,
        enum: ["he/him", "she/her", "they/them", "he/they", "she/they", "other"],
      },
      sexualOrientation: {
        type: String,
        enum: ["straight", "gay", "lesbian", "bisexual", "pansexual", "asexual", "queer", "questioning", "other"],
      },
      ethnicity: [String],
      languages: [String],
    },

    // Profile Content
    bio: {
      type: String,
      maxlength: 500,
    },
    photos: [
      {
        url: String,
        order: Number,
        isPrimary: Boolean,
        uploadedAt: Date,
      },
    ],

    // Location and Geo
    location: {
      city: String,
      state: String,
      country: String,
      geo: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          index: "2dsphere",
        },
      },
    },

    // Dating Preferences
    datingPrefs: {
      relationshipIntent: {
        type: String,
        enum: ["casual", "serious", "friendship", "unsure"],
      },
      ageRange: {
        min: { type: Number, default: 18, min: 18 },
        max: { type: Number, default: 99, max: 120 },
      },
      distanceMiles: {
        type: Number,
        default: 25,
        min: 1,
        max: 500,
      },
      genderPreferences: [String],
      dealbreakers: [String],
    },

    // Movie & Entertainment Taste - Enhanced with Detailed Classifiers
    movieTaste: {
      // Favorite genres with detailed classification
      favoriteGenres: [
        {
          type: String,
          enum: [
            // Primary Genres
            "action",
            "adventure",
            "animation",
            "comedy",
            "crime",
            "documentary",
            "drama",
            "family",
            "fantasy",
            "history",
            "horror",
            "music",
            "mystery",
            "romance",
            "science-fiction",
            "thriller",
            "war",
            "western",
            // Sub-genres and hybrid genres
            "psychological-thriller",
            "romantic-comedy",
            "action-comedy",
            "sci-fi-horror",
            "dark-comedy",
            "superhero",
            "noir",
            "slasher",
            "supernatural",
            "martial-arts",
            "spy",
            "heist",
            "disaster",
            "epic",
            "satire",
            "mockumentary",
            "found-footage",
            "anthology",
          ],
        },
      ],

      // Dealbreaker genres (genres they absolutely dislike)
      dealbreakerGenres: [String],

      // Mood preferences
      moodPreferences: [
        {
          type: String,
          enum: [
            "uplifting",
            "intense",
            "thought-provoking",
            "lighthearted",
            "dark",
            "suspenseful",
            "emotional",
            "inspirational",
            "escapist",
            "educational",
            "nostalgic",
            "avant-garde",
          ],
        },
      ],

      // Content rating preferences
      contentRatings: [
        {
          type: String,
          enum: ["G", "PG", "PG-13", "R", "NC-17", "TV-Y", "TV-Y7", "TV-G", "TV-PG", "TV-14", "TV-MA"],
        },
      ],

      // Viewing style preferences
      viewingStyle: {
        bingeWatcher: {
          type: Boolean,
          default: false,
        },
        averageEpisodesPerSitting: {
          type: Number,
          min: 1,
          max: 20,
        },
        preferredWatchTime: {
          type: String,
          enum: ["morning", "afternoon", "evening", "night", "late-night", "anytime"],
        },
        subtitlesPreference: {
          type: String,
          enum: ["always", "sometimes", "never", "foreign-only"],
        },
        dubbingPreference: {
          type: String,
          enum: ["prefer-original", "prefer-dubbed", "no-preference"],
        },
      },

      // Favorite directors, actors, and creators
      favoriteDirectors: [String],
      favoriteActors: [String],
      favoriteWriters: [String],

      // Decade preferences
      decadePreferences: [
        {
          type: String,
          enum: [
            "1920s-1930s",
            "1940s-1950s",
            "1960s-1970s",
            "1980s",
            "1990s",
            "2000s",
            "2010s",
            "2020s",
            "classic",
            "contemporary",
          ],
        },
      ],

      // International cinema preferences
      internationalCinema: {
        interestedIn: Boolean,
        preferredRegions: [
          {
            type: String,
            enum: [
              "bollywood",
              "korean",
              "japanese-anime",
              "japanese-live-action",
              "french",
              "italian",
              "spanish",
              "latin-american",
              "british",
              "nordic",
              "middle-eastern",
              "african",
              "chinese",
              "thai",
            ],
          },
        ],
      },

      // Format preferences
      formatPreferences: {
        movies: Boolean,
        tvSeries: Boolean,
        miniseries: Boolean,
        documentarySeries: Boolean,
        realityTV: Boolean,
        standupComedy: Boolean,
        talkShows: Boolean,
      },

      // Length preferences for content
      lengthPreferences: {
        movieLength: {
          type: String,
          enum: ["short-under-90", "standard-90-120", "long-over-120", "any"],
        },
        seriesLength: {
          type: String,
          enum: ["short-1-season", "medium-2-5-seasons", "long-over-5-seasons", "any"],
        },
      },

      // Thematic interests
      thematicInterests: [
        {
          type: String,
          enum: [
            "coming-of-age",
            "redemption",
            "revenge",
            "survival",
            "social-commentary",
            "politics",
            "justice",
            "love-and-relationships",
            "family-dynamics",
            "mental-health",
            "identity",
            "technology",
            "environment",
            "historical-events",
            "biographies",
            "true-crime",
            "conspiracy",
            "supernatural-mysticism",
            "philosophy",
            "existentialism",
          ],
        },
      ],

      // Pacing preferences
      pacingPreference: {
        type: String,
        enum: ["fast-paced", "moderate", "slow-burn", "varied", "no-preference"],
      },

      // Ending preferences
      endingPreference: {
        type: String,
        enum: ["happy-endings", "bittersweet", "tragic", "open-ended", "no-preference"],
      },

      // Comfort rewatches - movies/shows they rewatch
      comfortRewatches: [
        {
          tmdbId: Number,
          title: String,
          type: { type: String, enum: ["movie", "tv"] },
        },
      ],

      // Watched and rated content
      watchedContent: [
        {
          tmdbId: Number,
          title: String,
          type: { type: String, enum: ["movie", "tv"] },
          rating: { type: Number, min: 1, max: 10 },
          watchedAt: Date,
        },
      ],
    },

    // Streaming Service Subscriptions
    streamingServices: [
      {
        name: {
          type: String,
          enum: [
            "netflix",
            "hulu",
            "disney-plus",
            "hbo-max",
            "amazon-prime",
            "apple-tv-plus",
            "paramount-plus",
            "peacock",
            "showtime",
            "starz",
            "amc-plus",
            "discovery-plus",
            "espn-plus",
            "criterion-channel",
            "mubi",
            "shudder",
            "crunchyroll",
            "youtube-premium",
            "other",
          ],
        },
        active: Boolean,
      },
    ],

    // Social and Interaction Preferences
    socialPrefs: {
      commentaryStyle: {
        type: String,
        enum: ["talkative", "occasional-comments", "silent-watcher", "depends-on-mood"],
      },
      watchingPreference: {
        type: String,
        enum: ["together-in-person", "virtual-watch-party", "both", "no-preference"],
      },
      discussionLevel: {
        type: String,
        enum: ["deep-analysis", "casual-chat", "minimal", "no-spoilers-please"],
      },
      spoilerTolerance: {
        type: String,
        enum: ["spoilers-ok", "minor-spoilers-ok", "no-spoilers", "depends"],
      },
    },

    // Movie Date Preferences
    movieDatePrefs: {
      idealFirstDate: {
        type: String,
        enum: [
          "theater-movie",
          "home-movie-night",
          "drive-in",
          "outdoor-screening",
          "film-festival",
          "virtual-watch",
          "no-preference",
        ],
      },
      snackPreferences: [
        {
          type: String,
          enum: [
            "popcorn-butter",
            "popcorn-plain",
            "candy",
            "chocolate",
            "nachos",
            "pizza",
            "healthy-snacks",
            "no-snacks",
            "homemade-treats",
            "gourmet-food",
          ],
        },
      ],
      drinkPreferences: [
        {
          type: String,
          enum: ["soda", "water", "juice", "coffee", "tea", "wine", "beer", "cocktails", "none"],
        },
      ],
    },

    // Matching and Engagement Data
    engagement: {
      lastActive: {
        type: Date,
        default: Date.now,
        index: true,
      },
      profileCompleted: {
        type: Boolean,
        default: false,
      },
      profileCompletionPercentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      verificationStatus: {
        email: { type: Boolean, default: false },
        phone: { type: Boolean, default: false },
        photo: { type: Boolean, default: false },
      },
    },

    // Safety and Privacy
    safety: {
      blockedUserIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      reportedUserIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      privacySettings: {
        showAge: { type: Boolean, default: true },
        showLocation: { type: Boolean, default: true },
        showOnline: { type: Boolean, default: true },
      },
    },

    // Premium Features
    premium: {
      isPremium: { type: Boolean, default: false },
      premiumUntil: Date,
      features: [String],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for efficient querying
UserSchema.index({ "location.geo": "2dsphere" });
UserSchema.index({ status: 1, "engagement.lastActive": -1 });
UserSchema.index({ "datingPrefs.relationshipIntent": 1 });
UserSchema.index({ "identity.birthdate": 1 });

// Virtual for age calculation
UserSchema.virtual("age").get(function () {
  if (!this.identity?.birthdate) return null;
  const today = new Date();
  const birthDate = new Date(this.identity.birthdate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Export the model
export default mongoose.models.User || mongoose.model("User", UserSchema);
