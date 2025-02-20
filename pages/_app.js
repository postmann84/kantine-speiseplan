import '../styles/globals.css'
import { useEffect } from 'react'

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Force a refresh of styles
    if (typeof window !== 'undefined') {
      const style = document.createElement('style')
      style.textContent = ''
      document.head.appendChild(style)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Component {...pageProps} />
    </div>
  )
}

export default MyApp
