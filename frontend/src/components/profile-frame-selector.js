/**
 * Profile Frame Selector Component
 * Allows users to select and preview profile frames based on their archetype
 */

// Constants
const DEFAULT_PROFILE_IMAGE = 'assets/images/default-profile.svg';
const NOTIFICATION_ANIMATION_DURATION = 300; // milliseconds

class ProfileFrameSelector {
  constructor(userId, config = {}) {
    this.userId = userId;
    this.config = {
      apiBaseUrl: config.apiBaseUrl || window.API_BASE_URL || 'http://localhost:3000/api',
      onFrameSelected: config.onFrameSelected || null,
      containerSelector: config.containerSelector || '#profile-frame-selector',
      defaultProfileImage: config.defaultProfileImage || DEFAULT_PROFILE_IMAGE,
      ...config
    };
    this.availableFrames = [];
    this.recommendedFrame = null;
    this.currentFrame = null;
    this.userArchetype = null;
    this.selectedFrameType = null; // Track user's selection in the UI
  }

  /**
   * Initialize the component and load available frames
   */
  async init() {
    try {
      await this.loadAvailableFrames();
      this.render();
      return true;
    } catch (error) {
      console.error('[ProfileFrameSelector] Initialization failed:', error);
      return false;
    }
  }

  /**
   * Load available frames from API
   */
  async loadAvailableFrames() {
    try {
      const response = await fetch(`${this.config.apiBaseUrl}/users/${this.userId}/profile-frames`);
      if (!response.ok) {
        throw new Error(`Failed to load frames: ${response.statusText}`);
      }

      const data = await response.json();
      this.availableFrames = data.allFrames || [];
      this.recommendedFrame = data.recommendedFrame || null;
      this.currentFrame = data.currentFrame || null;
      this.userArchetype = data.archetype || null;

      console.log('[ProfileFrameSelector] Loaded frames:', {
        total: this.availableFrames.length,
        recommended: this.recommendedFrame?.type,
        current: this.currentFrame?.archetypeType
      });

      return data;
    } catch (error) {
      console.error('[ProfileFrameSelector] Error loading frames:', error);
      throw error;
    }
  }

  /**
   * Render the frame selector UI
   */
  render() {
    const container = document.querySelector(this.config.containerSelector);
    if (!container) {
      console.error('[ProfileFrameSelector] Container not found:', this.config.containerSelector);
      return;
    }

    let html = '<div class="profile-frame-selector-wrapper">';

    // Header with archetype info
    if (this.userArchetype) {
      html += `
        <div class="archetype-header" style="margin-bottom: 20px; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 12px;">
          <h3 style="margin: 0 0 10px 0; color: white;">Your Movie Personality</h3>
          <p style="margin: 0; font-size: 18px; font-weight: 600;">${this.escapeHtml(this.userArchetype.name)}</p>
          <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">${this.escapeHtml(this.userArchetype.description)}</p>
        </div>
      `;
    }

    // Recommended frame section
    if (this.recommendedFrame) {
      html += `
        <div class="recommended-frame-section" style="margin-bottom: 30px;">
          <h4 style="margin: 0 0 15px 0; color: #333;">✨ Recommended Frame for You</h4>
          <div class="frame-option ${this.currentFrame?.archetypeType === this.recommendedFrame.type ? 'selected' : ''}" 
               data-frame-type="${this.recommendedFrame.type}"
               style="max-width: 200px; cursor: pointer;">
            <div class="profile-frame profile-frame-${this.recommendedFrame.type}">
              <div class="profile-frame-inner">
                <div class="frame-option-preview">
                  ${this.recommendedFrame.icon}
                </div>
              </div>
            </div>
            <div class="frame-option-name">${this.escapeHtml(this.recommendedFrame.name)}</div>
          </div>
        </div>
      `;
    }

    // All frames section
    html += `
      <div class="all-frames-section">
        <h4 style="margin: 0 0 15px 0; color: #333;">All Available Frames</h4>
        <div class="frame-selector">
    `;

    this.availableFrames.forEach(frame => {
      const isActive = this.currentFrame?.archetypeType === frame.type;
      const isSelected = this.selectedFrameType === frame.type;
      html += `
        <div class="frame-option ${isSelected ? 'selected' : ''}" 
             data-frame-type="${frame.type}"
             title="${this.escapeHtml(frame.description)}">
          <div class="profile-frame profile-frame-${frame.type}">
            <div class="profile-frame-inner">
              <div class="frame-option-preview">
                ${frame.icon}
              </div>
            </div>
          </div>
          <div class="frame-option-name">${this.escapeHtml(frame.name)}</div>
          ${isActive ? '<div style="text-align: center; margin-top: 5px; color: #28a745; font-size: 12px; font-weight: 600;">✓ Active</div>' : ''}
          ${isSelected && !isActive ? '<div style="text-align: center; margin-top: 5px; color: #E50914; font-size: 12px; font-weight: 600;">● Selected</div>' : ''}
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;

    // Apply Frame button at the bottom
    html += `
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #e0e0e0;">
        <button id="apply-profile-frame" class="btn btn-primary" style="padding: 14px 32px; background: #E50914; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(229, 9, 20, 0.3); transition: all 0.3s ease;" ${!this.selectedFrameType ? 'disabled' : ''}>
          Apply Frame
        </button>
      </div>
    `;

    // Remove frame option if one is currently selected
    if (this.currentFrame) {
      html += `
        <div style="text-align: center; margin-top: 15px;">
          <button id="remove-profile-frame" class="btn btn-secondary" style="padding: 10px 20px; background: #666; color: white; border: none; border-radius: 6px; cursor: pointer;">
            Remove Current Frame
          </button>
        </div>
      `;
    }

    html += '</div>';

    container.innerHTML = html;

    // Attach event listeners
    this.attachEventListeners();
  }

  /**
   * Attach event listeners to frame options
   */
  attachEventListeners() {
    const frameOptions = document.querySelectorAll('.frame-option');
    frameOptions.forEach(option => {
      option.addEventListener('click', (e) => {
        const frameType = option.getAttribute('data-frame-type');
        // Select the frame (visual feedback)
        this.selectFrameForPreview(frameType);
      });
    });

    // Apply frame button
    const applyBtn = document.getElementById('apply-profile-frame');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => this.applySelectedFrame());
    }

    // Remove frame button
    const removeBtn = document.getElementById('remove-profile-frame');
    if (removeBtn) {
      removeBtn.addEventListener('click', () => this.removeFrame());
    }
  }

  /**
   * Select a frame for preview (updates UI, doesn't apply yet)
   */
  selectFrameForPreview(frameType) {
    this.selectedFrameType = frameType;
    
    // Update visual selection
    const frameOptions = document.querySelectorAll('.frame-option');
    frameOptions.forEach(option => {
      const optionFrameType = option.getAttribute('data-frame-type');
      if (optionFrameType === frameType) {
        option.classList.add('selected');
      } else {
        option.classList.remove('selected');
      }
    });

    // Enable the Apply Frame button
    const applyBtn = document.getElementById('apply-profile-frame');
    if (applyBtn) {
      applyBtn.disabled = false;
      applyBtn.style.opacity = '1';
      applyBtn.style.cursor = 'pointer';
    }

    // Update the selection indicator
    this.render();
  }

  /**
   * Apply the selected frame
   */
  async applySelectedFrame() {
    if (!this.selectedFrameType) {
      this.showNotification('Please select a frame first', 'error');
      return;
    }

    await this.selectFrame(this.selectedFrameType);
  }

  /**
   * Show frame preview modal
   */
  showFramePreview(frameType) {
    const frame = this.availableFrames.find(f => f.type === frameType);
    if (!frame) return;

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'frame-preview-modal';
    modal.innerHTML = `
      <div class="frame-preview-content">
        <div class="frame-preview-header">
          <h3>${this.escapeHtml(frame.name)}</h3>
          <button class="frame-preview-close">×</button>
        </div>
        
        <div class="frame-preview-example">
          <div class="profile-picture-with-frame">
            <div class="profile-frame profile-frame-${frame.type}">
              <div class="profile-frame-inner">
                <img src="${this.getCurrentUserPicture()}" alt="Preview" style="width: 100%; height: 100%; object-fit: cover;">
              </div>
            </div>
          </div>
        </div>
        
        <div class="frame-preview-description">
          <p><strong>Description:</strong> ${this.escapeHtml(frame.description)}</p>
          <p><strong>Color Palette:</strong></p>
          <div style="display: flex; gap: 10px; margin: 10px 0;">
            <div style="width: 40px; height: 40px; background: ${frame.colors.primary}; border-radius: 4px; border: 2px solid #ddd;"></div>
            <div style="width: 40px; height: 40px; background: ${frame.colors.secondary}; border-radius: 4px; border: 2px solid #ddd;"></div>
            <div style="width: 40px; height: 40px; background: ${frame.colors.accent}; border-radius: 4px; border: 2px solid #ddd;"></div>
          </div>
        </div>
        
        <div class="frame-preview-traits">
          ${frame.traits.map(trait => `<span class="frame-trait">${this.escapeHtml(trait)}</span>`).join('')}
        </div>
        
        <div class="frame-preview-actions">
          <button class="btn-secondary" onclick="this.closest('.frame-preview-modal').remove()">Cancel</button>
          <button class="btn-primary" data-frame-type="${frame.type}">Apply This Frame</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Event listeners
    modal.querySelector('.frame-preview-close').addEventListener('click', () => modal.remove());
    modal.querySelector('.btn-primary').addEventListener('click', () => {
      this.selectFrame(frameType);
      modal.remove();
    });
    
    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  }

  /**
   * Select and apply a frame
   */
  async selectFrame(frameType) {
    try {
      const response = await fetch(`${this.config.apiBaseUrl}/users/${this.userId}/profile-frames`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          archetypeType: frameType,
          isActive: true
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to select frame: ${response.statusText}`);
      }

      const result = await response.json();
      this.currentFrame = result.profileFrame;

      console.log('[ProfileFrameSelector] Frame selected:', result);

      // Callback
      if (this.config.onFrameSelected) {
        this.config.onFrameSelected(result);
      }

      // Re-render to show updated selection
      this.render();

      // Show success message
      this.showNotification('Profile frame applied successfully! ✨', 'success');

      return result;
    } catch (error) {
      console.error('[ProfileFrameSelector] Error selecting frame:', error);
      this.showNotification('Failed to apply frame. Please try again.', 'error');
      throw error;
    }
  }

  /**
   * Remove current frame
   */
  async removeFrame() {
    try {
      const response = await fetch(`${this.config.apiBaseUrl}/users/${this.userId}/profile-frames`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Failed to remove frame: ${response.statusText}`);
      }

      const result = await response.json();
      this.currentFrame = null;

      console.log('[ProfileFrameSelector] Frame removed:', result);

      // Callback to update parent component
      if (this.config.onFrameSelected) {
        this.config.onFrameSelected(result);
      }

      // Re-render selector UI
      this.render();

      this.showNotification('Profile frame removed successfully.', 'success');

      return result;
    } catch (error) {
      console.error('[ProfileFrameSelector] Error removing frame:', error);
      this.showNotification('Failed to remove frame. Please try again.', 'error');
      throw error;
    }
  }

  /**
   * Get current user's profile picture or placeholder
   */
  getCurrentUserPicture() {
    // Try to get from profile picture element
    const profilePic = document.getElementById('profile-picture');
    if (profilePic && profilePic.src && !profilePic.src.includes('default-profile')) {
      return profilePic.src;
    }
    // Return configured default placeholder
    return this.config.defaultProfileImage;
  }

  /**
   * Show notification message
   */
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => notification.remove(), NOTIFICATION_ANIMATION_DURATION);
    }, 3000);
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Get frame class for a given archetype type
   */
  static getFrameClass(archetypeType) {
    return archetypeType ? `profile-frame-${archetypeType}` : '';
  }

  /**
   * Apply frame to an image element
   */
  static applyFrameToElement(element, archetypeType) {
    if (!element || !archetypeType) return;

    // Wrap element in frame
    const wrapper = document.createElement('div');
    wrapper.className = `profile-picture-with-frame`;
    
    const frame = document.createElement('div');
    frame.className = `profile-frame profile-frame-${archetypeType}`;
    
    const inner = document.createElement('div');
    inner.className = 'profile-frame-inner';
    
    // Clone and insert element
    const clone = element.cloneNode(true);
    inner.appendChild(clone);
    frame.appendChild(inner);
    wrapper.appendChild(frame);

    // Replace original element
    element.parentNode.replaceChild(wrapper, element);
  }
}

// Add CSS animations if not already present
if (!document.getElementById('profile-frame-animations')) {
  const style = document.createElement('style');
  style.id = 'profile-frame-animations';
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProfileFrameSelector;
}
