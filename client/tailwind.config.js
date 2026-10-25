/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          darkest: '#05070f',
          dark: '#0a0e1a',
          card: '#111827',
          border: '#1f293d',
          accent: '#38bdf8',
          purple: '#818cf8',
          neon: '#06b6d4',
          glow: '#22d3ee',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -5px rgba(6, 182, 212, 0.4)',
        'glow-blue': '0 0 25px -5px rgba(56, 189, 248, 0.4)',
        'glow-purple': '0 0 25px -5px rgba(129, 140, 248, 0.4)',
      }
    },
  },
  plugins: [],
}
