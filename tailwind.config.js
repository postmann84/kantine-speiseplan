/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  safelist: [
    'bg-blue-600',
    'text-white',
    'shadow-lg',
    'rounded-lg',
    'divide-y',
    'divide-gray-200',
    'hover:bg-gray-50',
    'transition-colors'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
