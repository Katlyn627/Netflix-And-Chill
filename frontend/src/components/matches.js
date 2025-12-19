// Get current user ID from localStorage
let currentUserId = localStorage.getItem('currentUserId');

// Helper function to escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Display matches
function displayMatches(matches) {
    const matchesContainer = document.getElementById('matches-container');
    
    if (matches && matches.length > 0) {
        let html = `<h3>Found ${matches.length} match(es)!</h3>`;
        
        matches.forEach(match => {
            const sharedContentHtml = match.sharedContent && match.sharedContent.length > 0
                ? `<div class="shared-content">
                    <h4>Shared Content:</h4>
                    <ul>
                        ${match.sharedContent.map(content => 
                            `<li>${content.title} (${content.type})</li>`
                        ).join('')}
                    </ul>
                   </div>`
                : '';
            
            const matchDescription = match.matchDescription || `${match.matchScore}% Movie Match`;
            const profilePhotoUrl = match.user.profilePicture || 'assets/images/default-profile.svg';
            const username = escapeHtml(match.user.username);
            const bio = escapeHtml(match.user.bio || 'No bio yet');
            const location = escapeHtml(match.user.location || 'Not specified');
            
            html += `
                <div class="match-card">
                    <div class="match-header">
                        <img src="${profilePhotoUrl}" alt="${username}" class="match-profile-photo" />
                        <div class="match-info">
                            <div class="match-score"><strong>${match.matchScore}%</strong> Match</div>
                            <h3>${username}</h3>
                        </div>
                    </div>
                    <div class="match-details">
                        <p><strong>Age:</strong> ${match.user.age}</p>
                        <p><strong>Location:</strong> ${location}</p>
                        <p><strong>Bio:</strong> ${bio}</p>
                        <p><strong>Streaming Services:</strong> ${match.user.streamingServices.map(s => escapeHtml(s.name)).join(', ')}</p>
                    </div>
                    ${sharedContentHtml}
                    <div class="match-actions">
                        <button class="btn btn-chat" onclick="openChat('${match.user.id}', '${username}')">💬 Start Chat</button>
                    </div>
                </div>
            `;
        });
        
        matchesContainer.innerHTML = html;
    } else {
        matchesContainer.innerHTML = `
            <div class="empty-state">
                <p>No matches found yet.</p>
                <p>Try adding more shows to your watch history to find better matches!</p>
            </div>
        `;
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
        const result = await api.findMatches(currentUserId);
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

// Event listeners
document.getElementById('find-matches-btn').addEventListener('click', findMatches);
document.getElementById('refresh-matches-btn').addEventListener('click', findMatches);

// Logout functionality
document.getElementById('logout-btn').addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('currentUserId');
        window.location.href = 'login.html';
    }
});

// Chat functionality
function openChat(matchUserId, matchUsername) {
    // Store chat info in localStorage for the chat page
    localStorage.setItem('chatWithUserId', matchUserId);
    localStorage.setItem('chatWithUsername', matchUsername);
    
    // Open chat modal or navigate to chat page
    showChatModal(matchUserId, matchUsername);
}

function showChatModal(matchUserId, matchUsername) {
    const safeUsername = escapeHtml(matchUsername);
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
    const modal = document.getElementById('chat-modal');
    if (e.target === modal) {
        closeChatModal();
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (currentUserId) {
        updateNavProfileIcon(currentUserId);
    }
});
