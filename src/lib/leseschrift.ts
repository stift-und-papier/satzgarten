import { useState } from 'react'

// Leseschrift für Schüler:innen mit LRS: schaltet alle Texte auf OpenDyslexic um (siehe tokens.css).
// Gespeichert auf diesem Gerät (localStorage: 'lrs' an, 'aus' aus). Übungsumbau Schritt 8: Hat die Lehrkraft den Haken
// gesetzt (schueler.leseschrift), gilt OpenDyslexic, solange am Gerät nichts anderes gewählt wurde.
const SCHLUESSEL = 'leseschrift'
let vorgabe = false

function gespeichert(): boolean {
  try {
    const wert = localStorage.getItem(SCHLUESSEL)
    return wert === null ? vorgabe : wert === 'lrs'
  } catch {
    return vorgabe
  }
}

/** Haken der Lehrkraft (aus schueler_start) */
export function leseschriftVorgabe(an: boolean) {
  vorgabe = an
  anwenden(gespeichert())
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
      localStorage.setItem(SCHLUESSEL, neu ? 'lrs' : 'aus')
    } catch {
      // Speicher gesperrt (z. B. privates Surfen): gilt dann nur bis zum Neuladen.
    }
  }
  return [an, setzen]
}
