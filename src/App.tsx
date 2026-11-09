import { lazy, Suspense, type ReactNode } from 'react'
import { usePfad } from './lib/router'
import { useNeueVersion } from './lib/version'

// Vorschauseiten mit Beispieldaten – nur beim Entwickeln auf dem eigenen Rechner, nie in der veröffentlichten App.
const Vorschau = import.meta.env.DEV ? lazy(() => import('./entwicklung/Vorschau')) : null

// Platzhalter, bis Design (Phase 2) und die echten Seiten da sind.
function Platzhalter({ titel, children }: { titel: string; children: ReactNode }) {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '36rem', margin: '4rem auto', padding: '0 1rem', fontSize: '1.0625rem' }}>
      <h1>{titel}</h1>
      {children}
    </main>
  )
}

function Seite() {
  const [bereich] = usePfad()

  if (bereich === 'vorschau' && Vorschau)
    return (
      <Suspense fallback={null}>
        <Vorschau />
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
      <Platzhalter titel="Satzgarten – Lehrkraft">
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
        <div role="status" style={{ fontFamily: 'system-ui, sans-serif', padding: '0.75rem 1rem', textAlign: 'center' }}>
          Es gibt eine neue Version.{' '}
          <button type="button" onClick={() => window.location.reload()} style={{ minHeight: 48, fontSize: '1rem' }}>
            Neu laden
          </button>
        </div>
      )}
      <Seite />
    </>
  )
}
