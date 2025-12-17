// Login functionality
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const userId = document.getElementById('user-id').value.trim();
    const errorDiv = document.getElementById('error-message');
    
    if (!userId) {
        errorDiv.textContent = 'Please enter your user ID';
        errorDiv.style.display = 'block';
        return;
    }
    
    try {
        // Verify user exists
        const result = await api.getUser(userId);
        
        if (result && result.id) {
            // Save user ID to localStorage
            localStorage.setItem('currentUserId', userId);
            
            // Show success and redirect
            errorDiv.style.display = 'none';
            
            const successDiv = document.createElement('div');
            successDiv.className = 'success-message';
            successDiv.textContent = 'Login successful! Redirecting to matches...';
            document.querySelector('.login-container').insertBefore(successDiv, document.querySelector('.card'));
            
            setTimeout(() => {
                window.location.href = 'matches.html';
            }, 1500);
        } else {
            errorDiv.textContent = 'User not found. Please check your user ID or create a new profile.';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        errorDiv.textContent = 'Error logging in: ' + error.message;
        errorDiv.style.display = 'block';
    }
});
