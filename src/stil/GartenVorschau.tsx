import { gehe } from '../lib/router'
import { Symbol } from '../gemeinsam/Symbol'
import { MaskottchenSagt } from '../gemeinsam/Maskottchen'
import { Bank, Beet, Korb, Pflanze, STUFEN, Weg, Zaun } from '../gemeinsam/Garten'

// Aufgabe 6: Garten-Entwurf mit Beispieldaten (Adresse #/stil/garten), noch ohne Datenbank und ohne Antippen.
// Wird mit dem Stilblatt nach der Design-Freigabe entfernt.

const SAMMELBUCH = 18 // 12 Pflanzen + 6 Deko-Dinge (Spec)

export default function GartenVorschau() {
  return (
    <div className="garten-seite">
      <main className="garten-seite__inhalt">
        <div className="knopf-reihe">
          <button type="button" className="holzknopf" aria-label="Zurück zum Stilblatt" onClick={() => gehe('stil')}>
            <Symbol name="zurueck" />
          </button>
        </div>

        <h1 className="garten-titel">Dein Garten</h1>
        <MaskottchenSagt>
          <p>Für jedes fertige Paket bekommst du eine Samentüte. Pflanze sie in ein freies Beet. Jede Aufgabe gießt deine Pflanzen.</p>
        </MaskottchenSagt>

        <section className="garten" aria-label="Beispiel-Garten">
          <Zaun />
          <div className="garten__hof">
            <Korb tueten={2} />
            <Bank />
          </div>
          <Weg />
          <div className="garten__beete">
            <Beet nummer={1} stufe="bluete" />
            <Beet nummer={2} stufe="pflanze" />
            <Beet nummer={3} stufe="spross" />
            <Beet nummer={4} stufe="samen" />
            <Beet nummer={5} />
            <Beet nummer={6} />
          </div>
        </section>

        <section className="karte" aria-labelledby="t-wachsen">
          <h2 id="t-wachsen">Eine Pflanze wächst</h2>
          <p>Nach einigen Aufgaben wächst sie eine Stufe weiter. Sie welkt nie.</p>
          <ol className="stufen">
            {STUFEN.map(({ stufe, name }) => (
              <li key={stufe}>
                <Pflanze stufe={stufe} />
                {name}
              </li>
            ))}
          </ol>
        </section>

        <section className="karte" aria-labelledby="t-sammelbuch">
          <h2 id="t-sammelbuch">Sammelbuch</h2>
          <ul className="sammelbuch">
            <li className="sammelbuch__fund">
              <Pflanze stufe="bluete" />
              Sonnenblume
            </li>
            <li className="sammelbuch__fund">
              <Bank />
              Bank
            </li>
            {Array.from({ length: SAMMELBUCH - 2 }, (_, i) => (
              <li key={i} className="sammelbuch__offen" aria-label="noch nicht gefunden">
                <span aria-hidden="true">?</span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  )
}
