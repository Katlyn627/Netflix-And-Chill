/**
 * Icebreaker Dropdown Component
 * Handles dropdown-based icebreaker selection and custom icebreaker creation
 */

class IcebreakerDropdown {
    constructor() {
        this.dropdown = null;
        this.useButton = null;
        this.createOwnButton = null;
        this.modal = null;
    }

    /**
     * Initialize the dropdown component
     */
    init() {
        this.dropdown = document.getElementById('icebreaker-select');
        this.useButton = document.getElementById('use-icebreaker-btn');
        this.createOwnButton = document.querySelector('.create-own-btn');
        this.modal = document.getElementById('custom-icebreaker-modal');

        if (!this.dropdown || !this.useButton) {
            console.log('[IcebreakerDropdown] Elements not found, skipping initialization');
            return;
        }

        // Set up event listeners
        this.setupEventListeners();
        this.setupCustomIcebreaker();

        console.log('[IcebreakerDropdown] Initialized');
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Use icebreaker button
        if (this.useButton) {
            this.useButton.addEventListener('click', () => {
                const selectedValue = this.dropdown.value;
                if (selectedValue) {
                    this.useIcebreaker(selectedValue);
                }
            });
        }

        // Enable/disable use button based on selection
        if (this.dropdown) {
            this.dropdown.addEventListener('change', () => {
                if (this.useButton) {
                    this.useButton.disabled = !this.dropdown.value;
                }
            });
        }
    }

    /**
     * Use selected icebreaker
     */
    useIcebreaker(text) {
        const messageInput = document.getElementById('message-input');
        if (messageInput) {
            messageInput.value = text;
            messageInput.focus();
            hideIcebreakers();
            
            // Reset dropdown
            if (this.dropdown) {
                this.dropdown.value = '';
                if (this.useButton) {
                    this.useButton.disabled = true;
                }
            }
        }
    }

    /**
     * Set up custom icebreaker functionality
     */
    setupCustomIcebreaker() {
        const closeBtn = document.getElementById('close-custom-modal');
        const cancelBtn = document.getElementById('cancel-custom-icebreaker');
        const sendBtn = document.getElementById('send-custom-icebreaker');
        const textarea = document.getElementById('custom-icebreaker-input');
        const charCount = document.getElementById('char-count');

        // Open modal
        if (this.createOwnButton) {
            this.createOwnButton.addEventListener('click', () => {
                if (this.modal) {
                    this.modal.style.display = 'flex';
                    if (textarea) {
                        textarea.value = '';
                        textarea.focus();
                    }
                    if (charCount) {
                        charCount.textContent = '0';
                    }
                }
            });
        }

        // Close modal handlers
        const closeModal = () => {
            if (this.modal) {
                this.modal.style.display = 'none';
            }
        };

        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', closeModal);
        }

        // Close on background click
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    closeModal();
                }
            });
        }

        // Character counter
        if (textarea && charCount) {
            textarea.addEventListener('input', () => {
                const length = textarea.value.length;
                charCount.textContent = length;
                
                // Change color when approaching limit
                if (length >= 180) {
                    charCount.style.color = '#E50914';
                } else if (length >= 150) {
                    charCount.style.color = '#FFA500';
                } else {
                    charCount.style.color = '#888';
                }
            });
        }

        // Send custom icebreaker
        if (sendBtn && textarea) {
            sendBtn.addEventListener('click', () => {
                const question = textarea.value.trim();
                
                if (!question) {
                    this.showErrorNotification('Please enter a question for your icebreaker!');
                    return;
                }

                if (question.length < 10) {
                    this.showErrorNotification('Please enter a longer question (at least 10 characters).');
                    return;
                }

                // Format the icebreaker challenge message
                const formattedMessage = `🎯 ICEBREAKER CHALLENGE 🎯\n\n${question}\n\n💭 Both of us must answer this!`;

                // Send the message using the chat component
                if (window.chatComponent && window.chatComponent.selectedMatchId) {
                    this.sendCustomIcebreaker(formattedMessage);
                    closeModal();
                    this.showSuccessNotification();
                    
                    // Hide icebreaker panel
                    if (window.hideIcebreakers) {
                        window.hideIcebreakers();
                    }
                } else {
                    this.showErrorNotification('Please select a match to send the icebreaker to!');
                }
            });
        }
    }

    /**
     * Send custom icebreaker message
     */
    async sendCustomIcebreaker(message) {
        try {
            // Add null checks for window.chatComponent
            if (!window.chatComponent || !window.chatComponent.currentUserId || !window.chatComponent.selectedMatchId) {
                this.showErrorNotification('Please select a match first!');
                return;
            }

            const response = await fetch(`${window.API_BASE_URL || 'http://localhost:3000/api'}/chat/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    senderId: window.chatComponent.currentUserId,
                    receiverId: window.chatComponent.selectedMatchId,
                    message: message
                })
            });

            if (response.ok) {
                // Reload messages to show the new icebreaker
                await window.chatComponent.loadMessages();
            } else {
                console.error('[IcebreakerDropdown] Failed to send custom icebreaker');
                this.showErrorNotification('Failed to send icebreaker. Please try again.');
            }
        } catch (error) {
            console.error('[IcebreakerDropdown] Error sending custom icebreaker:', error);
            this.showErrorNotification('Failed to send icebreaker. Please try again.');
        }
    }

    /**
     * Show success notification
     */
    showSuccessNotification() {
        const notification = document.getElementById('icebreaker-notification');
        if (!notification) return;

        notification.style.display = 'block';
        notification.style.animation = 'slideInFromRight 0.3s ease-out';

        // Auto-hide after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutToRight 0.3s ease-out';
            setTimeout(() => {
                notification.style.display = 'none';
            }, 300);
        }, 3000);
    }

    /**
     * Show error notification
     */
    showErrorNotification(message) {
        const notification = document.getElementById('icebreaker-notification');
        if (!notification) return;

        // Store original content and style
        const originalContent = notification.innerHTML;
        const originalBackground = notification.style.background;

        // Update to error style
        notification.innerHTML = `⚠️ ${message}`;
        notification.style.background = 'linear-gradient(135deg, #E50914 0%, #B20710 100%)';
        notification.style.display = 'block';
        notification.style.animation = 'slideInFromRight 0.3s ease-out';

        // Auto-hide and restore after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutToRight 0.3s ease-out';
            setTimeout(() => {
                notification.style.display = 'none';
                notification.innerHTML = originalContent;
                notification.style.background = originalBackground;
            }, 300);
        }, 3000);
    }
}

// Initialize dropdown when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const dropdown = new IcebreakerDropdown();
    dropdown.init();
});
