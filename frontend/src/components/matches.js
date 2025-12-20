// Get current user ID from localStorage
let currentUserId = localStorage.getItem('currentUserId');

// Constants
const SWIPE_THRESHOLD = 50; // Minimum swipe distance in pixels

// Load filter state from shared filters utility
let currentFilters = window.SharedFilters ? window.SharedFilters.loadFilters() : {
    minMatchScore: 0,
    minAge: 18,
    maxAge: 100,
    locationRadius: 50,
    genderPreference: [],
    sexualOrientationPreference: []
};

// Helper function to escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Store matches globally for carousel navigation
let allMatches = [];
let currentMatchIndex = 0;

// Display matches in carousel format
function displayMatches(matches) {
    const matchesContainer = document.getElementById('matches-container');
    
    if (matches && matches.length > 0) {
        allMatches = matches;
        currentMatchIndex = 0;
        
        let html = `
            <div class="carousel-header">
                <h3>Found ${matches.length} match(es)!</h3>
            </div>
            <div class="carousel-container">
                <button class="carousel-nav carousel-prev" id="carousel-prev" ${matches.length <= 1 ? 'style="display:none;"' : ''}>
                    <span>❮</span>
                </button>
                <div class="carousel-wrapper">
                    <div class="carousel-track" id="carousel-track">
                        ${matches.map((match, index) => createMatchCard(match, index)).join('')}
                    </div>
                </div>
                <button class="carousel-nav carousel-next" id="carousel-next" ${matches.length <= 1 ? 'style="display:none;"' : ''}>
                    <span>❯</span>
                </button>
            </div>
            <div class="carousel-indicators" id="carousel-indicators">
                ${matches.map((_, index) => `<span class="indicator ${index === 0 ? 'active' : ''}" data-index="${index}"></span>`).join('')}
            </div>
        `;
        
        matchesContainer.innerHTML = html;
        
        // Add event listeners for carousel navigation
        if (matches.length > 1) {
            document.getElementById('carousel-prev').addEventListener('click', showPreviousMatch);
            document.getElementById('carousel-next').addEventListener('click', showNextMatch);
            
            // Add click listeners to indicators
            document.querySelectorAll('.indicator').forEach(indicator => {
                indicator.addEventListener('click', (e) => {
                    const index = parseInt(e.target.dataset.index);
                    goToMatch(index);
                });
            });
            
            // Add swipe support
            addSwipeSupport();
        }
    } else {
        matchesContainer.innerHTML = `
            <div class="empty-state">
                <p>No matches found yet.</p>
                <p>Try adding more shows to your watch history to find better matches!</p>
            </div>
        `;
    }
}

// Create individual match card for carousel
function createMatchCard(match, index) {
    const profilePhotoUrl = match.user.profilePicture || 'assets/images/default-profile.svg';
    const username = escapeHtml(match.user.username);
    const bio = escapeHtml(match.user.bio || 'No bio yet');
    const location = escapeHtml(match.user.location || 'Not specified');
    const age = match.user.age || 'N/A';
    const matchScore = Math.round(match.matchScore);
    
    return `
        <div class="carousel-card ${index === 0 ? 'active' : ''}" data-index="${index}">
            <div class="match-image-container" onclick="showMatchDetails(${index})">
                <img src="${profilePhotoUrl}" alt="${username}" class="match-main-photo" />
                <div class="movie-ticket-overlay">
                    <div class="ticket-content">
                        <div class="ticket-score">${matchScore}%</div>
                        <div class="ticket-label">MATCH</div>
                    </div>
                </div>
            </div>
            <div class="match-basic-info">
                <h3 class="match-username">${username}, ${age}</h3>
                <p class="match-location">📍 ${location}</p>
                <p class="match-bio">${bio.length > 100 ? bio.substring(0, 100) + '...' : bio}</p>
                <div class="match-stats-preview">
                    <div class="stat-item">
                        <span class="stat-icon">🎬</span>
                        <span class="stat-value">${match.sharedContent ? match.sharedContent.length : 0}</span>
                        <span class="stat-label">Shared</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-icon">📺</span>
                        <span class="stat-value">${match.user.streamingServices ? match.user.streamingServices.length : 0}</span>
                        <span class="stat-label">Services</span>
                    </div>
                </div>
                <div class="match-quick-actions">
                    <button class="btn btn-primary btn-view-details" onclick="showMatchDetails(${index})">View Details</button>
                    <button class="btn btn-chat" onclick="openChat('${match.user.id}', '${username}')">💬 Chat</button>
                </div>
            </div>
        </div>
    `;
}

// Carousel navigation functions
function showPreviousMatch() {
    if (currentMatchIndex > 0) {
        goToMatch(currentMatchIndex - 1);
    }
}

function showNextMatch() {
    if (currentMatchIndex < allMatches.length - 1) {
        goToMatch(currentMatchIndex + 1);
    }
}

function goToMatch(index) {
    if (index < 0 || index >= allMatches.length) return;
    
    currentMatchIndex = index;
    const track = document.getElementById('carousel-track');
    const cards = document.querySelectorAll('.carousel-card');
    const indicators = document.querySelectorAll('.indicator');
    
    // Update active card
    cards.forEach((card, i) => {
        card.classList.toggle('active', i === index);
    });
    
    // Update indicators
    indicators.forEach((indicator, i) => {
        indicator.classList.toggle('active', i === index);
    });
    
    // Slide the carousel
    const offset = -index * 100;
    track.style.transform = `translateX(${offset}%)`;
}

// Add swipe support for touch devices
function addSwipeSupport() {
    const track = document.getElementById('carousel-track');
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    
    track.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
    });
    
    track.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        currentX = e.touches[0].clientX;
    });
    
    track.addEventListener('touchend', () => {
        if (!isDragging) return;
        isDragging = false;
        
        const diff = startX - currentX;
        if (Math.abs(diff) > SWIPE_THRESHOLD) { // Minimum swipe distance
            if (diff > 0) {
                showNextMatch();
            } else {
                showPreviousMatch();
            }
        }
    });
    
    // Mouse drag support for desktop
    track.addEventListener('mousedown', (e) => {
        startX = e.clientX;
        isDragging = true;
        track.style.cursor = 'grabbing';
    });
    
    track.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        currentX = e.clientX;
    });
    
    track.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        track.style.cursor = 'grab';
        
        const diff = startX - currentX;
        if (Math.abs(diff) > SWIPE_THRESHOLD) {
            if (diff > 0) {
                showNextMatch();
            } else {
                showPreviousMatch();
            }
        }
    });
    
    track.addEventListener('mouseleave', () => {
        if (isDragging) {
            isDragging = false;
            track.style.cursor = 'grab';
        }
    });
}

// Show detailed match information in modal
function showMatchDetails(index) {
    const match = allMatches[index];
    const username = escapeHtml(match.user.username);
    const bio = escapeHtml(match.user.bio || 'No bio yet');
    const location = escapeHtml(match.user.location || 'Not specified');
    const profilePhotoUrl = match.user.profilePicture || 'assets/images/default-profile.svg';
    const matchScore = Math.round(match.matchScore);
    const MAX_DISPLAYED_RESPONSES = 3;
    
    const sharedContentHtml = match.sharedContent && match.sharedContent.length > 0
        ? `<div class="detail-section">
            <h4>🎬 Shared Content (${match.sharedContent.length})</h4>
            <ul class="shared-content-list">
                ${match.sharedContent.map(content => 
                    `<li>${escapeHtml(content.title)} <span class="content-type">(${content.type})</span></li>`
                ).join('')}
            </ul>
           </div>`
        : '<p class="no-shared-content">No shared content yet</p>';
    
    const streamingServicesHtml = match.user.streamingServices && match.user.streamingServices.length > 0
        ? `<div class="detail-section">
            <h4>📺 Streaming Services</h4>
            <div class="services-list">
                ${match.user.streamingServices.map(s => 
                    `<span class="service-tag">${escapeHtml(s.name)}</span>`
                ).join('')}
            </div>
           </div>`
        : '';
    
    // Add quiz compatibility section
    const quizCompatibilityHtml = match.quizCompatibility && match.quizCompatibility > 0
        ? `<div class="detail-section quiz-compatibility-section">
            <h4>🎯 Quiz Compatibility</h4>
            <div class="compatibility-bar-container">
                <div class="compatibility-bar" style="width: ${(match.quizCompatibility / 50) * 100}%"></div>
            </div>
            <p class="compatibility-score">${Math.round((match.quizCompatibility / 50) * 100)}% quiz match</p>
            <p class="compatibility-text">You both answered ${match.quizCompatibility > 40 ? 'most' : match.quizCompatibility > 25 ? 'many' : 'some'} questions similarly!</p>
           </div>`
        : '';
    
    // Add text prompts section (debate responses and movie prompts)
    const debateResponses = match.user.movieDebateResponses || {};
    const moviePrompts = match.user.moviePromptResponses || {};
    const hasDebateResponses = Object.keys(debateResponses).length > 0;
    const hasMoviePrompts = Object.keys(moviePrompts).length > 0;
    
    let textPromptsHtml = '';
    if (hasDebateResponses || hasMoviePrompts) {
        textPromptsHtml = '<div class="detail-section text-prompts-section">';
        
        if (hasDebateResponses) {
            const debateEntries = Object.entries(debateResponses).slice(0, MAX_DISPLAYED_RESPONSES);
            textPromptsHtml += `
                <h4>💬 Movie Debates</h4>
                ${debateEntries.map(([topic, response]) => `
                    <div style="background: #f5f5f5; padding: 12px; border-radius: 6px; margin-bottom: 10px;">
                        <strong style="color: #667eea;">${escapeHtml(topic)}</strong>
                        <p style="margin: 8px 0 0 0; font-size: 0.95em;">${escapeHtml(response)}</p>
                    </div>
                `).join('')}
            `;
        }
        
        if (hasMoviePrompts) {
            const promptEntries = Object.entries(moviePrompts).slice(0, MAX_DISPLAYED_RESPONSES);
            textPromptsHtml += `
                <h4 style="margin-top: ${hasDebateResponses ? '15px' : '0'};">🎬 Movie Prompts</h4>
                ${promptEntries.map(([prompt, response]) => `
                    <div style="background: #f5f5f5; padding: 12px; border-radius: 6px; margin-bottom: 10px;">
                        <strong style="color: #764ba2;">${escapeHtml(prompt)}</strong>
                        <p style="margin: 8px 0 0 0; font-size: 0.95em;">${escapeHtml(response)}</p>
                    </div>
                `).join('')}
            `;
        }
        
        textPromptsHtml += '</div>';
    }
    
    // Create or update modal
    let modal = document.getElementById('match-details-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'match-details-modal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }
    
    modal.innerHTML = `
        <div class="modal-content match-details-content">
            <div class="match-details-header">
                <h3>${username}'s Profile</h3>
                <button class="close-modal" onclick="closeMatchDetailsModal()">&times;</button>
            </div>
            <div class="match-details-body">
                <div class="details-photo-section">
                    <img src="${profilePhotoUrl}" alt="${username}" class="details-main-photo" />
                    <div class="details-score-badge">
                        <div class="score-number">${matchScore}%</div>
                        <div class="score-label">Match Score</div>
                    </div>
                </div>
                <div class="details-info-section">
                    <div class="detail-section">
                        <h4>📋 Basic Information</h4>
                        <p><strong>Age:</strong> ${match.user.age || 'N/A'}</p>
                        <p><strong>Gender:</strong> ${escapeHtml(match.user.gender || 'Not specified')}</p>
                        <p><strong>Location:</strong> ${location}</p>
                        <p><strong>Bio:</strong> ${bio}</p>
                    </div>
                    ${quizCompatibilityHtml}
                    ${textPromptsHtml}
                    ${streamingServicesHtml}
                    ${sharedContentHtml}
                </div>
            </div>
            <div class="match-details-footer">
                <button class="btn btn-chat" onclick="openChat('${match.user.id}', '${username}'); closeMatchDetailsModal();">💬 Start Chat</button>
                <button class="btn btn-secondary" onclick="closeMatchDetailsModal()">Close</button>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
}

function closeMatchDetailsModal() {
    const modal = document.getElementById('match-details-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Find matches
async function findMatches() {
    if (!currentUserId) {
        window.location.href = 'login.html';
        return;
    }

    const loadingDiv = document.getElementById('matches-loading');
    const matchesContainer = document.getElementById('matches-container');
    
    loadingDiv.style.display = 'block';
    matchesContainer.innerHTML = '';
    
    try {
        const result = await api.findMatches(currentUserId, currentFilters);
        loadingDiv.style.display = 'none';
        displayMatches(result.matches);
    } catch (error) {
        loadingDiv.style.display = 'none';
        matchesContainer.innerHTML = `
            <div class="error-message">
                <p>Error finding matches: ${error.message}</p>
            </div>
        `;
    }
}

// Show filters modal
function showFiltersModal() {
    const modal = document.getElementById('filters-modal');
    modal.style.display = 'flex';
    
    // Set current filter values
    document.getElementById('match-score-filter').value = currentFilters.minMatchScore;
    document.getElementById('match-score-value').textContent = `${currentFilters.minMatchScore}%`;
    document.getElementById('age-range-min-filter').value = currentFilters.minAge;
    document.getElementById('age-range-max-filter').value = currentFilters.maxAge;
    document.getElementById('distance-filter').value = currentFilters.locationRadius;
    document.getElementById('distance-value').textContent = `${currentFilters.locationRadius} miles`;
    
    // Set gender checkboxes
    document.querySelectorAll('input[name="genderFilter"]').forEach(cb => {
        cb.checked = currentFilters.genderPreference.length === 0 
            ? cb.value === 'any'
            : currentFilters.genderPreference.includes(cb.value);
    });
    
    // Set orientation checkboxes
    document.querySelectorAll('input[name="orientationFilter"]').forEach(cb => {
        cb.checked = currentFilters.sexualOrientationPreference.length === 0 
            ? cb.value === 'any'
            : currentFilters.sexualOrientationPreference.includes(cb.value);
    });
}

// Hide filters modal
function hideFiltersModal() {
    const modal = document.getElementById('filters-modal');
    modal.style.display = 'none';
}

// Apply filters
function applyFilters() {
    // Use shared filters utility to extract and save filters
    if (window.SharedFilters) {
        currentFilters = window.SharedFilters.extractFiltersFromForm('');
        window.SharedFilters.saveFilters(currentFilters);
        console.log('[Matches] Applied and saved filters:', currentFilters);
    } else {
        // Fallback to original implementation
        currentFilters.minMatchScore = parseInt(document.getElementById('match-score-filter').value);
        currentFilters.minAge = parseInt(document.getElementById('age-range-min-filter').value);
        currentFilters.maxAge = parseInt(document.getElementById('age-range-max-filter').value);
        currentFilters.locationRadius = parseInt(document.getElementById('distance-filter').value);
        
        // Get gender preferences
        const genderCheckboxes = document.querySelectorAll('input[name="genderFilter"]:checked');
        let genderPrefs = Array.from(genderCheckboxes).map(cb => cb.value);
        // Remove 'any' if specific options are selected
        if (genderPrefs.length > 1 && genderPrefs.includes('any')) {
            genderPrefs = genderPrefs.filter(p => p !== 'any');
        }
        currentFilters.genderPreference = genderPrefs;
        
        // Get orientation preferences
        const orientationCheckboxes = document.querySelectorAll('input[name="orientationFilter"]:checked');
        let orientationPrefs = Array.from(orientationCheckboxes).map(cb => cb.value);
        // Remove 'any' if specific options are selected
        if (orientationPrefs.length > 1 && orientationPrefs.includes('any')) {
            orientationPrefs = orientationPrefs.filter(p => p !== 'any');
        }
        currentFilters.sexualOrientationPreference = orientationPrefs;
    }
    
    hideFiltersModal();
    findMatches();
}

// Reset filters
function resetFilters() {
    // Use shared filters utility to reset
    if (window.SharedFilters) {
        currentFilters = window.SharedFilters.resetFilters();
        console.log('[Matches] Reset filters to defaults');
        window.SharedFilters.applyFiltersToForm(currentFilters, '');
    } else {
        // Fallback to original implementation
        currentFilters = {
            minMatchScore: 0,
            minAge: 18,
            maxAge: 100,
            locationRadius: 50,
            genderPreference: [],
            sexualOrientationPreference: []
        };
        
        // Update UI
        document.getElementById('match-score-filter').value = 0;
        document.getElementById('match-score-value').textContent = '0%';
        document.getElementById('age-range-min-filter').value = 18;
        document.getElementById('age-range-max-filter').value = 100;
        document.getElementById('distance-filter').value = 50;
        document.getElementById('distance-value').textContent = '50 miles';
        
        // Reset checkboxes
        document.querySelectorAll('input[name="genderFilter"]').forEach(cb => {
            cb.checked = cb.value === 'any';
        });
        document.querySelectorAll('input[name="orientationFilter"]').forEach(cb => {
            cb.checked = cb.value === 'any';
        });
    }
}

// Event listeners
document.getElementById('find-matches-btn').addEventListener('click', findMatches);
document.getElementById('refresh-matches-btn').addEventListener('click', findMatches);
document.getElementById('filters-btn').addEventListener('click', showFiltersModal);
document.getElementById('close-filters').addEventListener('click', hideFiltersModal);
document.getElementById('apply-filters-btn').addEventListener('click', applyFilters);
document.getElementById('reset-filters-btn').addEventListener('click', resetFilters);

// Update slider values in real-time
document.getElementById('match-score-filter').addEventListener('input', function() {
    document.getElementById('match-score-value').textContent = `${this.value}%`;
});

document.getElementById('distance-filter').addEventListener('input', function() {
    document.getElementById('distance-value').textContent = `${this.value} miles`;
});

// Logout functionality
document.getElementById('logout-btn').addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('currentUserId');
        window.location.href = 'login.html';
    }
});

// Chat functionality - navigate to chat page
function openChat(matchUserId, matchUsername) {
    // Store chat info in localStorage for the chat page
    localStorage.setItem('selectedMatchId', matchUserId);
    localStorage.setItem('chatWithUsername', matchUsername);
    
    console.log('Opening chat with:', { matchUserId, matchUsername });
    console.log('Saved match info to localStorage');
    
    // Navigate to chat page
    window.location.href = 'chat.html';
}

function showChatModal(matchUserId, matchUsername) {
    const safeUsername = escapeHtml(matchUsername);
    
    // Save selected match to localStorage
    localStorage.setItem('selectedMatchId', matchUserId);
    localStorage.setItem('chatWithUsername', matchUsername);
    localStorage.setItem('chatWithUserId', matchUserId);
    
    console.log('Opening chat modal with:', { matchUserId, matchUsername });
    console.log('Saved match info to localStorage');
    
    // Create modal if it doesn't exist
    let modal = document.getElementById('chat-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'chat-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content chat-modal-content">
                <div class="chat-header">
                    <h3>Chat with ${safeUsername}</h3>
                    <button class="close-modal" onclick="closeChatModal()">&times;</button>
                </div>
                <div class="chat-messages" id="chat-messages">
                    <div class="chat-welcome">
                        <p>Start chatting with ${safeUsername}!</p>
                        <p class="chat-hint">Share your thoughts about movies and shows you both love! 🎬</p>
                    </div>
                </div>
                <div class="chat-input-container">
                    <input type="text" id="chat-input" placeholder="Type your message..." />
                    <button class="btn btn-primary" onclick="sendMessage('${matchUserId}')">Send</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    modal.style.display = 'flex';
    document.getElementById('chat-input').focus();
    
    // Load existing messages
    loadChatMessages(matchUserId);
}

function closeChatModal() {
    const modal = document.getElementById('chat-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

async function loadChatMessages(matchUserId) {
    const messagesContainer = document.getElementById('chat-messages');
    
    try {
        const response = await api.getChatMessages(currentUserId, matchUserId);
        if (response.messages && response.messages.length > 0) {
            let html = '';
            response.messages.forEach(msg => {
                const isSent = msg.senderId === currentUserId;
                const safeMessage = escapeHtml(msg.message);
                html += `
                    <div class="chat-message ${isSent ? 'sent' : 'received'}">
                        <div class="message-content">${safeMessage}</div>
                        <div class="message-time">${new Date(msg.timestamp).toLocaleTimeString()}</div>
                    </div>
                `;
            });
            messagesContainer.innerHTML = html;
        }
    } catch (error) {
        console.log('No previous messages or error loading messages:', error.message);
    }
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

async function sendMessage(matchUserId) {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    try {
        await api.sendChatMessage(currentUserId, matchUserId, message);
        input.value = '';
        
        // Add message to UI immediately
        const messagesContainer = document.getElementById('chat-messages');
        const welcomeMsg = messagesContainer.querySelector('.chat-welcome');
        if (welcomeMsg) {
            welcomeMsg.remove();
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message sent';
        const safeMessage = escapeHtml(message);
        messageDiv.innerHTML = `
            <div class="message-content">${safeMessage}</div>
            <div class="message-time">${new Date().toLocaleTimeString()}</div>
        `;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    } catch (error) {
        alert('Error sending message: ' + error.message);
    }
}

// Allow Enter key to send message
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.target.id === 'chat-input') {
        const matchUserId = localStorage.getItem('chatWithUserId');
        if (matchUserId) {
            sendMessage(matchUserId);
        }
    }
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    const chatModal = document.getElementById('chat-modal');
    const filtersModal = document.getElementById('filters-modal');
    const detailsModal = document.getElementById('match-details-modal');
    
    if (e.target === chatModal) {
        closeChatModal();
    }
    if (e.target === filtersModal) {
        hideFiltersModal();
    }
    if (e.target === detailsModal) {
        closeMatchDetailsModal();
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (currentUserId) {
        updateNavProfileIcon(currentUserId);
    }
});

// Discover button functionality - routes to swipe page
const discoverBtn = document.getElementById('discover-btn');
if (discoverBtn) {
    discoverBtn.addEventListener('click', () => {
        window.location.href = 'swipe.html';
    });
}
