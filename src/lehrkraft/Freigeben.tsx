// Übungsumbau Schritt 6: „Versuch früher freigeben“ (Konzept Abschnitt 4, Jazz: ohne Nachfrage, löscht nichts).
// Nach einem fertigen Durchgang wartet eine Übung bis zum nächsten Kalendertag; die Lehrkraft gibt sie früher frei.
import { useCallback, useEffect, useState } from 'react'
import { fehlerText } from '../lib/fehler'
import { supabase } from '../lib/supabase'

type Gesperrt = { schueler_id: string; aufgabe_id: string; aufgabe: { titel: string } }

const heuteBerlin = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin' }).format(new Date())

// Übungen, die gerade auf „morgen“ warten (je Schüler:in und Übung)
function useGesperrt(schuelerIds: string[]) {
  const [liste, setListe] = useState<Gesperrt[]>([])
  const [fehler, setFehler] = useState<string | null>(null)
  const schluessel = schuelerIds.join(',')
  const laden = useCallback(async () => {
    if (!schluessel) return setListe([])
    const { data, error } = await supabase
      .from('durchgaenge')
      .select('schueler_id, aufgabe_id, aufgabe:aufgaben(titel)')
      .in('schueler_id', schluessel.split(','))
      .not('fertig_am', 'is', null)
      .gt('frei_ab', heuteBerlin())
    if (error) setFehler(fehlerText(error))
    else setListe(data as unknown as Gesperrt[])
  }, [schluessel])
  useEffect(() => {
    void laden()
  }, [laden])

  async function freigeben(ids: string[], aufgabe: string | null) {
    const { data, error } = await supabase.rpc('versuch_freigeben', { p_schueler: ids, p_aufgabe: aufgabe })
    if (error) {
      setFehler(fehlerText(error))
      return null
    }
    setFehler(null)
    void laden()
    return data as number
  }
  return { liste, fehler, freigeben }
}

/** Klassenseite: Pseudonyme antippen, Übung wählen, freigeben */
export function FreigebenKlasse({ schueler }: { schueler: { id: string; pseudonym: string }[] }) {
  const { liste, fehler, freigeben } = useGesperrt(schueler.map((s) => s.id))
  const [gewaehlt, setGewaehlt] = useState<Set<string>>(new Set())
  const [aufgabe, setAufgabe] = useState('')
  const [meldung, setMeldung] = useState<string | null>(null)
  const uebungen = [...new Map(liste.map((g) => [g.aufgabe_id, g.aufgabe.titel])).entries()].sort((a, b) => a[1].localeCompare(b[1], 'de'))
  const wartet = new Set(liste.map((g) => g.schueler_id))

  async function los(ids: string[]) {
    const n = await freigeben(ids, aufgabe || null)
    if (n === null) return
    setMeldung(n === 0 ? 'Es wartete keine Übung. Alle können schon üben.' : `✓ Freigegeben (${n === 1 ? '1 Übung' : `${n} Übungen`}).`)
    setGewaehlt(new Set())
  }

  return (
    <section className="lk-abschnitt">
      <h2>Versuch früher freigeben</h2>
      <p className="lk-leise">
        Nach einem Durchgang ist eine Übung erst am nächsten Tag wieder dran. Hier geben Sie sie früher frei. Es wird nichts gelöscht.
      </p>
      {liste.length === 0 ? (
        <p className="lk-leise">Gerade wartet niemand auf einen neuen Versuch.</p>
      ) : (
        <>
          <div className="lk-auswahl" role="group" aria-label="Für wen freigeben?">
            {schueler
              .filter((s) => wartet.has(s.id))
              .map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className="lk-knopf"
                  aria-pressed={gewaehlt.has(s.id)}
                  onClick={() => {
                    const neu = new Set(gewaehlt)
                    if (neu.has(s.id)) neu.delete(s.id)
                    else neu.add(s.id)
                    setGewaehlt(neu)
                  }}
                >
                  {gewaehlt.has(s.id) && '✓ '}
                  {s.pseudonym}
                </button>
              ))}
          </div>
          <div className="lk-zeile">
            <label>
              Übung
              <select className="lk-feld" value={aufgabe} onChange={(e) => setAufgabe(e.target.value)}>
                <option value="">alle Übungen</option>
                {uebungen.map(([id, titel]) => (
                  <option key={id} value={id}>
                    {titel}
                  </option>
                ))}
              </select>
            </label>
            <button type="button" className="lk-knopf lk-knopf--haupt" disabled={gewaehlt.size === 0} onClick={() => void los([...gewaehlt])}>
              Für {gewaehlt.size === 1 ? '1 Ausgewählte:n' : `${gewaehlt.size} Ausgewählte`} freigeben
            </button>
            <button type="button" className="lk-knopf" onClick={() => void los(schueler.map((s) => s.id))}>
              Für alle freigeben
            </button>
          </div>
        </>
      )}
      {meldung && <p role="status">{meldung}</p>}
      {fehler && <p className="lk-hinweis" role="alert">{fehler}</p>}
    </section>
  )
}

/** Lernstand-Seite einer Schüler:in: je wartender Übung ein Knopf */
export function FreigebenSchueler({ schuelerId }: { schuelerId: string }) {
  const { liste, fehler, freigeben } = useGesperrt([schuelerId])
  const [meldung, setMeldung] = useState<string | null>(null)
  return (
    <section className="lk-abschnitt lk-nicht-drucken">
      <h2>Versuch früher freigeben</h2>
      {liste.length === 0 ? (
        <p className="lk-leise">Gerade wartet keine Übung auf morgen.</p>
      ) : (
        <ul className="lk-liste">
          {liste.map((g) => (
            <li key={g.aufgabe_id} className="lk-eintrag">
              <span>{g.aufgabe.titel}</span>
              <button
                type="button"
                className="lk-knopf"
                onClick={async () => {
                  if ((await freigeben([schuelerId], g.aufgabe_id)) !== null) setMeldung(`✓ „${g.aufgabe.titel}“ freigegeben.`)
                }}
              >
                Früher freigeben
              </button>
            </li>
          ))}
        </ul>
      )}
      {meldung && <p role="status">{meldung}</p>}
      {fehler && <p className="lk-hinweis" role="alert">{fehler}</p>}
    </section>
  )
}
