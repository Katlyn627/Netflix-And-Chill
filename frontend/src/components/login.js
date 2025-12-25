// Login functionality
document.addEventListener('DOMContentLoaded', function() {
    // Toggle password visibility
    const togglePasswordBtn = document.getElementById('toggle-password');
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', function() {
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
    }

    // Login form submission
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('error-message');
        
        if (!email) {
            errorDiv.textContent = 'Please enter your email';
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
            const result = await api.loginUser(email, password);
            
            if (result && !result.error) {
                // Save user ID to localStorage
                localStorage.setItem('currentUserId', result.userId || email);
                
                // Show success and redirect
                errorDiv.style.display = 'none';
                
                const successDiv = document.createElement('div');
                successDiv.className = 'success-message';
                successDiv.textContent = 'Login successful! Redirecting to your profile...';
                document.querySelector('.login-container').insertBefore(successDiv, document.querySelector('.card'));
                
                setTimeout(() => {
                    window.location.href = 'profile-view.html';
                }, 1500);
            } else {
                errorDiv.textContent = result.error || 'Invalid credentials. Please check your email and password.';
                errorDiv.style.display = 'block';
            }
        } catch (error) {
            errorDiv.textContent = 'Error logging in: ' + error.message;
            errorDiv.style.display = 'block';
        }
    });
});
