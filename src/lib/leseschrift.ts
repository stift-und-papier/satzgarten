import { useState } from 'react'

// Leseschrift für Schüler:innen mit LRS: schaltet alle Texte auf OpenDyslexic um (siehe tokens.css).
// Gespeichert nur auf diesem Gerät (localStorage); ohne Speicher gilt die normale Schrift.
const SCHLUESSEL = 'leseschrift'

function gespeichert(): boolean {
  try {
    return localStorage.getItem(SCHLUESSEL) === 'lrs'
  } catch {
    return false
  }
}

function anwenden(an: boolean) {
  if (an) document.documentElement.dataset.leseschrift = 'lrs'
  else delete document.documentElement.dataset.leseschrift
}

/** Beim Start einmal aufrufen, damit die gewählte Schrift sofort gilt. */
export function leseschriftStarten() {
  anwenden(gespeichert())
}

export function useLeseschrift(): [boolean, (an: boolean) => void] {
  const [an, setAn] = useState(gespeichert)
  const setzen = (neu: boolean) => {
    anwenden(neu)
    setAn(neu)
    try {
      if (neu) localStorage.setItem(SCHLUESSEL, 'lrs')
      else localStorage.removeItem(SCHLUESSEL)
    } catch {
      // Speicher gesperrt (z. B. privates Surfen): gilt dann nur bis zum Neuladen.
    }
  }
  return [an, setzen]
}
