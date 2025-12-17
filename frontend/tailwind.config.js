/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'waste-green': '#00a32a',
        'waste-dark-green': '#065f46'
      },
    },
  },
  plugins: [],
}

