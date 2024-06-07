/** @type {import('tailwindcss').Config} */
/*eslint-env node*/
module.exports = {
  content: ['./index.html', './js/*'],
  theme: {
    extend: {
      colors: {
        'mb-gray-dark': '#0e2127',
        'mb-purple': {
          500: '#4264fb',
          700: '#0f38bf'
        }
      },
      fontFamily: {
        sans: ['"CeraPRO"', 'sans-serif']
      }
    }
  },
  plugins: []
}
