// import defaultTheme from 'tailwindcss/defaultTheme';
const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
    fontFamily: {
      'oswald': ['Oswald', ...defaultTheme.fontFamily.sans],
      'bangers': ['Bangers', ...defaultTheme.fontFamily.sans],
    }
  },
  plugins: [],
};
