import { describe, expect, it } from 'vitest'
import { belegung, blobTeil, GRAS_DEKO, grundKacheln, HEU, istGras, KUH_PLAETZE, SCHEUNE, SPALTEN, TROG, ZEILEN } from './landschaft'

describe('Landschaft', () => {
  it('nichts überdeckt sich, alles liegt auf Gras', () => {
    for (const [k, name] of belegung()) {
      const [x, y] = k.split(',').map(Number)
      expect(istGras(x, y), `${name} bei ${k}`).toBe(true)
    }
  })
  it('Kühe, Heu und Trog stehen innen in der Scheune', () => {
    const innen = (x: number, y: number) => x > SCHEUNE.x0 && x < SCHEUNE.x1 && y > SCHEUNE.y0 && y < SCHEUNE.y1
    for (const k of KUH_PLAETZE.slice(0, 2)) expect(innen(k.x, k.y) && innen(k.x + 1, k.y + 1)).toBe(true)
    for (const o of [HEU, TROG]) expect(innen(o.x, o.y) && innen(o.x + 1, o.y)).toBe(true)
  })
  it('Grasdeko liegt nur innen (alle 8 Nachbarn Gras)', () => {
    for (const d of GRAS_DEKO)
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) expect(istGras(d.x + dx, d.y + dy), `${d.x},${d.y}`).toBe(true)
  })
  it('Blob-Teile: Mitte, Ecke, Einzelstück', () => {
    const alles = () => true
    expect(blobTeil(5, 5, alles)).toBe(12)
    expect(blobTeil(0, 0, (x, y) => x >= 0 && y >= 0)).toBe(0) // links oben
    expect(blobTeil(0, 0, (x, y) => x === 0 && y === 0)).toBe(36) // allein
  })
  it('Hintergrund deckt jede Kachel mit Wasser', () => {
    expect(grundKacheln().filter((k) => k.grafik === 'wasser')).toHaveLength(SPALTEN * ZEILEN)
  })
})
