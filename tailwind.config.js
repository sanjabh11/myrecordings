/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4A90E2',
          light: '#6BA5E7',
          dark: '#357ABD',
          600: '#4A90E2',
          700: '#357ABD',
          800: '#2A62A3'
        },
        secondary: {
          DEFAULT: '#50E3C2',
          light: '#7CEBD1',
          dark: '#3CC5A5',
          600: '#50E3C2',
          700: '#3CC5A5',
          800: '#2EA98D'
        },
        background: {
          light: '#F8FAFC',
          dark: '#1E293B',
        }
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(10deg)' },
        }
      },
      animation: {
        float: 'float 3s infinite ease-in-out',
      },
      spacing: {
        'navbar': '4rem',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}