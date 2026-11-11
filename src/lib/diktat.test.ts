import { describe, expect, it } from 'vitest'
import { abstand, falscheWoerter, nachSaetzenTrennen, saetzeTeilen, satzAnteil, textAusTrennungen, vereinheitliche, woerterUndTrennungen } from './diktat'

describe('vereinheitliche', () => {
  it('typografische Zeichen wie auf der Tastatur, Leerraum zusammengefasst', () => {
    expect(vereinheitliche(' „Hallo“ – sagte  er…\n')).toBe('"Hallo" - sagte er...')
    expect(vereinheitliche('Das ist’s')).toBe("Das ist's")
  })
  it('Groß-/Kleinschreibung bleibt', () => {
    expect(vereinheitliche('Hund')).not.toBe(vereinheitliche('hund'))
  })
})

describe('Teilung (nur dort, wo die Lehrkraft trennt)', () => {
  it('saetzeTeilen teilt nur an |', () => {
    expect(saetzeTeilen('Ich gehe. Kommst du? | Wir laufen, | weil es regnet.')).toEqual(['Ich gehe. Kommst du?', 'Wir laufen,', 'weil es regnet.'])
    expect(saetzeTeilen('Ein Satz. Noch einer.')).toEqual(['Ein Satz. Noch einer.'])
  })
  it('nachSaetzenTrennen: nach . ? !, nicht nach Abkürzungen, Ordnungszahlen, einzelnen Buchstaben', () => {
    expect(nachSaetzenTrennen('Ich gehe. Kommst du? Ja! Wir laufen, | weil es regnet.')).toBe('Ich gehe. | Kommst du? | Ja! | Wir laufen, | weil es regnet.')
    expect(nachSaetzenTrennen('Wir essen z. B. Äpfel usw. am 3. Mai. Dann gehen wir.')).toBe('Wir essen z. B. Äpfel usw. am 3. Mai. | Dann gehen wir.')
    expect(nachSaetzenTrennen('Er rief: „Komm her!“ Dann ging er.')).toBe('Er rief: "Komm her!" | Dann ging er.')
  })
  it('Klick-Ansicht: Wörter und Trennungen hin und zurück', () => {
    const { woerter, trennungen } = woerterUndTrennungen('Das Buch,|das hier liegt. | Gut.')
    expect(woerter).toEqual(['Das', 'Buch,', 'das', 'hier', 'liegt.', 'Gut.'])
    expect(trennungen).toEqual([false, true, false, false, true, false])
    expect(textAusTrennungen(woerter, trennungen)).toBe('Das Buch, | das hier liegt. | Gut.')
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
