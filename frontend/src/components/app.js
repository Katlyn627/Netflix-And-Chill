let currentUserId = null;

// Show/hide sections
function showSection(sectionId) {
    const sections = ['create-profile', 'streaming-services', 'watch-history', 'preferences', 'find-matches'];
    sections.forEach(id => {
        const section = document.getElementById(id);
        if (section) {
            section.style.display = id === sectionId ? 'block' : 'none';
        }
    });
}

// Display messages
function showMessage(message, isError = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = isError ? 'error-message' : 'success-message';
    messageDiv.textContent = message;
    
    const main = document.querySelector('main');
    main.insertBefore(messageDiv, main.firstChild);
    
    setTimeout(() => messageDiv.remove(), 5000);
}

// Update user info display
function updateUserInfo(userId) {
    const userInfoDiv = document.getElementById('user-info');
    userInfoDiv.style.display = 'block';
    userInfoDiv.innerHTML = `
        <p>Logged in as: <span class="user-id">${userId}</span></p>
    `;
}

// Handle profile creation
document.getElementById('profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const userData = {
        username: formData.get('username'),
        email: formData.get('email'),
        age: parseInt(formData.get('age')),
        location: formData.get('location'),
        bio: formData.get('bio')
    };
    
    try {
        const result = await api.createUser(userData);
        if (result.user) {
            currentUserId = result.user.id;
            updateUserInfo(currentUserId);
            showMessage('Profile created successfully!');
            showSection('streaming-services');
        } else if (result.error) {
            showMessage(result.error, true);
        }
    } catch (error) {
        showMessage('Error creating profile: ' + error.message, true);
    }
});

// Handle streaming services
document.getElementById('add-services-btn').addEventListener('click', async () => {
    if (!currentUserId) {
        showMessage('Please create a profile first', true);
        return;
    }
    
    const checkboxes = document.querySelectorAll('#services-list input[type="checkbox"]:checked');
    const services = Array.from(checkboxes).map(cb => cb.value);
    
    if (services.length === 0) {
        showMessage('Please select at least one streaming service', true);
        return;
    }
    
    try {
        for (const service of services) {
            await api.addStreamingService(currentUserId, service);
        }
        showMessage(`Added ${services.length} streaming service(s)!`);
        showSection('watch-history');
    } catch (error) {
        showMessage('Error adding streaming services: ' + error.message, true);
    }
});

// Handle watch history
document.getElementById('watch-history-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!currentUserId) {
        showMessage('Please create a profile first', true);
        return;
    }
    
    const formData = new FormData(e.target);
    const watchData = {
        title: formData.get('title'),
        type: formData.get('type'),
        genre: formData.get('genre'),
        service: formData.get('service'),
        episodesWatched: parseInt(formData.get('episodes'))
    };
    
    try {
        await api.addWatchHistory(currentUserId, watchData);
        showMessage('Watch history updated!');
        e.target.reset();
        
        // Offer to go to preferences after adding a few items
        setTimeout(() => {
            if (confirm('Would you like to set your preferences now?')) {
                showSection('preferences');
            }
        }, 1000);
    } catch (error) {
        showMessage('Error adding to watch history: ' + error.message, true);
    }
});

// Handle preferences
document.getElementById('preferences-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!currentUserId) {
        showMessage('Please create a profile first', true);
        return;
    }
    
    const genreCheckboxes = document.querySelectorAll('input[name="genre"]:checked');
    const genres = Array.from(genreCheckboxes).map(cb => cb.value);
    const bingeCount = parseInt(document.getElementById('binge-count').value);
    
    try {
        await api.updatePreferences(currentUserId, {
            genres: genres,
            bingeWatchCount: bingeCount
        });
        showMessage('Preferences saved!');
        showSection('find-matches');
    } catch (error) {
        showMessage('Error saving preferences: ' + error.message, true);
    }
});

// Handle finding matches
document.getElementById('find-matches-btn').addEventListener('click', async () => {
    if (!currentUserId) {
        showMessage('Please create a profile first', true);
        return;
    }
    
    const matchesContainer = document.getElementById('matches-container');
    matchesContainer.innerHTML = '<p>Finding your matches...</p>';
    
    try {
        const result = await api.findMatches(currentUserId);
        
        if (result.matches && result.matches.length > 0) {
            matchesContainer.innerHTML = `<h3>Found ${result.matches.length} match(es)!</h3>`;
            
            result.matches.forEach(match => {
                const matchCard = document.createElement('div');
                matchCard.className = 'match-card';
                
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
                
                matchCard.innerHTML = `
                    <div class="match-score">Match Score: ${match.matchScore}%</div>
                    <div class="match-details">
                        <h3>${match.user.username}</h3>
                        <p><strong>Age:</strong> ${match.user.age}</p>
                        <p><strong>Location:</strong> ${match.user.location || 'Not specified'}</p>
                        <p><strong>Bio:</strong> ${match.user.bio || 'No bio yet'}</p>
                        <p><strong>Streaming Services:</strong> ${match.user.streamingServices.map(s => s.name).join(', ')}</p>
                    </div>
                    ${sharedContentHtml}
                `;
                
                matchesContainer.appendChild(matchCard);
            });
        } else {
            matchesContainer.innerHTML = `
                <p>No matches found yet. Try adding more shows to your watch history!</p>
            `;
        }
    } catch (error) {
        matchesContainer.innerHTML = '';
        showMessage('Error finding matches: ' + error.message, true);
    }
});

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    showSection('create-profile');
});
