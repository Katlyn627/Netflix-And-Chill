/**
 * Swipe Analytics Visualization Component
 * Displays user's swipe preferences with charts and statistics
 */

/**
 * Fetch swipe analytics data from backend
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Analytics data
 */
async function fetchSwipeAnalytics(userId) {
  try {
    const response = await fetch(`${window.API_BASE_URL || 'http://localhost:3000/api'}/swipe/analytics/${userId}`);
    const data = await response.json();
    
    if (data.success) {
      return {
        analytics: data.analytics,
        chartData: data.chartData,
        insights: data.insights
      };
    } else {
      throw new Error(data.error || 'Failed to fetch analytics');
    }
  } catch (error) {
    console.error('Error fetching swipe analytics:', error);
    throw error;
  }
}

/**
 * Render pie chart using CSS
 * @param {string} containerId - Container element ID
 * @param {Array} data - Chart data [{label, value, percentage}]
 * @param {string} title - Chart title
 */
function renderPieChart(containerId, data, title) {
  const container = document.getElementById(containerId);
  if (!container || !data || data.length === 0) return;

  // Color palette for charts
  const colors = [
    '#E50914', // Netflix red
    '#FF6B6B', // Coral
    '#4ECDC4', // Turquoise
    '#45B7D1', // Sky blue
    '#FFA07A', // Light salmon
    '#98D8C8', // Mint
    '#F7DC6F', // Yellow
    '#BB8FCE', // Purple
    '#85C1E2', // Light blue
    '#F8B195'  // Peach
  ];

  // Calculate total for percentage
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Generate HTML for pie chart
  let html = `
    <div class="chart-container">
      <h3 class="chart-title">${title}</h3>
      <div class="pie-chart-wrapper">
        <div class="pie-chart">
  `;

  // Create pie slices using conic-gradient
  let gradientStops = [];
  let currentPercentage = 0;

  data.forEach((item, index) => {
    const percentage = (item.value / total) * 100;
    const color = colors[index % colors.length];
    
    gradientStops.push(`${color} ${currentPercentage}% ${currentPercentage + percentage}%`);
    currentPercentage += percentage;
  });

  html += `
          <div class="pie-slice" style="background: conic-gradient(${gradientStops.join(', ')});"></div>
        </div>
        <div class="chart-legend">
  `;

  // Add legend
  data.forEach((item, index) => {
    const color = colors[index % colors.length];
    const percentage = Math.round((item.value / total) * 100);
    html += `
      <div class="legend-item">
        <span class="legend-color" style="background-color: ${color};"></span>
        <span class="legend-label">${item.label}</span>
        <span class="legend-value">${percentage}% (${item.value})</span>
      </div>
    `;
  });

  html += `
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

/**
 * Render bar chart using CSS
 * @param {string} containerId - Container element ID
 * @param {Array} data - Chart data [{label, value, percentage}]
 * @param {string} title - Chart title
 */
function renderBarChart(containerId, data, title) {
  const container = document.getElementById(containerId);
  if (!container || !data || data.length === 0) return;

  const maxValue = Math.max(...data.map(item => item.value));

  let html = `
    <div class="chart-container">
      <h3 class="chart-title">${title}</h3>
      <div class="bar-chart">
  `;

  data.forEach(item => {
    const heightPercentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
    html += `
      <div class="bar-item">
        <div class="bar-wrapper">
          <div class="bar" style="height: ${heightPercentage}%;" title="${item.label}: ${item.value}">
            <span class="bar-value">${item.value}</span>
          </div>
        </div>
        <div class="bar-label">${item.label}</div>
      </div>
    `;
  });

  html += `
      </div>
    </div>
  `;

  container.innerHTML = html;
}

/**
 * Render statistics cards
 * @param {string} containerId - Container element ID
 * @param {Object} analytics - Analytics data
 */
function renderStatistics(containerId, analytics) {
  const container = document.getElementById(containerId);
  if (!container || !analytics) return;

  const stats = [
    {
      icon: '🎬',
      label: 'Total Swipes',
      value: analytics.totalSwipes,
      color: '#E50914'
    },
    {
      icon: '❤️',
      label: 'Movies Liked',
      value: analytics.totalLikes,
      color: '#FF6B6B'
    },
    {
      icon: '👎',
      label: 'Passed',
      value: analytics.totalDislikes,
      color: '#4ECDC4'
    },
    {
      icon: '📊',
      label: 'Like Rate',
      value: `${analytics.likePercentage}%`,
      color: '#45B7D1'
    }
  ];

  let html = '<div class="stats-grid">';
  
  stats.forEach(stat => {
    html += `
      <div class="stat-card" style="border-left: 4px solid ${stat.color};">
        <div class="stat-icon">${stat.icon}</div>
        <div class="stat-content">
          <div class="stat-value">${stat.value}</div>
          <div class="stat-label">${stat.label}</div>
        </div>
      </div>
    `;
  });

  html += '</div>';
  container.innerHTML = html;
}

/**
 * Render insights
 * @param {string} containerId - Container element ID
 * @param {Array} insights - Array of insight strings
 */
function renderInsights(containerId, insights) {
  const container = document.getElementById(containerId);
  if (!container || !insights || insights.length === 0) return;

  let html = `
    <div class="insights-container">
      <h3 class="insights-title">🎯 Your Viewing Insights</h3>
      <div class="insights-list">
  `;

  insights.forEach(insight => {
    html += `<div class="insight-item">✨ ${insight}</div>`;
  });

  html += `
      </div>
    </div>
  `;

  container.innerHTML = html;
}

/**
 * Render complete analytics dashboard
 * @param {string} containerId - Container element ID
 * @param {string} userId - User ID
 */
async function renderAnalyticsDashboard(containerId, userId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error('Analytics container not found');
    return;
  }

  try {
    // Show loading state
    container.innerHTML = `
      <div class="analytics-loading">
        <div class="loading-spinner"></div>
        <p>Loading your swipe analytics...</p>
      </div>
    `;

    // Fetch analytics data
    const { analytics, chartData, insights } = await fetchSwipeAnalytics(userId);

    // Check if user has any swipes
    if (analytics.totalSwipes === 0) {
      container.innerHTML = `
        <div class="analytics-empty">
          <div class="empty-icon">📊</div>
          <h3>No Swipe Data Yet</h3>
          <p>Start swiping on movies to see your personalized analytics!</p>
          <a href="swipe.html" class="btn btn-primary">Start Swiping</a>
        </div>
      `;
      return;
    }

    // Create dashboard structure
    container.innerHTML = `
      <div class="analytics-dashboard">
        <div class="dashboard-header">
          <h2>📊 Your Swipe Analytics</h2>
          <p>Discover your movie preferences based on your swipes</p>
        </div>
        
        <div id="analytics-stats"></div>
        
        <div class="charts-row">
          <div class="chart-col">
            <div id="genre-chart"></div>
          </div>
          <div class="chart-col">
            <div id="content-type-chart"></div>
          </div>
        </div>
        
        <div id="analytics-insights"></div>
        
        <div class="analytics-footer">
          <p class="last-updated">Last updated: ${new Date().toLocaleString()}</p>
          <button id="refresh-analytics-btn" class="btn btn-secondary">🔄 Refresh Analytics</button>
        </div>
      </div>
    `;

    // Render each component
    renderStatistics('analytics-stats', analytics);
    renderPieChart('genre-chart', chartData.genreChart, 'Genre Preferences');
    renderBarChart('content-type-chart', chartData.contentTypeChart, 'Movies vs TV Shows');
    renderInsights('analytics-insights', insights);

    // Add refresh button handler
    const refreshBtn = document.getElementById('refresh-analytics-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        renderAnalyticsDashboard(containerId, userId);
      });
    }

  } catch (error) {
    console.error('Error rendering analytics dashboard:', error);
    container.innerHTML = `
      <div class="analytics-error">
        <div class="error-icon">⚠️</div>
        <h3>Error Loading Analytics</h3>
        <p>${error.message}</p>
        <button onclick="location.reload()" class="btn btn-primary">Try Again</button>
      </div>
    `;
  }
}

/**
 * Render compact analytics for profile page
 * @param {string} containerId - Container element ID
 * @param {string} userId - User ID
 */
async function renderCompactAnalytics(containerId, userId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  try {
    const { analytics, chartData } = await fetchSwipeAnalytics(userId);

    if (analytics.totalSwipes === 0) {
      container.innerHTML = `
        <p style="text-align: center; color: #666;">No swipe data yet. <a href="swipe.html">Start swiping</a> to see your preferences!</p>
      `;
      return;
    }

    // Show top 3 genres only in compact mode
    const topGenres = analytics.topGenres.slice(0, 3);
    const contentBreakdown = analytics.contentTypeBreakdown;

    container.innerHTML = `
      <div class="compact-analytics">
        <div class="compact-stats">
          <div class="compact-stat">
            <strong>${analytics.totalLikes}</strong>
            <span>Liked Movies</span>
          </div>
          <div class="compact-stat">
            <strong>${analytics.likePercentage}%</strong>
            <span>Like Rate</span>
          </div>
        </div>
        
        <div class="compact-genres">
          <h4>Top Genres:</h4>
          <div class="genre-tags">
            ${topGenres.map(g => `
              <span class="genre-tag">${g.genre} (${g.percentage}%)</span>
            `).join('')}
          </div>
        </div>
        
        <div class="compact-content-type">
          <div class="content-type-bar">
            <div class="content-movies" style="width: ${contentBreakdown.moviePercentage}%;" title="Movies: ${contentBreakdown.moviePercentage}%"></div>
            <div class="content-tv" style="width: ${contentBreakdown.tvShowPercentage}%;" title="TV Shows: ${contentBreakdown.tvShowPercentage}%"></div>
          </div>
          <div class="content-type-labels">
            <span>🎬 Movies ${contentBreakdown.moviePercentage}%</span>
            <span>📺 TV Shows ${contentBreakdown.tvShowPercentage}%</span>
          </div>
        </div>
        
        <a href="analytics.html" class="btn btn-secondary" style="width: 100%; margin-top: 15px;">View Full Analytics</a>
      </div>
    `;
  } catch (error) {
    console.error('Error rendering compact analytics:', error);
    container.innerHTML = '<p style="color: #999;">Unable to load analytics</p>';
  }
}

// Export functions for use in other files
if (typeof window !== 'undefined') {
  window.SwipeAnalyticsModule = {
    renderAnalyticsDashboard,
    renderCompactAnalytics,
    fetchSwipeAnalytics
  };
}
