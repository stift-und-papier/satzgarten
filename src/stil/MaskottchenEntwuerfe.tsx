import { gehe } from '../lib/router'
import { Symbol } from '../gemeinsam/Symbol'

// Aufgabe 5: drei eigene Entwürfe eines Gartengeists zur Auswahl (Adresse #/stil/maskottchen).
// Eigene Zeichnungen, nur Stimmung nach refrences/maskottchen.jpg. Wird nach der Auswahl wieder entfernt.
// Farben nur über Klassen (tokens.css: --color-geist-*), die Figur ist für Vorlesehilfen unsichtbar.

/** Gesicht: Punktaugen mit Lichtpunkt, kleines Lächeln, rosige Wangen. y = Augenhöhe. */
function Gesicht({ y }: { y: number }) {
  return (
    <g>
      <ellipse cx="41" cy={y + 7} rx="6" ry="3.5" className="geist__wange" />
      <ellipse cx="79" cy={y + 7} rx="6" ry="3.5" className="geist__wange" />
      <circle cx="50" cy={y} r="3.6" className="geist__auge" />
      <circle cx="70" cy={y} r="3.6" className="geist__auge" />
      <circle cx="51.2" cy={y - 1.3} r="1.1" className="geist__glanz" />
      <circle cx="71.2" cy={y - 1.3} r="1.1" className="geist__glanz" />
      <path d={`M56 ${y + 7}q4 4 8 0`} className="geist__mund" />
    </g>
  )
}

/** Keimling mit zwei Blättern, Fuß bei (x|y) */
function Keimling({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <path d={`M${x} ${y}c0-6 1-11 0-16`} className="geist__stiel" />
      <path d={`M${x} ${y - 14}c-3-9-12-12-19-9 2 8 10 12 19 9Z`} className="geist__blatt" />
      <path d={`M${x} ${y - 14}c3-11 13-14 20-10-2 9-11 13-20 10Z`} className="geist__blatt" />
      <path d={`M${x} ${y - 14}l-11-5 M${x} ${y - 14}l12-6`} className="geist__ader" />
    </g>
  )
}

// A: Tautropfen mit Keimling – klein, rund, mit Füßchen
function Tau() {
  return (
    <svg className="geist" viewBox="0 0 120 140" aria-hidden="true" focusable="false">
      <ellipse cx="60" cy="134" rx="30" ry="4" className="geist__boden" />
      <ellipse cx="47" cy="129" rx="8" ry="5" className="geist__koerper" />
      <ellipse cx="73" cy="129" rx="8" ry="5" className="geist__koerper" />
      <path d="M60 34C44 56 24 74 24 98c0 20 16 32 36 32s36-12 36-32c0-24-20-42-36-64Z" className="geist__koerper" />
      <path d="M30 106c4 14 16 20 30 20s26-6 30-20c-6 9-17 13-30 13s-24-4-30-13Z" className="geist__schatten" />
      <ellipse cx="42" cy="78" rx="4.5" ry="9" transform="rotate(25 42 78)" className="geist__glanz" />
      <ellipse cx="24" cy="104" rx="6" ry="4.5" transform="rotate(-30 24 104)" className="geist__koerper" />
      <ellipse cx="96" cy="104" rx="6" ry="4.5" transform="rotate(30 96 104)" className="geist__koerper" />
      <Gesicht y={98} />
      <Keimling x={60} y={36} />
    </svg>
  )
}

// B: Rundling mit Blatt als Hut – gemütlich, schützt vor Regen
function Blatt() {
  return (
    <svg className="geist" viewBox="0 0 120 140" aria-hidden="true" focusable="false">
      <ellipse cx="60" cy="134" rx="32" ry="4" className="geist__boden" />
      <ellipse cx="46" cy="129" rx="9" ry="5" className="geist__koerper" />
      <ellipse cx="74" cy="129" rx="9" ry="5" className="geist__koerper" />
      <path d="M24 100c0-28 16-42 36-42s36 14 36 42c0 22-14 30-36 30s-36-8-36-30Z" className="geist__koerper" />
      <path d="M28 112c5 10 16 14 32 14s27-4 32-14c-7 6-18 8-32 8s-25-2-32-8Z" className="geist__schatten" />
      <ellipse cx="26" cy="104" rx="6" ry="4.5" transform="rotate(-30 26 104)" className="geist__koerper" />
      <ellipse cx="94" cy="104" rx="6" ry="4.5" transform="rotate(30 94 104)" className="geist__koerper" />
      <Gesicht y={96} />
      {/* großes Blatt quer über dem Kopf, Stiel rechts eingerollt */}
      <path d="M14 70C26 38 82 28 104 56c-22 12-62 20-90 14Z" className="geist__blatt" />
      <path d="M18 68C44 60 76 54 100 56 M40 63l-6-12 M58 60l-4-14 M76 57l-1-13" className="geist__ader" />
      <path d="M104 56c6-2 9 2 7 6s-7 3-6-1" className="geist__stiel" />
    </svg>
  )
}

// C: schwebender Geist mit Pusteblume – leicht, verträumt, ohne Füße
function Puste() {
  const strahlen = Array.from({ length: 12 }, (_, i) => {
    const w = (Math.PI / 6) * i
    return { x: 60 + 13 * Math.cos(w), y: 26 + 13 * Math.sin(w) }
  })
  return (
    <svg className="geist" viewBox="0 0 120 140" aria-hidden="true" focusable="false">
      <ellipse cx="60" cy="136" rx="22" ry="3.5" className="geist__boden" />
      <path d="M30 90c0-22 13-36 30-36s30 14 30 36v32q-7.5 9-15 0-7.5 9-15 0-7.5 9-15 0-7.5 9-15 0Z" className="geist__koerper" />
      <path d="M34 112q6 8 12 3 7 6 14 0 7 6 14 0 6 5 12-3v10q-7.5 9-15 0-7.5 9-15 0-7.5 9-15 0-7.5 9-15 0Z" className="geist__schatten" />
      <ellipse cx="42" cy="74" rx="4" ry="8" transform="rotate(25 42 74)" className="geist__glanz" />
      <ellipse cx="28" cy="98" rx="5.5" ry="4" transform="rotate(-35 28 98)" className="geist__koerper" />
      <ellipse cx="92" cy="98" rx="5.5" ry="4" transform="rotate(35 92 98)" className="geist__koerper" />
      <Gesicht y={90} />
      <path d="M60 56c-1-9 1-18 0-28" className="geist__stiel" />
      {strahlen.map((p, i) => (
        <g key={i}>
          <path d={`M60 26L${p.x.toFixed(1)} ${p.y.toFixed(1)}`} className="geist__ader" />
          <circle cx={p.x} cy={p.y} r="2.6" className="geist__pusteknopf" />
        </g>
      ))}
      <circle cx="60" cy="26" r="3" className="geist__blatt" />
    </svg>
  )
}

const ENTWUERFE = [
  { Figur: Tau, name: 'Entwurf A: Tautropfen', text: 'Ein Wassertropfen mit Keimling auf dem Kopf. Klein, rund, mit Füßchen. Passt zum Gießen.' },
  { Figur: Blatt, name: 'Entwurf B: Blatthut', text: 'Ein rundlicher Geist, der ein großes Blatt als Hut trägt. Gemütlich und etwas größer.' },
  { Figur: Puste, name: 'Entwurf C: Pusteblume', text: 'Ein schwebender Geist mit Pusteblume. Leicht und verträumt, ohne Füße.' },
]

export default function MaskottchenEntwuerfe() {
  return (
    <div className="garten-seite">
      <main className="garten-seite__inhalt">
        <div className="knopf-reihe">
          <button type="button" className="holzknopf" aria-label="Zurück zum Stilblatt" onClick={() => gehe('stil')}>
            <Symbol name="zurueck" />
          </button>
        </div>
        <div className="karte">
          <h1>Maskottchen: drei Entwürfe</h1>
          <p>Welcher Gartengeist soll die Schüler:innen begleiten? Danach bekommt er vier Gesichter und eine Sprechblase.</p>
        </div>
        {ENTWUERFE.map(({ Figur, name, text }) => (
          <div className="karte geist-entwurf" key={name}>
            <Figur />
            <div>
              <h2>{name}</h2>
              <p>{text}</p>
            </div>
          </div>
        ))}
      </main>
    </div>
  )
}
