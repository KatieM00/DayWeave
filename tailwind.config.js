/** @type {import('tailwindcss').Config} */
import { COLORS, SHADOWS, GRADIENTS } from './src/constants/theme.ts';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: COLORS.primary,
        secondary: COLORS.secondary,
        accent: COLORS.accent,
        neutral: COLORS.neutral,
        success: COLORS.success,
        warning: COLORS.warning,
        error: COLORS.error,
        supporting: COLORS.supporting,
        dark: COLORS.dark,
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
      },
      boxShadow: SHADOWS,
      backgroundImage: GRADIENTS,
    },
  },
  plugins: [],
};