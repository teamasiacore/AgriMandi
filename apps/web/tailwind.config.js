/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        earth: {
          50: '#FAF7F2',
          100: '#f2e8e5',
          500: '#8c5e42',
          700: '#5c3a25',
        },
        agri: {
          dark: '#0A4A28',
          primary: '#13753E',
          light: '#E8F5E9',
          gold: '#E5A00D',
          goldLight: '#FEF9E7',
          base: '#FAF7F2',
          sandBorder: '#E5DFD4',
        }
      }
    },
  },
  plugins: [],
};
