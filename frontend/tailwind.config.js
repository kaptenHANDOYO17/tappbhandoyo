/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#EDF7F1',
          100: '#D6EDE0',
          200: '#A8D5BA',
          300: '#74C69D',
          400: '#40916C',
          500: '#2D6A4F',
          600: '#1B4332',
          700: '#14352A',
          800: '#0E261E',
        },
        sand: '#F7F5F0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 12px -4px rgba(27, 67, 50, 0.18)',
        nav: '0 -2px 16px -6px rgba(27, 67, 50, 0.25)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.28s ease-out both',
      },
    },
  },
  plugins: [],
};
