/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        rose:  { DEFAULT: '#C2185B', dark: '#880E4F', light: '#FCE4EC', mid: '#E91E63' },
        gold:  { DEFAULT: '#C9A84C', dark: '#A07830', light: '#F5EDDA' },
        ivory: { DEFAULT: '#FDF8F2', dark: '#F5EDE0' },
        ink:   { DEFAULT: '#1A0A0A', soft: '#3a2a2a', muted: '#7a6a6a' },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        arabic:  ['"Cairo"', 'sans-serif'],
        body:    ['"Lato"', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease forwards',
        'slide-up': 'slideUp 0.7s ease forwards',
        'shimmer': 'shimmer 2s infinite',
        'float': 'float 3s ease-in-out infinite',
        'kenburns': 'kenBurns 8s ease-out forwards',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(30px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        float:    { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        marquee:  { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        kenBurns: { '0%': { transform: 'scale(1.0)' }, '100%': { transform: 'scale(1.08)' } },
        progressFill: { '0%': { width: '0%' }, '100%': { width: '100%' } },
      },
    },
  },
  plugins: [],
};
