import { gehe } from '../lib/router'
import { Symbol } from '../gemeinsam/Symbol'
import { Maskottchen, MaskottchenSagt, type Ausdruck } from '../gemeinsam/Maskottchen'

// Aufgabe 5: das gewählte Maskottchen (Blatthut) mit vier Ausdrücken und Sprechblase (Adresse #/stil/maskottchen).
// Wird mit dem Stilblatt nach der Design-Freigabe entfernt.

const AUSDRUECKE: { ausdruck: Ausdruck; name: string; wann: string }[] = [
  { ausdruck: 'freundlich', name: 'Freundlich', wann: 'Begrüßt und erklärt, wie eine Aufgabe geht.' },
  { ausdruck: 'nachdenklich', name: 'Nachdenklich', wann: 'Wenn etwas noch nicht stimmt: „Schau noch einmal genau hin.“' },
  { ausdruck: 'freut-sich', name: 'Freut sich', wann: 'Wenn eine Aufgabe geschafft ist.' },
  { ausdruck: 'zeigt', name: 'Zeigt', wann: 'Zeigt auf den Tipp der Lehrkraft oder auf etwas Neues.' },
]

export default function MaskottchenVorschau() {
  return (
    <div className="garten-seite">
      <main className="garten-seite__inhalt">
        <div className="knopf-reihe">
          <button type="button" className="holzknopf" aria-label="Zurück zum Stilblatt" onClick={() => gehe('stil')}>
            <Symbol name="zurueck" />
          </button>
        </div>
        <div className="karte">
          <h1>Maskottchen: Blatthut</h1>
          <MaskottchenSagt ausdruck="zeigt">
            <p>Hallo! Ich begleite dich durch die Aufgaben. Wenn du Hilfe brauchst, tippe auf die Glühbirne.</p>
          </MaskottchenSagt>
        </div>
        <div className="karte">
          <h2>Vier Gesichter</h2>
          <ul className="geist-raster">
            {AUSDRUECKE.map(({ ausdruck, name, wann }) => (
              <li key={ausdruck}>
                <Maskottchen ausdruck={ausdruck} />
                <h3>{name}</h3>
                <p>{wann}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="karte">
          <h2>Bei einer Aufgabe</h2>
          <MaskottchenSagt ausdruck="nachdenklich">
            <p>Schau dir die Wörter vor der Lücke noch einmal an. Kannst du „das“ durch „dieses“ ersetzen?</p>
          </MaskottchenSagt>
          <MaskottchenSagt ausdruck="freut-sich">
            <p>Geschafft! Deine Pflanzen bekommen Wasser.</p>
          </MaskottchenSagt>
        </div>
      </main>
    </div>
  )
}
