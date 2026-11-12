import { describe, expect, it } from 'vitest'
import { grosserBereich, stufeAusPunkte, trendText, zusammenfassen, type Auswertung, type Einstellungen } from './lernstand'

const e = { min_versuche: 4, trend_min_neue: 4, grenze_minus: 35, grenze_o: 55, grenze_plus: 70, grenze_plusplus: 85 } as Einstellungen
const a = (x: Partial<Auswertung>) => ({ punkte: 60, anzahl: 8, vergleich_zeit: '2026-10-12T10:00:00Z', trend_gueltig: false, ...x }) as Auswertung

describe('Lernstand', () => {
  it('ordnet Punkte den Stufen zu wie die Datenbank', () => {
    expect([0, 35, 54.9, 55, 70, 85, 100].map((p) => stufeAusPunkte(p, e))).toEqual([0, 1, 1, 2, 3, 4, 4])
  })
  it('beschreibt den Trend in Worten', () => {
    expect(trendText(a({ punkte: null, anzahl: 2 }), e)).toBe('noch nicht genug Daten (2 von 4 Versuchen)')
    expect(trendText(a({ neue_seit_vergleich: 3 }), e)).toBe('noch kein Trend – ein weiterer Versuch nötig')
    expect(trendText(a({ trend_gueltig: true, trend_stufen: 2, trend_punkte: 30 }), e)).toBe('+2 Stufen seit 12.10.2026')
  })
})

describe('große Bereiche', () => {
  it('ordnet die Bereiche der Kompetenzliste zu', () => {
    expect(grosserBereich('Wortarten')).toBe('Sprache und Sprachgebrauch untersuchen')
    expect(grosserBereich('Rechtschreibung')).toBe('Schreiben')
    expect(grosserBereich('Unbekannt')).toBe('Weitere')
  })
  it('mittelt erst je Bereich, dann je großem Bereich; ohne Stufe zählt nicht', () => {
    const { bereiche, gross } = zusammenfassen([
      { bereich: 'Wortarten', punkte: 40 },
      { bereich: 'Wortarten', punkte: 60 },
      { bereich: 'Wortarten', punkte: null },
      { bereich: 'Satzglieder und Sätze', punkte: 80 },
      { bereich: 'Rechtschreibung', punkte: 70 },
    ])
    expect(bereiche.get('Wortarten')).toBe(50)
    expect(gross.get('Sprache und Sprachgebrauch untersuchen')).toBe(65) // (50 + 80) / 2, nicht (40 + 60 + 80) / 3
    expect(gross.get('Schreiben')).toBe(70)
    expect(gross.has('Sich mit Texten und anderen Medien auseinandersetzen')).toBe(false)
  })
})
