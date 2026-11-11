import { describe, expect, it } from 'vitest'
import { abstand, falscheWoerter, saetzeTeilen, satzAnteil, vereinheitliche } from './diktat'

describe('vereinheitliche', () => {
  it('typografische Zeichen wie auf der Tastatur, Leerraum zusammengefasst', () => {
    expect(vereinheitliche(' „Hallo“ – sagte  er…\n')).toBe('"Hallo" - sagte er...')
    expect(vereinheitliche('Das ist’s')).toBe("Das ist's")
  })
  it('Groß-/Kleinschreibung bleibt', () => {
    expect(vereinheitliche('Hund')).not.toBe(vereinheitliche('hund'))
  })
})

describe('saetzeTeilen', () => {
  it('teilt nach . ? ! und an |', () => {
    expect(saetzeTeilen('Ich gehe. Kommst du? Ja! Wir laufen, | weil es regnet.')).toEqual([
      'Ich gehe.', 'Kommst du?', 'Ja!', 'Wir laufen,', 'weil es regnet.',
    ])
  })
  it('nicht nach Abkürzungen, Ordnungszahlen und einzelnen Buchstaben', () => {
    expect(saetzeTeilen('Wir essen z. B. Äpfel usw. am 3. Mai. Dann gehen wir.')).toEqual(['Wir essen z. B. Äpfel usw. am 3. Mai.', 'Dann gehen wir.'])
  })
  it('Anführungszeichen hinter dem Satzende gehören zum Satz', () => {
    expect(saetzeTeilen('Er rief: „Komm her!“ Dann ging er.')).toEqual(['Er rief: "Komm her!"', 'Dann ging er.'])
  })
})

describe('Vergleich', () => {
  it('abstand', () => {
    expect(abstand('Haus', 'Maus')).toBe(1)
    expect(abstand('weiß', 'weis')).toBe(1)
    expect(abstand('', 'abc')).toBe(3)
  })
  it('satzAnteil: gleich = 1, Leerzeichen und Typografie zählen nicht', () => {
    expect(satzAnteil('Er sagte „Hallo“.', 'Er  sagte "Hallo". ')).toBe(1)
    expect(satzAnteil('Das Haus', 'Das Maus')).toBeCloseTo(1 - 1 / 8)
    expect(satzAnteil('Der Hund', 'der Hund')).toBeLessThan(1)
  })
  it('falscheWoerter markiert fehlende und falsche Wörter des Originals', () => {
    expect(falscheWoerter('Ich weiß, dass du kommst.', 'Ich weis, dass kommst.')).toEqual([1, 3])
    expect(falscheWoerter('Ich gehe.', 'Ich gehe.')).toEqual([])
  })
})
