import { describe, expect, it } from 'vitest'
import { wortartAus } from './wortarten'

describe('wortartAus', () => {
  it('erkennt die Vorgaben der Lehrkraft', () => {
    expect(wortartAus('Nomen')).toBe('nomen')
    expect(wortartAus('Substantive')).toBe('nomen')
    expect(wortartAus('Verben')).toBe('verb')
    expect(wortartAus('Adjektiv')).toBe('adjektiv')
    expect(wortartAus('Artikel')).toBe('artikel')
    expect(wortartAus('Pronomen')).toBe('pronomen')
  })
  it('erkennt die übrigen Wortarten und Schreibweisen', () => {
    expect(wortartAus(' präpositionen ')).toBe('praeposition')
    expect(wortartAus('Subjunktion')).toBe('konjunktion')
    expect(wortartAus('Partikel')).toBe('interjektion')
    expect(wortartAus('Adverbien')).toBe('adverb')
    expect(wortartAus('Zahlwörter')).toBe('numerale')
    expect(wortartAus('Pronomina')).toBe('pronomen')
    expect(wortartAus('Zahlwort')).toBe('numerale')
  })
  it('lässt andere Kategorien ohne Wortart-Farbe', () => {
    expect(wortartAus('Subjekt')).toBe(null)
    expect(wortartAus('Verbgruppe')).toBe(null)
    expect(wortartAus('Adverbiale')).toBe(null)
    expect(wortartAus('Prädikat')).toBe(null)
  })
})
