// alt (Übungswiese: KlassenLernstand, SchuelerLernstand, EinzelKarte), im Thema „ruhig“.
// Lernstand der Klasse (Heatmap + Einzelansicht) und Einzelseite zum Drucken. Nur für die Lehrkraft –
// Schüler:innen sehen ausschließlich ihre Entwicklung in Worten (schueler_entwicklung).
import { useEffect, useMemo, useRef, useState } from 'react'
import { fehlerText } from '../lib/fehler'
import { datum, GROSSE_BEREICHE, grosserBereich, stufeAusPunkte, zusammenfassen, type Auswertung, type Einstellungen } from '../lib/lernstand'
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

  const [ansicht, setAnsicht] = useState<'bereiche' | 'kompetenzen'>('bereiche')
  const [abgewaehlt, setAbgewaehlt] = useState<Set<string>>(new Set())
  const [offen, setOffen] = useState<Set<string>>(new Set())

  const wert = useMemo(() => {
    const m = new Map<string, Auswertung>()
    for (const w of daten?.werte ?? []) if (w.daten) m.set(`${w.schueler_id}:${w.kompetenz_id}`, w.daten)
    return m
  }, [daten])

  // Spalten der Einzelkompetenzen und Durchschnitte je Person (Bereiche und Kernkompetenzen)
  const { spalten, schnitt } = useMemo(() => {
    if (!daten) return { spalten: [] as Kompetenz[], schnitt: new Map<string, ReturnType<typeof zusammenfassen>>() }
    const mitDaten = new Set(daten.werte.map((w) => w.kompetenz_id))
    const spalten = daten.kompetenzen.filter((k) => k.kerncurriculum === daten.klasse.kerncurriculum && mitDaten.has(k.id))
    const schnitt = new Map(
      daten.schueler.map((s) => [
        s.id,
        zusammenfassen(spalten.map((k) => ({ bereich: k.bereich, punkte: wert.get(`${s.id}:${k.id}`)?.punkte ?? null }))),
      ]),
    )
    return { spalten, schnitt }
  }, [daten, wert])

  if (fehler) return <p className="lk-hinweis" role="alert">{fehler}</p>
  if (!daten) return <p className="lk-leise" role="status">Lädt …</p>
  const { klasse, schueler, kompetenzen, werte, einstellungen } = daten

  const person = schueler.find((s) => s.id === ausgewaehlt)
  // Kernkompetenzen: die drei des KC, dazu „Weitere“ nur, falls es nicht zugeordnete Bereiche gibt
  const bereicheMitDaten = [...new Set(spalten.map((k) => k.bereich))]
  const grosse = [...GROSSE_BEREICHE, ...(bereicheMitDaten.some((b) => grosserBereich(b) === 'Weitere') ? ['Weitere'] : [])]
  const hatDaten = (g: string) => bereicheMitDaten.some((b) => grosserBereich(b) === g)
  const umschalten = (menge: Set<string>, setzen: (m: Set<string>) => void, x: string) => {
    const neu = new Set(menge)
    if (!neu.delete(x)) neu.add(x)
    setzen(neu)
  }
  const feld = (punkte: number | undefined, titel: string) =>
    punkte === undefined ? undefined : { stufe: stufeAusPunkte(punkte, einstellungen), trend_gueltig: false, trend_punkte: null, titel }

  // Alle Spalten der Tabelle: in der Übersicht Kernkompetenzen (aufklappbar in ihre Bereiche), sonst Einzelkompetenzen
  type Spalte = { key: string; titel: string; erklaerung?: string; unter?: boolean; aufklappen?: string; feld: (sid: string) => ReturnType<typeof feld> | Auswertung | undefined }
  const tabelle: Spalte[] =
    ansicht === 'kompetenzen'
      ? spalten.map((k) => ({ key: k.id, titel: name(k), erklaerung: k.kompetenz, feld: (sid) => wert.get(`${sid}:${k.id}`) }))
      : grosse
          .filter((g) => hatDaten(g) && !abgewaehlt.has(g))
          .flatMap((g) => [
            {
              key: g,
              titel: g,
              erklaerung: `Durchschnitt der Bereiche: ${bereicheMitDaten.filter((b) => grosserBereich(b) === g).join(', ')}`,
              aufklappen: g,
              feld: (sid: string) => feld(schnitt.get(sid)?.gross.get(g), `${g}: Durchschnitt ${Math.round(schnitt.get(sid)?.gross.get(g) ?? 0)} Punkte`),
            },
            ...(offen.has(g) ? bereicheMitDaten.filter((b) => grosserBereich(b) === g) : []).map((b) => ({
              key: `${g}/${b}`,
              titel: b,
              unter: true,
              erklaerung: `Durchschnitt der Kompetenzen im Bereich ${b}`,
              feld: (sid: string) => feld(schnitt.get(sid)?.bereiche.get(b), `${b}: Durchschnitt ${Math.round(schnitt.get(sid)?.bereiche.get(b) ?? 0)} Punkte`),
            })),
          ])
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
        <span className="lk-nur-drucken"> Stand vom {datum(new Date().toISOString())}.</span>
      </p>

      <div className="lk-zeile lk-nicht-drucken">
        <div className="lk-reiter" role="group" aria-label="Ansicht">
          <button type="button" className="lk-knopf" aria-pressed={ansicht === 'bereiche'} onClick={() => setAnsicht('bereiche')}>
            Kernkompetenzen
          </button>
          <button type="button" className="lk-knopf" aria-pressed={ansicht === 'kompetenzen'} onClick={() => setAnsicht('kompetenzen')}>
            Einzelne Kompetenzen
          </button>
        </div>
        <button type="button" className="lk-knopf" onClick={() => window.print()}>
          Klasse drucken oder als PDF
        </button>
      </div>
      {ansicht === 'bereiche' && spalten.length > 0 && (
        <fieldset className="lk-nicht-drucken">
          <legend>Diese Kernkompetenzen zeigen</legend>
          {grosse.map((g) => (
            <label key={g} className="lk-haken">
              <input type="checkbox" checked={hatDaten(g) && !abgewaehlt.has(g)} disabled={!hatDaten(g)} onChange={() => umschalten(abgewaehlt, setAbgewaehlt, g)} />
              {g}
              {!hatDaten(g) && <span className="lk-leise">(noch keine Ergebnisse)</span>}
            </label>
          ))}
          <p className="lk-leise">
            Eine Kernkompetenz ist der Durchschnitt ihrer Bereiche, ein Bereich der Durchschnitt seiner Kompetenzen. Mit „aufklappen ▸“ im
            Tabellenkopf sehen Sie daneben die einzelnen Bereiche.
          </p>
        </fieldset>
      )}

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
                    {tabelle.map((sp) => (
                      <th key={sp.key} scope="col" title={sp.erklaerung} className={sp.unter ? 'lk-heatmap__unter' : undefined}>
                        <span>{sp.titel}</span>
                        {sp.aufklappen && (
                          <button
                            type="button"
                            className="lk-knopf lk-knopf--betont lk-heatmap__auf lk-nicht-drucken"
                            aria-expanded={offen.has(sp.aufklappen)}
                            aria-label={`Bereiche von „${sp.titel}“ ${offen.has(sp.aufklappen) ? 'zuklappen' : 'aufklappen'}`}
                            title="Zeigt daneben die einzelnen Bereiche"
                            onClick={() => umschalten(offen, setOffen, sp.key)}
                          >
                            {offen.has(sp.aufklappen) ? '◂ zuklappen' : 'aufklappen ▸'}
                          </button>
                        )}
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
                      {tabelle.map((sp) => {
                        const f = sp.feld(s.id)
                        return (
                          <td key={sp.key} className={sp.unter ? 'lk-heatmap__unter' : undefined}>
                            <button type="button" className="lk-heatmap__knopf" aria-label={`${s.pseudonym}: ${sp.titel}`} onClick={() => waehlen(s.id)}>
                              <StufenFeld a={f} titel={f && 'titel' in f ? f.titel : undefined} />
                            </button>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Legende />
        </section>

        <div ref={einzelRef} className="lk-nicht-drucken">
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
