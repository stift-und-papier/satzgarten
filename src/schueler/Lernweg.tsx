// alt (Übungswiese, Entwicklung.tsx), im Pixel-Look: „Mein Lernweg“ – nur die eigene Entwicklung in Worten.
// Keine Stufen, Punkte, Prozente oder Noten: Die Datenbank liefert hier gar keine absoluten Werte (schueler_entwicklung).
import { useEffect, useState } from 'react'
import { fehlerText } from '../lib/fehler'
import { GROSSE_BEREICHE, grosserBereich } from '../lib/lernstand'
import { supabase } from '../lib/supabase'

type Kategorie = 'deutlich' | 'besser' | 'dranbleiben' | 'erste'
type Daten = {
  kompetenzen: { name: string; bereich: string; kategorie: Kategorie; geloest: number }[]
  texte: Record<string, string>
  naechster_schritt: string | null
}

const REIHENFOLGE: Kategorie[] = ['deutlich', 'besser', 'dranbleiben', 'erste']

export function Lernweg({ token, uebungen }: { token: string; uebungen: string }) {
  const [daten, setDaten] = useState<Daten | null>(null)
  const [fehler, setFehler] = useState<string | null>(null)

  useEffect(() => {
    void supabase
      .rpc('schueler_entwicklung', { p_token: token })
      .then(({ data, error }) => (error ? setFehler(fehlerText(error)) : setDaten(data as Daten)))
  }, [token])

  if (fehler) return <p className="karte">{fehler}</p>
  if (!daten) return <p className="karte" role="status">Einen Moment …</p>

  const gelungen = (anzahl: number) =>
    (daten.texte.gelungen ?? '').replace('{anzahl}', String(anzahl)).replace('{aufgaben}', anzahl === 1 ? 'Aufgabe' : 'Aufgaben')
  // Themen mit Entwicklung nach Bereich; Themen mit ersten Ergebnissen eingeklappt am Ende.
  const mitWeg = daten.kompetenzen.filter((k) => k.kategorie !== 'erste')
  const ersteSchritte = daten.kompetenzen.filter((k) => k.kategorie === 'erste')
  // Sortiert nach großen Bereichen (wie in der Lehrkraft-Übersicht), darin nach Bereichen; innerhalb das Beste zuerst
  const grosse = [...new Set(mitWeg.map((k) => grosserBereich(k.bereich)))]
    .sort((a, b) => (GROSSE_BEREICHE as readonly string[]).indexOf(a) - (GROSSE_BEREICHE as readonly string[]).indexOf(b))
    .map((gross) => ({
      gross,
      bereiche: [...new Set(mitWeg.filter((k) => grosserBereich(k.bereich) === gross).map((k) => k.bereich))].map((bereich) => ({
        bereich,
        themen: mitWeg.filter((k) => k.bereich === bereich).sort((a, b) => REIHENFOLGE.indexOf(a.kategorie) - REIHENFOLGE.indexOf(b.kategorie)),
      })),
    }))

  return (
    <>
      <header className="karte">
        <h1>Mein Lernweg</h1>
        <p>Schau, was du schon geschafft hast.</p>
      </header>

      <section className="karte">
        <h2>Dein nächster Schritt</h2>
        <p>
          {daten.naechster_schritt ? (
            <>
              {daten.texte.naechster_schritt} <strong>{daten.naechster_schritt}</strong>
            </>
          ) : (
            'Mach weiter mit deinen Übungen.'
          )}
        </p>
        <div className="knopf-reihe">
          <a className="knopf knopf--haupt" href={uebungen}>
            Weiter üben
          </a>
        </div>
      </section>

      {daten.kompetenzen.length === 0 && <p className="karte">Sobald du ein paar Aufgaben bearbeitet hast, siehst du hier deinen Weg.</p>}

      {grosse.map(({ gross, bereiche }) => (
        <section key={gross} className="karte">
          <h2>{gross === 'Weitere' ? 'Weitere Themen' : gross}</h2>
          {bereiche.map(({ bereich, themen }) => (
            <div key={bereich} className="lernweg-bereich">
              <h3>{bereich}</h3>
              <ul className="lernweg-liste">
                {themen.map((k) => (
                  <li key={k.name} className="lernweg-thema" data-art={k.kategorie}>
                    <div>
                      <p className="lernweg-thema__name">{k.name}</p>
                      {k.geloest > 0 && <p className="leise">{gelungen(k.geloest)}</p>}
                    </div>
                    <p className="lernweg-marke" data-art={k.kategorie}>
                      {daten.texte[k.kategorie]}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      ))}

      {ersteSchritte.length > 0 && (
        <details className="karte hilfe-eintrag">
          <summary>
            {ersteSchritte.length === 1 ? 'Ein Thema' : `${ersteSchritte.length} Themen`}, bei denen wir noch deine ersten Ergebnisse sammeln
          </summary>
          <ul className="lernweg-liste">
            {ersteSchritte.map((k) => (
              <li key={k.name} className="lernweg-thema">
                <div>
                  <h3>{k.name}</h3>
                  <p className="leise">{k.bereich}</p>
                </div>
              </li>
            ))}
          </ul>
        </details>
      )}
    </>
  )
}
