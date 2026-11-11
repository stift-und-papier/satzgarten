import { einzelbild, type Grafik } from '../lib/sprite'

/**
 * Pixel-Grafik, ganzzahlig vergrößert und scharf (keine verwaschenen Kanten).
 * `nummer` wählt ein Einzelbild aus einem Spritesheet. Ohne `titel` ist die Grafik reine Verzierung
 * und für Vorlesehilfen unsichtbar.
 */
export function Sprite({ grafik, nummer = 0, mal = 2, titel }: { grafik: Grafik; nummer?: number; mal?: number; titel?: string }) {
  const m = Math.max(1, Math.round(mal)) // nur ganze Vielfache, sonst werden Pixel ungleich breit
  const { x, y } = einzelbild(grafik, nummer)
  return (
    <span
      className="sprite"
      role={titel ? 'img' : undefined}
      aria-label={titel}
      aria-hidden={titel ? undefined : true}
      style={{
        width: grafik.bildBreite * m,
        height: grafik.bildHoehe * m,
        backgroundImage: `url(${grafik.url})`,
        backgroundSize: `${grafik.breite * m}px ${grafik.hoehe * m}px`,
        backgroundPosition: `${-x * m}px ${-y * m}px`,
      }}
    />
  )
}
