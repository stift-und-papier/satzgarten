import type { CSSProperties, ReactNode } from 'react'
import { GRAFIK } from '../grafik'
import { Sprite } from './Sprite'

// Einstein, das Maskottchen (eigene Zeichnung der Lehrkraft). Nummer = Bild im Streifen src/grafik/einstein.png;
// Bild 1 (Augen zu) nutzt nur das Blinzeln. Eine traurige Pose gibt es bewusst nicht (Entscheidung 2026-11-11).
const POSEN = {
  freundlich: 0, // Begrüßung, normaler Zustand
  lob: 2, // „Super, alles richtig!“
  'freut-sich': 3, // Paket geschafft, Monster besiegt
  huch: 4, // erschrocken, z. B. wenn ein Monster auftaucht
  erklaert: 5, // Erklären, Tipps, „nochmal versuchen“
} as const
export type Pose = keyof typeof POSEN

/** Die Figur allein; reine Verzierung, für Vorlesehilfen unsichtbar. Blinzelt und atmet ruhig (aus bei „Bewegung reduzieren“). */
export function Einstein({ pose = 'freundlich', mal = 2 }: { pose?: Pose; mal?: number }) {
  // --zu: Lage des Blinzel-Bilds (Bild 1) für die Animation in bausteine.css
  const stil = { '--zu': `${-GRAFIK.einstein.bildBreite * mal}px` } as CSSProperties
  return (
    <span className={`einstein einstein--${pose}`} style={stil}>
      <Sprite grafik={GRAFIK.einstein} nummer={POSEN[pose]} mal={mal} />
    </span>
  )
}

/** Einstein mit Sprechblase daneben. Der Text der Blase wird vorgelesen, die Figur nicht. */
export function EinsteinSagt({ pose, children }: { pose?: Pose; children: ReactNode }) {
  return (
    <div className="einstein-sagt">
      <Einstein pose={pose} />
      <div className="sprechblase">{children}</div>
    </div>
  )
}
