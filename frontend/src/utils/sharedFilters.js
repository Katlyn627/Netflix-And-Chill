// Shared filter management across pages
// This utility ensures consistent filter state across matches, chat, and watch-together pages

class SharedFilters {
    constructor() {
        this.FILTER_STORAGE_KEY = 'sharedMatchFilters';
        this.defaultFilters = {
            minMatchScore: 0,
            minAge: 18,
            maxAge: 100,
            locationRadius: 100,
            genderPreference: [],
            sexualOrientationPreference: [],
            archetypePreference: [],
            // Premium filters
            premiumGenres: [],
            premiumBingeMin: 0,
            premiumBingeMax: 20,
            premiumServices: [],
            premiumDecades: [],
            premiumMinScore: 0,
            // Sorting options
            sortBy: 'score' // score, archetype, recent
        };
    }

    // Load filters from localStorage
    loadFilters() {
        const savedFilters = localStorage.getItem(this.FILTER_STORAGE_KEY);
        if (savedFilters) {
            try {
                const filters = JSON.parse(savedFilters);
                console.log('[SharedFilters] Loaded filters from localStorage:', filters);
                return filters;
            } catch (e) {
                console.error('[SharedFilters] Error parsing saved filters:', e);
                return { ...this.defaultFilters };
            }
        }
        console.log('[SharedFilters] No saved filters found, using defaults');
        return { ...this.defaultFilters };
    }

    // Save filters to localStorage
    saveFilters(filters) {
        try {
            localStorage.setItem(this.FILTER_STORAGE_KEY, JSON.stringify(filters));
            console.log('[SharedFilters] Saved filters to localStorage:', filters);
            return true;
        } catch (e) {
            console.error('[SharedFilters] Error saving filters:', e);
            return false;
        }
    }

    // Reset filters to defaults
    resetFilters() {
        const filters = { ...this.defaultFilters };
        this.saveFilters(filters);
        console.log('[SharedFilters] Reset filters to defaults');
        return filters;
    }

    // Build API URL with filters
    buildFilteredMatchesURL(baseURL, userId, filters, limit = 50) {
        let url = `${baseURL}/matches/find/${userId}?limit=${limit}`;
        
        if (filters.minMatchScore) {
            url += `&minMatchScore=${filters.minMatchScore}`;
        }
        if (filters.minAge) {
            url += `&minAge=${filters.minAge}`;
        }
        if (filters.maxAge) {
            url += `&maxAge=${filters.maxAge}`;
        }
        if (filters.locationRadius) {
            url += `&locationRadius=${filters.locationRadius}`;
        }
        if (filters.genderPreference && filters.genderPreference.length > 0) {
            url += `&genderPreference=${filters.genderPreference.join(',')}`;
        }
        if (filters.sexualOrientationPreference && filters.sexualOrientationPreference.length > 0) {
            url += `&sexualOrientationPreference=${filters.sexualOrientationPreference.join(',')}`;
        }
        if (filters.archetypePreference && filters.archetypePreference.length > 0) {
            url += `&archetypePreference=${filters.archetypePreference.join(',')}`;
        }
        
        // Premium filters
        if (filters.premiumGenres && filters.premiumGenres.length > 0) {
            url += `&premiumGenres=${filters.premiumGenres.join(',')}`;
        }
        if (filters.premiumBingeMin !== undefined) {
            url += `&premiumBingeMin=${filters.premiumBingeMin}`;
        }
        if (filters.premiumBingeMax !== undefined) {
            url += `&premiumBingeMax=${filters.premiumBingeMax}`;
        }
        if (filters.premiumServices && filters.premiumServices.length > 0) {
            url += `&premiumServices=${filters.premiumServices.join(',')}`;
        }
        if (filters.premiumDecades && filters.premiumDecades.length > 0) {
            url += `&premiumDecades=${filters.premiumDecades.join(',')}`;
        }
        if (filters.premiumMinScore) {
            url += `&premiumMinScore=${filters.premiumMinScore}`;
        }
        
        console.log('[SharedFilters] Built URL with filters:', url);
        return url;
    }

    // Load filtered matches from API
    async loadFilteredMatches(userId, filters) {
        const baseURL = window.API_BASE_URL || 'http://localhost:3000/api';
        const url = this.buildFilteredMatchesURL(baseURL, userId, filters);
        
        try {
            console.log('[SharedFilters] Loading filtered matches for user:', userId);
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.success && data.matches) {
                console.log(`[SharedFilters] Loaded ${data.matches.length} filtered matches`);
                return data.matches;
            } else {
                console.log('[SharedFilters] No matches found or API returned error');
                return [];
            }
        } catch (error) {
            console.error('[SharedFilters] Error loading filtered matches:', error);
            return [];
        }
    }

    // Extract filters from form elements (for modal forms)
    extractFiltersFromForm(formPrefix = '') {
        const filters = {};
        
        // Get range/number inputs
        const matchScoreInput = document.getElementById(`${formPrefix}match-score-filter`);
        const ageMinInput = document.getElementById(`${formPrefix}age-range-min-filter`);
        const ageMaxInput = document.getElementById(`${formPrefix}age-range-max-filter`);
        const distanceInput = document.getElementById(`${formPrefix}distance-filter`);
        
        if (matchScoreInput) filters.minMatchScore = parseInt(matchScoreInput.value, 10);
        if (ageMinInput) filters.minAge = parseInt(ageMinInput.value, 10);
        if (ageMaxInput) filters.maxAge = parseInt(ageMaxInput.value, 10);
        if (distanceInput) filters.locationRadius = parseInt(distanceInput.value, 10);
        
        // Get gender preferences
        const genderCheckboxes = document.querySelectorAll(`input[name="${formPrefix}genderFilter"]:checked`);
        let genderPrefs = Array.from(genderCheckboxes).map(cb => cb.value);
        if (genderPrefs.length > 1 && genderPrefs.includes('any')) {
            genderPrefs = genderPrefs.filter(p => p !== 'any');
        }
        filters.genderPreference = genderPrefs.includes('any') ? [] : genderPrefs;
        
        // Get orientation preferences
        const orientationCheckboxes = document.querySelectorAll(`input[name="${formPrefix}orientationFilter"]:checked`);
        let orientationPrefs = Array.from(orientationCheckboxes).map(cb => cb.value);
        if (orientationPrefs.length > 1 && orientationPrefs.includes('any')) {
            orientationPrefs = orientationPrefs.filter(p => p !== 'any');
        }
        filters.sexualOrientationPreference = orientationPrefs.includes('any') ? [] : orientationPrefs;
        
        // Get archetype preferences
        const archetypeCheckboxes = document.querySelectorAll(`input[name="${formPrefix}archetypeFilter"]:checked`);
        let archetypePrefs = Array.from(archetypeCheckboxes).map(cb => cb.value);
        if (archetypePrefs.length > 1 && archetypePrefs.includes('any')) {
            archetypePrefs = archetypePrefs.filter(p => p !== 'any');
        }
        filters.archetypePreference = archetypePrefs.includes('any') ? [] : archetypePrefs;
        
        // Premium filters
        const premiumGenreSelect = document.getElementById(`${formPrefix}premium-genre-filter`);
        if (premiumGenreSelect) {
            const selectedOptions = Array.from(premiumGenreSelect.selectedOptions);
            filters.premiumGenres = selectedOptions.map(option => parseInt(option.value, 10));
        }
        
        const premiumBingeMin = document.getElementById(`${formPrefix}premium-binge-min`);
        const premiumBingeMax = document.getElementById(`${formPrefix}premium-binge-max`);
        if (premiumBingeMin) filters.premiumBingeMin = parseInt(premiumBingeMin.value, 10) || 0;
        if (premiumBingeMax) filters.premiumBingeMax = parseInt(premiumBingeMax.value, 10) || 20;
        
        const premiumServiceCheckboxes = document.querySelectorAll(`input[name="${formPrefix}premiumServiceFilter"]:checked`);
        filters.premiumServices = Array.from(premiumServiceCheckboxes).map(cb => cb.value);
        
        const premiumDecadeCheckboxes = document.querySelectorAll(`input[name="${formPrefix}premiumDecadeFilter"]:checked`);
        filters.premiumDecades = Array.from(premiumDecadeCheckboxes).map(cb => parseInt(cb.value, 10));
        
        const premiumAdvancedScore = document.getElementById(`${formPrefix}premium-advanced-score`);
        if (premiumAdvancedScore) filters.premiumMinScore = parseInt(premiumAdvancedScore.value, 10) || 0;
        
        // Sorting option
        const sortBySelect = document.getElementById(`${formPrefix}sort-by-filter`);
        if (sortBySelect) filters.sortBy = sortBySelect.value || 'score';
        
        console.log('[SharedFilters] Extracted filters from form:', filters);
        return filters;
    }

    // Apply filters to form elements (populate form with current filters)
    applyFiltersToForm(filters, formPrefix = '') {
        // Set range/number inputs
        const matchScoreInput = document.getElementById(`${formPrefix}match-score-filter`);
        const matchScoreValue = document.getElementById(`${formPrefix}match-score-value`);
        const ageMinInput = document.getElementById(`${formPrefix}age-range-min-filter`);
        const ageMaxInput = document.getElementById(`${formPrefix}age-range-max-filter`);
        const distanceInput = document.getElementById(`${formPrefix}distance-filter`);
        const distanceValue = document.getElementById(`${formPrefix}distance-value`);
        
        if (matchScoreInput) {
            matchScoreInput.value = filters.minMatchScore || 0;
            if (matchScoreValue) matchScoreValue.textContent = `${filters.minMatchScore || 0}%`;
        }
        if (ageMinInput) ageMinInput.value = filters.minAge || 18;
        if (ageMaxInput) ageMaxInput.value = filters.maxAge || 100;
        if (distanceInput) {
            distanceInput.value = filters.locationRadius || 100;
            if (distanceValue) {
                const distanceText = (filters.locationRadius || 100) >= 100 ? 'Anywhere' : `${filters.locationRadius || 100} miles`;
                distanceValue.textContent = distanceText;
            }
        }
        
        // Set gender checkboxes
        document.querySelectorAll(`input[name="${formPrefix}genderFilter"]`).forEach(cb => {
            cb.checked = filters.genderPreference.length === 0 
                ? cb.value === 'any'
                : filters.genderPreference.includes(cb.value);
        });
        
        // Set orientation checkboxes
        document.querySelectorAll(`input[name="${formPrefix}orientationFilter"]`).forEach(cb => {
            cb.checked = filters.sexualOrientationPreference.length === 0 
                ? cb.value === 'any'
                : filters.sexualOrientationPreference.includes(cb.value);
        });
        
        // Set archetype checkboxes
        document.querySelectorAll(`input[name="${formPrefix}archetypeFilter"]`).forEach(cb => {
            cb.checked = filters.archetypePreference.length === 0 
                ? cb.value === 'any'
                : filters.archetypePreference.includes(cb.value);
        });
        
        // Set premium filters
        const premiumGenreSelect = document.getElementById(`${formPrefix}premium-genre-filter`);
        if (premiumGenreSelect && filters.premiumGenres) {
            Array.from(premiumGenreSelect.options).forEach(option => {
                option.selected = filters.premiumGenres.includes(parseInt(option.value, 10));
            });
        }
        
        const premiumBingeMin = document.getElementById(`${formPrefix}premium-binge-min`);
        const premiumBingeMax = document.getElementById(`${formPrefix}premium-binge-max`);
        if (premiumBingeMin) premiumBingeMin.value = filters.premiumBingeMin || 0;
        if (premiumBingeMax) premiumBingeMax.value = filters.premiumBingeMax || 20;
        
        document.querySelectorAll(`input[name="${formPrefix}premiumServiceFilter"]`).forEach(cb => {
            cb.checked = filters.premiumServices && filters.premiumServices.includes(cb.value);
        });
        
        document.querySelectorAll(`input[name="${formPrefix}premiumDecadeFilter"]`).forEach(cb => {
            cb.checked = filters.premiumDecades && filters.premiumDecades.includes(parseInt(cb.value, 10));
        });
        
        const premiumAdvancedScore = document.getElementById(`${formPrefix}premium-advanced-score`);
        const premiumAdvancedScoreValue = document.getElementById(`${formPrefix}premium-advanced-score-value`);
        if (premiumAdvancedScore) {
            premiumAdvancedScore.value = filters.premiumMinScore || 0;
            if (premiumAdvancedScoreValue) premiumAdvancedScoreValue.textContent = `${filters.premiumMinScore || 0}%`;
        }
        
        // Set sort by dropdown
        const sortBySelect = document.getElementById(`${formPrefix}sort-by-filter`);
        if (sortBySelect) sortBySelect.value = filters.sortBy || 'score';
        
        console.log('[SharedFilters] Applied filters to form');
    }
}

// Create a singleton instance
const sharedFilters = new SharedFilters();

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.SharedFilters = sharedFilters;
}
