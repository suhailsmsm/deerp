/**
 * DerpX POS - Premium SaaS Theme
 * Modern, AI-native, fintech-grade design system
 */

import { DarkTheme, DefaultTheme } from '@react-navigation/native';

// ============================================
// LIGHT THEME - DERPX (Dark Blue, Violet, Pale Green)
// ============================================
export const lightColors = {
  // Core brand colors - Dark Blue
  primary: '#1E3A8A',
  primaryDark: '#1E40AF',
  primaryLight: '#3B82F6',

  // Accent - Violet
  accent: '#7C3AED',
  accentDark: '#6D28D9',
  accentLight: '#8B5CF6',

  // Purple gradient
  purple: '#8B5CF6',
  purpleDark: '#7C3AED',
  purpleLight: '#A78BFA',

  // Success - Pale Green
  success: '#86EFAC',
  successDark: '#4ADE80',
  successLight: '#BBF7D0',

  // Warning - Amber
  warning: '#F59E0B',
  warningDark: '#D97706',
  warningLight: '#FBBF24',

  // Error - Rose
  error: '#F43F5E',
  errorDark: '#E11D48',
  errorLight: '#FB7185',

  // Backgrounds
  background: '#F0F9FF',
  backgroundSecondary: '#E0F2FE',
  backgroundTertiary: '#BAE6FD',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',

  // Glassmorphism
  glass: 'rgba(255, 255, 255, 0.7)',
  glassBorder: 'rgba(255, 255, 255, 0.5)',
  backdropBlur: 12,

  // Text
  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',

  // Borders
  border: '#CBD5E1',
  borderStrong: '#94A3B8',
  borderFocus: '#7C3AED',

  // Functional
  card: '#FFFFFF',
  cardHover: '#F8FAFC',
  input: '#FFFFFF',
  inputBorder: '#CBD5E1',
  inputFocus: '#7C3AED',
  highlight: '#EFF6FF',

  // Overlays
  overlay: 'rgba(15, 23, 42, 0.5)',
  backdrop: 'rgba(248, 250, 252, 0.8)',

  // Shadows
  shadow: '#0F172A',
  shadowColor: 'rgba(15, 23, 42, 0.1)',
  shadowColorStrong: 'rgba(15, 23, 42, 0.15)',

  // Gradients
  primaryGradient: ['#1E3A8A', '#7C3AED'],
  accentGradient: ['#7C3AED', '#8B5CF6'],
  successGradient: ['#86EFAC', '#BBF7D0'],
};

// ============================================
// DARK THEME - DERPX (Dark Blue, Violet, Pale Green)
// ============================================
export const darkColors = {
  // Core brand colors - Dark Blue
  primary: '#3B82F6',
  primaryDark: '#2563EB',
  primaryLight: '#60A5FA',
  
  // Accent - Violet
  accent: '#8B5CF6',
  accentDark: '#7C3AED',
  accentLight: '#A78BFA',
  
  // Purple gradient
  purple: '#A78BFA',
  purpleDark: '#8B5CF6',
  purpleLight: '#C4B5FD',
  
  // Success - Pale Green
  success: '#86EFAC',
  successDark: '#4ADE80',
  successLight: '#BBF7D0',
  
  // Warning - Amber
  warning: '#FBBF24',
  warningDark: '#F59E0B',
  warningLight: '#FCD34D',
  
  // Error - Rose
  error: '#FB7185',
  errorDark: '#F43F5E',
  errorLight: '#FDA4AF',
  
  // Backgrounds - Dark Blue theme
  background: '#0F172A',
  backgroundSecondary: '#1E293B',
  backgroundTertiary: '#334155',
  surface: '#1E293B',
  surfaceElevated: '#334155',
  
  // Glassmorphism
  glass: 'rgba(30, 41, 59, 0.7)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
  backdropBlur: 12,
  
  // Text
  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#64748B',
  textInverse: '#0F172A',
  
  // Borders
  border: 'rgba(255, 255, 255, 0.08)',
  borderStrong: 'rgba(255, 255, 255, 0.15)',
  borderFocus: '#8B5CF6',
  
  // Functional
  card: '#1E293B',
  cardHover: '#334155',
  input: '#1E293B',
  inputBorder: 'rgba(255, 255, 255, 0.1)',
  inputFocus: '#8B5CF6',
  highlight: '#1E3A5F',
  
  // Overlays
  overlay: 'rgba(0, 0, 0, 0.7)',
  backdrop: 'rgba(15, 23, 42, 0.9)',
  
  // Shadows
  shadow: '#000000',
  shadowColor: 'rgba(0, 0, 0, 0.3)',
  shadowColorStrong: 'rgba(0, 0, 0, 0.5)',
  
  // Gradients
  primaryGradient: ['#1E3A8A', '#7C3AED'],
  accentGradient: ['#7C3AED', '#8B5CF6'],
  successGradient: ['#86EFAC', '#BBF7D0'],
};

// ============================================
// TYPOGRAPHY - Inter
// ============================================
export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.625,
  },
};

// ============================================
// SPACING - 4px grid
// ============================================
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
};

// ============================================
// BORDER RADIUS - Rounded-xl to 2xl
// ============================================
export const borderRadius = {
  none: 0,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
};

// ============================================
// SHADOWS - Soft, elevated
// ============================================
export const shadows = {
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
  xl: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
};

// ============================================
// NAVIGATION THEMES
// ============================================
export const navigationLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: lightColors.primary,
    background: lightColors.background,
    card: lightColors.card,
    text: lightColors.text,
    border: lightColors.border,
    notification: lightColors.error,
  },
};

export const navigationDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: darkColors.primary,
    background: darkColors.background,
    card: darkColors.card,
    text: darkColors.text,
    border: darkColors.border,
    notification: darkColors.error,
  },
};

export type ThemeColors = typeof lightColors;
export type ThemeMode = 'dark' | 'light';

export const theme = {
  light: {
    colors: lightColors,
    ...typography,
    spacing,
    borderRadius,
    shadows,
  },
  dark: {
    colors: darkColors,
    ...typography,
    spacing,
    borderRadius,
    shadows,
  },
};

export type Theme = typeof theme.light;
export default theme.light;

// ============================================
// BACKWARDS COMPATIBILITY EXPORTS (for existing deerp components)
// ============================================
import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: lightColors.text,
    background: lightColors.background,
    backgroundElement: lightColors.backgroundSecondary,
    backgroundSelected: lightColors.backgroundTertiary,
    textSecondary: lightColors.textSecondary,
  },
  dark: {
    text: darkColors.text,
    background: darkColors.background,
    backgroundElement: darkColors.surface,
    backgroundSelected: darkColors.backgroundSecondary,
    textSecondary: darkColors.textSecondary,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
