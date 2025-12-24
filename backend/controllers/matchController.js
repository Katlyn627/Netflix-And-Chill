const User = require('../models/User');
const { getDatabase } = require('../utils/database');
const MatchingEngine = require('../utils/matchingEngine');

class MatchController {
  async findMatches(req, res) {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit) || 10;
      
      // Extract filter parameters from query
      const filters = {};
      if (req.query.minAge || req.query.maxAge) {
        filters.ageRange = {
          min: parseInt(req.query.minAge) || 18,
          max: parseInt(req.query.maxAge) || 100
        };
      }
      if (req.query.locationRadius !== undefined) {
        filters.locationRadius = parseInt(req.query.locationRadius);
      }
      if (req.query.genderPreference) {
        filters.genderPreference = Array.isArray(req.query.genderPreference) 
          ? req.query.genderPreference 
          : req.query.genderPreference.split(',');
      }
      if (req.query.sexualOrientationPreference) {
        filters.sexualOrientationPreference = Array.isArray(req.query.sexualOrientationPreference) 
          ? req.query.sexualOrientationPreference 
          : req.query.sexualOrientationPreference.split(',');
      }
      if (req.query.minMatchScore !== undefined) {
        filters.minMatchScore = parseInt(req.query.minMatchScore) || 0;
      }
      if (req.query.archetypePreference) {
        filters.archetypePreference = Array.isArray(req.query.archetypePreference) 
          ? req.query.archetypePreference 
          : req.query.archetypePreference.split(',');
      }

      const dataStore = await getDatabase();
      const user = await dataStore.findUserById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const allUsers = await dataStore.loadUsers();
      const userObjects = allUsers.map(u => new User(u));
      const currentUser = new User(user);

      const matches = MatchingEngine.findMatches(currentUser, userObjects, limit, filters);

      // Batch save matches to database for better performance
      // Use Promise.all to save all matches concurrently
      await Promise.all(matches.map(match => dataStore.addMatch(match)));

      // Create a map of users for O(1) lookups instead of N database queries
      const userMap = new Map(allUsers.map(u => [u.id, u]));

      // Populate match results with user details using the user map
      const matchesWithDetails = matches.map((match) => {
        const matchedUser = userMap.get(match.user2Id);
        return {
          matchId: match.id,
          matchScore: match.matchScore,
          matchDescription: match.matchDescription,
          sharedContent: match.sharedContent,
          quizCompatibility: match.quizCompatibility,
          snackCompatibility: match.snackCompatibility,
          debateCompatibility: match.debateCompatibility,
          emotionalToneCompatibility: match.emotionalToneCompatibility,
          user: {
            id: matchedUser.id,
            username: matchedUser.username,
            age: matchedUser.age,
            location: matchedUser.location,
            gender: matchedUser.gender,
            sexualOrientation: matchedUser.sexualOrientation,
            bio: matchedUser.bio,
            profilePicture: matchedUser.profilePicture,
            photoGallery: matchedUser.photoGallery,
            streamingServices: matchedUser.streamingServices,
            movieDebateResponses: matchedUser.movieDebateResponses,
            moviePromptResponses: matchedUser.moviePromptResponses,
            archetype: matchedUser.archetype,
            personalityBio: matchedUser.personalityBio
          }
        };
      });

      res.json({
        success: true,
        userId: userId,
        matches: matchesWithDetails
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getMatchHistory(req, res) {
    try {
      const { userId } = req.params;

      const dataStore = await getDatabase();
      const user = await dataStore.findUserById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const matches = await dataStore.findMatchesForUser(userId);

      // Get all unique user IDs involved in matches
      const userIds = new Set();
      matches.forEach(match => {
        const otherUserId = match.user1Id === userId ? match.user2Id : match.user1Id;
        userIds.add(otherUserId);
      });

      // Batch fetch all users in parallel instead of one at a time
      const users = await Promise.all(
        Array.from(userIds).map(id => dataStore.findUserById(id))
      );
      
      // Create a map for O(1) lookups
      const userMap = new Map(
        users.filter(u => u !== null).map(u => [u.id, u])
      );

      // Populate match details with user information using the user map
      const matchesWithDetails = matches
        .map((match) => {
          const otherUserId = match.user1Id === userId ? match.user2Id : match.user1Id;
          const matchedUser = userMap.get(otherUserId);
          
          if (!matchedUser) {
            return null;
          }

          return {
            matchId: match.id,
            matchScore: match.matchScore,
            matchDescription: match.matchDescription,
            sharedContent: match.sharedContent,
            quizCompatibility: match.quizCompatibility,
            snackCompatibility: match.snackCompatibility,
            debateCompatibility: match.debateCompatibility,
            emotionalToneCompatibility: match.emotionalToneCompatibility,
            createdAt: match.createdAt,
            user: {
              id: matchedUser.id,
              username: matchedUser.username,
              age: matchedUser.age,
              location: matchedUser.location,
              gender: matchedUser.gender,
              sexualOrientation: matchedUser.sexualOrientation,
              bio: matchedUser.bio,
              profilePicture: matchedUser.profilePicture,
              photoGallery: matchedUser.photoGallery,
              streamingServices: matchedUser.streamingServices,
              movieDebateResponses: matchedUser.movieDebateResponses,
              moviePromptResponses: matchedUser.moviePromptResponses,
              archetype: matchedUser.archetype,
              personalityBio: matchedUser.personalityBio
            }
          };
        })
        .filter(m => m !== null); // Filter out null entries (users that no longer exist)

      res.json({
        success: true,
        userId: userId,
        matchCount: matchesWithDetails.length,
        matches: matchesWithDetails
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new MatchController();
