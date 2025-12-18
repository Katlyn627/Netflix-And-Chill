// Profile View Component
class ProfileView {
    constructor() {
        this.userId = null;
        this.userData = null;
        this.init();
    }

    init() {
        // Get user ID from URL params, localStorage, or redirect to login
        const urlParams = new URLSearchParams(window.location.search);
        const userIdFromUrl = urlParams.get('userId');
        
        if (userIdFromUrl) {
            this.userId = userIdFromUrl;
            localStorage.setItem('currentUserId', userIdFromUrl);
        } else {
            this.userId = localStorage.getItem('currentUserId');
        }
        
        if (!this.userId) {
            alert('Please log in first');
            window.location.href = 'login.html';
            return;
        }

        this.loadProfile();
        this.setupEventListeners();
    }

    async loadProfile() {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${this.userId}`);
            if (!response.ok) throw new Error('Failed to load profile');
            
            this.userData = await response.json();
            this.renderProfile();
        } catch (error) {
            console.error('Error loading profile:', error);
            alert('Failed to load profile. Please try again.');
        }
    }

    renderProfile() {
        const user = this.userData;

        // Profile header
        document.getElementById('profile-username').textContent = user.username;
        document.getElementById('profile-age').textContent = user.age || 'N/A';
        document.getElementById('profile-location').textContent = user.location || 'N/A';
        document.getElementById('profile-bio').textContent = user.bio || 'No bio added yet.';

        // User email in account settings
        document.getElementById('user-email').textContent = user.email || 'N/A';

        // Profile picture
        if (user.profilePicture) {
            document.getElementById('profile-picture').src = user.profilePicture;
            document.getElementById('profile-picture').style.display = 'block';
            document.getElementById('no-photo').style.display = 'none';
        }

        // Photo gallery
        this.renderPhotoGallery();

        // Extended profile details
        this.renderExtendedDetails();

        // Quiz responses
        this.renderQuizResponses();

        // Streaming services
        this.renderStreamingServices();

        // Watch history
        this.renderWatchHistory();

        // Favorite movies
        this.renderFavoriteMovies();

        // Preferences
        this.renderPreferences();
    }

    renderPhotoGallery() {
        const gallery = this.userData.photoGallery || [];
        const galleryContainer = document.getElementById('photo-gallery');
        const photoCount = document.getElementById('photo-count');
        
        photoCount.textContent = `(${gallery.length}/6)`;
        galleryContainer.innerHTML = '';

        gallery.forEach(photo => {
            const photoDiv = document.createElement('div');
            photoDiv.style.position = 'relative';
            photoDiv.innerHTML = `
                <img src="${photo.url}" alt="Gallery photo" style="width: 100%; height: 150px; object-fit: cover; border-radius: 5px;">
                <button class="remove-photo-btn" data-url="${photo.url}" style="position: absolute; top: 5px; right: 5px; background: red; color: white; border: none; border-radius: 50%; width: 25px; height: 25px; cursor: pointer; font-size: 12px;">×</button>
            `;
            galleryContainer.appendChild(photoDiv);
        });

        // Add remove photo event listeners
        document.querySelectorAll('.remove-photo-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const photoUrl = e.target.getAttribute('data-url');
                this.removePhoto(photoUrl);
            });
        });

        // Show/hide add photo button based on limit
        const showAddBtn = document.getElementById('show-add-photo-btn');
        if (gallery.length >= 6) {
            showAddBtn.style.display = 'none';
        } else {
            showAddBtn.style.display = 'inline-block';
        }
    }

    renderExtendedDetails() {
        const user = this.userData;

        // Least favorite movies
        const leastFavList = document.getElementById('least-favorite-movies-list');
        const noLeastFav = document.getElementById('no-least-favorites');
        if (user.leastFavoriteMovies && user.leastFavoriteMovies.length > 0) {
            leastFavList.innerHTML = user.leastFavoriteMovies.map(movie => 
                `<span class="tag">${movie}</span>`
            ).join(' ');
            if (noLeastFav) noLeastFav.style.display = 'none';
        } else {
            leastFavList.innerHTML = '<em id="no-least-favorites">No least favorite movies added yet.</em>';
        }

        // Debate topics
        const debateList = document.getElementById('debate-topics-list');
        const noDebate = document.getElementById('no-debate-topics');
        if (user.movieDebateTopics && user.movieDebateTopics.length > 0) {
            debateList.innerHTML = user.movieDebateTopics.map(topic => 
                `<span class="tag">${topic}</span>`
            ).join(' ');
            if (noDebate) noDebate.style.display = 'none';
        } else {
            debateList.innerHTML = '<em id="no-debate-topics">No debate topics added yet.</em>';
        }

        // Favorite snacks
        const snacksList = document.getElementById('favorite-snacks-list');
        const noSnacks = document.getElementById('no-snacks');
        if (user.favoriteSnacks && user.favoriteSnacks.length > 0) {
            snacksList.innerHTML = user.favoriteSnacks.map(snack => 
                `<span class="tag">${snack}</span>`
            ).join(' ');
            if (noSnacks) noSnacks.style.display = 'none';
        } else {
            snacksList.innerHTML = '<em id="no-snacks">No favorite snacks added yet.</em>';
        }

        // Video chat preference
        const videoPref = document.getElementById('video-chat-pref');
        const noVideoPref = document.getElementById('no-video-pref');
        if (user.videoChatPreference) {
            const prefText = user.videoChatPreference === 'facetime' ? 'FaceTime' :
                           user.videoChatPreference === 'zoom' ? 'Zoom' : 'Either';
            videoPref.innerHTML = `<strong>${prefText}</strong>`;
            if (noVideoPref) noVideoPref.style.display = 'none';
        } else {
            videoPref.innerHTML = '<em id="no-video-pref">Not set</em>';
        }
    }

    renderQuizResponses() {
        const quiz = this.userData.quizResponses || {};
        const quizContainer = document.getElementById('quiz-responses');
        
        if (Object.keys(quiz).length > 0) {
            quizContainer.innerHTML = '<p><strong>Quiz completed!</strong> Your responses help match you with compatible users.</p>';
        } else {
            quizContainer.innerHTML = '<em id="no-quiz-responses">No quiz responses yet.</em>';
        }
    }

    renderStreamingServices() {
        const services = this.userData.streamingServices || [];
        const servicesContainer = document.getElementById('services-list');

        if (services.length > 0) {
            servicesContainer.innerHTML = services.map(service => 
                `<span class="tag">${service.name}</span>`
            ).join(' ');
        } else {
            servicesContainer.innerHTML = '<em id="no-services">No streaming services connected yet.</em>';
        }
    }

    renderWatchHistory() {
        const history = this.userData.watchHistory || [];
        const historyContainer = document.getElementById('watch-history-list');

        if (history.length > 0) {
            historyContainer.className = 'watch-history-grid';
            
            // Escape HTML to prevent XSS - defined once for efficiency
            const escapeHtml = (str) => {
                const div = document.createElement('div');
                div.textContent = str;
                return div.innerHTML;
            };
            
            historyContainer.innerHTML = history.map(item => {
                const posterUrl = item.posterPath 
                    ? `https://image.tmdb.org/t/p/w200${item.posterPath}`
                    : 'https://via.placeholder.com/150x225?text=No+Poster';
                
                return `
                    <div class="watch-history-item" style="position: relative;">
                        <button class="remove-watch-history-btn" data-watched-at="${item.watchedAt}" style="position: absolute; top: 5px; right: 5px; background: rgba(220, 53, 69, 0.9); color: white; border: none; border-radius: 50%; width: 25px; height: 25px; cursor: pointer; font-size: 14px; font-weight: bold; z-index: 10;" title="Remove from watch history">×</button>
                        <img src="${posterUrl}" alt="${escapeHtml(item.title)}" 
                             class="watch-history-poster">
                        <div class="watch-history-title">${escapeHtml(item.title)}</div>
                    </div>
                `;
            }).join('');

            // Add event listeners for remove buttons
            document.querySelectorAll('.remove-watch-history-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const watchedAt = e.target.getAttribute('data-watched-at');
                    await this.removeWatchHistory(watchedAt);
                });
            });
        } else {
            historyContainer.className = '';
            historyContainer.innerHTML = '<em id="no-watch-history">No watch history yet.</em>';
        }
    }

    setupEventListeners() {
        // Show add photo form
        document.getElementById('show-add-photo-btn').addEventListener('click', () => {
            document.getElementById('add-photo-form').style.display = 'block';
            document.getElementById('show-add-photo-btn').style.display = 'none';
        });

        // Cancel add photo
        document.getElementById('cancel-add-photo-btn').addEventListener('click', () => {
            document.getElementById('add-photo-form').style.display = 'none';
            document.getElementById('show-add-photo-btn').style.display = 'inline-block';
            document.getElementById('photo-url').value = '';
            document.getElementById('photo-file').value = '';
        });

        // Add photo
        document.getElementById('add-photo-btn').addEventListener('click', () => {
            this.handlePhotoAdd();
        });

        // Handle file selection
        document.getElementById('photo-file').addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                // Clear URL input when file is selected
                document.getElementById('photo-url').value = '';
            }
        });

        // Edit extended profile
        document.getElementById('edit-extended-profile-btn').addEventListener('click', () => {
            this.showExtendedEditModal();
        });

        // Cancel extended edit
        document.getElementById('cancel-extended-edit-btn').addEventListener('click', () => {
            document.getElementById('edit-extended-modal').style.display = 'none';
        });

        // Submit extended profile form
        document.getElementById('extended-profile-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveExtendedProfile();
        });

        // Take quiz
        document.getElementById('take-quiz-btn').addEventListener('click', () => {
            this.showQuizModal();
        });

        // Cancel quiz
        document.getElementById('cancel-quiz-btn').addEventListener('click', () => {
            document.getElementById('quiz-modal').style.display = 'none';
        });

        // Submit quiz
        document.getElementById('quiz-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitQuiz();
        });

        // Change password button
        document.getElementById('change-password-btn').addEventListener('click', () => {
            this.showChangePasswordModal();
        });

        // Cancel password change
        document.getElementById('cancel-password-change-btn').addEventListener('click', () => {
            document.getElementById('change-password-modal').style.display = 'none';
            document.getElementById('change-password-form').reset();
        });

        // Submit password change
        document.getElementById('change-password-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.changePassword();
        });

        // Toggle password visibility for all password fields
        document.querySelectorAll('.toggle-password').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target.getAttribute('data-target');
                const input = document.getElementById(target);
                if (input.type === 'password') {
                    input.type = 'text';
                    e.target.textContent = 'Hide';
                } else {
                    input.type = 'password';
                    e.target.textContent = 'Show';
                }
            });
        });

        // Setup new modals
        this.setupFavoriteMoviesModal();
        this.setupWatchHistoryModal();
        this.setupPreferencesModal();
    }

    async addPhoto(photoUrl) {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${this.userId}/photos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ photoUrl })
            });

            if (!response.ok) throw new Error('Failed to add photo');

            this.userData = (await response.json()).user;
            this.renderPhotoGallery();
            
            document.getElementById('add-photo-form').style.display = 'none';
            document.getElementById('show-add-photo-btn').style.display = 'inline-block';
            document.getElementById('photo-url').value = '';
            document.getElementById('photo-file').value = '';
            
            alert('Photo added successfully!');
        } catch (error) {
            console.error('Error adding photo:', error);
            alert('Failed to add photo. Please try again.');
        }
    }

    async handlePhotoAdd() {
        const fileInput = document.getElementById('photo-file');
        const urlInput = document.getElementById('photo-url');

        // Check if a file is selected
        if (fileInput.files && fileInput.files[0]) {
            const file = fileInput.files[0];
            
            // Validate file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
                return;
            }

            // Validate file size (max 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB in bytes
            if (file.size > maxSize) {
                alert('File size must be less than 5MB');
                return;
            }

            // Convert file to base64
            const reader = new FileReader();
            reader.onload = async (e) => {
                const base64Data = e.target.result;
                await this.addPhoto(base64Data);
            };
            reader.onerror = () => {
                alert('Failed to read file. Please try again.');
            };
            reader.readAsDataURL(file);
        } else {
            // Use URL input
            const photoUrl = urlInput.value.trim();
            if (photoUrl) {
                await this.addPhoto(photoUrl);
            } else {
                alert('Please enter a URL or select a file');
            }
        }
    }

    async removePhoto(photoUrl) {
        if (!confirm('Are you sure you want to remove this photo?')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/users/${this.userId}/photos`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ photoUrl })
            });

            if (!response.ok) throw new Error('Failed to remove photo');

            this.userData = (await response.json()).user;
            this.renderPhotoGallery();
            
            alert('Photo removed successfully!');
        } catch (error) {
            console.error('Error removing photo:', error);
            alert('Failed to remove photo. Please try again.');
        }
    }

    showExtendedEditModal() {
        const user = this.userData;
        
        document.getElementById('least-favorite-input').value = 
            (user.leastFavoriteMovies || []).join(', ');
        document.getElementById('debate-topics-input').value = 
            (user.movieDebateTopics || []).join(', ');
        document.getElementById('snacks-input').value = 
            (user.favoriteSnacks || []).join(', ');
        document.getElementById('video-chat-select').value = 
            user.videoChatPreference || '';

        document.getElementById('edit-extended-modal').style.display = 'flex';
    }

    async saveExtendedProfile() {
        const leastFavorites = document.getElementById('least-favorite-input').value
            .split(',').map(s => s.trim()).filter(s => s);
        const debateTopics = document.getElementById('debate-topics-input').value
            .split(',').map(s => s.trim()).filter(s => s);
        const snacks = document.getElementById('snacks-input').value
            .split(',').map(s => s.trim()).filter(s => s);
        const videoPref = document.getElementById('video-chat-select').value;

        try {
            const response = await fetch(`${API_BASE_URL}/users/${this.userId}/profile-details`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    leastFavoriteMovies: leastFavorites,
                    movieDebateTopics: debateTopics,
                    favoriteSnacks: snacks,
                    videoChatPreference: videoPref || null
                })
            });

            if (!response.ok) throw new Error('Failed to save profile details');

            this.userData = (await response.json()).user;
            this.renderExtendedDetails();
            
            document.getElementById('edit-extended-modal').style.display = 'none';
            alert('Profile details saved successfully!');
        } catch (error) {
            console.error('Error saving profile details:', error);
            alert('Failed to save profile details. Please try again.');
        }
    }

    showQuizModal() {
        const quiz = this.userData.quizResponses || {};
        
        // Pre-fill existing responses
        Object.keys(quiz).forEach(question => {
            const select = document.querySelector(`[name="${question}"]`);
            if (select) select.value = quiz[question];
        });

        document.getElementById('quiz-modal').style.display = 'flex';
    }

    async submitQuiz() {
        const form = document.getElementById('quiz-form');
        const formData = new FormData(form);
        const quizResponses = {};

        for (let [key, value] of formData.entries()) {
            if (value) {
                quizResponses[key] = value;
            }
        }

        if (Object.keys(quizResponses).length === 0) {
            alert('Please answer at least one question!');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/users/${this.userId}/quiz`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quizResponses })
            });

            if (!response.ok) throw new Error('Failed to submit quiz');

            this.userData = (await response.json()).user;
            this.renderQuizResponses();
            
            document.getElementById('quiz-modal').style.display = 'none';
            alert('Quiz submitted successfully! Your matches will be updated.');
        } catch (error) {
            console.error('Error submitting quiz:', error);
            alert('Failed to submit quiz. Please try again.');
        }
    }

    showChangePasswordModal() {
        document.getElementById('change-password-form').reset();
        document.getElementById('change-password-modal').style.display = 'flex';
    }

    async changePassword() {
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        // Validate inputs
        if (!currentPassword || !newPassword || !confirmPassword) {
            alert('Please fill in all fields');
            return;
        }

        if (newPassword.length < 6) {
            alert('New password must be at least 6 characters long');
            return;
        }

        if (newPassword !== confirmPassword) {
            alert('New passwords do not match');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/users/${this.userId}/password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to update password');
            }

            document.getElementById('change-password-modal').style.display = 'none';
            document.getElementById('change-password-form').reset();
            alert('Password updated successfully!');
        } catch (error) {
            console.error('Error changing password:', error);
            alert('Failed to update password: ' + error.message);
        }
    }

    // Favorite Movies functionality
    renderFavoriteMovies() {
        const favoriteMovies = this.userData.favoriteMovies || [];
        const favMoviesContainer = document.getElementById('favorite-movies-list');

        if (favoriteMovies.length === 0) {
            favMoviesContainer.innerHTML = '<em id="no-favorite-movies">No favorite movies added yet.</em>';
        } else {
            favMoviesContainer.innerHTML = '';
            favoriteMovies.forEach(movie => {
                const movieDiv = document.createElement('div');
                movieDiv.className = 'favorite-movie-item';
                movieDiv.style.cssText = 'background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 10px; position: relative;';
                
                const posterUrl = movie.posterPath 
                    ? `https://image.tmdb.org/t/p/w200${movie.posterPath}`
                    : 'https://via.placeholder.com/100x150?text=No+Poster';
                
                const truncatedOverview = movie.overview && movie.overview.length > 200 
                    ? movie.overview.substring(0, 200) + '...' 
                    : movie.overview || 'No description available.';
                
                movieDiv.innerHTML = `
                    <img src="${posterUrl}" alt="${movie.title}" style="width: 100px; height: 150px; object-fit: cover; border-radius: 5px; float: left; margin-right: 15px;">
                    <h4 style="margin-top: 0;">${movie.title}</h4>
                    <p style="color: #666; margin: 5px 0;">${movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : 'N/A'}</p>
                    <p style="font-size: 0.9em; margin-top: 10px;">${truncatedOverview}</p>
                    <button class="remove-favorite-movie-btn btn btn-secondary" data-movie-id="${movie.tmdbId}" style="position: absolute; top: 10px; right: 10px;">Remove</button>
                    <div style="clear: both;"></div>
                `;
                favMoviesContainer.appendChild(movieDiv);
            });

            // Add event listeners for remove buttons
            document.querySelectorAll('.remove-favorite-movie-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const movieId = e.target.getAttribute('data-movie-id');
                    await this.removeFavoriteMovie(movieId);
                });
            });
        }
    }

    async removeFavoriteMovie(movieId) {
        if (!confirm('Are you sure you want to remove this movie from your favorites?')) {
            return;
        }

        try {
            const result = await api.removeFavoriteMovie(this.userId, movieId);
            if (result.error) {
                throw new Error(result.error);
            }
            
            // Reload profile to show updated favorites
            await this.loadProfile();
            alert('Movie removed from favorites successfully!');
        } catch (error) {
            console.error('Error removing favorite movie:', error);
            alert('Failed to remove favorite movie: ' + error.message);
        }
    }

    setupFavoriteMoviesModal() {
        const addBtn = document.getElementById('add-favorite-movie-btn');
        const modal = document.getElementById('add-favorite-movie-modal');
        const cancelBtn = document.getElementById('cancel-add-movie-btn');
        const form = document.getElementById('add-favorite-movie-form');
        const searchInput = document.getElementById('movie-search');
        const searchResults = document.getElementById('movie-search-results');
        const selectedMovieDisplay = document.getElementById('selected-movie-display');
        const confirmBtn = document.getElementById('confirm-add-movie-btn');

        let selectedMovie = null;
        let searchTimeout = null;

        addBtn.addEventListener('click', () => {
            modal.style.display = 'block';
            searchInput.value = '';
            searchResults.style.display = 'none';
            selectedMovieDisplay.style.display = 'none';
            selectedMovie = null;
            confirmBtn.disabled = true;
        });

        cancelBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            form.reset();
        });

        // Movie search with debouncing
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }

            if (query.length < 2) {
                searchResults.style.display = 'none';
                return;
            }

            searchTimeout = setTimeout(async () => {
                try {
                    const response = await api.searchMoviesAndShows(query, 'movie');
                    const results = response.results || [];
                    this.displayMovieSearchResults(results, searchResults, (movie) => {
                        selectedMovie = movie;
                        this.displaySelectedMovie(movie);
                        confirmBtn.disabled = false;
                        searchResults.style.display = 'none';
                    });
                } catch (error) {
                    console.error('Error searching movies:', error);
                }
            }, 300);
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!selectedMovie) {
                alert('Please select a movie first');
                return;
            }

            try {
                const movieData = {
                    tmdbId: selectedMovie.id.toString(),
                    title: selectedMovie.title,
                    posterPath: selectedMovie.posterPath,
                    overview: selectedMovie.overview,
                    releaseDate: selectedMovie.releaseDate
                };

                const result = await api.addFavoriteMovie(this.userId, movieData);
                if (result.error) {
                    throw new Error(result.error);
                }

                modal.style.display = 'none';
                form.reset();
                await this.loadProfile();
                alert('Movie added to favorites successfully!');
            } catch (error) {
                console.error('Error adding favorite movie:', error);
                alert('Failed to add favorite movie: ' + error.message);
            }
        });
    }

    displayMovieSearchResults(results, container, onSelect) {
        container.innerHTML = '';
        
        if (results.length === 0) {
            container.innerHTML = '<div style="padding: 10px;">No movies found</div>';
            container.style.display = 'block';
            return;
        }

        results.slice(0, 5).forEach(movie => {
            const resultDiv = document.createElement('div');
            resultDiv.className = 'search-result-item';
            resultDiv.style.cssText = 'padding: 10px; cursor: pointer; border-bottom: 1px solid #ddd;';
            
            const posterUrl = movie.posterPath 
                ? `https://image.tmdb.org/t/p/w92${movie.posterPath}`
                : 'https://via.placeholder.com/46x69?text=No+Poster';
            
            resultDiv.innerHTML = `
                <img src="${posterUrl}" alt="${movie.title}" style="width: 46px; height: 69px; object-fit: cover; border-radius: 3px; float: left; margin-right: 10px;">
                <div style="overflow: hidden;">
                    <strong>${movie.title}</strong><br>
                    <small style="color: #666;">${movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : 'N/A'}</small>
                </div>
                <div style="clear: both;"></div>
            `;

            resultDiv.addEventListener('click', async () => {
                // Fetch detailed information from TMDB to ensure accuracy
                try {
                    searchResults.innerHTML = '<div style="padding: 10px;">Loading details...</div>';
                    const details = await api.getContentDetails(movie.id, 'movie');
                    onSelect(details);
                } catch (error) {
                    console.error('Error fetching movie details:', error);
                    // Fallback to search result data
                    onSelect(movie);
                }
            });
            resultDiv.addEventListener('mouseenter', () => {
                resultDiv.style.background = '#f0f0f0';
            });
            resultDiv.addEventListener('mouseleave', () => {
                resultDiv.style.background = 'white';
            });

            container.appendChild(resultDiv);
        });

        container.style.display = 'block';
    }

    displaySelectedMovie(movie) {
        const display = document.getElementById('selected-movie-display');
        const poster = document.getElementById('selected-movie-poster');
        const title = document.getElementById('selected-movie-title');
        const year = document.getElementById('selected-movie-year');
        const overview = document.getElementById('selected-movie-overview');

        const posterUrl = movie.posterPath 
            ? `https://image.tmdb.org/t/p/w200${movie.posterPath}`
            : 'https://via.placeholder.com/100x150?text=No+Poster';

        poster.src = posterUrl;
        title.textContent = movie.title;
        year.textContent = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : 'N/A';
        overview.textContent = movie.overview || 'No description available.';

        display.style.display = 'block';
    }

    // Watch History functionality
    setupWatchHistoryModal() {
        const addBtn = document.getElementById('add-watch-history-btn');
        const modal = document.getElementById('add-watch-history-modal');
        const cancelBtn = document.getElementById('cancel-add-watch-history-btn');
        const form = document.getElementById('add-watch-history-form');
        const searchInput = document.getElementById('watch-history-search');
        const searchResults = document.getElementById('watch-history-search-results');
        const selectedItemDisplay = document.getElementById('selected-watch-item-display');
        const confirmBtn = document.getElementById('confirm-add-watch-history-btn');
        const typeGroup = document.getElementById('watch-history-type-group');
        const genreGroup = document.getElementById('watch-history-genre-group');
        const serviceGroup = document.getElementById('watch-history-service-group');
        const episodesGroup = document.getElementById('watch-history-episodes-group');

        let selectedItem = null;
        let searchTimeout = null;

        addBtn.addEventListener('click', () => {
            modal.style.display = 'block';
            searchInput.value = '';
            searchResults.style.display = 'none';
            selectedItemDisplay.style.display = 'none';
            typeGroup.style.display = 'none';
            genreGroup.style.display = 'none';
            serviceGroup.style.display = 'none';
            episodesGroup.style.display = 'none';
            selectedItem = null;
            confirmBtn.disabled = true;
        });

        cancelBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            form.reset();
        });

        // Search with debouncing
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }

            if (query.length < 2) {
                searchResults.style.display = 'none';
                return;
            }

            searchTimeout = setTimeout(async () => {
                try {
                    const response = await api.searchMoviesAndShows(query, 'multi');
                    const results = response.results || [];
                    this.displayWatchHistorySearchResults(results, searchResults, (item) => {
                        selectedItem = item;
                        this.displaySelectedWatchItem(item);
                        confirmBtn.disabled = false;
                        searchResults.style.display = 'none';
                        typeGroup.style.display = 'block';
                        genreGroup.style.display = 'block';
                        serviceGroup.style.display = 'block';
                        
                        // Show episodes field for TV shows
                        const typeSelect = document.getElementById('watch-history-type');
                        if (item.type === 'tv') {
                            typeSelect.value = 'tvshow';
                            episodesGroup.style.display = 'block';
                        } else {
                            typeSelect.value = 'movie';
                            episodesGroup.style.display = 'none';
                        }
                    });
                } catch (error) {
                    console.error('Error searching:', error);
                }
            }, 300);
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!selectedItem) {
                alert('Please select an item first');
                return;
            }

            const type = document.getElementById('watch-history-type').value;
            const genre = document.getElementById('watch-history-genre').value;
            const service = document.getElementById('watch-history-service').value;
            const episodesInput = document.getElementById('watch-history-episodes').value;
            const episodes = parseInt(episodesInput) || 1;

            if (!type) {
                alert('Please select a type');
                return;
            }

            try {
                const watchData = {
                    title: selectedItem.title || selectedItem.name,
                    type: type,
                    genre: genre || '',
                    service: service || '',
                    episodesWatched: type === 'tvshow' || type === 'series' ? episodes : 1,
                    posterPath: selectedItem.posterPath || null,
                    tmdbId: selectedItem.id ? selectedItem.id.toString() : null
                };

                const result = await api.addWatchHistory(this.userId, watchData);
                if (result.error) {
                    throw new Error(result.error);
                }

                modal.style.display = 'none';
                form.reset();
                await this.loadProfile();
                alert('Added to watch history successfully!');
            } catch (error) {
                console.error('Error adding to watch history:', error);
                alert('Failed to add to watch history: ' + error.message);
            }
        });
    }

    displayWatchHistorySearchResults(results, container, onSelect) {
        container.innerHTML = '';
        
        if (results.length === 0) {
            container.innerHTML = '<div style="padding: 10px;">No results found</div>';
            container.style.display = 'block';
            return;
        }

        results.slice(0, 5).forEach(item => {
            const resultDiv = document.createElement('div');
            resultDiv.className = 'search-result-item';
            resultDiv.style.cssText = 'padding: 10px; cursor: pointer; border-bottom: 1px solid #ddd;';
            
            const posterUrl = item.posterPath 
                ? `https://image.tmdb.org/t/p/w92${item.posterPath}`
                : 'https://via.placeholder.com/46x69?text=No+Poster';
            
            const title = item.title;
            const year = item.releaseDate;
            const mediaType = item.type === 'movie' ? 'Movie' : 'TV Show';
            
            resultDiv.innerHTML = `
                <img src="${posterUrl}" alt="${title}" style="width: 46px; height: 69px; object-fit: cover; border-radius: 3px; float: left; margin-right: 10px;">
                <div style="overflow: hidden;">
                    <strong>${title}</strong><br>
                    <small style="color: #666;">${mediaType} ${year ? '(' + new Date(year).getFullYear() + ')' : ''}</small>
                </div>
                <div style="clear: both;"></div>
            `;

            resultDiv.addEventListener('click', async () => {
                // Fetch detailed information from TMDB to ensure accuracy
                try {
                    searchResults.innerHTML = '<div style="padding: 10px;">Loading details...</div>';
                    const details = await api.getContentDetails(item.id, item.type);
                    onSelect(details);
                } catch (error) {
                    console.error('Error fetching content details:', error);
                    // Fallback to search result data
                    onSelect(item);
                }
            });
            resultDiv.addEventListener('mouseenter', () => {
                resultDiv.style.background = '#f0f0f0';
            });
            resultDiv.addEventListener('mouseleave', () => {
                resultDiv.style.background = 'white';
            });

            container.appendChild(resultDiv);
        });

        container.style.display = 'block';
    }

    displaySelectedWatchItem(item) {
        const display = document.getElementById('selected-watch-item-display');
        const poster = document.getElementById('selected-watch-item-poster');
        const title = document.getElementById('selected-watch-item-title');
        const type = document.getElementById('selected-watch-item-type');
        const overview = document.getElementById('selected-watch-item-overview');

        const posterUrl = item.posterPath 
            ? `https://image.tmdb.org/t/p/w200${item.posterPath}`
            : 'https://via.placeholder.com/100x150?text=No+Poster';

        poster.src = posterUrl;
        title.textContent = item.title;
        const mediaType = item.type === 'movie' ? 'Movie' : 'TV Show';
        const year = item.releaseDate;
        type.textContent = `${mediaType} ${year ? '(' + new Date(year).getFullYear() + ')' : ''}`;
        overview.textContent = item.overview || 'No description available.';

        display.style.display = 'block';
    }

    async removeWatchHistory(watchedAt) {
        if (!confirm('Are you sure you want to remove this item from your watch history?')) {
            return;
        }

        try {
            const result = await api.removeWatchHistory(this.userId, watchedAt);
            if (result.error) {
                throw new Error(result.error);
            }
            
            // Reload profile to show updated watch history
            await this.loadProfile();
            alert('Item removed from watch history successfully!');
        } catch (error) {
            console.error('Error removing watch history item:', error);
            alert('Failed to remove item from watch history: ' + error.message);
        }
    }

    // Preferences functionality
    renderPreferences() {
        const preferences = this.userData.preferences || {};
        const genresList = document.getElementById('genres-list');
        const bingeCountDisplay = document.getElementById('binge-count-display');

        // Render genres
        if (preferences.genres && preferences.genres.length > 0) {
            genresList.innerHTML = preferences.genres.map(genre => 
                `<span style="display: inline-block; background: #667eea; color: white; padding: 5px 10px; border-radius: 15px; margin: 5px;">${genre}</span>`
            ).join('');
        } else {
            genresList.innerHTML = '<em id="no-genres">No genres selected.</em>';
        }

        // Render binge count
        if (preferences.bingeWatchCount) {
            bingeCountDisplay.innerHTML = `${preferences.bingeWatchCount} episodes per sitting`;
        } else {
            bingeCountDisplay.innerHTML = '<em id="no-binge-count">Not set</em>';
        }
    }

    setupPreferencesModal() {
        const editBtn = document.getElementById('edit-preferences-btn');
        const modal = document.getElementById('edit-preferences-modal');
        const cancelBtn = document.getElementById('cancel-edit-preferences-btn');
        const form = document.getElementById('edit-preferences-form');

        editBtn.addEventListener('click', () => {
            // Pre-populate current preferences
            const preferences = this.userData.preferences || {};
            
            // Set genres
            if (preferences.genres) {
                document.querySelectorAll('input[name="genre"]').forEach(checkbox => {
                    checkbox.checked = preferences.genres.includes(checkbox.value);
                });
            }

            // Set binge count
            if (preferences.bingeWatchCount) {
                document.getElementById('edit-binge-count').value = preferences.bingeWatchCount;
            }

            modal.style.display = 'block';
        });

        cancelBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const selectedGenres = Array.from(document.querySelectorAll('input[name="genre"]:checked'))
                .map(cb => cb.value);
            const bingeCountInput = document.getElementById('edit-binge-count').value;
            const bingeCount = parseInt(bingeCountInput) || 1;

            try {
                const result = await api.updatePreferences(this.userId, {
                    genres: selectedGenres,
                    bingeWatchCount: bingeCount
                });

                if (result.error) {
                    throw new Error(result.error);
                }

                modal.style.display = 'none';
                await this.loadProfile();
                alert('Preferences updated successfully!');
            } catch (error) {
                console.error('Error updating preferences:', error);
                alert('Failed to update preferences: ' + error.message);
            }
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ProfileView();
});
