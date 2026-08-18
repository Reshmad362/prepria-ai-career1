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
        primaryHover: 'var(--primary-dark)', // #E05D00
        primaryLight: 'var(--primary-light)', // #FFF1E8
        secondary: 'var(--secondary)', // #111111
        accent: 'var(--accent)', // #FF8533
        success: 'var(--success)', // #2ECC71
        danger: 'var(--danger)', // #E74C3C / #EF4444
        text: 'var(--text)',
        textMuted: 'var(--text-muted)', // #666666
        border: 'var(--border)',
        prepria: {
          orange: '#FF6B00',
          darkOrange: '#E05D00',
          lightOrange: '#FFF1E8',
          black: '#111111',
          dark: '#18181B',
          border: '#E8E8E8',
          gray: '#666666',
          subtle: '#FAFAFA',
          success: '#2ECC71',
        }
      },
      fontFamily: {
        manrope: ['Manrope', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        sans: ['Manrope', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
