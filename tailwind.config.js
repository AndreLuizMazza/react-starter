/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {
    colors: { brand: { 50:'#f1f5f9', 500:'#f1f5f9', 700:'#f1f5f9', 900:'#f1f5f9' } },
    boxShadow: { card: '0 10px 25px rgba(0,0,0,0.08)' },
    borderRadius: { card: '1.25rem' }
  } },
  plugins: [],
}
