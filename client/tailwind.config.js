/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'sans-serif'] },
      colors: {
        bg: '#FAFAF7',
        primary: '#C0392B',
        secondary: '#D4A017',
        card: '#F5F5F0',
        success: '#4A7C59',
        ink: '#1A1A2E',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
