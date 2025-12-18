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

    async addStreamingService(userId, serviceName) {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/streaming-services`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ serviceName })
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
}

const api = new NetflixAndChillAPI();
