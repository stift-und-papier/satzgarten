import type { AufgabenTyp } from '../lib/typen'
import { FORMATE } from './AufgabeEditor'

// alt (Übungswiese), ohne Pixel-Symbole: „+ Neue Aufgabe“ zeigt je Format eine Kachel (Name, ein Satz, Mini-Beispiel).
export function FormatWahl() {
  return (
    <>
      <a className="lk-zurueck" href="#/lehrkraft/aufgaben">
        ← Alle Übungen
      </a>
      <h1>Neue Übung</h1>
      <p>Welches Format soll die Übung haben? Sie können es beim Erstellen noch ändern.</p>
      <ul className="lk-kacheln">
        {(Object.keys(FORMATE) as AufgabenTyp[]).map((typ) => (
          <li key={typ}>
            <a className="lk-eintrag lk-kachel" href={`#/lehrkraft/aufgaben/neu-${typ}`}>
              <strong>{FORMATE[typ].name}</strong>
              <span>{FORMATE[typ].kurz}</span>
              <span className="lk-leise">{FORMATE[typ].mini}</span>
            </a>
          </li>
        ))}
      </ul>
    </>
  )
}
