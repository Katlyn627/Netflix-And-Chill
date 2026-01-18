/**
 * Icebreaker Carousel Component
 * Handles carousel navigation and custom icebreaker creation
 */

class IcebreakerCarousel {
    constructor() {
        this.carousel = null;
        this.list = null;
        this.items = [];
        this.currentIndex = 0;
        this.itemsPerPage = 3; // Desktop: 3 items per page
        this.totalPages = 0;
        this.touchStartX = 0;
        this.touchEndX = 0;
    }

    /**
     * Initialize the carousel
     */
    init() {
        this.carousel = document.querySelector('.icebreaker-carousel');
        this.list = document.querySelector('.icebreaker-list');
        this.items = Array.from(document.querySelectorAll('.icebreaker-btn'));
        
        if (!this.carousel || !this.list || this.items.length === 0) {
            console.log('[IcebreakerCarousel] Elements not found, skipping initialization');
            return;
        }

        // Calculate total pages based on viewport
        this.updateItemsPerPage();
        this.calculateTotalPages();

        // Create indicators
        this.createIndicators();

        // Set up event listeners
        this.setupCarouselNavigation();
        this.setupTouchGestures();
        this.setupCustomIcebreaker();

        // Update initial state
        this.updateCarousel();

        // Update items per page on window resize
        window.addEventListener('resize', () => {
            this.updateItemsPerPage();
            this.calculateTotalPages();
            this.createIndicators();
            this.updateCarousel();
        });

        console.log('[IcebreakerCarousel] Initialized with', this.items.length, 'items');
    }

    /**
     * Update items per page based on viewport width
     */
    updateItemsPerPage() {
        if (window.innerWidth <= 768) {
            this.itemsPerPage = 1; // Mobile: 1 item per page
        } else {
            this.itemsPerPage = 3; // Desktop: 3 items per page
        }
    }

    /**
     * Calculate total pages
     */
    calculateTotalPages() {
        this.totalPages = Math.ceil(this.items.length / this.itemsPerPage);
    }

    /**
     * Create indicator dots
     */
    createIndicators() {
        const indicatorsContainer = document.querySelector('.carousel-indicators');
        if (!indicatorsContainer) return;

        indicatorsContainer.innerHTML = '';
        
        for (let i = 0; i < this.totalPages; i++) {
            const indicator = document.createElement('button');
            indicator.className = 'indicator';
            indicator.setAttribute('data-index', i);
            indicator.addEventListener('click', () => this.goToPage(i));
            indicatorsContainer.appendChild(indicator);
        }

        this.updateIndicators();
    }

    /**
     * Update indicator states
     */
    updateIndicators() {
        const indicators = document.querySelectorAll('.indicator');
        const currentPage = Math.floor(this.currentIndex / this.itemsPerPage);
        
        indicators.forEach((indicator, index) => {
            if (index === currentPage) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    }

    /**
     * Set up carousel navigation buttons
     */
    setupCarouselNavigation() {
        const prevBtn = this.carousel.querySelector('.carousel-nav.prev');
        const nextBtn = this.carousel.querySelector('.carousel-nav.next');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.prev());
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.next());
        }
    }

    /**
     * Set up touch gestures for mobile
     */
    setupTouchGestures() {
        this.list.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
        });

        this.list.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        });
    }

    /**
     * Handle swipe gesture
     */
    handleSwipe() {
        const swipeThreshold = 50;
        const diff = this.touchStartX - this.touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next
                this.next();
            } else {
                // Swipe right - prev
                this.prev();
            }
        }
    }

    /**
     * Navigate to next items
     */
    next() {
        const maxIndex = this.items.length - this.itemsPerPage;
        const nextIndex = this.currentIndex + this.itemsPerPage;

        if (nextIndex <= maxIndex) {
            this.currentIndex = nextIndex;
            this.updateCarousel();
        }
    }

    /**
     * Navigate to previous items
     */
    prev() {
        const prevIndex = this.currentIndex - this.itemsPerPage;

        if (prevIndex >= 0) {
            this.currentIndex = prevIndex;
            this.updateCarousel();
        }
    }

    /**
     * Go to specific page
     */
    goToPage(pageIndex) {
        this.currentIndex = pageIndex * this.itemsPerPage;
        this.updateCarousel();
    }

    /**
     * Update carousel position and button states
     */
    updateCarousel() {
        // Calculate transform percentage
        const itemWidth = 100 / this.itemsPerPage;
        const translateX = -(this.currentIndex * itemWidth);
        
        this.list.style.transform = `translateX(${translateX}%)`;
        this.list.style.transition = 'transform 0.3s ease-in-out';

        // Update navigation button states
        this.updateNavigationButtons();

        // Update indicators
        this.updateIndicators();
    }

    /**
     * Update navigation button disabled states
     */
    updateNavigationButtons() {
        const prevBtn = this.carousel.querySelector('.carousel-nav.prev');
        const nextBtn = this.carousel.querySelector('.carousel-nav.next');

        if (prevBtn) {
            if (this.currentIndex === 0) {
                prevBtn.disabled = true;
                prevBtn.style.opacity = '0.3';
            } else {
                prevBtn.disabled = false;
                prevBtn.style.opacity = '1';
            }
        }

        if (nextBtn) {
            const maxIndex = this.items.length - this.itemsPerPage;
            if (this.currentIndex >= maxIndex) {
                nextBtn.disabled = true;
                nextBtn.style.opacity = '0.3';
            } else {
                nextBtn.disabled = false;
                nextBtn.style.opacity = '1';
            }
        }
    }

    /**
     * Set up custom icebreaker functionality
     */
    setupCustomIcebreaker() {
        const createOwnBtn = document.querySelector('.create-own-btn');
        const modal = document.getElementById('custom-icebreaker-modal');
        const closeBtn = document.getElementById('close-custom-modal');
        const cancelBtn = document.getElementById('cancel-custom-icebreaker');
        const sendBtn = document.getElementById('send-custom-icebreaker');
        const textarea = document.getElementById('custom-icebreaker-input');
        const charCount = document.getElementById('char-count');

        // Open modal
        if (createOwnBtn) {
            createOwnBtn.addEventListener('click', () => {
                if (modal) {
                    modal.style.display = 'flex';
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
            if (modal) {
                modal.style.display = 'none';
            }
        };

        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', closeModal);
        }

        // Close on background click
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
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
                console.error('[IcebreakerCarousel] Failed to send custom icebreaker');
                this.showErrorNotification('Failed to send icebreaker. Please try again.');
            }
        } catch (error) {
            console.error('[IcebreakerCarousel] Error sending custom icebreaker:', error);
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

// Initialize carousel when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const carousel = new IcebreakerCarousel();
    carousel.init();
});
