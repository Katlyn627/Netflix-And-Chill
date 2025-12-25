# Browser Extension Compatibility

## Overview

This document explains how the Netflix and Chill dating app handles browser extensions designed for streaming services.

## The Issue

When you have browser extensions installed for streaming services (like Teleparty, Netflix Party, Scener, etc.), these extensions may display console errors when running on non-streaming domains like localhost or custom domains.

### Common Error Messages

You may see errors like:
```
READ - Host validation failed: {hostName: '', hostType: undefined}
Host is not supported
Host is not valid or supported
```

These errors come from browser extensions that are designed to only work on specific streaming platforms (Netflix, Disney+, Hulu, etc.). When they detect they're running on a different domain, they log these warnings.

## Our Solution

The Netflix and Chill app includes an **Error Handler** utility (`src/utils/errorHandler.js`) that:

1. **Automatically suppresses** known browser extension errors
2. **Prevents console pollution** from third-party extension warnings
3. **Maintains normal app functionality** despite these extensions being active
4. **Provides debug mode** for developers who need to see suppressed errors

## How It Works

The error handler intercepts console errors and warnings, checking them against known patterns from streaming browser extensions. If a match is found, the error is suppressed to keep your console clean.

### Known Extension Error Patterns

The handler recognizes and suppresses:
- Host validation failures
- "Host is not supported" messages
- "Host is not valid or supported" warnings
- Content script errors from browser extensions

## For Users

**You don't need to do anything!** The error handler is automatically included in all pages.

### If You See These Errors

If you see host validation errors in your browser console:
- **Don't worry** - they're harmless and won't affect the app
- The errors come from your browser extensions, not our app
- Our error handler should suppress them automatically

### Disabling Extensions (Optional)

If you prefer to completely eliminate these errors, you can:
1. Temporarily disable streaming browser extensions when using our app
2. Or configure your extensions to not run on localhost/your domain

## For Developers

### Debug Mode

To see suppressed errors during development:

```javascript
// In browser console or add to your code
window.debugMode = true;
```

This will log suppressed errors with the prefix `[Suppressed Extension Error]`.

### Accessing Original Console Methods

The original console methods are preserved:

```javascript
window._originalConsole.error('This will not be filtered');
window._originalConsole.warn('This will not be filtered');
```

### Adding New Error Patterns

To suppress additional extension errors, edit `src/utils/errorHandler.js` and add patterns to the `knownExtensionErrors` array:

```javascript
const knownExtensionErrors = [
    /Host validation failed/i,
    /Your new pattern here/i,
    // ... more patterns
];
```

## Technical Details

### Implementation

The error handler is implemented as an IIFE (Immediately Invoked Function Expression) that:
1. Runs before other scripts
2. Wraps native console methods
3. Filters messages based on regex patterns
4. Preserves original console functionality

### Files Modified

- `frontend/src/utils/errorHandler.js` - The error handler utility
- All HTML pages - Include the error handler script
- `frontend/src/components/watch-together.js` - Added extension detection

### Performance Impact

The error handler has minimal performance impact:
- Only processes console messages that would be logged anyway
- Uses efficient regex matching
- No network requests or external dependencies

## Related Features

This enhancement supports the **Watch Together** feature, which provides information about third-party streaming platforms:
- Teleparty (Netflix Party)
- Amazon Prime Watch Party
- Disney+ GroupWatch
- Scener
- Zoom screen sharing

See `WATCH-TOGETHER-FEATURE.md` for more information.

## Support

If you continue to see errors that aren't being suppressed:
1. Check that `errorHandler.js` is loaded before other scripts
2. Verify the error pattern matches known patterns
3. Enable debug mode to inspect suppressed errors
4. Report new patterns to the development team

## Version History

- **v1.0.0** - Initial implementation of error handler
  - Suppresses host validation errors from streaming extensions
  - Includes debug mode for development
  - Integrated into all HTML pages
