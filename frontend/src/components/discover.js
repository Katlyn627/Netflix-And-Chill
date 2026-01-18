/**
 * Discover Page Component - Bumble Style
 * Shows categorized user recommendations
 */

class DiscoverPage {
    constructor() {
        this.userId = localStorage.getItem('currentUserId');
        this.allMatches = [];
        this.likedUsers = new Set();
        this.init();
    }

    async init() {
        if (!this.userId) {
            window.location.href = 'login.html';
            return;
        }

        await this.loadAllData();
        this.renderCategories();
        this.attachEventListeners();
    }

    async loadAllData() {
        const loading = document.getElementById('discover-loading');
        if (loading) loading.style.display = 'block';

        try {
            // Fetch matches
            const matchesResponse = await fetch(`http://localhost:3000/api/matches/find/${this.userId}`);
            if (matchesResponse.ok) {
                this.allMatches = await matchesResponse.json();
            }

            // Fetch liked users
            const likesResponse = await fetch(`http://localhost:3000/api/likes/${this.userId}`);
            if (likesResponse.ok) {
                const likesData = await likesResponse.json();
                this.likedUsers = new Set(likesData.map(like => like.toUserId));
            }
        } catch (error) {
            console.error('Error loading discover data:', error);
        } finally {
            if (loading) loading.style.display = 'none';
        }
    }

    renderCategories() {
        // Sort matches by score
        const sortedMatches = [...this.allMatches].sort((a, b) => b.score - a.score);

        // Recommended for you (top matches)
        const recommended = sortedMatches.slice(0, 10);
        this.renderCards('recommended-cards', recommended);

        // Similar interests (users with shared favorite genres)
        const similarInterests = this.filterBySharedGenres(sortedMatches).slice(0, 10);
        this.renderCards('similar-interests-cards', similarInterests);

        // Similar genres (users with matching genre preferences)
        const similarGenres = this.filterByGenrePreferences(sortedMatches).slice(0, 10);
        this.renderCards('similar-genres-cards', similarGenres);

        // Similar binge amounts (users with similar binge patterns)
        const similarBinge = this.filterByBingePatterns(sortedMatches).slice(0, 10);
        this.renderCards('similar-binge-cards', similarBinge);
    }

    filterBySharedGenres(matches) {
        // Filter matches that have shared favorite movies/genres
        return matches.filter(match => {
            const sharedContent = match.sharedContent || [];
            return sharedContent.length > 0;
        });
    }

    filterByGenrePreferences(matches) {
        // Filter by matching genre preferences
        return matches.filter(match => {
            return match.user && match.user.preferences && match.user.preferences.genres;
        });
    }

    filterByBingePatterns(matches) {
        // Filter by similar binge patterns
        return matches.filter(match => {
            return match.user && match.user.preferences && match.user.preferences.bingeCount;
        });
    }

    renderCards(containerId, matches) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (matches.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No matches found in this category yet. Keep swiping!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = matches.map(match => this.createCard(match)).join('');
    }

    createCard(match) {
        const user = match.user;
        if (!user) return '';

        const isLiked = this.likedUsers.has(user.id);
        const profilePicture = user.profilePicture || user.photos?.[0]?.url || 'assets/images/default-avatar.png';
        const age = user.age || '?';
        const location = user.location || 'Location not set';
        const matchScore = Math.round(match.score || 0);
        
        // Get movie preferences/genres as tags
        const genres = user.preferences?.genres || [];
        const genreTags = genres.slice(0, 3).map(genre => 
            `<span class="movie-tag">${genre}</span>`
        ).join('');

        // Get streaming services
        const streamingServices = user.streamingServices || [];
        const serviceTags = streamingServices.slice(0, 2).map(service => 
            `<span class="movie-tag">${service}</span>`
        ).join('');

        return `
            <div class="discover-profile-card" data-user-id="${user.id}">
                <div class="discover-card-image">
                    <img src="${profilePicture}" alt="${user.username}" onerror="this.src='assets/images/default-avatar.png'">
                    <div class="card-image-overlay">
                        <div class="movie-preferences-tags">
                            ${genreTags}
                            ${serviceTags}
                        </div>
                    </div>
                </div>
                <div class="discover-card-info">
                    <div class="card-user-name">
                        <h3>${user.username}, ${age}</h3>
                        ${user.verified ? '<span class="verification-badge">✓</span>' : ''}
                    </div>
                    <div class="card-user-details">${location}</div>
                    <div class="card-match-score">${matchScore}% Match</div>
                    <div class="card-actions">
                        <button class="heart-btn ${isLiked ? 'liked' : ''}" data-user-id="${user.id}" onclick="window.discoverPage.handleLike('${user.id}')">
                            ${isLiked ? '❤️' : '🤍'}
                        </button>
                        <button class="info-btn" onclick="window.discoverPage.viewProfile('${user.id}')">
                            ℹ️
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    async handleLike(userId) {
        try {
            const isLiked = this.likedUsers.has(userId);
            
            if (!isLiked) {
                // Send like
                const response = await fetch('http://localhost:3000/api/likes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fromUserId: this.userId,
                        toUserId: userId,
                        type: 'like'
                    })
                });

                if (response.ok) {
                    this.likedUsers.add(userId);
                    // Update button
                    const button = document.querySelector(`.heart-btn[data-user-id="${userId}"]`);
                    if (button) {
                        button.classList.add('liked');
                        button.textContent = '❤️';
                    }

                    // Check for match
                    const result = await response.json();
                    if (result.match) {
                        this.showMatchNotification(userId);
                    }
                }
            }
        } catch (error) {
            console.error('Error handling like:', error);
        }
    }

    showMatchNotification(userId) {
        // Show a match notification
        alert('It\'s a match! 🎉 You can now chat with this user.');
    }

    viewProfile(userId) {
        // Navigate to user profile view
        window.location.href = `profile-view.html?userId=${userId}`;
    }

    attachEventListeners() {
        // Settings button
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                window.location.href = 'profile-view.html';
            });
        }

        // Notifications button
        const notificationsBtn = document.getElementById('notifications-btn');
        if (notificationsBtn) {
            notificationsBtn.addEventListener('click', () => {
                alert('Notifications feature coming soon!');
            });
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    window.discoverPage = new DiscoverPage();
});
