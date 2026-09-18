/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wine: {
          DEFAULT: '#722F37',
          dark: '#582128',
          light: '#8B4049',
          subtle: '#FAF0F2'
        },
        cream: {
          DEFAULT: '#FFF8F0',
          dark: '#F5EDE3',
        },
        gold: {
          DEFAULT: '#C9A96E',
          light: '#DFC696',
          dark: '#A68449'
        },
        charcoal: {
          DEFAULT: '#2D2D2D',
          muted: '#666666',
          light: '#9E9E9E'
        },
        sand: {
          DEFAULT: '#F5EDE3',
          light: '#FAF5EF',
          dark: '#E8DC CE'
        }
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
