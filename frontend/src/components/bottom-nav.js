/**
 * Bottom Navigation Component - Bumble Style
 * Provides 7-tab navigation: Logout, Profile, Discover, Swipe (center), Liked You, Chats, Watch Together
 */

class BottomNavigation {
    constructor() {
        this.currentPage = this.getCurrentPageFromURL();
        this.userId = localStorage.getItem('currentUserId');
        this.isPremium = false;
        this.likedYouCount = 0;
        this.unreadMessagesCount = 0;
        this.unreadInvitationsCount = 0;
        this.notificationPollInterval = null;
        this.profilePicture = null;
        this.init();
    }

    getCurrentPageFromURL() {
        const path = window.location.pathname;
        if (path.includes('profile')) return 'profile';
        if (path.includes('discover')) return 'discover';
        if (path.includes('swipe')) return 'swipe';
        if (path.includes('liked-you')) return 'liked-you';
        if (path.includes('chat')) return 'chats';
        if (path.includes('watch-together')) return 'watch-together';
        return 'swipe'; // default
    }

    async init() {
        // Fetch notification counts (includes unread likes)
        if (this.userId) {
            await this.fetchNotificationCounts();
            // Also get user premium status and profile picture
            await this.fetchUserPremiumStatus();
            await this.fetchProfilePicture();
        }
        this.render();
        this.attachEventListeners();
        this.startNotificationPolling();
    }

    async fetchUserPremiumStatus() {
        try {
            const apiBaseUrl = window.API_BASE_URL || 'http://localhost:3000/api';
            const response = await fetch(`${apiBaseUrl}/users/${this.userId}`);
            if (response.ok) {
                const user = await response.json();
                this.isPremium = user.isPremium || false;
            }
        } catch (error) {
            console.error('Error fetching user premium status:', error);
        }
    }

    async fetchProfilePicture() {
        try {
            // Try to get from localStorage first for faster loading
            const cachedPicture = localStorage.getItem('userProfilePicture');
            if (cachedPicture) {
                this.profilePicture = cachedPicture;
                console.log('[BottomNav] Loaded profile picture from cache:', cachedPicture);
            }
            
            // Then fetch fresh data from API
            const apiBaseUrl = window.API_BASE_URL || 'http://localhost:3000/api';
            const response = await fetch(`${apiBaseUrl}/users/${this.userId}`);
            if (response.ok) {
                const user = await response.json();
                if (user.profilePicture) {
                    this.profilePicture = user.profilePicture;
                    // Update cache
                    localStorage.setItem('userProfilePicture', user.profilePicture);
                    console.log('[BottomNav] Fetched and cached profile picture:', user.profilePicture);
                    // Re-render if picture changed
                    if (cachedPicture !== user.profilePicture) {
                        this.updateProfileIcon(user.profilePicture);
                    }
                }
            }
        } catch (error) {
            console.error('[BottomNav] Error fetching profile picture:', error);
        }
    }

    async fetchNotificationCounts() {
        try {
            const apiBaseUrl = window.API_BASE_URL || 'http://localhost:3000/api';
            const response = await fetch(`${apiBaseUrl}/chat/notifications/${this.userId}`);
            if (response.ok) {
                const data = await response.json();
                this.unreadMessagesCount = data.totalUnreadMessages || 0;
                this.unreadInvitationsCount = data.unreadInvitations || 0;
                this.likedYouCount = data.unreadLikes || 0;
            }
        } catch (error) {
            console.error('[BottomNav] Error fetching notification counts:', error);
        }
    }

    startNotificationPolling() {
        // If there's already a global notification manager, subscribe to its updates
        if (window.notificationManager) {
            window.notificationManager.setUpdateCallback((messages, invitations, likes) => {
                this.unreadMessagesCount = messages;
                this.unreadInvitationsCount = invitations;
                this.likedYouCount = likes || 0;
                this.updateNotificationBadges();
            });
            // Initial sync
            this.unreadMessagesCount = window.notificationManager.unreadMessagesCount || 0;
            this.unreadInvitationsCount = window.notificationManager.unreadInvitationsCount || 0;
            this.likedYouCount = window.notificationManager.unreadLikesCount || 0;
            this.updateNotificationBadges();
            return;
        }
        
        // Otherwise, poll independently every 5 seconds
        this.notificationPollInterval = setInterval(async () => {
            await this.fetchNotificationCounts();
            this.updateNotificationBadges();
        }, 5000);
    }

    stopNotificationPolling() {
        if (this.notificationPollInterval) {
            clearInterval(this.notificationPollInterval);
            this.notificationPollInterval = null;
        }
        
        // Unsubscribe from global notification manager if we were using it
        if (window.notificationManager && window.notificationManager.onUpdate) {
            window.notificationManager.onUpdate = null;
        }
    }

    updateNotificationBadges() {
        // Update chat badge
        const chatBadge = document.querySelector('.bottom-nav-item[data-page="chats"] .bottom-nav-badge');
        if (chatBadge) {
            if (this.unreadMessagesCount > 0) {
                chatBadge.textContent = this.unreadMessagesCount;
                chatBadge.style.display = '';
            } else {
                chatBadge.style.display = 'none';
            }
        }

        // Update watch together badge
        const watchBadge = document.querySelector('.bottom-nav-item[data-page="watch-together"] .bottom-nav-badge');
        if (watchBadge) {
            if (this.unreadInvitationsCount > 0) {
                watchBadge.textContent = this.unreadInvitationsCount;
                watchBadge.style.display = '';
            } else {
                watchBadge.style.display = 'none';
            }
        }

        // Update liked you badge
        const likedYouBadge = document.querySelector('.bottom-nav-item[data-page="liked-you"] .bottom-nav-badge');
        if (likedYouBadge) {
            if (this.likedYouCount > 0) {
                likedYouBadge.textContent = this.likedYouCount;
                likedYouBadge.style.display = '';
            } else {
                likedYouBadge.style.display = 'none';
            }
        }
    }

    render() {
        // Create profile icon HTML based on whether user has a profile picture
        let profileIconHtml;
        if (this.profilePicture) {
            profileIconHtml = `<div class="bottom-nav-icon bottom-nav-profile-icon"><img src="${this.profilePicture}" alt="Profile"></div>`;
        } else {
            profileIconHtml = `<div class="bottom-nav-icon">👤</div>`;
        }
        
        // Create bottom nav HTML
        const navHTML = `
            <nav class="bottom-nav">
                <button type="button" class="bottom-nav-item" id="logout-btn" data-page="logout">
                    <div class="bottom-nav-icon">🚪</div>
                    <div class="bottom-nav-label">Logout</div>
                </button>
                
                <a href="profile-view.html" class="bottom-nav-item ${this.currentPage === 'profile' ? 'active' : ''}" data-page="profile">
                    ${profileIconHtml}
                    <div class="bottom-nav-label">Profile</div>
                </a>
                
                <a href="discover.html" class="bottom-nav-item ${this.currentPage === 'discover' ? 'active' : ''}" data-page="discover">
                    <div class="bottom-nav-icon">🔍</div>
                    <div class="bottom-nav-label">Discover</div>
                </a>
                
                <a href="swipe.html" class="bottom-nav-item center ${this.currentPage === 'swipe' ? 'active' : ''}" data-page="swipe">
                    <div class="bottom-nav-icon">🎬</div>
                    <div class="bottom-nav-label">Swipe</div>
                </a>
                
                <a href="liked-you.html" class="bottom-nav-item ${this.currentPage === 'liked-you' ? 'active' : ''}" data-page="liked-you">
                    <div class="bottom-nav-icon">❤️</div>
                    <div class="bottom-nav-label">Liked You</div>
                    ${this.likedYouCount > 0 ? `<span class="bottom-nav-badge">${this.likedYouCount}</span>` : ''}
                </a>
                
                <a href="chat.html" class="bottom-nav-item ${this.currentPage === 'chats' ? 'active' : ''}" data-page="chats">
                    <div class="bottom-nav-icon">💬</div>
                    <div class="bottom-nav-label">Chats</div>
                    ${this.unreadMessagesCount > 0 ? `<span class="bottom-nav-badge">${this.unreadMessagesCount}</span>` : ''}
                </a>
                
                <a href="watch-together.html" class="bottom-nav-item ${this.currentPage === 'watch-together' ? 'active' : ''}" data-page="watch-together">
                    <div class="bottom-nav-icon">📺</div>
                    <div class="bottom-nav-label">Watch</div>
                    ${this.unreadInvitationsCount > 0 ? `<span class="bottom-nav-badge">${this.unreadInvitationsCount}</span>` : ''}
                </a>
            </nav>
        `;

        // Remove old nav if exists
        const oldNav = document.querySelector('.bottom-nav');
        if (oldNav) {
            oldNav.remove();
        }

        // Insert nav at end of body
        document.body.insertAdjacentHTML('beforeend', navHTML);
    }

    attachEventListeners() {
        // Add click tracking for analytics
        document.querySelectorAll('.bottom-nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const page = e.currentTarget.dataset.page;
                console.log(`Navigating to: ${page}`);
            });
        });

        // Add logout functionality
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm('Are you sure you want to logout?')) {
                    // Clear all user-related data from localStorage
                    localStorage.removeItem('currentUserId');
                    localStorage.removeItem('profileCreated');
                    localStorage.removeItem('initialSwipeComplete');
                    localStorage.removeItem('debateResponses');
                    localStorage.removeItem('promptResponses');
                    // Clear any other session-specific data
                    sessionStorage.clear();
                    window.location.href = 'login.html';
                }
            });
        }
    }

    updateBadges(likedYouCount, unreadMessagesCount) {
        this.likedYouCount = likedYouCount || 0;
        this.unreadMessagesCount = unreadMessagesCount || 0;
        this.render();
        this.attachEventListeners(); // Re-attach event listeners after re-rendering
    }

    async updateProfileIcon(profilePictureUrl) {
        console.log('[BottomNav] Updating profile icon:', profilePictureUrl);
        this.profilePicture = profilePictureUrl;
        
        // Update cache
        if (profilePictureUrl) {
            localStorage.setItem('userProfilePicture', profilePictureUrl);
        }
        
        // Update the profile icon in the DOM
        const profileNavItem = document.querySelector('.bottom-nav-item[data-page="profile"]');
        if (profileNavItem) {
            const iconDiv = profileNavItem.querySelector('.bottom-nav-icon');
            if (iconDiv && profilePictureUrl) {
                iconDiv.classList.add('bottom-nav-profile-icon');
                iconDiv.innerHTML = `<img src="${profilePictureUrl}" alt="Profile">`;
                console.log('[BottomNav] Profile icon updated in DOM');
            }
        }
    }

    destroy() {
        // Clean up polling interval
        this.stopNotificationPolling();
    }
}

// Initialize bottom navigation on page load
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if user is logged in
    const userId = localStorage.getItem('currentUserId');
    if (userId) {
        window.bottomNav = new BottomNavigation();
    }
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    if (window.bottomNav) {
        window.bottomNav.destroy();
    }
});
