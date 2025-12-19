import express from "express";
import { connectDB } from "../../lib/db.js";
import DebateRoom from "../../models/DebateRoom.js";
import User from "../../models/User.js";

const router = express.Router();

// Get all debate rooms (with filters)
router.get("/rooms", async (req, res) => {
  try {
    await connectDB();

    const { category, status, search } = req.query;
    const query = {};

    if (category) query.category = category;
    if (status) query.status = status;
    else query.status = "active"; // default to active rooms

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { topic: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    const rooms = await DebateRoom.find(query)
      .populate("createdBy", "displayName photos")
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(100)
      .lean();

    res.json({ rooms });
  } catch (error) {
    console.error("Error fetching debate rooms:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get debate topics/prompts (predefined topics)
router.get("/topics", async (req, res) => {
  try {
    const topics = [
      {
        id: "hot-take-1",
        category: "hot-takes",
        title: "The Godfather is Overrated",
        description: "Let's debate if The Godfather deserves its #1 spot in cinema history",
        icon: "🔥",
      },
      {
        id: "hot-take-2",
        category: "hot-takes",
        title: "Marvel vs DC: The Ultimate Showdown",
        description: "Which cinematic universe reigns supreme?",
        icon: "⚡",
      },
      {
        id: "director-1",
        category: "director-showdown",
        title: "Nolan vs Tarantino",
        description: "Who is the better director of our generation?",
        icon: "🎬",
      },
      {
        id: "genre-1",
        category: "genre-debate",
        title: "Horror: Jump Scares vs Psychological Terror",
        description: "What makes a truly scary horror film?",
        icon: "👻",
      },
      {
        id: "decade-1",
        category: "best-of-decade",
        title: "Best Movies of the 2010s",
        description: "What films defined the decade?",
        icon: "📅",
      },
      {
        id: "overrated-1",
        category: "overrated-underrated",
        title: "Most Overrated Movie of All Time",
        description: "Which critically acclaimed film doesn't deserve the hype?",
        icon: "📉",
      },
      {
        id: "plot-1",
        category: "plot-holes",
        title: "Biggest Plot Holes in Popular Movies",
        description: "Let's discuss the plot holes that ruin movies",
        icon: "🕳️",
      },
      {
        id: "character-1",
        category: "character-analysis",
        title: "Best Movie Villain of All Time",
        description: "Who is the most compelling antagonist in cinema?",
        icon: "🦹",
      },
      {
        id: "cinematography-1",
        category: "cinematography",
        title: "Most Visually Stunning Films",
        description: "Movies that are pure visual poetry",
        icon: "📸",
      },
      {
        id: "soundtrack-1",
        category: "soundtracks",
        title: "Best Movie Soundtracks Ever",
        description: "When the music is as good as the movie",
        icon: "🎵",
      },
      {
        id: "remake-1",
        category: "remakes-vs-originals",
        title: "Remakes Better Than the Original",
        description: "Do any remakes actually surpass the source material?",
        icon: "🔄",
      },
      {
        id: "franchise-1",
        category: "franchise-discussion",
        title: "Star Wars: Best Trilogy?",
        description: "Original, Prequels, or Sequels - which trilogy wins?",
        icon: "⭐",
      },
      {
        id: "casting-1",
        category: "casting-choices",
        title: "Perfect vs Terrible Casting Decisions",
        description: "Actors who were born for roles, and those who weren't",
        icon: "🎭",
      },
    ];

    const { category } = req.query;
    let filteredTopics = topics;

    if (category) {
      filteredTopics = topics.filter((t) => t.category === category);
    }

    res.json({ topics: filteredTopics });
  } catch (error) {
    console.error("Error fetching topics:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get a specific debate room
router.get("/rooms/:roomId", async (req, res) => {
  try {
    await connectDB();

    const { roomId } = req.params;
    const room = await DebateRoom.findById(roomId)
      .populate("createdBy", "displayName photos")
      .populate("participants.userId", "displayName photos")
      .populate("messages.userId", "displayName photos")
      .lean();

    if (!room) {
      return res.status(404).json({ error: "Debate room not found" });
    }

    res.json({ room });
  } catch (error) {
    console.error("Error fetching debate room:", error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new debate room
router.post("/rooms", async (req, res) => {
  try {
    await connectDB();

    const { title, topic, category, description, createdBy, tags, relatedMovies, isPrivate } = req.body;

    if (!title || !topic || !createdBy) {
      return res.status(400).json({ error: "Missing required fields: title, topic, createdBy" });
    }

    // Verify user exists
    const user = await User.findById(createdBy);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const room = new DebateRoom({
      title,
      topic,
      category: category || "general",
      description,
      createdBy,
      tags,
      relatedMovies,
      isPrivate: isPrivate || false,
      participants: [
        {
          userId: createdBy,
          joinedAt: new Date(),
          lastSeen: new Date(),
        },
      ],
      moderators: [createdBy],
    });

    await room.save();

    const populatedRoom = await DebateRoom.findById(room._id)
      .populate("createdBy", "displayName photos")
      .lean();

    res.status(201).json({ room: populatedRoom });
  } catch (error) {
    console.error("Error creating debate room:", error);
    res.status(500).json({ error: error.message });
  }
});

// Join a debate room
router.post("/rooms/:roomId/join", async (req, res) => {
  try {
    await connectDB();

    const { roomId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    const room = await DebateRoom.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: "Debate room not found" });
    }

    // Check if user already joined
    const alreadyJoined = room.participants.some((p) => p.userId.toString() === userId);
    if (alreadyJoined) {
      // Update last seen
      const participant = room.participants.find((p) => p.userId.toString() === userId);
      participant.lastSeen = new Date();
    } else {
      // Check max participants
      if (room.participants.length >= room.maxParticipants) {
        return res.status(400).json({ error: "Room is full" });
      }

      room.participants.push({
        userId,
        joinedAt: new Date(),
        lastSeen: new Date(),
      });
    }

    await room.save();

    const updatedRoom = await DebateRoom.findById(roomId)
      .populate("createdBy", "displayName photos")
      .populate("participants.userId", "displayName photos")
      .lean();

    res.json({ room: updatedRoom });
  } catch (error) {
    console.error("Error joining debate room:", error);
    res.status(500).json({ error: error.message });
  }
});

// Post a message in a debate room
router.post("/rooms/:roomId/messages", async (req, res) => {
  try {
    await connectDB();

    const { roomId } = req.params;
    const { userId, message } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ error: "Missing userId or message" });
    }

    const room = await DebateRoom.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: "Debate room not found" });
    }

    // Get user info
    const user = await User.findById(userId).select("displayName").lean();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if user is a participant
    const isParticipant = room.participants.some((p) => p.userId.toString() === userId);
    if (!isParticipant) {
      return res.status(403).json({ error: "User must join the room first" });
    }

    // Add message
    room.messages.push({
      userId,
      username: user.displayName,
      message,
      timestamp: new Date(),
    });

    // Update participant's last seen
    const participant = room.participants.find((p) => p.userId.toString() === userId);
    if (participant) {
      participant.lastSeen = new Date();
    }

    await room.save();

    // Return the newly added message
    const newMessage = room.messages[room.messages.length - 1];

    res.status(201).json({ message: newMessage });
  } catch (error) {
    console.error("Error posting message:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get messages from a debate room
router.get("/rooms/:roomId/messages", async (req, res) => {
  try {
    await connectDB();

    const { roomId } = req.params;
    const { limit = 100, skip = 0 } = req.query;

    const room = await DebateRoom.findById(roomId)
      .select("messages")
      .lean();

    if (!room) {
      return res.status(404).json({ error: "Debate room not found" });
    }

    // Get messages with pagination
    const messages = room.messages
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(parseInt(skip), parseInt(skip) + parseInt(limit))
      .reverse();

    res.json({ messages, total: room.messages.length });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: error.message });
  }
});

// Like a message
router.post("/rooms/:roomId/messages/:messageId/like", async (req, res) => {
  try {
    await connectDB();

    const { roomId, messageId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    const room = await DebateRoom.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: "Debate room not found" });
    }

    const message = room.messages.id(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Toggle like
    const likeIndex = message.likes.findIndex((id) => id.toString() === userId);
    if (likeIndex > -1) {
      message.likes.splice(likeIndex, 1);
    } else {
      message.likes.push(userId);
    }

    await room.save();

    res.json({ message, liked: likeIndex === -1 });
  } catch (error) {
    console.error("Error liking message:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
