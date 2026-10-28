/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Tonal surfaces: black-blue base, three raised blue steps
        ink: {
          DEFAULT: '#050A16',
          900: '#0A1428',
          800: '#0F1C38',
          700: '#152648',
        },
        // Hairlines that carry the structure (blue)
        line: {
          DEFAULT: '#172A4D',
          strong: '#21396A',
          bright: '#33528F',
        },
        // Text: primary / secondary (AA on black-blue) / tertiary (decorative & large only)
        fg: {
          DEFAULT: '#EEF4FF',
          muted: '#9FB3D6',
          faint: '#5C7299',
        },
        // Blue scale for backgrounds, highlights and data
        azure: {
          950: '#030712',
          900: '#0B1B3F',
          800: '#102A63',
          700: '#1D4ED8',
          500: '#3B82F6',
          400: '#60A5FA',
          300: '#93C5FD',
        },
        // Accent: warm signal orange, with a lighter amber for gradients
        signal: {
          DEFAULT: '#FF8A4C',
          hover: '#FFA066',
          light: '#FFC062',
          dim: 'rgba(255, 138, 76, 0.12)',
          line: 'rgba(255, 138, 76, 0.5)',
        },
        live: '#5FB57E', // muted green: "live/online" dot only
        danger: '#E5484D', // muted red: errors / hazard only
        // Legacy keys still referenced by untouched markup, remapped to the new palette
        space: {
          darkest: '#050A16',
          dark: '#0A1428',
          card: '#0F1C38',
          border: '#172A4D',
          accent: '#FF8A4C',
          purple: '#9FB3D6',
          neon: '#FF8A4C',
          glow: '#FF8A4C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        label: ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.16em' }],
        'display-sm': ['clamp(2rem, 3.6vw, 3rem)', { lineHeight: '1', letterSpacing: '-0.02em' }],
        'display-md': ['clamp(2.5rem, 5vw, 4.5rem)', { lineHeight: '0.95', letterSpacing: '-0.025em' }],
        'display-lg': ['clamp(3.25rem, 8vw, 7rem)', { lineHeight: '0.9', letterSpacing: '-0.03em' }],
        'display-xl': ['clamp(4rem, 12vw, 10rem)', { lineHeight: '0.85', letterSpacing: '-0.035em' }],
      },
      letterSpacing: {
        label: '0.16em',
        wide2: '0.24em',
      },
      borderRadius: {
        DEFAULT: '4px',
        sm: '4px',
        md: '6px',
        btn: '0.75rem',
      },
      spacing: {
        gutter: '1rem',
        rail: '15rem',
        section: '8rem',
      },
      maxWidth: {
        shell: '96rem',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      backgroundImage: {
        // 12-col structural grid used as a faint backdrop
        'grid-lines':
          'linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'draw-x': {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
        'draw-y': {
          '0%': { transform: 'scaleY(0)' },
          '100%': { transform: 'scaleY(1)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'zoom-in': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
        'pulse-dot': {
          '0%': { transform: 'scale(1)', opacity: '0.7' },
          '100%': { transform: 'scale(2.6)', opacity: '0' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        sweep: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(300%)' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        marquee: 'marquee 60s linear infinite',
        'draw-x': 'draw-x 1.1s cubic-bezier(0.16, 1, 0.3, 1) both',
        'draw-y': 'draw-y 1.1s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fade-in 0.4s ease-out both',
        'slide-up': 'slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        'zoom-in': 'zoom-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
        blink: 'blink 1.1s steps(1) infinite',
        'pulse-dot': 'pulse-dot 1.8s cubic-bezier(0, 0, 0.2, 1) infinite',
        scan: 'scan 6s linear infinite',
        sweep: 'sweep 1.6s cubic-bezier(0.65, 0, 0.35, 1) infinite',
        orbit: 'orbit 40s linear infinite',
        'orbit-slow': 'orbit 90s linear infinite',
      },
    },
  },
  plugins: [],
}
