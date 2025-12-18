// Login functionality
// Toggle password visibility
document.getElementById('toggle-password').addEventListener('click', function() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.getElementById('toggle-password');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.textContent = 'Hide';
    } else {
        passwordInput.type = 'password';
        toggleBtn.textContent = 'Show';
    }
});

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const userId = document.getElementById('user-id').value.trim();
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('error-message');
    
    if (!userId) {
        errorDiv.textContent = 'Please enter your user ID';
        errorDiv.style.display = 'block';
        return;
    }

    if (!password) {
        errorDiv.textContent = 'Please enter your password';
        errorDiv.style.display = 'block';
        return;
    }
    
    try {
        // Login with password
        const result = await api.loginUser(userId, password);
        
        if (result && !result.error) {
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
            errorDiv.textContent = result.error || 'Invalid credentials. Please check your user ID and password.';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        errorDiv.textContent = 'Error logging in: ' + error.message;
        errorDiv.style.display = 'block';
    }
});
