/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        circuit: {
          bg: '#0a0f1d',
          card: '#111827',
          border: '#1f293d',
          accent: '#06b6d4',
          accentGlow: '#22d3ee',
          success: '#10b981',
          danger: '#ef4444',
          warning: '#f59e0b',
        },
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scanline': 'scanline 4s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: 1, filter: 'drop-shadow(0 0 12px rgba(6, 182, 212, 0.6))' },
          '50%': { opacity: 0.6, filter: 'drop-shadow(0 0 4px rgba(6, 182, 212, 0.2))' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
      },
    },
  },
  plugins: [],
}
