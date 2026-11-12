// alt (Übungswiese): Darstellung des Lernstands – nur Lehrkraft-Ansicht.

/** Ergebnis von auswertung() aus der Datenbank */
export type Auswertung = {
  punkte: number | null
  stufe: number | null
  anzahl: number
  start_punkte: number | null
  start_stufe: number | null
  start_zeit: string | null
  vergleich_punkte: number | null
  vergleich_stufe: number | null
  vergleich_zeit: string | null
  neue_seit_vergleich: number | null
  trend_gueltig: boolean
  trend_punkte: number | null
  trend_stufen: number | null
  verlauf: { zeit: string; punkte: number }[] | null
}

export type RueckmeldeText = 'deutlich' | 'besser' | 'dranbleiben' | 'erste' | 'gelungen' | 'naechster_schritt'

export type Einstellungen = {
  owner: string
  min_versuche: number
  anzahl_letzte: number
  abklingen: number
  punkte_leicht: number
  punkte_mittel: number
  punkte_schwer: number
  grenze_minus: number
  grenze_o: number
  grenze_plus: number
  grenze_plusplus: number
  trend_min_neue: number
  trend_min_diff: number
  vergleich_wochen: number | null
  texte: Record<RueckmeldeText, string>
}

/** Die fünf Stufen: Zeichen und Farben (tokens.css) – Farbe immer zusammen mit dem Zeichen */
export const STUFEN = [0, 1, 2, 3, 4].map((i) => ({
  symbol: ['--', '-', 'o', '+', '++'][i],
  farbe: `var(--color-stufe-${i})`,
  text: `var(--color-stufe-${i}-text)`,
}))

/** Punkte (0–100) → Stufe 0..4, wie in der Datenbank (stufe_aus_punkte) */
export function stufeAusPunkte(punkte: number, e: Einstellungen): number {
  if (punkte >= e.grenze_plusplus) return 4
  if (punkte >= e.grenze_plus) return 3
  if (punkte >= e.grenze_o) return 2
  if (punkte >= e.grenze_minus) return 1
  return 0
}

export function datum(zeit: string | null): string {
  return zeit ? new Date(zeit).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''
}

/** Textzeile zur Entwicklung, z. B. „+1 Stufe seit 12.10.2026“ */
export function trendText(a: Auswertung, e: Einstellungen): string {
  if (a.punkte === null) return `noch nicht genug Daten (${a.anzahl} von ${e.min_versuche} Versuchen)`
  if (!a.vergleich_zeit) return 'noch kein Vergleich möglich'
  const seit = datum(a.vergleich_zeit)
  if (!a.trend_gueltig) {
    const fehlen = e.trend_min_neue - (a.neue_seit_vergleich ?? 0)
    return fehlen > 0 ? `noch kein Trend, ${fehlen === 1 ? 'ein weiterer Versuch' : `${fehlen} weitere Versuche`} nötig` : `stabil seit ${seit}`
  }
  const stufen = a.trend_stufen ?? 0
  if (stufen !== 0) return `${stufen > 0 ? '+' : '−'}${Math.abs(stufen)} Stufe${Math.abs(stufen) === 1 ? '' : 'n'} seit ${seit}`
  return `${(a.trend_punkte ?? 0) > 0 ? 'verbessert' : 'verschlechtert'} innerhalb der Stufe seit ${seit}`
}

export function trendPfeil(a: Pick<Auswertung, 'trend_gueltig' | 'trend_punkte'>): string {
  if (!a.trend_gueltig || a.trend_punkte === null) return '→'
  return a.trend_punkte > 0 ? '↗' : '↘'
}

// ---------- Große Kompetenzbereiche (KC Niedersachsen; Zuordnung durch die Lehrkraft, 2026-11-12) ----------
export const GROSSE_BEREICHE = [
  'Sprache und Sprachgebrauch untersuchen',
  'Schreiben',
  'Sich mit Texten und anderen Medien auseinandersetzen',
] as const
const [SPRACHE, SCHREIBEN] = GROSSE_BEREICHE
const ZU_GROSS: Record<string, string> = {
  Wortarten: SPRACHE,
  'Wortbildung und Wortschatz': SPRACHE,
  'Satzglieder und Sätze': SPRACHE,
  Sprachgebrauch: SPRACHE,
  Rechtschreibung: SCHREIBEN,
  Zeichensetzung: SCHREIBEN,
  'Texte überarbeiten': SCHREIBEN,
}
/** Großer Bereich zu einem Bereich der Kompetenzliste; noch nicht zugeordnete Bereiche landen unter „Weitere“ */
export const grosserBereich = (bereich: string) => ZU_GROSS[bereich] ?? 'Weitere'

const mittel = (zahlen: number[]) => (zahlen.length ? zahlen.reduce((a, b) => a + b, 0) / zahlen.length : null)

/**
 * Durchschnitte einer Person: je Bereich über seine Kompetenzen, je großem Bereich über seine Bereiche
 * (jeder Bereich zählt gleich viel). Kompetenzen ohne Stufe (zu wenige Versuche) zählen nicht mit.
 */
export function zusammenfassen(werte: { bereich: string; punkte: number | null }[]) {
  const jeBereich = new Map<string, number[]>()
  for (const w of werte) if (w.punkte !== null) jeBereich.set(w.bereich, [...(jeBereich.get(w.bereich) ?? []), w.punkte])
  const bereiche = new Map([...jeBereich].map(([b, p]) => [b, mittel(p) as number]))
  const jeGross = new Map<string, number[]>()
  for (const [b, p] of bereiche) jeGross.set(grosserBereich(b), [...(jeGross.get(grosserBereich(b)) ?? []), p])
  const gross = new Map([...jeGross].map(([g, p]) => [g, mittel(p) as number]))
  return { bereiche, gross }
}
