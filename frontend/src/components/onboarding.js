/**
 * Onboarding Component
 * Handles the onboarding flow for Netflix & Chill app
 * Brand Kit: Cinematic Red (#E50914), Black, White
 */

// Current screen index
let currentScreen = 0;
const totalScreens = 4;

// Check if user has already completed onboarding
function checkOnboardingStatus() {
    const hasCompletedOnboarding = localStorage.getItem('onboardingCompleted');
    if (hasCompletedOnboarding === 'true') {
        // User has already seen onboarding, redirect to main app
        window.location.href = 'homepage.html';
    }
}

// Initialize onboarding on page load
document.addEventListener('DOMContentLoaded', () => {
    checkOnboardingStatus();
    updateNavigationButtons();
    
    // Add swipe gesture support for mobile
    addSwipeSupport();
    
    // Add keyboard navigation
    document.addEventListener('keydown', handleKeyboardNavigation);
    
    // Allow clicking on progress dots to navigate
    const dots = document.querySelectorAll('.progress-dot');
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            goToScreen(index);
        });
    });
    
    // Preload images for smooth transitions
    preloadImages();
});

// Navigate to next screen
function nextScreen() {
    if (currentScreen < totalScreens - 1) {
        goToScreen(currentScreen + 1);
    }
}

// Navigate to previous screen
function prevScreen() {
    if (currentScreen > 0) {
        goToScreen(currentScreen - 1);
    }
}

// Go to specific screen
function goToScreen(screenIndex) {
    if (screenIndex < 0 || screenIndex >= totalScreens) {
        return;
    }

    // Get all screens
    const screens = document.querySelectorAll('.onboarding-screen');
    const dots = document.querySelectorAll('.progress-dot');

    // Update current screen
    screens[currentScreen].classList.remove('active');
    screens[currentScreen].classList.add('prev');
    
    screens[screenIndex].classList.remove('prev');
    screens[screenIndex].classList.add('active');

    // Update progress dots
    dots[currentScreen].classList.remove('active');
    dots[screenIndex].classList.add('active');

    // Update current screen index
    currentScreen = screenIndex;

    // Update navigation buttons
    updateNavigationButtons();

    // Announce screen change for screen readers
    announceScreenChange(screenIndex);
}

// Update navigation button states
function updateNavigationButtons() {
    const prevButton = document.querySelector('.nav-prev');
    const nextButton = document.querySelector('.nav-next');

    if (prevButton) {
        prevButton.disabled = currentScreen === 0;
        prevButton.style.opacity = currentScreen === 0 ? '0.3' : '1';
    }

    if (nextButton) {
        nextButton.disabled = currentScreen === totalScreens - 1;
        nextButton.style.opacity = currentScreen === totalScreens - 1 ? '0.3' : '1';
    }
}

// Complete onboarding and proceed to profile creation
function completeOnboarding() {
    // Mark onboarding as completed
    localStorage.setItem('onboardingCompleted', 'true');
    // Mark that profile needs to be created
    localStorage.setItem('profileCreated', 'false');
    
    // Add a nice completion animation
    const screens = document.querySelectorAll('.onboarding-screen');
    screens[currentScreen].style.transform = 'scale(0.95)';
    screens[currentScreen].style.opacity = '0';
    
    // Redirect to profile creation after animation
    setTimeout(() => {
        window.location.href = 'profile.html';
    }, 500);
}

// Navigate to login page for existing members
async function goToLogin() {
    // Check if Auth0 is configured and use it as default login
    try {
        // Wait for Auth0 config to load if it's available
        if (window.auth0ConfigReady) {
            await window.auth0ConfigReady;
        }
        
        // If Auth0 is configured, redirect to login with auto-login parameter
        if (window.AUTH0_CONFIGURED) {
            window.location.href = 'login.html?auto_login=true';
        } else {
            // Otherwise, go to traditional login
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Error checking Auth0 config:', error);
        // Fallback to traditional login
        window.location.href = 'login.html';
    }
}

// Add swipe gesture support for mobile devices
function addSwipeSupport() {
    let touchStartX = 0;
    let touchEndX = 0;
    const container = document.querySelector('.onboarding-container');

    container.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, false);

    container.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipeGesture();
    }, false);

    function handleSwipeGesture() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swiped left - go to next screen
                nextScreen();
            } else {
                // Swiped right - go to previous screen
                prevScreen();
            }
        }
    }
}

// Handle keyboard navigation
function handleKeyboardNavigation(e) {
    switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
            e.preventDefault();
            nextScreen();
            break;
        case 'ArrowLeft':
        case 'ArrowUp':
            e.preventDefault();
            prevScreen();
            break;
        case 'Home':
            e.preventDefault();
            goToScreen(0);
            break;
        case 'End':
            e.preventDefault();
            goToScreen(totalScreens - 1);
            break;
    }
}

// Announce screen change for screen readers (accessibility)
function announceScreenChange(screenIndex) {
    const titles = [
        'Welcome to Netflix & Chill',
        'Chat & Watch Together',
        'Build Real Connections',
        'Discover Matches Through Movies'
    ];

    // Create or update aria-live region
    let liveRegion = document.getElementById('screen-announcement');
    if (!liveRegion) {
        liveRegion = document.createElement('div');
        liveRegion.id = 'screen-announcement';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.style.position = 'absolute';
        liveRegion.style.left = '-10000px';
        liveRegion.style.width = '1px';
        liveRegion.style.height = '1px';
        liveRegion.style.overflow = 'hidden';
        document.body.appendChild(liveRegion);
    }

    liveRegion.textContent = `${titles[screenIndex]}. Screen ${screenIndex + 1} of ${totalScreens}`;
}

// Preload images for smooth transitions
function preloadImages() {
    const images = [
        'assets/onboarding/logo.png',
        'assets/onboarding/onboard1.png',
        'assets/onboarding/onboard2.png',
        'assets/onboarding/onboard3.png'
    ];

    images.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// Reset onboarding (for testing/development)
function resetOnboarding() {
    localStorage.removeItem('onboardingCompleted');
    window.location.reload();
}

// Expose reset function to console for development
if (typeof window !== 'undefined') {
    window.resetOnboarding = resetOnboarding;
}
