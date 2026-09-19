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
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
        heading: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
      },
      borderRadius: {
        none: '0px',
        sm: '4px',
        DEFAULT: '6px',
        md: '8px',
        lg: '10px',
        xl: '12px',
        '2xl': '16px',
        '3xl': '20px',
        full: '9999px',
      },
      spacing: {
        // Bottom tab bar height + the phone's home-indicator inset, so scroll
        // containers can reserve room for the fixed mobile nav.
        'tabbar': 'calc(4.25rem + env(safe-area-inset-bottom, 0px))',
      },
      boxShadow: {
        subtle: '0 1px 2px rgba(45, 45, 45, 0.05), 0 1px 3px rgba(45, 45, 45, 0.04)',
        card: '0 1px 2px rgba(45, 45, 45, 0.05), 0 1px 3px rgba(45, 45, 45, 0.04)',
        lift: '0 4px 6px -1px rgba(45, 45, 45, 0.05), 0 2px 4px -2px rgba(45, 45, 45, 0.05)',
        elevated: '0 4px 6px -1px rgba(45, 45, 45, 0.05), 0 2px 4px -2px rgba(45, 45, 45, 0.05)',
        tabbar: '0 -1px 0 rgba(201, 169, 110, 0.35), 0 -4px 12px -2px rgba(45, 45, 45, 0.06)',
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
