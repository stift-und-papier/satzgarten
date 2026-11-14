// Buch für Sammelalbum und Shop (Jazz 2026-11-14): klappt beim Öffnen der Seite auf, Lesezeichen rechts wählen ein Kapitel,
// Pfeile in den unteren Ecken blättern um. Bild „Pixel Book Animation“ (umgefärbt, scripts/grafik-holen.mjs: 12 Bilder im Streifen).
// Alle Maße hängen an --bp (ein Buch-Pixel, bausteine.css), damit Buch, Sticker und Lesezeichen gemeinsam ganzzahlig wachsen.
import { useState, type CSSProperties, type ReactNode } from 'react'
import { GRAFIK } from '../grafik'
import { einzelbild, type Grafik } from '../lib/sprite'
import { Symbol } from './Symbol'

/** Pixel-Grafik, die mit dem Buch wächst (wie Sprite, aber Größe über --bp statt fester Zahl) */
export function BuchBild({ grafik, nummer = 0, className = '' }: { grafik: Grafik; nummer?: number; className?: string }) {
  const { x, y } = einzelbild(grafik, nummer)
  const stil = { '--b': grafik.bildBreite, '--h': grafik.bildHoehe, '--bb': grafik.breite, '--x': x, '--y': y, backgroundImage: `url(${grafik.url})` }
  return <span className={`buch-bild ${className}`} aria-hidden="true" style={stil as CSSProperties} />
}

type Phase = 'auf' | 'offen' | 'vor' | 'zurueck'
const ruhig = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function Buch({
  titel, zurueck, kapitel, aktiv, seite, seiten, onWechsel, links, rechts,
}: {
  titel: string
  /** Knopf auf der Ecke oben links: aus dem Buch heraus */
  zurueck: { href: string; name: string }
  /** Lesezeichen: Name (für Vorlesehilfen) und Bild */
  kapitel: { titel: string; bild: Grafik }[]
  aktiv: number
  /** aufgeschlagene Doppelseite im Kapitel (ab 0) und Anzahl der Doppelseiten */
  seite: number
  seiten: number
  onWechsel: (kapitel: number, seite: number) => void
  links: ReactNode
  rechts: ReactNode
}) {
  const [phase, setPhase] = useState<Phase>(() => (ruhig() ? 'offen' : 'auf'))
  const [ziel, setZiel] = useState<[number, number] | null>(null)

  function blaettern(k: number, s: number, richtung: 'vor' | 'zurueck') {
    if (phase !== 'offen' || (k === aktiv && s === seite)) return
    if (ruhig()) return onWechsel(k, s)
    setZiel([k, s])
    setPhase(richtung)
  }
  function fertig() {
    if (ziel) onWechsel(...ziel)
    setZiel(null)
    setPhase('offen')
  }

  return (
    <div className="buch" data-phase={phase}>
      {/* Das Holzschild mit dem Titel hätte das Buch aus dem Bildschirm geschoben (iPad quer): Titel nur für Vorlesehilfen */}
      <h1 className="buch__titel">{titel}</h1>
      <a className="holzknopf buch__pfeil buch__zurueck" href={zurueck.href} aria-label={zurueck.name}>
        <Symbol name="haus" />
      </a>
      <div className="buch__reiter" role="group" aria-label="Kapitel wählen">
        {kapitel.map((k, i) => (
          <button key={k.titel} type="button" aria-label={k.titel} aria-pressed={i === aktiv} onClick={() => blaettern(i, 0, i > aktiv ? 'vor' : 'zurueck')}>
            <BuchBild grafik={GRAFIK.lesezeichen} nummer={i % 4} />
            <BuchBild grafik={k.bild} className="buch__reiter-bild" />
          </button>
        ))}
      </div>
      <span className="buch__bild" onAnimationEnd={fertig}>
        <BuchBild grafik={GRAFIK.buch} nummer={3} />
      </span>
      <div className="buch__seite buch__seite--links">{links}</div>
      <div className="buch__seite buch__seite--rechts">{rechts}</div>
      {seite > 0 && (
        <button type="button" className="holzknopf buch__pfeil buch__pfeil--zurueck" aria-label="Zurückblättern" onClick={() => blaettern(aktiv, seite - 1, 'zurueck')}>
          <Symbol name="zurueck" />
        </button>
      )}
      {seite < seiten - 1 && (
        <button type="button" className="holzknopf buch__pfeil buch__pfeil--vor" aria-label="Weiterblättern" onClick={() => blaettern(aktiv, seite + 1, 'vor')}>
          <Symbol name="weiter" />
        </button>
      )}
    </div>
  )
}
