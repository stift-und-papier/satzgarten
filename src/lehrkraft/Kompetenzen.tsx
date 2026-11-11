import { useCallback, useEffect, useMemo, useState } from 'react'
import { KERNCURRICULA, STUFEN, type Kerncurriculum } from '../lib/csv'
import { fehlerText } from '../lib/fehler'
import { supabase } from '../lib/supabase'
import type { Kompetenz } from '../lib/typen'

const STUFEN_TEXT: Record<Kompetenz['stufe'], string> = { '6': 'Ende Jg. 6', '8': 'Ende Jg. 8', '10': 'Ende Jg. 10', '6-10': 'Jg. 6–10' }

// alt (Übungswiese), gekürzt: Kompetenzen aus dem Kerncurriculum ansehen und ausblenden. Kurznamen kommen aus docs/kurznamen.csv.
// Eigene Kompetenzen gibt es nicht (nur aus docs/kompetenzen.csv, die Datenbank verbietet das Anlegen).
export function Kompetenzen() {
  const [liste, setListe] = useState<Kompetenz[] | null>(null)
  const [fehler, setFehler] = useState<string | null>(null)
  const [kc, setKc] = useState<Kerncurriculum>('Realschule')
  const [stufe, setStufe] = useState('alle')
  const [suche, setSuche] = useState('')
  const [ausgeblendeteZeigen, setAusgeblendeteZeigen] = useState(false)

  const laden = useCallback(async () => {
    const { data, error } = await supabase
      .from('kompetenzen')
      .select('id, code, kerncurriculum, bereich, stufe, kompetenz, hinweis, kurzname, ausgeblendet')
      .order('sortierung')
    if (error) setFehler(fehlerText(error))
    else setListe(data as Kompetenz[])
  }, [])

  useEffect(() => {
    void laden()
  }, [laden])

  const gefiltert = useMemo(() => {
    const s = suche.trim().toLowerCase()
    return (liste ?? []).filter(
      (k) =>
        k.kerncurriculum === kc &&
        (stufe === 'alle' || k.stufe === stufe) &&
        (ausgeblendeteZeigen || !k.ausgeblendet) &&
        (!s || `${k.kompetenz} ${k.kurzname ?? ''} ${k.hinweis ?? ''}`.toLowerCase().includes(s)),
    )
  }, [liste, kc, stufe, suche, ausgeblendeteZeigen])
  const bereiche = [...new Set(gefiltert.map((k) => k.bereich))]
  const anzahl = (name: Kerncurriculum) => (liste ?? []).filter((k) => k.kerncurriculum === name && !k.ausgeblendet).length

  async function speichern(k: Kompetenz, ausgeblendet: boolean) {
    const { error } = await supabase.from('kompetenzen').update({ ausgeblendet }).eq('id', k.id)
    if (error) return setFehler(fehlerText(error))
    setFehler(null)
    setListe((alt) => alt && alt.map((x) => (x.id === k.id ? { ...x, ausgeblendet } : x)))
  }

  return (
    <>
      <h1>Kompetenzen</h1>
      <p className="lk-leise">
        Aus den Kerncurricula Deutsch Sek I. Die fett gedruckten Kurznamen sehen später die Schüler:innen. Ausgeblendete
        Kompetenzen können Sie keinen Aufgaben mehr zuordnen.
      </p>
      {fehler && <p className="lk-hinweis" role="alert">{fehler}</p>}

      <div className="lk-reiter" role="group" aria-label="Kerncurriculum">
        {KERNCURRICULA.map((name) => (
          <button key={name} type="button" className="lk-knopf" aria-pressed={kc === name} onClick={() => setKc(name)}>
            {name} ({anzahl(name)})
          </button>
        ))}
      </div>

      <div className="lk-zeile">
        <label>
          Stufe
          <select className="lk-feld" value={stufe} onChange={(e) => setStufe(e.target.value)}>
            <option value="alle">alle Stufen</option>
            {STUFEN.map((s) => (
              <option key={s} value={s}>
                {STUFEN_TEXT[s]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Suchen
          <input className="lk-feld" type="search" value={suche} onChange={(e) => setSuche(e.target.value)} placeholder="z. B. Komma" />
        </label>
        <label className="lk-haken">
          <input type="checkbox" checked={ausgeblendeteZeigen} onChange={(e) => setAusgeblendeteZeigen(e.target.checked)} />
          Ausgeblendete zeigen
        </label>
      </div>

      {liste === null ? (
        <p className="lk-leise" role="status">Lädt …</p>
      ) : gefiltert.length === 0 ? (
        <p>Keine passenden Kompetenzen.</p>
      ) : (
        bereiche.map((bereich) => (
          <section key={bereich} className="lk-abschnitt">
            <h2>{bereich}</h2>
            <ul className="lk-kompetenzen">
              {gefiltert
                .filter((k) => k.bereich === bereich)
                .map((k) => (
                  <li key={k.id} className="lk-kompetenz" data-aus={k.ausgeblendet || undefined}>
                    <div className="lk-kompetenz__kopf">
                      <h3>
                        {k.kurzname ?? k.bereich} <span className="lk-marke">{STUFEN_TEXT[k.stufe]}</span>
                        {k.ausgeblendet && <span className="lk-leise"> (ausgeblendet)</span>}
                      </h3>
                      <button type="button" className="lk-knopf" onClick={() => void speichern(k, !k.ausgeblendet)}>
                        {k.ausgeblendet ? 'Einblenden' : 'Ausblenden'}
                      </button>
                    </div>
                    <p>{k.kompetenz}</p>
                    {k.hinweis && <p className="lk-leise">Hinweis: {k.hinweis}</p>}
                  </li>
                ))}
            </ul>
          </section>
        ))
      )}
    </>
  )
}
