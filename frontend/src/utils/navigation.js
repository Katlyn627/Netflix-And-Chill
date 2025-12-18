// Navigation utility functions

/**
 * Updates the profile icon in the navigation bar with the user's profile picture
 * @param {string} userId - The ID of the current user
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
            profileNavIcon.innerHTML = `<img src="${user.profilePicture}" alt="Profile">`;
        }
        
        if (profileNavBtn) {
            profileNavBtn.href = `profile-view.html?userId=${userId}`;
        }
    } catch (error) {
        console.error('Error updating nav profile icon:', error);
    }
}
