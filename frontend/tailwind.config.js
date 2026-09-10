/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        earth: {
          50: '#FCFAF6',
          100: '#FAF7F2',
          200: '#F3EDE2',
          300: '#E5DFD4',
          400: '#D2C7B6',
          500: '#8C827A'
        },
        forest: {
          800: '#2D6A4F',
          900: '#1B4332',
          950: '#0F261C'
        },
        terracotta: {
          400: '#DE7C4A',
          500: '#C86432',
          600: '#A74D20'
        },
        gold: {
          400: '#F4B236',
          500: '#D99B26'
        }
      },
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      }
    },
  },
  plugins: [],
}
