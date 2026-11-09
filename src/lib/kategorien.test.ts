import { describe, expect, it } from 'vitest'
import { fachbegriffeFaerben, kategorieAus } from './kategorien'

const farbe = (begriff: string) => kategorieAus(begriff)?.farbe ?? null

describe('kategorieAus', () => {
  it('Wortarten nach Vorgabe der Lehrkraft', () => {
    expect(farbe('Nomen')).toBe('blau')
    expect(farbe('Substantive')).toBe('blau')
    expect(farbe('Verben')).toBe('rot')
    expect(farbe('Adjektiv')).toBe('gruen')
    expect(farbe('Artikel')).toBe('hellblau')
    expect(farbe('Pronomen')).toBe('lila')
  })
  it('weitere Schreibweisen', () => {
    expect(kategorieAus(' präpositionen ')?.name).toBe('Präposition')
    expect(kategorieAus('Subjunktion')?.name).toBe('Konjunktion')
    expect(kategorieAus('Adverbien')?.name).toBe('Adverb')
    expect(kategorieAus('Zahlwörter')?.name).toBe('Numerale')
    expect(kategorieAus('Pronomina')?.name).toBe('Pronomen')
  })
  it('Satzglieder', () => {
    expect(kategorieAus('Subjekt')?.gruppe).toBe('satzglied')
    expect(farbe('Prädikate')).toBe('rot')
    expect(kategorieAus('Adverbiale')?.name).toBe('Adverbiale')
    expect(kategorieAus('adverbiale Bestimmung')?.name).toBe('Adverbiale')
    expect(kategorieAus('Temporaladverbial')?.name).toBe('Adverbiale')
    expect(kategorieAus('Dativobjekte')?.name).toBe('Dativobjekt')
  })
  it('Zeitformen', () => {
    expect(kategorieAus('Präteritum')?.name).toBe('Präteritum')
    expect(kategorieAus('Futur II')?.name).toBe('Futur II')
    expect(kategorieAus('Futur 1')?.name).toBe('Futur I')
    expect(kategorieAus('Plusquamperfekt')?.name).toBe('Plusquamperfekt')
  })
  it('lässt andere Wörter ohne Farbe', () => {
    expect(kategorieAus('Verbgruppe')).toBe(null)
    expect(kategorieAus('Haus')).toBe(null)
    expect(kategorieAus('Objektiv')).toBe(null)
  })
})

describe('fachbegriffeFaerben', () => {
  it('färbt Fachbegriffe in der Anweisung', () => {
    const teile = fachbegriffeFaerben('Tippe alle Verben an.')
    expect(teile.map((t) => t.text)).toEqual(['Tippe alle ', 'Verben', ' an.'])
    expect(teile[1].kategorie?.farbe).toBe('rot')
  })
  it('erkennt Begriffe aus zwei Wörtern', () => {
    const teile = fachbegriffeFaerben('Setze den Satz ins Futur II und markiere die adverbiale Bestimmung.')
    expect(teile.filter((t) => t.kategorie).map((t) => t.text)).toEqual(['Futur II', 'adverbiale Bestimmung'])
  })
  it('lässt Texte ohne Fachbegriffe unverändert', () => {
    expect(fachbegriffeFaerben('Lies den Text.')).toEqual([{ text: 'Lies den Text.' }])
  })
})
