import { describe, expect, it } from 'vitest'
import { belegung, GRAS_DEKO, grundKacheln, INSEL, KUH_PLAETZE, GEHEGE, neunerTeil, SPALTEN, ZEILEN } from './landschaft'

describe('Landschaft', () => {
  it('nichts überdeckt sich, alles liegt auf der Insel', () => {
    const belegt = belegung()
    for (const k of belegt.keys()) {
      const [x, y] = k.split(',').map(Number)
      expect(x >= INSEL.x0 && x <= INSEL.x1 && y >= INSEL.y0 && y <= INSEL.y1, k).toBe(true)
    }
  })
  it('Kühe stehen innen im Gehege', () => {
    for (const k of KUH_PLAETZE) {
      expect(k.x > GEHEGE.x0 && k.x + 1 < GEHEGE.x1 && k.y > GEHEGE.y0 && k.y + 1 < GEHEGE.y1).toBe(true)
    }
  })
  it('Rahmen-Teile', () => {
    const r = { x0: 1, y0: 1, x1: 3, y1: 3 }
    expect([neunerTeil(1, 1, r), neunerTeil(2, 1, r), neunerTeil(3, 3, r), neunerTeil(2, 2, r)]).toEqual([0, 1, 8, 4])
  })
  it('Hintergrund deckt jede Kachel mit Wasser', () => {
    expect(grundKacheln().filter((k) => k.grafik === 'wasser')).toHaveLength(SPALTEN * ZEILEN)
  })
})

describe('Grasdeko', () => {
  it('liegt nie auf dem Inselrand', () => {
    for (const d of GRAS_DEKO) expect(d.x > INSEL.x0 && d.x < INSEL.x1 && d.y > INSEL.y0 && d.y < INSEL.y1, `${d.x},${d.y}`).toBe(true)
  })
})
