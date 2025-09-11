/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // <<< IMPORTANTE
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#e5e7eb',
          400: '#e5e7eb',
          500: '#e5e7eb', // base neutra
          600: '#e5e7eb',
          700: '#e5e7eb', // botões (fallback)
          800: '#e5e7eb',
          900: '#e5e7eb', // hover
        },
      },
      boxShadow: { card: '0 10px 25px rgba(0,0,0,0.08)' },
      borderRadius: { card: '1.25rem' },
    },
  },
  plugins: [],
}
