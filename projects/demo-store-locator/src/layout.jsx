import PropTypes from 'prop-types'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Mapbox Real Estate App Demo',
  description:
    'A demo store locator app showcasing various Mapbox products and techniques.'
}

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body className={inter.className}>{children}</body>
    </html>
  )
}

RootLayout.propTypes = {
  children: PropTypes.any
}
