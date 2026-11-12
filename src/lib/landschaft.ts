// Aufbau der Farm-Landschaft (Lehrkraft 2026-11-12: wie das Sprout-Lands-Titelbild, verspielte Inselform, Platz für Deko).
// Alle Angaben in Kacheln zu 16 Pixeln. Felder links oben, Scheune rechts oben, Hühnerstall rechts unten (beide erst mit dem
// ersten Tier), dazwischen Bäume, Brunnen und Deko-Plätze. Durch Gebäude, Bäume, Deko und Tiere läuft die Figur nicht.
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
export const STALL: Ort = { x: 14, y: 9 } // 3 × 3 Kacheln
export const HUHN_PLAETZE: Ort[] = [{ x: 13, y: 10 }, { x: 17, y: 10 }, { x: 13, y: 12 }, { x: 16, y: 12 }]
// Scheune von oben mit offenem Dach; unten in der Mitte ein Durchgang ohne Tür (2 Kacheln).
// Heu und Trog stehen hinten an der Wand, die Kühe davor, ganz unten bleibt ein Gang frei.
export const SCHEUNE: Rechteck = { x0: 13, y0: 2, x1: 18, y1: 7 }
export const TUER: Ort = { x: 15, y: 7 }
export const HEU: Ort = { x: 14, y: 3 } // 2 × 1
export const TROG: Ort = { x: 16, y: 3 } // 2 × 1
export const KUH_PLAETZE: Ort[] = [{ x: 14, y: 4 }, { x: 16, y: 4 }, { x: 9, y: 8 }, { x: 9, y: 10 }] // je 2 × 2; erst innen, dann davor
export const BAEUME: (Ort & { grafik: 'baum' | 'baum_klein' })[] = [
  { grafik: 'baum', x: 8, y: 1 },
  { grafik: 'baum_klein', x: 1, y: 7 },
  { grafik: 'baum_klein', x: 10, y: 2 },
  { grafik: 'baum_klein', x: 4, y: 12 },
]
export const BRUNNEN: Ort = { x: 8, y: 6 } // 2 × 2
// Obstbäume (je einer, 2 × 2 Kacheln Stamm und Krone; das Bild ist 48 × 48 und ragt darüber hinaus): zwei über dem Acker, einer vor dem Stall
export const BAUM_PLAETZE: Record<string, Ort> = { orangenbaum: { x: 3, y: 1 }, pfirsichbaum: { x: 5, y: 1 }, birnenbaum: { x: 11, y: 9 } }
// Boot (3 × 2 Kacheln) liegt im Wasser unten, am Ufer festgebunden; kein Hindernis (Wasser ist es schon)
export const BOOT: Ort = { x: 8, y: 13 }
export const DEKO_PLAETZE: Ort[] = [
  { x: 8, y: 4 }, { x: 10, y: 5 }, { x: 11, y: 3 }, { x: 2, y: 8 }, { x: 3, y: 10 }, { x: 5, y: 9 },
  { x: 7, y: 9 }, { x: 6, y: 11 }, { x: 8, y: 12 }, { x: 19, y: 8 }, { x: 18, y: 10 }, { x: 11, y: 11 },
  { x: 6, y: 7 }, { x: 4, y: 7 }, { x: 12, y: 6 }, { x: 17, y: 9 }, { x: 19, y: 9 }, { x: 2, y: 5 },
]
export const FIGUR_START: Ort = { x: 7, y: 6 }
// Kleine Halme und Blümchen auf dem Gras (nur innen, nie am Rand)
export const GRAS_DEKO: (Ort & { nummer: number })[] = [
  { x: 7, y: 3 }, { x: 10, y: 3 }, { x: 4, y: 9 }, { x: 7, y: 8 }, { x: 11, y: 6 }, { x: 3, y: 7 },
  { x: 8, y: 10 }, { x: 12, y: 8 }, { x: 11, y: 8 }, { x: 6, y: 10 },
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
  Object.entries(BAUM_PLAETZE).forEach(([name, o]) => setze(name, o, 2, 2))
  DEKO_PLAETZE.forEach((o, i) => setze(`Deko ${i}`, o))
  setze('Figur', FIGUR_START)
  return belegt
}

export type Stand = { deko: number; brunnen: boolean; huehner: number; kuehe: number; obstbaeume?: string[] }
const flaeche = (o: Ort, breite: number, hoehe: number): Ort[] =>
  Array.from({ length: breite * hoehe }, (_, i) => ({ x: o.x + (i % breite), y: o.y + Math.floor(i / breite) }))
/** Kacheln, die ein Tier belegt (Huhn 1 × 1, Kuh 2 × 2) oder ein Obstbaum (2 × 2) */
export const tierFlaeche = (o: Ort, groesse: number) => flaeche(o, groesse, groesse)

/** Kacheln, durch die die Figur nicht laufen kann (Wasser zählt extra) */
export function hindernisse(s: Stand): Set<string> {
  // Felder sind Boden: darauf darf man gehen (sonst kommt man an die mittleren nicht heran)
  const liste: Ort[] = DEKO_PLAETZE.slice(0, s.deko)
  for (const b of BAEUME) liste.push(...flaeche(b, b.grafik === 'baum' ? 2 : 1, 2))
  if (s.brunnen) liste.push(...flaeche(BRUNNEN, 2, 2))
  for (const b of s.obstbaeume ?? []) if (BAUM_PLAETZE[b]) liste.push(...flaeche(BAUM_PLAETZE[b], 2, 2))
  if (s.huehner) liste.push(...flaeche(STALL, 3, 3), ...HUHN_PLAETZE.slice(0, s.huehner))
  if (s.kuehe) {
    liste.push(...scheunenKacheln().filter((k) => k.nummer !== 4), ...flaeche(HEU, 2, 1), ...flaeche(TROG, 2, 1))
    // eine Kuh allein läuft in der ganzen Scheune hin und her (FarmTier): dann auch den zweiten Platz drinnen sperren
    for (const k of KUH_PLAETZE.slice(0, s.kuehe === 1 ? 2 : s.kuehe)) liste.push(...tierFlaeche(k, 2))
  }
  return new Set(liste.map((o) => `${o.x},${o.y}`))
}

/**
 * Kürzester Weg (8 Richtungen, keine Ecken abschneiden) von `start` zur nächsten Kachel, für die `ziel` gilt.
 * Ergebnis ohne die Startkachel; null, wenn kein Weg da ist.
 */
export function weg(start: Ort, ziel: (o: Ort) => boolean, besetzt: Set<string>): Ort[] | null {
  const frei = (x: number, y: number) => istGras(x, y) && !besetzt.has(`${x},${y}`)
  const herkunft = new Map<string, string | null>([[`${start.x},${start.y}`, null]])
  const schlange: Ort[] = [start]
  for (let i = 0; i < schlange.length; i++) {
    const o = schlange[i]
    if (ziel(o)) {
      const pfad: Ort[] = []
      for (let k: string | null = `${o.x},${o.y}`; k && herkunft.get(k) !== null; k = herkunft.get(k)!) {
        const [x, y] = k.split(',').map(Number)
        pfad.unshift({ x, y })
      }
      return pfad
    }
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        const x = o.x + dx, y = o.y + dy, k = `${x},${y}`
        if ((!dx && !dy) || herkunft.has(k) || !frei(x, y)) continue
        if (dx && dy && (!frei(o.x + dx, o.y) || !frei(o.x, o.y + dy))) continue
        herkunft.set(k, `${o.x},${o.y}`)
        schlange.push({ x, y })
      }
  }
  return null
}

/** Ziel „neben einem Ding“: freie Kachel, die waagrecht oder senkrecht an eine der Kacheln grenzt */
export const nebenan = (kacheln: Ort[]) => (o: Ort) => kacheln.some((k) => Math.abs(k.x - o.x) + Math.abs(k.y - o.y) === 1)

/**
 * Plätze für Dinge, die auf der Farm liegen (Ernte beim Feld, Ei/Milch beim Tier): je Ding die nächste freie Graskachel
 * um seinen Ursprung herum, nicht auf Hindernissen, nicht in `gesperrt` (z. B. bepflanzte Felder) und nicht doppelt.
 */
export function ablagePlaetze(ursprung: Ort[][], besetzt: Set<string>, gesperrt: Set<string>): Ort[] {
  const vergeben = new Set<string>()
  return ursprung.map((start) => {
    const gesehen = new Set(start.map((o) => `${o.x},${o.y}`))
    const schlange = [...start]
    for (let i = 0; i < schlange.length; i++) {
      const o = schlange[i]
      const k = `${o.x},${o.y}`
      if (istGras(o.x, o.y) && !besetzt.has(k) && !gesperrt.has(k) && !vergeben.has(k)) {
        vergeben.add(k)
        return o
      }
      for (const [dx, dy] of [[0, 1], [1, 0], [-1, 0], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]]) {
        const n = { x: o.x + dx, y: o.y + dy }
        const nk = `${n.x},${n.y}`
        if (!gesehen.has(nk) && istGras(n.x, n.y)) {
          gesehen.add(nk)
          schlange.push(n)
        }
      }
    }
    return start[0] // shortcut: Insel ganz voll, dann eben auf den Ursprung
  })
}
