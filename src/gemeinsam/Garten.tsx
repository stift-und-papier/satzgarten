// Garten-Bausteine (Aufgabe 6, Entwurf): eigene Zeichnungen, Blick schräg von oben, keine Gesichter.
// Farben über Klassen .g__* (garten.css) aus den Tokens --color-erde, --color-pflanze … in tokens.css.
// Alle Bilder sind aria-hidden; die Bedeutung steht im aria-label des Beets bzw. im Text daneben.

export type Stufe = 'samen' | 'spross' | 'pflanze' | 'bluete'

export const STUFEN: { stufe: Stufe; name: string }[] = [
  { stufe: 'samen', name: 'Samen' },
  { stufe: 'spross', name: 'Spross' },
  { stufe: 'pflanze', name: 'Pflanze' },
  { stufe: 'bluete', name: 'Blüte' },
]

function Blatt({ x, y, seite, groesse = 1 }: { x: number; y: number; seite: 1 | -1; groesse?: number }) {
  const l = 14 * groesse * seite
  const h = 7 * groesse
  return (
    <g>
      <path d={`M${x} ${y}c${l * 0.3} ${-h} ${l * 0.8} ${-h} ${l} ${-h * 0.4}c${-l * 0.3} ${h * 0.9} ${-l * 0.8} ${h * 0.9} ${-l} ${h * 0.4}Z`} className="g__blatt" />
      <path d={`M${x} ${y}l${l * 0.75} ${-h * 0.45}`} className="g__ader" />
    </g>
  )
}

/** Sonnenblume in vier Stufen. Boden bei y = 88. */
export function Pflanze({ stufe }: { stufe: Stufe }) {
  const blaetter = Array.from({ length: 12 }, (_, i) => (i * 30 * Math.PI) / 180)
  return (
    <svg className="pflanze" viewBox="0 0 80 100" aria-hidden="true" focusable="false">
      <ellipse cx="40" cy="89" rx="16" ry="5" className="g__huegel" />
      {stufe === 'samen' && <path d="M35 86c0-5 3-8 5-8s5 3 5 8Z" className="g__samen" />}
      {stufe === 'spross' && (
        <g>
          <path d="M40 88V68" className="g__stiel" />
          <Blatt x={40} y={70} seite={-1} />
          <Blatt x={40} y={70} seite={1} />
        </g>
      )}
      {stufe === 'pflanze' && (
        <g>
          <path d="M40 88V36" className="g__stiel" />
          <Blatt x={40} y={78} seite={-1} groesse={1.3} />
          <Blatt x={40} y={68} seite={1} groesse={1.3} />
          <Blatt x={40} y={56} seite={-1} />
          <Blatt x={40} y={48} seite={1} />
          <ellipse cx="40" cy="32" rx="6" ry="7" className="g__knospe" />
        </g>
      )}
      {stufe === 'bluete' && (
        <g>
          <path d="M40 88V34" className="g__stiel" />
          <Blatt x={40} y={78} seite={-1} groesse={1.3} />
          <Blatt x={40} y={68} seite={1} groesse={1.3} />
          <Blatt x={40} y={56} seite={-1} />
          <Blatt x={40} y={48} seite={1} />
          {blaetter.map((w, i) => (
            <ellipse key={i} cx={40 + 13 * Math.cos(w)} cy={26 + 13 * Math.sin(w)} rx="6.5" ry="3.6"
              transform={`rotate(${(i * 30).toFixed(0)} ${(40 + 13 * Math.cos(w)).toFixed(2)} ${(26 + 13 * Math.sin(w)).toFixed(2)})`} className="g__bluete" />
          ))}
          <circle cx="40" cy="26" r="8.5" className="g__bluete-mitte" />
          <path d="M36 23h.1M41 21h.1M44 26h.1M38 29h.1M42 30h.1" className="g__punkte" />
        </g>
      )}
    </svg>
  )
}

/** Ein Beet. Später antippbar (pflanzen, umsetzen); jetzt nur Anzeige. */
export function Beet({ nummer, stufe }: { nummer: number; stufe?: Stufe }) {
  const name = stufe ? STUFEN.find((s) => s.stufe === stufe)?.name : undefined
  return (
    <button type="button" className="beet" aria-label={stufe ? `Beet ${nummer}: Sonnenblume, ${name}` : `Beet ${nummer}: frei`}>
      {stufe && <Pflanze stufe={stufe} />}
    </button>
  )
}

/** Samentüte mit Bild der Sorte (Samen werden nie gezählt, nur gezeigt). */
export function Samentuete() {
  return (
    <svg className="tuete" viewBox="0 0 40 52" aria-hidden="true" focusable="false">
      <path d="M5 8h30v40H5Z" className="g__tuete" />
      <path d="M5 8l4-5h22l4 5" className="g__tuete" />
      <circle cx="20" cy="26" r="5" className="g__bluete-mitte" />
      {[0, 60, 120, 180, 240, 300].map((w) => (
        <ellipse key={w} cx={20 + 8.5 * Math.cos((w * Math.PI) / 180)} cy={26 + 8.5 * Math.sin((w * Math.PI) / 180)} rx="3.6" ry="2.2"
          transform={`rotate(${w} ${(20 + 8.5 * Math.cos((w * Math.PI) / 180)).toFixed(2)} ${(26 + 8.5 * Math.sin((w * Math.PI) / 180)).toFixed(2)})`} className="g__bluete" />
      ))}
      <path d="M11 41h18" className="g__ader" />
    </svg>
  )
}

/** Korb mit Samentüten: so viele Tüten wie Samen (nur Bild, keine Zahl). */
export function Korb({ tueten }: { tueten: number }) {
  return (
    <div className="korb">
      <div className="korb__tueten">
        {Array.from({ length: tueten }, (_, i) => (
          <Samentuete key={i} />
        ))}
      </div>
      <svg className="korb__korb" viewBox="0 0 120 50" aria-hidden="true" focusable="false">
        <path d="M6 6h108l-10 40H16Z" className="g__deko" />
        <path d="M10 18h100M13 30h94M24 6l4 40M48 6l2 40M72 6l-2 40M96 6l-4 40" className="g__flechten" />
        <path d="M2 6h116" className="g__rand" />
      </svg>
    </div>
  )
}

/** Deko: Gartenbank. */
export function Bank() {
  return (
    <svg className="deko" viewBox="0 0 100 70" aria-hidden="true" focusable="false">
      <path d="M18 40v24M82 40v24M24 46v18M76 46v18" className="g__bein" />
      <path d="M10 34h80l-6 12H16Z" className="g__deko" />
      <path d="M16 10h68v8H16ZM16 22h68v8H16Z" className="g__deko" />
      <path d="M22 18v16M78 18v16" className="g__bein" />
    </svg>
  )
}

/** Zaun oben am Garten (Muster aus Pfosten und zwei Latten). */
export function Zaun() {
  return (
    <svg className="zaun" aria-hidden="true" focusable="false">
      <defs>
        <pattern id="zaun-muster" width="44" height="40" patternUnits="userSpaceOnUse">
          <path d="M0 14h44M0 28h44" className="g__latte" />
          <path d="M16 38V8l6-5 6 5v30Z" className="g__deko" />
        </pattern>
      </defs>
      <rect width="100%" height="40" fill="url(#zaun-muster)" />
    </svg>
  )
}

/** Trittsteine als Weg. */
export function Weg() {
  return (
    <svg className="weg" viewBox="0 0 300 24" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
      {[20, 70, 125, 180, 232, 282].map((x, i) => (
        <ellipse key={x} cx={x} cy={i % 2 ? 14 : 10} rx="17" ry="8" className="g__stein" />
      ))}
    </svg>
  )
}
