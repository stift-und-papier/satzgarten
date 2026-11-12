import { describe, expect, it } from 'vitest'
import { artikelBild, SORTE, SORTE_NAME, vorratDing } from './shop'

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

describe('vorratDing', () => {
  it('kennt Ernte und alle Eier und Milchsorten aus der Datenbank', () => {
    for (const s of ['karotte', 'sternfrucht', 'ei', 'ei_rosa', 'ei_blau', 'milch', 'milch_erdbeer', 'milch_blaubeer']) expect(vorratDing(s).name).toBeTruthy()
  })
})
