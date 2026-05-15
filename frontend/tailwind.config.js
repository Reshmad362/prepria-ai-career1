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
        background: 'var(--background)',
        card: 'var(--card)',
        primary: 'var(--primary)',
        accent: 'var(--accent)',
        text: 'var(--text)',
        border: 'var(--border)',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        sans: ['Inter', 'sans-serif'], // setting default to Inter
      },
    },
  },
  plugins: [],
}
