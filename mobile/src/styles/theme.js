// Netflix & Chill Brand Colors and Theme
export const colors = {
  // Primary Colors
  primary: '#E50914',        // Cinematic Red
  primaryDark: '#B20710',    // Darker red for pressed states
  
  // Background Colors
  background: '#000000',     // Pure black
  backgroundLight: '#141414', // Dark gray
  backgroundCard: '#1e1e24',  // Card background
  
  // Text Colors
  textPrimary: '#FFFFFF',    // White
  textSecondary: '#999999',  // Gray
  textLight: '#CCCCCC',      // Light gray
  
  // Accent Colors
  accent: '#ffa500',         // Orange for super likes
  success: '#00C851',        // Green
  warning: '#ffbb33',        // Yellow
  error: '#ff4444',          // Red
  
  // UI Elements
  border: '#333333',
  overlay: 'rgba(0, 0, 0, 0.7)',
  gradient1: '#E50914',
  gradient2: '#831010',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 40,
  },
  h2: {
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 36,
  },
  h3: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
  },
  small: {
    fontSize: 12,
    lineHeight: 16,
  },
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 8,
  },
};

// Common component styles
export const commonStyles = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: colors.backgroundCard,
    color: colors.textPrimary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  card: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.md,
  },
};

export default {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  commonStyles,
};
