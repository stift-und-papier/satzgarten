import { useState } from 'react'
import { Symbol, type SymbolName } from '../gemeinsam/Symbol'

// Stilblatt (Phase 2, Aufgabe 4): alle Bausteine auf einer Seite, damit die Lehrkraft das Design am iPad prüfen kann.
// Ohne Daten und ohne Datenbank. Adresse: #/stil. Wird nach der Design-Freigabe wieder entfernt.

const FARBEN: { name: string; wofuer: string; variable: string }[] = [
  { name: 'Wiese', wofuer: 'Hintergrund', variable: '--color-wiese' },
  { name: 'Papier', wofuer: 'Karten', variable: '--color-papier' },
  { name: 'Holz', wofuer: 'Konturen, Text', variable: '--color-holz' },
  { name: 'Blattgrün', wofuer: 'Hauptknopf, Auswahl', variable: '--color-blatt' },
  { name: 'Pfirsich', wofuer: 'Nochmal', variable: '--color-nochmal-flaeche' },
  { name: 'Sonne', wofuer: 'Sterne', variable: '--color-sonne' },
]

const MENUE: { name: SymbolName; text: string }[] = [
  { name: 'garten', text: 'Garten' },
  { name: 'uebungen', text: 'Übungen' },
  { name: 'lernweg', text: 'Lernweg' },
  { name: 'sammelbuch', text: 'Sammelbuch' },
  { name: 'hilfe', text: 'Hilfe' },
]

const WOERTER = ['Gestern', 'ging', 'ich', 'mit', 'meiner', 'Schwester', 'in', 'den', 'Garten.']

function Sterne({ stufe }: { stufe: 1 | 2 | 3 }) {
  return (
    <span className="sterne">
      {[1, 2, 3].map((i) => (
        <span key={i} className={i <= stufe ? 'sterne__voll' : undefined}>
          <Symbol name="stern" gefuellt={i <= stufe} />
        </span>
      ))}
      <span className="leise">Stufe {stufe} von 3</span>
    </span>
  )
}

export default function Stilblatt() {
  const [wahl, setWahl] = useState<number | null>(1)
  const [markiert, setMarkiert] = useState<number[]>([1])
  const [geprueft, setGeprueft] = useState(false)

  return (
    <div className="garten-seite">
      <div className="garten-seite__inhalt">
        <header className="karte">
          <div className="knopf-reihe" style={{ justifyContent: 'space-between' }}>
            <button type="button" className="holzknopf" aria-label="Zurück">
              <Symbol name="zurueck" />
            </button>
            <h1>Stilblatt</h1>
            <button type="button" className="holzknopf" aria-label="Hilfe">
              <Symbol name="hilfe" />
            </button>
          </div>
          <p>So sollen die Seiten für Schüler:innen aussehen. Alles hier lässt sich antippen und ausprobieren.</p>
        </header>

        <section className="karte" aria-labelledby="t-aufgabe">
          <div className="knopf-reihe" style={{ justifyContent: 'space-between' }}>
            <h2 id="t-aufgabe">Das oder dass?</h2>
            <Sterne stufe={2} />
          </div>
          <p>Setze das richtige Wort ein.</p>
          <p className="satz">
            Ich weiß,{' '}
            <input className={`luecke ${geprueft ? 'luecke--richtig' : ''}`} defaultValue="dass" aria-label="Lücke 1" />
            {geprueft && <span className="marke marke--richtig">✓</span>} du kommst. Ist{' '}
            <input className={`luecke ${geprueft ? 'luecke--nochmal' : ''}`} defaultValue="dass" aria-label="Lücke 2" />
            {geprueft && <span className="marke marke--nochmal">↻</span>} dein Rad?
          </p>
          <div className="knopf-reihe">
            <button type="button" className="knopf knopf--haupt" onClick={() => setGeprueft(true)}>
              Prüfen
            </button>
            <button type="button" className="knopf" disabled={!geprueft}>
              Lösung ansehen
            </button>
            <button type="button" className="holzknopf" aria-label="Tipp anzeigen">
              <Symbol name="tipp" />
            </button>
          </div>
          {geprueft && (
            <div className="rueckmeldung rueckmeldung--nochmal" role="status">
              <span className="rueckmeldung__zeichen" aria-hidden="true">!</span>
              <p>Fast! Eine Lücke ist schon richtig. Schau dir die Lücke mit ↻ nochmal an.</p>
            </div>
          )}
        </section>

        <section className="karte" aria-labelledby="t-auswahl">
          <h2 id="t-auswahl">Antippen</h2>
          <p>Welches Wort passt? Ich glaube, ___ es regnet.</p>
          <div className="chips" role="group" aria-label="Auswahl">
            {['das', 'dass'].map((w, i) => (
              <button key={w} type="button" className="chip" aria-pressed={wahl === i} onClick={() => setWahl(i)}>
                {w}
              </button>
            ))}
            <button type="button" className="chip" disabled>
              gesperrt
            </button>
          </div>
          <p>Tippe alle Verben an.</p>
          <p className="satz">
            {WOERTER.map((w, i) => (
              <span key={i}>
                <button
                  type="button"
                  className="wort"
                  aria-pressed={markiert.includes(i)}
                  onClick={() => setMarkiert((m) => (m.includes(i) ? m.filter((x) => x !== i) : [...m, i]))}
                >
                  {w}
                </button>{' '}
              </span>
            ))}
          </p>
        </section>

        <section className="karte" aria-labelledby="t-rueck">
          <h2 id="t-rueck">Rückmeldung</h2>
          <div className="rueckmeldung rueckmeldung--richtig">
            <span className="rueckmeldung__zeichen" aria-hidden="true">✓</span>
            <p>Super, alles richtig! Weiter geht’s.</p>
          </div>
          <div className="rueckmeldung rueckmeldung--nochmal">
            <span className="rueckmeldung__zeichen" aria-hidden="true">!</span>
            <p>Noch nicht ganz. Versuch es nochmal.</p>
          </div>
          <div className="knopf-reihe">
            <button type="button" className="knopf knopf--haupt">
              Weiter <Symbol name="weiter" />
            </button>
            <button type="button" className="knopf" aria-busy="true">
              Wird gesendet …
            </button>
          </div>
        </section>

        <section className="karte" aria-labelledby="t-farben">
          <h2 id="t-farben">Farben und Schrift</h2>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 9rem), 1fr))', gap: 'var(--space-md)' }}>
            {FARBEN.map((f) => (
              <li key={f.name} style={{ display: 'grid', gap: 'var(--space-2xs)' }}>
                <span style={{ height: 56, borderRadius: 'var(--radius-feld)', border: 'var(--kontur) solid var(--color-holz)', background: `var(${f.variable})` }} />
                <strong>{f.name}</strong>
                <span className="leise">{f.wofuer}</span>
              </li>
            ))}
          </ul>
          <h3>Überschriften in Fraunces</h3>
          <p>Aufgaben und Texte in Nunito, mindestens 18 Pixel groß, damit man sie auf dem iPad gut lesen kann.</p>
        </section>

        <section className="lehrkraft" aria-labelledby="t-lk" style={{ borderRadius: 'var(--radius-lk)', padding: 'var(--space-lg)', display: 'grid', gap: 'var(--space-md)' }}>
          <h2 id="t-lk">Ansicht der Lehrkraft</h2>
          <p className="lk-leise">Dieselben Farben, aber leise: flache Flächen, feine Linien, Grün nur für die Hauptaktion.</p>
          <table className="lk-tabelle">
            <thead>
              <tr>
                <th scope="col">Pseudonym</th>
                <th scope="col">Erledigte Aufgaben</th>
                <th scope="col">Stufe</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Fuchs-07</td><td>12</td><td>2</td></tr>
              <tr><td>Eule-12</td><td>8</td><td>1</td></tr>
            </tbody>
          </table>
          <div className="knopf-reihe">
            <input className="lk-feld" placeholder="Name der Klasse" aria-label="Name der Klasse" />
            <button type="button" className="lk-knopf lk-knopf--haupt">Klasse anlegen</button>
            <button type="button" className="lk-knopf">Abbrechen</button>
          </div>
        </section>
      </div>

      <nav className="menue" aria-label="Hauptmenü">
        <ul>
          {MENUE.map((m, i) => (
            <li key={m.name}>
              <a href="#/stil" aria-current={i === 0 ? 'page' : undefined}>
                <Symbol name={m.name} />
                {m.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
