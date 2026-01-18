/**
 * Swipe Feature Component
 * Allows users to swipe through movies and like/dislike them
 * Supports unlimited swiping with dynamic loading and gamification features
 */

// Gamification Configuration - Consider moving to environment variables for A/B testing
const UNLIMITED_SWIPES = true;
const INITIAL_LOAD_COUNT = 50; // Load 50 movies initially
const RELOAD_THRESHOLD = 10; // When stack has 10 or fewer movies, load more
const MAX_SUPER_LIKES_PER_DAY = 3;
const MAX_DAILY_SWIPES = 50;

// Gamification state
let currentMovieIndex = 0;
let movieStack = [];
let swipeHistory = []; // Track recent swipes for undo
let isDragging = false;
let startX = 0;
let currentX = 0;
let currentPage = 1;
let isLoadingMore = false;
let superLikesRemaining = MAX_SUPER_LIKES_PER_DAY;
let dailySwipesRemaining = MAX_DAILY_SWIPES;
let genresMap = {}; // Store genre ID to name mapping

/**
 * Fetch and cache genre names
 */
async function fetchGenres() {
  try {
    const response = await fetch(`${window.API_BASE_URL || 'http://localhost:3000/api'}/streaming/genres`);
    const data = await response.json();
    
    if (data && data.genres) {
      // Create a map of genre ID to genre name
      data.genres.forEach(genre => {
        genresMap[genre.id] = genre.name;
      });
    }
  } catch (error) {
    console.error('Error fetching genres:', error);
  }
}

/**
 * Get genre names from genre IDs
 */
function getGenreNames(genreIds) {
  if (!genreIds || genreIds.length === 0) return [];
  return genreIds.map(id => genresMap[id] || 'Unknown').filter(name => name !== 'Unknown');
}

/**
 * Initialize gamification counters from localStorage
 */
function initializeGamificationState() {
  const today = new Date().toDateString();
  const lastSwipeDate = localStorage.getItem('lastSwipeDate');
  
  // Reset daily counters if it's a new day
  if (lastSwipeDate !== today) {
    localStorage.setItem('lastSwipeDate', today);
    localStorage.setItem('superLikesRemaining', MAX_SUPER_LIKES_PER_DAY);
    localStorage.setItem('dailySwipesRemaining', MAX_DAILY_SWIPES);
    superLikesRemaining = MAX_SUPER_LIKES_PER_DAY;
    dailySwipesRemaining = MAX_DAILY_SWIPES;
  } else {
    superLikesRemaining = parseInt(localStorage.getItem('superLikesRemaining') || MAX_SUPER_LIKES_PER_DAY);
    dailySwipesRemaining = parseInt(localStorage.getItem('dailySwipesRemaining') || MAX_DAILY_SWIPES);
  }
  
  updateGamificationUI();
}

/**
 * Update gamification UI counters
 */
function updateGamificationUI() {
  const superLikesCounter = document.getElementById('super-likes-counter');
  const dailySwipesCounter = document.getElementById('daily-swipes-counter');
  
  if (superLikesCounter) {
    superLikesCounter.textContent = superLikesRemaining;
  }
  
  if (dailySwipesCounter) {
    dailySwipesCounter.textContent = dailySwipesRemaining;
  }
  
  // Disable super like button if no super likes remaining
  const superLikeBtn = document.querySelector('.super-like-btn');
  if (superLikeBtn) {
    superLikeBtn.disabled = superLikesRemaining <= 0;
  }
  
  // Disable undo button if no history
  const undoBtn = document.querySelector('.undo-btn');
  if (undoBtn) {
    undoBtn.disabled = swipeHistory.length === 0;
  }
}

/**
 * Initialize the swipe feature
 */
async function initializeSwipe(userId) {
  if (!userId) {
    console.error('User ID is required for swipe feature');
    return;
  }

  try {
    // Initialize gamification state
    initializeGamificationState();
    
    // Fetch genres for display
    await fetchGenres();
    
    // Update likes counter if available
    const statsResponse = await fetch(`${window.API_BASE_URL || 'http://localhost:3000/api'}/swipe/stats/${userId}`);
    const statsData = await statsResponse.json();
    
    if (statsData.success) {
      const likesCounter = document.getElementById('total-likes-counter');
      if (likesCounter && statsData.totalLikes !== undefined) {
        likesCounter.textContent = statsData.totalLikes;
      }
    }

    // Fetch movies for swiping - with streaming availability
    currentPage = 1;
    const response = await fetch(`${window.API_BASE_URL || 'http://localhost:3000/api'}/swipe/movies/${userId}?limit=${INITIAL_LOAD_COUNT}&page=${currentPage}&includeStreaming=true`);
    const data = await response.json();

    if (data.success && data.movies) {
      movieStack = data.movies;
      currentMovieIndex = 0;
      renderCurrentMovie();
      setupSwipeListeners();
      updateGamificationUI();
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
    const response = await fetch(`${window.API_BASE_URL || 'http://localhost:3000/api'}/swipe/movies/${userId}?limit=${INITIAL_LOAD_COUNT}&page=${currentPage}&includeStreaming=true`);
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
    // Don't recursively try to load more - show message instead
    container.innerHTML = `
      <div class="no-more-cards">
        <h3>Loading more movies...</h3>
        <p>Please wait while we fetch more recommendations for you.</p>
        <button onclick="loadMoreMovies()" class="btn btn-primary">Refresh</button>
      </div>
    `;
    return;
  }

  const movie = movieStack[currentMovieIndex];
  
  // Get genre names
  const genreNames = getGenreNames(movie.genreIds);
  const genresHtml = genreNames.length > 0 
    ? `<div class="movie-genres">${genreNames.slice(0, 3).map(g => `<span class="genre-tag">${g}</span>`).join('')}</div>` 
    : '';
  
  // Format rating with vote count
  const ratingHtml = movie.rating 
    ? `<div class="movie-rating-detailed">
         <span class="rating-stars">⭐ ${movie.rating.toFixed(1)}/10</span>
       </div>` 
    : '';
  
  // Format streaming availability
  let streamingHtml = '';
  if (movie.streamingAvailability && movie.streamingAvailability.available) {
    const sources = movie.streamingAvailability.sources;
    const subscriptionServices = sources.subscription || [];
    const freeServices = sources.free || [];
    
    if (subscriptionServices.length > 0 || freeServices.length > 0) {
      const allServices = [...subscriptionServices, ...freeServices];
      const serviceNames = allServices.slice(0, 3).map(s => s.name).join(', ');
      const moreCount = allServices.length > 3 ? ` +${allServices.length - 3} more` : '';
      
      streamingHtml = `
        <div class="streaming-availability">
          <div class="streaming-label">📺 Available on:</div>
          <div class="streaming-services">${serviceNames}${moreCount}</div>
        </div>
      `;
    }
  }
  
  // Show content type badge
  const contentTypeBadge = movie.contentType === 'tv' 
    ? '<span class="content-type-badge tv-badge">TV Show</span>' 
    : '<span class="content-type-badge movie-badge">Movie</span>';
  
  container.innerHTML = `
    <div class="swipe-card" id="current-swipe-card" data-movie-id="${movie.tmdbId}">
      <div class="swipe-card-image" style="background-image: url('${movie.posterPath || ''}');">
        ${!movie.posterPath ? '<div class="no-image">No Image Available</div>' : ''}
        ${contentTypeBadge}
      </div>
      <div class="swipe-card-content">
        <h3 class="movie-title">${movie.title}</h3>
        <div class="movie-meta">
          ${movie.releaseDate ? `<span class="movie-year">${new Date(movie.releaseDate).getFullYear()}</span>` : ''}
          ${ratingHtml}
        </div>
        ${genresHtml}
        ${streamingHtml}
        <p class="movie-overview">${movie.overview || 'No description available.'}</p>
      </div>
      <div class="swipe-overlay swipe-like">LIKE</div>
      <div class="swipe-overlay swipe-dislike">NOPE</div>
      <div class="swipe-overlay swipe-super-like">SUPER LIKE</div>
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
  
  // Save to history for undo
  swipeHistory.push({
    action: 'like',
    movie: movie,
    index: currentMovieIndex
  });
  
  // Update daily swipes counter
  dailySwipesRemaining--;
  localStorage.setItem('dailySwipesRemaining', dailySwipesRemaining);
  
  setTimeout(() => {
    currentMovieIndex++;
    renderCurrentMovie();
    setupSwipeListeners();
    updateGamificationUI();
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
  
  // Save to history for undo
  swipeHistory.push({
    action: 'dislike',
    movie: movie,
    index: currentMovieIndex
  });
  
  // Update daily swipes counter
  dailySwipesRemaining--;
  localStorage.setItem('dailySwipesRemaining', dailySwipesRemaining);
  
  setTimeout(() => {
    currentMovieIndex++;
    renderCurrentMovie();
    setupSwipeListeners();
    updateGamificationUI();
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
 * Handle super like button
 */
function handleSuperLikeButton() {
  if (superLikesRemaining <= 0) {
    alert('No Super Likes remaining today! Come back tomorrow for more.');
    return;
  }
  
  const card = document.getElementById('current-swipe-card');
  if (!card) return;
  
  const movieId = card.dataset.movieId;
  const movie = movieStack[currentMovieIndex];
  
  // Show super like overlay
  const overlay = document.createElement('div');
  overlay.className = 'swipe-overlay swipe-super-like';
  overlay.textContent = 'SUPER LIKE';
  overlay.style.opacity = '1';
  card.appendChild(overlay);
  
  // Animate card up
  card.style.transition = 'transform 0.5s ease';
  card.style.transform = 'translateY(-100vh) scale(0.8)';
  
  setTimeout(() => {
    // Record super like
    recordSwipeAction('superlike', movie);
    
    // Save to history for undo
    swipeHistory.push({
      action: 'superlike',
      movie: movie,
      index: currentMovieIndex
    });
    
    // Update counters
    superLikesRemaining--;
    dailySwipesRemaining--;
    localStorage.setItem('superLikesRemaining', superLikesRemaining);
    localStorage.setItem('dailySwipesRemaining', dailySwipesRemaining);
    
    // Move to next movie
    currentMovieIndex++;
    renderCurrentMovie();
    setupSwipeListeners();
    updateGamificationUI();
  }, 500);
}

/**
 * Handle undo button
 */
function handleUndoButton() {
  if (swipeHistory.length === 0) {
    return;
  }
  
  // Get last swipe
  const lastSwipe = swipeHistory.pop();
  
  // Restore counters
  if (lastSwipe.action === 'superlike') {
    superLikesRemaining++;
    localStorage.setItem('superLikesRemaining', superLikesRemaining);
  }
  dailySwipesRemaining++;
  localStorage.setItem('dailySwipesRemaining', dailySwipesRemaining);
  
  // Go back to previous movie
  currentMovieIndex = lastSwipe.index;
  renderCurrentMovie();
  setupSwipeListeners();
  updateGamificationUI();
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
        genreIds: movie.genreIds || [], // Include genre IDs for analytics
        contentType: movie.contentType || 'movie', // Include content type (movie or tv)
        action: action
      })
    });

    const data = await response.json();
    if (data.success) {
      console.log(`${movie.contentType === 'tv' ? 'TV show' : 'Movie'} ${action}d:`, movie.title);
      
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
    handleSuperLikeButton,
    handleUndoButton,
    loadMoreMovies
  };
}
