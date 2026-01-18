/**
 * Chat Component
 * Handles real-time messaging between matched users
 */

class ChatComponent {
    constructor() {
        this.currentUserId = null;
        this.selectedMatchId = null;
        this.selectedMatchUsername = null;
        this.pollInterval = null;
        this.pollFrequency = 3000; // Poll every 3 seconds
        this.lastMessageTimestamp = null;
        this.streamChatConnected = false;
        this.unreadMessageCounts = {}; // Store unread message counts per user
    }

    /**
     * Initialize the chat component
     */
    async init() {
        this.currentUserId = localStorage.getItem('currentUserId');
        
        if (!this.currentUserId) {
            window.location.href = 'profile.html';
            return;
        }

        // Load saved filters
        const chatFilters = window.SharedFilters?.loadFilters() || {};
        
        // Load matches
        await this.loadMatches(chatFilters);
        
        // Check for pre-selected match
        const urlParams = new URLSearchParams(window.location.search);
        const preSelectedMatchId = urlParams.get('matchId') || localStorage.getItem('selectedMatchId');
        const preSelectedUsername = localStorage.getItem('chatWithUsername');
        
        if (preSelectedMatchId && preSelectedUsername) {
            console.log('[Chat] Pre-selecting match:', preSelectedMatchId, preSelectedUsername);
            setTimeout(() => {
                this.selectMatch(preSelectedMatchId, preSelectedUsername);
            }, 100);
        }
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Try to connect to Stream Chat for real-time features
        this.initStreamChat();
        
        // Start polling for unread counts
        this.startUnreadCountPolling();
    }

    /**
     * Initialize Stream Chat for real-time messaging
     */
    async initStreamChat() {
        if (!window.StreamChatClient) {
            console.log('[Chat] Stream Chat client not available, using polling');
            return;
        }

        try {
            // Get auth token from backend (backend will check if Stream Chat is configured)
            const response = await fetch(`${window.API_BASE_URL || 'http://localhost:3000/api'}/chat/token/${this.currentUserId}`);
            const data = await response.json();

            if (data.success && data.token && data.apiKey) {
                await window.StreamChatClient.connect(data.userId, data.token, data.apiKey);
                this.streamChatConnected = true;
                console.log('[Chat] Connected to Stream Chat');
                
                // Use Stream Chat events instead of polling
                this.stopPolling();
            } else {
                console.log('[Chat] Stream Chat not configured, using polling');
            }
        } catch (error) {
            console.log('[Chat] Could not connect to Stream Chat, using polling:', error.message);
        }
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Watch Together button
        const watchTogetherBtn = document.getElementById('watch-together-btn');
        if (watchTogetherBtn) {
            watchTogetherBtn.addEventListener('click', () => {
                if (this.selectedMatchId) {
                    window.location.href = `watch-together.html?matchId=${this.selectedMatchId}`;
                }
            });
        }

        // Filter button
        const chatFiltersBtn = document.getElementById('chat-filters-btn');
        if (chatFiltersBtn) {
            chatFiltersBtn.addEventListener('click', () => this.showFiltersModal());
        }

        // Filter modal controls
        document.getElementById('close-chat-filters')?.addEventListener('click', () => this.hideFiltersModal());
        document.getElementById('apply-chat-filters-btn')?.addEventListener('click', () => this.applyFilters());
        document.getElementById('reset-chat-filters-btn')?.addEventListener('click', () => this.resetFilters());

        // Slider value updates
        document.getElementById('chat-match-score-filter')?.addEventListener('input', function() {
            document.getElementById('chat-match-score-value').textContent = `${this.value}%`;
        });

        document.getElementById('chat-distance-filter')?.addEventListener('input', function() {
            document.getElementById('chat-distance-value').textContent = `${this.value} miles`;
        });

        // Chat form submission
        const chatForm = document.getElementById('chat-form');
        if (chatForm) {
            chatForm.addEventListener('submit', (e) => this.sendMessage(e));
        }

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('chat-filters-modal');
            if (e.target === modal) {
                this.hideFiltersModal();
            }
        });
    }

    /**
     * Load matches for chat
     */
    async loadMatches(filters) {
        try {
            if (!this.validateUserId(this.currentUserId)) {
                console.error('[Chat] Invalid userId format');
                this.displayMatchesList([]);
                return;
            }

            console.log('[Chat] Loading matches with filters:', filters);
            
            let matches = [];
            
            // Load only actual saved matches from history (not potential matches)
            try {
                const historyResponse = await fetch(
                    `${window.API_BASE_URL || 'http://localhost:3000/api'}/matches/${encodeURIComponent(this.currentUserId)}/history`
                );
                const historyData = await historyResponse.json();
                
                if (historyData.success && historyData.matches && historyData.matches.length > 0) {
                    console.log(`[Chat] Loaded ${historyData.matches.length} actual matches from history`);
                    matches = historyData.matches;
                }
            } catch (historyError) {
                console.log('[Chat] No saved match history found');
                matches = [];
            }
            
            // Apply client-side filters
            if (filters && matches.length > 0) {
                matches = this.filterMatches(matches, filters);
            }
            
            // Sort by match percentage from highest to lowest
            matches.sort((a, b) => b.matchScore - a.matchScore);
            
            // Fetch unread message counts
            await this.loadUnreadCounts();
            
            console.log(`[Chat] Displaying ${matches.length} actual matches sorted by match percentage`);
            this.displayMatchesList(matches);
        } catch (error) {
            console.error('[Chat] Error loading matches:', error);
            this.displayMatchesList([]);
        }
    }

    /**
     * Validate user ID format
     */
    validateUserId(userId) {
        const userIdRegex = /^[a-zA-Z0-9_-]+$/;
        return userId && userIdRegex.test(userId);
    }

    /**
     * Filter matches based on criteria
     */
    filterMatches(matches, filters) {
        if (!filters) return matches;
        
        return matches.filter(match => {
            if (filters.minMatchScore && match.matchScore < filters.minMatchScore) {
                return false;
            }
            
            if (filters.minAge && match.user.age < filters.minAge) {
                return false;
            }
            
            if (filters.maxAge && match.user.age > filters.maxAge) {
                return false;
            }
            
            if (filters.genderPreference && filters.genderPreference.length > 0) {
                if (!filters.genderPreference.includes(match.user.gender)) {
                    return false;
                }
            }
            
            if (filters.sexualOrientationPreference && filters.sexualOrientationPreference.length > 0) {
                if (!filters.sexualOrientationPreference.includes(match.user.sexualOrientation)) {
                    return false;
                }
            }
            
            return true;
        });
    }

    /**
     * Display matches list in sidebar
     */
    displayMatchesList(matches) {
        const matchesList = document.getElementById('matches-list');
        if (!matchesList) return;

        if (matches.length === 0) {
            matchesList.innerHTML = '<p style="padding: 10px; color: #888;">No matches yet. Keep swiping!</p>';
            return;
        }
        
        matchesList.innerHTML = matches.map(match => {
            const userId = this.escapeHtml(match.user.id);
            const username = this.escapeHtml(match.user.username);
            const profilePic = this.escapeHtml(match.user.profilePicture || 'assets/images/default-profile.svg');
            const matchScore = Math.round(match.matchScore);
            
            // Get unread message count for this user
            const unreadCount = this.unreadMessageCounts[match.user.id] || 0;
            const hasUnreadMessages = unreadCount > 0;
            
            return `
                <div class="match-item ${hasUnreadMessages ? 'has-unread' : ''}" data-match-id="${userId}" onclick="chatComponent.selectMatch('${userId}', '${username}')">
                    <div class="match-item-avatar">
                        <img src="${profilePic}" alt="${username}">
                        ${hasUnreadMessages ? `<span class="unread-count-badge">${unreadCount}</span>` : ''}
                    </div>
                    <div class="match-info">
                        <h4>${username}</h4>
                        <p>${matchScore}% match</p>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Select a match to chat with
     */
    async selectMatch(matchId, username) {
        this.selectedMatchId = matchId;
        this.selectedMatchUsername = username;
        
        // Save to localStorage
        localStorage.setItem('selectedMatchId', matchId);
        localStorage.setItem('chatWithUsername', username);
        
        console.log('[Chat] Selected match:', { matchId, username });
        
        // Update UI
        document.getElementById('chat-username').textContent = username;
        document.getElementById('watch-together-btn').style.display = 'block';
        document.getElementById('chat-input-container').style.display = 'block';
        
        // Highlight selected match
        document.querySelectorAll('.match-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-match-id="${matchId}"]`)?.classList.add('active');
        
        // Mark messages as read
        await this.markMessagesAsRead(matchId);
        
        // Load messages
        this.loadMessages();
        
        // Start polling for new messages
        this.startPolling();
    }

    /**
     * Load messages between users
     */
    async loadMessages() {
        if (!this.selectedMatchId) return;

        try {
            const response = await fetch(
                `${window.API_BASE_URL || 'http://localhost:3000/api'}/chat/${this.currentUserId}/${this.selectedMatchId}`
            );
            const data = await response.json();
            
            if (data.success && data.messages) {
                this.displayMessages(data.messages);
                
                // Update last message timestamp
                if (data.messages.length > 0) {
                    this.lastMessageTimestamp = data.messages[data.messages.length - 1].timestamp;
                }
            } else {
                this.showEmptyState();
            }
        } catch (error) {
            console.error('[Chat] Error loading messages:', error);
            this.showEmptyState();
        }
    }

    /**
     * Show empty state
     */
    showEmptyState() {
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages) {
            chatMessages.innerHTML = '<div class="chat-empty-state"><p>No messages yet. Start the conversation!</p></div>';
        }
    }

    /**
     * Display messages
     */
    displayMessages(messages) {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;

        if (messages.length === 0) {
            this.showEmptyState();
            return;
        }

        chatMessages.innerHTML = messages.map(msg => {
            const isSent = msg.senderId === this.currentUserId;
            const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const escapedTime = this.escapeHtml(time);
            
            return `
                <div class="message ${isSent ? 'sent' : 'received'}">
                    <p>${this.escapeHtml(msg.message)}</p>
                    <span class="message-time">${escapedTime}</span>
                </div>
            `;
        }).join('');
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Send a message
     */
    async sendMessage(e) {
        e.preventDefault();
        
        const messageInput = document.getElementById('message-input');
        const message = messageInput.value.trim();
        
        if (!message || !this.selectedMatchId) return;
        
        try {
            // Disable input while sending
            messageInput.disabled = true;

            const response = await fetch(`${window.API_BASE_URL || 'http://localhost:3000/api'}/chat/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    senderId: this.currentUserId,
                    receiverId: this.selectedMatchId,
                    message: message
                })
            });
            
            if (response.ok) {
                messageInput.value = '';
                await this.loadMessages();
            } else {
                const error = await response.json();
                console.error('[Chat] Failed to send message:', error);
                alert('Failed to send message. Please try again.');
            }
        } catch (error) {
            console.error('[Chat] Error sending message:', error);
            alert('Failed to send message. Please try again.');
        } finally {
            messageInput.disabled = false;
            messageInput.focus();
        }
    }

    /**
     * Start polling for new messages
     */
    startPolling() {
        // Don't poll if using Stream Chat
        if (this.streamChatConnected) {
            console.log('[Chat] Using Stream Chat, polling disabled');
            return;
        }

        this.stopPolling();
        
        console.log('[Chat] Starting message polling');
        
        // Poll immediately
        this.loadMessages();
        
        // Then poll at regular intervals
        this.pollInterval = setInterval(() => {
            // Only poll if page is visible
            if (document.visibilityState === 'visible') {
                this.loadMessages();
            }
        }, this.pollFrequency);
        
        // Handle visibility changes
        this.visibilityHandler = () => {
            if (document.visibilityState === 'visible' && this.selectedMatchId) {
                console.log('[Chat] Page visible, refreshing messages');
                this.loadMessages();
            }
        };
        
        document.addEventListener('visibilitychange', this.visibilityHandler);
    }

    /**
     * Stop polling for messages
     */
    stopPolling() {
        if (this.pollInterval) {
            console.log('[Chat] Stopping message polling');
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }
        
        if (this.visibilityHandler) {
            document.removeEventListener('visibilitychange', this.visibilityHandler);
            this.visibilityHandler = null;
        }
    }

    /**
     * Show filters modal
     */
    showFiltersModal() {
        const modal = document.getElementById('chat-filters-modal');
        if (modal) {
            modal.style.display = 'flex';
            
            const chatFilters = window.SharedFilters?.loadFilters() || {};
            window.SharedFilters?.applyFiltersToForm(chatFilters, 'chat-');
        }
    }

    /**
     * Hide filters modal
     */
    hideFiltersModal() {
        const modal = document.getElementById('chat-filters-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    /**
     * Apply filters
     */
    async applyFilters() {
        const chatFilters = window.SharedFilters?.extractFiltersFromForm('chat') || {};
        
        console.log('[Chat] Applied filters:', chatFilters);
        
        window.SharedFilters?.saveFilters(chatFilters);
        this.hideFiltersModal();
        
        await this.loadMatches(chatFilters);
    }

    /**
     * Reset filters
     */
    resetFilters() {
        const chatFilters = window.SharedFilters?.resetFilters() || {};
        window.SharedFilters?.applyFiltersToForm(chatFilters, 'chat-');
        console.log('[Chat] Reset filters to defaults');
    }

    /**
     * Load unread message counts
     */
    async loadUnreadCounts() {
        try {
            if (!window.api) {
                console.error('[Chat] API not available');
                return;
            }

            const result = await window.api.getUnreadMessageCounts(this.currentUserId);
            
            if (result.success) {
                this.unreadMessageCounts = result.unreadCounts || {};
                console.log('[Chat] Loaded unread counts:', this.unreadMessageCounts);
            } else {
                this.unreadMessageCounts = {};
            }
        } catch (error) {
            console.error('[Chat] Error loading unread counts:', error);
            this.unreadMessageCounts = {};
        }
    }

    /**
     * Mark messages as read
     */
    async markMessagesAsRead(senderId) {
        try {
            if (!window.api) {
                console.error('[Chat] API not available');
                return;
            }

            await window.api.markMessagesAsRead(this.currentUserId, senderId);
            
            // Update local unread counts
            if (this.unreadMessageCounts[senderId]) {
                delete this.unreadMessageCounts[senderId];
                
                // Update UI to remove unread indicator
                const matchItem = document.querySelector(`[data-match-id="${senderId}"]`);
                if (matchItem) {
                    matchItem.classList.remove('has-unread');
                    const badge = matchItem.querySelector('.unread-count-badge');
                    if (badge) {
                        badge.remove();
                    }
                }
            }
            
            // Update global notification manager if available
            if (window.notificationManager) {
                await window.notificationManager.fetchAndUpdate();
            }
            
            console.log('[Chat] Marked messages as read from:', senderId);
        } catch (error) {
            console.error('[Chat] Error marking messages as read:', error);
        }
    }

    /**
     * Start polling for unread counts
     */
    startUnreadCountPolling() {
        // Poll for unread counts every 5 seconds
        setInterval(async () => {
            if (document.visibilityState === 'visible') {
                await this.loadUnreadCounts();
                
                // Update the match list display with new counts
                const matchesList = document.getElementById('matches-list');
                if (matchesList && matchesList.children.length > 0) {
                    // Re-render the match items with updated counts
                    document.querySelectorAll('.match-item').forEach(matchItem => {
                        const matchId = matchItem.dataset.matchId;
                        const unreadCount = this.unreadMessageCounts[matchId] || 0;
                        const hasUnreadMessages = unreadCount > 0;
                        
                        // Update class
                        if (hasUnreadMessages) {
                            matchItem.classList.add('has-unread');
                        } else {
                            matchItem.classList.remove('has-unread');
                        }
                        
                        // Update or remove badge
                        let badge = matchItem.querySelector('.unread-count-badge');
                        if (hasUnreadMessages) {
                            if (badge) {
                                badge.textContent = unreadCount;
                            } else {
                                const avatar = matchItem.querySelector('.match-item-avatar');
                                if (avatar) {
                                    badge = document.createElement('span');
                                    badge.className = 'unread-count-badge';
                                    badge.textContent = unreadCount;
                                    avatar.appendChild(badge);
                                }
                            }
                        } else if (badge) {
                            badge.remove();
                        }
                    });
                }
            }
        }, 5000);
    }

    /**
     * Cleanup on page unload
     */
    cleanup() {
        this.stopPolling();
    }
}

// Create global instance
const chatComponent = new ChatComponent();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    chatComponent.init();
    
    // Set up icebreaker event listeners
    const icebreakerBtns = document.querySelectorAll('.icebreaker-btn');
    icebreakerBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const prompt = btn.getAttribute('data-prompt');
            const messageInput = document.getElementById('message-input');
            if (messageInput) {
                messageInput.value = prompt;
                messageInput.focus();
                hideIcebreakers();
            }
        });
    });
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    chatComponent.cleanup();
});

// Icebreaker utility functions
function toggleIcebreakers() {
    const icebreakerPrompts = document.getElementById('icebreaker-prompts');
    if (icebreakerPrompts) {
        const isHidden = icebreakerPrompts.style.display === 'none';
        icebreakerPrompts.style.display = isHidden ? 'block' : 'none';
    }
}

function hideIcebreakers() {
    const icebreakerPrompts = document.getElementById('icebreaker-prompts');
    if (icebreakerPrompts) {
        icebreakerPrompts.style.display = 'none';
    }
}

// Export for global access
window.chatComponent = chatComponent;
window.toggleIcebreakers = toggleIcebreakers;
window.hideIcebreakers = hideIcebreakers;
