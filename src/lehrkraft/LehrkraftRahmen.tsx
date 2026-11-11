import type { Session } from '@supabase/supabase-js'
import { useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { Anmeldung } from './Anmeldung'
import { KlasseDetail } from './KlasseDetail'
import { KlassenListe } from './KlassenListe'
import { Kompetenzen } from './Kompetenzen'
import { Linkliste } from './Linkliste'

// Bereich nur für angemeldete Lehrkräfte (#/lehrkraft/…). Ohne Anmeldung erscheint auf jeder dieser Adressen
// die Anmeldung; danach geht es auf derselben Adresse weiter. Die Daten schützt zusätzlich die Datenbank (RLS).

const MENUE: [string, string][] = [
  ['klassen', 'Klassen'],
  ['aufgaben', 'Aufgaben'],
  ['pakete', 'Pakete'],
  ['kompetenzen', 'Kompetenzen'],
  ['einstellungen', 'Einstellungen'],
]

// Platzhalter, bis die Seiten in den nächsten Aufgaben entstehen
const KOMMT: Record<string, string> = {
  aufgaben: 'Hier erstellen Sie bald Aufgaben (Phase 4).',
  pakete: 'Hier stellen Sie bald Aufgabenpakete zusammen (Phase 5).',
  einstellungen: 'Hier stellen Sie bald zum Beispiel ein, wie oft eine Pflanze gegossen werden muss.',
}

/** Inhalt zur Adresse #/lehrkraft/<bereich>/<id>/<unterseite> */
function Inhalt({ pfad }: { pfad: string[] }) {
  const [bereich = 'klassen', id, unterseite] = pfad
  if (bereich === 'klassen' && id && unterseite === 'links') return <Linkliste klasseId={id} />
  if (bereich === 'klassen' && id) return <KlasseDetail klasseId={id} />
  if (bereich === 'klassen') return <KlassenListe />
  if (bereich === 'kompetenzen') return <Kompetenzen />
  const titel = MENUE.find(([ziel]) => ziel === bereich)?.[1] ?? 'Seite nicht gefunden'
  return (
    <>
      <h1>{titel}</h1>
      <p>{KOMMT[bereich] ?? 'Diese Seite gibt es nicht. Bitte wählen Sie einen Bereich im Menü.'}</p>
    </>
  )
}

export function LehrkraftBereich({ pfad }: { pfad: string[] }) {
  const [sitzung, setSitzung] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => setSitzung(data.session))
    const { data } = supabase.auth.onAuthStateChange((_ereignis, neu) => setSitzung(neu))
    return () => data.subscription.unsubscribe()
  }, [])

  if (sitzung === undefined)
    return (
      <div className="lehrkraft lk-mitte">
        <p className="lk-leise" role="status">Einen Moment …</p>
      </div>
    )
  if (!sitzung) return <Anmeldung />

  return (
    <LehrkraftRahmen bereich={pfad[0] ?? 'klassen'} email={sitzung.user.email}>
      <Inhalt pfad={pfad} />
    </LehrkraftRahmen>
  )
}

/** Seitenleiste links (breite Bildschirme) bzw. Leiste unten (bis 900 px), Inhalt auf einer ruhigen Karte. */
export function LehrkraftRahmen({ bereich, email, children }: { bereich: string; email?: string; children: ReactNode }) {
  return (
    <div className="lehrkraft lk-rahmen">
      <nav className="lk-nav" aria-label="Hauptmenü">
        <p className="lk-nav__name">Wortsalat</p>
        {MENUE.map(([ziel, text]) => (
          <a key={ziel} className="lk-nav__punkt" href={`#/lehrkraft/${ziel}`} aria-current={bereich === ziel ? 'page' : undefined}>
            {text}
          </a>
        ))}
        <div className="lk-nav__fuss">
          {email && <p className="lk-leise lk-nav__email">{email}</p>}
          <button type="button" className="lk-knopf" onClick={() => void supabase.auth.signOut()}>
            Abmelden
          </button>
        </div>
      </nav>
      <main className="lk-inhalt">
        <div className="lk-karte">{children}</div>
      </main>
    </div>
  )
}
