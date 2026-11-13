import { useLayoutEffect, useRef, useState } from 'react'
import { falscheWoerter, vereinheitliche } from '../lib/diktat'
import type { Antworten, SchuelerAufgabe } from '../lib/typen'
import type { PruefAntwort } from './AufgabeBearbeiten'
import { MuenzenPlus } from './MuenzenPlus'
import { Anweisung } from './Anweisung'
import { EinsteinSagt } from './Einstein'
import { Eingabe } from './Eingabe'
import { Sterne } from './Sterne'

type Props = {
  aufgabe: SchuelerAufgabe
  pruefen: (antworten: Antworten) => Promise<PruefAntwort | null>
  weiter?: { text: string; ziel: () => void }
}

// Diktat (docs/SPEC-diktat.md): Abschreiben oder Merkdiktat. Nach dem letzten Zeichen bzw. Satz prüft der Server.
// Schüler:innen sehen nie Prozente: fehlerfrei / geschafft (ab 90 %) / nochmal üben.
export function DiktatAufgabe({ aufgabe, pruefen, weiter }: Props) {
  const [durchgang, setDurchgang] = useState(0)
  const [ergebnis, setErgebnis] = useState<PruefAntwort | null>(null)
  const [meldung, setMeldung] = useState<string | null>(null)
  const [abgabe, setAbgabe] = useState<Antworten | null>(null)
  const saetze = aufgabe.inhalt.saetze ?? []
  const merken = aufgabe.inhalt.modus === 'merken'
  // Rückmeldung (Lehrkraft 2026-11-11): Zahl der Fehler; Merkdiktat zusätzlich richtiger Text mit markierten Wörtern.
  // Abschreiben: falsche Zeichen; Merkdiktat: Wörter des Originals, die im ersten Versuch fehlten oder anders waren.
  const markiert = merken && abgabe ? saetze.map((s, i) => falscheWoerter(s, typeof abgabe[i] === 'string' ? (abgabe[i] as string) : '')) : []
  const anzahlFehler = !abgabe ? 0 : merken ? markiert.reduce((n, m) => n + m.length, 0) : Array.isArray(abgabe.fehler) ? abgabe.fehler.length : 0
  const fehlerSatz = `Du hast ${anzahlFehler === 1 ? 'einen Fehler' : `${anzahlFehler} Fehler`} gemacht.`

  async function fertig(antworten: Antworten) {
    setMeldung(null)
    setAbgabe(antworten)
    try {
      const a = await pruefen(antworten)
      if (a) setErgebnis(a)
      else setMeldung('Gerade ist kein Internet da. Dein Diktat ist gespeichert und wird geprüft, sobald die Verbindung wieder da ist.')
    } catch (e) {
      setMeldung(e instanceof Error ? e.message : String(e))
    }
  }

  function nochmal() {
    setErgebnis(null)
    setDurchgang((d) => d + 1)
  }

  const e = ergebnis?.ergebnis
  return (
    <section className="karte aufgabe">
      <header className="aufgabe__kopf">
        <h2>{aufgabe.titel}</h2>
        <Sterne stufe={aufgabe.stufe} />
      </header>
      {aufgabe.anweisung && (
        <div className="aufgabe__anweisung">
          <Anweisung text={aufgabe.anweisung} farbig={aufgabe.farbig} />
        </div>
      )}

      {!e &&
        (aufgabe.inhalt.modus === 'merken' ? (
          <Merkdiktat key={durchgang} saetze={saetze} onFertig={(a) => void fertig(a)} />
        ) : (
          <Abschreiben key={durchgang} text={vereinheitliche(saetze.join(' '))} onFertig={(a) => void fertig(a)} />
        ))}

      {e?.fehlerfrei ? (
        <EinsteinSagt pose="freut-sich">
          <strong>Fehlerfrei, super!</strong> Du hast den ganzen Text ohne einen einzigen Fehler geschrieben.
          <MuenzenPlus anzahl={ergebnis?.muenzen} />
        </EinsteinSagt>
      ) : e?.richtig ? (
        <div className="rueckmeldung rueckmeldung--richtig" role="status">
          <span className="rueckmeldung__zeichen" aria-hidden="true">✓</span>
          <p>
            <strong>Geschafft!</strong> {fehlerSatz} Wenn du es noch genauer schaffst, bekommst du nochmal Münzen.
          </p>
          <MuenzenPlus anzahl={ergebnis?.muenzen} />
        </div>
      ) : e ? (
        <div className="rueckmeldung rueckmeldung--nochmal" role="status">
          <span className="rueckmeldung__zeichen" aria-hidden="true">!</span>
          <p>
            <strong>Nochmal üben, du schaffst das!</strong> {fehlerSatz} {ergebnis?.rueckmeldung ?? 'Lass dir Zeit und schau genau hin.'}
          </p>
        </div>
      ) : null}
      {e && merken && !e.fehlerfrei && (
        <div className="diktat__loesung">
          <h3>So ist es richtig</h3>
          <p className="leise">Die Wörter mit ↻ hast du beim ersten Versuch anders geschrieben.</p>
          {saetze.map((s, i) => (
            <p key={i} className="diktat__satz">
              {s.split(' ').map((w, j) => (
                <span key={j}>
                  {j > 0 && ' '}
                  {markiert[i]?.includes(j) ? (
                    <span className="diktat__wort--nochmal">
                      {w}
                      <span className="marke marke--nochmal" aria-label="hier war ein Fehler">↻</span>
                    </span>
                  ) : (
                    w
                  )}
                </span>
              ))}
            </p>
          ))}
        </div>
      )}
      {meldung && <p role="alert">{meldung}</p>}

      {e && (
        <div className="knopf-reihe">
          {!e.fehlerfrei && (
            <button type="button" className={e.richtig && weiter ? 'knopf' : 'knopf knopf--haupt'} onClick={nochmal}>
              Nochmal versuchen
            </button>
          )}
          {weiter && e.richtig && (
            <button type="button" className="knopf knopf--haupt" onClick={weiter.ziel}>
              {weiter.text}
            </button>
          )}
        </div>
      )}
    </section>
  )
}

// ---------- Abschreiben: Textzeile nach TastenHeld (js/modes/textline.js, race.js; ChalkJunkie/TastenHeld) ----------
// Erledigt = Tinte, aktuelles Zeichen umrandet, Rest blass. Bei einem falschen Zeichen wartet der Cursor;
// je Zeichenstelle zählt höchstens ein Fehler. Ein zusätzliches Leerzeichen ist kein Fehler.
function Abschreiben({ text, onFertig }: { text: string; onFertig: (a: Antworten) => void }) {
  const zeichen = [...text]
  const [pos, setPos] = useState(0)
  const [fehler, setFehler] = useState<number[]>([])
  const [wackeln, setWackeln] = useState(0)
  const [daneben, setDaneben] = useState(false) // letztes Zeichen passte nicht (sichtbar auch ohne Wackeln)
  const feld = useRef<HTMLInputElement>(null)
  const schreibt = useRef(false) // Tottasten (^ ´) setzen erst nach dem zweiten Tastendruck ein Zeichen
  // aktueller Stand auch zwischen zwei Neuzeichnungen (sehr schnelles Tippen)
  const stand = useRef({ p: 0, f: [] as number[] })
  // Laufband (Lehrkraft 2026-11-11, wie TastenHeld textline.js „ticker“): aktuelles Zeichen bei etwa einem Drittel der Breite
  const zeile = useRef<HTMLDivElement>(null)
  const band = useRef<HTMLSpanElement>(null)
  useLayoutEffect(() => {
    const aktuell = band.current?.children[Math.min(pos, zeichen.length - 1)] as HTMLElement | undefined
    if (!aktuell || !zeile.current || !band.current) return
    const x = Math.max(0, aktuell.offsetLeft - zeile.current.clientWidth * 0.33)
    band.current.style.transform = `translateX(${-x}px)`
  }, [pos, zeichen.length])

  function tippen(eingabe: string) {
    let p = stand.current.p
    const f = [...stand.current.f]
    if (p >= zeichen.length) return
    let falsch = daneben
    for (const roh of eingabe) {
      for (const z of roh === ' ' ? [' '] : [...vereinheitliche(roh)]) {
        if (p >= zeichen.length) break
        if (z === zeichen[p]) {
          p++
          falsch = false
        } else if (z === ' ' && (p === 0 || zeichen[p - 1] === ' ')) continue
        else {
          if (!f.includes(p)) f.push(p)
          setWackeln((w) => w + 1)
          falsch = true
        }
      }
    }
    setDaneben(falsch)
    stand.current = { p, f }
    setPos(p)
    setFehler(f)
    if (p >= zeichen.length) onFertig({ fehler: f })
  }

  return (
    <div className="diktat" onClick={() => feld.current?.focus()}>
      <p className="leise">Tippe los, der Text läuft mit. Bei einem falschen Zeichen wartet der Cursor, bis es stimmt.</p>
      <div className="diktat__zeile" ref={zeile} role="img" aria-label={text}>
        <span className="diktat__band" ref={band}>
        {zeichen.map((z, i) => (
          <span
            key={i}
            aria-hidden="true"
            className={`diktat__z${i < pos ? ' diktat__z--fertig' : i === pos ? ` diktat__z--jetzt${daneben ? ' diktat__z--daneben' : ''}` : ''}${fehler.includes(i) && i < pos ? ' diktat__z--fehler' : ''}`}
            data-wackeln={i === pos && wackeln ? wackeln % 2 : undefined}
          >
            {z}
          </span>
        ))}
        </span>
      </div>
      <p className="leise" aria-live="polite">
        {pos} von {zeichen.length} Zeichen{daneben && '. Schau genau hin: Welches Zeichen kommt jetzt?'}
      </p>
      <Eingabe
        ref={feld}
        className="diktat__eingabe"
        aria-label="Hier tippen"
        autoFocus
        value=""
        onCompositionStart={() => {
          schreibt.current = true
        }}
        onCompositionEnd={(e) => {
          schreibt.current = false
          tippen(e.data)
        }}
        onChange={(e) => {
          if (!schreibt.current) tippen(e.target.value)
        }}
      />
    </div>
  )
}

// ---------- Merkdiktat: Satz merken → „Gemerkt“ → aus dem Gedächtnis tippen ----------
// Rückmeldung am Satzende; bei Fehlern werden die eigenen Wörter mit ↻ markiert und der Satz wird neu gemerkt.
// Gewertet wird der erste Versuch je Satz. Nach zwei Fehlversuchen darf man weiter.
function Merkdiktat({ saetze, onFertig }: { saetze: string[]; onFertig: (a: Antworten) => void }) {
  const [nr, setNr] = useState(0)
  const [phase, setPhase] = useState<'merken' | 'tippen' | 'nochmal'>('merken')
  const [eingabe, setEingabe] = useState('')
  const [erste, setErste] = useState<Record<string, string>>({})
  const [versuche, setVersuche] = useState(0)
  const [falsch, setFalsch] = useState<number[]>([])
  const soll = saetze[nr] ?? ''

  function naechster(neueErste: Record<string, string>) {
    setEingabe('')
    setVersuche(0)
    setFalsch([])
    if (nr + 1 >= saetze.length) onFertig(neueErste)
    else {
      setNr(nr + 1)
      setPhase('merken')
    }
  }

  function absenden() {
    if (!eingabe.trim()) return
    const neueErste = String(nr) in erste ? erste : { ...erste, [nr]: eingabe }
    setErste(neueErste)
    if (vereinheitliche(eingabe) === vereinheitliche(soll)) return naechster(neueErste)
    // eigene Wörter, die im Original so nicht vorkommen
    setFalsch(falscheWoerter(eingabe, soll))
    setVersuche((v) => v + 1)
    setPhase('nochmal')
  }

  return (
    <div className="diktat">
      <p className="leise">
        Teil {nr + 1} von {saetze.length}
      </p>
      {phase === 'merken' && (
        <>
          <p className="diktat__satz">{soll}</p>
          <div className="knopf-reihe">
            <button type="button" className="knopf knopf--haupt" autoFocus onClick={() => setPhase('tippen')}>
              Gemerkt
            </button>
          </div>
        </>
      )}
      {phase === 'tippen' && (
        <form
          className="diktat__formular"
          onSubmit={(e) => {
            e.preventDefault()
            absenden()
          }}
        >
          <Eingabe className="luecke diktat__feld" aria-label={`Teil ${nr + 1} aus dem Gedächtnis`} autoFocus value={eingabe} onChange={(e) => setEingabe(e.target.value)} />
          <div className="knopf-reihe">
            <button
              type="button"
              className="knopf"
              onClick={() => {
                setEingabe('')
                setPhase('merken')
              }}
            >
              Nochmal ansehen
            </button>
            <button type="submit" className="knopf knopf--haupt" disabled={!eingabe.trim()}>
              Fertig
            </button>
          </div>
          <p className="leise">„Nochmal ansehen“ löscht, was du schon getippt hast.</p>
        </form>
      )}
      {phase === 'nochmal' && (
        <>
          <p className="diktat__satz">
            {vereinheitliche(eingabe)
              .split(' ')
              .map((w, i) => (
                <span key={i}>
                  {i > 0 && ' '}
                  {falsch.includes(i) ? (
                    <span className="diktat__wort--nochmal">
                      {w}
                      <span className="marke marke--nochmal" aria-label="schau nochmal hin">↻</span>
                    </span>
                  ) : (
                    w
                  )}
                </span>
              ))}
          </p>
          <div className="rueckmeldung rueckmeldung--nochmal" role="status">
            <span className="rueckmeldung__zeichen" aria-hidden="true">!</span>
            <p>
              <strong>Fast!</strong> Bei den Wörtern mit ↻ stimmt etwas noch nicht. Merk dir den Satz noch einmal.
            </p>
          </div>
          <div className="knopf-reihe">
            {versuche >= 2 && (
              <button type="button" className="knopf" onClick={() => naechster(erste)}>
                Weiter zum nächsten Teil
              </button>
            )}
            <button
              type="button"
              className="knopf knopf--haupt"
              autoFocus
              onClick={() => {
                setEingabe('')
                setPhase('merken')
              }}
            >
              Nochmal merken
            </button>
          </div>
        </>
      )}
    </div>
  )
}
