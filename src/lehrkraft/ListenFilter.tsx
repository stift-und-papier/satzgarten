// alt (Übungswiese), auf die Lehrkraft-Ansicht „ruhig“ (lk-*) umgestellt
import { useEffect, useState } from 'react'
import { DOPPELJAHRGAENGE, LEERER_FILTER, passt, type Filter, type FilterKompetenz } from '../lib/filter'
import { fehlerText } from '../lib/fehler'
import { supabase } from '../lib/supabase'
import type { Kompetenz } from '../lib/typen'

export type ListenKompetenz = FilterKompetenz & Pick<Kompetenz, 'kurzname' | 'kompetenz' | 'kerncurriculum'>

/** Alle Kompetenzen der Lehrkraft als Nachschlagetabelle (für passt()) */
export function useKompetenzen(setFehler: (text: string) => void) {
  const [kompetenzen, setKompetenzen] = useState<Map<string, ListenKompetenz>>(new Map())
  useEffect(() => {
    void supabase
      .from('kompetenzen')
      .select('id, bereich, stufe, kurzname, kompetenz, kerncurriculum')
      .order('sortierung')
      .then(({ data, error }) =>
        // ohne Kompetenzen wäre jeder Eintrag „ohne Zuordnung“ – das muss sichtbar sein
        error
          ? setFehler(`Kompetenzen konnten nicht geladen werden, der Filter stimmt deshalb nicht. ${fehlerText(error)}`)
          : setKompetenzen(new Map(((data ?? []) as ListenKompetenz[]).map((k) => [k.id, k]))),
      )
  }, [setFehler])
  return kompetenzen
}

type Props = {
  filter: Filter
  onChange: (f: Filter) => void
  /** Kompetenzen, die in der Liste vorkommen – nur diese stehen zur Auswahl */
  verwendet: ListenKompetenz[]
  treffer: number
  gesamt: number
  suchText: string
}

// Filterleiste: Titelsuche, Jahrgang (aus der KC-Stufe der Kompetenzen), Bereich, einzelne Kompetenz.
export function ListenFilter({ filter, onChange, verwendet, treffer, gesamt, suchText }: Props) {
  const bereiche = [...new Set(verwendet.map((k) => k.bereich))].sort((a, b) => a.localeCompare(b, 'de'))
  const imBereich = verwendet.filter(
    (k) => k.bereich === filter.bereich && passt('', [k.id], { ...LEERER_FILTER, jahrgang: filter.jahrgang }, new Map([[k.id, k]])),
  )
  const mehrereKc = new Set(imBereich.map((k) => k.kerncurriculum)).size > 1
  const aktiv = JSON.stringify(filter) !== JSON.stringify(LEERER_FILTER)

  return (
    <div className="lk-formular">
      <div className="lk-zeile">
        <label>
          Suchen
          <input className="lk-feld" value={filter.suche} onChange={(e) => onChange({ ...filter, suche: e.target.value })} placeholder={suchText} />
        </label>
        <label>
          Jahrgang
          <select className="lk-feld" value={filter.jahrgang} onChange={(e) => onChange({ ...filter, jahrgang: e.target.value as Filter['jahrgang'], kompetenz: '' })}>
            <option value="">alle</option>
            {DOPPELJAHRGAENGE.map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
            <option value="ohne">ohne Kompetenz-Zuordnung</option>
          </select>
        </label>
        <label>
          Bereich
          <select className="lk-feld"
            value={filter.bereich}
            disabled={filter.jahrgang === 'ohne'}
            onChange={(e) => onChange({ ...filter, bereich: e.target.value, kompetenz: '' })}
          >
            <option value="">alle</option>
            {bereiche.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </label>
        <label>
          Kompetenz
          <select className="lk-feld"
            value={filter.kompetenz}
            disabled={!filter.bereich || filter.jahrgang === 'ohne'}
            onChange={(e) => onChange({ ...filter, kompetenz: e.target.value })}
          >
            <option value="">{filter.bereich ? 'alle im Bereich' : 'erst Bereich wählen'}</option>
            {imBereich.map((k) => (
              <option key={k.id} value={k.id}>
                {k.kurzname?.trim() || k.kompetenz}
                {mehrereKc ? ` (${k.kerncurriculum})` : ''}
              </option>
            ))}
          </select>
        </label>
      </div>
      {aktiv && (
        <p className="lk-leise">
          {treffer} von {gesamt} angezeigt{' '}
          <button type="button" className="lk-knopf" onClick={() => onChange(LEERER_FILTER)}>
            Filter zurücksetzen
          </button>
        </p>
      )}
    </div>
  )
}
