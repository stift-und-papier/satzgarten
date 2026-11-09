import type { ReactNode } from 'react'

// Maskottchen „Blatthut“ (Gartengeist, Entwurf B, gewählt von der Lehrkraft am 2026-11-09).
// Eigene Zeichnung. Nur in der Schüleransicht. Die Figur ist für Vorlesehilfen unsichtbar (aria-hidden):
// Was sie sagt, steht als normaler Text in der Sprechblase.
// Farben über Klassen .geist__* (bausteine.css) aus den Tokens --color-geist-*.

export type Ausdruck = 'freundlich' | 'nachdenklich' | 'freut-sich' | 'zeigt'

const AUGEN_Y = 96

function Augen({ ausdruck }: { ausdruck: Ausdruck }) {
  if (ausdruck === 'freut-sich')
    // geschlossene, lachende Augen
    return <path d={`M46 ${AUGEN_Y + 1}q4-5 8 0 M66 ${AUGEN_Y + 1}q4-5 8 0`} className="geist__mund" />
  // Blickrichtung: nachdenklich nach oben, zeigt zur Seite (zur Sprechblase)
  const [dx, dy] = ausdruck === 'nachdenklich' ? [-1.5, -2] : ausdruck === 'zeigt' ? [2, 0] : [0, 0]
  return (
    <g transform={`translate(${dx} ${dy})`}>
      <circle cx="50" cy={AUGEN_Y} r="3.6" className="geist__auge" />
      <circle cx="70" cy={AUGEN_Y} r="3.6" className="geist__auge" />
      <circle cx="51.2" cy={AUGEN_Y - 1.3} r="1.1" className="geist__glanz" />
      <circle cx="71.2" cy={AUGEN_Y - 1.3} r="1.1" className="geist__glanz" />
    </g>
  )
}

function Mund({ ausdruck }: { ausdruck: Ausdruck }) {
  const y = AUGEN_Y + 7
  if (ausdruck === 'freut-sich') return <path d={`M54 ${y}q6 9 12 0Z`} className="geist__mund geist__mund--offen" />
  if (ausdruck === 'nachdenklich') return <path d={`M57 ${y + 1}q2-1.5 3 0t3 0`} className="geist__mund" />
  return <path d={`M56 ${y}q4 4 8 0`} className="geist__mund" />
}

// Ärmchen: [x, y, Drehung, Länge] links und rechts
const ARME: Record<Ausdruck, [number, number, number, number][]> = {
  freundlich: [[26, 104, -30, 6], [94, 104, 30, 6]],
  nachdenklich: [[26, 104, -30, 6], [74, 117, -15, 5]], // rechte Hand am Kinn
  'freut-sich': [[24, 84, 30, 6], [96, 84, -30, 6]], // beide Arme hoch
  zeigt: [[26, 104, -30, 6], [101, 96, 0, 10]], // rechter Arm zeigt zur Seite
}

export function Maskottchen({ ausdruck = 'freundlich' }: { ausdruck?: Ausdruck }) {
  // freut sich: hüpft ein kleines Stück hoch
  const hoch = ausdruck === 'freut-sich' ? -4 : 0
  return (
    <svg className="geist" viewBox="0 0 120 140" aria-hidden="true" focusable="false">
      <ellipse cx="60" cy="134" rx={hoch ? 28 : 32} ry="4" className="geist__boden" />
      <g transform={`translate(0 ${hoch})`}>
        <ellipse cx="46" cy="129" rx="9" ry="5" className="geist__koerper" />
        <ellipse cx="74" cy="129" rx="9" ry="5" className="geist__koerper" />
        <path d="M24 100c0-28 16-42 36-42s36 14 36 42c0 22-14 30-36 30s-36-8-36-30Z" className="geist__koerper" />
        <path d="M28 112c5 10 16 14 32 14s27-4 32-14c-7 6-18 8-32 8s-25-2-32-8Z" className="geist__schatten" />
        <ellipse cx="41" cy={AUGEN_Y + 7} rx="6" ry="3.5" className="geist__wange" />
        <ellipse cx="79" cy={AUGEN_Y + 7} rx="6" ry="3.5" className="geist__wange" />
        <Augen ausdruck={ausdruck} />
        <Mund ausdruck={ausdruck} />
        {ARME[ausdruck].map(([x, y, drehung, laenge], i) => (
          <ellipse key={i} cx={x} cy={y} rx={laenge} ry="4.5" transform={`rotate(${drehung} ${x} ${y})`} className="geist__koerper" />
        ))}
        {/* großes Blatt als Hut, Stiel rechts eingerollt; nachdenklich etwas schief */}
        <g transform={ausdruck === 'nachdenklich' ? 'rotate(-6 60 60)' : undefined}>
          <path d="M14 70C26 38 82 28 104 56c-22 12-62 20-90 14Z" className="geist__blatt" />
          <path d="M18 68C44 60 76 54 100 56 M40 63l-6-12 M58 60l-4-14 M76 57l-1-13" className="geist__ader" />
          <path d="M104 56c6-2 9 2 7 6s-7 3-6-1" className="geist__stiel" />
        </g>
      </g>
    </svg>
  )
}

/** Maskottchen mit Sprechblase. Der Text ist normaler, vorlesbarer Inhalt. */
export function MaskottchenSagt({ ausdruck = 'freundlich', children }: { ausdruck?: Ausdruck; children: ReactNode }) {
  return (
    <div className="maskottchen-sagt">
      <Maskottchen ausdruck={ausdruck} />
      <div className="sprechblase">{children}</div>
    </div>
  )
}
