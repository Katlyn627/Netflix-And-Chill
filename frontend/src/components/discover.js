/**
 * Discover Page Component - Bumble Style
 * Shows categorized user recommendations
 */

class DiscoverPage {
    constructor() {
        this.userId = localStorage.getItem('currentUserId');
        this.allMatches = [];
        this.likedUsers = new Set();
        this.apiBaseUrl = window.API_BASE_URL || 'http://localhost:3000/api';
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
                const matchesData = await matchesResponse.json();
                // Handle both array and object responses
                this.allMatches = Array.isArray(matchesData) ? matchesData : (matchesData.matches || []);
            } else {
                this.allMatches = [];
            }

            // Fetch liked users
            const likesResponse = await fetch(`http://localhost:3000/api/likes/${this.userId}`);
            if (likesResponse.ok) {
                const likesData = await likesResponse.json();
                // Handle both array and object responses
                const likesArray = Array.isArray(likesData) ? likesData : (likesData.likes || []);
                this.likedUsers = new Set(likesArray.map(like => like.toUserId));
            }
        } catch (error) {
            console.error('Error loading discover data:', error);
        } finally {
            if (loading) loading.style.display = 'none';
        }
    }

    renderCategories() {
        // Ensure allMatches is an array
        if (!Array.isArray(this.allMatches)) {
            console.warn('allMatches is not an array:', this.allMatches);
            this.allMatches = [];
        }

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

    async viewProfile(userId) {
        // Show modal with basic user info instead of navigating to profile-view.html
        try {
            const response = await fetch(`${this.apiBaseUrl}/users/${userId}`);
            if (!response.ok) throw new Error('Failed to load user');
            
            const user = await response.json();
            this.showUserInfoModal(user);
        } catch (error) {
            console.error('Error loading user:', error);
            alert('Failed to load user information. Please try again.');
        }
    }

    showUserInfoModal(user) {
        // Create and show modal with basic user information
        const existingModal = document.getElementById('user-info-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // Helper function to escape HTML
        const escapeHtml = (text) => {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        };

        const modal = document.createElement('div');
        modal.id = 'user-info-modal';
        modal.className = 'modal';
        modal.style.display = 'block';
        
        const profilePicture = user.profilePicture || user.photos?.[0]?.url || 'assets/images/default-avatar.png';
        const age = user.age || 'N/A';
        const location = escapeHtml(user.location || 'Not specified');
        const bio = escapeHtml(user.bio || 'No bio available');
        const username = escapeHtml(user.username || 'Unknown');
        const genres = user.preferences?.genres || [];
        const streamingServices = user.streamingServices || [];
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 style="margin: 0;">User Info</h2>
                    <button id="close-user-info-modal" class="btn btn-secondary" style="padding: 8px 15px;">Close</button>
                </div>
                
                <div style="text-align: center; margin-bottom: 20px;">
                    <img src="${escapeHtml(profilePicture)}" alt="${username}" 
                         style="width: 150px; height: 150px; border-radius: 10px; object-fit: cover;"
                         onerror="this.src='assets/images/default-avatar.png'">
                </div>
                
                <div style="margin-bottom: 15px;">
                    <h3 style="margin: 0 0 10px 0;">${username}, ${escapeHtml(String(age))}</h3>
                    <p style="color: #666; margin: 5px 0;"><strong>Location:</strong> ${location}</p>
                    ${user.gender ? `<p style="color: #666; margin: 5px 0;"><strong>Gender:</strong> ${escapeHtml(user.gender.charAt(0).toUpperCase() + user.gender.slice(1))}</p>` : ''}
                    ${user.sexualOrientation ? `<p style="color: #666; margin: 5px 0;"><strong>Orientation:</strong> ${escapeHtml(user.sexualOrientation.charAt(0).toUpperCase() + user.sexualOrientation.slice(1))}</p>` : ''}
                </div>
                
                <div style="margin-bottom: 15px;">
                    <p style="font-style: italic; color: #888;">"${bio}"</p>
                </div>
                
                ${genres.length > 0 ? `
                <div style="margin-bottom: 15px;">
                    <strong>Favorite Genres:</strong>
                    <div style="margin-top: 8px;">
                        ${genres.map(genre => `<span style="display: inline-block; background: #E50914; color: white; padding: 4px 10px; border-radius: 15px; margin: 3px; font-size: 0.85em;">${escapeHtml(String(genre))}</span>`).join('')}
                    </div>
                </div>
                ` : ''}
                
                ${streamingServices.length > 0 ? `
                <div style="margin-bottom: 15px;">
                    <strong>Streaming Services:</strong>
                    <div style="margin-top: 8px;">
                        ${streamingServices.map(service => `<span style="display: inline-block; background: #333; color: white; padding: 4px 10px; border-radius: 15px; margin: 3px; font-size: 0.85em;">${escapeHtml(String(service))}</span>`).join('')}
                    </div>
                </div>
                ` : ''}
                
                ${user.preferences?.bingeCount ? `
                <div style="margin-bottom: 15px;">
                    <p style="color: #666;"><strong>Binge Watch Episodes:</strong> ${escapeHtml(String(user.preferences.bingeCount))} per session</p>
                </div>
                ` : ''}
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close modal handler
        const closeBtn = document.getElementById('close-user-info-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.remove();
            });
        }
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
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
