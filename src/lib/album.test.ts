import { describe, expect, it } from 'vitest'
import { GRAFIK, STICKER_NUMMER } from '../grafik'
import { klebestellen } from './album'
import { MONSTER } from './monster'
import { OBSTBAUM, SORTE } from './shop'

describe('Sammelalbum', () => {
  it('hat für jede Pflanze, jedes Tier, jede Deko und jedes Monster einen Sticker', () => {
    const deko = Object.keys(GRAFIK).filter((n) => n.startsWith('deko_')).map((n) => n.slice(5))
    const ids = [...Object.keys(SORTE), ...Object.keys(OBSTBAUM), 'huhn', 'kuh', 'brunnen', ...deko, ...Object.keys(MONSTER).map((m) => `monster_${m}`)]
    expect(ids.filter((id) => STICKER_NUMMER[id] === undefined)).toEqual([])
  })

  it('zeigt nur befreundete Monster mit Namen, die anderen als leere Stelle', () => {
    const stellen = klebestellen([
      { id: 'huhn', art: 'tier', gesammelt: false, name: null },
      { id: 'gespenst', art: 'monster', gesammelt: true, name: null },
    ])
    expect(stellen[0].id).toBe('huhn')
    const monster = stellen.filter((e) => e.art === 'monster')
    expect(monster).toHaveLength(Object.keys(MONSTER).length)
    expect(monster.filter((e) => e.gesammelt)).toEqual([{ id: 'monster_gespenst', art: 'monster', gesammelt: true, name: 'Gespenst' }])
    expect(monster.filter((e) => !e.gesammelt).every((e) => e.name === null)).toBe(true)
  })
})
