/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {
    colors: { brand: { 50:'#f0f9ff', 500:'#0ea5e9', 700:'#0369a1', 900:'#0c4a6e' } },
    boxShadow: { card: '0 10px 25px rgba(0,0,0,0.08)' },
    borderRadius: { card: '1.25rem' }
  } },
  plugins: [],
}
