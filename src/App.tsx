import { lazy, Suspense, type ReactNode } from 'react'
import { usePfad } from './lib/router'
import { useNeueVersion } from './lib/version'

// Vorschauseiten mit Beispieldaten – nur beim Entwickeln auf dem eigenen Rechner, nie in der veröffentlichten App.
const Vorschau = import.meta.env.DEV ? lazy(() => import('./entwicklung/Vorschau')) : null
// Stilblatt zum Prüfen des Designs am iPad (ohne Daten). Wird nach der Design-Freigabe entfernt.
const Stilblatt = lazy(() => import('./stil/Stilblatt'))
const MaskottchenEntwuerfe = lazy(() => import('./stil/MaskottchenEntwuerfe'))

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
  const [bereich, teil] = usePfad()

  if (bereich === 'vorschau' && Vorschau)
    return (
      <Suspense fallback={null}>
        <Vorschau />
      </Suspense>
    )
  if (bereich === 'stil')
    return (
      <Suspense fallback={null}>
        {teil === 'maskottchen' ? <MaskottchenEntwuerfe /> : <Stilblatt />}
      </Suspense>
    )
  if (bereich === 's')
    return (
      <Platzhalter titel="Satzgarten">
        <p>Hier entsteht dein Garten. Bald kannst du hier üben.</p>
      </Platzhalter>
    )
  if (bereich === 'lehrkraft')
    return (
      <Platzhalter titel="Bereich für Lehrkräfte">
        <p>Hier entsteht der Bereich für Lehrkräfte.</p>
      </Platzhalter>
    )
  return (
    <Platzhalter titel="Satzgarten">
      <p>Hier entsteht der Satzgarten. Bald kannst du hier üben.</p>
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
