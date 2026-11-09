import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './design/tokens.css'
import './design/bausteine.css'
import './design/lehrkraft.css'
import App from './App.tsx'
import { leseschriftStarten } from './lib/leseschrift'
import { themaStarten } from './lib/thema'

leseschriftStarten()
themaStarten()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
