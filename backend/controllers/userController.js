const User = require('../models/User');
const DataStore = require('../utils/dataStore');

const dataStore = new DataStore();

class UserController {
  async createUser(req, res) {
    try {
      const { username, email, age, location, bio, password } = req.body;

      // Check if user already exists
      const existingUser = await dataStore.findUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }

      // Validate password
      if (!password || password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
      }

      const user = new User({ username, email, age, location, bio, password });
      await dataStore.addUser(user);

      res.status(201).json({
        message: 'User created successfully',
        user: user.toJSON()
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async loginUser(req, res) {
    try {
      const { userId, password } = req.body;

      const user = await dataStore.findUserById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userObj = new User(user);
      if (!userObj.verifyPassword(password)) {
        return res.status(401).json({ error: 'Invalid password' });
      }

      res.json({
        message: 'Login successful',
        user: userObj.toJSON()
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getUser(req, res) {
    try {
      const { userId } = req.params;
      const user = await dataStore.findUserById(userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateBio(req, res) {
    try {
      const { userId } = req.params;
      const { bio } = req.body;

      const updatedUser = await dataStore.updateUser(userId, { bio });

      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        message: 'Bio updated successfully',
        user: updatedUser
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async addStreamingService(req, res) {
    try {
      const { userId } = req.params;
      const { serviceName } = req.body;

      const user = await dataStore.findUserById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userObj = new User(user);
      userObj.addStreamingService({ name: serviceName });

      const updatedUser = await dataStore.updateUser(userId, {
        streamingServices: userObj.streamingServices
      });

      res.json({
        message: 'Streaming service added successfully',
        user: updatedUser
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async addWatchHistory(req, res) {
    try {
      const { userId } = req.params;
      const { title, type, genre, service, episodesWatched } = req.body;

      const user = await dataStore.findUserById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userObj = new User(user);
      userObj.addToWatchHistory({ title, type, genre, service, episodesWatched });

      const updatedUser = await dataStore.updateUser(userId, {
        watchHistory: userObj.watchHistory
      });

      res.json({
        message: 'Watch history updated successfully',
        user: updatedUser
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updatePreferences(req, res) {
    try {
      const { userId } = req.params;
      const { genres, bingeWatchCount } = req.body;

      const user = await dataStore.findUserById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const updatedPreferences = {
        ...user.preferences,
        ...(genres && { genres }),
        ...(bingeWatchCount !== undefined && { bingeWatchCount })
      };

      const updatedUser = await dataStore.updateUser(userId, {
        preferences: updatedPreferences
      });

      res.json({
        message: 'Preferences updated successfully',
        user: updatedUser
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async uploadProfilePicture(req, res) {
    try {
      const { userId } = req.params;
      const { photoUrl } = req.body;

      if (!photoUrl) {
        return res.status(400).json({ error: 'Photo URL is required' });
      }

      const user = await dataStore.findUserById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const updatedUser = await dataStore.updateUser(userId, {
        profilePicture: photoUrl
      });

      res.json({
        message: 'Profile picture updated successfully',
        user: updatedUser
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

      const user = await dataStore.findUserById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userObj = new User(user);
      userObj.addPhoto(photoUrl);

      const updatedUser = await dataStore.updateUser(userId, {
        photoGallery: userObj.photoGallery
      });

      res.json({
        message: 'Photo added to gallery successfully',
        user: updatedUser
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

      const user = await dataStore.findUserById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userObj = new User(user);
      userObj.removePhoto(photoUrl);

      const updatedUser = await dataStore.updateUser(userId, {
        photoGallery: userObj.photoGallery
      });

      res.json({
        message: 'Photo removed from gallery successfully',
        user: updatedUser
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateProfileDetails(req, res) {
    try {
      const { userId } = req.params;
      const { leastFavoriteMovies, movieDebateTopics, favoriteSnacks, videoChatPreference } = req.body;

      const user = await dataStore.findUserById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const updates = {};
      if (leastFavoriteMovies !== undefined) updates.leastFavoriteMovies = leastFavoriteMovies;
      if (movieDebateTopics !== undefined) updates.movieDebateTopics = movieDebateTopics;
      if (favoriteSnacks !== undefined) updates.favoriteSnacks = favoriteSnacks;
      if (videoChatPreference !== undefined) updates.videoChatPreference = videoChatPreference;

      const updatedUser = await dataStore.updateUser(userId, updates);

      res.json({
        message: 'Profile details updated successfully',
        user: updatedUser
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async submitQuizResponses(req, res) {
    try {
      const { userId } = req.params;
      const { quizResponses } = req.body;

      if (!quizResponses || typeof quizResponses !== 'object') {
        return res.status(400).json({ error: 'Valid quiz responses object is required' });
      }

      const user = await dataStore.findUserById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const updatedUser = await dataStore.updateUser(userId, {
        quizResponses: { ...user.quizResponses, ...quizResponses }
      });

      res.json({
        message: 'Quiz responses submitted successfully',
        user: updatedUser
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new UserController();
