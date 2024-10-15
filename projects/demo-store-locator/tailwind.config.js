/** @type {import('tailwindcss').Config} */
// eslint-disable-next-line
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../demo-components/src/*.jsx' // required to resolve tailwind classes in demo-components package
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))'
      },
      colors: {
        tintgreen: 'rgba(96, 36, 40, 0.1)',
        maroon: '#602428',
        greenhover: '#378269',
        transwhite: 'rgba(255, 255, 255, 0.5)'
      }
    },
    fontFamily: {
      sans: ['"Open Sans"', 'sans-serif']
    }
  },
  plugins: []
}
