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

      const matches = MatchingEngine.findMatches(currentUser, userObjects, limit, filters);

      // Create boost status map for efficient sorting
      const boostStatusMap = new Map();
      userObjects.forEach(u => {
        boostStatusMap.set(u.id, u.isBoostActive());
      });

      // Prioritize boosted profiles by sorting them to the top
      matches.sort((a, b) => {
        const aIsBoosted = boostStatusMap.get(a.user2Id) || false;
        const bIsBoosted = boostStatusMap.get(b.user2Id) || false;
        
        if (aIsBoosted && !bIsBoosted) return -1;
        if (!aIsBoosted && bIsBoosted) return 1;
        
        // If both boosted or both not boosted, sort by match score
        return b.matchScore - a.matchScore;
      });

      // Save matches to database
      for (const match of matches) {
        await dataStore.addMatch(match);
      }

      // Populate match results with user details
      const matchesWithDetails = await Promise.all(
        matches.map(async (match) => {
          const matchedUser = await dataStore.findUserById(match.user2Id);
          const matchedUserObj = new User(matchedUser);
          return {
            matchId: match.id,
            matchScore: match.matchScore,
            matchDescription: match.matchDescription,
            sharedContent: match.sharedContent,
            quizCompatibility: match.quizCompatibility,
            snackCompatibility: match.snackCompatibility,
            debateCompatibility: match.debateCompatibility,
            emotionalToneCompatibility: match.emotionalToneCompatibility,
            bingeCompatibility: match.bingeCompatibility,
            swipeGenreCompatibility: match.swipeGenreCompatibility,
            contentTypeCompatibility: match.contentTypeCompatibility,
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
            sharedContent: match.sharedContent,
            quizCompatibility: match.quizCompatibility,
            snackCompatibility: match.snackCompatibility,
            debateCompatibility: match.debateCompatibility,
            emotionalToneCompatibility: match.emotionalToneCompatibility,
            bingeCompatibility: match.bingeCompatibility,
            swipeGenreCompatibility: match.swipeGenreCompatibility,
            contentTypeCompatibility: match.contentTypeCompatibility,
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
