// Error Handler Utility
// Handles and suppresses known third-party browser extension errors

(function() {
    'use strict';

    // Store original console methods
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    const originalConsoleLog = console.log;

    // Known error patterns from browser extensions that should be suppressed
    const knownExtensionErrors = [
        /Host validation failed/i,
        /Host is not supported/i,
        /Host is not valid or supported/i,
        /Host is not in insights whitelist/i,
        /hostName.*hostType/i,
        /content\.js:\d+/i,  // Common pattern for browser extension content scripts
        /read\.js:\d+/i,     // Common pattern for browser extension read scripts
        /installHook\.js/i   // Browser extension install hooks
    ];
    
    // Auth0 errors that are already handled by the application
    const knownAuth0Errors = [
        /Auth0 error from callback:/i,
        /access_denied/i,
        /unauthorized/i,
        /login_required/i
    ];

    /**
     * Checks if an error message matches known extension error patterns
     * @param {string} message - The error message to check
     * @returns {boolean} - True if the error is from a known extension
     */
    function isKnownExtensionError(message) {
        const messageStr = String(message);
        return knownExtensionErrors.some(pattern => pattern.test(messageStr));
    }
    
    /**
     * Checks if an error message is an Auth0 error already handled by the app
     * @param {string} message - The error message to check
     * @returns {boolean} - True if the error is an Auth0 error already being handled
     */
    function isHandledAuth0Error(message) {
        const messageStr = String(message);
        // Only suppress if it contains both "Auth0" and one of the known error patterns
        const hasAuth0Prefix = /Auth0/i.test(messageStr);
        return hasAuth0Prefix && knownAuth0Errors.some(pattern => pattern.test(messageStr));
    }

    /**
     * Enhanced console.error that filters known extension errors
     */
    console.error = function(...args) {
        const errorMessage = args.map(arg => String(arg)).join(' ');
        
        if (isKnownExtensionError(errorMessage)) {
            // Optionally log to a debug console if needed
            if (window.debugMode) {
                originalConsoleLog('[Suppressed Extension Error]:', ...args);
            }
            return;
        }
        
        if (isHandledAuth0Error(errorMessage)) {
            // Optionally log to a debug console if needed
            if (window.debugMode) {
                originalConsoleLog('[Suppressed Auth0 Error - Already Handled]:', ...args);
            }
            return;
        }
        
        originalConsoleError.apply(console, args);
    };

    /**
     * Enhanced console.warn that filters known extension warnings
     */
    console.warn = function(...args) {
        const warnMessage = args.map(arg => String(arg)).join(' ');
        
        if (isKnownExtensionError(warnMessage)) {
            if (window.debugMode) {
                originalConsoleLog('[Suppressed Extension Warning]:', ...args);
            }
            return;
        }
        
        originalConsoleWarn.apply(console, args);
    };

    // Store original methods globally for debugging if needed
    window._originalConsole = {
        error: originalConsoleError,
        warn: originalConsoleWarn,
        log: originalConsoleLog
    };

    // Set debugMode to true to see suppressed errors
    window.debugMode = false;

    console.log('✓ Error handler initialized - browser extension errors will be suppressed');
})();
