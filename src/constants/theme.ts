// Design system constants

export const COLORS = {
  // Primary palette (sky blue)
  primary: {
    50: '#f0fbfe',
    100: '#e1f7fc',
    200: '#b8ecf7',
    300: '#8ee1f2',
    400: '#5ed2ec', // Main primary
    500: '#3ac3e3',
    600: '#54bce1', // Darker for better contrast
    700: '#396b7a', // Paynes gray
    800: '#2d5461',
    900: '#1f3a43',
  },
  
  // Secondary palette (aero)
  secondary: {
    50: '#f0f8fb',
    100: '#e1f1f7',
    200: '#b8e0ed',
    300: '#8ecfe3',
    400: '#54bce1', // Main secondary
    500: '#3aafda',
    600: '#2c9bc3',
    700: '#247a9b',
    800: '#1c5d76',
    900: '#144050',
  },
  
  // Accent palette (maize with adjusted contrast)
  accent: {
    50: '#fffdf0',
    100: '#fff9d6',
    200: '#fef4ad',
    300: '#feec67', // Main accent
    400: '#fde03d',
    500: '#fcd113',
    600: '#dbb007',
    700: '#b38d05',
    800: '#8c6b04',
    900: '#654c03',
  },
  
  // Supporting colors
  supporting: {
    cambridge: {
      50: '#f4f9f8',
      100: '#e9f3f1',
      200: '#cde3df',
      300: '#73b7a9', // Main cambridge
      400: '#5da696',
      500: '#478f7f',
      600: '#367164',
      700: '#2a574d',
      800: '#1f4139',
      900: '#152b26',
    },
    paynes: {
      50: '#f2f5f7',
      100: '#e6ebef',
      200: '#c2d1d8',
      300: '#9eb7c2',
      400: '#396b7a', // Main paynes
      500: '#2d5461',
      600: '#234048',
      700: '#1a2f35',
      800: '#121f22',
      900: '#0b1214',
    },
  },
  
  // Neutral tones
  neutral: {
    50: '#ffffff', // Pure white
    100: '#f2f2fc', // Ghost white
    200: '#d1f2f2', // Mint green
    300: '#e5e5e5',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#191716', // Eerie black
  },
  
  // Feedback colors (adjusted for WCAG 2.1 AA compliance)
  success: {
    light: '#86efac',
    default: '#15803d', // Darkened for better contrast
    dark: '#14532d',
  },
  
  warning: {
    light: '#fed7aa',
    default: '#c2410c', // Darkened for better contrast
    dark: '#7c2d12',
  },
  
  error: {
    light: '#fecaca',
    default: '#b91c1c', // Darkened for better contrast
    dark: '#7f1d1d',
  },
};

// Typography constants
export const FONTS = {
  body: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  heading: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
};

// Spacing system (8px base)
export const SPACING = {
  xs: '0.25rem', // 4px
  sm: '0.5rem',  // 8px
  md: '1rem',    // 16px
  lg: '1.5rem',  // 24px
  xl: '2rem',    // 32px
  xxl: '3rem',   // 48px
};

// Breakpoints
export const BREAKPOINTS = {
  sm: '640px',   // Mobile
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
};

// Border radius
export const BORDER_RADIUS = {
  sm: '0.25rem', // 4px
  md: '0.5rem',  // 8px
  lg: '1rem',    // 16px
  full: '9999px', // Fully rounded
};

// Shadows
export const SHADOWS = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
};

// Transitions
export const TRANSITIONS = {
  fast: '150ms ease-in-out',
  medium: '300ms ease-in-out',
  slow: '500ms ease-in-out',
};

// Z-index layers
export const Z_INDEX = {
  base: 0,
  above: 10,
  modal: 100,
  toast: 200,
  loading: 300,
};