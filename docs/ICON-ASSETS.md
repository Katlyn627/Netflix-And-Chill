# Icon and Logo Assets Documentation

## Overview
This document describes the logo and icon assets for the Netflix & Chill dating app, including sizing requirements for web, PWA, and future mobile app development (iOS and Android).

## Asset Location
All logo and icon files are stored in: `/frontend/assets/images/`

## Available Assets

### Logo Files (PNG Format)
- **logo.png** - Default logo (512x512)
- **logo-1024x1024.png** - High-resolution logo for app stores and marketing
- **logo-512x512.png** - Standard high-quality logo
- **logo-256x256.png** - Medium-size logo
- **logo-192x192.png** - PWA standard icon
- **logo-128x128.png** - Small icon
- **logo-64x64.png** - Extra small icon
- **logo-32x32.png** - Tiny icon
- **logo-16x16.png** - Micro icon

### Favicon
- **favicon.ico** - Multi-size favicon for browser tabs and bookmarks (contains 16x16, 32x32, and 64x64)

## Web Application Usage

### HTML Integration
All HTML files include the following in the `<head>` section:
```html
<link rel="icon" type="image/x-icon" href="assets/images/favicon.ico">
<link rel="manifest" href="manifest.json">
<meta name="theme-color" content="#E50914">
```

### PWA Manifest
The `manifest.json` file is configured with multiple icon sizes for Progressive Web App support:
- 64x64 - Minimum icon
- 128x128 - Small icon
- 192x192 - Standard PWA icon (also maskable)
- 256x256 - Medium icon
- 512x512 - Large PWA icon (also maskable)
- 1024x1024 - Maximum resolution

## Mobile App Development Requirements

### iOS App Store Requirements

#### App Icon (Required Sizes)
When converting to a native iOS app using React Native or similar framework, you'll need:

1. **App Icon (iOS)**
   - 1024x1024 - App Store icon (use `logo-1024x1024.png`)
   - 180x180 - iPhone @3x
   - 120x120 - iPhone @2x
   - 167x167 - iPad Pro @2x
   - 152x152 - iPad @2x
   - 76x76 - iPad @1x

2. **Additional iOS Assets**
   - 120x120 - Spotlight search @2x
   - 80x80 - Spotlight search @3x
   - 58x58 - Settings @2x
   - 87x87 - Settings @3x
   - 40x40 - Notification @2x
   - 60x60 - Notification @3x

#### How to Generate iOS Assets
```bash
# From the existing logo-1024x1024.png, create iOS icons:
cd frontend/assets/images

# iPhone/iPad icons
convert logo-1024x1024.png -resize 180x180 ios-icon-180.png
convert logo-1024x1024.png -resize 167x167 ios-icon-167.png
convert logo-1024x1024.png -resize 152x152 ios-icon-152.png
convert logo-1024x1024.png -resize 120x120 ios-icon-120.png
convert logo-1024x1024.png -resize 87x87 ios-icon-87.png
convert logo-1024x1024.png -resize 80x80 ios-icon-80.png
convert logo-1024x1024.png -resize 76x76 ios-icon-76.png
convert logo-1024x1024.png -resize 60x60 ios-icon-60.png
convert logo-1024x1024.png -resize 58x58 ios-icon-58.png
convert logo-1024x1024.png -resize 40x40 ios-icon-40.png
```

### Android App Store Requirements

#### App Icon (Required Sizes)
When converting to a native Android app, you'll need:

1. **Launcher Icons**
   - 512x512 - Google Play Store (use `logo-512x512.png`)
   - 192x192 - xxxhdpi (4.0x)
   - 144x144 - xxhdpi (3.0x)
   - 96x96 - xhdpi (2.0x)
   - 72x72 - hdpi (1.5x)
   - 48x48 - mdpi (1.0x)

2. **Notification Icons** (monochrome/white)
   - 96x96 - xxxhdpi
   - 72x72 - xxhdpi
   - 48x48 - xhdpi
   - 36x36 - hdpi
   - 24x24 - mdpi

3. **Feature Graphic** (For Play Store)
   - 1024x500 - Feature graphic for store listing

#### How to Generate Android Assets
```bash
# From the existing logo-1024x1024.png, create Android icons:
cd frontend/assets/images

# Launcher icons
convert logo-1024x1024.png -resize 192x192 android-icon-xxxhdpi.png
convert logo-1024x1024.png -resize 144x144 android-icon-xxhdpi.png
convert logo-1024x1024.png -resize 96x96 android-icon-xhdpi.png
convert logo-1024x1024.png -resize 72x72 android-icon-hdpi.png
convert logo-1024x1024.png -resize 48x48 android-icon-mdpi.png
```

### React Native Integration

When converting this web app to React Native:

1. **Copy Base Assets**
   ```bash
   # Copy logo files to React Native project
   cp frontend/assets/images/logo-1024x1024.png /path/to/react-native-app/assets/
   ```

2. **Generate Platform-Specific Icons**
   - Use a tool like [React Native Asset](https://github.com/unimonkiez/react-native-asset) to automatically generate all required icon sizes
   - Or use [App Icon Generator](https://appicon.co/) online tool
   - Or manually generate using the commands above

3. **Update Configuration Files**
   - **iOS**: Update `Info.plist` with icon references
   - **Android**: Update `AndroidManifest.xml` and add icons to `android/app/src/main/res/` directories

## Brand Colors

The Netflix & Chill brand uses the following colors:

- **Primary (Netflix Red)**: `#E50914`
- **Background**: `#000000` (Black)
- **Text**: `#FFFFFF` (White)
- **Theme Color**: `#E50914` (for PWA and mobile status bars)

## Design Guidelines

### Logo Usage
1. The logo features "N&C" as the primary mark with "Netflix & Chill" text below
2. Background color is Netflix red (#E50914)
3. All text is white for maximum contrast
4. Logo is square format for optimal display across all platforms

### Icon Specifications
- **Format**: PNG with transparency support
- **Color Mode**: RGB
- **Resolution**: 72 DPI minimum (for web), 300 DPI recommended (for print)
- **File Size**: Optimized for web delivery

### Maskable Icons (PWA)
Icons marked as "maskable" in `manifest.json` (192x192 and 512x512) follow the PWA maskable icon specification:
- Safe zone: 80% of the icon area (minimum)
- Content should stay within this safe zone to avoid being clipped by different device shapes

## Future Updates

When creating new icon sizes or variations:

1. Always use `logo-1024x1024.png` as the source
2. Use ImageMagick or similar tool to resize: `convert logo-1024x1024.png -resize [SIZE]x[SIZE] output.png`
3. Maintain aspect ratio (square format)
4. Keep the Netflix red (#E50914) background color
5. Ensure text remains legible at smaller sizes

## Tools and Resources

### Recommended Tools
- **ImageMagick**: Command-line image manipulation (already installed)
- **App Icon Generator**: https://appicon.co/ (online tool for mobile icons)
- **PWA Asset Generator**: https://github.com/elegantapp/pwa-asset-generator
- **Favicon Generator**: https://realfavicongenerator.net/

### Testing
- **PWA Icons**: Use Chrome DevTools Lighthouse to verify PWA icon implementation
- **iOS Icons**: Test on iOS Simulator with different device sizes
- **Android Icons**: Test on Android Emulator with different densities

## Checklist for Mobile App Launch

### Pre-Launch Assets Checklist
- [ ] Generate all iOS icon sizes (use commands above)
- [ ] Generate all Android icon sizes (use commands above)
- [ ] Create iOS splash screens (not currently included)
- [ ] Create Android splash screens (not currently included)
- [ ] Create feature graphics for app stores (1024x500 for Android)
- [ ] Create app store screenshots
- [ ] Create promotional materials using logo-1024x1024.png

### Testing Checklist
- [ ] Verify favicon displays in all major browsers
- [ ] Test PWA installation on mobile devices
- [ ] Verify iOS icons on different iPhone/iPad models
- [ ] Verify Android icons on different screen densities
- [ ] Check icon appearance in app stores

## Contact and Support

For questions about logo usage or to request additional sizes/variations, please open an issue in the GitHub repository.

---

**Last Updated**: 2024
**Version**: 1.0
