import { useState } from 'react'
import type { Antwort, Antworten, Pruefergebnis, SchuelerAufgabe } from '../lib/typen'
import { Anweisung } from './Anweisung'
import { LueckentextAnzeige } from './LueckentextAnzeige'
import { Sterne } from './Sterne'

export type PruefAntwort = { ergebnis: Pruefergebnis; rueckmeldung: string | null; versuche: number }

type Props = {
  aufgabe: SchuelerAufgabe
  /** Antworten prüfen. Gibt null zurück, wenn gerade kein Internet da ist (Antwort wird später gesendet). */
  pruefen: (antworten: Antworten) => Promise<PruefAntwort | null>
  /** Lösung holen (erst nach 2 Versuchen erlaubt) */
  loesungHolen?: () => Promise<Record<number, string[]>>
  weiter?: { text: string; ziel: () => void }
}

// alt (Übungswiese), im Pixel-Look: Bearbeitung einer Aufgabe – für Schüler:innen und für die Vorschau der Lehrkraft.
// Erklärseiten haben eine eigene Darstellung (lesen, „Verstanden“).
export function AufgabeBearbeiten(props: Props) {
  return props.aufgabe.typ === 'erklaerung' ? <ErklaerSeite {...props} /> : <AufgabeUeben {...props} />
}

function Kopf({ aufgabe }: { aufgabe: SchuelerAufgabe }) {
  return (
    <header className="aufgabe__kopf">
      <h2>{aufgabe.titel}</h2>
      {aufgabe.typ !== 'erklaerung' && <Sterne stufe={aufgabe.stufe} />}
    </header>
  )
}

/** Text mit [hervorgehobenen] Wörtern (Beispielsätze der Erklärseite) */
function hervorheben(text: string) {
  return text.split(/\[([^\]]*)\]/).map((stueck, i) => (i % 2 === 1 ? <mark key={i}>{stueck}</mark> : stueck))
}

// Erklärseite: Erklärtext, Merkkasten, Beispiele. „Verstanden“ gilt als erledigt (zählt nie für den Lernstand).
function ErklaerSeite({ aufgabe, pruefen, weiter }: Props) {
  const [gelesen, setGelesen] = useState(aufgabe.geloest)
  const [beschaeftigt, setBeschaeftigt] = useState(false)
  const [meldung, setMeldung] = useState<string | null>(null)
  const e = aufgabe.inhalt.erklaerung ?? { text: '', merke: '', beispiele: [] }

  async function verstanden() {
    setBeschaeftigt(true)
    setMeldung(null)
    try {
      await pruefen({})
      setGelesen(true)
      weiter?.ziel()
    } catch (fehler) {
      setMeldung(fehler instanceof Error ? fehler.message : String(fehler))
    } finally {
      setBeschaeftigt(false)
    }
  }

  return (
    <article className="karte aufgabe">
      <Kopf aufgabe={aufgabe} />
      {e.text
        .split(/\n\s*\n/)
        .filter((a) => a.trim())
        .map((absatz, i) => (
          <p key={i}>{hervorheben(absatz.trim())}</p>
        ))}
      {e.merke.trim() && (
        <aside className="merkkasten">
          <strong>Merke</strong>
          <p>{hervorheben(e.merke.trim())}</p>
        </aside>
      )}
      {e.beispiele.length > 0 && (
        <>
          <h3>Beispiele</h3>
          <ul className="beispiele">
            {e.beispiele.map((b, i) => (
              <li key={i}>{hervorheben(b)}</li>
            ))}
          </ul>
        </>
      )}
      {meldung && <p role="alert">{meldung}</p>}
      <div className="knopf-reihe">
        {gelesen && <span className="marke marke--richtig">✓ Gelesen</span>}
        {gelesen && weiter ? (
          <button type="button" className="knopf knopf--haupt" onClick={weiter.ziel}>
            {weiter.text}
          </button>
        ) : (
          !gelesen && (
            <button type="button" className="knopf knopf--haupt" disabled={beschaeftigt} onClick={() => void verstanden()}>
              {beschaeftigt ? 'Einen Moment …' : 'Verstanden'}
            </button>
          )
        )}
      </div>
    </article>
  )
}

function AufgabeUeben({ aufgabe, pruefen, loesungHolen, weiter }: Props) {
  const [antworten, setAntworten] = useState<Antworten>({})
  const [ergebnis, setErgebnis] = useState<PruefAntwort | null>(null)
  const [versuche, setVersuche] = useState(aufgabe.versuche)
  const [tippOffen, setTippOffen] = useState(false)
  const [loesungen, setLoesungen] = useState<Record<number, string[]> | null>(null)
  const [loesungAngesehen, setLoesungAngesehen] = useState(aufgabe.loesung_angesehen)
  const [beschaeftigt, setBeschaeftigt] = useState(false)
  const [meldung, setMeldung] = useState<string | null>(null)

  // Lücken, Auswahl, Reihen und Versionen müssen alle beantwortet sein; beim Zuordnen und Fehlerfinden
  // mindestens ein Wort markiert (die übrigen gehören zu keiner Kategorie bzw. sind fehlerfrei).
  const luecken = aufgabe.inhalt.teile.filter((t) => t.t === 'luecke' || t.t === 'auswahl' || t.t === 'reihe' || t.t === 'versionen')
  const einheiten = aufgabe.inhalt.teile.filter((t) => t.t === 'einheit' || t.t === 'wort')
  const beantwortet = (id: number) => {
    const a = antworten[id]
    if (a === true) return true
    const reihe = aufgabe.inhalt.teile.find((t) => t.t === 'reihe' && t.id === id)
    if (reihe && reihe.t === 'reihe') {
      // Reihenfolge: in jeder geforderten Variante liegen alle Bausteine
      const varianten = Math.max(1, reihe.varianten ?? 1)
      const listen = !Array.isArray(a) ? [] : Array.isArray(a[0]) ? (a as string[][]) : [a as string[]]
      return Array.from({ length: varianten }, (_, j) => listen[j]?.length === reihe.bausteine.length).every(Boolean)
    }
    return Array.isArray(a) ? a.length > 0 : typeof a === 'string' && a.trim() !== ''
  }
  const alleAusgefuellt = luecken.every((l) => beantwortet(l.id)) && (einheiten.length === 0 || einheiten.some((e) => beantwortet(e.id)))
  const allesRichtig = ergebnis?.ergebnis.richtig === true

  async function beimPruefen() {
    setBeschaeftigt(true)
    setMeldung(null)
    try {
      const antwort = await pruefen(antworten)
      if (antwort) {
        setErgebnis(antwort)
        setVersuche(antwort.versuche)
      } else {
        setMeldung('Gerade ist kein Internet da. Deine Antwort ist gespeichert und wird geprüft, sobald die Verbindung wieder da ist.')
      }
    } catch (e) {
      setMeldung(e instanceof Error ? e.message : String(e))
    } finally {
      setBeschaeftigt(false)
    }
  }

  function beiEingabe(id: number, wert: Antwort) {
    // Leere Antworten (gelöschte Eingabe, aufgehobene Markierung) ganz entfernen
    const neu: Antworten = { ...antworten, [id]: wert }
    if (wert === '' || wert === false || (Array.isArray(wert) && wert.length === 0)) delete neu[id]
    setAntworten(neu)
    // Sobald eine markierte Stelle geändert wird, verschwindet ihre Markierung; richtige bleiben gesperrt.
    setErgebnis((alt) => alt && { ...alt, ergebnis: { ...alt.ergebnis, luecken: alt.ergebnis.luecken.filter((l) => l.id !== id || l.richtig) } })
  }

  async function beimLoesungAnsehen() {
    if (!loesungHolen) return
    const ok = window.confirm('Möchtest du dir die Lösung ansehen?\n\nDu kannst danach weiter üben. Diese Aufgabe zählt dann aber nicht mehr für deine Entwicklung.')
    if (!ok) return
    try {
      setLoesungen(await loesungHolen())
      setLoesungAngesehen(true)
    } catch (e) {
      setMeldung(e instanceof Error ? e.message : String(e))
    }
  }

  // Wie die Stellen heißen: „Lücke“, „Auswahl“ oder – gemischt – „Stelle“
  const arten = new Set<string>([...luecken, ...einheiten].map((l) => l.t))
  const wort = arten.has('reihe')
    ? { eins: 'Satz', viele: 'Bausteine' }
    : arten.has('versionen')
      ? { eins: 'Satz', viele: 'Sätze' }
      : arten.has('wort')
        ? { eins: 'Wort', viele: 'Fehler' }
        : arten.has('einheit')
          ? { eins: 'Wort', viele: 'Zuordnungen' }
          : arten.size > 1
            ? { eins: 'Stelle', viele: 'Stellen' }
            : arten.has('auswahl')
              ? { eins: 'Auswahl', viele: 'Antworten' }
              : { eins: 'Lücke', viele: 'Lücken' }

  // Rückmeldung: klar, ermutigend, nie „falsch“.
  const nochmalNummern = ergebnis?.ergebnis.luecken.flatMap((l) => (!l.richtig && l.id !== null ? [l.id + 1] : [])) ?? []
  const anzahlRichtig = ergebnis?.ergebnis.luecken.filter((l) => l.richtig).length ?? 0
  const gezaehlt = ergebnis?.ergebnis.luecken.length ?? 0
  // Fehler finden: nicht gefundene Fehler kommen ohne Nummer zurück – es wird nur ihre Anzahl genannt
  const fehlend = ergebnis?.ergebnis.luecken.filter((l) => l.id === null).length ?? 0
  const falschMarkiert = ergebnis?.ergebnis.luecken.filter((l) => l.id !== null && !l.richtig).length ?? 0
  const plaetze = ergebnis?.ergebnis.luecken.flatMap((l) => l.positionen ?? []) ?? []
  const plaetzeRichtig = plaetze.filter(Boolean).length
  const nochmalTitel = arten.has('reihe')
    ? plaetzeRichtig > 0
      ? 'Fast! Schau bei den Bausteinen mit ↻ nochmal hin.'
      : 'Schau nochmal hin.'
    : arten.has('wort')
      ? 'Fast! Schau nochmal genau hin.'
      : anzahlRichtig === 0 || nochmalNummern.length === 0
        ? 'Schau nochmal hin.'
        : arten.has('einheit')
          ? 'Fast! Schau bei den Wörtern mit ↻ nochmal hin.'
          : `Fast! Schau bei ${wort.eins} ${nochmalNummern.slice(0, -1).join(', ')}${nochmalNummern.length > 1 ? ' und ' : ''}${nochmalNummern[nochmalNummern.length - 1]} nochmal hin.`
  const nochmalText = arten.has('reihe')
    ? (ergebnis?.rueckmeldung ??
      (plaetzeRichtig > 0 ? `Schon ${plaetzeRichtig} von ${plaetze.length} Bausteinen stehen an der richtigen Stelle.` : 'Lies den Satz laut: Was passt an den Anfang?'))
    : arten.has('versionen')
      ? (ergebnis?.rueckmeldung ?? 'Lies die Hinweise unter den Versionen und entscheide noch einmal.')
      : arten.has('wort')
        ? [fehlend > 0 ? `Es fehlen noch ${fehlend} Fehler.` : '', falschMarkiert > 0 ? 'Bei den Wörtern mit ↻ stimmt etwas noch nicht.' : '', ergebnis?.rueckmeldung ?? '']
            .filter(Boolean)
            .join(' ')
        : (ergebnis?.rueckmeldung ??
          (anzahlRichtig === 0 ? 'Lies den Satz noch einmal in Ruhe – du schaffst das!' : `Schon ${anzahlRichtig} von ${gezaehlt} ${wort.viele} stimmen.`))

  return (
    <form
      className="karte aufgabe"
      onSubmit={(e) => {
        e.preventDefault()
        if (alleAusgefuellt && !beschaeftigt && !allesRichtig) void beimPruefen()
      }}
    >
      <Kopf aufgabe={aufgabe} />
      {aufgabe.anweisung && (
        <div className="aufgabe__anweisung">
          <Anweisung text={aufgabe.anweisung} farbig={aufgabe.farbig} />
        </div>
      )}

      <LueckentextAnzeige inhalt={aufgabe.inhalt} antworten={antworten} onAntwort={beiEingabe} ergebnis={ergebnis?.ergebnis} loesungen={loesungen} gesperrt={allesRichtig} />

      {ergebnis &&
        (allesRichtig ? (
          <div className="rueckmeldung rueckmeldung--richtig" role="status">
            <span className="rueckmeldung__zeichen" aria-hidden="true">✓</span>
            <p>
              <strong>Richtig! Gut gemacht.</strong> Alle {wort.viele} stimmen.
            </p>
          </div>
        ) : (
          <div className="rueckmeldung rueckmeldung--nochmal" role="status">
            <span className="rueckmeldung__zeichen" aria-hidden="true">!</span>
            <p>
              <strong>{nochmalTitel}</strong> {nochmalText}
            </p>
          </div>
        ))}

      {aufgabe.hinweis && tippOffen && (
        <aside className="tipp" aria-label="Tipp">
          <strong>Tipp: </strong>
          {aufgabe.hinweis}
        </aside>
      )}
      {meldung && <p role="alert">{meldung}</p>}

      <div className="knopf-reihe">
        {aufgabe.hinweis && (
          <button type="button" className="knopf" onClick={() => setTippOffen(!tippOffen)} aria-expanded={tippOffen}>
            {tippOffen ? 'Tipp ausblenden' : 'Tipp anzeigen'}
          </button>
        )}
        {!allesRichtig && loesungHolen && versuche >= 2 && !loesungen && (
          <button type="button" className="knopf" onClick={() => void beimLoesungAnsehen()}>
            Lösung ansehen
          </button>
        )}
        {!allesRichtig && (
          <button type="submit" className={weiter && loesungen ? 'knopf' : 'knopf knopf--haupt'} disabled={!alleAusgefuellt || beschaeftigt}>
            {beschaeftigt ? 'Wird geprüft …' : ergebnis ? 'Nochmal prüfen' : 'Prüfen'}
          </button>
        )}
        {weiter && (allesRichtig || loesungen) && (
          <button type="button" className="knopf knopf--haupt" onClick={weiter.ziel}>
            {weiter.text}
          </button>
        )}
      </div>
      {!alleAusgefuellt && !allesRichtig && (
        <p className="leise">
          {arten.has('reihe')
            ? 'Lege alle Bausteine in die Reihe'
            : arten.has('versionen')
              ? 'Wähle bei jedem Satz eine Version'
              : arten.has('wort')
                ? 'Tippe die Fehlerwörter an'
                : arten.has('einheit')
                  ? 'Markiere die passenden Wörter'
                  : arten.has('luecke')
                    ? 'Fülle alles aus'
                    : 'Wähle überall eine Antwort'}
          , dann kannst du prüfen.
        </p>
      )}
      {loesungAngesehen && !loesungen && <p className="leise">Du hast dir die Lösung schon einmal angesehen.</p>}
    </form>
  )
}
