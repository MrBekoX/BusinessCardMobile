/**
 * Uygulama tema sistemi.
 * Light ve Dark mode desteği.
 */

// ==================== TYPE DEFINITIONS ====================

interface ThemeColors {
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  placeholder: string;
  error: string;
  success: string;
  warning: string;
  info: string;
  overlay: string;
}

interface ShadowStyle {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

// ==================== COLORS ====================

export const COLORS = {
  // Ana renkler
  primary: '#007AFF',
  secondary: '#5856D6',
  accent: '#FF9500',
  
  // Light Mode
  light: {
    background: '#FFFFFF',
    surface: '#F2F2F7',
    card: '#FFFFFF',
    text: '#000000',
    textSecondary: '#8E8E93',
    border: '#C6C6C8',
    placeholder: '#C7C7CC',
    error: '#FF3B30',
    success: '#34C759',
    warning: '#FF9500',
    info: '#007AFF',
    overlay: 'rgba(0, 0, 0, 0.5)',
  } as ThemeColors,
  
  // Dark Mode
  dark: {
    background: '#000000',
    surface: '#1C1C1E',
    card: '#2C2C2E',
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    border: '#38383A',
    placeholder: '#48484A',
    error: '#FF453A',
    success: '#32D74B',
    warning: '#FF9F0A',
    info: '#0A84FF',
    overlay: 'rgba(0, 0, 0, 0.7)',
  } as ThemeColors,
} as const;

// ==================== SPACING ====================

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// ==================== TYPOGRAPHY ====================

export const TYPOGRAPHY = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
} as const;

// ==================== BORDER RADIUS ====================

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 999,
} as const;

// ==================== SHADOWS ====================

export const SHADOWS: Record<'sm' | 'md' | 'lg' | 'xl', ShadowStyle> = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
  },
};

// ==================== TOUCHABLE SIZE ====================

// Minimum dokunma alanı (Apple HIG & Material Design)
export const TOUCHABLE_SIZE = {
  min: 44, // iOS: 44pt, Android: 48dp (44 ortak kullanım için yeterli)
} as const;

// ==================== SCREEN ====================

// Ekran boyutları
export const SCREEN = {
  width: {
    phone: 375,
    tablet: 768,
    desktop: 1024,
  },
  height: {
    phone: 667,
    tablet: 1024,
    desktop: 768,
  },
} as const;

// ==================== ANIMATION ====================

// Animasyon süreleri
export const ANIMATION = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    easeOut: 'ease-out',
    easeIn: 'ease-in',
    easeInOut: 'ease-in-out',
  },
} as const;

// ==================== Z-INDEX ====================

// Z-index değerleri
export const Z_INDEX = {
  modal: 1000,
  dropdown: 900,
  tooltip: 800,
  overlay: 700,
  header: 600,
  content: 100,
  background: 0,
} as const;

// ==================== GRID ====================

// Grid sistemi
export const GRID = {
  container: {
    paddingHorizontal: SPACING.md,
    maxWidth: 1200,
  },
  row: {
    marginHorizontal: -SPACING.sm,
  },
  col: {
    paddingHorizontal: SPACING.sm,
  },
} as const;

// ==================== COMPONENT STYLES ====================

// Component-specific styles
export const COMPONENT_STYLES = {
  button: {
    minHeight: TOUCHABLE_SIZE.min,
    minWidth: TOUCHABLE_SIZE.min,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  input: {
    minHeight: TOUCHABLE_SIZE.min,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
  },
  card: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.md,
  },
  avatar: {
    small: 32,
    medium: 48,
    large: 64,
    xlarge: 96,
  },
} as const;

// ==================== BREAKPOINTS ====================

// Responsive breakpoints
export const BREAKPOINTS = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400,
} as const;

// ==================== COLOR UTILITIES ====================

export const colorUtils = {
  hexToRgb: (hex: string): RGB | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  },

  rgbToHex: (r: number, g: number, b: number): string => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  },

  lighten: (color: string, percent: number): string => {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  },

  darken: (color: string, percent: number): string => {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return "#" + (0x1000000 + (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 +
      (G > 255 ? 255 : G < 0 ? 0 : G) * 0x100 +
      (B > 255 ? 255 : B < 0 ? 0 : B)).toString(16).slice(1);
  },

  getContrastColor: (backgroundColor: string): string => {
    const rgb = colorUtils.hexToRgb(backgroundColor);
    if (!rgb) return COLORS.light.text;
    
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return brightness > 128 ? COLORS.light.text : COLORS.dark.text;
  },
};

// ==================== DEFAULT EXPORT ====================

const Theme = {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  BORDER_RADIUS,
  SHADOWS,
  TOUCHABLE_SIZE,
  SCREEN,
  ANIMATION,
  Z_INDEX,
  GRID,
  COMPONENT_STYLES,
  BREAKPOINTS,
  colorUtils,
};

export default Theme;
