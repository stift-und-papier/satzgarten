import type { CSSProperties, ReactNode } from 'react'
import { GRAFIK } from '../grafik'
import { Sprite } from './Sprite'

// Einstein, das Maskottchen (eigene Zeichnung der Lehrkraft). bild = Bild im Streifen src/grafik/einstein.png,
// zweites = Bild für die Bewegung (Augen zu bzw. Arm geneigt). Eine traurige Pose gibt es bewusst nicht (Entscheidung 2026-11-11).
// Bewegungen (Lehrkraft 2026-11-11): freundlich und erklaert blinzeln, lob winkt, freut-sich springt, huch zittert.
const POSEN = {
  freundlich: { bild: 0, zweites: 1 }, // Begrüßung, normaler Zustand
  lob: { bild: 2, zweites: 7 }, // „Super, alles richtig!“
  'freut-sich': { bild: 3 }, // Paket geschafft, Monster besiegt
  huch: { bild: 4 }, // erschrocken, z. B. wenn ein Monster auftaucht
  erklaert: { bild: 5, zweites: 6 }, // Erklären, Tipps, „nochmal versuchen“
  // Übungsumbau: wirft ein Herz. shortcut: Platzhalter = Bild 0, bis assets/einstein-schiessend.png eingebaut ist
  schiesst: { bild: 0 },
} as const
export type Pose = keyof typeof POSEN

/** Die Figur allein; reine Verzierung, für Vorlesehilfen unsichtbar. Bewegung aus bei „Bewegung reduzieren“. */
export function Einstein({ pose = 'freundlich', mal = 2 }: { pose?: Pose; mal?: number }) {
  const p: { bild: number; zweites?: number } = POSEN[pose]
  const lage = (n: number) => `${-GRAFIK.einstein.bildBreite * mal * n}px 0`
  // --bild / --bild2: Lage der beiden Bilder für die Animationen in bausteine.css
  const stil = { '--bild': lage(p.bild), '--bild2': lage(p.zweites ?? p.bild) } as CSSProperties
  return (
    <span className={`einstein einstein--${pose}`} style={stil}>
      <Sprite grafik={GRAFIK.einstein} nummer={p.bild} mal={mal} />
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
