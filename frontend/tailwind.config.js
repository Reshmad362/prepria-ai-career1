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
        primary: 'var(--primary)', // #FF6B00
        primaryHover: '#E65C00',
        secondary: 'var(--secondary)', // #111111
        accent: 'var(--accent)', // #FF9A3C
        success: 'var(--success)', // #2ECC71
        danger: 'var(--danger)', // #E74C3C
        text: 'var(--text)',
        border: 'var(--border)',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        manrope: ['Manrope', 'sans-serif'],
        sans: ['Inter', 'sans-serif'], // Setting default to Inter
      },
    },
  },
  plugins: [],
}
