import { describe, expect, it } from 'vitest'
import { artikelBild, SORTE, SORTE_NAME } from './shop'

// Alle ids aus der Migration `shop` müssen ein Bild haben
const IDS = ['feld', 'karotte', 'salat', 'rettich', 'tomate', 'weizen', 'gurke', 'blumenkohl', 'rote_bete', 'aubergine', 'kuerbis',
  'sternfrucht', 'tulpe', 'rose', 'huhn', 'kuh', 'busch', 'blume_gelb', 'pilz', 'stein', 'blume_lila', 'pilzhaus', 'brunnen',
  'katze_rosa', 'katze_blau']

describe('artikelBild', () => {
  it('kennt jedes Angebot', () => {
    for (const id of IDS) expect(() => artikelBild(id)).not.toThrow()
  })
  it('wirft bei unbekannten ids', () => expect(() => artikelBild('einhorn')).toThrow())
})

describe('SORTE_NAME', () => {
  it('hat zu jeder Sorte einen Namen', () => expect(Object.keys(SORTE_NAME).sort()).toEqual(Object.keys(SORTE).sort()))
})
