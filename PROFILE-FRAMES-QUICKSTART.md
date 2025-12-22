# Profile Frame Feature - Quick Reference

## For Developers

### Adding a New Archetype Frame

1. **Add to Configuration** (`backend/constants/profileFrames.js`):
```javascript
new_archetype: {
  name: 'The New Archetype',
  description: 'Short description',
  colors: {
    primary: '#COLOR1',
    secondary: '#COLOR2',
    accent: '#COLOR3',
    gradient: 'linear-gradient(...)'
  },
  borderStyle: {
    width: '4px',
    style: 'solid',
    pattern: 'style-name'
  },
  icon: '🎭',
  traits: ['Trait1', 'Trait2', 'Trait3']
}
```

2. **Add CSS Style** (`frontend/src/styles/profile-frames.css`):
```css
.profile-frame-new_archetype {
  background: linear-gradient(...);
  border: 4px solid #COLOR;
  /* Additional styling */
}

.profile-frame-new_archetype::before {
  content: '🎭';
  /* Icon styling */
}
```

3. **That's it!** The system will automatically:
   - Include it in the frame selector
   - Show it in previews
   - Allow users to select it
   - Display it on profiles

## For Users

### How to Get a Profile Frame

1. Complete the movie personality quiz
2. Go to your profile page
3. Look for "🎨 Customize Your Profile Frame" button
4. Click to open frame selector
5. Preview and select your favorite frame
6. Click "Apply This Frame"
7. Your profile picture now has a themed frame!

### How to Change Your Frame

1. Go to your profile page
2. Click "✨ Change Profile Frame" button
3. Select a different frame
4. Click "Apply This Frame"

### How to Remove Your Frame

1. Go to your profile page
2. Click "✨ Change Profile Frame" button
3. Click "Remove Current Frame" button at the bottom

## For API Consumers

### Get Available Frames
```bash
GET /api/users/{userId}/profile-frames
```

Response includes:
- User's archetype
- Recommended frame for their archetype
- All 8 available frames
- Current active frame (if any)

### Apply a Frame
```bash
PUT /api/users/{userId}/profile-frames
Content-Type: application/json

{
  "archetypeType": "cinephile",
  "isActive": true
}
```

### Remove Frame
```bash
DELETE /api/users/{userId}/profile-frames
```

## Archetype → Frame Mapping

| Quiz Archetype | Frame Theme | Primary Color |
|----------------|-------------|---------------|
| cinephile | Vintage elegance | Gold #D4AF37 |
| casual_viewer | Light & breezy | Sky Blue #87CEEB |
| binge_watcher | Vibrant energy | Neon Purple #9D4EDD |
| social_butterfly | Bright & engaging | Yellow #FFD700 |
| genre_specialist | Bold & focused | Dark Red #8B0000 |
| critic | Minimalist | Black #000000 |
| collector | Nostalgic warmth | Sepia #704214 |
| tech_enthusiast | Futuristic | Cyan #00CED1 |

## Troubleshooting

### Frame Not Appearing?
- Check if user has completed the quiz
- Verify profileFrame data exists in user object
- Check browser console for errors
- Ensure profile-frames.css is loaded

### Wrong Frame Showing?
- Check user's archetype assignment
- Verify profileFrame.archetypeType matches configuration
- Check for CSS conflicts

### API Errors?
- **404**: User not found - verify userId
- **400**: Invalid archetype type - check spelling
- **500**: Server error - check server logs

## File Locations

```
backend/
├── constants/profileFrames.js       # Frame configuration
├── models/User.js                   # User model with profileFrame
├── controllers/userController.js    # Frame API endpoints
└── routes/users.js                  # Frame routes

frontend/
├── src/
│   ├── styles/profile-frames.css           # Frame styles
│   └── components/
│       ├── profile-frame-selector.js       # Frame selector
│       └── profile-view.js                 # Profile integration
├── profile-view.html                # Main profile page
└── profile-frames-demo.html         # Demo showcase

docs/
├── PROFILE-FRAMES-DOCUMENTATION.md    # Full technical docs
├── PROFILE-FRAMES-SUMMARY.md          # Implementation summary
└── SECURITY-SUMMARY-PROFILE-FRAMES.md # Security analysis
```

## Quick Code Snippets

### Check if User Has Frame
```javascript
if (user.profileFrame && user.profileFrame.isActive) {
  console.log(`User has ${user.profileFrame.archetypeType} frame`);
}
```

### Apply Frame Programmatically
```javascript
const frameSelector = new ProfileFrameSelector(userId);
await frameSelector.init();
await frameSelector.selectFrame('cinephile');
```

### Get Frame Theme Details
```javascript
const { getFrameTheme } = require('./backend/constants/profileFrames');
const theme = getFrameTheme('cinephile');
console.log(theme.colors); // { primary, secondary, accent, gradient }
```

## CSS Class Reference

Apply these classes to elements:

- `.profile-frame` - Base frame container
- `.profile-frame-{archetype}` - Specific archetype style
- `.profile-frame-inner` - Inner content wrapper
- `.profile-picture-with-frame` - Complete framed picture

Example:
```html
<div class="profile-picture-with-frame">
  <div class="profile-frame profile-frame-cinephile">
    <div class="profile-frame-inner">
      <img src="profile.jpg" alt="Profile">
    </div>
  </div>
</div>
```

## Performance Notes

- Frames are CSS-only (no image loading)
- Minimal JavaScript execution
- No server overhead after initial load
- Frames cached in user object

## Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS/Android)

## Key Constants

```javascript
// Animation timing
NOTIFICATION_ANIMATION_DURATION = 300ms

// Default paths
DEFAULT_PROFILE_IMAGE = 'assets/images/default-profile.svg'

// API Base
API_BASE_URL = 'http://localhost:3000/api'
```

## Testing Checklist

- [ ] User has completed quiz
- [ ] Archetype is assigned
- [ ] Frame selector opens
- [ ] All 8 frames display
- [ ] Preview shows correct colors
- [ ] Frame applies successfully
- [ ] Frame persists on reload
- [ ] Frame can be changed
- [ ] Frame can be removed

## Support Resources

- Technical Documentation: `PROFILE-FRAMES-DOCUMENTATION.md`
- Implementation Details: `PROFILE-FRAMES-SUMMARY.md`
- Security Information: `SECURITY-SUMMARY-PROFILE-FRAMES.md`
- Live Demo: `/profile-frames-demo.html`

---

**Last Updated**: December 22, 2024
**Version**: 1.0.0
**Status**: Production Ready ✅
