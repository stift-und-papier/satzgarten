import { describe, expect, it } from 'vitest'
import {
  ablagePlaetze, belegung, blobTeil, DEKO_PLAETZE, FELD_PLAETZE, FIGUR_START, GRAS_DEKO, grundKacheln, HEU, hindernisse, HUHN_PLAETZE, istGras, KUH_PLAETZE,
  nebenan, SCHEUNE, SPALTEN, tierFlaeche, TROG, weg, ZEILEN,
} from './landschaft'

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
  it('mit allem gekauft erreicht die Figur jedes Feld und jedes Tier (auch in der Scheune)', () => {
    const besetzt = hindernisse({ deko: DEKO_PLAETZE.length, brunnen: true, huehner: 4, kuehe: 4 })
    expect(besetzt.has(`${FIGUR_START.x},${FIGUR_START.y}`)).toBe(false)
    const ziele = [
      ...FELD_PLAETZE.map((o) => [o]),
      ...HUHN_PLAETZE.map((o) => tierFlaeche(o, 1)),
      ...KUH_PLAETZE.map((o) => tierFlaeche(o, 2)),
    ]
    for (const z of ziele) expect(weg(FIGUR_START, nebenan(z), besetzt), JSON.stringify(z[0])).not.toBeNull()
  })
  it('Weg geht um Hindernisse herum und schneidet keine Ecken', () => {
    const besetzt = new Set(['4,6', '5,5'])
    const pfad = weg({ x: 4, y: 5 }, (o) => o.x === 5 && o.y === 6, besetzt)!
    expect(pfad.at(-1)).toEqual({ x: 5, y: 6 })
    expect(pfad.length).toBeGreaterThan(1) // diagonal wäre zwischen den beiden Hindernissen durch
    expect(pfad.some((o) => besetzt.has(`${o.x},${o.y}`))).toBe(false)
    expect(weg({ x: 4, y: 5 }, (o) => o.x === 0 && o.y === 0, besetzt)).toBeNull() // Wasser
  })
})

describe('ablagePlaetze', () => {
  it('legt Dinge auf freie, verschiedene Kacheln neben den Ursprung', () => {
    const besetzt = hindernisse({ deko: DEKO_PLAETZE.length, brunnen: true, huehner: 4, kuehe: 4 })
    const huhn = tierFlaeche(HUHN_PLAETZE[0], 1)
    const plaetze = ablagePlaetze([huhn, huhn, huhn], besetzt, new Set())
    expect(new Set(plaetze.map((o) => `${o.x},${o.y}`)).size).toBe(3)
    for (const o of plaetze) {
      expect(besetzt.has(`${o.x},${o.y}`)).toBe(false)
      expect(istGras(o.x, o.y)).toBe(true)
      expect(Math.max(Math.abs(o.x - huhn[0].x), Math.abs(o.y - huhn[0].y))).toBeLessThanOrEqual(2)
    }
  })
  it('Ernte liegt auf dem leeren Feld, auf einem bepflanzten daneben', () => {
    const feld = FELD_PLAETZE[0]
    expect(ablagePlaetze([[feld]], new Set(), new Set())[0]).toEqual(feld)
    expect(ablagePlaetze([[feld]], new Set(), new Set([`${feld.x},${feld.y}`]))[0]).not.toEqual(feld)
  })
})
