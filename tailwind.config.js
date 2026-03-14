/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        cinema: {
          /** App shell — matches Register.vue */
          dark: '#0c0e12',
          panel: '#14181f',
          surface: '#0f1218',
          border: '#2a3140',
          muted: '#9ca3af',
          /** Accent — emerald / cyan (register theme) */
          gold: '#34d399',
          goldDim: '#10b981',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        cinema: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        glow: '0 0 40px rgba(52, 211, 153, 0.08)',
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
