/**
 * Advanced Settings Management System
 * Comprehensive appearance and behavior customization for Netflix & Chill
 * Implements all visual settings, background options, and accessibility controls
 */

(function() {
    'use strict';

    const SETTINGS_KEY = 'netflixAndChillAppearanceSettings';
    const API_BASE_URL = window.API_BASE_URL || 'http://localhost:3000/api';

    // Default settings matching User model structure
    const defaultSettings = {
        theme: 'cinematic-red',
        contrastMode: 'standard',
        motionLevel: 'full',
        backgrounds: {
            home: 'film-grain',
            profile: 'spotlight-fade',
            chat: 'dark-blur',
            watchTogether: 'theater-dim'
        },
        dynamicResponses: {
            matchWarmth: true,
            messagePulse: true,
            typingDim: true,
            sessionSpotlight: true
        },
        timeBasedChanges: true,
        matchBasedAdjustments: true,
        emotionalTone: 'cozy',
        eyeStrainReduction: false,
        reducedRedSaturation: false,
        fontBackgroundSpacing: 'normal',
        focusMode: false,
        staticBackgroundFallback: false,
        lazyLoadTextures: true
    };

    // Theme definitions
    const themes = {
        'cinematic-red': {
            name: 'Cinematic Red',
            description: 'Classic Netflix-inspired dark theme with red accents',
            colors: {
                primary: '#E50914',
                secondary: '#831010',
                background: '#141414',
                backgroundAlt: '#000000',
                text: '#ffffff',
                textMuted: '#b3b3b3'
            }
        },
        'noir': {
            name: 'Noir',
            description: 'Black, charcoal, and silver accents',
            colors: {
                primary: '#c0c0c0',
                secondary: '#808080',
                background: '#0a0a0a',
                backgroundAlt: '#1a1a1a',
                text: '#e5e5e5',
                textMuted: '#999999'
            }
        },
        'warm-cinema': {
            name: 'Warm Cinema',
            description: 'Beige, sepia, and soft gold tones',
            colors: {
                primary: '#d4a574',
                secondary: '#8b6f47',
                background: '#2b2419',
                backgroundAlt: '#3d3226',
                text: '#f5efe7',
                textMuted: '#c9b99c'
            }
        },
        'minimal-monochrome': {
            name: 'Minimal Monochrome',
            description: 'Clean white and black only',
            colors: {
                primary: '#000000',
                secondary: '#333333',
                background: '#ffffff',
                backgroundAlt: '#f5f5f5',
                text: '#000000',
                textMuted: '#666666'
            }
        },
        'auto': {
            name: 'Auto (System)',
            description: 'Follows your system theme preference',
            colors: null // Will be determined by system
        }
    };

    // Background style definitions
    const backgroundStyles = {
        home: {
            'film-grain': 'Subtle film grain texture overlay',
            'theater-seats': 'Blurred theater seats backdrop',
            'velvet-curtain': 'Red velvet curtain gradient',
            'matte-black': 'Matte black with vignette glow',
            'rotating-gradients': 'Dynamic movie still-style gradients'
        },
        profile: {
            'spotlight-fade': 'Center spotlight glow behind profile',
            'film-strip': 'Film strip vertical borders',
            'spotlight-halo': 'Soft spotlight halo behind photos',
            'minimal-matte': 'Minimal matte background',
            'poster-style': 'Movie poster-style layout background'
        },
        chat: {
            'dark-blur': 'Dark neutral blur (focus on text)',
            'soft-gradient': 'Soft gradient fade',
            'aisle-bokeh': 'Cinema aisle bokeh lights',
            'solid-color': 'Solid color (accessibility mode)'
        },
        watchTogether: {
            'theater-dim': 'Dimmed theater background',
            'projection-glow': 'Faux projection glow effect',
            'letterbox': 'Letterbox bars (top/bottom)',
            'popcorn-grain': 'Subtle popcorn grain texture'
        }
    };

    // Settings management
    class AdvancedSettingsManager {
        constructor() {
            this.settings = this.loadSettings();
            this.currentPage = this.detectCurrentPage();
            this.panelOpen = false;
        }

        loadSettings() {
            try {
                const stored = localStorage.getItem(SETTINGS_KEY);
                const settings = stored ? JSON.parse(stored) : defaultSettings;
                return { ...defaultSettings, ...settings };
            } catch (e) {
                console.error('Error loading settings:', e);
                return { ...defaultSettings };
            }
        }

        saveSettings(settings) {
            try {
                this.settings = { ...this.settings, ...settings };
                localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
                this.syncWithBackend();
            } catch (e) {
                console.error('Error saving settings:', e);
            }
        }

        async syncWithBackend() {
            const userId = localStorage.getItem('currentUserId');
            if (!userId) return;

            try {
                await fetch(`${API_BASE_URL}/users/${userId}/appearance`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ appearancePreferences: this.settings })
                });
            } catch (e) {
                // Silently fail - settings are saved locally and will sync when backend is available
                // Only log in debug mode
                if (window.debugMode) {
                    console.debug('Backend sync unavailable, settings saved locally:', e.message);
                }
            }
        }

        async loadFromBackend() {
            const userId = localStorage.getItem('currentUserId');
            if (!userId) return;

            try {
                const response = await fetch(`${API_BASE_URL}/users/${userId}`);
                if (response.ok) {
                    const user = await response.json();
                    if (user.appearancePreferences) {
                        this.settings = { ...defaultSettings, ...user.appearancePreferences };
                        localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
                    }
                }
            } catch (e) {
                // Silently fail - use local settings as fallback
                // Only log in debug mode
                if (window.debugMode) {
                    console.debug('Backend unavailable, using local settings:', e.message);
                }
            }
        }

        detectCurrentPage() {
            const path = window.location.pathname;
            if (path.includes('homepage') || path.includes('index')) return 'home';
            if (path.includes('profile')) return 'profile';
            if (path.includes('chat')) return 'chat';
            if (path.includes('watch-together')) return 'watchTogether';
            if (path.includes('swipe')) return 'home';
            if (path.includes('matches')) return 'home';
            return 'home';
        }

        applyAllSettings() {
            this.applyTheme();
            this.applyContrastMode();
            this.applyMotionLevel();
            this.applyBackground();
            this.applyAccessibilitySettings();
            this.applyEmotionalTone();
            
            if (this.settings.timeBasedChanges) {
                this.applyTimeBasedAdjustments();
            }
        }

        applyTheme() {
            const theme = this.settings.theme;
            const body = document.body;
            
            // Remove all theme classes
            Object.keys(themes).forEach(t => {
                body.classList.remove(`theme-${t}`);
            });

            if (theme === 'auto') {
                const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                body.classList.add(isDark ? 'theme-cinematic-red' : 'theme-minimal-monochrome');
            } else {
                body.classList.add(`theme-${theme}`);
            }

            // Apply theme colors
            const themeData = themes[theme === 'auto' ? 'cinematic-red' : theme];
            if (themeData.colors) {
                const root = document.documentElement;
                Object.entries(themeData.colors).forEach(([key, value]) => {
                    root.style.setProperty(`--color-${key}`, value);
                });
            }
        }

        applyContrastMode() {
            const body = document.body;
            body.classList.remove('contrast-standard', 'contrast-high', 'contrast-soft');
            body.classList.add(`contrast-${this.settings.contrastMode}`);
        }

        applyMotionLevel() {
            const body = document.body;
            body.classList.remove('motion-full', 'motion-reduced', 'motion-static');
            body.classList.add(`motion-${this.settings.motionLevel}`);
            
            // Apply to document for CSS media query override
            if (this.settings.motionLevel === 'reduced' || this.settings.motionLevel === 'static') {
                document.documentElement.style.setProperty('--animation-duration', '0.01s');
            } else {
                document.documentElement.style.setProperty('--animation-duration', '0.3s');
            }
        }

        applyBackground() {
            const body = document.body;
            const page = this.currentPage;
            const bgStyle = this.settings.backgrounds[page];
            
            // Remove all background classes (more robust pattern matching)
            const classesToRemove = Array.from(body.classList).filter(cls => cls.startsWith('bg-'));
            classesToRemove.forEach(cls => body.classList.remove(cls));
            
            // Add current background class
            if (bgStyle) {
                body.classList.add(`bg-${page}-${bgStyle}`);
            }
        }

        applyAccessibilitySettings() {
            const body = document.body;
            
            // Eye strain reduction
            body.classList.toggle('eye-strain-reduction', this.settings.eyeStrainReduction);
            
            // Reduced red saturation
            body.classList.toggle('reduced-red-saturation', this.settings.reducedRedSaturation);
            
            // Font/background spacing
            body.classList.remove('spacing-compact', 'spacing-normal', 'spacing-comfortable', 'spacing-spacious');
            body.classList.add(`spacing-${this.settings.fontBackgroundSpacing}`);
            
            // Focus mode
            body.classList.toggle('focus-mode', this.settings.focusMode);
        }

        applyEmotionalTone() {
            const body = document.body;
            body.classList.remove('tone-cozy', 'tone-romantic', 'tone-playful', 'tone-dramatic', 'tone-minimal');
            body.classList.add(`tone-${this.settings.emotionalTone}`);
        }

        applyTimeBasedAdjustments() {
            const hour = new Date().getHours();
            const isEvening = hour >= 18 || hour < 6;
            document.body.classList.toggle('time-evening', isEvening);
            document.body.classList.toggle('time-morning', !isEvening);
        }

        createSettingsPanel() {
            const panel = document.createElement('div');
            panel.id = 'advanced-settings-panel';
            panel.className = 'settings-panel';
            panel.innerHTML = this.generatePanelHTML();
            document.body.appendChild(panel);
            this.setupEventListeners(panel);
        }

        generatePanelHTML() {
            return `
                <div class="settings-panel-overlay"></div>
                <div class="settings-panel-content">
                    <div class="settings-header">
                        <h2>⚙️ Appearance Settings</h2>
                        <button class="close-settings-panel" aria-label="Close settings">&times;</button>
                    </div>
                    
                    <div class="settings-body">
                        ${this.generateThemeSection()}
                        ${this.generateContrastSection()}
                        ${this.generateMotionSection()}
                        ${this.generateBackgroundSection()}
                        ${this.generatePersonalizationSection()}
                        ${this.generateAccessibilitySection()}
                        ${this.generateAdvancedSection()}
                    </div>
                    
                    <div class="settings-footer">
                        <p style="color: #b3b3b3; font-size: 0.9em; margin: 0 0 10px 0; text-align: center;">Settings are saved automatically as you make changes</p>
                        <button class="btn-reset-settings">Reset to Defaults</button>
                        <button class="btn-save-settings">Done</button>
                    </div>
                </div>
            `;
        }

        generateThemeSection() {
            return `
                <section class="settings-section">
                    <h3>🎨 Theme & Mood</h3>
                    <p class="section-description">Choose your visual atmosphere</p>
                    <div class="theme-selector">
                        ${Object.entries(themes).map(([key, theme]) => `
                            <div class="theme-option ${this.settings.theme === key ? 'active' : ''}" data-theme="${key}">
                                <div class="theme-preview ${key === 'auto' ? 'theme-preview-auto' : ''}" 
                                     ${theme.colors ? `style="background: linear-gradient(135deg, ${theme.colors.background} 0%, ${theme.colors.backgroundAlt} 100%); border-color: ${theme.colors.primary};"` : ''}>
                                </div>
                                <div class="theme-info">
                                    <strong>${theme.name}</strong>
                                    <small>${theme.description}</small>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </section>
            `;
        }

        generateContrastSection() {
            return `
                <section class="settings-section">
                    <h3>🌗 Contrast & Readability</h3>
                    <div class="radio-group">
                        <label class="radio-option">
                            <input type="radio" name="contrast" value="standard" ${this.settings.contrastMode === 'standard' ? 'checked' : ''}>
                            <span>Standard contrast</span>
                        </label>
                        <label class="radio-option">
                            <input type="radio" name="contrast" value="high" ${this.settings.contrastMode === 'high' ? 'checked' : ''}>
                            <span>High contrast (accessibility)</span>
                        </label>
                        <label class="radio-option">
                            <input type="radio" name="contrast" value="soft" ${this.settings.contrastMode === 'soft' ? 'checked' : ''}>
                            <span>Soft contrast (reduced glare)</span>
                        </label>
                    </div>
                </section>
            `;
        }

        generateMotionSection() {
            return `
                <section class="settings-section">
                    <h3>🎞️ Motion Level</h3>
                    <div class="radio-group">
                        <label class="radio-option">
                            <input type="radio" name="motion" value="full" ${this.settings.motionLevel === 'full' ? 'checked' : ''}>
                            <span>Full cinematic animations</span>
                        </label>
                        <label class="radio-option">
                            <input type="radio" name="motion" value="reduced" ${this.settings.motionLevel === 'reduced' ? 'checked' : ''}>
                            <span>Reduced motion</span>
                        </label>
                        <label class="radio-option">
                            <input type="radio" name="motion" value="static" ${this.settings.motionLevel === 'static' ? 'checked' : ''}>
                            <span>Static (no animations)</span>
                        </label>
                    </div>
                </section>
            `;
        }

        generateBackgroundSection() {
            return `
                <section class="settings-section">
                    <h3>🎬 Background Styles</h3>
                    <p class="section-description">Customize backgrounds for each page</p>
                    ${Object.entries(backgroundStyles).map(([page, styles]) => `
                        <div class="background-page-section">
                            <h4>${this.getPageDisplayName(page)}</h4>
                            <select name="bg-${page}" class="background-select">
                                ${Object.entries(styles).map(([key, desc]) => `
                                    <option value="${key}" ${this.settings.backgrounds[page] === key ? 'selected' : ''}>
                                        ${desc}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                    `).join('')}
                </section>
            `;
        }

        generatePersonalizationSection() {
            return `
                <section class="settings-section">
                    <h3>✨ Personalization</h3>
                    <div class="checkbox-group">
                        <label class="checkbox-option">
                            <input type="checkbox" name="timeBasedChanges" ${this.settings.timeBasedChanges ? 'checked' : ''}>
                            <span>Time-based theme adjustments (day/night)</span>
                        </label>
                        <label class="checkbox-option">
                            <input type="checkbox" name="matchBasedAdjustments" ${this.settings.matchBasedAdjustments ? 'checked' : ''}>
                            <span>Match-based background adaptations</span>
                        </label>
                        <label class="checkbox-option">
                            <input type="checkbox" name="dynamicResponses.matchWarmth" ${this.settings.dynamicResponses.matchWarmth ? 'checked' : ''}>
                            <span>Background warms on mutual match</span>
                        </label>
                        <label class="checkbox-option">
                            <input type="checkbox" name="dynamicResponses.messagePulse" ${this.settings.dynamicResponses.messagePulse ? 'checked' : ''}>
                            <span>Gentle pulse when receiving messages</span>
                        </label>
                    </div>
                    
                    <div class="emotional-tone-section">
                        <h4>Emotional Tone</h4>
                        <select name="emotionalTone" class="tone-select">
                            <option value="cozy" ${this.settings.emotionalTone === 'cozy' ? 'selected' : ''}>Cozy</option>
                            <option value="romantic" ${this.settings.emotionalTone === 'romantic' ? 'selected' : ''}>Romantic</option>
                            <option value="playful" ${this.settings.emotionalTone === 'playful' ? 'selected' : ''}>Playful</option>
                            <option value="dramatic" ${this.settings.emotionalTone === 'dramatic' ? 'selected' : ''}>Dramatic</option>
                            <option value="minimal" ${this.settings.emotionalTone === 'minimal' ? 'selected' : ''}>Minimal</option>
                        </select>
                    </div>
                </section>
            `;
        }

        generateAccessibilitySection() {
            return `
                <section class="settings-section">
                    <h3>♿ Accessibility & Comfort</h3>
                    <div class="checkbox-group">
                        <label class="checkbox-option">
                            <input type="checkbox" name="eyeStrainReduction" ${this.settings.eyeStrainReduction ? 'checked' : ''}>
                            <span>Eye-strain reduction mode</span>
                        </label>
                        <label class="checkbox-option">
                            <input type="checkbox" name="reducedRedSaturation" ${this.settings.reducedRedSaturation ? 'checked' : ''}>
                            <span>Reduced red saturation</span>
                        </label>
                        <label class="checkbox-option">
                            <input type="checkbox" name="focusMode" ${this.settings.focusMode ? 'checked' : ''}>
                            <span>Focus mode (remove textures & animations)</span>
                        </label>
                    </div>
                    
                    <div class="spacing-section">
                        <h4>Font & Background Spacing</h4>
                        <select name="fontBackgroundSpacing" class="spacing-select">
                            <option value="compact" ${this.settings.fontBackgroundSpacing === 'compact' ? 'selected' : ''}>Compact</option>
                            <option value="normal" ${this.settings.fontBackgroundSpacing === 'normal' ? 'selected' : ''}>Normal</option>
                            <option value="comfortable" ${this.settings.fontBackgroundSpacing === 'comfortable' ? 'selected' : ''}>Comfortable</option>
                            <option value="spacious" ${this.settings.fontBackgroundSpacing === 'spacious' ? 'selected' : ''}>Spacious</option>
                        </select>
                    </div>
                </section>
            `;
        }

        generateAdvancedSection() {
            return `
                <section class="settings-section">
                    <h3>⚡ Performance</h3>
                    <div class="checkbox-group">
                        <label class="checkbox-option">
                            <input type="checkbox" name="staticBackgroundFallback" ${this.settings.staticBackgroundFallback ? 'checked' : ''}>
                            <span>Static background fallback (low bandwidth)</span>
                        </label>
                        <label class="checkbox-option">
                            <input type="checkbox" name="lazyLoadTextures" ${this.settings.lazyLoadTextures ? 'checked' : ''}>
                            <span>Lazy-load textures</span>
                        </label>
                    </div>
                </section>
            `;
        }

        getPageDisplayName(page) {
            const names = {
                home: 'Home / Feed Page',
                profile: 'Profile Page',
                chat: 'Chat Page',
                watchTogether: 'Watch-Together Page'
            };
            return names[page] || page;
        }

        setupEventListeners(panel) {
            // Close button
            panel.querySelector('.close-settings-panel').addEventListener('click', () => {
                this.closePanel();
            });

            // Overlay click to close
            panel.querySelector('.settings-panel-overlay').addEventListener('click', () => {
                this.closePanel();
            });

            // Theme selection
            panel.querySelectorAll('.theme-option').forEach(option => {
                option.addEventListener('click', () => {
                    panel.querySelectorAll('.theme-option').forEach(o => o.classList.remove('active'));
                    option.classList.add('active');
                    this.settings.theme = option.dataset.theme;
                    this.applyTheme();
                    this.saveSettings(this.settings);
                });
            });

            // Contrast mode
            panel.querySelectorAll('input[name="contrast"]').forEach(input => {
                input.addEventListener('change', () => {
                    this.settings.contrastMode = input.value;
                    this.applyContrastMode();
                    this.saveSettings(this.settings);
                });
            });

            // Motion level
            panel.querySelectorAll('input[name="motion"]').forEach(input => {
                input.addEventListener('change', () => {
                    this.settings.motionLevel = input.value;
                    this.applyMotionLevel();
                    this.saveSettings(this.settings);
                });
            });

            // Background selects
            Object.keys(backgroundStyles).forEach(page => {
                const select = panel.querySelector(`select[name="bg-${page}"]`);
                if (select) {
                    select.addEventListener('change', () => {
                        this.settings.backgrounds[page] = select.value;
                        if (this.currentPage === page) {
                            this.applyBackground();
                        }
                        this.saveSettings(this.settings);
                    });
                }
            });

            // Checkboxes
            panel.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                checkbox.addEventListener('change', () => {
                    const name = checkbox.name;
                    if (name.includes('.')) {
                        const parts = name.split('.');
                        if (parts.length === 2) {
                            const [parent, child] = parts;
                            if (this.settings[parent] && typeof this.settings[parent] === 'object') {
                                this.settings[parent][child] = checkbox.checked;
                            }
                        }
                    } else {
                        this.settings[name] = checkbox.checked;
                    }
                    this.applyAllSettings();
                    this.saveSettings(this.settings);
                });
            });

            // Emotional tone
            const toneSelect = panel.querySelector('select[name="emotionalTone"]');
            if (toneSelect) {
                toneSelect.addEventListener('change', () => {
                    this.settings.emotionalTone = toneSelect.value;
                    this.applyEmotionalTone();
                    this.saveSettings(this.settings);
                });
            }

            // Spacing
            const spacingSelect = panel.querySelector('select[name="fontBackgroundSpacing"]');
            if (spacingSelect) {
                spacingSelect.addEventListener('change', () => {
                    this.settings.fontBackgroundSpacing = spacingSelect.value;
                    this.applyAccessibilitySettings();
                    this.saveSettings(this.settings);
                });
            }

            // Reset button
            panel.querySelector('.btn-reset-settings').addEventListener('click', () => {
                if (confirm('Reset all settings to defaults?')) {
                    this.settings = { ...defaultSettings };
                    this.saveSettings(this.settings);
                    this.applyAllSettings();
                    this.closePanel();
                    setTimeout(() => this.openPanel(), 100);
                }
            });

            // Save button (now just closes, as settings save in real-time)
            panel.querySelector('.btn-save-settings').addEventListener('click', () => {
                this.showNotification('All settings have been saved!');
                this.closePanel();
            });
        }

        openPanel() {
            if (!document.getElementById('advanced-settings-panel')) {
                this.createSettingsPanel();
            }
            const panel = document.getElementById('advanced-settings-panel');
            panel.classList.add('open');
            this.panelOpen = true;
            document.body.style.overflow = 'hidden';
        }

        closePanel() {
            const panel = document.getElementById('advanced-settings-panel');
            if (panel) {
                panel.classList.remove('open');
                this.panelOpen = false;
                document.body.style.overflow = '';
            }
        }

        showNotification(message) {
            const notification = document.createElement('div');
            notification.className = 'settings-notification';
            notification.textContent = message;
            document.body.appendChild(notification);
            
            setTimeout(() => notification.classList.add('show'), 10);
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }
    }

    // Initialize and export
    const settingsManager = new AdvancedSettingsManager();

    // Load settings from backend on page load
    settingsManager.loadFromBackend().then(() => {
        settingsManager.applyAllSettings();
    });

    // Apply settings immediately
    settingsManager.applyAllSettings();

    // Export to window for global access
    window.AdvancedSettingsManager = settingsManager;

    // Handle system theme changes for auto mode
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            if (settingsManager.settings.theme === 'auto') {
                settingsManager.applyTheme();
            }
        });
    }

})();
