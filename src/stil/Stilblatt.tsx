import { useState } from 'react'
import { Anweisung } from '../gemeinsam/Anweisung'
import { Sterne, SterneText } from '../gemeinsam/Sterne'
import { EinsteinSagt, type Pose } from '../gemeinsam/Einstein'
import { Sprite } from '../gemeinsam/Sprite'
import { Symbol, type SymbolName } from '../gemeinsam/Symbol'
import { GRAFIK } from '../grafik'
import { KATEGORIEN, kategorieAus, type Gruppe, type Kategorie } from '../lib/kategorien'
import { useLeseschrift } from '../lib/leseschrift'
import { useDunkel } from '../lib/thema'

// Stilblatt (Phase 2, Aufgabe 4): alle Bausteine auf einer Seite, damit die Lehrkraft das Design am iPad prüfen kann.
// Ohne Daten und ohne Datenbank. Adresse: #/stil. Wird nach der Design-Freigabe wieder entfernt.

const FARBEN: { name: string; wofuer: string; variable: string }[] = [
  { name: 'Holz', wofuer: 'Hier kannst du tippen: Knöpfe, Pfeile, Auswahl', variable: '--color-aktion' },
  { name: 'Himmelblau', wofuer: 'Hilfe: Tipp und Fragezeichen', variable: '--color-hilfe' },
  { name: 'Blattgrün', wofuer: 'Richtig, geschafft', variable: '--color-richtig-flaeche' },
  { name: 'Pfirsich', wofuer: 'Nochmal versuchen', variable: '--color-nochmal-flaeche' },
  { name: 'Sonne', wofuer: 'Sterne', variable: '--color-sonne' },
  { name: 'Wiese und Papier', wofuer: 'Hintergrund und Karten', variable: '--color-papier' },
]

const EINSTEIN: [Pose, string][] = [
  ['freundlich', 'Hallo! Schön, dass du da bist. Heute üben wir „das“ und „dass“.'],
  ['lob', 'Super, alles richtig!'],
  ['freut-sich', 'Geschafft! Du hast das ganze Paket gelöst.'],
  ['huch', 'Huch! Da kommt ein Monster.'],
  ['erklaert', 'Schau dir die Lücke mit ↻ nochmal an. Tipp: Kannst du „dieses“ einsetzen?'],
]

const MENUE: { name: SymbolName; text: string }[] = [
  { name: 'garten', text: 'Farm' },
  { name: 'uebungen', text: 'Übungen' },
  { name: 'lernweg', text: 'Lernweg' },
  { name: 'sammelbuch', text: 'Buch' },
  { name: 'hilfe', text: 'Hilfe' },
]

const GRUPPEN: { gruppe: Gruppe; titel: string }[] = [
  { gruppe: 'wortart', titel: 'Wortarten' },
  { gruppe: 'satzglied', titel: 'Satzglieder' },
  { gruppe: 'zeitform', titel: 'Zeitformen' },
]
const k = (name: string) => kategorieAus(name) as Kategorie

// Beispielsatz mit Satzgliedern (so färbt die App Wörter, deren Satzglied in der Aufgabe steht)
const SATZGLIEDER: [string, Kategorie][] = [
  ['Der kleine Hund', k('Subjekt')], ['bellt', k('Prädikat')], ['heute', k('Adverbiale')], ['den Briefträger', k('Akkusativobjekt')], ['an.', k('Prädikat')],
]
const WORTARTEN = KATEGORIEN.filter((kat) => kat.gruppe === 'wortart')
const ZUORDNEN = ['Die', 'Sonne', 'scheint', 'warm', 'auf', 'unseren', 'Garten.']
const WOERTER = ['Gestern', 'ging', 'ich', 'mit', 'meiner', 'Schwester', 'in', 'den', 'Garten.']
// Antippen ohne Farbe: ganze Wortgruppen, keine Wortart
const GRUPPEN_FARBLOS = ['Gestern Abend', 'haben', 'wir', 'im Garten', 'Tomaten', 'gepflanzt.']
const VERB = k('Verben')

/** Antippbare Wörter oder Wortgruppen; markierte bekommen die Farbe (oder bleiben neutral, wenn farbe fehlt). */
function Antippen({ teile, farbe }: { teile: string[]; farbe?: Kategorie['farbe'] }) {
  const [markiert, setMarkiert] = useState<number[]>([1])
  return (
    <p className="satz">
      {teile.map((w, i) => (
        <span key={i}>
          <button
            type="button"
            className="wort"
            aria-pressed={markiert.includes(i)}
            data-farbe={markiert.includes(i) ? farbe : undefined}
            onClick={() => setMarkiert((m) => (m.includes(i) ? m.filter((x) => x !== i) : [...m, i]))}
          >
            {w}
          </button>{' '}
        </span>
      ))}
    </p>
  )
}

export default function Stilblatt() {
  const [wahl, setWahl] = useState<number | null>(1)
  const [stift, setStift] = useState<Kategorie>(WORTARTEN[0])
  const [zugeordnet, setZugeordnet] = useState<Record<number, Kategorie>>({ 1: k('Nomen'), 2: k('Verb') })
  const [geprueft, setGeprueft] = useState(false)
  const [lrs, setLrs] = useLeseschrift()
  const [dunkel, setDunkel] = useDunkel()

  return (
    <div className="garten-seite">
      <div className="garten-seite__inhalt">
        <header className="karte">
          <div className="knopf-reihe" style={{ justifyContent: 'space-between' }}>
            <button type="button" className="holzknopf" aria-label="Zurück">
              <Symbol name="zurueck" />
            </button>
            <h1>Stilblatt</h1>
            <button type="button" className="holzknopf holzknopf--hilfe" aria-label="Hilfe">
              <Symbol name="hilfe" />
            </button>
          </div>
          <p>So sollen die Seiten für Schüler:innen aussehen. Alles hier lässt sich antippen und ausprobieren. Der dunkle Modus folgt der iPad-Einstellung, bis du ihn selbst umschaltest.</p>
          <div className="knopf-reihe">
            <button type="button" role="switch" aria-checked={lrs} className="schalter" onClick={() => setLrs(!lrs)}>
              <span className="schalter__bahn" aria-hidden="true"><span className="schalter__knopf" /></span>
              Leseschrift für LRS
            </button>
            <button type="button" role="switch" aria-checked={dunkel} className="schalter" onClick={() => setDunkel(!dunkel)}>
              <span className="schalter__bahn" aria-hidden="true"><span className="schalter__knopf" /></span>
              Dunkler Modus
            </button>
          </div>
        </header>

        <section className="karte" aria-labelledby="t-einstein">
          <h2 id="t-einstein">Einstein</h2>
          {EINSTEIN.map(([pose, text]) => (
            <EinsteinSagt key={pose} pose={pose}>
              <p>{text}</p>
            </EinsteinSagt>
          ))}
        </section>

        <section className="karte" aria-labelledby="t-aufgabe">
          <div className="knopf-reihe" style={{ justifyContent: 'space-between' }}>
            <h2 id="t-aufgabe">Das oder dass?</h2>
            <span className="knopf-reihe">
              <span className="muenzen" role="img" aria-label="12 Münzen"><Sprite grafik={GRAFIK.muenze} mal={2} /> 12</span>
              <Sterne stufe={2} />
            </span>
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
            <button type="button" className="holzknopf holzknopf--hilfe" aria-label="Tipp anzeigen">
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
          <Anweisung text="Tippe alle Verben an." />
          <Antippen teile={WOERTER} farbe={VERB.farbe} />
          <Anweisung text="Tippe die Wortgruppe an, die sagt, wann etwas passiert." farbig={false} />
          <Antippen teile={GRUPPEN_FARBLOS} />
        </section>

        <section className="karte" aria-labelledby="t-fach">
          <h2 id="t-fach">Fachbegriffe haben Farben</h2>
          {GRUPPEN.map(({ gruppe, titel }) => (
            <div key={gruppe} style={{ display: 'grid', gap: 'var(--space-xs)' }}>
              <h3>{titel}</h3>
              <ul className="legende">
                {KATEGORIEN.filter((kat) => kat.gruppe === gruppe).map((kat) => (
                  <li key={kat.name} data-farbe={kat.farbe}>{kat.name}</li>
                ))}
              </ul>
            </div>
          ))}
          <Anweisung text="Bestimme die Satzglieder." />
          <p className="satz">
            {SATZGLIEDER.map(([w, kat], i) => (
              <span key={i}>
                <span className="wort-mit-name" data-farbe={kat.farbe}>
                  <span className="wort" data-farbe={kat.farbe} style={{ display: 'inline-block' }}>{w}</span>
                  <span className="wort-mit-name__name">{kat.name}</span>
                </span>{' '}
              </span>
            ))}
          </p>
          <Anweisung text="Wähle einen Stift und markiere die Wortarten." />
          <div className="chips" role="group" aria-label="Stifte">
            {WORTARTEN.map((kat) => (
              <button key={kat.name} type="button" className="chip stift" data-farbe={kat.farbe} aria-pressed={stift === kat} onClick={() => setStift(kat)}>
                {kat.name}
              </button>
            ))}
          </div>
          <p className="satz">
            {ZUORDNEN.map((w, i) => {
              const kat = zugeordnet[i]
              return (
                <span key={i}>
                  <span className="wort-mit-name" data-farbe={kat?.farbe}>
                    <button
                      type="button"
                      className="wort"
                      data-farbe={kat?.farbe}
                      aria-pressed={!!kat}
                      onClick={() =>
                        setZugeordnet((z) => {
                          const neu = { ...z }
                          if (neu[i] === stift) delete neu[i]
                          else neu[i] = stift
                          return neu
                        })
                      }
                    >
                      {w}
                    </button>
                    <span className="wort-mit-name__name">{kat ? kat.name : ' '}</span>
                  </span>{' '}
                </span>
              )
            })}
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

        <section className="karte" aria-labelledby="t-pixel">
          <h2 id="t-pixel">Pixel-Grafik</h2>
          <p>Dieselbe Münze, 2-, 3- und 4-mal so groß. Die Kanten bleiben scharf.</p>
          <p style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
            <Sprite grafik={GRAFIK.muenze} mal={2} />
            <Sprite grafik={GRAFIK.muenze} mal={3} />
            <Sprite grafik={GRAFIK.muenze} mal={4} titel="Münze" />
          </p>
        </section>

        <section className="karte" aria-labelledby="t-farben">
          <h2 id="t-farben">Jede Farbe hat eine Bedeutung</h2>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 9rem), 1fr))', gap: 'var(--space-md)' }}>
            {FARBEN.map((f) => (
              <li key={f.name} style={{ display: 'grid', gap: 'var(--space-2xs)' }}>
                <span style={{ height: 56, borderRadius: 'var(--radius-feld)', border: 'var(--kontur) solid var(--color-holz)', background: `var(${f.variable})` }} />
                <strong>{f.name}</strong>
                <span className="leise">{f.wofuer}</span>
              </li>
            ))}
          </ul>
          <h2>Überschriften in Fraunces</h2>
          <h3>Anweisungen in Nunito</h3>
          <p>Texte ebenfalls in Nunito, mindestens 18 Pixel groß, damit man sie auf dem iPad gut lesen kann.</p>
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
              <tr><td>Fuchs-07</td><td>12</td><td><SterneText stufe={2} /></td></tr>
              <tr><td>Eule-12</td><td>8</td><td><SterneText stufe={1} /></td></tr>
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
