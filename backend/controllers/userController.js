const User = require('../models/User');
const DataStore = require('../utils/dataStore');

const dataStore = new DataStore();

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
    const userDataToStore = { ...user.toJSON(), password: user.password };
    return await dataStore.updateUser(userId, userDataToStore);
  }

  async createUser(req, res) {
    try {
      const { username, email, password, age, location, bio } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email, and password are required' });
      }

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
        bio
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
      const { serviceName } = req.body;

      if (!serviceName) {
        return res.status(400).json({ error: 'Service name is required' });
      }

      const userData = await dataStore.findUserById(userId);
      if (!userData) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = new User(userData);
      user.addStreamingService({ name: serviceName });

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
      const { title, type, genre, service, episodesWatched } = req.body;

      if (!title || !type) {
        return res.status(400).json({ error: 'Title and type are required' });
      }

      const userData = await dataStore.findUserById(userId);
      if (!userData) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = new User(userData);
      user.addToWatchHistory({ title, type, genre, service, episodesWatched });

      await this.saveUserData(userId, user);

      res.json({
        message: 'Watch history updated successfully',
        user: this.filterSensitiveData(user)
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updatePreferences(req, res) {
    try {
      const { userId } = req.params;
      const { genres, bingeWatchCount, ageRange, locationRadius } = req.body;

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

      const userData = await dataStore.findUserById(userId);
      if (!userData) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = new User(userData);

      // Update allowed fields
      const allowedFields = [
        'leastFavoriteMovies',
        'movieDebateTopics',
        'favoriteSnacks',
        'videoChatPreference'
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
      const { quizResponses } = req.body;

      if (!quizResponses) {
        return res.status(400).json({ error: 'Quiz responses are required' });
      }

      const userData = await dataStore.findUserById(userId);
      if (!userData) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = new User(userData);
      user.quizResponses = { ...user.quizResponses, ...quizResponses };

      await this.saveUserData(userId, user);

      res.json({
        message: 'Quiz responses submitted successfully',
        user: this.filterSensitiveData(user)
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
}

module.exports = new UserController();