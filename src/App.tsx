import { lazy, Suspense, type ReactNode } from 'react'
import { usePfad } from './lib/router'
import { useNeueVersion } from './lib/version'

// Vorschauseiten mit Beispieldaten – nur beim Entwickeln auf dem eigenen Rechner, nie in der veröffentlichten App.
const Vorschau = import.meta.env.DEV ? lazy(() => import('./entwicklung/Vorschau')) : null
// Stilblatt zum Prüfen des Designs am iPad (ohne Daten). Wird nach der Design-Freigabe entfernt.
const Stilblatt = lazy(() => import('./stil/Stilblatt'))
// Schrift-Entwürfe (Aufgabe 5), nach der Wahl wieder entfernen.
const SchriftEntwurf = lazy(() => import('./stil/SchriftEntwurf'))
// Lehrkraft-Bereich eigenständig nachladen: Schüler:innen laden ihn nie.
const LehrkraftBereich = lazy(() => import('./lehrkraft/LehrkraftRahmen').then((m) => ({ default: m.LehrkraftBereich })))

// Platzhalter, bis die echten Seiten da sind.
function Platzhalter({ titel, children }: { titel: string; children: ReactNode }) {
  return (
    <div className="garten-seite">
      <main className="garten-seite__inhalt">
        <div className="karte">
          <h1>{titel}</h1>
          {children}
        </div>
      </main>
    </div>
  )
}

function Seite() {
  const pfad = usePfad()
  const [bereich] = pfad

  if (bereich === 'vorschau' && Vorschau)
    return (
      <Suspense fallback={null}>
        <Vorschau />
      </Suspense>
    )
  if (bereich === 'stil')
    return (
      <Suspense fallback={null}>
        {pfad[1] === 'schrift' ? <SchriftEntwurf /> : <Stilblatt />}
      </Suspense>
    )
  if (bereich === 's')
    return (
      <Platzhalter titel="Wortsalat">
        <p>Hier entsteht deine Farm. Bald kannst du hier üben.</p>
      </Platzhalter>
    )
  if (bereich === 'lehrkraft')
    return (
      <Suspense fallback={null}>
        <LehrkraftBereich pfad={pfad.slice(1)} />
      </Suspense>
    )
  return (
    <Platzhalter titel="Wortsalat">
      <p>Hier entsteht Wortsalat. Bald kannst du hier üben.</p>
    </Platzhalter>
  )
}

export default function App() {
  const neueVersion = useNeueVersion()
  return (
    <>
      {neueVersion && (
        <div role="status" className="karte" style={{ margin: 'var(--space-md)' }}>
          <p>Es gibt eine neue Version.</p>
          <div className="knopf-reihe">
            <button type="button" className="knopf knopf--haupt" onClick={() => window.location.reload()}>
              Neu laden
            </button>
          </div>
        </div>
      )}
      <Seite />
    </>
  )
}
