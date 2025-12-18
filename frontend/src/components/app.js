let currentUserId = null;
let searchTimeout = null;

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

// Toggle password visibility
document.addEventListener('DOMContentLoaded', () => {
    const togglePasswordBtn = document.getElementById('toggle-password');
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', function() {
            const passwordInput = document.getElementById('password');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                togglePasswordBtn.textContent = 'Hide';
            } else {
                passwordInput.type = 'password';
                togglePasswordBtn.textContent = 'Show';
            }
        });
    }
    
    // Initialize movie search functionality
    initializeMovieSearch();
    
    showSection('create-profile');
});

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
        password: formData.get('password'),
        age: parseInt(formData.get('age')),
        location: formData.get('location'),
        bio: formData.get('bio')
    };
    
    try {
        const result = await api.createUser(userData);
        if (result.user) {
            currentUserId = result.user.id;
            // Save user ID to localStorage
            localStorage.setItem('currentUserId', currentUserId);
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
        // Save user ID to localStorage for match page
        localStorage.setItem('currentUserId', currentUserId);
        
        // Automatically redirect to profile view page
        setTimeout(() => {
            window.location.href = `profile-view.html?userId=${currentUserId}`;
        }, 1000);
    } catch (error) {
        showMessage('Error saving preferences: ' + error.message, true);
    }
});

// Skip to preferences button
const skipToPreferencesBtn = document.getElementById('skip-to-preferences-btn');
if (skipToPreferencesBtn) {
    skipToPreferencesBtn.addEventListener('click', () => {
        showSection('preferences');
    });
}

// Initialize movie search functionality
function initializeMovieSearch() {
    const titleSearchInput = document.getElementById('title-search');
    const searchResults = document.getElementById('search-results');
    const titleInput = document.getElementById('title');
    const typeSelect = document.getElementById('type');
    const genreInput = document.getElementById('genre');
    const selectedDisplay = document.getElementById('selected-content-display');
    const selectedTitle = document.getElementById('selected-title');
    const selectedType = document.getElementById('selected-type');
    const selectedTmdbId = document.getElementById('selected-tmdb-id');

    if (!titleSearchInput) return;

    titleSearchInput.addEventListener('input', async (e) => {
        const query = e.target.value.trim();
        
        // Clear any existing timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        if (query.length < 2) {
            searchResults.style.display = 'none';
            return;
        }

        // Debounce search
        searchTimeout = setTimeout(async () => {
            try {
                searchResults.innerHTML = '<div class="search-loading">Searching...</div>';
                searchResults.style.display = 'block';

                const data = await api.searchMoviesAndShows(query);
                
                if (data.results && data.results.length > 0) {
                    searchResults.innerHTML = data.results.slice(0, 10).map(item => `
                        <div class="search-result-item" data-id="${item.id}" data-title="${item.title}" data-type="${item.type}">
                            <div class="search-result-title">${item.title}</div>
                            <div class="search-result-meta">${item.type === 'movie' ? 'Movie' : 'TV Show'} ${item.releaseDate ? '(' + item.releaseDate.split('-')[0] + ')' : ''}</div>
                        </div>
                    `).join('');

                    // Add click handlers to results
                    searchResults.querySelectorAll('.search-result-item').forEach(item => {
                        item.addEventListener('click', () => {
                            const title = item.dataset.title;
                            const type = item.dataset.type;
                            const id = item.dataset.id;

                            // Update form fields
                            titleSearchInput.value = title;
                            titleInput.value = title;
                            selectedTmdbId.value = id;
                            
                            // Set type
                            if (type === 'movie') {
                                typeSelect.value = 'movie';
                            } else {
                                typeSelect.value = 'tvshow';
                            }

                            // Show selected content
                            selectedTitle.textContent = title;
                            selectedType.textContent = type === 'movie' ? 'Movie' : 'TV Show';
                            selectedDisplay.style.display = 'block';

                            // Hide search results
                            searchResults.style.display = 'none';
                        });
                    });
                } else {
                    searchResults.innerHTML = '<div class="search-no-results">No results found. You can still type the title manually.</div>';
                }
            } catch (error) {
                console.error('Search error:', error);
                searchResults.innerHTML = '<div class="search-no-results">Search unavailable. Please type the title manually.</div>';
            }
        }, 300);
    });

    // Close search results when clicking outside
    document.addEventListener('click', (e) => {
        if (!titleSearchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });

    // Allow manual entry if user doesn't select from search
    titleSearchInput.addEventListener('blur', () => {
        setTimeout(() => {
            if (titleInput.value === '') {
                titleInput.value = titleSearchInput.value;
            }
        }, 200);
    });
}

