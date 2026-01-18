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
        if (filters.archetypePreference && filters.archetypePreference.length > 0) {
            url += `&archetypePreference=${encodeURIComponent(filters.archetypePreference.join(','))}`;
        }
        
        // Premium filters
        if (filters.premiumGenres && filters.premiumGenres.length > 0) {
            url += `&premiumGenres=${encodeURIComponent(filters.premiumGenres.join(','))}`;
        }
        if (filters.premiumBingeMin !== undefined) {
            url += `&premiumBingeMin=${encodeURIComponent(filters.premiumBingeMin)}`;
        }
        if (filters.premiumBingeMax !== undefined) {
            url += `&premiumBingeMax=${encodeURIComponent(filters.premiumBingeMax)}`;
        }
        if (filters.premiumServices && filters.premiumServices.length > 0) {
            url += `&premiumServices=${encodeURIComponent(filters.premiumServices.join(','))}`;
        }
        if (filters.premiumDecades && filters.premiumDecades.length > 0) {
            url += `&premiumDecades=${encodeURIComponent(filters.premiumDecades.join(','))}`;
        }
        if (filters.premiumMinScore) {
            url += `&premiumMinScore=${encodeURIComponent(filters.premiumMinScore)}`;
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

    async getUnreadMessageCounts(userId) {
        const response = await fetch(`${API_BASE_URL}/chat/unread/${userId}`);
        return await response.json();
    }

    async markMessagesAsRead(userId, senderId) {
        const response = await fetch(`${API_BASE_URL}/chat/read/${userId}/${senderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            }
        });
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

    async markLikeAsRead(likeId) {
        const response = await fetch(`${API_BASE_URL}/likes/${likeId}/read`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (!response.ok) {
            throw new Error('Failed to mark like as read');
        }
        return await response.json();
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

    async markInvitationAsRead(invitationId) {
        const response = await fetch(`${API_BASE_URL}/watch-invitations/${invitationId}/read`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (!response.ok) {
            throw new Error('Failed to mark invitation as read');
        }
        return await response.json();
    }
}

const api = new NetflixAndChillAPI();

// Export as global API for use in other scripts
const API = api;

// Make API_BASE_URL and api available globally
if (typeof window !== 'undefined') {
    window.API_BASE_URL = API_BASE_URL;
    window.api = api;
}
