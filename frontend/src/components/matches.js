// Get current user ID from localStorage
let currentUserId = localStorage.getItem('currentUserId');

// Display user info
async function displayUserInfo() {
    if (!currentUserId) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const result = await api.getUser(currentUserId);
        if (result && result.id) {
            const userInfoDiv = document.getElementById('user-info');
            
            // Get profile picture or use default icon
            const profilePicture = result.profilePicture || '';
            const profileImageHtml = profilePicture 
                ? `<img src="${profilePicture}" alt="Profile" class="profile-icon">` 
                : `<div class="profile-icon-default">👤</div>`;
            
            userInfoDiv.innerHTML = `
                <a href="profile-view.html?userId=${currentUserId}" class="profile-link" title="View My Profile">
                    ${profileImageHtml}
                </a>
                <p>Logged in as: <strong>${result.username}</strong> (ID: <span class="user-id">${currentUserId}</span>)</p>
            `;
        } else {
            localStorage.removeItem('currentUserId');
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Error fetching user info:', error);
        localStorage.removeItem('currentUserId');
        window.location.href = 'login.html';
    }
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
            
            html += `
                <div class="match-card">
                    <div class="match-score">Match Score: ${match.matchScore}%</div>
                    <div class="match-details">
                        <h3>${match.user.username}</h3>
                        <p><strong>Age:</strong> ${match.user.age}</p>
                        <p><strong>Location:</strong> ${match.user.location || 'Not specified'}</p>
                        <p><strong>Bio:</strong> ${match.user.bio || 'No bio yet'}</p>
                        <p><strong>Streaming Services:</strong> ${match.user.streamingServices.map(s => s.name).join(', ')}</p>
                    </div>
                    ${sharedContentHtml}
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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    displayUserInfo();
});
