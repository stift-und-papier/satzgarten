// alt (Übungswiese: KlassenLernstand, SchuelerLernstand, EinzelKarte), im Thema „ruhig“.
// Lernstand der Klasse (Heatmap + Einzelansicht) und Einzelseite zum Drucken. Nur für die Lehrkraft –
// Schüler:innen sehen ausschließlich ihre Entwicklung in Worten (schueler_entwicklung).
import { useEffect, useMemo, useRef, useState } from 'react'
import { fehlerText } from '../lib/fehler'
import { datum, type Auswertung, type Einstellungen } from '../lib/lernstand'
import { supabase } from '../lib/supabase'
import type { Klasse, Kompetenz, Schueler } from '../lib/typen'
import { Legende, StufenFeld, StufenStreifen, Verlauf } from './LernstandAnzeige'

type Zeile = { schueler_id: string; kompetenz_id: string; daten: Auswertung | null }

const name = (k: Kompetenz) => k.kurzname || k.bereich

export function KlassenLernstand({ klasseId }: { klasseId: string }) {
  const [daten, setDaten] = useState<{
    klasse: Klasse
    schueler: Schueler[]
    kompetenzen: Kompetenz[]
    werte: Zeile[]
    einstellungen: Einstellungen
  } | null>(null)
  const [fehler, setFehler] = useState<string | null>(null)
  const [ausgewaehlt, setAusgewaehlt] = useState<string | null>(null)
  const einzelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    void Promise.all([
      supabase.from('klassen').select('id, name, kerncurriculum').eq('id', klasseId).single(),
      supabase.from('schueler').select('id, klasse_id, pseudonym, token, stufe_manuell').eq('klasse_id', klasseId),
      supabase.from('kompetenzen').select('*').order('sortierung'),
      supabase.rpc('lernstand_klasse', { p_klasse: klasseId }),
      supabase.from('einstellungen').select('*').single(),
    ]).then(([k, s, ko, l, e]) => {
      const f = [k, s, ko, l, e].find((r) => r.error)
      if (f?.error) return setFehler(fehlerText(f.error))
      const werte = l.data as Zeile[]
      const schueler = (s.data as Schueler[]).sort((a, b) => a.pseudonym.localeCompare(b.pseudonym, 'de', { numeric: true }))
      setDaten({ klasse: k.data as Klasse, schueler, kompetenzen: ko.data as Kompetenz[], werte, einstellungen: e.data as Einstellungen })
      // Zu Beginn die erste Person mit Ergebnissen zeigen
      setAusgewaehlt(schueler.find((x) => werte.some((w) => w.schueler_id === x.id))?.id ?? null)
    })
  }, [klasseId])

  const wert = useMemo(() => {
    const m = new Map<string, Auswertung>()
    for (const w of daten?.werte ?? []) if (w.daten) m.set(`${w.schueler_id}:${w.kompetenz_id}`, w.daten)
    return m
  }, [daten])

  if (fehler) return <p className="lk-hinweis" role="alert">{fehler}</p>
  if (!daten) return <p className="lk-leise" role="status">Lädt …</p>
  const { klasse, schueler, kompetenzen, werte, einstellungen } = daten

  const mitDaten = new Set(werte.map((w) => w.kompetenz_id))
  const spalten = kompetenzen.filter((k) => k.kerncurriculum === klasse.kerncurriculum && mitDaten.has(k.id))
  const person = schueler.find((s) => s.id === ausgewaehlt)
  const personDaten = new Map(werte.filter((w) => w.schueler_id === ausgewaehlt && w.daten).map((w) => [w.kompetenz_id, w.daten as Auswertung]))

  function waehlen(id: string) {
    setAusgewaehlt(id)
    // Im Hochformat steht die Einzelansicht unter der Tabelle: dorthin scrollen
    if (window.matchMedia?.('(max-width: 1100px)').matches) {
      window.setTimeout(() => einzelRef.current?.scrollIntoView({ block: 'start' }), 50)
    }
  }

  return (
    <>
      <a className="lk-zurueck" href={`#/lehrkraft/klassen/${klasse.id}`}>← Klasse {klasse.name}</a>
      <h1>Lernstand Klasse {klasse.name}</h1>
      <p className="lk-leise">
        Nur für Sie sichtbar. Schüler:innen sehen nie diese Stufen, nur ihre Entwicklung in Worten. Kerncurriculum: {klasse.kerncurriculum}.
      </p>

      <div className="lk-lernstand">
        <section aria-label="Klassenübersicht">
          {spalten.length === 0 ? (
            <p>
              Noch keine Ergebnisse zu Kompetenzen. Ordnen Sie den Aufgaben Kompetenzen zu ({klasse.kerncurriculum}), dann erscheinen hier die
              Ergebnisse.
            </p>
          ) : (
            <div className="lk-rollen">
              <table className="lk-heatmap">
                <thead>
                  <tr>
                    <th>Schüler:in</th>
                    {spalten.map((k) => (
                      <th key={k.id} scope="col" title={k.kompetenz}>
                        <span>{name(k)}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {schueler.map((s) => (
                    <tr key={s.id} aria-selected={s.id === ausgewaehlt}>
                      <th scope="row">
                        <button type="button" className="lk-heatmap__knopf" aria-pressed={s.id === ausgewaehlt} onClick={() => waehlen(s.id)}>
                          {s.pseudonym}
                        </button>
                      </th>
                      {spalten.map((k) => (
                        <td key={k.id}>
                          <button type="button" className="lk-heatmap__knopf" aria-label={`${s.pseudonym}: ${name(k)}`} onClick={() => waehlen(s.id)}>
                            <StufenFeld a={wert.get(`${s.id}:${k.id}`)} />
                          </button>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Legende />
        </section>

        <div ref={einzelRef}>
          {person ? (
            <EinzelKarte schueler={person} klasse={klasse} kompetenzen={kompetenzen} daten={personDaten} einstellungen={einstellungen} />
          ) : (
            <p className="lk-leise">Tippen Sie auf ein Pseudonym, dann erscheint hier die Einzelansicht.</p>
          )}
        </div>
      </div>
    </>
  )
}

type KarteProps = {
  schueler: Schueler
  klasse: Klasse
  kompetenzen: Kompetenz[]
  /** Auswertung je Kompetenz-ID */
  daten: Map<string, Auswertung>
  einstellungen: Einstellungen
  /** Einzelseite und Ausdruck: Verlauf gleich aufgeklappt, kein Link auf die Einzelseite */
  einzelseite?: boolean
}

// Einzelansicht: Stufenbalken je Kompetenz mit Start, Trend und Verlauf, nach Bereichen.
function EinzelKarte({ schueler, klasse, kompetenzen, daten, einstellungen, einzelseite = false }: KarteProps) {
  const liste = kompetenzen.filter((k) => daten.has(k.id))
  const bereiche = [...new Set(liste.map((k) => k.bereich))]
  return (
    <section className="lk-einzel" aria-label={`Einzelansicht ${schueler.pseudonym}`}>
      <div className="lk-kompetenz__kopf">
        <div>
          <h2>{schueler.pseudonym}</h2>
          <p className="lk-leise">
            Klasse {klasse.name}, Kerncurriculum {klasse.kerncurriculum}, Stand vom {datum(new Date().toISOString())}
          </p>
        </div>
        {!einzelseite && (
          <a className="lk-knopf lk-nicht-drucken" href={`#/lehrkraft/schueler/${schueler.id}`}>
            Entwicklung drucken
          </a>
        )}
      </div>
      {liste.length === 0 ? (
        <p>Noch keine Ergebnisse zu Kompetenzen.</p>
      ) : (
        bereiche.map((bereich) => (
          <div key={bereich} className="lk-einzel__bereich">
            <h3>{bereich}</h3>
            {liste
              .filter((k) => k.bereich === bereich)
              .map((k) => {
                const a = daten.get(k.id) as Auswertung
                return (
                  <div key={k.id} className="lk-einzel__kompetenz">
                    <StufenStreifen a={a} e={einstellungen} name={name(k)} />
                    <details className="lk-aufklapp" open={einzelseite}>
                      <summary>Verlauf und Wortlaut</summary>
                      <p className="lk-leise">{k.kompetenz}</p>
                      <Verlauf a={a} e={einstellungen} />
                    </details>
                  </div>
                )
              })}
          </div>
        ))
      )}
    </section>
  )
}

// Einzelseite je Schüler:in – auch zum Drucken für Beratungsgespräche („Als PDF sichern“ im Druckdialog).
export function SchuelerLernstand({ schuelerId }: { schuelerId: string }) {
  const [daten, setDaten] = useState<{
    schueler: Schueler
    klasse: Klasse
    kompetenzen: Kompetenz[]
    werte: Map<string, Auswertung>
    einstellungen: Einstellungen
  } | null>(null)
  const [fehler, setFehler] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      const s = await supabase.from('schueler').select('id, klasse_id, pseudonym, token, stufe_manuell').eq('id', schuelerId).single()
      if (s.error) return setFehler(fehlerText(s.error))
      const [k, ko, l, e] = await Promise.all([
        supabase.from('klassen').select('id, name, kerncurriculum').eq('id', s.data.klasse_id).single(),
        supabase.from('kompetenzen').select('*').order('sortierung'),
        supabase.rpc('lernstand_schueler', { p_schueler: schuelerId }),
        supabase.from('einstellungen').select('*').single(),
      ])
      const f = [k, ko, l, e].find((r) => r.error)
      if (f?.error) return setFehler(fehlerText(f.error))
      const werte = new Map(
        (l.data as Omit<Zeile, 'schueler_id'>[]).filter((w) => w.daten).map((w) => [w.kompetenz_id, w.daten as Auswertung]),
      )
      setDaten({ schueler: s.data as Schueler, klasse: k.data as Klasse, kompetenzen: ko.data as Kompetenz[], werte, einstellungen: e.data as Einstellungen })
    })()
  }, [schuelerId])

  if (fehler) return <p className="lk-hinweis" role="alert">{fehler}</p>
  if (!daten) return <p className="lk-leise" role="status">Lädt …</p>
  const e = daten.einstellungen

  return (
    <>
      <div className="lk-zeile lk-nicht-drucken">
        <a className="lk-zurueck" href={`#/lehrkraft/klassen/${daten.klasse.id}/lernstand`}>← Lernstand der Klasse</a>
        <button type="button" className="lk-knopf lk-knopf--haupt" onClick={() => window.print()}>
          Drucken oder als PDF
        </button>
      </div>
      <EinzelKarte {...daten} daten={daten.werte} einzelseite />
      <Legende />
      <p className="lk-leise">
        Berechnung: gewichteter Durchschnitt der letzten {e.anzahl_letzte} gewerteten Versuche (neuere zählen mehr; Aufgaben mit 1/2/3
        Sternen höchstens {e.punkte_leicht}/{e.punkte_mittel}/{e.punkte_schwer} Punkte). Eine Stufe gibt es ab {e.min_versuche} Versuchen. Der
        Strich im Balken zeigt den Startstand.
      </p>
    </>
  )
}
