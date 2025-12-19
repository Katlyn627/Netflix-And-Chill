# Onboarding Assets

This directory contains documentation for the visual assets used in the Netflix & Chill app onboarding flow.

**Note**: The actual image files are located in `frontend/assets/onboarding/` for web serving purposes. This directory contains the documentation and guidelines.

## Brand Kit

**Netflix & Chill – Brand Kit**

### Primary Colors
- **Cinematic Red**: `#E50914` - Primary brand color, used for CTAs and highlights
- **Black**: `#000000` - Primary background and text
- **White**: `#FFFFFF` - Secondary text and contrast elements
- **Dark Gray**: `#141414` - Secondary background for cards and sections

### Logo Variants
The app uses multiple logo variants for different contexts:
- **Full Logo**: Complete branding with text and icon
- **Text-free Icon**: Standalone icon for app icons
- **Dark Mode**: Optimized for dark backgrounds
- **Rounded Icon**: Circular variant for profile pictures and avatars

## Onboarding Assets

### 1. Logo (`logo.svg`)
- **Purpose**: Central branding image used throughout the app
- **Usage**: 
  - App icon and splash screens
  - Login/signup screens
  - Marketing materials
  - App store listings
- **Design**: Features the Netflix & Chill branding with TV/heart icon
- **Dimensions**: 400x400px (scalable SVG)

### 2. Onboarding Screen 1 (`onboard1.svg`)
- **Title**: "Chat & Watch Together"
- **Message**: Connect with matches and enjoy streaming content together
- **Visual Theme**: Two TV screens with play buttons and chat bubbles
- **Color Scheme**: Cinematic Red (#E50914), Black, White
- **Purpose**: Introduces the social watching feature
- **Dimensions**: 400x400px (scalable SVG)

### 3. Onboarding Screen 2 (`onboard2.svg`)
- **Title**: "Build Real Connections"
- **Message**: Form genuine relationships based on shared interests
- **Visual Theme**: Two people silhouettes with connecting hearts
- **Color Scheme**: Cinematic Red (#E50914), Black, White
- **Purpose**: Emphasizes relationship building over casual swiping
- **Dimensions**: 400x400px (scalable SVG)

### 4. Onboarding Screen 3 (`onboard3.svg`)
- **Title**: "Discover Matches Through Movies"
- **Message**: Get matched based on your streaming preferences and watch history
- **Visual Theme**: Film reel with magnifying glass and heart
- **Color Scheme**: Cinematic Red (#E50914), Black, White
- **Purpose**: Explains the unique matching algorithm
- **Dimensions**: 400x400px (scalable SVG)

## Value Proposition

The onboarding screens guide new users through the app's core features:

1. **Social Experience**: Unlike traditional dating apps, Netflix & Chill emphasizes shared experiences through streaming content
2. **Meaningful Connections**: Focuses on building real relationships based on common interests rather than superficial swiping
3. **Smart Matching**: Uses sophisticated algorithms to match users based on streaming services, watch history, and preferences

## Implementation Notes

### File Format
- Images are provided in SVG format for scalability and small file size
- SVG files can be easily converted to PNG/JPEG if needed for specific platforms
- Maintain aspect ratio when converting to raster formats

### Accessibility
- All images include descriptive alt text in implementation
- Color contrast meets WCAG AA standards
- Text overlays use high-contrast white text on dark backgrounds

### Responsive Design
- Images scale seamlessly across devices (mobile, tablet, desktop)
- Maintain 1:1 aspect ratio for consistency
- Minimum display size: 300x300px
- Maximum display size: 600x600px (for optimal performance)

### Integration Points
1. **First Launch**: Show onboarding carousel on first app launch
2. **Splash Screen**: Display logo during app initialization
3. **Empty States**: Use onboarding images in empty state screens
4. **Help/Tutorial**: Reference in help documentation and tutorials
5. **Marketing**: Use in app store screenshots and promotional materials

## Usage Guidelines

### Do's ✅
- Use official brand colors (#E50914, #000000, #FFFFFF)
- Maintain aspect ratios when resizing
- Use high-quality exports for production
- Follow brand guidelines for logo placement
- Ensure adequate padding around images

### Don'ts ❌
- Don't modify brand colors
- Don't distort or stretch images
- Don't add filters or effects without approval
- Don't use low-resolution versions in production
- Don't crop images in ways that remove key elements

## Updating Assets

To update or replace these assets:

1. Ensure new images follow the brand guidelines
2. Maintain the same file naming convention
3. Keep dimensions consistent (400x400px recommended)
4. Test on multiple devices and screen sizes
5. Update this README with any changes to usage or guidelines

## Technical Specifications

- **Format**: SVG (Scalable Vector Graphics)
- **Dimensions**: 400x400px base size
- **Color Space**: sRGB
- **Compression**: Optimized for web delivery
- **Browser Support**: All modern browsers (Chrome, Firefox, Safari, Edge)
- **Fallback**: PNG versions available if needed

---

**Note**: Replace the SVG placeholder images with actual high-quality PNG images before production deployment. The current SVG files serve as visual placeholders demonstrating the intended design and layout.
