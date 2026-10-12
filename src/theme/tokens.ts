export const palette = {
  // Brand colors
  primary50: '#EEF2FF',
  primary100: '#E0E7FF',
  primary500: '#6366F1',
  primary600: '#4F46E5',
  primary700: '#4338CA',

  // Accent / Neon
  cyan400: '#22D3EE',
  cyan500: '#06B6D4',
  emerald400: '#34D399',
  emerald500: '#10B981',
  amber400: '#FBBF24',
  rose500: '#F43F5E',

  // Neutrals (Dark mode first, rich slate & obsidian)
  neutral950: '#0B0F19', // Deep canvas
  neutral900: '#111827', // Card surface
  neutral800: '#1F2937', // Elevated surface / borders
  neutral700: '#374151',
  neutral600: '#4B5563',
  neutral400: '#9CA3AF',
  neutral300: '#D1D5DB',
  neutral100: '#F3F4F6',
  white: '#FFFFFF',
  black: '#000000',
};

export const themeTokens = {
  colors: {
    background: palette.neutral950,
    surface: palette.neutral900,
    surfaceElevated: palette.neutral800,
    border: '#27354A',
    borderLight: '#334155',
    textPrimary: palette.white,
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    primary: palette.primary500,
    primaryHover: palette.primary600,
    accent: palette.cyan400,
    success: palette.emerald500,
    warning: palette.amber400,
    error: palette.rose500,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  radius: {
    sm: 6,
    md: 10,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  typography: {
    fontFamilies: {
      sans: 'System',
    },
    sizes: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      display: 32,
    },
    weights: {
      normal: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
  },
};

export type Theme = typeof themeTokens;
