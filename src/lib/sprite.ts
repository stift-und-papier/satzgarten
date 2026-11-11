/** Größe einer Grafik aus src/grafik/index.ts: ganzes Blatt und ein Einzelbild darin (Pixel der Vorlage). */
export interface Grafik {
  url: string
  breite: number
  hoehe: number
  bildBreite: number
  bildHoehe: number
}

/** Lage von Einzelbild Nummer `nummer` (ab 0, zeilenweise von links oben) im Blatt, in Pixeln der Vorlage. */
export function einzelbild(g: Grafik, nummer: number): { x: number; y: number } {
  const spalten = Math.floor(g.breite / g.bildBreite)
  const anzahl = spalten * Math.floor(g.hoehe / g.bildHoehe)
  if (!Number.isInteger(nummer) || nummer < 0 || nummer >= anzahl) throw new Error(`Einzelbild ${nummer} gibt es nicht (0–${anzahl - 1})`)
  return { x: (nummer % spalten) * g.bildBreite, y: Math.floor(nummer / spalten) * g.bildHoehe }
}
