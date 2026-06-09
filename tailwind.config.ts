import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        velaro: {
          DEFAULT: '#D8BD71',
          hover:   '#BEA256',
          light:   '#F2E5B0',
          bg:      '#0B0B0D',
          surf1:   '#111214',
          surf2:   '#16181C',
          gold:    '#D8BD71',
          gold2:   '#BEA256',
          amber:   '#F2AD75',
          muted:   '#A3A3A3',
          dark:    '#0B0B0D',
        },
      },
      fontFamily: {
        serif: ['var(--font-cormorant)', 'Georgia', 'serif'],
        sans:  ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
