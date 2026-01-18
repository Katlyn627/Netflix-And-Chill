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
        this.setupCarouselNavigation();
    }

    async loadAllData() {
        const loading = document.getElementById('discover-loading');
        if (loading) loading.style.display = 'block';

        try {
            // Fetch current user data first
            const userResponse = await fetch(`http://localhost:3000/api/users/${this.userId}`);
            if (userResponse.ok) {
                this.currentUser = await userResponse.json();
            } else {
                console.error('Failed to load current user');
                this.currentUser = null;
            }

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
        const sortedMatches = [...this.allMatches].sort((a, b) => (b.matchScore || b.score || 0) - (a.matchScore || a.score || 0));

        // Recommended for you (based on swipe data) - show ALL matches
        const recommended = this.filterBySwipeData(sortedMatches);
        this.renderCards('recommended-cards', recommended);

        // Similar genres (users with matching genre preferences) - show ALL with matching genres
        const similarGenres = this.filterByGenreMatch(sortedMatches);
        this.renderCards('similar-genres-cards', similarGenres);

        // Similar binge amounts (users with similar binge patterns) - show ALL with similar binge
        const similarBinge = this.filterByBingeAmount(sortedMatches);
        this.renderCards('similar-binge-cards', similarBinge);
    }

    filterBySwipeData(matches) {
        // Filter based on swipe data - users who liked similar movies
        if (!this.currentUser || !this.currentUser.swipedMovies || this.currentUser.swipedMovies.length === 0) {
            // If no swipe data, fall back to top matches
            return matches;
        }

        // Get user's liked movies
        const userLikedMovies = this.currentUser.swipedMovies.filter(m => m.action === 'like');
        if (userLikedMovies.length === 0) {
            return matches;
        }

        // Get user's liked genres from swiped movies
        const userGenres = new Set();
        userLikedMovies.forEach(movie => {
            if (movie.genreIds && Array.isArray(movie.genreIds)) {
                movie.genreIds.forEach(genreId => userGenres.add(genreId));
            }
        });

        // Score matches based on genre overlap from swipe data
        return matches.map(match => {
            let swipeScore = 0;
            const user = match.user;
            
            // Check if user has swiped movies with similar genres
            if (user && user.swipedMovies) {
                const matchLikedMovies = user.swipedMovies.filter(m => m.action === 'like');
                matchLikedMovies.forEach(movie => {
                    if (movie.genreIds && Array.isArray(movie.genreIds)) {
                        movie.genreIds.forEach(genreId => {
                            if (userGenres.has(genreId)) {
                                swipeScore += 1;
                            }
                        });
                    }
                });
            }

            return { ...match, swipeScore };
        }).sort((a, b) => b.swipeScore - a.swipeScore);
    }

    filterByGenreMatch(matches) {
        // Filter by matching genre preferences - exact genre matches
        if (!this.currentUser || !this.currentUser.preferences || !this.currentUser.preferences.genres) {
            return matches;
        }

        const userGenres = new Set(this.currentUser.preferences.genres);
        
        // Only include matches that have at least one matching genre
        return matches.filter(match => {
            const user = match.user;
            if (!user || !user.preferences || !user.preferences.genres) {
                return false;
            }

            // Check if user has any matching genres
            return user.preferences.genres.some(genre => userGenres.has(genre));
        }).sort((a, b) => {
            // Sort by number of matching genres
            const aGenres = a.user.preferences.genres || [];
            const bGenres = b.user.preferences.genres || [];
            
            const aMatches = aGenres.filter(g => userGenres.has(g)).length;
            const bMatches = bGenres.filter(g => userGenres.has(g)).length;
            
            return bMatches - aMatches;
        });
    }

    filterByBingeAmount(matches) {
        // Filter by similar binge patterns (bingeWatchCount)
        if (!this.currentUser || !this.currentUser.preferences) {
            return matches;
        }

        const userBingeCount = this.currentUser.preferences.bingeWatchCount || 0;
        
        // Calculate binge similarity and sort by it
        return matches.map(match => {
            const user = match.user;
            let bingeSimilarity = 0;
            
            if (user && user.preferences && user.preferences.bingeWatchCount !== undefined) {
                const matchBingeCount = user.preferences.bingeWatchCount;
                const difference = Math.abs(userBingeCount - matchBingeCount);
                // Lower difference = higher similarity
                bingeSimilarity = Math.max(0, 10 - difference);
            }
            
            return { ...match, bingeSimilarity };
        }).filter(match => match.bingeSimilarity > 0)
          .sort((a, b) => b.bingeSimilarity - a.bingeSimilarity);
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
        const matchScore = Math.round(match.matchScore || 0);
        
        // Get movie personality (archetype)
        const archetype = user.archetype;
        const personalityText = archetype ? `${archetype.name || archetype.type || 'Movie Lover'}` : '';
        
        // Get movie preferences/genres as tags
        const genres = user.preferences?.genres || [];
        const genreTags = genres.slice(0, 3).map(genre => 
            `<span class="movie-tag">${genre}</span>`
        ).join('');

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
                    ${personalityText ? `<div class="card-personality">🎬 ${personalityText}</div>` : ''}
                    ${bingeText ? `<div class="card-binge">📺 ${bingeText}</div>` : ''}
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

    /**
     * Set up carousel navigation
     */
    setupCarouselNavigation() {
        const carouselButtons = document.querySelectorAll('.carousel-nav-btn');
        
        carouselButtons.forEach(button => {
            button.addEventListener('click', () => {
                const carouselType = button.dataset.carousel;
                const isPrev = button.classList.contains('prev-btn');
                const scrollContainer = document.getElementById(`${carouselType}-scroll`);
                
                if (scrollContainer) {
                    const scrollAmount = 320; // Width of card + gap
                    const direction = isPrev ? -1 : 1;
                    
                    scrollContainer.scrollBy({
                        left: scrollAmount * direction,
                        behavior: 'smooth'
                    });
                    
                    // Update button states after scroll
                    setTimeout(() => {
                        this.updateCarouselButtons(carouselType);
                    }, 100);
                }
            });
        });

        // Update button states on scroll
        ['recommended', 'genres', 'binge'].forEach(type => {
            const scrollContainer = document.getElementById(`${type}-scroll`);
            if (scrollContainer) {
                scrollContainer.addEventListener('scroll', () => {
                    this.updateCarouselButtons(type);
                });
            }
        });

        // Initial update
        setTimeout(() => {
            ['recommended', 'genres', 'binge'].forEach(type => {
                this.updateCarouselButtons(type);
            });
        }, 500);
    }

    /**
     * Update carousel button states
     */
    updateCarouselButtons(carouselType) {
        const scrollContainer = document.getElementById(`${carouselType}-scroll`);
        if (!scrollContainer) return;

        const prevBtn = document.querySelector(`.prev-btn[data-carousel="${carouselType}"]`);
        const nextBtn = document.querySelector(`.next-btn[data-carousel="${carouselType}"]`);

        if (!prevBtn || !nextBtn) return;

        const scrollLeft = scrollContainer.scrollLeft;
        const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;

        // Disable prev button at start
        prevBtn.disabled = scrollLeft <= 5;
        
        // Disable next button at end
        nextBtn.disabled = scrollLeft >= maxScroll - 5;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    window.discoverPage = new DiscoverPage();
});
