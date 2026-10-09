/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        banking: {
          bg: '#F4F6F8',
          surface: '#FFFFFF',
          secondary: '#E9EDF2',
          blue: '#2563EB',
          blueHover: '#1D4ED8',
          teal: '#0F766E',
          text: '#172033',
          muted: '#64748B',
          border: '#DCE3EB',
          borderLight: '#EDF2F7',
          success: '#16A34A',
          successBg: '#F0FDF4',
          successBorder: '#BBF7D0',
          warning: '#D97706',
          warningBg: '#FFFBEB',
          warningBorder: '#FDE68A',
          danger: '#DC2626',
          dangerBg: '#FEF2F2',
          dangerBorder: '#FECACA',
        }
      },
      boxShadow: {
        'skeuo-card': '0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(15, 23, 42, 0.03), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
        'skeuo-card-hover': '0 4px 8px -1px rgba(0, 0, 0, 0.06), 0 12px 24px -4px rgba(15, 23, 42, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
        'skeuo-button': '0 1px 2px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.35)',
        'skeuo-button-pressed': 'inset 0 2px 4px rgba(0, 0, 0, 0.12)',
        'skeuo-inset': 'inset 0 1px 2px rgba(15, 23, 42, 0.07)',
        'skeuo-inset-deep': 'inset 0 2px 4px rgba(15, 23, 42, 0.1)',
      }
    },
  },
  plugins: [],
}
