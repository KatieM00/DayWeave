// Design system constants

export const COLORS = {
  // Primary palette (deeper sky-blue)
  primary: {
    50: '#f0f7fa',
    100: '#e1eff5',
    200: '#c3dfe8',
    300: '#94c5d6',
    400: '#6aadc5',
    500: '#4A9CB8',
    600: '#3b7d93',
    700: '#2c5e6e',
    800: '#1d3e49',
    900: '#0e1f24',
  },
  
  // Secondary palette (deeper aero blue)
  secondary: {
    50: '#f0f4f7',
    100: '#e1e9ef',
    200: '#c3d3df',
    300: '#94b3c7',
    400: '#6a93af',
    500: '#3F7A9A',
    600: '#32627b',
    700: '#26495c',
    800: '#19313e',
    900: '#0d181f',
  },
  
  // Accent palette (muted golden yellow)
  accent: {
    50: '#fcfbf2',
    100: '#f9f7e5',
    200: '#f3efcb',
    300: '#ede7b1',
    400: '#e7df97',
    500: '#E6D055',
    600: '#b8a644',
    700: '#8a7d33',
    800: '#5c5322',
    900: '#2e2a11',
  },
  
  // Supporting colors
  supporting: {
    teal: '#5A8B7A',
    navy: '#2E5A6B',
  },
  
  // Neutral tones
  neutral: {
    white: '#ffffff',
    offWhite: '#E8E8F0',
    mint: '#B8D4D4',
    50: '#f8f8fa',
    100: '#f1f1f5',
    200: '#e3e3eb',
    300: '#d5d5e1',
    400: '#b8b8cd',
    500: '#9b9bb9',
    600: '#7e7ea5',
    700: '#616191',
    800: '#43437d',
    900: '#262669',
  },
  
  // Dark charcoal
  dark: '#191716',
  
  // Feedback colors
  success: {
    light: '#86efac',
    default: '#22c55e',
    dark: '#15803d',
  },
  
  warning: {
    light: '#fed7aa',
    default: '#f97316',
    dark: '#c2410c',
  },
  
  error: {
    light: '#fecaca',
    default: '#ef4444',
    dark: '#b91c1c',
  }
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

// Shadows with depth effects
export const SHADOWS = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  colored: {
    primary: '0 4px 14px 0 rgba(74, 156, 184, 0.25)',
    secondary: '0 4px 14px 0 rgba(63, 122, 154, 0.25)',
    accent: '0 4px 14px 0 rgba(230, 208, 85, 0.25)',
  }
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
};

// Gradients
export const GRADIENTS = {
  primary: 'linear-gradient(135deg, #4A9CB8 0%, #3F7A9A 100%)',
  secondary: 'linear-gradient(135deg, #3F7A9A 0%, #2E5A6B 100%)',
  accent: 'linear-gradient(135deg, #E6D055 0%, #b8a644 100%)',
  light: 'linear-gradient(135deg, #ffffff 0%, #E8E8F0 100%)',
};