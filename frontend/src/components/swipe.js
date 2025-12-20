/**
 * Swipe Feature Component
 * Allows users to swipe through movies and like/dislike them
 * Supports unlimited swiping with dynamic loading
 */

// Constants - Unlimited swipes enabled
const UNLIMITED_SWIPES = true;
const INITIAL_LOAD_COUNT = 50; // Load 50 movies initially
const RELOAD_THRESHOLD = 10; // When stack has 10 or fewer movies, load more

let currentMovieIndex = 0;
let movieStack = [];
let isDragging = false;
let startX = 0;
let currentX = 0;
let currentPage = 1;
let isLoadingMore = false;

/**
 * Initialize the swipe feature
 */
async function initializeSwipe(userId) {
  if (!userId) {
    console.error('User ID is required for swipe feature');
    return;
  }

  try {
    // Update likes counter if available
    const statsResponse = await fetch(`${window.API_BASE_URL || 'http://localhost:3000/api'}/swipe/stats/${userId}`);
    const statsData = await statsResponse.json();
    
    if (statsData.success) {
      const likesCounter = document.getElementById('total-likes-counter');
      if (likesCounter && statsData.totalLikes !== undefined) {
        likesCounter.textContent = statsData.totalLikes;
      }
    }

    // Fetch movies for swiping - unlimited
    currentPage = 1;
    const response = await fetch(`${window.API_BASE_URL || 'http://localhost:3000/api'}/swipe/movies/${userId}?limit=${INITIAL_LOAD_COUNT}&page=${currentPage}`);
    const data = await response.json();

    if (data.success && data.movies) {
      movieStack = data.movies;
      currentMovieIndex = 0;
      renderCurrentMovie();
      setupSwipeListeners();
    } else {
      showSwipeMessage('No more movies to show. Check back later!');
    }
  } catch (error) {
    console.error('Error initializing swipe:', error);
    showSwipeMessage('Error loading movies. Please try again.', true);
  }
}

/**
 * Load more movies when running low
 */
async function loadMoreMoviesInBackground(userId) {
  if (isLoadingMore) return;
  
  isLoadingMore = true;
  try {
    currentPage++;
    const response = await fetch(`${window.API_BASE_URL || 'http://localhost:3000/api'}/swipe/movies/${userId}?limit=${INITIAL_LOAD_COUNT}&page=${currentPage}`);
    const data = await response.json();

    if (data.success && data.movies && data.movies.length > 0) {
      // Append new movies to the stack
      movieStack = [...movieStack, ...data.movies];
      console.log(`Loaded ${data.movies.length} more movies. Total in stack: ${movieStack.length}`);
    }
  } catch (error) {
    console.error('Error loading more movies:', error);
  } finally {
    isLoadingMore = false;
  }
}

/**
 * Render the current movie card
 */
function renderCurrentMovie() {
  const container = document.getElementById('swipe-card-container');
  if (!container) return;

  // Check if we need to load more movies in the background
  const remainingMovies = movieStack.length - currentMovieIndex;
  if (remainingMovies <= RELOAD_THRESHOLD && !isLoadingMore) {
    const userId = window.currentUserId || localStorage.getItem('currentUserId');
    if (userId) {
      loadMoreMoviesInBackground(userId);
    }
  }

  if (currentMovieIndex >= movieStack.length) {
    container.innerHTML = `
      <div class="no-more-cards">
        <h3>Loading more movies...</h3>
        <p>Please wait while we fetch more recommendations for you.</p>
        <button onclick="loadMoreMovies()" class="btn btn-primary">Refresh</button>
      </div>
    `;
    
    // Try to load more movies immediately
    const userId = window.currentUserId || localStorage.getItem('currentUserId');
    if (userId) {
      loadMoreMoviesInBackground(userId).then(() => {
        if (currentMovieIndex < movieStack.length) {
          renderCurrentMovie();
        }
      });
    }
    return;
  }

  const movie = movieStack[currentMovieIndex];
  
  container.innerHTML = `
    <div class="swipe-card" id="current-swipe-card" data-movie-id="${movie.tmdbId}">
      <div class="swipe-card-image" style="background-image: url('${movie.posterPath || ''}');">
        ${!movie.posterPath ? '<div class="no-image">No Image Available</div>' : ''}
      </div>
      <div class="swipe-card-content">
        <h3 class="movie-title">${movie.title}</h3>
        ${movie.releaseDate ? `<p class="movie-year">${new Date(movie.releaseDate).getFullYear()}</p>` : ''}
        ${movie.rating ? `<p class="movie-rating">⭐ ${movie.rating.toFixed(1)}/10</p>` : ''}
        <p class="movie-overview">${movie.overview || 'No description available.'}</p>
      </div>
      <div class="swipe-overlay swipe-like">LIKE</div>
      <div class="swipe-overlay swipe-dislike">NOPE</div>
    </div>
  `;
}

/**
 * Setup swipe gesture listeners
 */
function setupSwipeListeners() {
  const card = document.getElementById('current-swipe-card');
  if (!card) return;

  // Touch events
  card.addEventListener('touchstart', handleTouchStart, { passive: false });
  card.addEventListener('touchmove', handleTouchMove, { passive: false });
  card.addEventListener('touchend', handleTouchEnd);

  // Mouse events (for desktop)
  card.addEventListener('mousedown', handleMouseDown);
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
}

function handleTouchStart(e) {
  isDragging = true;
  startX = e.touches[0].clientX;
  currentX = startX;
}

function handleTouchMove(e) {
  if (!isDragging) return;
  e.preventDefault();
  
  currentX = e.touches[0].clientX;
  const deltaX = currentX - startX;
  const card = e.currentTarget;
  
  updateCardPosition(card, deltaX);
}

function handleTouchEnd(e) {
  if (!isDragging) return;
  isDragging = false;
  
  const deltaX = currentX - startX;
  const card = e.currentTarget;
  
  if (Math.abs(deltaX) > 100) {
    // Swipe threshold met
    if (deltaX > 0) {
      handleSwipeRight(card);
    } else {
      handleSwipeLeft(card);
    }
  } else {
    // Reset card position
    resetCardPosition(card);
  }
}

function handleMouseDown(e) {
  isDragging = true;
  startX = e.clientX;
  currentX = startX;
  e.currentTarget.style.cursor = 'grabbing';
}

function handleMouseMove(e) {
  if (!isDragging) return;
  
  currentX = e.clientX;
  const deltaX = currentX - startX;
  const card = document.getElementById('current-swipe-card');
  
  if (card) {
    updateCardPosition(card, deltaX);
  }
}

function handleMouseUp(e) {
  if (!isDragging) return;
  isDragging = false;
  
  const card = document.getElementById('current-swipe-card');
  if (!card) return;
  
  card.style.cursor = 'grab';
  const deltaX = currentX - startX;
  
  if (Math.abs(deltaX) > 100) {
    if (deltaX > 0) {
      handleSwipeRight(card);
    } else {
      handleSwipeLeft(card);
    }
  } else {
    resetCardPosition(card);
  }
}

/**
 * Update card position during drag
 */
function updateCardPosition(card, deltaX) {
  const rotation = deltaX / 20;
  card.style.transform = `translateX(${deltaX}px) rotate(${rotation}deg)`;
  
  // Show overlay based on direction
  const likeOverlay = card.querySelector('.swipe-like');
  const dislikeOverlay = card.querySelector('.swipe-dislike');
  
  if (deltaX > 0) {
    likeOverlay.style.opacity = Math.min(deltaX / 100, 1);
    dislikeOverlay.style.opacity = 0;
  } else {
    dislikeOverlay.style.opacity = Math.min(Math.abs(deltaX) / 100, 1);
    likeOverlay.style.opacity = 0;
  }
}

/**
 * Reset card to original position
 */
function resetCardPosition(card) {
  card.style.transition = 'transform 0.3s ease';
  card.style.transform = 'translateX(0) rotate(0deg)';
  
  const likeOverlay = card.querySelector('.swipe-like');
  const dislikeOverlay = card.querySelector('.swipe-dislike');
  likeOverlay.style.opacity = 0;
  dislikeOverlay.style.opacity = 0;
  
  setTimeout(() => {
    card.style.transition = '';
  }, 300);
}

/**
 * Handle swipe right (like)
 */
async function handleSwipeRight(card) {
  card.style.transition = 'transform 0.5s ease';
  card.style.transform = 'translateX(1000px) rotate(30deg)';
  
  const movie = movieStack[currentMovieIndex];
  await recordSwipeAction('like', movie);
  
  setTimeout(() => {
    currentMovieIndex++;
    renderCurrentMovie();
  }, 500);
}

/**
 * Handle swipe left (dislike)
 */
async function handleSwipeLeft(card) {
  card.style.transition = 'transform 0.5s ease';
  card.style.transform = 'translateX(-1000px) rotate(-30deg)';
  
  const movie = movieStack[currentMovieIndex];
  await recordSwipeAction('dislike', movie);
  
  setTimeout(() => {
    currentMovieIndex++;
    renderCurrentMovie();
  }, 500);
}

/**
 * Button handlers for like/dislike
 */
function handleLikeButton() {
  const card = document.getElementById('current-swipe-card');
  if (card) {
    handleSwipeRight(card);
  }
}

function handleDislikeButton() {
  const card = document.getElementById('current-swipe-card');
  if (card) {
    handleSwipeLeft(card);
  }
}

/**
 * Record swipe action to backend
 */
async function recordSwipeAction(action, movie) {
  const userId = window.currentUserId || localStorage.getItem('currentUserId');
  if (!userId) return;

  try {
    const response = await fetch(`${window.API_BASE_URL || 'http://localhost:3000/api'}/swipe/action/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tmdbId: movie.tmdbId,
        title: movie.title,
        posterPath: movie.posterPath,
        action: action
      })
    });

    const data = await response.json();
    if (data.success) {
      console.log(`Movie ${action}d:`, movie.title);
      
      // Update likes counter if available
      const likesCounter = document.getElementById('total-likes-counter');
      if (likesCounter && data.totalLikes !== undefined) {
        likesCounter.textContent = data.totalLikes;
      }
    }
  } catch (error) {
    console.error('Error recording swipe:', error);
  }
}

/**
 * Load more movies
 */
async function loadMoreMovies() {
  const userId = window.currentUserId || localStorage.getItem('currentUserId');
  if (!userId) return;

  // Reset and reload from the beginning
  currentPage = 1;
  await initializeSwipe(userId);
}

/**
 * Show message in swipe container
 */
function showSwipeMessage(message, isError = false) {
  const container = document.getElementById('swipe-card-container');
  if (!container) return;

  container.innerHTML = `
    <div class="swipe-message ${isError ? 'error' : ''}">
      <p>${message}</p>
    </div>
  `;
}

// Export functions for use in other files
if (typeof window !== 'undefined') {
  window.SwipeModule = {
    initializeSwipe,
    handleLikeButton,
    handleDislikeButton,
    loadMoreMovies
  };
}
