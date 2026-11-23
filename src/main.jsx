import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import AppWithErrorBoundary from './App'
import './index.css'

// ---------- Service Worker registration (iOS-safe) ----------
if ('serviceWorker' in navigator) {
  const SW_PATH = (import.meta.env.BASE_URL || '/') + 'sw.js'
  const SW_TIMEOUT = 5000
  const swReady = navigator.serviceWorker.ready
  const swRegistration = navigator.serviceWorker.register(SW_PATH, {
    scope: import.meta.env.BASE_URL || '/',
  })
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('ServiceWorker registration timeout')), SW_TIMEOUT),
  )
  Promise.race([swRegistration, timeout])
    .then((reg) => reg)
    .catch((err) => {
      console.warn('[PWA] Service Worker not registered:', err.message)
    })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppWithErrorBoundary />
  </StrictMode>,
)
