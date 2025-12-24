import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// API base URL configuration
// TODO: Set up environment variables for production deployment
// For development: localhost works for iOS simulator, use 10.0.2.2 for Android emulator
// For physical devices: use your computer's IP address (e.g., 192.168.1.100)
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api'
  : Constants.expoConfig?.extra?.apiUrl || 'https://your-production-api.herokuapp.com/api';

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // User endpoints
  async createUser(userData) {
    try {
      const response = await this.client.post('/users', userData);
      if (response.data.user?.id) {
        await this.saveUserId(response.data.user.id);
      }
      return response.data;
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  }

  async getUser(userId) {
    try {
      const response = await this.client.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  }

  async updateBio(userId, bio) {
    try {
      const response = await this.client.put(`/users/${userId}/bio`, { bio });
      return response.data;
    } catch (error) {
      console.error('Update bio error:', error);
      throw error;
    }
  }

  async addStreamingService(userId, serviceName) {
    try {
      const response = await this.client.post(
        `/users/${userId}/streaming-services`,
        { serviceName }
      );
      return response.data;
    } catch (error) {
      console.error('Add streaming service error:', error);
      throw error;
    }
  }

  async addWatchHistory(userId, item) {
    try {
      const response = await this.client.post(
        `/users/${userId}/watch-history`,
        item
      );
      return response.data;
    } catch (error) {
      console.error('Add watch history error:', error);
      throw error;
    }
  }

  async updatePreferences(userId, preferences) {
    try {
      const response = await this.client.put(
        `/users/${userId}/preferences`,
        preferences
      );
      return response.data;
    } catch (error) {
      console.error('Update preferences error:', error);
      throw error;
    }
  }

  async updateProfile(userId, updates) {
    try {
      const response = await this.client.put(`/users/${userId}`, updates);
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  // Match endpoints
  async findMatches(userId, filters = {}) {
    try {
      const response = await this.client.get(`/matches/find/${userId}`, {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Find matches error:', error);
      throw error;
    }
  }

  async getMatchHistory(userId) {
    try {
      const response = await this.client.get(`/matches/${userId}/history`);
      return response.data;
    } catch (error) {
      console.error('Get match history error:', error);
      throw error;
    }
  }

  // Recommendation endpoints
  async getRecommendations(userId, limit = 10) {
    try {
      const response = await this.client.get(`/recommendations/${userId}`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Get recommendations error:', error);
      throw error;
    }
  }

  // Like endpoints
  async sendLike(fromUserId, toUserId, type = 'like') {
    try {
      const response = await this.client.post('/likes', {
        fromUserId,
        toUserId,
        type
      });
      return response.data;
    } catch (error) {
      console.error('Send like error:', error);
      throw error;
    }
  }

  async getLikes(userId) {
    try {
      const response = await this.client.get(`/likes/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get likes error:', error);
      throw error;
    }
  }

  async getMutualLikes(userId) {
    try {
      const response = await this.client.get(`/likes/${userId}/mutual`);
      return response.data;
    } catch (error) {
      console.error('Get mutual likes error:', error);
      throw error;
    }
  }

  // Chat endpoints
  async sendMessage(fromUserId, toUserId, message) {
    try {
      const response = await this.client.post('/chat/send', {
        fromUserId,
        toUserId,
        message
      });
      return response.data;
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  }

  async getChatHistory(userId1, userId2) {
    try {
      const response = await this.client.get(`/chat/${userId1}/${userId2}`);
      return response.data;
    } catch (error) {
      console.error('Get chat history error:', error);
      throw error;
    }
  }

  // Streaming API endpoints
  async searchMovies(query) {
    try {
      const response = await this.client.get('/streaming/search', {
        params: { query, type: 'movie' }
      });
      return response.data;
    } catch (error) {
      console.error('Search movies error:', error);
      throw error;
    }
  }

  async searchShows(query) {
    try {
      const response = await this.client.get('/streaming/search', {
        params: { query, type: 'tv' }
      });
      return response.data;
    } catch (error) {
      console.error('Search shows error:', error);
      throw error;
    }
  }

  // Swipe endpoints
  async getSwipeMovies(userId, limit = 50, page = 1) {
    try {
      const response = await this.client.get(`/swipe/movies/${userId}`, {
        params: { limit, page }
      });
      return response.data;
    } catch (error) {
      console.error('Get swipe movies error:', error);
      throw error;
    }
  }

  async swipeMovie(userId, movieId, action) {
    try {
      const response = await this.client.post('/swipe/action', {
        userId,
        movieId,
        action
      });
      return response.data;
    } catch (error) {
      console.error('Swipe movie error:', error);
      throw error;
    }
  }

  async getSwipeStats(userId) {
    try {
      const response = await this.client.get(`/swipe/stats/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get swipe stats error:', error);
      throw error;
    }
  }

  async getSwipeAnalytics(userId) {
    try {
      const response = await this.client.get(`/swipe/analytics/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get swipe analytics error:', error);
      throw error;
    }
  }

  // Quiz endpoints
  async getQuizOptions() {
    try {
      const response = await this.client.get('/users/quiz/options');
      return response.data;
    } catch (error) {
      console.error('Get quiz options error:', error);
      throw error;
    }
  }

  async submitQuiz(userId, responses) {
    try {
      const response = await this.client.put(`/users/${userId}/quiz`, responses);
      return response.data;
    } catch (error) {
      console.error('Submit quiz error:', error);
      throw error;
    }
  }

  async getQuizAttempts(userId) {
    try {
      const response = await this.client.get(`/users/${userId}/quiz/attempts`);
      return response.data;
    } catch (error) {
      console.error('Get quiz attempts error:', error);
      throw error;
    }
  }

  // Watch Together endpoints
  async getWatchInvitations(userId) {
    try {
      const response = await this.client.get(`/watchInvitations/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get watch invitations error:', error);
      throw error;
    }
  }

  async createWatchInvitation(invitationData) {
    try {
      const response = await this.client.post('/watchInvitations', invitationData);
      return response.data;
    } catch (error) {
      console.error('Create watch invitation error:', error);
      throw error;
    }
  }

  async respondToInvitation(invitationId, response) {
    try {
      const result = await this.client.put(`/watchInvitations/${invitationId}/respond`, { response });
      return result.data;
    } catch (error) {
      console.error('Respond to invitation error:', error);
      throw error;
    }
  }

  // Storage helpers
  async saveUserId(userId) {
    try {
      await AsyncStorage.setItem('userId', userId.toString());
    } catch (error) {
      console.error('Save userId error:', error);
    }
  }

  async getUserId() {
    try {
      return await AsyncStorage.getItem('userId');
    } catch (error) {
      console.error('Get userId error:', error);
      return null;
    }
  }

  async clearUserId() {
    try {
      await AsyncStorage.removeItem('userId');
    } catch (error) {
      console.error('Clear userId error:', error);
    }
  }

  async saveOnboardingComplete() {
    try {
      await AsyncStorage.setItem('onboardingComplete', 'true');
    } catch (error) {
      console.error('Save onboarding error:', error);
    }
  }

  async isOnboardingComplete() {
    try {
      const value = await AsyncStorage.getItem('onboardingComplete');
      return value === 'true';
    } catch (error) {
      console.error('Check onboarding error:', error);
      return false;
    }
  }
}

export default new ApiService();
