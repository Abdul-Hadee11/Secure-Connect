/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FFFBF7',
          100: '#FFF5EC',
          200: '#FBE8D6',
        },
        blush: {
          100: '#FFE4E9',
          200: '#FFC8D1',
          300: '#FFA8B6',
          400: '#F58A9C',
          500: '#E76A85',
          600: '#C9526F',
        },
        rose: {
          gold: '#D4A5A5',
          deep: '#A8506C',
        },
        mauve: {
          100: '#F3E6EF',
          300: '#C9A9C0',
          500: '#8E6586',
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'serif'],
        script: ['"Dancing Script"', 'cursive'],
        hand: ['"Caveat"', 'cursive'],
        body: ['"Quicksand"', 'sans-serif']
      },
      boxShadow: {
        soft: '0 8px 32px rgba(255, 168, 182, 0.25)',
        petal: '0 4px 20px rgba(231, 106, 133, 0.18)',
      },
      backgroundImage: {
        'petal-pattern': "radial-gradient(circle at 20% 20%, #FFE4E9 0%, transparent 40%), radial-gradient(circle at 80% 70%, #FFF5EC 0%, transparent 50%)",
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'fall': 'fall 12s linear infinite',
        'pulse-heart': 'pulse-heart 1.5s ease-in-out infinite',
        'fade-in': 'fade-in 0.8s ease-out',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        fall: {
          '0%': { transform: 'translateY(-10vh) rotate(0deg)', opacity: 0.9 },
          '100%': { transform: 'translateY(110vh) rotate(360deg)', opacity: 0 },
        },
        'pulse-heart': {
          '0%,100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.15)' },
        },
        'fade-in': {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        }
      }
    }
  },
  plugins: []
};
