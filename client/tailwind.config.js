/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      colors: {
        // Harmonious modern dark palette
        slate: {
          950: '#080c14',
          900: '#0d1321',
          800: '#182236',
          700: '#25324d',
          600: '#384b70',
          500: '#526994',
        },
        primary: {
          DEFAULT: '#3b82f6',
          glow: '#60a5fa',
        },
        success: {
          DEFAULT: '#10b981',
          glow: '#34d399',
        },
        warning: {
          DEFAULT: '#f59e0b',
          glow: '#fbbf24',
        },
        danger: {
          DEFAULT: '#ef4444',
          glow: '#f87171',
        }
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
      }
    },
  },
  plugins: [],
}
