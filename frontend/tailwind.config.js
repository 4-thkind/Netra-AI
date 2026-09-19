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
          dark: '#E8DCCE'
        }
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      spacing: {
        // Bottom tab bar height + the phone's home-indicator inset, so scroll
        // containers can reserve room for the fixed mobile nav.
        'tabbar': 'calc(4.25rem + env(safe-area-inset-bottom, 0px))',
      },
      boxShadow: {
        card: '0 1px 2px rgba(45,45,45,.04), 0 4px 16px -4px rgba(114,47,55,.08)',
        lift: '0 2px 4px rgba(45,45,45,.05), 0 12px 28px -8px rgba(114,47,55,.16)',
        tabbar: '0 -1px 0 rgba(201,169,110,.35), 0 -8px 24px -12px rgba(45,45,45,.18)',
      },
      keyframes: {
        riseIn: {
          '0%': { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        sheetUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
      animation: {
        riseIn: 'riseIn .28s cubic-bezier(.22,.8,.36,1) both',
        sheetUp: 'sheetUp .3s cubic-bezier(.22,.8,.36,1)',
      }
    },
  },
  plugins: [],
}
