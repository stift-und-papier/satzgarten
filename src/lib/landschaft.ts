// Aufbau der Farm-Landschaft (Lehrkraft 2026-11-12: wie das Sprout-Lands-Titelbild, verspielte Inselform, Platz für Deko).
// Alle Angaben in Kacheln zu 16 Pixeln. Felder links oben, Hühnerstall rechts oben, Scheune rechts unten (beide erst mit dem
// ersten Tier), dazwischen Bäume, Brunnen und Deko-Plätze.
export const KACHEL = 16

// # = Gras, . = Wasser. Neue Plätze für Deko einfach auf Gras legen (der Test prüft das).
const KARTE = [
  '.....................',
  '...#######....####...',
  '..##########.######..',
  '.###################.',
  '.###################.',
  '..##################.',
  '..#################..',
  '.##################..',
  '.###################.',
  '.###################.',
  '..##################.',
  '..#################..',
  '...######..########..',
  '....####....######...',
  '.....................',
]
export const SPALTEN = KARTE[0].length
export const ZEILEN = KARTE.length
export const istGras = (x: number, y: number) => KARTE[y]?.[x] === '#'

export type Ort = { x: number; y: number }
type Rechteck = { x0: number; y0: number; x1: number; y1: number }

export const FELD_PLAETZE: Ort[] = Array.from({ length: 12 }, (_, i) => ({ x: 3 + (i % 4), y: 3 + Math.floor(i / 4) }))
export const STALL: Ort = { x: 14, y: 1 } // 3 × 3 Kacheln
export const HUHN_PLAETZE: Ort[] = [{ x: 13, y: 4 }, { x: 15, y: 4 }, { x: 17, y: 4 }, { x: 14, y: 5 }]
// Scheune von oben mit offenem Dach; Tür unten in der Mitte (2 Kacheln)
export const SCHEUNE: Rechteck = { x0: 12, y0: 8, x1: 17, y1: 12 }
export const TUER: Ort = { x: 14, y: 12 }
export const HEU: Ort = { x: 13, y: 11 } // 2 × 1
export const TROG: Ort = { x: 15, y: 11 } // 2 × 1
export const KUH_PLAETZE: Ort[] = [{ x: 13, y: 9 }, { x: 15, y: 9 }, { x: 9, y: 8 }, { x: 9, y: 10 }] // je 2 × 2; erst innen, dann davor
export const BAEUME: (Ort & { grafik: 'baum' | 'baum_klein' })[] = [
  { grafik: 'baum', x: 8, y: 1 },
  { grafik: 'baum_klein', x: 1, y: 7 },
  { grafik: 'baum_klein', x: 18, y: 4 },
  { grafik: 'baum_klein', x: 4, y: 12 },
]
export const BRUNNEN: Ort = { x: 8, y: 6 } // 2 × 2
export const DEKO_PLAETZE: Ort[] = [
  { x: 8, y: 4 }, { x: 10, y: 5 }, { x: 11, y: 3 }, { x: 2, y: 8 }, { x: 3, y: 10 }, { x: 5, y: 9 },
  { x: 7, y: 9 }, { x: 6, y: 11 }, { x: 8, y: 12 }, { x: 19, y: 8 }, { x: 18, y: 10 }, { x: 11, y: 11 },
  { x: 6, y: 7 }, { x: 4, y: 7 }, { x: 12, y: 6 }, { x: 16, y: 6 }, { x: 18, y: 7 }, { x: 2, y: 5 },
]
export const FIGUR_START: Ort = { x: 7, y: 6 }
// Kleine Halme und Blümchen auf dem Gras (nur innen, nie am Rand)
export const GRAS_DEKO: (Ort & { nummer: number })[] = [
  { x: 7, y: 3 }, { x: 10, y: 3 }, { x: 4, y: 9 }, { x: 13, y: 7 }, { x: 11, y: 6 }, { x: 3, y: 7 },
  { x: 8, y: 10 }, { x: 15, y: 6 }, { x: 11, y: 8 }, { x: 6, y: 10 },
].map((o, i) => ({ ...o, nummer: [0, 3, 5, 1, 9, 7, 4, 11, 2, 10][i] }))

/** Teil eines 3 × 3-Rahmens (0 links oben … 4 Mitte … 8 rechts unten) für die Kachel (x, y) im Rechteck r */
export function neunerTeil(x: number, y: number, r: Rechteck): number {
  const spalte = x === r.x0 ? 0 : x === r.x1 ? 2 : 1
  const zeile = y === r.y0 ? 0 : y === r.y1 ? 2 : 1
  return zeile * 3 + spalte
}

// Kachelsatz „Blob“ (Gras und Acker): Nachbarn als 3 × 3-Muster (Zeilen von oben, 1 = belegt) → Nummer im Blatt (11 Spalten).
// Ausgelesen aus „Bitmask references 2.png“ des Pakets. Ecken zählen nur, wenn beide angrenzenden Seiten belegt sind.
const BLOB: Record<string, number> = {
  '110110000': 24, '110110010': 18, '110110110': 13, '110111000': 38, '110111010': 43, '110111011': 9, '110111110': 49,
  '110111111': 27, '111111000': 23, '111111010': 19, '111111011': 17, '111111110': 16, '111111111': 12, '000011011': 0,
  '000111111': 1, '000110110': 2, '000010010': 3, '000011010': 4, '000111110': 5, '000111011': 6, '000110010': 7,
  '000111010': 8, '011011011': 11, '010010010': 14, '011011010': 15, '011111110': 20, '011011000': 22, '010010000': 25,
  '010011011': 26, '011111111': 28, '010110110': 29, '010111111': 30, '010111011': 31, '010111110': 32, '000011000': 33,
  '000111000': 34, '000110000': 35, '000010000': 36, '010011000': 37, '011111000': 39, '010110000': 40, '010111000': 41,
  '011111010': 42, '010011010': 48, '011111011': 50, '010110010': 51, '010111010': 52,
}

/** Passendes Teil aus dem Blob-Kachelsatz für Kachel (x, y), wenn `belegt` sagt, welche Kacheln dazugehören */
export function blobTeil(x: number, y: number, belegt: (x: number, y: number) => boolean): number {
  const n = belegt(x, y - 1), s = belegt(x, y + 1), w = belegt(x - 1, y), o = belegt(x + 1, y)
  const b = (v: boolean) => (v ? '1' : '0')
  const muster =
    b(n && w && belegt(x - 1, y - 1)) + b(n) + b(n && o && belegt(x + 1, y - 1)) +
    b(w) + '1' + b(o) +
    b(s && w && belegt(x - 1, y + 1)) + b(s) + b(s && o && belegt(x + 1, y + 1))
  return BLOB[muster] ?? 12
}

/** Feste Kacheln des Hintergrunds in Zeichen-Reihenfolge: Wasser, Gras, Grasdeko */
export function grundKacheln(): (Ort & { grafik: 'wasser' | 'gras' | 'gras_deko'; nummer: number })[] {
  const liste: (Ort & { grafik: 'wasser' | 'gras' | 'gras_deko'; nummer: number })[] = []
  for (let y = 0; y < ZEILEN; y++)
    for (let x = 0; x < SPALTEN; x++) {
      liste.push({ grafik: 'wasser', nummer: 0, x, y })
      if (istGras(x, y)) liste.push({ grafik: 'gras', nummer: blobTeil(x, y, istGras), x, y })
    }
  for (const d of GRAS_DEKO) liste.push({ grafik: 'gras_deko', ...d })
  return liste
}

/** Kacheln der Scheune: Wand-Rahmen mit Holzboden innen; an der Tür Boden statt Wand */
export function scheunenKacheln(): (Ort & { nummer: number })[] {
  const liste: (Ort & { nummer: number })[] = []
  for (let y = SCHEUNE.y0; y <= SCHEUNE.y1; y++)
    for (let x = SCHEUNE.x0; x <= SCHEUNE.x1; x++) {
      const tuer = y === TUER.y && (x === TUER.x || x === TUER.x + 1)
      liste.push({ x, y, nummer: tuer ? 4 : neunerTeil(x, y, SCHEUNE) })
    }
  return liste
}

/** Alle belegten Kacheln (für den Test: nichts überdeckt sich, alles liegt auf Gras) */
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
  HUHN_PLAETZE.forEach((o, i) => setze(`Huhn ${i}`, o))
  setze('Scheune', { x: SCHEUNE.x0, y: SCHEUNE.y0 }, SCHEUNE.x1 - SCHEUNE.x0 + 1, SCHEUNE.y1 - SCHEUNE.y0 + 1)
  KUH_PLAETZE.slice(2).forEach((o, i) => setze(`Kuh draußen ${i}`, o, 2, 2))
  BAEUME.forEach((b) => setze(b.grafik, b, b.grafik === 'baum' ? 2 : 1, 2))
  setze('Brunnen', BRUNNEN, 2, 2)
  DEKO_PLAETZE.forEach((o, i) => setze(`Deko ${i}`, o))
  setze('Figur', FIGUR_START)
  return belegt
}
