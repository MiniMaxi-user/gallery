import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50:  '#faf7f2',
          100: '#f0ebe1',
          200: '#e5ddd0',
          300: '#ede4d3',
        },
        warm: {
          border: '#d4cdc4',
          muted:  '#7a6e66',
          text:   '#3d3530',
        },
        sage: {
          DEFAULT: '#5c8a6e',
          hover:   '#4d7a5e',
          light:   '#9dbdac',
          bg:      '#eff6f2',
          dark:    '#065f46',
        },
      },
    },
  },
  plugins: [],
};

export default config;
