/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: false,
  theme: {
    extend: {
      colors: {
        primary: '#2C3E50',
        secondary: '#16A085',
        accent: '#E67E22',
        background: '#F5F7FA',
        textColor: '#333333'
      }
    },
  },
  plugins: [],
} 