import { useState, type ReactNode } from 'react'
import { kategorieAus } from '../lib/kategorien'
import { lueckenBreite } from '../lib/lueckentext'
import type { Antwort, Antworten, AuswahlTeilOhneLoesung, LueckentextInhaltSchueler, Pruefergebnis } from '../lib/typen'
import { Eingabe } from './Eingabe'
import { ReiheAnzeige } from './ReiheAnzeige'
import { VersionenAnzeige } from './VersionenAnzeige'

type Props = {
  inhalt: LueckentextInhaltSchueler
  antworten: Antworten
  onAntwort: (id: number, wert: Antwort) => void
  ergebnis?: Pruefergebnis | null
  /** Lösungen pro Stelle (nur nach "Lösung ansehen") */
  loesungen?: Record<number, string[]> | null
  gesperrt?: boolean
}

/** Farbe eines Fachbegriffs (z. B. „Subjekt“ → blau); eigene Kategorien der Lehrkraft bleiben neutral */
const farbeVon = (kategorie: string) => kategorieAus(kategorie)?.farbe

/** Satzzeichen direkt hinter einer Stelle – sie bleiben am Wort hängen, statt allein in die nächste Zeile zu rutschen */
const SATZZEICHEN = /^[.,;:!?…)“"»]+/

// alt (Übungswiese), im Pixel-Look: Text mit Lücken (.luecke), Auswahl (.chip), antippbaren Wörtern (.wort)
// und – beim Zuordnen – Stiften für die Kategorien.
// Nach dem Prüfen: richtige Stellen grün mit ✓ (gesperrt), andere Pfirsich mit ↻ – nie rot.
export function LueckentextAnzeige({ inhalt, antworten, onAntwort, ergebnis, loesungen, gesperrt }: Props) {
  const status = new Map(ergebnis?.luecken.map((l) => [l.id, l.richtig]))
  const kategorien = inhalt.kategorien ?? []
  const mitStiften = kategorien.length > 0 && inhalt.teile.some((t) => t.t === 'einheit')
  // Gewählter Stift (Kategorie); zu Beginn der erste
  const [stift, setStift] = useState<string>(kategorien[0] ?? '')
  const mitWoertern = inhalt.teile.some((t) => t.t === 'wort')

  // Format „Sätze verbessern“: Versionen untereinander
  const versionen = inhalt.teile.flatMap((t) => (t.t === 'versionen' ? [t] : []))
  if (versionen.length > 0)
    return <VersionenAnzeige teile={versionen} antworten={antworten} onAntwort={onAntwort} ergebnis={ergebnis} loesungen={loesungen} gesperrt={gesperrt} />

  // Format „Reihenfolge“: jeder Satz ist eine eigene Reihe zum Ordnen
  const reihen = inhalt.teile.flatMap((t) => (t.t === 'reihe' ? [t] : []))
  if (reihen.length > 0)
    return (
      <div className="reihen">
        {reihen.map((teil, nr) => {
          const varianten = Math.max(1, teil.varianten ?? 1)
          const a = antworten[teil.id]
          // Antwort: bei einer Variante eine Liste von Kennungen, bei mehreren eine Liste je Variante
          const gelegt: string[][] = !Array.isArray(a) ? [] : Array.isArray(a[0]) ? (a as string[][]).map((l) => l.map(String)) : [(a as string[]).map(String)]
          return (
            <ReiheAnzeige
              key={teil.id}
              teil={teil}
              nr={nr}
              gelegt={gelegt}
              onAenderung={(neu) => onAntwort(teil.id, varianten > 1 ? neu : neu[0])}
              ergebnisse={Array.from({ length: varianten }, (_, j) => ergebnis?.luecken.find((l) => l.id === teil.id && (l.variante ?? 0) === j))}
              loesung={loesungen?.[teil.id]}
              gesperrt={Boolean(gesperrt)}
            />
          )
        })}
      </div>
    )

  return (
    <>
      {mitWoertern && (
        <p>
          {inhalt.anzahl_fehler ? <strong>Finde {inhalt.anzahl_fehler} Fehler. </strong> : null}
          {inhalt.korrigieren ? 'Tippe ein Fehlerwort an und schreib die richtige Form daneben.' : 'Tippe die Wörter mit Fehlern an.'}
        </p>
      )}
      {mitStiften && (
        <div className="chips" role="group" aria-label="Stift wählen">
          {kategorien.map((k) => (
            <button key={k} type="button" className="chip stift" data-farbe={farbeVon(k)} aria-pressed={stift === k} disabled={gesperrt} onClick={() => setStift(k)}>
              {stift === k && <span aria-hidden="true">✓ </span>}
              {k}
            </button>
          ))}
        </div>
      )}
      <p className="satz">
        {inhalt.teile.map((teil, index) => {
          const vorher = inhalt.teile[index - 1]
          if (teil.t === 'text') return <span key={index}>{vorher && vorher.t !== 'text' ? teil.v.replace(SATZZEICHEN, '') : teil.v}</span>
          if (teil.t === 'reihe' || teil.t === 'versionen') return null
          const richtig = status.get(teil.id)
          const danach = inhalt.teile[index + 1]
          const anhang = danach?.t === 'text' ? SATZZEICHEN.exec(danach.v)?.[0] : undefined
          const zeichen = (
            <>
              {anhang && <span className="stelle__anhang">{anhang}</span>}
              {richtig === true && <span className="marke marke--richtig" aria-label="richtig">✓</span>}
              {richtig === false && <span className="marke marke--nochmal" aria-label="schau nochmal hin">↻</span>}
              {loesungen?.[teil.id] && <span className="loesung-anzeige">{loesungen[teil.id].join(' / ')}</span>}
            </>
          )
          const lueckeKlasse = richtig === true ? 'luecke luecke--richtig' : richtig === false ? 'luecke luecke--nochmal' : 'luecke'

          if (teil.t === 'wort') {
            const a = antworten[teil.id]
            const markiert = a === true || typeof a === 'string'
            const fertig = gesperrt || richtig === true
            return (
              <span key={index} className="stelle">
                <button
                  type="button"
                  className="wort"
                  aria-pressed={markiert}
                  aria-label={markiert ? `${teil.v}, als Fehler markiert` : teil.v}
                  disabled={fertig}
                  // Antippen markiert, erneutes Antippen nimmt die Markierung (und die Verbesserung) wieder weg
                  onClick={() => onAntwort(teil.id, !markiert)}
                >
                  {teil.v}
                </button>
                {markiert && inhalt.korrigieren && (
                  <>
                    <span aria-hidden="true">→</span>
                    <Eingabe
                      className={lueckeKlasse}
                      style={{ width: `${lueckenBreite(Math.max(teil.v.length, typeof a === 'string' ? a.length : 0))}ch` }}
                      aria-label={`Richtige Form für „${teil.v}“`}
                      value={typeof a === 'string' ? a : ''}
                      disabled={fertig}
                      autoFocus={a === true}
                      onChange={(e) => onAntwort(teil.id, e.target.value === '' ? true : e.target.value)}
                    />
                  </>
                )}
                {zeichen}
              </span>
            )
          }

          if (teil.t === 'einheit') {
            const wahl = typeof antworten[teil.id] === 'string' ? (antworten[teil.id] as string) : ''
            return (
              <span key={index} className="stelle">
                <span className="wort-mit-name" data-farbe={wahl ? farbeVon(wahl) : undefined}>
                  <button
                    type="button"
                    className="wort"
                    data-farbe={wahl ? farbeVon(wahl) : undefined}
                    aria-pressed={Boolean(wahl)}
                    aria-label={wahl ? `${teil.v}, markiert als ${wahl}` : teil.v}
                    disabled={gesperrt || richtig === true}
                    // Gleicher Stift nimmt die Markierung wieder weg, anderer Stift ersetzt sie
                    onClick={() => onAntwort(teil.id, wahl === stift ? '' : stift)}
                  >
                    {teil.v}
                  </button>
                  <span className="wort-mit-name__name" aria-hidden="true">{wahl || ' '}</span>
                </span>
                {zeichen}
              </span>
            )
          }

          if (teil.t === 'auswahl')
            return (
              <Auswahl
                key={index}
                teil={teil}
                dropdown={inhalt.darstellung === 'dropdown' && !teil.mehrfach}
                gewaehlt={Array.isArray(antworten[teil.id]) ? (antworten[teil.id] as number[]).map(Number) : []}
                onWahl={(neu) => onAntwort(teil.id, neu)}
                klasse={lueckeKlasse}
                gesperrt={gesperrt || richtig === true}
                zeichen={zeichen}
              />
            )

          const wert = typeof antworten[teil.id] === 'string' ? (antworten[teil.id] as string) : ''
          return (
            <span key={index} className="stelle">
              <Eingabe
                className={lueckeKlasse}
                style={{ width: `${lueckenBreite(Math.max(wert.length, 4))}ch` }}
                aria-label={`Lücke ${teil.id + 1}`}
                value={wert}
                disabled={gesperrt || richtig === true}
                onChange={(e) => onAntwort(teil.id, e.target.value)}
                enterKeyHint="next"
              />
              {teil.hinweis && <span className="luecke-hinweis">({teil.hinweis})</span>}
              {zeichen}
            </span>
          )
        })}
      </p>
    </>
  )
}

type AuswahlProps = {
  teil: AuswahlTeilOhneLoesung
  dropdown: boolean
  gewaehlt: number[]
  onWahl: (neu: number[]) => void
  klasse: string
  gesperrt: boolean
  zeichen: ReactNode
}

// Eine Auswahl-Stelle: Antippen (Standard, auch Mehrfachauswahl) oder Dropdown (nur Einfachauswahl).
function Auswahl({ teil, dropdown, gewaehlt, onWahl, klasse, gesperrt, zeichen }: AuswahlProps) {
  const beschriftung = `Auswahl ${teil.id + 1}${teil.mehrfach ? ' (mehrere Antworten richtig)' : ''}`
  if (dropdown)
    return (
      <span className="stelle">
        <select
          className={`${klasse} luecke--auswahl`}
          aria-label={beschriftung}
          value={gewaehlt[0] ?? ''}
          disabled={gesperrt}
          onChange={(e) => onWahl(e.target.value === '' ? [] : [Number(e.target.value)])}
        >
          <option value="">bitte wählen</option>
          {teil.optionen.map((o, nr) => (
            <option key={nr} value={nr}>
              {o}
            </option>
          ))}
        </select>
        {zeichen}
      </span>
    )

  function antippen(nr: number) {
    if (teil.mehrfach) onWahl(gewaehlt.includes(nr) ? gewaehlt.filter((x) => x !== nr) : [...gewaehlt, nr].sort((a, b) => a - b))
    else onWahl(gewaehlt[0] === nr ? [] : [nr])
  }

  return (
    <span className="stelle auswahl" role="group" aria-label={beschriftung}>
      {teil.mehrfach && <span className="leise">Mehrere sind richtig:</span>}
      {teil.optionen.map((o, nr) => (
        <button key={nr} type="button" className="chip" aria-pressed={gewaehlt.includes(nr)} disabled={gesperrt} onClick={() => antippen(nr)}>
          {gewaehlt.includes(nr) && <span aria-hidden="true">✓ </span>}
          {o}
        </button>
      ))}
      {zeichen}
    </span>
  )
}
