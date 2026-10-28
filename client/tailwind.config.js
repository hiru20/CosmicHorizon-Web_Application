/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Flat tonal surfaces: black base, three raised steps
        ink: {
          DEFAULT: '#000000',
          900: '#0A0A0A',
          800: '#111111',
          700: '#181818',
        },
        // Hairlines that carry the structure
        line: {
          DEFAULT: '#1F1F1F',
          strong: '#2A2A2A',
          bright: '#3D3D3D',
        },
        // Text: primary / secondary (AA on black) / tertiary (decorative & large only)
        fg: {
          DEFAULT: '#EDEDED',
          muted: '#8A8A8A',
          faint: '#555555',
        },
        // The single accent: signal orange
        signal: {
          DEFAULT: '#FF5A1F',
          hover: '#FF7646',
          dim: 'rgba(255, 90, 31, 0.10)',
          line: 'rgba(255, 90, 31, 0.45)',
        },
        live: '#5FB57E', // muted green: "live/online" dot only
        danger: '#E5484D', // muted red: errors / hazard only
        // Legacy keys still referenced by untouched markup, remapped to the new palette
        space: {
          darkest: '#000000',
          dark: '#0A0A0A',
          card: '#111111',
          border: '#1F1F1F',
          accent: '#FF5A1F',
          purple: '#8A8A8A',
          neon: '#FF5A1F',
          glow: '#FF5A1F',
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
        DEFAULT: '2px',
        sm: '2px',
        md: '3px',
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
