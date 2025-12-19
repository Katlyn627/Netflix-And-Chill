const API_BASE_URL = 'http://localhost:3000/api';

class NetflixAndChillAPI {
    async createUser(userData) {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });
        return await response.json();
    }

    async loginUser(email, password) {
        const response = await fetch(`${API_BASE_URL}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        return await response.json();
    }

    async getUser(userId) {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`);
        return await response.json();
    }

    async updateBio(userId, bio) {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/bio`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ bio })
        });
        return await response.json();
    }

    async addStreamingService(userId, serviceName, serviceId, logoPath, logoUrl) {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/streaming-services`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ serviceName, serviceId, logoPath, logoUrl })
        });
        return await response.json();
    }

    async addWatchHistory(userId, watchData) {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/watch-history`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(watchData)
        });
        return await response.json();
    }

    async removeWatchHistory(userId, watchedAt) {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/watch-history`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ watchedAt })
        });
        return await response.json();
    }

    async updatePreferences(userId, preferences) {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/preferences`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(preferences)
        });
        return await response.json();
    }

    async findMatches(userId, limit = 10) {
        const response = await fetch(`${API_BASE_URL}/matches/${userId}?limit=${limit}`);
        return await response.json();
    }

    async getMatchHistory(userId) {
        const response = await fetch(`${API_BASE_URL}/matches/${userId}/history`);
        return await response.json();
    }

    async searchMoviesAndShows(query, type = 'multi') {
        const response = await fetch(`${API_BASE_URL}/streaming/search?query=${encodeURIComponent(query)}&type=${type}`);
        return await response.json();
    }

    async getPopularContent(type = 'movie') {
        const response = await fetch(`${API_BASE_URL}/streaming/popular?type=${type}`);
        return await response.json();
    }

    async addFavoriteMovie(userId, movieData) {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/favorite-movies`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(movieData)
        });
        return await response.json();
    }

    async getFavoriteMovies(userId) {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/favorite-movies`);
        return await response.json();
    }

    async removeFavoriteMovie(userId, movieId) {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/favorite-movies/${movieId}`, {
            method: 'DELETE'
        });
        return await response.json();
    }

    async getContentDetails(id, type = 'movie') {
        const response = await fetch(`${API_BASE_URL}/streaming/details/${id}?type=${type}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch content details: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    }

    async uploadProfilePicture(userId, profilePicture) {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/profile-picture`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ profilePicture })
        });
        return await response.json();
    }

    async addPhotoToGallery(userId, photoUrl) {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/photos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ photoUrl })
        });
        return await response.json();
    }

    async removePhotoFromGallery(userId, photoUrl) {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/photos`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ photoUrl })
        });
        return await response.json();
    }

    async updateProfileDetails(userId, updates) {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/profile-details`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates)
        });
        return await response.json();
    }

    async submitQuizResponses(userId, quizResponses) {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/quiz`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ quizResponses })
        });
        return await response.json();
    }

    async updatePassword(userId, currentPassword, newPassword) {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });
        return await response.json();
    }

    async resetPassword(email, newPassword) {
        const response = await fetch(`${API_BASE_URL}/users/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, newPassword })
        });
        return await response.json();
    }

    async deleteUser(userId) {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete user');
        }
        
        return await response.json();
    }

    async getGenres(type = null) {
        const url = type ? `${API_BASE_URL}/streaming/genres?type=${type}` : `${API_BASE_URL}/streaming/genres`;
        const response = await fetch(url);
        return await response.json();
    }

    async getStreamingProviders(region = 'US') {
        const response = await fetch(`${API_BASE_URL}/streaming/providers?region=${region}`);
        return await response.json();
    }

    async sendChatMessage(senderId, receiverId, message) {
        const response = await fetch(`${API_BASE_URL}/chat/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ senderId, receiverId, message })
        });
        return await response.json();
    }

    async getChatMessages(userId1, userId2) {
        const response = await fetch(`${API_BASE_URL}/chat/${userId1}/${userId2}`);
        return await response.json();
    }
}

const api = new NetflixAndChillAPI();
