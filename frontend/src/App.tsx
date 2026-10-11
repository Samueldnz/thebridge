import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'

import { router } from './app/router'
import { CookieConsentBanner } from './components/ui/CookieConsentBanner'

function App() {
  useEffect(() => {
    const isDark = localStorage.getItem('thebridge_dark_mode') === 'true'
    document.documentElement.classList.toggle('tb-dark-mode', isDark)
  }, [])

  return (
    <>
      <RouterProvider router={router} />
      <CookieConsentBanner />
    </>
  )
}

export default App