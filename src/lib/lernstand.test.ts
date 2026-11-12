import { describe, expect, it } from 'vitest'
import { stufeAusPunkte, trendText, type Auswertung, type Einstellungen } from './lernstand'

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
