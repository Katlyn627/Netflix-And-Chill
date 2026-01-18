/**
 * Archetype Display Component
 * Shows user's movie personality archetype on profile and match cards
 */

(function() {
    'use strict';

    const API_BASE_URL = window.API_BASE_URL || 'http://localhost:3000/api';

    /**
     * Fetch and display user's archetype
     * @param {string} userId - User ID
     * @param {string} containerId - DOM element ID to render archetype
     */
    async function displayUserArchetype(userId, containerId) {
        try {
            const container = document.getElementById(containerId);
            if (!container) {
                console.error('Container not found:', containerId);
                return;
            }

            // Show loading state
            container.innerHTML = '<div class="archetype-loading">Analyzing viewing personality...</div>';

            const response = await fetch(`${API_BASE_URL}/archetypes/user/${userId}`);
            const data = await response.json();

            if (!data.success || !data.archetype) {
                container.innerHTML = '<div class="archetype-error">Unable to determine archetype</div>';
                return;
            }

            const archetype = data.archetype.primary;
            const secondary = data.archetype.secondary;

            // Build archetype HTML
            let html = `
                <div class="archetype-card">
                    <div class="archetype-primary">
                        <div class="archetype-emoji">${archetype.emoji}</div>
                        <div class="archetype-info">
                            <h3 class="archetype-name">${archetype.name}</h3>
                            <p class="archetype-description">${archetype.description}</p>
                            <div class="archetype-traits">
                                ${archetype.traits.map(trait => 
                                    `<span class="archetype-trait">${trait}</span>`
                                ).join('')}
                            </div>
                        </div>
                    </div>
            `;

            if (secondary) {
                html += `
                    <div class="archetype-secondary">
                        <div class="secondary-label">Secondary Trait:</div>
                        <div class="secondary-info">
                            <span class="secondary-emoji">${secondary.emoji}</span>
                            <span class="secondary-name">${secondary.name}</span>
                        </div>
                    </div>
                `;
            }

            html += `
                    <div class="archetype-compatibility">
                        <button class="btn-view-compatible" onclick="viewCompatibleArchetypes('${archetype.type}')">
                            View Compatible Types
                        </button>
                    </div>
                </div>
            `;

            container.innerHTML = html;

        } catch (error) {
            console.error('Error displaying archetype:', error);
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = '<div class="archetype-error">Error loading archetype</div>';
            }
        }
    }

    /**
     * Display archetype badge (compact version for match cards)
     * @param {string} userId - User ID
     * @param {string} containerId - DOM element ID to render badge
     */
    async function displayArchetypeBadge(userId, containerId) {
        try {
            const container = document.getElementById(containerId);
            if (!container) return;

            const response = await fetch(`${API_BASE_URL}/archetypes/user/${userId}`);
            const data = await response.json();

            if (!data.success || !data.archetype) {
                container.innerHTML = '';
                return;
            }

            const archetype = data.archetype.primary;

            container.innerHTML = `
                <div class="archetype-badge" title="${archetype.description}">
                    <span class="badge-emoji">${archetype.emoji}</span>
                    <span class="badge-name">${archetype.name}</span>
                </div>
            `;

        } catch (error) {
            console.error('Error displaying archetype badge:', error);
        }
    }

    /**
     * View compatible archetypes modal
     * @param {string} archetypeType - Current archetype type
     */
    async function viewCompatibleArchetypes(archetypeType) {
        try {
            const response = await fetch(`${API_BASE_URL}/archetypes/recommendations/${archetypeType}`);
            const data = await response.json();

            if (!data.success) {
                alert('Unable to load compatible archetypes');
                return;
            }

            const recommendations = data.recommendations;

            let html = `
                <div class="modal-overlay" id="archetype-modal">
                    <div class="modal-content archetype-modal">
                        <div class="modal-header">
                            <h2>Compatible Viewing Personalities</h2>
                            <button class="close-modal" onclick="closeArchetypeModal()">&times;</button>
                        </div>
                        <div class="modal-body">
                            <p class="modal-intro">These viewing personalities are most compatible with yours:</p>
                            <div class="compatible-list">
            `;

            recommendations.forEach(rec => {
                html += `
                    <div class="compatible-item">
                        <div class="compatible-emoji">${rec.emoji}</div>
                        <div class="compatible-info">
                            <h4>${rec.name}</h4>
                            <p>${rec.description}</p>
                            <div class="compatible-traits">
                                ${rec.traits.map(trait => 
                                    `<span class="trait-tag">${trait}</span>`
                                ).join('')}
                            </div>
                        </div>
                    </div>
                `;
            });

            html += `
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Add modal to body
            const modalContainer = document.createElement('div');
            modalContainer.innerHTML = html;
            document.body.appendChild(modalContainer);

        } catch (error) {
            console.error('Error viewing compatible archetypes:', error);
            alert('Error loading compatible archetypes');
        }
    }

    /**
     * Close archetype modal
     */
    function closeArchetypeModal() {
        const modal = document.getElementById('archetype-modal');
        if (modal && modal.parentElement) {
            modal.parentElement.remove();
        }
    }

    /**
     * Load debate prompts
     * @param {string} containerId - DOM element ID to render prompts
     * @param {string} category - Optional category filter
     */
    async function loadDebatePrompts(containerId, category = null) {
        try {
            const container = document.getElementById(containerId);
            if (!container) return;

            container.innerHTML = '<div class="prompts-loading">Loading debate prompts...</div>';

            const url = category 
                ? `${API_BASE_URL}/archetypes/debates/prompts?category=${category}`
                : `${API_BASE_URL}/archetypes/debates/prompts`;

            const response = await fetch(url);
            const data = await response.json();

            if (!data.success) {
                container.innerHTML = '<div class="prompts-error">Unable to load prompts</div>';
                return;
            }

            const prompts = category ? data.prompts : data.prompts.controversial;

            let html = '<div class="debate-prompts-container">';

            prompts.forEach(prompt => {
                html += `
                    <div class="debate-prompt-card" data-prompt-id="${prompt.id}">
                        <div class="prompt-header">
                            <span class="prompt-emoji">${prompt.emoji}</span>
                            <span class="prompt-category">${prompt.category}</span>
                        </div>
                        <p class="prompt-text">${prompt.prompt}</p>
                        <div class="prompt-options">
                            ${prompt.sides.map(side => `
                                <button class="prompt-option" onclick="answerDebatePrompt('${prompt.id}', '${side}')">
                                    ${side}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                `;
            });

            html += '</div>';
            container.innerHTML = html;

        } catch (error) {
            console.error('Error loading debate prompts:', error);
        }
    }

    /**
     * Answer a debate prompt
     * @param {string} promptId - Prompt ID
     * @param {string} answer - User's answer
     */
    async function answerDebatePrompt(promptId, answer) {
        try {
            const userId = localStorage.getItem('currentUserId');
            if (!userId) {
                alert('Please log in to answer prompts');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/archetypes/debates/answer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, promptId, answer })
            });

            const data = await response.json();

            if (data.success) {
                // Visual feedback
                const card = document.querySelector(`[data-prompt-id="${promptId}"]`);
                if (card) {
                    card.classList.add('answered');
                    const options = card.querySelectorAll('.prompt-option');
                    options.forEach(opt => {
                        if (opt.textContent.trim() === answer) {
                            opt.classList.add('selected');
                        }
                        opt.disabled = true;
                    });
                }

                // Show success message
                showNotification(`Answer saved! Total answers: ${data.totalAnswers}`);
            }

        } catch (error) {
            console.error('Error answering prompt:', error);
            alert('Error saving answer');
        }
    }

    /**
     * Show notification
     * @param {string} message - Message to display
     */
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'archetype-notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Expose functions globally
    window.ArchetypeComponent = {
        displayUserArchetype,
        displayArchetypeBadge,
        viewCompatibleArchetypes,
        closeArchetypeModal,
        loadDebatePrompts,
        answerDebatePrompt
    };

})();
