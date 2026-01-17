/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        telegram: {
          blue: '#3390ec',
          'blue-dark': '#2b7fd4',
          'blue-light': '#54a9eb',
          bg: '#0e1621',
          'bg-light': '#17212b',
          'bg-lighter': '#232e3c',
          text: '#ffffff',
          'text-secondary': '#aaaaaa',
          green: '#4dcd5e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      addUtilities({
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
        },
        '.scrollbar-thumb-\\[\\#232e3c\\]': {
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#232e3c',
            borderRadius: '3px',
          },
        },
        '.scrollbar-track-transparent': {
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
        },
      });
    },
  ],
};
