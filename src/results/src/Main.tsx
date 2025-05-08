import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import '@fontsource/ibm-plex-mono/600.css'
import '@fontsource/ibm-plex-mono/700.css'
import ChessDashboard from './components/ChessDashboard'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChessDashboard />
  </StrictMode>,
)