/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,vue}",
  ],
  theme: {
    extend: {
      colors: {
        cinema: {
          dark: '#f5f4f0',
          panel: '#ffffff',
          border: '#e5e2dc',
          gold: '#b8860b',
          goldDim: '#9a7b3c',
          muted: '#6b6560',
          surface: '#faf9f7',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      transitionDuration: {
        250: '250ms',
        350: '350ms',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
        out: 'cubic-bezier(0, 0, 0.2, 1)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.4s ease-out forwards',
      },
    },
  },
  plugins: [],
}
