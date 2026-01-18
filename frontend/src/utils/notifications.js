/**
 * Notification Utility
 * Handles fetching and displaying notification badges for chat messages and watch invitations
 */

class NotificationManager {
    constructor() {
        this.userId = localStorage.getItem('currentUserId');
        this.unreadMessagesCount = 0;
        this.unreadInvitationsCount = 0;
        this.unreadLikesCount = 0;
        this.pollInterval = null;
        this.apiBaseUrl = window.API_BASE_URL || 'http://localhost:3000/api';
    }

    /**
     * Fetch notification counts from the backend
     */
    async fetchNotificationCounts() {
        if (!this.userId) {
            return null;
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/chat/notifications/${this.userId}`);
            if (response.ok) {
                const data = await response.json();
                this.unreadMessagesCount = data.totalUnreadMessages || 0;
                this.unreadInvitationsCount = data.unreadInvitations || 0;
                this.unreadLikesCount = data.unreadLikes || 0;
                return {
                    messages: this.unreadMessagesCount,
                    invitations: this.unreadInvitationsCount,
                    likes: this.unreadLikesCount
                };
            } else {
                console.warn(`[NotificationManager] Failed to fetch notifications: ${response.status}`);
                return null;
            }
        } catch (error) {
            console.error('[NotificationManager] Error fetching notification counts:', error);
            return null;
        }
    }

    /**
     * Update notification badges in the top navigation
     */
    updateTopNavBadges() {
        // Update chat badge
        const chatNav = document.querySelector('.nav-icon-btn.chat');
        if (chatNav) {
            this.updateNavBadge(chatNav, this.unreadMessagesCount);
        }

        // Update watch together badge
        const watchNav = document.querySelector('.nav-icon-btn.watch');
        if (watchNav) {
            this.updateNavBadge(watchNav, this.unreadInvitationsCount);
        }
    }

    /**
     * Update or create a badge for a navigation item
     */
    updateNavBadge(navElement, count) {
        let badge = navElement.querySelector('.nav-badge');
        
        if (count > 0) {
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'nav-badge';
                navElement.style.position = 'relative';
                navElement.appendChild(badge);
            }
            badge.textContent = count;
            badge.style.display = '';
        } else if (badge) {
            badge.style.display = 'none';
        }
    }

    /**
     * Start polling for notification updates
     */
    startPolling(interval = 5000) {
        // Fetch immediately
        this.fetchAndUpdate();
        
        // Then poll at regular intervals
        this.pollInterval = setInterval(() => {
            this.fetchAndUpdate();
        }, interval);
    }

    /**
     * Stop polling for notification updates
     */
    stopPolling() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }
    }

    /**
     * Fetch counts and update UI
     */
    async fetchAndUpdate() {
        await this.fetchNotificationCounts();
        this.updateTopNavBadges();
        
        // Notify any listeners that counts have been updated
        if (this.onUpdate && typeof this.onUpdate === 'function') {
            this.onUpdate(this.unreadMessagesCount, this.unreadInvitationsCount, this.unreadLikesCount);
        }
    }

    /**
     * Register a callback to be notified when counts update
     */
    setUpdateCallback(callback) {
        this.onUpdate = callback;
    }

    /**
     * Mark messages as read for a specific sender
     */
    async markMessagesAsRead(senderId) {
        if (!this.userId || !senderId) {
            return;
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/chat/read/${this.userId}/${senderId}`, {
                method: 'PUT'
            });
            if (response.ok) {
                // Refresh counts after marking as read
                await this.fetchAndUpdate();
            }
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    }

    /**
     * Mark invitation as read
     */
    async markInvitationAsRead(invitationId) {
        if (!invitationId) {
            return;
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/watch-invitations/${invitationId}/read`, {
                method: 'PUT'
            });
            if (response.ok) {
                // Refresh counts after marking as read
                await this.fetchAndUpdate();
            }
        } catch (error) {
            console.error('Error marking invitation as read:', error);
        }
    }
}

// Create global notification manager instance
window.NotificationManager = NotificationManager;

// Auto-initialize on pages with top navigation
document.addEventListener('DOMContentLoaded', () => {
    const userId = localStorage.getItem('currentUserId');
    const hasTopNav = document.querySelector('.nav-icons');
    
    if (userId && hasTopNav) {
        window.notificationManager = new NotificationManager();
        window.notificationManager.startPolling();
    }
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    if (window.notificationManager) {
        window.notificationManager.stopPolling();
    }
});
