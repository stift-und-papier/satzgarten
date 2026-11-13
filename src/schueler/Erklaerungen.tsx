// Übungsumbau Schritt 4 (Jazz 2026-11-13): Menüpunkt „Erklärungen“. Alle Erklärseiten für alle Schüler:innen,
// geordnet nach Doppeljahrgang (aufklappbar) und darin nach Bereich. Lesen gibt wie bisher einmalig 5 Münzen.
import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Symbol } from '../gemeinsam/Symbol'
import { fehlerText } from '../lib/fehler'
import { supabase } from '../lib/supabase'
import type { SchuelerAufgabe } from '../lib/typen'

type Erklaerung = SchuelerAufgabe & { jahrgaenge: number[] | null; bereich: string }

type Props = {
  token: string
  basis: string
  id: string | undefined
  // zeigt eine Erklärseite (AufgabeSeite aus SchuelerBereich); nachAbgabe lädt die Liste neu
  zeigen: (a: SchuelerAufgabe, nachAbgabe: () => void) => ReactNode
}

export function Erklaerungen({ token, basis, id, zeigen }: Props) {
  const [liste, setListe] = useState<Erklaerung[] | null>(null)
  const [fehler, setFehler] = useState<string | null>(null)

  const laden = useCallback(async () => {
    const { data, error } = await supabase.rpc('erklaerungen_liste', { p_token: token })
    if (error) setFehler(fehlerText(error))
    else setListe(data as Erklaerung[])
  }, [token])

  useEffect(() => {
    void laden()
  }, [laden])

  if (fehler) return <p className="karte" role="alert">{fehler}</p>
  if (!liste) return <p className="karte" role="status">Einen Moment …</p>

  if (id) {
    const a = liste.find((e) => e.id === id)
    return (
      <>
        <div className="knopf-reihe">
          <a className="holzknopf" href={`#${basis}/erklaerungen`} aria-label="Zurück zu allen Erklärungen">
            <Symbol name="zurueck" />
          </a>
          <span className="ort">Erklärungen</span>
        </div>
        {a ? zeigen(a, () => void laden()) : <p className="karte">Diese Erklärung gibt es nicht mehr.</p>}
      </>
    )
  }

  // Die Liste kommt schon sortiert (Doppeljahrgang, Bereich, Titel) vom Server
  const gruppen = new Map<string, Map<string, Erklaerung[]>>()
  for (const e of liste) {
    const jg = e.jahrgaenge?.length ? `Klasse ${e.jahrgaenge[0]}/${e.jahrgaenge[e.jahrgaenge.length - 1]}` : 'Weitere Erklärungen'
    const bereiche = gruppen.get(jg) ?? new Map<string, Erklaerung[]>()
    bereiche.set(e.bereich || 'Sonstiges', [...(bereiche.get(e.bereich || 'Sonstiges') ?? []), e])
    gruppen.set(jg, bereiche)
  }

  return (
    <>
      <header className="karte">
        <h1>Erklärungen</h1>
        <p>{liste.length === 0 ? 'Hier gibt es noch keine Erklärungen.' : 'Hier kannst du nachlesen, wie etwas geht. Tippe auf eine Klasse.'}</p>
      </header>
      {[...gruppen].map(([jg, bereiche]) => (
        <details key={jg} className="karte hilfe-eintrag">
          <summary>{jg}</summary>
          {[...bereiche].map(([bereich, eintraege]) => (
            <section key={bereich} className="erklaerungen-bereich">
              <h2>{bereich}</h2>
              <ul className="paket-liste">
                {eintraege.map((e) => (
                  <li key={e.id}>
                    <a className="paket-liste__eintrag" href={`#${basis}/erklaerungen/${e.id}`}>
                      <span className="paket-liste__nr" aria-hidden="true">
                        {e.geloest ? '✓' : <Symbol name="erklaerung" />}
                      </span>
                      <span>
                        <strong>{e.titel.replace(/^Erklärung:\s*/, '')}</strong>
                        <br />
                        <span className="leise">{e.geloest ? 'Gelesen' : 'Noch nicht gelesen'}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </details>
      ))}
    </>
  )
}
