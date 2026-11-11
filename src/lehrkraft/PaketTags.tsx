// alt (Übungswiese), auf die Lehrkraft-Ansicht „ruhig“ (lk-*) umgestellt
import { JAHRGAENGE, ZWEIGE, type Paket } from '../lib/typen'

type Tags = Pick<Paket, 'jahrgaenge' | 'zweige'>

/** Sichtbare Tags eines Pakets: erst die Jahrgänge (aufsteigend), dann die Zweige in fester Reihenfolge */
export function PaketTags({ jahrgaenge, zweige }: Tags) {
  const tags = [...JAHRGAENGE.filter((j) => jahrgaenge.includes(j)).map((j) => `Jg. ${j}`), ...ZWEIGE.filter((z) => zweige.includes(z))]
  if (tags.length === 0) return null
  return (
    <span aria-label="Tags">
      {tags.map((t) => (
        <span key={t} className="lk-marke">
          {t}
        </span>
      ))}
    </span>
  )
}

/** Ankreuzfelder für die Tags (beim Anlegen und beim Bearbeiten eines Pakets) */
export function TagAuswahl({ wert, onChange }: { wert: Tags; onChange: (t: Tags) => void }) {
  const umschalten = <T,>(liste: T[], x: T) => (liste.includes(x) ? liste.filter((y) => y !== x) : [...liste, x])
  return (
    <div className="lk-zeile">
      <fieldset>
        <legend>Jahrgang</legend>
        <div className="lk-knopfreihe">
          {JAHRGAENGE.map((j) => (
            <label key={j} className="lk-haken">
              <input type="checkbox" checked={wert.jahrgaenge.includes(j)} onChange={() => onChange({ ...wert, jahrgaenge: umschalten(wert.jahrgaenge, j) })} />
              {j}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend>Zweig</legend>
        <div className="lk-knopfreihe">
          {ZWEIGE.map((z) => (
            <label key={z} className="lk-haken">
              <input type="checkbox" checked={wert.zweige.includes(z)} onChange={() => onChange({ ...wert, zweige: umschalten(wert.zweige, z) })} />
              {z}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  )
}
