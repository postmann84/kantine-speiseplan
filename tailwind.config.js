/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    // Fügen Sie hier häufig verwendete Klassen hinzu
    {
      pattern: /(bg|text|border)-(gray|blue|red|green)-[1-9]00/,
    },
    {
      pattern: /(m|p|mt|mb|ml|mr|px|py)-[1-9]/,
    },
    'flex',
    'items-center',
    'justify-center',
    'min-h-screen',
    'space-y-8',
    'italic',
    'font-bold',
    'text-center',
  ]
}
