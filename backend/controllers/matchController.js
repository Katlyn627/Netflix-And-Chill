const User = require('../models/User');
const DataStore = require('../utils/dataStore');
const MatchingEngine = require('../utils/matchingEngine');

const dataStore = new DataStore();

class MatchController {
  async findMatches(req, res) {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit) || 10;

      const user = await dataStore.findUserById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const allUsers = await dataStore.loadUsers();
      const userObjects = allUsers.map(u => new User(u));
      const currentUser = new User(user);

      const matches = MatchingEngine.findMatches(currentUser, userObjects, limit);

      // Save matches to database
      for (const match of matches) {
        await dataStore.addMatch(match);
      }

      // Populate match results with user details
      const matchesWithDetails = await Promise.all(
        matches.map(async (match) => {
          const matchedUser = await dataStore.findUserById(match.user2Id);
          return {
            matchId: match.id,
            matchScore: match.matchScore,
            sharedContent: match.sharedContent,
            user: {
              id: matchedUser.id,
              username: matchedUser.username,
              age: matchedUser.age,
              location: matchedUser.location,
              bio: matchedUser.bio,
              streamingServices: matchedUser.streamingServices
            }
          };
        })
      );

      res.json({
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

      const user = await dataStore.findUserById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const matches = await dataStore.findMatchesForUser(userId);

      res.json({
        userId: userId,
        matchCount: matches.length,
        matches: matches
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new MatchController();
