// Aufbau der Farm-Landschaft (Lehrkraft 2026-11-12: wie das Sprout-Lands-Titelbild). Alle Angaben in Kacheln zu 16 Pixeln.
// Insel im Wasser, links oben die Felder, rechts oben der Hühnerstall, rechts unten das Kuh-Gehege, dazwischen Bäume und Deko.
export const KACHEL = 16
export const SPALTEN = 16
export const ZEILEN = 12

type Ort = { x: number; y: number }
type Rechteck = { x0: number; y0: number; x1: number; y1: number }

export const INSEL: Rechteck = { x0: 1, y0: 1, x1: 14, y1: 10 }
export const FELD_PLAETZE: Ort[] = Array.from({ length: 12 }, (_, i) => ({ x: 2 + (i % 4), y: 2 + Math.floor(i / 4) }))
export const STALL: Ort = { x: 11, y: 1 } // 3 × 3 Kacheln
export const GEHEGE: Rechteck = { x0: 8, y0: 6, x1: 13, y1: 9 }
export const BAEUME: (Ort & { grafik: 'baum' | 'baum_klein' })[] = [
  { grafik: 'baum', x: 8, y: 1 },
  { grafik: 'baum_klein', x: 1, y: 8 },
  { grafik: 'baum_klein', x: 6, y: 8 },
]
export const BRUNNEN: Ort = { x: 6, y: 5 } // 2 × 2 Kacheln
export const DEKO_PLAETZE: Ort[] = [
  { x: 2, y: 6 }, { x: 4, y: 6 }, { x: 3, y: 8 }, { x: 5, y: 9 }, { x: 1, y: 5 }, { x: 7, y: 3 },
  { x: 10, y: 4 }, { x: 14, y: 5 }, { x: 2, y: 9 }, { x: 4, y: 9 }, { x: 14, y: 9 }, { x: 1, y: 2 },
]
export const HUHN_PLAETZE: Ort[] = [{ x: 11, y: 4 }, { x: 13, y: 4 }, { x: 12, y: 5 }, { x: 10, y: 5 }]
export const KUH_PLAETZE: Ort[] = [{ x: 9, y: 7 }, { x: 11, y: 7 }] // 2 × 2 Kacheln
export const FIGUR_START: Ort = { x: 7, y: 4 }

// Gras zwischen den Feldern bleibt schlicht; diese Kacheln bekommen kleine Halme oder Blümchen
export const GRAS_DEKO: (Ort & { nummer: number })[] = [
  { x: 6, y: 2, nummer: 0 }, { x: 3, y: 5, nummer: 3 }, { x: 9, y: 4, nummer: 5 }, { x: 6, y: 3, nummer: 1 },
  { x: 5, y: 7, nummer: 9 }, { x: 12, y: 2, nummer: 7 }, { x: 2, y: 7, nummer: 4 }, { x: 7, y: 9, nummer: 11 },
]

/** Teil eines 3 × 3-Rahmens (0 links oben … 4 Mitte … 8 rechts unten) für die Kachel (x, y) im Rechteck r */
export function neunerTeil(x: number, y: number, r: Rechteck): number {
  const spalte = x === r.x0 ? 0 : x === r.x1 ? 2 : 1
  const zeile = y === r.y0 ? 0 : y === r.y1 ? 2 : 1
  return zeile * 3 + spalte
}

const drin = (o: Ort, r: Rechteck) => o.x >= r.x0 && o.x <= r.x1 && o.y >= r.y0 && o.y <= r.y1

/** Feste Kacheln des Hintergrunds in Zeichen-Reihenfolge: Wasser, Insel, Grasdeko, Zaun */
export function grundKacheln(): (Ort & { grafik: 'wasser' | 'gras' | 'gras_deko' | 'zaun'; nummer: number })[] {
  const liste: (Ort & { grafik: 'wasser' | 'gras' | 'gras_deko' | 'zaun'; nummer: number })[] = []
  for (let y = 0; y < ZEILEN; y++)
    for (let x = 0; x < SPALTEN; x++) {
      liste.push({ grafik: 'wasser', nummer: 0, x, y })
      if (drin({ x, y }, INSEL)) liste.push({ grafik: 'gras', nummer: neunerTeil(x, y, INSEL), x, y })
    }
  for (const d of GRAS_DEKO) liste.push({ grafik: 'gras_deko', ...d })
  for (let y = GEHEGE.y0; y <= GEHEGE.y1; y++)
    for (let x = GEHEGE.x0; x <= GEHEGE.x1; x++) {
      const teil = neunerTeil(x, y, GEHEGE)
      if (teil !== 4) liste.push({ grafik: 'zaun', nummer: teil, x, y })
    }
  return liste
}

/** Alle belegten Kacheln je Bereich (für den Test: nichts darf sich überdecken) */
export function belegung(): Map<string, string> {
  const belegt = new Map<string, string>()
  const setze = (name: string, o: Ort, breite = 1, hoehe = 1) => {
    for (let dy = 0; dy < hoehe; dy++)
      for (let dx = 0; dx < breite; dx++) {
        const k = `${o.x + dx},${o.y + dy}`
        if (belegt.has(k)) throw new Error(`${name} überdeckt ${belegt.get(k)} bei ${k}`)
        belegt.set(k, name)
      }
  }
  FELD_PLAETZE.forEach((o, i) => setze(`Feld ${i}`, o))
  setze('Stall', STALL, 3, 3)
  setze('Gehege', { x: GEHEGE.x0, y: GEHEGE.y0 }, GEHEGE.x1 - GEHEGE.x0 + 1, GEHEGE.y1 - GEHEGE.y0 + 1)
  BAEUME.forEach((b) => setze(b.grafik, b, b.grafik === 'baum' ? 2 : 1, 2))
  setze('Brunnen', BRUNNEN, 2, 2)
  DEKO_PLAETZE.forEach((o, i) => setze(`Deko ${i}`, o))
  HUHN_PLAETZE.forEach((o, i) => setze(`Huhn ${i}`, o))
  setze('Figur', FIGUR_START)
  return belegt
}
