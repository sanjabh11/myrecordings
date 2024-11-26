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
        },
        secondary: {
          DEFAULT: '#50E3C2',
          light: '#7CEBD1',
          dark: '#3CC5A5',
        },
        background: {
          light: '#F8FAFC',
          dark: '#1E293B',
        }
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