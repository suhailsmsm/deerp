import React from 'react'
import ReactDOM from 'react-dom/client'
import POSPage from './page'
import './index.css' // Make sure you have basic tailwind/css here
import { installBrowserElectronFallback } from './browserElectronFallback'

if (typeof window !== 'undefined') {
  installBrowserElectronFallback();
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <POSPage />
  </React.StrictMode>,
)