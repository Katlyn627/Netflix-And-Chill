/**
 * Liked You Page Component - Bumble Style
 * Shows users who have liked the current user
 */

class LikedYouPage {
    constructor() {
        this.userId = localStorage.getItem('currentUserId');
        this.isPremium = false;
        this.likes = [];
        this.apiBaseUrl = window.API_BASE_URL || 'http://localhost:3000/api';
        this.init();
    }

    async init() {
        if (!this.userId) {
            window.location.href = 'login.html';
            return;
        }

        await this.loadUserData();
        await this.loadLikes();
        this.render();
        this.attachEventListeners();
    }

    async loadUserData() {
        try {
            const response = await fetch(`http://localhost:3000/api/users/${this.userId}`);
            if (response.ok) {
                const user = await response.json();
                this.isPremium = user.isPremium || false;
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    async loadLikes() {
        const loading = document.getElementById('liked-you-loading');
        if (loading) loading.style.display = 'block';

        try {
            const response = await fetch(`http://localhost:3000/api/likes/${this.userId}/received`);
            if (response.ok) {
                const data = await response.json();
                this.likes = data.likes || [];
                
                // Update likes count
                const countElement = document.getElementById('likes-count');
                if (countElement) {
                    countElement.textContent = data.count || 0;
                }
                
                // Mark all unread likes as read (only for premium users who can see them)
                if (this.isPremium && this.likes.length > 0) {
                    this.markLikesAsRead();
                }
            }
        } catch (error) {
            console.error('Error loading likes:', error);
        } finally {
            if (loading) loading.style.display = 'none';
        }
    }

    async markLikesAsRead() {
        // Mark each unread like as read
        for (const like of this.likes) {
            if (!like.read) {
                try {
                    await API.markLikeAsRead(like.id);
                } catch (error) {
                    console.error('Error marking like as read:', error);
                }
            }
        }
        
        // Update global notification manager if available
        if (window.notificationManager) {
            await window.notificationManager.fetchAndUpdate();
        }
        
        // Also update bottom nav if available
        if (window.bottomNav) {
            await window.bottomNav.fetchNotificationCounts();
            window.bottomNav.updateNotificationBadges();
        }
    }

    render() {
        // Show/hide premium upsell
        const upsellBanner = document.getElementById('premium-upsell');
        if (upsellBanner) {
            upsellBanner.style.display = this.isPremium ? 'none' : 'block';
        }

        // Render likes grid
        this.renderLikesGrid();
    }

    renderLikesGrid() {
        const grid = document.getElementById('likes-grid');
        const emptyState = document.getElementById('empty-state');
        
        if (!grid) return;

        if (this.likes.length === 0) {
            grid.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        grid.innerHTML = this.likes.map(like => this.createLikeCard(like)).join('');
    }

    createLikeCard(like) {
        const user = like.fromUser;
        if (!user) return '';

        const isBlurred = !this.isPremium;
        const profilePicture = user.profilePicture || user.photos?.[0]?.url || 'assets/images/default-avatar.png';
        const age = user.age || '?';
        const location = user.location || 'Location not set';

        // For blurred cards (free users)
        if (isBlurred) {
            return `
                <div class="liked-profile-card blurred" 
                     data-user-id="${user.id}"
                     onclick="window.likedYouPage.handleCardClick('${user.id}')">
                    <div class="liked-card-image">
                        <img src="${profilePicture}" alt="${user.username}" onerror="this.src='assets/images/default-avatar.png'">
                        <div class="blur-overlay">🔒</div>
                    </div>
                    <div class="liked-card-info">
                        <div class="liked-card-name">Premium User</div>
                        <div class="liked-card-details">Upgrade to see</div>
                    </div>
                </div>
            `;
        }

        // For premium users - show detailed information
        const matchScore = like.matchScore || 0;
        
        // Get movie personality (archetype)
        const archetype = user.archetype;
        const personalityText = archetype ? `${archetype.name || archetype.type || 'Movie Lover'}` : '';
        
        // Get favorite genres from swipe analytics (preferred) or fall back to preferences
        let genreTags = '';
        if (user.swipePreferences && user.swipePreferences.topGenres && user.swipePreferences.topGenres.length > 0) {
            // Use favorite genres from swipe analytics - shows actual behavior
            const favoriteGenres = user.swipePreferences.topGenres.slice(0, 3);
            genreTags = favoriteGenres.map(genreObj => 
                `<span class="movie-tag">❤️ ${genreObj.genre}</span>`
            ).join('');
        } else {
            // Fallback to preference genres if no swipe data
            const genres = user.preferences?.genres || [];
            genreTags = genres.slice(0, 3).map(genre => 
                `<span class="movie-tag">${genre.name || genre}</span>`
            ).join('');
        }

        // Get streaming services
        const streamingServices = user.streamingServices || [];
        const serviceTags = streamingServices.filter(s => s && (s.name || s)).slice(0, 2).map(service => {
            const serviceName = service.name || service;
            return `<span class="movie-tag">${serviceName}</span>`;
        }).join('');

        // Get binge count
        const bingeCount = user.preferences?.bingeWatchCount || user.preferences?.bingeCount || 0;
        const bingeText = bingeCount > 0 ? `${bingeCount} eps/session` : '';

        return `
            <div class="liked-profile-card-detailed" data-user-id="${user.id}">
                <div class="liked-card-image-detailed">
                    <img src="${profilePicture}" alt="${user.username}" onerror="this.src='assets/images/default-avatar.png'">
                    <div class="card-image-overlay">
                        <div class="movie-preferences-tags">
                            ${genreTags}
                            ${serviceTags}
                        </div>
                    </div>
                </div>
                <div class="liked-card-info-detailed">
                    <div class="card-user-name">
                        <h3>${user.username}, ${age}</h3>
                        ${user.verified ? '<span class="verification-badge">✓</span>' : ''}
                    </div>
                    <div class="card-user-details">${location}</div>
                    ${personalityText ? `<div class="card-personality">🎬 ${personalityText}</div>` : ''}
                    ${bingeText ? `<div class="card-binge">📺 ${bingeText}</div>` : ''}
                    ${matchScore > 0 ? `<div class="card-match-score">${Math.round(matchScore)}% Match</div>` : ''}
                    <div class="card-actions">
                        <button class="chat-btn" onclick="event.stopPropagation(); window.likedYouPage.startChat('${user.id}')" title="Start Chat">
                            💬 Chat
                        </button>
                        <button class="watch-btn" onclick="event.stopPropagation(); window.likedYouPage.sendWatchInvitation('${user.id}')" title="Send Watch Invitation">
                            🎬 Watch
                        </button>
                        <button class="info-btn" onclick="event.stopPropagation(); window.likedYouPage.viewProfile('${user.id}')" title="View Full Profile">
                            ℹ️
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    handleCardClick(userId) {
        if (!this.isPremium) {
            this.upgradeToPremium();
            return;
        }

        // Show modal with basic user info instead of navigating to profile-view.html
        this.viewProfile(userId);
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
        
        // Get favorite genres from swipe analytics (preferred) or fall back to preferences
        let favoriteGenres = [];
        let genreSource = '';
        if (user.swipePreferences && user.swipePreferences.topGenres && user.swipePreferences.topGenres.length > 0) {
            // Use favorite genres from swipe analytics - shows actual behavior
            favoriteGenres = user.swipePreferences.topGenres.slice(0, 5);
            genreSource = 'Based on viewing activity';
        } else {
            // Fallback to preference genres if no swipe data
            const prefGenres = user.preferences?.genres || [];
            favoriteGenres = prefGenres.map(g => ({ genre: g.name || g, count: 0, percentage: 0 }));
            genreSource = prefGenres.length > 0 ? 'Preferences' : '';
        }
        
        const streamingServices = user.streamingServices || [];
        const archetype = user.archetype;
        const personalityBio = user.personalityBio;
        const bingeCount = user.preferences?.bingeWatchCount || user.preferences?.bingeCount || 0;
        
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
                
                ${archetype ? `
                <div style="margin-bottom: 15px; padding: 10px; background: #f5f5f5; border-radius: 8px;">
                    <strong>🎬 Movie Personality:</strong> ${escapeHtml(archetype.name || archetype.type || 'Movie Lover')}
                    ${archetype.description ? `<p style="margin: 5px 0 0 0; font-size: 0.9em; color: #666;">${escapeHtml(archetype.description)}</p>` : ''}
                </div>
                ` : ''}
                
                ${personalityBio ? `
                <div style="margin-bottom: 15px;">
                    <p style="color: #666; font-size: 0.95em;">${escapeHtml(personalityBio)}</p>
                </div>
                ` : ''}
                
                ${favoriteGenres.length > 0 ? `
                <div style="margin-bottom: 15px;">
                    <strong>❤️ Favorite Genres:</strong> ${genreSource ? `<small style="color: #999;">(${genreSource})</small>` : ''}
                    <div style="margin-top: 8px;">
                        ${favoriteGenres.map(genreObj => {
                            const genreName = typeof genreObj === 'string' ? genreObj : genreObj.genre;
                            const percentage = genreObj.percentage || 0;
                            const showPercentage = percentage > 0 ? ` ${percentage}%` : '';
                            return `<span style="display: inline-block; background: #E50914; color: white; padding: 4px 10px; border-radius: 15px; margin: 3px; font-size: 0.85em;">${escapeHtml(String(genreName))}${showPercentage}</span>`;
                        }).join('')}
                    </div>
                </div>
                ` : ''}
                
                ${streamingServices.length > 0 ? `
                <div style="margin-bottom: 15px;">
                    <strong>Streaming Services:</strong>
                    <div style="margin-top: 8px;">
                        ${streamingServices.filter(s => s && (s.name || s)).map(service => {
                            const serviceName = service.name || service;
                            return `<span style="display: inline-block; background: #333; color: white; padding: 4px 10px; border-radius: 15px; margin: 3px; font-size: 0.85em;">${escapeHtml(String(serviceName))}</span>`;
                        }).join('')}
                    </div>
                </div>
                ` : ''}
                
                ${bingeCount > 0 ? `
                <div style="margin-bottom: 15px;">
                    <p style="color: #666;"><strong>Binge Watch Episodes:</strong> ${escapeHtml(String(bingeCount))} per session</p>
                </div>
                ` : ''}
                
                <div style="margin-top: 20px; display: flex; gap: 10px;">
                    <button id="modal-chat-btn" class="btn btn-primary" style="flex: 1; padding: 12px; font-size: 14px; background: #0066FF; border: none;">
                        💬 Chat
                    </button>
                    <button id="modal-watch-btn" class="btn btn-primary" style="flex: 1; padding: 12px; font-size: 14px;">
                        🎬 Watch Together
                    </button>
                </div>
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
        
        // Chat button handler
        const chatBtn = document.getElementById('modal-chat-btn');
        if (chatBtn) {
            chatBtn.addEventListener('click', () => {
                modal.remove();
                this.startChat(user.id);
            });
        }
        
        // Watch button handler
        const watchBtn = document.getElementById('modal-watch-btn');
        if (watchBtn) {
            watchBtn.addEventListener('click', () => {
                modal.remove();
                this.sendWatchInvitation(user.id);
            });
        }
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    upgradeToPremium() {
        // Show premium upgrade modal or navigate to premium page
        const confirmed = confirm(
            'Upgrade to Premium to see who liked you!\n\n' +
            'Premium features include:\n' +
            '✓ See who liked you\n' +
            '✓ Unlimited likes\n' +
            '✓ Advanced filters\n' +
            '✓ Profile boost\n\n' +
            'Would you like to upgrade now?'
        );

        if (confirmed) {
            // For demo purposes, toggle premium status
            this.togglePremiumForDemo();
        }
    }

    async togglePremiumForDemo() {
        try {
            const response = await fetch(`http://localhost:3000/api/users/${this.userId}/premium`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isPremium: true })
            });

            if (response.ok) {
                alert('✅ Premium activated! Reloading page...');
                window.location.reload();
            } else {
                alert('❌ Failed to activate premium. Please try again.');
            }
        } catch (error) {
            console.error('Error toggling premium:', error);
            alert('❌ An error occurred. Please try again.');
        }
    }

    async startChat(userId) {
        try {
            // Navigate to chat page with the user
            window.location.href = `chat.html?userId=${userId}`;
        } catch (error) {
            console.error('Error starting chat:', error);
            alert('Failed to start chat. Please try again.');
        }
    }

    async sendWatchInvitation(userId) {
        try {
            // Get user information
            const response = await fetch(`${this.apiBaseUrl}/users/${userId}`);
            if (!response.ok) throw new Error('Failed to load user');
            
            const user = await response.json();
            this.showWatchInvitationModal(user);
        } catch (error) {
            console.error('Error sending watch invitation:', error);
            alert('Failed to open watch invitation form. Please try again.');
        }
    }

    showWatchInvitationModal(user) {
        // Create and show modal for watch invitation
        const existingModal = document.getElementById('watch-invitation-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'watch-invitation-modal';
        modal.className = 'modal';
        modal.style.display = 'block';
        
        // Get today's date for min date
        const today = new Date().toISOString().split('T')[0];
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 style="margin: 0;">Send Watch Invitation</h2>
                    <button id="close-watch-modal" class="btn btn-secondary" style="padding: 8px 15px;">Close</button>
                </div>
                
                <div style="text-align: center; margin-bottom: 20px;">
                    <img src="${user.profilePicture || 'assets/images/default-avatar.png'}" alt="${user.username}" 
                         style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover;"
                         onerror="this.src='assets/images/default-avatar.png'">
                    <h3 style="margin: 10px 0 0 0;">${user.username}</h3>
                </div>
                
                <form id="watch-invitation-form">
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Platform:</label>
                        <select id="watch-platform" required style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 8px; font-size: 14px;">
                            <option value="">Select a platform</option>
                            <option value="teleparty">Teleparty (Netflix Party)</option>
                            <option value="amazon-prime">Amazon Prime Watch Party</option>
                            <option value="disney-plus">Disney+ GroupWatch</option>
                            <option value="scener">Scener</option>
                            <option value="zoom">Zoom Screen Share</option>
                        </select>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Movie/Show (optional):</label>
                        <input type="text" id="watch-movie" placeholder="e.g., Stranger Things" 
                               style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 8px; font-size: 14px;">
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-weight: 600;">Date:</label>
                            <input type="date" id="watch-date" required min="${today}"
                                   style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 8px; font-size: 14px;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-weight: 600;">Time:</label>
                            <input type="time" id="watch-time" required 
                                   style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 8px; font-size: 14px;">
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Join Link (optional):</label>
                        <input type="url" id="watch-link" placeholder="https://..." 
                               style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 8px; font-size: 14px;">
                        <small style="color: #666; font-size: 12px;">Add the watch party link if you already have one</small>
                    </div>
                    
                    <button type="submit" class="btn btn-primary" style="width: 100%; padding: 12px; font-size: 16px;">
                        Send Invitation
                    </button>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close modal handler
        const closeBtn = document.getElementById('close-watch-modal');
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
        
        // Form submit handler
        const form = document.getElementById('watch-invitation-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const platform = document.getElementById('watch-platform').value;
                const movie = document.getElementById('watch-movie').value;
                const date = document.getElementById('watch-date').value;
                const time = document.getElementById('watch-time').value;
                const joinLink = document.getElementById('watch-link').value;
                
                try {
                    const response = await fetch(`${this.apiBaseUrl}/watch-invitations`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            fromUserId: this.userId,
                            toUserId: user.id,
                            platform,
                            movie: movie || 'Watch Together',
                            scheduledDate: date,
                            scheduledTime: time,
                            joinLink
                        })
                    });
                    
                    if (response.ok) {
                        alert('✅ Watch invitation sent successfully!');
                        modal.remove();
                    } else {
                        const error = await response.json();
                        alert(`❌ Failed to send invitation: ${error.error || 'Unknown error'}`);
                    }
                } catch (error) {
                    console.error('Error sending watch invitation:', error);
                    alert('❌ Failed to send invitation. Please try again.');
                }
            });
        }
    }

    attachEventListeners() {
        // Settings button
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                window.location.href = 'profile-view.html';
            });
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    window.likedYouPage = new LikedYouPage();
});
