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
            historyContainer.innerHTML = history.slice(0, 10).map(item => 
                `<div class="watch-item">
                    <strong>${item.title}</strong> (${item.type}) - ${item.genre || 'N/A'}
                </div>`
            ).join('');
        } else {
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

        // Edit profile button
        document.getElementById('edit-profile-btn').addEventListener('click', () => {
            window.location.href = 'profile.html';
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
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ProfileView();
});
