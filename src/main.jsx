import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { bootApp } from './utils/otaUpdater'

// Boot the app: dynamically run OTA bundle if updated, or render built-in App
bootApp(() => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
