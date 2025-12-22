# Profile Frame Feature Documentation

## Overview
The Profile Frame feature allows users to customize their profile pictures with themed frames based on their movie personality archetype. Each archetype has a unique frame design with specific colors, patterns, and visual elements that reflect the personality traits.

## Architecture

### Backend Components

#### 1. Profile Frame Configuration (`backend/constants/profileFrames.js`)
Defines the visual themes and metadata for each archetype:
- **Color palettes**: Primary, secondary, and accent colors
- **Border styles**: Width, style, and pattern specifications
- **Traits**: Personality characteristics
- **Icons**: Emoji representations

#### 2. User Model Extension (`backend/models/User.js`)
Added `profileFrame` field to store:
```javascript
{
  archetypeType: string,    // e.g., 'cinephile', 'binge_watcher'
  isActive: boolean,        // Whether frame is currently applied
  selectedAt: ISO timestamp // When the frame was selected
}
```

#### 3. API Endpoints (`backend/controllers/userController.js`)
- `GET /api/users/:userId/profile-frames` - Get available frames and recommendations
- `PUT /api/users/:userId/profile-frames` - Apply a profile frame
- `DELETE /api/users/:userId/profile-frames` - Remove current frame

### Frontend Components

#### 1. Profile Frame Styles (`frontend/src/styles/profile-frames.css`)
CSS classes for each archetype frame:
- `.profile-frame-cinephile` - Gold, black, vintage tones
- `.profile-frame-casual_viewer` - Pastel blues and greens
- `.profile-frame-binge_watcher` - Vibrant neon purples and oranges (animated)
- `.profile-frame-social_butterfly` - Bright yellows and pinks
- `.profile-frame-genre_specialist` - Dark reds, greens, bold monotones
- `.profile-frame-critic` - Black and white minimalist
- `.profile-frame-collector` - Nostalgic sepia and earthy tones
- `.profile-frame-tech_enthusiast` - Sleek silver and cyan

#### 2. Profile Frame Selector Component (`frontend/src/components/profile-frame-selector.js`)
Interactive UI for selecting frames:
- Displays recommended frame based on user's archetype
- Shows all available frames in a grid
- Preview modal with color swatches and traits
- Real-time frame application

#### 3. Profile View Integration (`frontend/src/components/profile-view.js`)
- Renders profile picture with applied frame
- Shows "Customize Profile Frame" button in quiz results section
- Modal interface for frame selection

## Archetype Frame Details

### The Cinephile 🎬
**Theme**: Vintage elegance meets artistic appreciation
**Colors**: 
- Primary: #D4AF37 (Gold)
- Secondary: #000000 (Black)
- Accent: #8B7355 (Vintage brown)
**Border**: 6px double border with golden highlights
**Traits**: Artistic, Cultured, Analytical

### The Casual Viewer 🍿
**Theme**: Light and breezy entertainment vibes
**Colors**:
- Primary: #87CEEB (Sky blue)
- Secondary: #98FB98 (Pale green)
- Accent: #B0E0E6 (Powder blue)
**Border**: 4px solid with rounded corners
**Traits**: Relaxed, Easy-going, Fun-loving

### The Binge Watcher 📺
**Theme**: Vibrant energy for marathon sessions
**Colors**:
- Primary: #9D4EDD (Neon purple)
- Secondary: #FF6B35 (Vibrant orange)
- Accent: #F72585 (Hot pink)
**Border**: 5px solid with animated glow effect
**Traits**: Dedicated, Immersive, Passionate

### The Social Butterfly 🎉
**Theme**: Bright and engaging social vibes
**Colors**:
- Primary: #FFD700 (Bright yellow)
- Secondary: #FF69B4 (Hot pink)
- Accent: #FF8C00 (Dark orange)
**Border**: 5px dotted with playful accents
**Traits**: Outgoing, Enthusiastic, Collaborative

### The Genre Specialist 🎯
**Theme**: Bold and focused genre expertise
**Colors**:
- Primary: #8B0000 (Dark red)
- Secondary: #006400 (Dark green)
- Accent: #2F4F4F (Dark slate gray)
**Border**: 5px solid with geometric pattern
**Traits**: Focused, Expert, Discerning

### The Critic 📝
**Theme**: Sophisticated minimalist aesthetic
**Colors**:
- Primary: #000000 (Black)
- Secondary: #FFFFFF (White)
- Accent: #696969 (Dim gray)
**Border**: 4px solid with minimal design
**Traits**: Analytical, Thoughtful, Detail-oriented

### The Collector 📀
**Theme**: Nostalgic warmth and timeless appeal
**Colors**:
- Primary: #704214 (Sepia brown)
- Secondary: #DEB887 (Burlywood)
- Accent: #8B4513 (Saddle brown)
**Border**: 6px double border with vintage style
**Traits**: Nostalgic, Passionate, Curator

### The Tech Enthusiast 🚀
**Theme**: Sleek futuristic innovation
**Colors**:
- Primary: #00CED1 (Dark turquoise)
- Secondary: #C0C0C0 (Silver)
- Accent: #4682B4 (Steel blue)
**Border**: 4px solid with modern tech-inspired design
**Traits**: Innovative, Quality-focused, Forward-thinking

## Usage Flow

1. **User Completes Quiz**: User takes the movie personality quiz
2. **Archetype Assigned**: System assigns a primary archetype based on quiz results
3. **Frame Recommendation**: System recommends a frame matching the archetype
4. **User Selects Frame**: User can choose the recommended frame or any other available frame
5. **Frame Applied**: Selected frame wraps around the user's profile picture
6. **Profile Display**: Frame is displayed on profile views and potentially in match cards

## API Examples

### Get Available Frames
```bash
GET /api/users/user123/profile-frames
```

Response:
```json
{
  "userId": "user123",
  "archetype": {
    "type": "cinephile",
    "name": "The Cinephile",
    "description": "Deep appreciation for film as an art form"
  },
  "recommendedFrame": {
    "type": "cinephile",
    "name": "The Cinephile",
    "colors": {...},
    "borderStyle": {...}
  },
  "allFrames": [...],
  "currentFrame": null
}
```

### Apply Frame
```bash
PUT /api/users/user123/profile-frames
Content-Type: application/json

{
  "archetypeType": "cinephile",
  "isActive": true
}
```

### Remove Frame
```bash
DELETE /api/users/user123/profile-frames
```

## Scalability

The system is designed to be easily scalable:

1. **Adding New Archetypes**: 
   - Add new entry to `PROFILE_FRAME_THEMES` in `profileFrames.js`
   - Create corresponding CSS class in `profile-frames.css`
   - No changes needed to API or component logic

2. **Customization Options**:
   - Color palettes can be easily modified
   - Border styles can be enhanced with additional patterns
   - Animation effects can be added per archetype

3. **Future Enhancements**:
   - Multiple frame options per archetype
   - Seasonal or limited-edition frames
   - Custom user-uploaded frames
   - Frame animations and effects
   - Frame unlocking through achievements

## Testing Checklist

- [x] Backend configuration loads correctly
- [x] API endpoints respond with proper data structure
- [x] User model saves profileFrame data
- [x] CSS frames render correctly for all archetypes
- [x] Frame selector component loads available frames
- [x] Frame preview shows correct colors and traits
- [x] Frame application updates user profile
- [x] Profile picture displays with applied frame
- [x] Frame removal works correctly
- [ ] Test with real user profiles and quiz data
- [ ] Test frame persistence across sessions
- [ ] Test responsive design on mobile devices

## Known Limitations

1. Frames require user to have completed the personality quiz
2. Users can only have one active frame at a time
3. Frames are applied client-side with CSS (no image manipulation)
4. Generic profile icons may not look as good as actual photos

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (may need `-webkit-` prefixes for animations)
- Mobile browsers: Supported with responsive design

## Performance Considerations

- CSS frames are lightweight and performant
- No additional image loading required
- Frame data is included in user profile response
- Client-side rendering keeps server load minimal
