// Navigation utility functions

/**
 * Updates the profile icon in the navigation bar with the user's profile picture
 * 
 * @param {string} userId - The ID of the current user
 * @requires api - Global NetflixAndChillAPI instance must be available
 * 
 * This function fetches user data from the API and updates the navigation profile icon.
 * If the user has a profile picture, it will be displayed; otherwise, a default icon is shown.
 */
async function updateNavProfileIcon(userId) {
    if (!userId) {
        userId = localStorage.getItem('currentUserId');
    }
    
    if (!userId) return;

    try {
        const user = await api.getUser(userId);
        if (!user) return;
        
        const profileNavIcon = document.getElementById('profile-nav-icon');
        const profileNavBtn = document.getElementById('profile-nav-btn');
        
        if (user.profilePicture && profileNavIcon) {
            // Create img element safely to avoid XSS
            const img = document.createElement('img');
            img.src = user.profilePicture;
            img.alt = 'Profile';
            profileNavIcon.innerHTML = '';
            profileNavIcon.appendChild(img);
        }
        
        if (profileNavBtn) {
            profileNavBtn.href = `profile-view.html?userId=${encodeURIComponent(userId)}`;
        }
    } catch (error) {
        console.error('Error updating nav profile icon:', error);
    }
}
