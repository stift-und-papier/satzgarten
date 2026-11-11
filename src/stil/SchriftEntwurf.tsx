import { Sprite } from '../gemeinsam/Sprite'
import { GRAFIK } from '../grafik'
import { useLeseschrift } from '../lib/leseschrift'
import './schrift-entwurf.css'

// Entwurfsseite für Aufgabe 5: drei Schriften nebeneinander, damit die Lehrkraft am iPad wählen kann.
// Adresse: #/stil/schrift. Wird nach der Wahl wieder entfernt.

const ENTWUERFE = [
  { kennung: 'a', titel: 'A, alles in Pixel-Schrift', text: 'Überschriften und Texte in „Pixelify Sans“.' },
  { kennung: 'b', titel: 'B, Pixel-Überschrift und ruhiger Text', text: 'Überschriften in „Pixelify Sans“, Texte in „Nunito“.' },
  { kennung: 'c', titel: 'C, kräftige Pixel-Überschrift', text: 'Überschriften in „Silkscreen“, Texte in „Nunito“.' },
]

export default function SchriftEntwurf() {
  const [lrs, setLrs] = useLeseschrift()
  return (
    <div className="garten-seite">
      <main className="garten-seite__inhalt">
        <header className="karte">
          <h1>Welche Schrift?</h1>
          <p>Drei Entwürfe mit demselben Inhalt. Achten Sie auf ä, ö, ü und ß und darauf, wie leicht sich der Text liest.</p>
          <div className="knopf-reihe">
            <button type="button" role="switch" aria-checked={lrs} className="schalter" onClick={() => setLrs(!lrs)}>
              <span className="schalter__bahn" aria-hidden="true"><span className="schalter__knopf" /></span>
              Leseschrift für LRS
            </button>
          </div>
        </header>

        {ENTWUERFE.map((e) => (
          <section key={e.kennung} className={`karte entwurf entwurf--${e.kennung}`} aria-labelledby={`t-${e.kennung}`}>
            <p className="leise">{e.titel}: {e.text}</p>
            <div className="knopf-reihe" style={{ justifyContent: 'space-between' }}>
              <h2 id={`t-${e.kennung}`}>Übung: Wörter mit ä, ö, ü</h2>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2xs)', fontWeight: 800 }}>
                <Sprite grafik={GRAFIK.muenze} mal={2} /> 12
              </span>
            </div>
            <p>Größere Füchse jagen über den Hügel. Äpfel, Öl und Süßes stehen im Schrank.</p>
            <p>ÄÖÜ äöü ß, 0123456789. „Hallo!“, sagt Einstein. Ist das richtig?</p>
            <h3>Schreibe die Wörter ab.</h3>
            <div className="knopf-reihe">
              <button type="button" className="knopf knopf--haupt">Prüfen</button>
              <button type="button" className="knopf">Zurück</button>
            </div>
          </section>
        ))}
      </main>
    </div>
  )
}
