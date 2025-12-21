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

        // Helper function to capitalize first letter
        const capitalize = (str) => {
            if (!str) return 'N/A';
            return str.charAt(0).toUpperCase() + str.slice(1);
        };

        // Profile header
        document.getElementById('profile-username').textContent = user.username;
        document.getElementById('profile-age').textContent = user.age || 'N/A';
        document.getElementById('profile-location').textContent = user.location || 'N/A';
        document.getElementById('profile-gender').textContent = capitalize(user.gender);
        document.getElementById('profile-sexual-orientation').textContent = capitalize(user.sexualOrientation);
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
            
            // Check if this photo is the current profile picture
            const isProfilePic = this.userData.profilePicture === photo.url;
            const profilePicBadge = isProfilePic 
                ? '<div style="position: absolute; top: 5px; left: 5px; background: #28a745; color: white; padding: 3px 8px; border-radius: 3px; font-size: 11px; font-weight: bold;">Profile Pic</div>' 
                : '';
            
            photoDiv.innerHTML = `
                <img src="${photo.url}" alt="Gallery photo" style="width: 100%; height: 150px; object-fit: cover; border-radius: 5px;">
                ${profilePicBadge}
                <button class="remove-photo-btn" data-url="${photo.url}" style="position: absolute; top: 5px; right: 5px; background: red; color: white; border: none; border-radius: 50%; width: 25px; height: 25px; cursor: pointer; font-size: 12px; z-index: 2;">×</button>
                ${!isProfilePic ? `<button class="set-profile-pic-btn" data-url="${photo.url}" style="position: absolute; bottom: 5px; left: 5px; right: 5px; background: rgba(102, 126, 234, 0.95); color: white; border: none; padding: 5px; border-radius: 3px; cursor: pointer; font-size: 12px; font-weight: bold;">Set as Profile Picture</button>` : ''}
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

        // Add set as profile picture event listeners
        document.querySelectorAll('.set-profile-pic-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const photoUrl = e.target.getAttribute('data-url');
                this.setAsProfilePicture(photoUrl);
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

    hasPersonalityProfile(profile) {
        return profile && profile.archetypes && profile.archetypes.length > 0;
    }

    hasArchetype() {
        return this.userData.archetype || this.hasPersonalityProfile(this.userData.personalityProfile);
    }

    renderQuizResponses() {
        const moviePrefsContainer = document.getElementById('quiz-responses');
        if (!moviePrefsContainer) return;

        const personalityProfile = this.userData.personalityProfile;
        const personalityBio = this.userData.personalityBio;
        const archetype = this.userData.archetype;
        const quizAttempts = this.userData.quizAttempts || [];
        const snacks = this.userData.favoriteSnacks || [];
        const videoChat = this.userData.videoChatPreference || 'Not specified';

        let html = '<div class="profile-section">';

        // Display personality profile if available
        if (this.hasArchetype()) {
            html += '<h3>🎬 Movie Personality</h3>';
            
            // Display primary archetype prominently if available
            if (archetype) {
                html += `
                    <div class="primary-archetype" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                        <h4 style="margin: 0 0 10px 0; color: white;">⭐ ${archetype.name}</h4>
                        <p style="margin: 0; font-size: 1.1em;">${archetype.description}</p>
                        ${archetype.strength ? `<p style="margin: 10px 0 0 0; font-size: 0.9em; opacity: 0.9;">Match Strength: ${Math.round(archetype.strength)}%</p>` : ''}
                    </div>
                `;
            }
            
            // Display personality bio
            if (personalityBio) {
                html += `<p class="personality-bio" style="font-style: italic; margin: 15px 0; padding: 15px; background: #f8f9fa; border-left: 4px solid #667eea; border-radius: 5px;">${personalityBio}</p>`;
            }
            
            // Display secondary archetypes (only if personalityProfile exists)
            if (this.hasPersonalityProfile(personalityProfile) && personalityProfile.archetypes.length > 1) {
                html += '<h4 style="margin-top: 20px;">Secondary Traits</h4>';
                html += '<div class="personality-archetypes">';
                personalityProfile.archetypes.slice(1, 3).forEach((archetype, index) => {
                    const emoji = index === 0 ? '✨' : '💫';
                    html += `
                        <div class="archetype-card">
                            <strong>${emoji} ${archetype.name}</strong>
                            <p>${archetype.description}</p>
                            ${archetype.strength ? `<small>Strength: ${Math.round(archetype.strength)}%</small>` : ''}
                        </div>
                    `;
                });
                html += '</div>';
            }
            
            // Add confidence indicator if available
            if (personalityProfile.confidence) {
                const conf = personalityProfile.confidence;
                html += `
                    <p style="margin-top: 15px; font-size: 0.9em; color: #666;">
                        <strong>Profile Confidence:</strong> ${conf.level.replace('_', ' ')} (${Math.round(conf.overall * 100)}%)
                        <br><small>${conf.message}</small>
                    </p>
                `;
            }
            
            // Display quiz completion info
            if (quizAttempts.length > 0) {
                const lastAttempt = quizAttempts[quizAttempts.length - 1];
                if (lastAttempt.completedAt) {
                    const completedDate = new Date(lastAttempt.completedAt);
                    html += `<p style="margin-top: 15px;"><small>Quiz completed: ${completedDate.toLocaleDateString()}</small></p>`;
                }
            }
            
            // Add link to get recommendations
            html += `
                <div style="margin-top: 20px; padding: 15px; background: #e7f3ff; border-radius: 8px;">
                    <p style="margin: 0;"><strong>🎯 Want personalized content recommendations?</strong></p>
                    <p style="margin: 8px 0 0 0; font-size: 0.9em;">Based on your ${archetype ? archetype.name : 'personality'}, we can suggest movies and shows you'll love!</p>
                </div>
            `;
        } else {
            // No quiz data - show call to action
            html += '<h3>🎬 Movie Personality Quiz</h3>';
            html += `
                <div style="padding: 20px; background: #f8f9fa; border-radius: 8px; text-align: center;">
                    <p style="font-size: 1.1em; margin: 0 0 15px 0;">Discover your movie personality!</p>
                    <p style="margin: 0; color: #666;">Take our personalized quiz to:</p>
                    <ul style="text-align: left; margin: 15px auto; max-width: 400px; color: #666;">
                        <li>Find your unique viewing archetype</li>
                        <li>Get personalized content recommendations</li>
                        <li>Improve your match compatibility</li>
                        <li>Connect with like-minded viewers</li>
                    </ul>
                    <p style="margin: 15px 0 0 0;"><em>Choose from 15, 25, or 50 question versions!</em></p>
                </div>
            `;
        }

        // Display movie preferences
        if (snacks.length > 0 || videoChat !== 'Not specified') {
            html += '<h3 style="margin-top: 20px;">🍿 Movie Preferences</h3>';
            if (snacks.length > 0) {
                html += `<p><strong>Favorite Snacks:</strong> ${snacks.join(', ')}</p>`;
            }
            html += `<p><strong>Video Chat Preference:</strong> ${videoChat}</p>`;
        }

        html += '</div>';
        moviePrefsContainer.innerHTML = html;
    }

    renderStreamingServices() {
        const services = this.userData.streamingServices || [];
        const servicesContainer = document.getElementById('services-list');

        if (services.length > 0) {
            // Helper function to get logo class based on service name (fallback for CSS styling)
            const getLogoClass = (name) => {
                if (!name || (typeof name === 'string' && name.trim() === '')) return 'other-logo';
                const nameLower = name.toLowerCase();
                if (nameLower.includes('netflix')) return 'netflix-logo';
                if (nameLower.includes('amazon') || nameLower.includes('prime')) return 'prime-logo';
                if (nameLower.includes('disney')) return 'disney-logo';
                if (nameLower.includes('hulu')) return 'hulu-logo';
                if (nameLower.includes('hbo')) return 'hbo-logo';
                if (nameLower.includes('apple')) return 'apple-logo';
                if (nameLower.includes('paramount')) return 'paramount-logo';
                if (nameLower.includes('peacock')) return 'peacock-logo';
                if (nameLower.includes('sling')) return 'sling-logo';
                return 'other-logo';
            };

            // Helper function to get logo text (fallback)
            const getLogoText = (name) => {
                if (!name || (typeof name === 'string' && name.trim() === '')) return '?';
                const nameLower = name.toLowerCase();
                if (nameLower.includes('netflix')) return 'N';
                if (nameLower.includes('amazon') || nameLower.includes('prime')) return 'prime';
                if (nameLower.includes('disney')) return 'D+';
                if (nameLower.includes('hulu')) return 'hulu';
                if (nameLower.includes('hbo')) return 'HBO';
                if (nameLower.includes('apple')) return ''; // Uses ::before CSS
                if (nameLower.includes('paramount')) return 'P+';
                if (nameLower.includes('peacock')) return '🦚';
                if (nameLower.includes('sling')) return 'S';
                return name.charAt(0).toUpperCase();
            };

            // Escape HTML to prevent XSS
            const escapeHtml = (str) => {
                const div = document.createElement('div');
                div.textContent = str;
                return div.innerHTML;
            };
            
            servicesContainer.className = 'services-display-grid';
            servicesContainer.innerHTML = services.map(service => {
                const serviceName = escapeHtml(service.name);
                const logoClass = getLogoClass(service.name);
                const logoText = escapeHtml(getLogoText(service.name));
                
                // Use actual logo from TMDB/Watchmode if available, otherwise fallback to CSS styled logo
                const hasActualLogo = service.logoUrl && service.logoUrl !== 'null';
                const logoContent = hasActualLogo 
                    ? `<img src="${escapeHtml(service.logoUrl)}" alt="${serviceName}" class="service-logo-image">`
                    : `<span class="service-display-logo ${logoClass}">${logoText}</span>`;
                
                return `
                    <div class="service-display-item">
                        ${logoContent}
                        <span class="service-display-name">${serviceName}</span>
                    </div>
                `;
            }).join('');
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

        // Edit basic info button
        document.getElementById('edit-basic-info-btn').addEventListener('click', () => {
            this.showBasicInfoEditModal();
        });

        // Cancel basic info edit
        document.getElementById('cancel-basic-info-edit-btn').addEventListener('click', () => {
            document.getElementById('edit-basic-info-modal').style.display = 'none';
        });

        // Submit basic info form
        document.getElementById('edit-basic-info-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveBasicInfo();
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

        // Delete profile button
        document.getElementById('delete-profile-btn').addEventListener('click', () => {
            this.deleteProfile();
        });

        // Logout button
        document.getElementById('logout-btn').addEventListener('click', () => {
            if (confirm('Are you sure you want to logout?')) {
                localStorage.removeItem('currentUserId');
                window.location.href = 'login.html';
            }
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
        this.setupStreamingServicesModal();
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
            
            // If user has no profile picture yet, automatically set this as profile picture
            if (!this.userData.profilePicture) {
                await this.setAsProfilePicture(photoUrl);
            }
            
            // Render the gallery to show the updated photos
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

            // Upload file to server
            try {
                const formData = new FormData();
                formData.append('image', file);

                const response = await fetch(`${API_BASE_URL}/uploads/image`, {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to upload image');
                }

                const data = await response.json();
                // Use the uploaded image URL
                await this.addPhoto(data.imageUrl);
            } catch (error) {
                console.error('Error uploading image:', error);
                alert('Failed to upload image: ' + error.message);
            }
        } else {
            // Use URL input
            const photoUrl = urlInput.value.trim();
            if (!photoUrl) {
                alert('Please enter a URL or select a file');
                return;
            }

            try {
                await this.addPhoto(photoUrl);
            } catch (error) {
                // Error is already handled and alerted in addPhoto(), just log for debugging
                console.error('Error adding photo from URL:', error);
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

    async setAsProfilePicture(photoUrl) {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${this.userId}/profile-picture`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profilePicture: photoUrl })
            });

            if (!response.ok) throw new Error('Failed to set profile picture');

            this.userData = (await response.json()).user;
            
            // Update the profile picture display in the header
            const profilePictureImg = document.getElementById('profile-picture');
            const noPhotoDiv = document.getElementById('no-photo');
            if (profilePictureImg && noPhotoDiv) {
                profilePictureImg.src = this.userData.profilePicture;
                profilePictureImg.style.display = 'block';
                noPhotoDiv.style.display = 'none';
            }
            
            // Re-render gallery to show the new profile pic badge
            this.renderPhotoGallery();
            
            // Update navigation icon
            await updateNavProfileIcon(this.userId);
            
            alert('Profile picture updated successfully!');
        } catch (error) {
            console.error('Error setting profile picture:', error);
            alert('Failed to set profile picture. Please try again.');
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
        const modal = document.getElementById('quiz-modal');
        if (!modal) {
            console.warn('Quiz modal not found in HTML');
            alert('Quiz feature is being updated. Please check back later!');
            return;
        }
        
        // Populate quiz questions if available
        if (typeof QUIZ_QUESTIONS !== 'undefined') {
            this.renderQuizQuestions();
        }
        
        modal.style.display = 'flex';
    }
    
    renderQuizQuestions() {
        const container = document.getElementById('quiz-questions-container');
        if (!container || typeof QUIZ_QUESTIONS === 'undefined') return;
        
        container.innerHTML = '';
        QUIZ_QUESTIONS.forEach((q, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'quiz-question';
            questionDiv.style.marginBottom = '20px';
            
            questionDiv.innerHTML = `
                <p><strong>Question ${index + 1}:</strong> ${q.question}</p>
                ${q.options.map(opt => `
                    <label style="display: block; margin: 5px 0;">
                        <input type="radio" name="${q.id}" value="${opt.value}" required class="quiz-option">
                        ${opt.label}
                    </label>
                `).join('')}
            `;
            container.appendChild(questionDiv);
        });
        
        // Add event listeners for progress tracking
        this.setupQuizProgressTracking();
    }
    
    setupQuizProgressTracking() {
        const quizOptions = document.querySelectorAll('.quiz-option');
        const submitBtn = document.getElementById('submit-quiz-btn');
        const progressBar = document.getElementById('quiz-progress-bar');
        const progressText = document.getElementById('quiz-progress-text');
        const totalQuestions = QUIZ_QUESTIONS ? QUIZ_QUESTIONS.length : 50;
        
        const updateProgress = () => {
            const answeredQuestions = new Set();
            quizOptions.forEach(option => {
                if (option.checked) {
                    answeredQuestions.add(option.name);
                }
            });
            
            const answeredCount = answeredQuestions.size;
            const remaining = totalQuestions - answeredCount;
            const progressPercent = (answeredCount / totalQuestions) * 100;
            
            // Update progress bar
            if (progressBar) {
                progressBar.style.width = `${progressPercent}%`;
            }
            
            // Update progress text
            if (progressText) {
                progressText.textContent = `${answeredCount} of ${totalQuestions} questions answered`;
            }
            
            // Enable/disable submit button
            if (submitBtn) {
                if (answeredCount === totalQuestions) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Complete Quiz';
                } else {
                    submitBtn.disabled = true;
                    submitBtn.textContent = `Complete Quiz (${remaining} remaining)`;
                }
            }
        };
        
        // Add change listeners to all radio buttons
        quizOptions.forEach(option => {
            option.addEventListener('change', updateProgress);
        });
        
        // Initial update
        updateProgress();
    }
    
    async submitQuiz() {
        try {
            const quizForm = document.getElementById('quiz-form');
            if (!quizForm) return;
            
            const formData = new FormData(quizForm);
            const answers = [];
            
            // Convert form data to answers array format for enhanced quiz processing
            for (let [questionId, selectedValue] of formData.entries()) {
                answers.push({
                    questionId: questionId,
                    selectedValue: selectedValue
                });
            }
            
            // Validate that all questions were answered
            if (typeof QUIZ_QUESTIONS !== 'undefined' && answers.length < QUIZ_QUESTIONS.length) {
                alert('Please answer all questions before submitting.');
                return;
            }
            
            const response = await fetch(`${API_BASE_URL}/users/${this.userId}/quiz`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers })
            });
            
            if (!response.ok) throw new Error('Failed to submit quiz');
            
            const result = await response.json();
            this.userData = result.user;
            
            // Display success message with personality info
            let successMessage = 'Quiz submitted successfully! Your matches will be updated.';
            if (this.hasPersonalityProfile(result.personalityProfile)) {
                const topArchetype = result.personalityProfile.archetypes[0];
                successMessage += `\n\nYour movie personality: ${topArchetype.name}`;
            }
            
            // Re-render the entire profile to show updated personality data everywhere
            this.renderProfile();
            document.getElementById('quiz-modal').style.display = 'none';
            alert(successMessage);
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

    showBasicInfoEditModal() {
        const user = this.userData;
        
        document.getElementById('edit-age').value = user.age || '';
        document.getElementById('edit-location').value = user.location || '';
        document.getElementById('edit-gender').value = user.gender || '';
        document.getElementById('edit-sexual-orientation').value = user.sexualOrientation || '';

        document.getElementById('edit-basic-info-modal').style.display = 'flex';
    }

    async saveBasicInfo() {
        const age = parseInt(document.getElementById('edit-age').value);
        const location = document.getElementById('edit-location').value.trim();
        const gender = document.getElementById('edit-gender').value;
        const sexualOrientation = document.getElementById('edit-sexual-orientation').value;

        if (!age || age < 18 || age > 120) {
            alert('Please enter a valid age (18-120)');
            return;
        }

        if (!location) {
            alert('Please enter your location');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/users/${this.userId}/profile-details`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    age,
                    location,
                    gender,
                    sexualOrientation
                })
            });

            if (!response.ok) throw new Error('Failed to save basic info');

            this.userData = (await response.json()).user;
            this.renderProfile();
            
            document.getElementById('edit-basic-info-modal').style.display = 'none';
            alert('Basic information updated successfully!');
        } catch (error) {
            console.error('Error saving basic info:', error);
            alert('Failed to save basic information. Please try again.');
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
                    container.innerHTML = '<div style="padding: 10px;">Loading details...</div>';
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
                    container.innerHTML = '<div style="padding: 10px;">Loading details...</div>';
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

        // Render genres - handle both old format (string array) and new format (object array)
        if (preferences.genres && preferences.genres.length > 0) {
            genresList.innerHTML = preferences.genres.map(genre => {
                const genreName = typeof genre === 'string' ? genre : genre.name;
                return `<span style="display: inline-block; background: #667eea; color: white; padding: 5px 10px; border-radius: 15px; margin: 5px;">${genreName}</span>`;
            }).join('');
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
            
            // Set genres - handle both old format (string array) and new format (object array)
            if (preferences.genres) {
                document.querySelectorAll('input[name="genre"]').forEach(checkbox => {
                    const isChecked = preferences.genres.some(genre => {
                        const genreName = typeof genre === 'string' ? genre : genre.name;
                        return genreName === checkbox.value;
                    });
                    checkbox.checked = isChecked;
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
                .map(cb => ({
                    id: parseInt(cb.dataset.genreId) || null,
                    name: cb.value,
                    types: cb.dataset.genreTypes ? JSON.parse(cb.dataset.genreTypes) : []
                }));
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

    async deleteProfile() {
        // First confirmation
        const firstConfirmation = confirm(
            '⚠️ WARNING: This action cannot be undone!\n\n' +
            'Are you sure you want to delete your profile?\n\n' +
            'This will permanently delete:\n' +
            '• Your profile information\n' +
            '• All your photos and watch history\n' +
            '• Your matches and likes\n' +
            '• All your preferences and data\n\n' +
            'Click OK to continue or Cancel to keep your profile.'
        );

        if (!firstConfirmation) {
            return;
        }

        // Second confirmation - require username input for extra security
        const username = this.userData.username;
        const userInput = prompt(
            `Final confirmation:\n\n` +
            `To permanently delete your profile, please type your username exactly as shown below:\n\n` +
            `"${username}"\n\n` +
            `Enter your username to confirm deletion:`
        );

        if (userInput !== username) {
            if (userInput !== null) {
                alert('Username does not match. Profile deletion cancelled.');
            }
            return;
        }

        try {
            const response = await api.deleteUser(this.userId);
            
            if (response.error) {
                throw new Error(response.error);
            }

            // Clear local storage
            localStorage.removeItem('currentUserId');
            
            alert('Your profile has been permanently deleted. You will now be redirected to the home page.');
            
            // Redirect to home page
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Error deleting profile:', error);
            alert('Failed to delete profile: ' + error.message);
        }
    }

    // Streaming Services Modal
    setupStreamingServicesModal() {
        const updateBtn = document.getElementById('update-streaming-services-btn');
        const modal = document.getElementById('update-streaming-services-modal');
        const cancelBtn = document.getElementById('cancel-update-streaming-btn');
        const form = document.getElementById('update-streaming-services-form');
        const servicesList = document.getElementById('streaming-services-list');

        updateBtn.addEventListener('click', async () => {
            modal.style.display = 'block';
            await this.loadStreamingServicesForUpdate();
        });

        cancelBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.updateStreamingServices();
        });
    }

    async loadStreamingServicesForUpdate() {
        try {
            const servicesList = document.getElementById('streaming-services-list');
            servicesList.innerHTML = '<p>Loading streaming services...</p>';

            // Get available streaming providers from TMDB
            const response = await fetch(`${API_BASE_URL}/streaming/providers?region=US`);
            if (!response.ok) throw new Error('Failed to load streaming providers');
            
            const result = await response.json();
            const providers = result.providers || [];
            
            // Clear loading message
            servicesList.innerHTML = '';
            
            // Get user's currently selected services
            const userServices = this.userData.streamingServices || [];
            const userServiceIds = userServices.map(s => s.id || s.name);
            
            // Backend already returns top 25 providers sorted alphabetically, so we use them directly
            providers.forEach(provider => {
                const serviceOption = document.createElement('div');
                serviceOption.className = 'service-option';
                
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = `update-service-${provider.id}`;
                checkbox.value = provider.name;
                checkbox.dataset.providerId = provider.id;
                checkbox.dataset.logoPath = provider.logoPath || '';
                checkbox.dataset.logoUrl = provider.logoUrl || '';
                
                // Check if user already has this service
                if (userServiceIds.includes(provider.id) || userServiceIds.includes(provider.name)) {
                    checkbox.checked = true;
                }
                
                const label = document.createElement('label');
                label.htmlFor = `update-service-${provider.id}`;
                
                // Create logo element
                const logoSpan = document.createElement('span');
                logoSpan.className = 'service-logo';
                if (provider.logoUrl) {
                    const logoImg = document.createElement('img');
                    logoImg.src = provider.logoUrl;
                    logoImg.alt = provider.name;
                    logoImg.style.width = '40px';
                    logoImg.style.height = '40px';
                    logoImg.style.objectFit = 'contain';
                    logoImg.style.borderRadius = '8px';
                    logoSpan.appendChild(logoImg);
                } else {
                    logoSpan.textContent = provider.name.substring(0, 2).toUpperCase();
                }
                
                // Create name element
                const nameSpan = document.createElement('span');
                nameSpan.className = 'service-name';
                nameSpan.textContent = provider.name;
                
                label.appendChild(logoSpan);
                label.appendChild(nameSpan);
                
                serviceOption.appendChild(checkbox);
                serviceOption.appendChild(label);
                
                servicesList.appendChild(serviceOption);
            });
        } catch (error) {
            console.error('Error loading streaming services:', error);
            document.getElementById('streaming-services-list').innerHTML = 
                '<p style="color: red;">Failed to load streaming services. Please try again.</p>';
        }
    }

    async updateStreamingServices() {
        try {
            const checkboxes = document.querySelectorAll('#streaming-services-list input[type="checkbox"]:checked');
            
            const services = Array.from(checkboxes).map(checkbox => ({
                id: checkbox.dataset.providerId || null,
                name: checkbox.value,
                logoPath: checkbox.dataset.logoPath || null,
                logoUrl: checkbox.dataset.logoUrl || null
            }));
            
            // Use the centralized API service method
            await api.updateStreamingServices(this.userId, services);
            
            // Reload user data to get updated information
            const response = await fetch(`${API_BASE_URL}/users/${this.userId}`);
            if (!response.ok) throw new Error('Failed to reload profile');
            
            this.userData = await response.json();
            this.renderStreamingServices();
            
            document.getElementById('update-streaming-services-modal').style.display = 'none';
            alert('Streaming services updated successfully!');
        } catch (error) {
            console.error('Error updating streaming services:', error);
            alert('Failed to update streaming services: ' + error.message);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ProfileView();
    const userId = localStorage.getItem('currentUserId');
    if (userId) {
        updateNavProfileIcon(userId);
    }
});
