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
          50:  '#faf7f0',
          100: '#f3ece0',
          200: '#e8dfd0',
          300: '#dfd5c0',
        },
        warm: {
          border: '#d4c9b8',
          muted:  '#7a6e60',
          text:   '#3d3228',
        },
        velaro: {
          DEFAULT: '#8C6B1F',
          hover:   '#735619',
          light:   '#D8BD71',
          bg:      '#FBF6EA',
          dark:    '#5C4410',
          gold:    '#D8BD71',
          amber:   '#BEA256',
          accent:  '#F2AD75',
        },
      },
    },
  },
  plugins: [],
};

export default config;
