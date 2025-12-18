// Profile View Component
class ProfileView {
    constructor() {
        this.userId = null;
        this.userData = null;
        this.init();
    }

    init() {
        // Get user ID from localStorage or URL
        this.userId = localStorage.getItem('currentUserId');
        
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
        if (user.leastFavoriteMovies && user.leastFavoriteMovies.length > 0) {
            leastFavList.innerHTML = user.leastFavoriteMovies.map(movie => 
                `<span class="tag">${movie}</span>`
            ).join(' ');
            document.getElementById('no-least-favorites').style.display = 'none';
        } else {
            document.getElementById('no-least-favorites').style.display = 'block';
        }

        // Debate topics
        const debateList = document.getElementById('debate-topics-list');
        if (user.movieDebateTopics && user.movieDebateTopics.length > 0) {
            debateList.innerHTML = user.movieDebateTopics.map(topic => 
                `<span class="tag">${topic}</span>`
            ).join(' ');
            document.getElementById('no-debate-topics').style.display = 'none';
        } else {
            document.getElementById('no-debate-topics').style.display = 'block';
        }

        // Favorite snacks
        const snacksList = document.getElementById('favorite-snacks-list');
        if (user.favoriteSnacks && user.favoriteSnacks.length > 0) {
            snacksList.innerHTML = user.favoriteSnacks.map(snack => 
                `<span class="tag">${snack}</span>`
            ).join(' ');
            document.getElementById('no-snacks').style.display = 'none';
        } else {
            document.getElementById('no-snacks').style.display = 'block';
        }

        // Video chat preference
        const videoPref = document.getElementById('video-chat-pref');
        if (user.videoChatPreference) {
            const prefText = user.videoChatPreference === 'facetime' ? 'FaceTime' :
                           user.videoChatPreference === 'zoom' ? 'Zoom' : 'Either';
            videoPref.innerHTML = `<strong>${prefText}</strong>`;
            document.getElementById('no-video-pref').style.display = 'none';
        } else {
            document.getElementById('no-video-pref').style.display = 'block';
        }
    }

    renderQuizResponses() {
        const quiz = this.userData.quizResponses || {};
        const quizContainer = document.getElementById('quiz-responses');
        
        if (Object.keys(quiz).length > 0) {
            quizContainer.innerHTML = '<p><strong>Quiz completed!</strong> Your responses help match you with compatible users.</p>';
            document.getElementById('no-quiz-responses').style.display = 'none';
        } else {
            document.getElementById('no-quiz-responses').style.display = 'block';
        }
    }

    renderStreamingServices() {
        const services = this.userData.streamingServices || [];
        const servicesContainer = document.getElementById('services-list');

        if (services.length > 0) {
            servicesContainer.innerHTML = services.map(service => 
                `<span class="tag">${service.name}</span>`
            ).join(' ');
            document.getElementById('no-services').style.display = 'none';
        } else {
            document.getElementById('no-services').style.display = 'block';
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
            document.getElementById('no-watch-history').style.display = 'none';
        } else {
            document.getElementById('no-watch-history').style.display = 'block';
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
        });

        // Add photo
        document.getElementById('add-photo-btn').addEventListener('click', () => {
            const photoUrl = document.getElementById('photo-url').value.trim();
            if (photoUrl) {
                this.addPhoto(photoUrl);
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
            
            alert('Photo added successfully!');
        } catch (error) {
            console.error('Error adding photo:', error);
            alert('Failed to add photo. Please try again.');
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
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ProfileView();
});
