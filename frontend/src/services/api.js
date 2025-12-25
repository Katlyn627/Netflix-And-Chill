const API_BASE_URL = 'http://localhost:3000/api';

class NetflixAndChillAPI {
    async createUser(userData) {
        try {
            const response = await fetch(`${API_BASE_URL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'User creation failed' }));
                throw new Error(errorData.error || `Server error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            // If it's a network error (server not running, CORS, etc.)
            if (error.message === 'Failed to fetch' || error.message === 'fetch failed' || error.cause?.code === 'ECONNREFUSED') {
                throw new Error('Unable to connect to server. Please make sure the backend server is running on port 3000.');
            }
            // Re-throw other errors
            throw error;
        }
    }

    async loginUser(email, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Login failed' }));
                throw new Error(errorData.error || `Server error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            // If it's a network error (server not running, CORS, etc.)
            if (error.message === 'Failed to fetch' || error.message === 'fetch failed' || error.cause?.code === 'ECONNREFUSED') {
                throw new Error('Unable to connect to server. Please make sure the backend server is running on port 3000.');
            }
            // Re-throw other errors
            throw error;
        }
    }

    async getUser(userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${userId}`);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Failed to fetch user' }));
                throw new Error(errorData.error || `Server error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            // If it's a network error (server not running, CORS, etc.)
            if (error.message === 'Failed to fetch' || error.message === 'fetch failed' || error.cause?.code === 'ECONNREFUSED') {
                throw new Error('Unable to connect to server. Please make sure the backend server is running on port 3000.');
            }
            // Re-throw other errors
            throw error;
        }
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

    async updateStreamingServices(userId, services) {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/streaming-services`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ services })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update streaming services');
        }
        
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

    async findMatches(userId, filters = {}) {
        let url = `${API_BASE_URL}/matches/${encodeURIComponent(userId)}?limit=10`;
        
        if (filters.minMatchScore) {
            url += `&minMatchScore=${encodeURIComponent(filters.minMatchScore)}`;
        }
        if (filters.minAge) {
            url += `&minAge=${encodeURIComponent(filters.minAge)}`;
        }
        if (filters.maxAge) {
            url += `&maxAge=${encodeURIComponent(filters.maxAge)}`;
        }
        if (filters.locationRadius) {
            url += `&locationRadius=${encodeURIComponent(filters.locationRadius)}`;
        }
        if (filters.genderPreference && filters.genderPreference.length > 0) {
            url += `&genderPreference=${encodeURIComponent(filters.genderPreference.join(','))}`;
        }
        if (filters.sexualOrientationPreference && filters.sexualOrientationPreference.length > 0) {
            url += `&sexualOrientationPreference=${encodeURIComponent(filters.sexualOrientationPreference.join(','))}`;
        }
        
        const response = await fetch(url);
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

    async getUserLikes(userId) {
        const response = await fetch(`${API_BASE_URL}/likes/${userId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch user likes');
        }
        const data = await response.json();
        
        // Fetch mutual likes
        const mutualResponse = await fetch(`${API_BASE_URL}/likes/${userId}/mutual`);
        if (!mutualResponse.ok) {
            throw new Error('Failed to fetch mutual likes');
        }
        const mutualData = await mutualResponse.json();
        
        return {
            likes: data.likes || [],
            mutual: mutualData.mutualLikes || []
        };
    }

    async createWatchInvitation(invitationData) {
        const response = await fetch(`${API_BASE_URL}/watch-invitations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(invitationData)
        });
        if (!response.ok) {
            throw new Error('Failed to create watch invitation');
        }
        return await response.json();
    }

    async getUserInvitations(userId) {
        const response = await fetch(`${API_BASE_URL}/watch-invitations/user/${userId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch user invitations');
        }
        return await response.json();
    }

    async getWatchInvitation(invitationId) {
        const response = await fetch(`${API_BASE_URL}/watch-invitations/${invitationId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch invitation');
        }
        return await response.json();
    }

    async updateWatchInvitation(invitationId, updates) {
        const response = await fetch(`${API_BASE_URL}/watch-invitations/${invitationId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates)
        });
        if (!response.ok) {
            throw new Error('Failed to update invitation');
        }
        return await response.json();
    }

    async deleteWatchInvitation(invitationId) {
        const response = await fetch(`${API_BASE_URL}/watch-invitations/${invitationId}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error('Failed to delete invitation');
        }
        return await response.json();
    }
}

const api = new NetflixAndChillAPI();

// Export as global API for use in other scripts
const API = api;

// Make API_BASE_URL available globally
if (typeof window !== 'undefined') {
    window.API_BASE_URL = API_BASE_URL;
}
