/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          light: "#FFF9F2",
          DEFAULT: "#F6E4CF",
          muted: "#D9C4AA",
          hover: "#CEBA9E",
        },
        earth: {
          dark: "#321C04",
          hover: "#1F1003",
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ["'Instrument Serif'", 'serif'],
      },
      keyframes: {
        'fade-in-down': {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-down': 'fade-in-down 0.2s ease-out',
      },
    },
  },
  plugins: [],
}
