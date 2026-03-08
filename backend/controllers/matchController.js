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

      // Premium filters
      if (req.query.premiumGenres || req.query.premiumBingeMin || req.query.premiumServices || 
          req.query.premiumDecades || req.query.premiumMinScore) {
        filters.premium = {};
        
        if (req.query.premiumGenres) {
          filters.premium.genreIds = Array.isArray(req.query.premiumGenres)
            ? req.query.premiumGenres.map(id => parseInt(id))
            : req.query.premiumGenres.split(',').map(id => parseInt(id));
        }
        
        if (req.query.premiumBingeMin !== undefined || req.query.premiumBingeMax !== undefined) {
          filters.premium.bingeRange = {
            min: parseInt(req.query.premiumBingeMin) || 0,
            max: parseInt(req.query.premiumBingeMax) || 100
          };
        }
        
        if (req.query.premiumServices) {
          filters.premium.streamingServices = Array.isArray(req.query.premiumServices)
            ? req.query.premiumServices
            : req.query.premiumServices.split(',');
        }
        
        if (req.query.premiumDecades) {
          filters.premium.decades = Array.isArray(req.query.premiumDecades)
            ? req.query.premiumDecades.map(d => parseInt(d))
            : req.query.premiumDecades.split(',').map(d => parseInt(d));
        }
        
        if (req.query.premiumMinScore !== undefined) {
          filters.premium.minAdvancedScore = parseInt(req.query.premiumMinScore);
        }
      }

      const dataStore = await getDatabase();
      const user = await dataStore.findUserById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const allUsers = await dataStore.loadUsers();
      const userObjects = allUsers.map(u => new User(u));
      const currentUser = new User(user);

      // Use the emotional storytelling algorithm: pass limit and filters as an options object
      const matches = MatchingEngine.findMatches(currentUser, userObjects, { limit, filters });

      // Create boost status map for efficient sorting
      const boostStatusMap = new Map();
      userObjects.forEach(u => {
        boostStatusMap.set(u.id, u.isBoostActive());
      });

      // Prioritize boosted profiles, then sort by emotional storytelling score
      matches.sort((a, b) => {
        const aIsBoosted = boostStatusMap.get(a.userId) || false;
        const bIsBoosted = boostStatusMap.get(b.userId) || false;

        if (aIsBoosted && !bIsBoosted) return -1;
        if (!aIsBoosted && bIsBoosted) return 1;

        return b.score - a.score;
      });

      // Save matches to database using fields the engine actually returns
      for (const match of matches) {
        const dbRecord = {
          id: `match_${currentUser.id}_${match.userId}_${Date.now()}`,
          user1Id: currentUser.id,
          user2Id: match.userId,
          matchScore: match.score,
          matchDescription: match.matchDescription,
          relationshipGenre: match.relationshipGenre,
          loveStory: match.loveStory,
          breakdown: match.breakdown,
          sharedContent: match.sharedContent || [],
          createdAt: new Date().toISOString()
        };
        await dataStore.addMatch(dbRecord);
      }

      // Populate match results with user details and new emotional storytelling fields
      const matchesWithDetails = await Promise.all(
        matches.map(async (match) => {
          const matchedUser = await dataStore.findUserById(match.userId);
          if (!matchedUser) {
            console.warn(`[MatchController] Candidate user ${match.userId} returned by engine but not found in store — skipping`);
            return null;
          }
          const matchedUserObj = new User(matchedUser);
          return {
            matchScore: match.score,
            matchDescription: match.matchDescription,
            // Emotional storytelling fields
            relationshipGenre: match.relationshipGenre,
            loveStory: match.loveStory,
            breakdown: match.breakdown,
            dnaCompatibility: match.dnaCompatibility,
            archetypeCompatibility: match.archetypeCompatibility,
            directorCompatibility: match.directorCompatibility,
            redFlags: match.redFlags,
            // Legacy / shared content (kept for backward-compat)
            sharedContent: match.sharedContent || [],
            sharedGenres: match.sharedGenres || [],
            isBoosted: matchedUserObj.isBoostActive(),
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
              personalityBio: matchedUser.personalityBio,
              preferences: matchedUser.preferences,
              swipedMovies: matchedUser.swipedMovies,
              swipePreferences: matchedUser.swipePreferences
            }
          };
        })
      );

      // Remove null entries (matched user no longer exists)
      const validMatches = matchesWithDetails.filter(m => m !== null);

      res.json({
        success: true,
        userId: userId,
        algorithm: 'emotional-storytelling-v2',
        matches: validMatches
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

      // Populate match details with user information
      const matchesWithDetails = await Promise.all(
        matches.map(async (match) => {
          const otherUserId = match.user1Id === userId ? match.user2Id : match.user1Id;
          const matchedUser = await dataStore.findUserById(otherUserId);
          
          if (!matchedUser) {
            return null;
          }

          return {
            matchId: match.id,
            matchScore: match.matchScore,
            matchDescription: match.matchDescription,
            relationshipGenre: match.relationshipGenre,
            loveStory: match.loveStory,
            breakdown: match.breakdown,
            redFlags: match.redFlags,
            sharedContent: match.sharedContent || [],
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
              personalityBio: matchedUser.personalityBio,
              preferences: matchedUser.preferences,
              swipedMovies: matchedUser.swipedMovies,
              swipePreferences: matchedUser.swipePreferences
            }
          };
        })
      );

      // Filter out null entries (users that no longer exist)
      const validMatches = matchesWithDetails.filter(m => m !== null);

      res.json({
        success: true,
        userId: userId,
        matchCount: validMatches.length,
        matches: validMatches
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new MatchController();
