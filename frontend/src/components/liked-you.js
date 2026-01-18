/**
 * Liked You Page Component - Bumble Style
 * Shows users who have liked the current user
 */

class LikedYouPage {
    constructor() {
        this.userId = localStorage.getItem('currentUserId');
        this.isPremium = false;
        this.likes = [];
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

        return `
            <div class="liked-profile-card ${isBlurred ? 'blurred' : ''}" 
                 data-user-id="${user.id}"
                 onclick="window.likedYouPage.handleCardClick('${user.id}')">
                <div class="liked-card-image">
                    <img src="${profilePicture}" alt="${user.username}" onerror="this.src='assets/images/default-avatar.png'">
                    ${isBlurred ? '<div class="blur-overlay">🔒</div>' : ''}
                </div>
                <div class="liked-card-info">
                    <div class="liked-card-name">
                        ${isBlurred ? 'Premium User' : `${user.username}, ${age}`}
                    </div>
                    <div class="liked-card-details">
                        ${isBlurred ? 'Upgrade to see' : location}
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

        // Navigate to user profile or chat
        window.location.href = `profile-view.html?userId=${userId}`;
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
