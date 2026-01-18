const User = require('../models/User');
const { getDatabase } = require('../utils/database');
const {
  VALID_GENDERS,
  VALID_SEXUAL_ORIENTATIONS,
  VALID_GENDER_PREFERENCES,
  VALID_SEXUAL_ORIENTATION_PREFERENCES
} = require('../constants/userConstants');

// Constants
const MAX_PHOTOS_IN_GALLERY = 6;

class UserController {
  // Helper method to filter sensitive data from user response
  filterSensitiveData(user) {
    const userData = typeof user.toJSON === 'function' ? user.toJSON() : user;
    const { password, ...filteredData } = userData;
    return filteredData;
  }

  // Helper method to save user data with password preserved
  async saveUserData(userId, user) {
    const dataStore = await getDatabase();
    const userDataToStore = { ...user.toJSON(), password: user.password };
    return await dataStore.updateUser(userId, userDataToStore);
  }

  async createUser(req, res) {
    try {
      const { username, email, password, age, location, bio, gender, sexualOrientation } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email, and password are required' });
      }

      const dataStore = await getDatabase();

      // Check if user already exists
      const existingUser = await dataStore.findUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }

      const userData = {
        username,
        email,
        password, // In production, this should be hashed
        age,
        location,
        bio,
        gender,
        sexualOrientation
      };

      const user = new User(userData);
      
      // Save user data including password
      const userDataToStore = { ...user.toJSON(), password: user.password };
      await dataStore.addUser(userDataToStore);

      res.status(201).json({
        message: 'User created successfully',
        user: this.filterSensitiveData(user)
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async loginUser(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email/username and password are required' });
      }

      const dataStore = await getDatabase();
      
      // Try to find user by email first, then by username
      let userData = await dataStore.findUserByEmail(email);
      if (!userData) {
        // If not found by email, try username
        userData = await dataStore.findUserByUsername(email);
      }
      
      if (!userData) {
        return res.status(401).json({ error: 'Invalid email/username or password' });
      }

      const user = new User(userData);
      if (!user.verifyPassword(password)) {
        return res.status(401).json({ error: 'Invalid email/username or password' });
      }

      res.json({
        message: 'Login successful',
        userId: user.id,
        user: this.filterSensitiveData(user)
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getUser(req, res) {
    try {
      const { userId } = req.params;

      const dataStore = await getDatabase();
      const userData = await dataStore.findUserById(userId);
      if (!userData) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(this.filterSensitiveData(userData));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateBio(req, res) {
    try {
      const { userId } = req.params;
      const { bio } = req.body;

      if (!bio) {
        return res.status(400).json({ error: 'Bio is required' });
      }

      const dataStore = await getDatabase();
      const userData = await dataStore.findUserById(userId);
      if (!userData) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = new User(userData);
      user.updateBio(bio);

      await this.saveUserData(userId, user);

      res.json({
        message: 'Bio updated successfully',
        user: this.filterSensitiveData(user)
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async addStreamingService(req, res) {
    try {
      const { userId } = req.params;
      const { serviceName, serviceId, logoPath, logoUrl } = req.body;

      if (!serviceName) {
        return res.status(400).json({ error: 'Service name is required' });
      }

      const dataStore = await getDatabase();
      const userData = await dataStore.findUserById(userId);
      if (!userData) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = new User(userData);
      user.addStreamingService({ 
        id: serviceId, 
        name: serviceName, 
        logoPath, 
        logoUrl 
      });

      await this.saveUserData(userId, user);

      res.json({
        message: 'Streaming service added successfully',
        user: this.filterSensitiveData(user)
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateStreamingServices(req, res) {
    try {
      const { userId } = req.params;
      const { services } = req.body;

      if (!services || !Array.isArray(services)) {
        return res.status(400).json({ error: 'Services array is required' });
      }

      // Allow empty array (user wants to clear all services)
      // Validate each service has a name (only if services array is not empty)
      if (services.length > 0) {
        for (const service of services) {
          if (!service.name || typeof service.name !== 'string' || service.name.trim() === '') {
            return res.status(400).json({ error: 'Each service must have a valid name' });
          }
        }
      }

      const dataStore = await getDatabase();
      const userData = await dataStore.findUserById(userId);
      if (!userData) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = new User(userData);
      user.updateStreamingServices(services);

      await this.saveUserData(userId, user);

      res.json({
        message: 'Streaming services updated successfully',
        user: this.filterSensitiveData(user)
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async addWatchHistory(req, res) {
    try {
      const { userId } = req.params;
      const { title, type, genre, service, episodesWatched, posterPath, tmdbId, watchDuration, sessionDate } = req.body;

      if (!title || !type) {
        return res.status(400).json({ error: 'Title and type are required' });
      }

      const dataStore = await getDatabase();
      const userData = await dataStore.findUserById(userId);
      if (!userData) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = new User(userData);
      user.addToWatchHistory({ 
        title, 
        type, 
        genre, 
        service, 
        episodesWatched, 
        posterPath, 
        tmdbId,
        watchDuration, // Optional: duration in minutes
        sessionDate // Optional: when the content was watched
      });

      await this.saveUserData(userId, user);

      res.json({
        message: 'Watch history updated successfully',
        user: this.filterSensitiveData(user)
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async removeWatchHistory(req, res) {
    try {
      const { userId } = req.params;
      const { watchedAt } = req.body;

      if (!watchedAt) {
        return res.status(400).json({ error: 'watchedAt timestamp is required' });
      }

      const dataStore = await getDatabase();
      const userData = await dataStore.findUserById(userId);
      if (!userData) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = new User(userData);
      user.removeFromWatchHistory(watchedAt);

      await this.saveUserData(userId, user);

      res.json({
        message: 'Watch history item removed successfully',
        user: this.filterSensitiveData(user)
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updatePreferences(req, res) {
    try {
      const { userId } = req.params;
      const { genres, bingeWatchCount, ageRange, locationRadius, genderPreference, sexualOrientationPreference } = req.body;

      const dataStore = await getDatabase();
      const userData = await dataStore.findUserById(userId);
      if (!userData) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = new User(userData);
      
      if (genres !== undefined) {
        user.preferences.genres = genres;
      }
      if (bingeWatchCount !== undefined) {
        user.preferences.bingeWatchCount = bingeWatchCount;
      }
      if (ageRange !== undefined) {
        user.preferences.ageRange = ageRange;
      }
      if (locationRadius !== undefined) {
        user.preferences.locationRadius = locationRadius;
      }
      if (genderPreference !== undefined) {
        // Validate genderPreference is an array
        if (!Array.isArray(genderPreference)) {
          return res.status(400).json({ error: 'Gender preference must be an array' });
        }
        // Validate gender values
        const invalidGenders = genderPreference.filter(g => !VALID_GENDER_PREFERENCES.includes(g));
        if (invalidGenders.length > 0) {
          return res.status(400).json({ error: `Invalid gender preference values: ${invalidGenders.join(', ')}` });
        }
        user.preferences.genderPreference = genderPreference;
      }
      if (sexualOrientationPreference !== undefined) {
        // Validate sexualOrientationPreference is an array
        if (!Array.isArray(sexualOrientationPreference)) {
          return res.status(400).json({ error: 'Sexual orientation preference must be an array' });
        }
        // Validate orientation values
        const invalidOrientations = sexualOrientationPreference.filter(o => !VALID_SEXUAL_ORIENTATION_PREFERENCES.includes(o));
        if (invalidOrientations.length > 0) {
          return res.status(400).json({ error: `Invalid sexual orientation preference values: ${invalidOrientations.join(', ')}` });
        }
        user.preferences.sexualOrientationPreference = sexualOrientationPreference;
      }

      await this.saveUserData(userId, user);

      res.json({
        message: 'Preferences updated successfully',
        user: this.filterSensitiveData(user)
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async uploadProfilePicture(req, res) {
    try {
      const { userId } = req.params;
      const { profilePicture } = req.body;

      if (!profilePicture) {
        return res.status(400).json({ error: 'Profile picture URL is required' });
      }

      const dataStore = await getDatabase();
      const userData = await dataStore.findUserById(userId);
      if (!userData) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = new User(userData);
      user.profilePicture = profilePicture;

      await this.saveUserData(userId, user);

      res.json({
        message: 'Profile picture uploaded successfully',
        user: this.filterSensitiveData(user)
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async addPhotoToGallery(req, res) {
    try {
      const { userId } = req.params;
      const { photoUrl } = req.body;

      if (!photoUrl) {
        return res.status(400).json({ error: 'Photo URL is required' });
      }

      const dataStore = await getDatabase();
      const userData = await dataStore.findUserById(userId);
      if (!userData) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = new User(userData);
      
      if (user.photoGallery.length >= MAX_PHOTOS_IN_GALLERY) {
        return res.status(400).json({ error: `Maximum ${MAX_PHOTOS_IN_GALLERY} photos allowed in gallery` });
      }

      user.addPhoto(photoUrl);

      await this.saveUserData(userId, user);

      res.json({
        message: 'Photo added to gallery successfully',
        user: this.filterSensitiveData(user)
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async removePhotoFromGallery(req, res) {
    try {
      const { userId } = req.params;
      const { photoUrl } = req.body;

      if (!photoUrl) {
        return res.status(400).json({ error: 'Photo URL is required' });
      }

      const dataStore = await getDatabase();
      const userData = await dataStore.findUserById(userId);
      if (!userData) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = new User(userData);
      user.removePhoto(photoUrl);

      await this.saveUserData(userId, user);

      res.json({
        message: 'Photo removed from gallery successfully',
        user: this.filterSensitiveData(user)
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateProfileDetails(req, res) {
    try {
      const { userId } = req.params;
      const updates = req.body;

      const dataStore = await getDatabase();
      const userData = await dataStore.findUserById(userId);
      if (!userData) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = new User(userData);

      // Validate gender if provided
      if (updates.gender !== undefined) {
        if (!VALID_GENDERS.includes(updates.gender)) {
          return res.status(400).json({ error: `Invalid gender value. Must be one of: ${VALID_GENDERS.join(', ')}` });
        }
      }

      // Validate sexual orientation if provided
      if (updates.sexualOrientation !== undefined) {
        if (!VALID_SEXUAL_ORIENTATIONS.includes(updates.sexualOrientation)) {
          return res.status(400).json({ error: `Invalid sexual orientation value. Must be one of: ${VALID_SEXUAL_ORIENTATIONS.join(', ')}` });
        }
      }

      // Update allowed fields
      const allowedFields = [
        'leastFavoriteMovies',
        'movieDebateTopics',
        'favoriteSnacks',
        'videoChatPreference',
        'gender',
        'sexualOrientation',
        'location',
        'age'
      ];

      allowedFields.forEach(field => {
        if (updates[field] !== undefined) {
          user[field] = updates[field];
        }
      });

      await this.saveUserData(userId, user);

      res.json({
        message: 'Profile details updated successfully',
        user: this.filterSensitiveData(user)
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async submitQuizResponses(req, res) {
    try {
      const { userId } = req.params;
      const { quizResponses, answers } = req.body;

      console.log(`[Quiz Submission] User ${userId} submitting quiz...`);
      console.log(`[Quiz Submission] Received ${answers ? answers.length : 0} answers`);

      // Support both old format (quizResponses) and new format (answers)
      const quizAnswers = answers || quizResponses;

      if (!quizAnswers) {
        console.error('[Quiz Submission] No quiz answers provided');
        return res.status(400).json({ error: 'Quiz responses are required' });
      }

      const dataStore = await getDatabase();
      const userData = await dataStore.findUserById(userId);
      if (!userData) {
        console.error(`[Quiz Submission] User ${userId} not found`);
        return res.status(404).json({ error: 'User not found' });
      }

      const user = new User(userData);
      
      // If using old format, maintain backward compatibility
      if (quizResponses && !answers) {
        user.quizResponses = { ...user.quizResponses, ...quizResponses };
        console.log('[Quiz Submission] Using legacy quiz format');
      }
      
      // If using new format with answer array, process quiz completion
      if (answers && Array.isArray(answers)) {
        console.log('[Quiz Submission] Processing quiz with new format...');
        const MovieQuizScoring = require('../utils/movieQuizScoring');
        
        // Process quiz completion
        const quizAttempt = MovieQuizScoring.processQuizCompletion(userId, answers);
        console.log(`[Quiz Submission] Quiz processed. Generated ${quizAttempt.personalityTraits.archetypes.length} archetypes`);
        
        // Add to user's quiz attempts
        if (!user.quizAttempts) {
          user.quizAttempts = [];
        }
        user.quizAttempts.push(quizAttempt.toJSON());
        console.log(`[Quiz Submission] User now has ${user.quizAttempts.length} quiz attempts`);
        
        // Update personality profile with latest quiz results
        user.personalityProfile = quizAttempt.personalityTraits;
        
        // Generate and save personality bio
        user.personalityBio = MovieQuizScoring.generatePersonalityBio(quizAttempt.personalityTraits);
        console.log(`[Quiz Submission] Generated personality bio: ${user.personalityBio.substring(0, 50)}...`);
        
        // Assign primary archetype to user
        if (quizAttempt.personalityTraits.archetypes && quizAttempt.personalityTraits.archetypes.length > 0) {
          user.archetype = quizAttempt.personalityTraits.archetypes[0];
          console.log(`[Quiz Submission] Assigned archetype: ${user.archetype.name}`);
        } else {
          console.warn('[Quiz Submission] No archetypes generated!');
        }
        
        // Update last quiz completed timestamp
        user.lastQuizCompletedAt = quizAttempt.completedAt;
      }

      console.log('[Quiz Submission] Saving user data to database...');
      const savedUser = await this.saveUserData(userId, user);
      
      if (!savedUser) {
        console.error('[Quiz Submission] Failed to save user data - saveUserData returned null/undefined');
        throw new Error('Failed to save quiz results to database');
      }
      
      console.log('[Quiz Submission] User data saved successfully');
      
      // Verify the save by re-fetching the user
      const verifyUser = await dataStore.findUserById(userId);
      if (verifyUser && verifyUser.archetype) {
        console.log(`[Quiz Submission] Verification: Archetype "${verifyUser.archetype.name}" persisted to database`);
      } else {
        console.warn('[Quiz Submission] Verification: Archetype not found in database after save!');
      }

      res.json({
        message: 'Quiz responses submitted successfully',
        user: this.filterSensitiveData(user),
        personalityProfile: user.personalityProfile,
        personalityBio: user.personalityBio,
        archetype: user.archetype
      });
    } catch (error) {
      console.error('[Quiz Submission] Error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getQuizAttempts(req, res) {
    try {
      const { userId } = req.params;

      const dataStore = await getDatabase();
      const userData = await dataStore.findUserById(userId);
      if (!userData) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = new User(userData);

      res.json({
        quizAttempts: user.quizAttempts || [],
        personalityProfile: user.personalityProfile,
        personalityBio: user.personalityBio,
        lastQuizCompletedAt: user.lastQuizCompletedAt
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }


  async updatePassword(req, res) {
    try {
      const { userId } = req.params;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current password and new password are required' });
      }

      const dataStore = await getDatabase();
      const userData = await dataStore.findUserById(userId);
      if (!userData) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = new User(userData);

      if (!user.verifyPassword(currentPassword)) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      user.updatePassword(newPassword);

      await this.saveUserData(userId, user);

      res.json({
        message: 'Password updated successfully'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async resetPassword(req, res) {
    try {
      const { email, newPassword } = req.body;

      if (!email || !newPassword) {
        return res.status(400).json({ error: 'Email and new password are required' });
      }

      const dataStore = await getDatabase();
      const userData = await dataStore.findUserByEmail(email);
      if (!userData) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = new User(userData);
      user.updatePassword(newPassword);

      await this.saveUserData(user.id, user);

      res.json({
        message: 'Password reset successfully'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Favorite Movies methods
  async addFavoriteMovie(req, res) {
    try {
      const { userId } = req.params;
      const { tmdbId, title, posterPath, overview, releaseDate } = req.body;

      if (!tmdbId || !title) {
        return res.status(400).json({ error: 'TMDB ID and title are required' });
      }

      const dataStore = await getDatabase();
      const userData = await dataStore.findUserById(userId);
      if (!userData) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = new User(userData);
      user.addFavoriteMovie({ tmdbId, title, posterPath, overview, releaseDate });

      await this.saveUserData(userId, user);

      res.json({
        message: 'Movie added to favorites successfully',
        favoriteMovies: user.favoriteMovies
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async removeFavoriteMovie(req, res) {
    try {
      const { userId, movieId } = req.params;

      const dataStore = await getDatabase();
      const userData = await dataStore.findUserById(userId);
      if (!userData) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = new User(userData);
      user.removeFavoriteMovie(movieId);

      await this.saveUserData(userId, user);

      res.json({
        message: 'Movie removed from favorites successfully',
        favoriteMovies: user.favoriteMovies
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getFavoriteMovies(req, res) {
    try {
      const { userId } = req.params;

      const dataStore = await getDatabase();
      const userData = await dataStore.findUserById(userId);
      if (!userData) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        userId,
        count: userData.favoriteMovies?.length || 0,
        favoriteMovies: userData.favoriteMovies || []
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteUser(req, res) {
    try {
      const { userId } = req.params;

      const dataStore = await getDatabase();
      const userData = await dataStore.findUserById(userId);
      if (!userData) {
        return res.status(404).json({ error: 'User not found' });
      }

      await dataStore.deleteUser(userId);

      res.json({
        message: 'User profile and all associated data deleted successfully'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Adaptive Quiz endpoints
  async getAdaptiveQuiz(req, res) {
    try {
      const { questionCount } = req.query;
      const AdaptiveQuiz = require('../utils/adaptiveQuiz');
      
      const count = parseInt(questionCount) || 25;
      const quiz = AdaptiveQuiz.getAdaptiveQuiz(count);
      
      res.json(quiz);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getQuizOptions(req, res) {
    try {
      const AdaptiveQuiz = require('../utils/adaptiveQuiz');
      const options = AdaptiveQuiz.getAvailableQuizzes();
      
      res.json({
        availableQuizzes: options,
        message: 'Choose a quiz length that fits your schedule'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Compatibility Report endpoints
  async getCompatibilityReport(req, res) {
    try {
      const { userId } = req.params;
      const { otherUserId } = req.query;

      if (!otherUserId) {
        return res.status(400).json({ error: 'otherUserId query parameter is required' });
      }

      const dataStore = await getDatabase();
      const userData1 = await dataStore.findUserById(userId);
      const userData2 = await dataStore.findUserById(otherUserId);

      if (!userData1 || !userData2) {
        return res.status(404).json({ error: 'One or both users not found' });
      }

      const CompatibilityReport = require('../utils/compatibilityReport');
      const report = CompatibilityReport.generateReport(userData1, userData2);

      res.json(report);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getGroupCompatibilityReport(req, res) {
    try {
      const { userIds } = req.body;

      if (!userIds || !Array.isArray(userIds) || userIds.length < 2) {
        return res.status(400).json({ error: 'Array of at least 2 user IDs is required' });
      }

      const dataStore = await getDatabase();
      const users = [];

      for (const userId of userIds) {
        const userData = await dataStore.findUserById(userId);
        if (userData) {
          users.push(userData);
        }
      }

      if (users.length < 2) {
        return res.status(400).json({ error: 'At least 2 valid users required for group compatibility' });
      }

      const CompatibilityReport = require('../utils/compatibilityReport');
      const report = CompatibilityReport.generateGroupReport(users);

      res.json(report);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Archetype Recommendations endpoints
  async getArchetypeRecommendations(req, res) {
    try {
      const { userId } = req.params;

      const dataStore = await getDatabase();
      const userData = await dataStore.findUserById(userId);

      if (!userData) {
        return res.status(404).json({ error: 'User not found' });
      }

      const ArchetypeRecommendations = require('../utils/archetypeRecommendations');
      const recommendations = ArchetypeRecommendations.getRecommendations(userData);

      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getMoodBasedRecommendations(req, res) {
    try {
      const { userId } = req.params;
      const { mood } = req.query;

      if (!mood) {
        return res.status(400).json({ error: 'mood query parameter is required (relaxed, excited, thoughtful, social)' });
      }

      const dataStore = await getDatabase();
      const userData = await dataStore.findUserById(userId);

      if (!userData) {
        return res.status(404).json({ error: 'User not found' });
      }

      const ArchetypeRecommendations = require('../utils/archetypeRecommendations');
      const recommendations = ArchetypeRecommendations.getMoodBasedRecommendations(userData, mood);

      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Quiz Feedback endpoints
  async submitQuizFeedback(req, res) {
    try {
      const { userId } = req.params;
      const feedback = req.body;

      const QuizEvolution = require('../utils/quizEvolution');
      const feedbackRecord = QuizEvolution.submitQuizFeedback({
        ...feedback,
        userId
      });

      // In production, this would be saved to database
      res.json({
        message: 'Quiz feedback submitted successfully',
        feedback: feedbackRecord
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async submitQuestionFeedback(req, res) {
    try {
      const { userId } = req.params;
      const { questionId, rating, comment } = req.body;

      if (!questionId || !rating) {
        return res.status(400).json({ error: 'questionId and rating are required' });
      }

      const QuizEvolution = require('../utils/quizEvolution');
      const feedbackRecord = QuizEvolution.submitQuestionFeedback(questionId, {
        rating,
        comment,
        userId
      });

      res.json({
        message: 'Question feedback submitted successfully',
        feedback: feedbackRecord
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Profile Frame endpoints
  async getAvailableFrames(req, res) {
    try {
      const { userId } = req.params;
      const dataStore = await getDatabase();
      const userData = await dataStore.findUserById(userId);

      if (!userData) {
        return res.status(404).json({ error: 'User not found' });
      }

      const { getAllFrameThemes, getFrameTheme } = require('../constants/profileFrames');
      
      // Get all available frames
      const allFrames = getAllFrameThemes();
      
      // Get user's archetype and recommended frame
      let recommendedFrame = null;
      if (userData.archetype && userData.archetype.type) {
        recommendedFrame = getFrameTheme(userData.archetype.type);
      }

      res.json({
        userId,
        archetype: userData.archetype,
        recommendedFrame: recommendedFrame ? {
          type: userData.archetype.type,
          ...recommendedFrame
        } : null,
        allFrames: Object.keys(allFrames).map(type => ({
          type,
          ...allFrames[type]
        })),
        currentFrame: userData.profileFrame
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateProfileFrame(req, res) {
    try {
      const { userId } = req.params;
      const { archetypeType, isActive } = req.body;

      if (!archetypeType) {
        return res.status(400).json({ error: 'archetypeType is required' });
      }

      const dataStore = await getDatabase();
      const userData = await dataStore.findUserById(userId);

      if (!userData) {
        return res.status(404).json({ error: 'User not found' });
      }

      const { hasFrameTheme, getFrameTheme } = require('../constants/profileFrames');

      // Validate that the archetype type has a corresponding frame theme
      if (!hasFrameTheme(archetypeType)) {
        return res.status(400).json({ 
          error: 'Frame theme not available for this archetype type',
          details: `The archetype type "${archetypeType}" does not have an associated frame theme. Please use a valid archetype type.`
        });
      }

      // Create User instance
      const user = new User(userData);

      // Update profile frame
      user.profileFrame = {
        archetypeType,
        isActive: isActive !== undefined ? isActive : true,
        selectedAt: new Date().toISOString()
      };

      // Save the updated user
      await this.saveUserData(userId, user);

      // Get the frame theme details
      const frameTheme = getFrameTheme(archetypeType);

      res.json({
        message: 'Profile frame updated successfully',
        profileFrame: user.profileFrame,
        frameTheme: {
          type: archetypeType,
          ...frameTheme
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async removeProfileFrame(req, res) {
    try {
      const { userId } = req.params;

      const dataStore = await getDatabase();
      const userData = await dataStore.findUserById(userId);

      if (!userData) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = new User(userData);
      user.profileFrame = null;

      await this.saveUserData(userId, user);

      res.json({
        message: 'Profile frame removed successfully',
        profileFrame: null
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Premium profile management endpoints
  async updatePremiumStatus(req, res) {
    try {
      const { userId } = req.params;
      const { isPremium } = req.body;

      if (!userId || typeof userId !== 'string' || userId.trim() === '') {
        return res.status(400).json({ error: 'Valid userId is required' });
      }

      if (typeof isPremium !== 'boolean') {
        return res.status(400).json({ error: 'isPremium must be a boolean value' });
      }

      const dataStore = await getDatabase();
      const userData = await dataStore.findUserById(userId);

      if (!userData) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = new User(userData);
      user.setPremiumStatus(isPremium);

      await this.saveUserData(userId, user);

      res.json({
        message: `Premium status updated successfully`,
        isPremium: user.isPremium,
        premiumSince: user.premiumSince,
        premiumFeatures: user.premiumFeatures
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getPremiumStatus(req, res) {
    try {
      const { userId } = req.params;

      if (!userId || typeof userId !== 'string' || userId.trim() === '') {
        return res.status(400).json({ error: 'Valid userId is required' });
      }

      const dataStore = await getDatabase();
      const userData = await dataStore.findUserById(userId);

      if (!userData) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = new User(userData);

      res.json({
        isPremium: user.isPremium,
        premiumSince: user.premiumSince,
        premiumFeatures: user.premiumFeatures
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async addPremiumFeature(req, res) {
    try {
      const { userId } = req.params;
      const { feature } = req.body;

      if (!userId || typeof userId !== 'string' || userId.trim() === '') {
        return res.status(400).json({ error: 'Valid userId is required' });
      }

      if (!feature || typeof feature !== 'string' || feature.trim() === '') {
        return res.status(400).json({ error: 'Valid feature name is required' });
      }

      const dataStore = await getDatabase();
      const userData = await dataStore.findUserById(userId);

      if (!userData) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = new User(userData);
      
      if (!user.isPremium) {
        return res.status(403).json({ error: 'User must have premium status to add features' });
      }

      user.addPremiumFeature(feature);

      await this.saveUserData(userId, user);

      res.json({
        message: 'Premium feature added successfully',
        premiumFeatures: user.premiumFeatures
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async activateBoost(req, res) {
    try {
      const { userId } = req.params;
      const { durationHours = 24 } = req.body;

      if (!userId || typeof userId !== 'string' || userId.trim() === '') {
        return res.status(400).json({ error: 'Valid userId is required' });
      }

      const dataStore = await getDatabase();
      const userData = await dataStore.findUserById(userId);

      if (!userData) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = new User(userData);
      
      if (!user.isPremium) {
        return res.status(403).json({ error: 'Boost feature is only available for premium users' });
      }

      const success = user.activateBoost(durationHours);
      
      if (!success) {
        return res.status(400).json({ error: 'Failed to activate boost' });
      }

      await this.saveUserData(userId, user);

      res.json({
        message: 'Profile boost activated successfully',
        profileBoosted: user.profileBoosted,
        boostExpiresAt: user.boostExpiresAt,
        durationHours
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getBoostStatus(req, res) {
    try {
      const { userId } = req.params;

      if (!userId || typeof userId !== 'string' || userId.trim() === '') {
        return res.status(400).json({ error: 'Valid userId is required' });
      }

      const dataStore = await getDatabase();
      const userData = await dataStore.findUserById(userId);

      if (!userData) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = new User(userData);

      res.json({
        profileBoosted: user.isBoostActive(),
        boostExpiresAt: user.boostExpiresAt,
        timeRemaining: user.getBoostTimeRemaining(),
        boostHistory: user.boostHistory
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // ========== STREAMING SERVICE USAGE TRACKING METHODS ==========

  /**
   * Get comprehensive viewing statistics for a user
   * GET /api/users/:userId/viewing-stats
   */
  async getViewingStatistics(req, res) {
    try {
      const { userId } = req.params;

      if (!userId || typeof userId !== 'string' || userId.trim() === '') {
        return res.status(400).json({ error: 'Valid userId is required' });
      }

      const dataStore = await getDatabase();
      const userData = await dataStore.findUserById(userId);

      if (!userData) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = new User(userData);
      const viewingStats = user.getViewingStatistics();

      res.json({
        userId: user.id,
        username: user.username,
        viewingStatistics: viewingStats
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get usage statistics for a specific streaming service
   * GET /api/users/:userId/streaming-services/:serviceName/stats
   */
  async getServiceUsageStats(req, res) {
    try {
      const { userId, serviceName } = req.params;

      if (!userId || typeof userId !== 'string' || userId.trim() === '') {
        return res.status(400).json({ error: 'Valid userId is required' });
      }

      if (!serviceName || typeof serviceName !== 'string' || serviceName.trim() === '') {
        return res.status(400).json({ error: 'Valid serviceName is required' });
      }

      const dataStore = await getDatabase();
      const userData = await dataStore.findUserById(userId);

      if (!userData) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = new User(userData);
      const serviceStats = user.getServiceUsageStats(serviceName);

      if (!serviceStats) {
        return res.status(404).json({ error: 'Streaming service not found for this user' });
      }

      res.json({
        userId: user.id,
        serviceStats
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Update usage statistics for a streaming service
   * PUT /api/users/:userId/streaming-services/:serviceName/usage
   * Body: { watchDuration, episodesWatched }
   */
  async updateServiceUsage(req, res) {
    try {
      const { userId, serviceName } = req.params;
      const { watchDuration, episodesWatched } = req.body;

      if (!userId || typeof userId !== 'string' || userId.trim() === '') {
        return res.status(400).json({ error: 'Valid userId is required' });
      }

      if (!serviceName || typeof serviceName !== 'string' || serviceName.trim() === '') {
        return res.status(400).json({ error: 'Valid serviceName is required' });
      }

      if (watchDuration !== undefined && (typeof watchDuration !== 'number' || watchDuration < 0)) {
        return res.status(400).json({ error: 'watchDuration must be a non-negative number' });
      }

      if (episodesWatched !== undefined && (typeof episodesWatched !== 'number' || episodesWatched < 0)) {
        return res.status(400).json({ error: 'episodesWatched must be a non-negative number' });
      }

      const dataStore = await getDatabase();
      const userData = await dataStore.findUserById(userId);

      if (!userData) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = new User(userData);
      
      // Check if service exists
      const service = user.streamingServices.find(s => s.name === serviceName);
      if (!service) {
        return res.status(404).json({ error: 'Streaming service not found for this user' });
      }

      // Update service usage stats
      user.updateServiceUsageStats(serviceName, {
        watchDuration: watchDuration || 0,
        episodesWatched: episodesWatched || 0
      });

      await this.saveUserData(userId, user);

      res.json({
        message: 'Service usage updated successfully',
        serviceStats: user.getServiceUsageStats(serviceName)
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new UserController();