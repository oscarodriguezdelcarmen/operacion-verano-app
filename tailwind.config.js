/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark OLED base
        bg: '#0a0a0c',
        bg2: '#141418',
        bg3: '#1c1c24',
        surface: '#23232e',
        surface2: '#2d2d3a',
        border: '#3a3a4a',
        // Neon accents
        neonGreen: '#00ff88',
        neonGreenDim: '#00cc6a',
        amber: '#ffb020',
        amberDim: '#e09018',
        alertRed: '#ff453a',
        alertRedDim: '#ff2211',
        text: '#e8e8ee',
        textDim: '#9a9aaf',
        textMuted: '#6a6a7a',
        gold: '#ffd700',
        silver: '#c0c0c0',
        bronze: '#cd7f32',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shake': 'shake 0.5s ease-in-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'marquee': 'marquee 20s linear infinite',
        'countUp': 'countUp 1s forwards',
      },
      keyframes: {
        pulseSoft: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.7 },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-6px)' },
          '40%': { transform: 'translateX(6px)' },
          '60%': { transform: 'translateX(-4px)' },
          '80%': { transform: 'translateX(4px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 8px rgba(0,255,136,0.4)' },
          '100%': { boxShadow: '0 0 20px rgba(0,255,136,0.8)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        countUp: {
          '0%': { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      backdropBlur: {
        'sm': '4px',
        'md': '8px',
        'lg': '16px',
      },
    },
  },
  plugins: [],
}
