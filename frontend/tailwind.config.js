/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode by default for premium dark aesthetics
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
      colors: {
        // Harmonious Dark Banking Palette
        navy: {
          900: '#0A0E1A',
          800: '#111827',
          700: '#1F2937',
          600: '#374151',
        },
        emerald: {
          500: '#10B981',
          400: '#34D399',
        },
        purple: {
          500: '#8B5CF6',
          600: '#7C3AED',
        },
        cyan: {
          400: '#22D3EE',
        }
      },
      boxShadow: {
        'glow': '0 0 15px rgba(34, 211, 238, 0.2)',
        'glow-green': '0 0 15px rgba(16, 185, 129, 0.25)',
      }
    },
  },
  plugins: [],
}
