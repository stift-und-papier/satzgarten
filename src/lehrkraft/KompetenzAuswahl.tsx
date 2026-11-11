// alt (Übungswiese), auf die Lehrkraft-Ansicht „ruhig“ (lk-*) umgestellt
import { useEffect, useMemo, useState } from 'react'
import { KERNCURRICULA, STUFEN } from '../lib/csv'
import { supabase } from '../lib/supabase'
import type { Kompetenz } from '../lib/typen'

type Props = { ausgewaehlt: Set<string>; onChange: (neu: Set<string>) => void }

// Kompetenzen für eine Aufgabe auswählen – auch aus mehreren Kerncurricula.
export function KompetenzAuswahl({ ausgewaehlt, onChange }: Props) {
  const [alle, setAlle] = useState<Kompetenz[]>([])
  const [kc, setKc] = useState<Kompetenz['kerncurriculum']>('Realschule')
  const [stufe, setStufe] = useState('alle')
  const [suche, setSuche] = useState('')
  const [offen, setOffen] = useState(false)

  useEffect(() => {
    void supabase
      .from('kompetenzen')
      .select('*')
      .order('sortierung')
      .then(({ data }) => setAlle((data ?? []) as Kompetenz[]))
  }, [])

  const gewaehlt = alle.filter((k) => ausgewaehlt.has(k.id))
  const treffer = useMemo(
    () =>
      alle.filter(
        (k) =>
          !k.ausgeblendet &&
          k.kerncurriculum === kc &&
          (stufe === 'alle' || k.stufe === stufe) &&
          (!suche || `${k.kurzname ?? ''} ${k.kompetenz} ${k.bereich}`.toLowerCase().includes(suche.toLowerCase())),
      ),
    [alle, kc, stufe, suche],
  )

  function umschalten(id: string) {
    const neu = new Set(ausgewaehlt)
    if (neu.has(id)) neu.delete(id)
    else neu.add(id)
    onChange(neu)
  }

  return (
    <fieldset>
      <legend>Kompetenzen</legend>
      {gewaehlt.length === 0 ? (
        <p className="lk-hinweis" role="alert">
          Noch keine Kompetenz zugeordnet. Ohne Zuordnung fließt die Aufgabe nicht in den Lernstand ein.
        </p>
      ) : (
        <ul className="lk-chips">
          {gewaehlt.map((k) => (
            <li key={k.id} className="lk-chip">
              <span>
                <strong>{k.kurzname || k.bereich}</strong> <span className="lk-leise">({k.kerncurriculum})</span>
              </span>
              <button type="button" onClick={() => umschalten(k.id)} aria-label={`${k.kurzname ?? k.bereich} entfernen`}>
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
      <button type="button" className="lk-knopf" onClick={() => setOffen(!offen)}>
        {offen ? 'Auswahl schließen' : '+ Kompetenzen auswählen'}
      </button>

      {offen && (
        <div className="lk-formular">
          <p className="lk-leise">
            Tipp: Eine Aufgabe kann Kompetenzen aus mehreren Kerncurricula haben. Ausgewertet wird jeweils nach dem KC der
            Schülerin oder des Schülers.
          </p>
          <div className="lk-reiter" role="group">
            {KERNCURRICULA.map((name) => (
              <button type="button" key={name} className="lk-knopf" aria-pressed={kc === name} onClick={() => setKc(name)}>
                {name}
              </button>
            ))}
          </div>
          <div className="lk-zeile">
            <label>
              Stufe
              <select className="lk-feld" value={stufe} onChange={(e) => setStufe(e.target.value)}>
                <option value="alle">alle</option>
                {STUFEN.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label>
              Suchen
              <input className="lk-feld" value={suche} onChange={(e) => setSuche(e.target.value)} placeholder="z. B. dass, Komma, s-Laute" />
            </label>
          </div>
          <ul className="lk-auswahlliste">
            {treffer.map((k) => (
              <li key={k.id}>
                <label className="lk-haken">
                  <input type="checkbox" checked={ausgewaehlt.has(k.id)} onChange={() => umschalten(k.id)} />
                  <span>
                    <strong>{k.kurzname || k.bereich}</strong>{' '}
                    <span className="lk-leise">
                      · {k.bereich} · Stufe {k.stufe}
                    </span>
                    <br />
                    <span className="lk-leise">{k.kompetenz}</span>
                  </span>
                </label>
              </li>
            ))}
            {treffer.length === 0 && <li className="lk-leise">Keine passenden Kompetenzen.</li>}
          </ul>
        </div>
      )}
    </fieldset>
  )
}
