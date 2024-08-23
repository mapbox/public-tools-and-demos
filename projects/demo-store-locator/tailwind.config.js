/** @type {import('tailwindcss').Config} */
// eslint-disable-next-line
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))'
      }
    },
    fontFamily: {
      sans: ['"Open Sans"', 'sans-serif']
    },
    colors: {
      'deepgreen': '#006241',
      'tintgreen': 'rgba(0, 98, 65, 0.1)'
    },
  },
  plugins: []
}
