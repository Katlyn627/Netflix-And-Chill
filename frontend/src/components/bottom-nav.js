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
        // Fetch user data to check premium status
        if (this.userId) {
            await this.fetchUserData();
        }
        this.render();
        this.attachEventListeners();
    }

    async fetchUserData() {
        try {
            const response = await fetch(`http://localhost:3000/api/users/${this.userId}`);
            if (response.ok) {
                const user = await response.json();
                this.isPremium = user.isPremium || false;
                
                // Fetch liked you count
                const likesResponse = await fetch(`http://localhost:3000/api/likes/${this.userId}/received`);
                if (likesResponse.ok) {
                    const likesData = await likesResponse.json();
                    this.likedYouCount = likesData.count || 0;
                }
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    }

    render() {
        // Create bottom nav HTML
        const navHTML = `
            <nav class="bottom-nav">
                <button type="button" class="bottom-nav-item" id="logout-btn" data-page="logout">
                    <div class="bottom-nav-icon">🚪</div>
                    <div class="bottom-nav-label">Logout</div>
                </button>
                
                <a href="profile-view.html" class="bottom-nav-item ${this.currentPage === 'profile' ? 'active' : ''}" data-page="profile">
                    <div class="bottom-nav-icon">👤</div>
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
