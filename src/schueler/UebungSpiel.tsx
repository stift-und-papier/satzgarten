// Übungsumbau Schritt 8: eine Übung spielen (Pilot: Lückentext). Ablauf (Konzept Abschnitt 10):
// uebung_starten → je Runde einmal „Prüfen“ (runde_pruefen), danach Lösung sichtbar und „Weiter“ → Abschluss mit Münzen.
// Der Server wertet alles; die App zeigt nur. Ohne Internet bleibt die Eingabe stehen („Nochmal senden“).
import { useEffect, useState } from 'react'
import { Anweisung } from '../gemeinsam/Anweisung'
import { EinsteinSagt } from '../gemeinsam/Einstein'
import { LueckentextAnzeige } from '../gemeinsam/LueckentextAnzeige'
import { MuenzenPlus } from '../gemeinsam/MuenzenPlus'
import { fehlerText, istNetzwerkfehler } from '../lib/fehler'
import { supabase } from '../lib/supabase'
import type { Antwort, Antworten, Durchgang, Loesung, Pruefergebnis, RundeErgebnis, SchuelerAufgabe } from '../lib/typen'
import { Spielszene, type Schuss } from './Spielszene'

// Formate, die schon als Spiel laufen (Schritt 9 bindet die übrigen an)
const IM_SPIEL = new Set(['lueckentext'])

// Texte von Jazz (Schritt 3 und 8)
const TEXT_FREUND = 'Juhu, ihr seid jetzt Freunde! Das Monster hat sich über deine Herzen gefreut.'
const TEXT_MORGEN = 'Das Monster braucht noch etwas Zeit, um Freundschaft zu schließen. Morgen kannst du es noch einmal versuchen!'
// Vorschlag Claude (Schritt 8): schon befreundet, diesmal nicht alles richtig
const TEXT_SCHON_FREUND = 'Ihr seid schon Freunde. Morgen kannst du wieder mit dem Monster üben.'

type Props = {
  token: string
  paketId: string
  aufgabe: SchuelerAufgabe
  /** nach der letzten Runde: Startdaten neu laden (Münzen, Paketliste) */
  nachAbschluss: () => void
  naechste: string | null
  zumPaket: string
}

type Gespielt = { richtig: boolean; ergebnis: Pruefergebnis; loesung: Loesung }

const loesungenAus = (l: Loesung) => Object.fromEntries(l.luecken.map((x) => [x.id, x.loesungen]))

export function UebungSpiel({ token, paketId, aufgabe, nachAbschluss, naechste, zumPaket }: Props) {
  const [daten, setDaten] = useState<Durchgang | null>(null)
  const [ladeFehler, setLadeFehler] = useState<string | null>(null)
  const [index, setIndex] = useState(0)
  const [gespielt, setGespielt] = useState<Gespielt[]>([])
  const [antworten, setAntworten] = useState<Antworten>({})
  const [schuss, setSchuss] = useState<Schuss | null>(null)
  const [beschaeftigt, setBeschaeftigt] = useState(false)
  const [meldung, setMeldung] = useState<{ text: string; offline: boolean } | null>(null)
  // Abschluss kommt mit der letzten Runde, gezeigt wird er erst nach „Weiter“ (vorher fliegt noch das Herz)
  const [abschlussDaten, setAbschlussDaten] = useState<RundeErgebnis['abschluss']>(null)
  const [abschluss, setAbschluss] = useState<RundeErgebnis['abschluss']>(null)
  const [tippOffen, setTippOffen] = useState(false)

  const imSpiel = IM_SPIEL.has(aufgabe.typ)
  useEffect(() => {
    // noch nicht angebundene Formate: keinen Durchgang anlegen
    if (!imSpiel) return
    let aus = false
    void supabase.rpc('uebung_starten', { p_token: token, p_paket_id: paketId, p_aufgabe_id: aufgabe.id }).then(({ data, error }) => {
      if (aus) return
      if (error) return setLadeFehler(fehlerText(error))
      const d = data as Durchgang
      setDaten(d)
      // angefangener Durchgang: bei der ersten offenen Runde weitermachen
      if (d.status === 'offen') {
        setGespielt(d.gespielt)
        setIndex(Math.min(d.gespielt.length, d.runden.length - 1))
      }
    })
    return () => {
      aus = true
    }
  }, [token, paketId, aufgabe.id, imSpiel])

  if (!imSpiel) return <p className="karte">Diese Übung kommt bald.</p>
  if (ladeFehler) return <p className="karte" role="alert">{ladeFehler}</p>
  if (!daten) return <p className="karte" role="status">Einen Moment …</p>

  if (daten.status === 'morgen') {
    return (
      <>
        <Spielszene monsterName={daten.monster} schuss={null} befreundet={daten.befreundet} ende="morgen" />
        <div className="karte aufgabe">
          <p>{daten.befreundet ? TEXT_SCHON_FREUND : 'Heute hast du mit diesem Monster schon geübt. Morgen kannst du es noch einmal versuchen!'}</p>
          <div className="knopf-reihe">
            <a className="knopf knopf--haupt" href={zumPaket}>Zurück zum Paket</a>
          </div>
        </div>
      </>
    )
  }

  const runde = daten.runden[index]
  const jetzt = gespielt[index] as Gespielt | undefined
  const befreundetVorher = daten.befreundet
  const anzahl = daten.runden.length

  // ---------- Abschluss ----------
  if (abschluss) {
    const allesRichtig = gespielt.every((g) => g.richtig)
    const text = allesRichtig ? TEXT_FREUND : abschluss.befreundet ? TEXT_SCHON_FREUND : TEXT_MORGEN
    return (
      <>
        <Spielszene monsterName={daten.monster} schuss={null} befreundet={abschluss.befreundet} ende={allesRichtig ? 'freund' : 'morgen'} />
        <div className="karte aufgabe">
          <EinsteinSagt pose={allesRichtig ? 'freut-sich' : 'erklaert'}>
            <p>{text}</p>
          </EinsteinSagt>
          {abschluss.muenzen > 0 ? (
            <MuenzenPlus anzahl={abschluss.muenzen} />
          ) : (
            <p>Diesmal gibt es keine neuen Münzen. Versuche dich zu verbessern!</p>
          )}
          <div className="knopf-reihe">
            {naechste && (
              <a className="knopf knopf--haupt" href={naechste}>
                Zur nächsten Übung
              </a>
            )}
            <a className={naechste ? 'knopf' : 'knopf knopf--haupt'} href={zumPaket}>
              Zurück zum Paket
            </a>
          </div>
        </div>
      </>
    )
  }

  // ---------- eine Runde ----------
  const luecken = runde.inhalt.teile.filter((t) => t.t === 'luecke' || t.t === 'auswahl')
  const alleAusgefuellt = luecken.every((l) => {
    const a = antworten[l.id]
    return Array.isArray(a) ? a.length > 0 : typeof a === 'string' && a.trim() !== ''
  })

  async function pruefen() {
    if (!daten || daten.status !== 'offen') return
    setBeschaeftigt(true)
    setMeldung(null)
    const { data, error } = await supabase.rpc('runde_pruefen', { p_token: token, p_durchgang: daten.durchgang, p_nr: runde.nr, p_antworten: antworten })
    setBeschaeftigt(false)
    if (error) {
      setMeldung(
        istNetzwerkfehler(error)
          ? { text: 'Gerade ist kein Internet da. Deine Eingabe bleibt stehen. Tippe gleich auf „Nochmal senden“.', offline: true }
          : { text: fehlerText(error), offline: false },
      )
      return
    }
    const r = data as RundeErgebnis
    const neu = [...gespielt]
    neu[index] = { richtig: r.richtig, ergebnis: r.ergebnis, loesung: r.loesung }
    setGespielt(neu)
    setSchuss({ nr: index, treffer: r.richtig })
    if (r.abschluss) {
      setAbschlussDaten(r.abschluss)
      nachAbschluss()
    }
  }

  function weiter() {
    if (abschlussDaten || index === anzahl - 1) {
      setAbschluss(abschlussDaten ?? { befreundet: befreundetVorher, neu_befreundet: false, muenzen: 0, kontostand: 0 })
      return
    }
    setIndex(index + 1)
    setAntworten({})
    setTippOffen(false)
    setMeldung(null)
  }

  return (
    <>
      <Spielszene monsterName={daten.monster} schuss={schuss} befreundet={befreundetVorher} />
      <form
        className="karte aufgabe"
        onSubmit={(e) => {
          e.preventDefault()
          if (alleAusgefuellt && !beschaeftigt && !jetzt) void pruefen()
        }}
      >
        <header className="aufgabe__kopf">
          <h2>{aufgabe.titel}</h2>
          <span className="leise">
            Runde {index + 1} von {daten.runden.length}
          </span>
        </header>
        {aufgabe.anweisung && (
          <div className="aufgabe__anweisung">
            <Anweisung text={aufgabe.anweisung} farbig={aufgabe.farbig} />
          </div>
        )}
        <LueckentextAnzeige
          key={runde.nr}
          inhalt={runde.inhalt}
          antworten={antworten}
          onAntwort={(id: number, wert: Antwort) => {
            const neu: Antworten = { ...antworten, [id]: wert }
            if (wert === '' || (Array.isArray(wert) && wert.length === 0)) delete neu[id]
            setAntworten(neu)
          }}
          ergebnis={jetzt?.ergebnis}
          loesungen={jetzt && !jetzt.richtig ? loesungenAus(jetzt.loesung) : null}
          gesperrt={Boolean(jetzt)}
        />

        {aufgabe.hinweis && tippOffen && (
          <EinsteinSagt pose="erklaert">
            <p>
              <strong>Tipp: </strong>
              {aufgabe.hinweis}
            </p>
          </EinsteinSagt>
        )}
        {meldung && <p role="alert">{meldung.text}</p>}

        {/* Rückmeldung neben „Weiter“, damit bei 1024 × 768 nichts unter die Menüleiste rutscht */}
        <div className="knopf-reihe spiel-zeile">
          {jetzt &&
            (jetzt.richtig ? (
              <div className="rueckmeldung rueckmeldung--richtig" role="status">
                <span className="rueckmeldung__zeichen" aria-hidden="true">✓</span>
                <p>
                  <strong>Richtig!</strong> Dein Herz hat das Monster getroffen.
                </p>
              </div>
            ) : (
              <div className="rueckmeldung rueckmeldung--nochmal" role="status">
                <span className="rueckmeldung__zeichen" aria-hidden="true">!</span>
                <p>
                  <strong>Daneben.</strong> Schau dir die richtige Lösung an!
                </p>
              </div>
            ))}
          {aufgabe.hinweis && !jetzt && (
            <button type="button" className="knopf" onClick={() => setTippOffen(!tippOffen)} aria-expanded={tippOffen}>
              {tippOffen ? 'Tipp ausblenden' : 'Tipp anzeigen'}
            </button>
          )}
          {jetzt ? (
            <button type="button" className="knopf knopf--haupt" onClick={weiter} autoFocus>
              Weiter
            </button>
          ) : (
            <button type="submit" className="knopf knopf--haupt" disabled={!alleAusgefuellt || beschaeftigt}>
              {beschaeftigt ? 'Wird geprüft …' : meldung?.offline ? 'Nochmal senden' : 'Prüfen'}
            </button>
          )}
        </div>
        {!alleAusgefuellt && !jetzt && <p className="leise">Fülle alles aus, dann kannst du prüfen.</p>}
      </form>
    </>
  )
}
