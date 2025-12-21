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
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const dataStore = await getDatabase();
      const userData = await dataStore.findUserByEmail(email);
      if (!userData) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const user = new User(userData);
      if (!user.verifyPassword(password)) {
        return res.status(401).json({ error: 'Invalid email or password' });
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

  async addWatchHistory(req, res) {
    try {
      const { userId } = req.params;
      const { title, type, genre, service, episodesWatched, posterPath, tmdbId } = req.body;

      if (!title || !type) {
        return res.status(400).json({ error: 'Title and type are required' });
      }

      const dataStore = await getDatabase();
      const userData = await dataStore.findUserById(userId);
      if (!userData) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = new User(userData);
      user.addToWatchHistory({ title, type, genre, service, episodesWatched, posterPath, tmdbId });

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

      // Support both old format (quizResponses) and new format (answers)
      const quizAnswers = answers || quizResponses;

      if (!quizAnswers) {
        return res.status(400).json({ error: 'Quiz responses are required' });
      }

      const dataStore = await getDatabase();
      const userData = await dataStore.findUserById(userId);
      if (!userData) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = new User(userData);
      
      // If using old format, maintain backward compatibility
      if (quizResponses && !answers) {
        user.quizResponses = { ...user.quizResponses, ...quizResponses };
      }
      
      // If using new format with answer array, process quiz completion
      if (answers && Array.isArray(answers)) {
        const MovieQuizScoring = require('../utils/movieQuizScoring');
        
        // Process quiz completion
        const quizAttempt = MovieQuizScoring.processQuizCompletion(userId, answers);
        
        // Add to user's quiz attempts
        if (!user.quizAttempts) {
          user.quizAttempts = [];
        }
        user.quizAttempts.push(quizAttempt.toJSON());
        
        // Update personality profile with latest quiz results
        user.personalityProfile = quizAttempt.personalityTraits;
        
        // Generate and save personality bio
        user.personalityBio = MovieQuizScoring.generatePersonalityBio(quizAttempt.personalityTraits);
        
        // Update last quiz completed timestamp
        user.lastQuizCompletedAt = quizAttempt.completedAt;
      }

      await this.saveUserData(userId, user);

      res.json({
        message: 'Quiz responses submitted successfully',
        user: this.filterSensitiveData(user),
        personalityProfile: user.personalityProfile,
        personalityBio: user.personalityBio
      });
    } catch (error) {
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
}

module.exports = new UserController();