import { useEffect, useState } from 'react'

// Hell oder dunkel („Abendgarten“). Ohne eigene Wahl folgt die App der Geräte-Einstellung;
// wer umschaltet, behält die Wahl auf diesem Gerät (localStorage). tokens.css liest <html data-thema="dunkel">.
const SCHLUESSEL = 'thema'
const geraet = () => window.matchMedia('(prefers-color-scheme: dark)')

function gewaehlt(): 'hell' | 'dunkel' | null {
  try {
    const wert = localStorage.getItem(SCHLUESSEL)
    return wert === 'hell' || wert === 'dunkel' ? wert : null
  } catch {
    return null
  }
}

const istDunkel = () => (gewaehlt() ?? (geraet().matches ? 'dunkel' : 'hell')) === 'dunkel'

function anwenden(dunkel: boolean) {
  document.documentElement.dataset.thema = dunkel ? 'dunkel' : 'hell'
}

/** Beim Start einmal aufrufen; folgt danach der Geräte-Einstellung, solange niemand selbst umgeschaltet hat. */
export function themaStarten() {
  anwenden(istDunkel())
  geraet().addEventListener('change', () => anwenden(istDunkel()))
}

export function useDunkel(): [boolean, (dunkel: boolean) => void] {
  const [dunkel, setDunkel] = useState(istDunkel)
  useEffect(() => {
    const folgen = () => setDunkel(istDunkel())
    geraet().addEventListener('change', folgen)
    return () => geraet().removeEventListener('change', folgen)
  }, [])
  const setzen = (neu: boolean) => {
    anwenden(neu)
    setDunkel(neu)
    try {
      localStorage.setItem(SCHLUESSEL, neu ? 'dunkel' : 'hell')
    } catch {
      // Speicher gesperrt (z. B. privates Surfen): gilt dann nur bis zum Neuladen.
    }
  }
  return [dunkel, setzen]
}
