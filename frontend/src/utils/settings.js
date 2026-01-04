/**
 * Settings Management System
 * Handles theme, font, and color customization across all pages
 */

(function() {
    'use strict';

    // Settings storage key
    const SETTINGS_KEY = 'netflixAndChillSettings';

    // Default settings
    const defaultSettings = {
        theme: 'dark',
        fontFamily: 'Segoe UI',
        fontSize: 'medium',
        customBgColor1: '#141414',
        customBgColor2: '#000000'
    };

    // Available font families
    const fontFamilies = {
        'Segoe UI': "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        'Arial': "Arial, Helvetica, sans-serif",
        'Georgia': "Georgia, serif",
        'Times New Roman': "'Times New Roman', Times, serif",
        'Courier New': "'Courier New', Courier, monospace",
        'Verdana': "Verdana, Geneva, sans-serif",
        'Comic Sans MS': "'Comic Sans MS', cursive",
        'Trebuchet MS': "'Trebuchet MS', sans-serif"
    };

    // Color presets
    const colorPresets = [
        { name: 'Dark (Default)', color1: '#141414', color2: '#000000' },
        { name: 'Netflix Red', color1: '#E50914', color2: '#831010' },
        { name: 'Ocean Blue', color1: '#1e3a5f', color2: '#0a1929' },
        { name: 'Purple Dream', color1: '#4a148c', color2: '#1a0033' },
        { name: 'Forest Green', color1: '#1b5e20', color2: '#0a2f0f' },
        { name: 'Sunset Orange', color1: '#e65100', color2: '#4a1800' },
        { name: 'Light Gray', color1: '#f5f5f5', color2: '#e0e0e0' },
        { name: 'Light Blue', color1: '#e3f2fd', color2: '#bbdefb' }
    ];

    // Get current settings from localStorage
    function getSettings() {
        try {
            const stored = localStorage.getItem(SETTINGS_KEY);
            return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
        } catch (e) {
            console.error('Error loading settings:', e);
            return defaultSettings;
        }
    }

    // Save settings to localStorage
    function saveSettings(settings) {
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        } catch (e) {
            console.error('Error saving settings:', e);
        }
    }

    // Apply theme
    function applyTheme(theme) {
        const body = document.body;
        body.classList.remove('light-theme', 'dark-theme', 'custom-bg');
        
        if (theme === 'light') {
            body.classList.add('light-theme');
        } else if (theme === 'dark') {
            body.classList.add('dark-theme');
        } else if (theme === 'custom') {
            body.classList.add('custom-bg');
        }
    }

    // Apply font family
    function applyFontFamily(fontFamily) {
        const fontValue = fontFamilies[fontFamily] || fontFamilies['Segoe UI'];
        document.documentElement.style.setProperty('--custom-font-family', fontValue);
    }

    // Apply font size
    function applyFontSize(fontSize) {
        const body = document.body;
        body.classList.remove('font-size-small', 'font-size-medium', 'font-size-large', 'font-size-xlarge');
        body.classList.add(`font-size-${fontSize}`);
    }

    // Apply custom background colors
    function applyCustomColors(color1, color2) {
        const gradient = `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
        document.documentElement.style.setProperty('--custom-bg-color', gradient);
    }

    // Apply all settings
    function applyAllSettings(settings) {
        applyTheme(settings.theme);
        applyFontFamily(settings.fontFamily);
        applyFontSize(settings.fontSize);
        if (settings.theme === 'custom') {
            applyCustomColors(settings.customBgColor1, settings.customBgColor2);
        }
    }

    // Initialize settings on page load
    function initializeSettings() {
        const settings = getSettings();
        applyAllSettings(settings);
    }

    // Create and show settings modal
    function createSettingsModal() {
        const settings = getSettings();
        
        const modalHTML = `
            <div id="settings-modal">
                <div class="settings-content">
                    <div class="settings-header">
                        <h2>⚙️ Settings</h2>
                        <button class="close-settings" id="close-settings-btn">&times;</button>
                    </div>

                    <!-- Theme Section -->
                    <div class="settings-section">
                        <h3>Theme</h3>
                        <div class="settings-option">
                            <label>Choose a theme:</label>
                            <div class="theme-options">
                                <button class="theme-btn ${settings.theme === 'dark' ? 'active' : ''}" data-theme="dark">🌙 Dark</button>
                                <button class="theme-btn ${settings.theme === 'light' ? 'active' : ''}" data-theme="light">☀️ Light</button>
                                <button class="theme-btn ${settings.theme === 'custom' ? 'active' : ''}" data-theme="custom">🎨 Custom</button>
                            </div>
                        </div>

                        <div class="settings-option" id="custom-colors-section" style="display: ${settings.theme === 'custom' ? 'block' : 'none'};">
                            <label>Custom Background Colors:</label>
                            <div class="color-picker-wrapper">
                                <div class="color-input-group">
                                    <label>Start Color</label>
                                    <input type="color" id="bg-color-1" value="${settings.customBgColor1}">
                                </div>
                                <div class="color-input-group">
                                    <label>End Color</label>
                                    <input type="color" id="bg-color-2" value="${settings.customBgColor2}">
                                </div>
                            </div>
                            <div class="color-presets">
                                ${colorPresets.map(preset => `
                                    <div class="color-preset" 
                                         style="background: linear-gradient(135deg, ${preset.color1} 0%, ${preset.color2} 100%);"
                                         data-color1="${preset.color1}"
                                         data-color2="${preset.color2}"
                                         title="${preset.name}">
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <!-- Font Section -->
                    <div class="settings-section">
                        <h3>Font</h3>
                        <div class="settings-option">
                            <label>Font Family:</label>
                            <div class="font-options">
                                ${Object.keys(fontFamilies).map(font => `
                                    <button class="font-btn ${settings.fontFamily === font ? 'active' : ''}" data-font="${font}">${font}</button>
                                `).join('')}
                            </div>
                        </div>

                        <div class="settings-option">
                            <label>Font Size:</label>
                            <div class="font-size-options">
                                <button class="font-size-btn ${settings.fontSize === 'small' ? 'active' : ''}" data-size="small">Small</button>
                                <button class="font-size-btn ${settings.fontSize === 'medium' ? 'active' : ''}" data-size="medium">Medium</button>
                                <button class="font-size-btn ${settings.fontSize === 'large' ? 'active' : ''}" data-size="large">Large</button>
                                <button class="font-size-btn ${settings.fontSize === 'xlarge' ? 'active' : ''}" data-size="xlarge">X-Large</button>
                            </div>
                        </div>
                    </div>

                    <!-- Save Section -->
                    <div class="settings-section">
                        <button id="reset-settings-btn" class="btn btn-secondary" style="width: 100%; margin-bottom: 10px;">Reset to Defaults</button>
                        <button id="save-settings-btn" class="btn btn-primary" style="width: 100%;">Save Settings</button>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if present
        const existingModal = document.getElementById('settings-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Set up event listeners
        setupModalEventListeners();
    }

    // Set up event listeners for the modal
    function setupModalEventListeners() {
        const modal = document.getElementById('settings-modal');
        const closeBtn = document.getElementById('close-settings-btn');
        const saveBtn = document.getElementById('save-settings-btn');
        const resetBtn = document.getElementById('reset-settings-btn');
        const customColorsSection = document.getElementById('custom-colors-section');

        let currentSettings = getSettings();

        // Close modal
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('show');
        });

        // Click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });

        // Theme buttons
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentSettings.theme = btn.dataset.theme;
                
                // Show/hide custom colors section
                if (currentSettings.theme === 'custom') {
                    customColorsSection.style.display = 'block';
                } else {
                    customColorsSection.style.display = 'none';
                }
                
                // Preview theme
                applyTheme(currentSettings.theme);
                if (currentSettings.theme === 'custom') {
                    applyCustomColors(currentSettings.customBgColor1, currentSettings.customBgColor2);
                }
            });
        });

        // Color inputs
        const bgColor1 = document.getElementById('bg-color-1');
        const bgColor2 = document.getElementById('bg-color-2');

        bgColor1.addEventListener('input', () => {
            currentSettings.customBgColor1 = bgColor1.value;
            if (currentSettings.theme === 'custom') {
                applyCustomColors(currentSettings.customBgColor1, currentSettings.customBgColor2);
            }
        });

        bgColor2.addEventListener('input', () => {
            currentSettings.customBgColor2 = bgColor2.value;
            if (currentSettings.theme === 'custom') {
                applyCustomColors(currentSettings.customBgColor1, currentSettings.customBgColor2);
            }
        });

        // Color presets
        document.querySelectorAll('.color-preset').forEach(preset => {
            preset.addEventListener('click', () => {
                const color1 = preset.dataset.color1;
                const color2 = preset.dataset.color2;
                bgColor1.value = color1;
                bgColor2.value = color2;
                currentSettings.customBgColor1 = color1;
                currentSettings.customBgColor2 = color2;
                if (currentSettings.theme === 'custom') {
                    applyCustomColors(color1, color2);
                }
            });
        });

        // Font buttons
        document.querySelectorAll('.font-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.font-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentSettings.fontFamily = btn.dataset.font;
                applyFontFamily(currentSettings.fontFamily);
            });
        });

        // Font size buttons
        document.querySelectorAll('.font-size-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.font-size-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentSettings.fontSize = btn.dataset.size;
                applyFontSize(currentSettings.fontSize);
            });
        });

        // Save settings
        saveBtn.addEventListener('click', () => {
            saveSettings(currentSettings);
            alert('Settings saved successfully!');
            modal.classList.remove('show');
        });

        // Reset settings
        resetBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all settings to defaults?')) {
                currentSettings = { ...defaultSettings };
                saveSettings(currentSettings);
                applyAllSettings(currentSettings);
                modal.classList.remove('show');
                // Recreate modal with default values
                setTimeout(() => createSettingsModal(), 100);
            }
        });
    }

    // Show settings modal
    function showSettings() {
        createSettingsModal();
        const modal = document.getElementById('settings-modal');
        modal.classList.add('show');
    }

    // Set up settings button click handler
    function setupSettingsButton() {
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                showSettings();
            });
        }
    }

    // Initialize on DOM load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initializeSettings();
            setupSettingsButton();
        });
    } else {
        initializeSettings();
        setupSettingsButton();
    }

    // Export functions for use in other scripts
    window.SettingsManager = {
        showSettings,
        getSettings,
        applyAllSettings,
        initializeSettings
    };
})();
