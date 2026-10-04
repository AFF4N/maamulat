/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        paper: {
          50: '#FDFBF7',
          100: '#F7F4EC',
          200: '#EFECE2',
          300: '#E4DFD2',
          400: '#C8C1B0',
        },
        ink: {
          950: '#0E1110',
          900: '#151917',
          850: '#1B201E',
          800: '#222825',
          750: '#2A312E',
          700: '#363E3A',
          650: '#444E49',
          600: '#56635D',
          500: '#75837C',
          400: '#9AA8A1',
          300: '#C2CCC7',
          200: '#DFE5E2',
          100: '#EFF3F1',
        },
        sage: {
          50: '#F1F6F3',
          100: '#E3EDE7',
          200: '#C7DBCF',
          300: '#A4C3B1',
          500: '#3A7456',
          600: '#295B42',
          700: '#1F4733',
          800: '#163425',
          900: '#0E2218',
          950: '#091610',
        },
        amberGold: {
          50: '#FDF9EF',
          100: '#FBF2DE',
          200: '#F6E4BC',
          500: '#C9933B',
          600: '#B07E2C',
          700: '#8C621E',
          900: '#422B0A',
          950: '#231604',
        },
        terracotta: {
          50: '#FDF3F2',
          100: '#FAE5E3',
          500: '#B85848',
          600: '#9E4436',
          900: '#4A1C16',
          950: '#2A0D09',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Outfit', 'system-ui', 'sans-serif'],
        serif: ['Fraunces', 'Playfair Display', 'serif'],
        arabic: ['Amiri', 'Noto Naskh Arabic', 'serif'],
      },
      boxShadow: {
        'soft-sm': '0 1px 2px 0 rgba(28, 33, 30, 0.04)',
        'soft-md': '0 4px 12px -2px rgba(28, 33, 30, 0.05)',
        'soft-lg': '0 12px 24px -4px rgba(28, 33, 30, 0.06)',
      }
    },
  },
  plugins: [],
}
