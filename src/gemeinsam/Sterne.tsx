// Sterne für die Arbeitsstufe (1–3). Eigene Zeichnung nach refrences/sterne.jpg: dicker, runder Stern,
// Gold mit dunkelbraunem Rand, heller Glanz oben, heller Rand außen; leere Sterne dunkelbraun.
// Die Stufe steht nur für Vorlesehilfen als Text („Stufe 2 von 3“), sichtbar sind nur die Sterne.

// Sternspitzen um den Mittelpunkt (16|17): außen Radius 13, innen 7 – ergibt einen „pummeligen“ Stern
const PUNKTE = Array.from({ length: 10 }, (_, i) => {
  const r = i % 2 === 0 ? 13 : 7
  const w = (Math.PI / 5) * i - Math.PI / 2
  return `${(16 + r * Math.cos(w)).toFixed(2)},${(17 + r * Math.sin(w)).toFixed(2)}`
}).join(' ')

function Stern({ voll }: { voll: boolean }) {
  return (
    <svg className="stern" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <polygon points={PUNKTE} className="stern__rand-aussen" />
      <polygon points={PUNKTE} className={voll ? 'stern__koerper stern__koerper--voll' : 'stern__koerper'} />
      {voll && <ellipse cx="16" cy="13.5" rx="5" ry="2.6" className="stern__glanz" />}
    </svg>
  )
}

export function Sterne({ stufe }: { stufe: 1 | 2 | 3 }) {
  return (
    <span className="sterne" role="img" aria-label={`Stufe ${stufe} von 3`}>
      {[1, 2, 3].map((i) => (
        <Stern key={i} voll={i <= stufe} />
      ))}
    </span>
  )
}

/** Für die Lehrkraft-Ansicht: Stufe als ★/☆-Zeichen (Text, passt in Tabellen). */
export function SterneText({ stufe }: { stufe: 1 | 2 | 3 }) {
  return (
    <span className="sterne-text" role="img" aria-label={`Stufe ${stufe} von 3`}>
      {'★'.repeat(stufe) + '☆'.repeat(3 - stufe)}
    </span>
  )
}
