/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: '#D4AF37',
        'gold-dark': '#B8860B',
        marble: '#F8F5F0',
        stone: '#E8E3DC',
        parchment: '#FDF6E3',
        deep: '#1A1A1A',
      },
      fontFamily: {
        serif: ['"Cinzel"', 'serif'],
        body: ['"Lora"', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce': 'bounce 1s infinite', // For thinking dots
        'spin-slow': 'spin 3s linear infinite', // Optional: slower spinner if needed
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { 
            transform: 'translateY(20px)', 
            opacity: '0' 
          },
          '100%': { 
            transform: 'translateY(0)', 
            opacity: '1' 
          },
        },
        bounce: {
          '0%, 100%': { 
            transform: 'translateY(0)' 
          },
          '50%': { 
            transform: 'translateY(-8px)' 
          },
        },
      },
      // Optional: add staggered delays for bouncing dots
      animationDelay: {
        '0': '0ms',
        '150': '150ms',
        '300': '300ms',
        '600': '600ms',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
}