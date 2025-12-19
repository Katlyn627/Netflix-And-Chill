import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  isEdited: {
    type: Boolean,
    default: false,
  },
  editedAt: Date,
});

const DebateRoomSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    category: {
      type: String,
      enum: [
        "hot-takes",
        "movie-reviews",
        "director-showdown",
        "genre-debate",
        "best-of-decade",
        "overrated-underrated",
        "plot-holes",
        "character-analysis",
        "cinematography",
        "soundtracks",
        "remakes-vs-originals",
        "franchise-discussion",
        "casting-choices",
        "general",
      ],
      default: "general",
      index: true,
    },
    description: {
      type: String,
      maxlength: 1000,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participants: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        lastSeen: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    messages: [MessageSchema],
    status: {
      type: String,
      enum: ["active", "archived", "closed"],
      default: "active",
      index: true,
    },
    maxParticipants: {
      type: Number,
      default: 50,
      min: 2,
      max: 100,
    },
    tags: [String],
    relatedMovies: [
      {
        tmdbId: Number,
        title: String,
        posterPath: String,
      },
    ],
    isPinned: {
      type: Boolean,
      default: false,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    moderators: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for efficient querying
DebateRoomSchema.index({ status: 1, createdAt: -1 });
DebateRoomSchema.index({ category: 1, status: 1 });
DebateRoomSchema.index({ tags: 1 });
DebateRoomSchema.index({ "participants.userId": 1 });

// Virtual for participant count
DebateRoomSchema.virtual("participantCount").get(function () {
  return this.participants?.length || 0;
});

// Virtual for message count
DebateRoomSchema.virtual("messageCount").get(function () {
  return this.messages?.length || 0;
});

// Virtual for last activity
DebateRoomSchema.virtual("lastActivity").get(function () {
  if (this.messages && this.messages.length > 0) {
    return this.messages[this.messages.length - 1].timestamp;
  }
  return this.createdAt;
});

export default mongoose.models.DebateRoom || mongoose.model("DebateRoom", DebateRoomSchema);
