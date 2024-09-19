/** @type {import('tailwindcss').Config} */
// eslint-disable-next-line
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))'
      },
      colors: {
        tintgreen: 'rgba(0, 98, 65, 0.1)',
        deepgreen: '#006241',
        greenhover: '#378269'
      }
    },
    fontFamily: {
      sans: ['"Open Sans"', 'sans-serif']
    }
  },
  plugins: []
}
