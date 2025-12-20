let currentUserId = null;
let searchTimeout = null;
let availableGenres = [];
let availableProviders = [];

// Show/hide sections
function showSection(sectionId) {
    const sections = ['create-profile', 'streaming-services', 'watch-history', 'preferences', 'movie-preferences', 'swipe-movies', 'find-matches'];
    sections.forEach(id => {
        const section = document.getElementById(id);
        if (section) {
            section.style.display = id === sectionId ? 'block' : 'none';
        }
    });
    
    // Load dynamic data when showing relevant sections
    if (sectionId === 'streaming-services') {
        loadStreamingProviders();
    } else if (sectionId === 'preferences') {
        loadGenres();
    } else if (sectionId === 'swipe-movies') {
        // Initialize the swipe feature when showing the swipe section
        if (window.SwipeModule && typeof window.SwipeModule.initializeSwipe === 'function' && currentUserId) {
            window.SwipeModule.initializeSwipe(currentUserId);
        }
    }
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
    
    // Initialize location radius slider
    const locationRadiusSlider = document.getElementById('location-radius');
    const radiusValueSpan = document.getElementById('radius-value');
    if (locationRadiusSlider && radiusValueSpan) {
        locationRadiusSlider.addEventListener('input', function() {
            radiusValueSpan.textContent = `${this.value} miles`;
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

// Load streaming providers from TMDB
async function loadStreamingProviders() {
    try {
        const result = await api.getStreamingProviders('US');
        if (result && result.providers) {
            availableProviders = result.providers;
            renderStreamingProviders(result.providers);
        }
    } catch (error) {
        console.error('Error loading streaming providers:', error);
        // Keep the hardcoded list as fallback
    }
}

// Render streaming providers
function renderStreamingProviders(providers) {
    const servicesList = document.getElementById('services-list');
    if (!servicesList) return;
    
    // Don't clear the existing content - keep the hardcoded top 10 list from HTML
    // This ensures we always show only the top 10 services as specified
    
    // Define the exact top 10 services mapping for precise matching
    const top10ServicesMap = {
        'Amazon Prime': ['amazon prime video', 'amazon prime', 'prime video'],
        'Netflix': ['netflix'],
        'Hulu': ['hulu'],
        'Disney+': ['disney plus', 'disney+'],
        'Paramount+': ['paramount plus', 'paramount+'],
        'Apple TV': ['apple tv+', 'apple tv plus', 'apple tv'],
        'HBO': ['hbo max', 'hbo'],
        'Peacock': ['peacock premium', 'peacock'],
        'Sling': ['sling tv', 'sling']
    };
    
    // Update checkboxes with data from API for matching services
    providers.forEach(provider => {
        const providerNameLower = provider.name.toLowerCase().trim();
        
        // Check if this provider matches one of our top 10
        for (const [serviceKey, aliases] of Object.entries(top10ServicesMap)) {
            if (aliases.some(alias => alias === providerNameLower)) {
                // Find the corresponding checkbox in the HTML
                const checkboxes = servicesList.querySelectorAll('input[type="checkbox"]');
                checkboxes.forEach(checkbox => {
                    const checkboxValue = checkbox.value.toLowerCase().trim();
                    if (checkboxValue === serviceKey.toLowerCase() || 
                        aliases.some(alias => alias === checkboxValue)) {
                        // Update with API data
                        checkbox.dataset.providerId = provider.id;
                        checkbox.dataset.logoPath = provider.logoPath || '';
                        checkbox.dataset.logoUrl = provider.logoUrl || '';
                    }
                });
                break; // Found a match, no need to continue checking aliases
            }
        }
    });
}

// Load genres from TMDB
async function loadGenres() {
    try {
        const result = await api.getGenres(); // Get all genres (movie + TV)
        if (result && result.genres) {
            availableGenres = result.genres;
            renderGenres(result.genres);
        }
    } catch (error) {
        console.error('Error loading genres:', error);
        // Keep the hardcoded list as fallback
    }
}

// Render genres
function renderGenres(genres) {
    const genreOptions = document.querySelector('.genre-options');
    if (!genreOptions) return;
    
    // Clear existing content
    genreOptions.innerHTML = '';
    
    // Render genres from TMDB
    genres.forEach(genre => {
        const label = document.createElement('label');
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = 'genre';
        checkbox.value = genre.name;
        checkbox.dataset.genreId = genre.id;
        checkbox.dataset.genreTypes = JSON.stringify(genre.types);
        
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(` ${genre.name}`));
        genreOptions.appendChild(label);
    });
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
        gender: formData.get('gender'),
        sexualOrientation: formData.get('sexualOrientation'),
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

// Handle "Other" streaming service checkbox toggle
document.getElementById('other-service').addEventListener('change', function() {
    const otherServiceInput = document.getElementById('other-service-input');
    if (this.checked) {
        otherServiceInput.style.display = 'block';
    } else {
        otherServiceInput.style.display = 'none';
        document.getElementById('custom-service-name').value = '';
    }
});

// Handle streaming services
document.getElementById('add-services-btn').addEventListener('click', async () => {
    if (!currentUserId) {
        showMessage('Please create a profile first', true);
        return;
    }
    
    const checkboxes = document.querySelectorAll('#services-list input[type="checkbox"]:checked');
    
    if (checkboxes.length === 0) {
        showMessage('Please select at least one streaming service', true);
        return;
    }
    
    // Check if "Other" is selected and validate custom input
    const otherCheckbox = document.getElementById('other-service');
    const customServiceName = document.getElementById('custom-service-name').value.trim();
    
    if (otherCheckbox.checked && !customServiceName) {
        showMessage('Please enter a streaming service name for "Other"', true);
        return;
    }
    
    try {
        for (const checkbox of checkboxes) {
            let serviceName = checkbox.value;
            
            // If this is the "Other" checkbox, use the custom service name
            if (checkbox.id === 'other-service' && customServiceName) {
                serviceName = customServiceName;
            }
            
            const serviceId = checkbox.dataset.providerId || null;
            const logoPath = checkbox.dataset.logoPath || null;
            const logoUrl = checkbox.dataset.logoUrl || null;
            
            await api.addStreamingService(currentUserId, serviceName, serviceId, logoPath, logoUrl);
        }
        showMessage(`Added ${checkboxes.length} streaming service(s)!`);
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
        episodesWatched: parseInt(formData.get('episodes')),
        posterPath: formData.get('posterPath') || null,
        tmdbId: formData.get('tmdbId') || null
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
    const genres = Array.from(genreCheckboxes).map(cb => ({
        id: parseInt(cb.dataset.genreId) || null,
        name: cb.value,
        types: cb.dataset.genreTypes ? JSON.parse(cb.dataset.genreTypes) : []
    }));
    const bingeCount = parseInt(document.getElementById('binge-count').value);
    
    const ageMin = parseInt(document.getElementById('age-min')?.value) || 18;
    const ageMax = parseInt(document.getElementById('age-max')?.value) || 100;
    const locationRadius = parseInt(document.getElementById('location-radius')?.value) || 50;
    
    const genderPrefCheckboxes = document.querySelectorAll('input[name="genderPref"]:checked');
    const genderPreference = Array.from(genderPrefCheckboxes).map(cb => cb.value);
    
    const orientationPrefCheckboxes = document.querySelectorAll('input[name="orientationPref"]:checked');
    const sexualOrientationPreference = Array.from(orientationPrefCheckboxes).map(cb => cb.value);
    
    try {
        await api.updatePreferences(currentUserId, {
            genres: genres,
            bingeWatchCount: bingeCount,
            ageRange: { min: ageMin, max: ageMax },
            locationRadius: locationRadius,
            genderPreference: genderPreference,
            sexualOrientationPreference: sexualOrientationPreference
        });
        showMessage('Preferences saved!');
        // Save user ID to localStorage for match page
        localStorage.setItem('currentUserId', currentUserId);
        
        // Navigate to movie preferences section
        showSection('movie-preferences');
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

// Handle movie preferences form
const moviePreferencesForm = document.getElementById('movie-preferences-form');
if (moviePreferencesForm) {
    moviePreferencesForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!currentUserId) {
            showMessage('Please create a profile first', true);
            return;
        }
        
        const snackCheckboxes = document.querySelectorAll('input[name="snack"]:checked');
        const favoriteSnacks = Array.from(snackCheckboxes).map(cb => cb.value);
        const videoChatPreference = document.getElementById('video-chat-pref').value;
        
        try {
            await api.updateProfileDetails(currentUserId, {
                favoriteSnacks: favoriteSnacks,
                videoChatPreference: videoChatPreference
            });
            showMessage('Movie preferences saved!');
            showSection('swipe-movies');
        } catch (error) {
            showMessage('Error saving movie preferences: ' + error.message, true);
        }
    });
}

// Skip movie preferences button
const skipMoviePrefsBtn = document.getElementById('skip-movie-prefs-btn');
if (skipMoviePrefsBtn) {
    skipMoviePrefsBtn.addEventListener('click', () => {
        showSection('swipe-movies');
    });
}

// Skip swipe button - continue to profile completion
const skipSwipeBtn = document.getElementById('skip-swipe-btn');
if (skipSwipeBtn) {
    skipSwipeBtn.addEventListener('click', () => {
        // Navigate to profile view page
        setTimeout(() => {
            window.location.href = `profile-view.html?userId=${currentUserId}`;
        }, 500);
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
    const selectedPosterPath = document.getElementById('selected-poster-path');

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
                        item.addEventListener('click', async () => {
                            const title = item.dataset.title;
                            const type = item.dataset.type;
                            const id = item.dataset.id;

                            // Fetch detailed information from TMDB to ensure accuracy
                            try {
                                searchResults.innerHTML = '<div class="search-loading">Loading details...</div>';
                                const details = await api.getContentDetails(id, type);
                                
                                // Update form fields with detailed data
                                titleSearchInput.value = details.title;
                                titleInput.value = details.title;
                                selectedTmdbId.value = details.id;
                                if (selectedPosterPath) {
                                    selectedPosterPath.value = details.posterPath || '';
                                }
                                
                                // Set type
                                if (details.type === 'movie') {
                                    typeSelect.value = 'movie';
                                } else {
                                    typeSelect.value = 'tvshow';
                                }

                                // Show selected content
                                selectedTitle.textContent = details.title;
                                selectedType.textContent = details.type === 'movie' ? 'Movie' : 'TV Show';
                                selectedDisplay.style.display = 'block';

                                // Hide search results
                                searchResults.style.display = 'none';
                            } catch (error) {
                                console.error('Error fetching details:', error);
                                // Fallback to search result data
                                titleSearchInput.value = title;
                                titleInput.value = title;
                                selectedTmdbId.value = id;
                                if (selectedPosterPath) {
                                    selectedPosterPath.value = '';
                                }
                                
                                if (type === 'movie') {
                                    typeSelect.value = 'movie';
                                } else {
                                    typeSelect.value = 'tvshow';
                                }

                                selectedTitle.textContent = title;
                                selectedType.textContent = type === 'movie' ? 'Movie' : 'TV Show';
                                selectedDisplay.style.display = 'block';
                                searchResults.style.display = 'none';
                            }
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

