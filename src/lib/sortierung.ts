// alt (Übungswiese), Stufe jetzt direkt als Zahl 1–3
import type { Aufgabe } from './typen'

// Sortierung der Aufgabenliste (Lehrkraft): nach Titel, Format, Stufe, Kompetenz oder KC, auf- oder absteigend.
export type Spalte = 'titel' | 'format' | 'stufe' | 'kompetenz' | 'kc'
export type Sortierung = { spalte: Spalte; absteigend: boolean } | null

/** kompetenz/kc: Kurznamen bzw. Kerncurricula der zugeordneten Kompetenzen als Text ('' = keine Zuordnung) */
type Sortierbar = Pick<Aufgabe, 'titel' | 'typ' | 'stufe'> & { kompetenz?: string; kc?: string }

const text = (a: string, b: string) => a.localeCompare(b, 'de', { numeric: true, sensitivity: 'base' })

/** Neue Liste in der gewünschten Reihenfolge. Stufe zählt 1 → 2 → 3 Sterne; Erklärseiten (ohne Stufe) stehen dabei
 *  immer am Ende. Bei Gleichstand entscheidet der Titel (immer A → Z). Ohne Sortierung bleibt die Reihenfolge. */
export function sortiere<T extends Sortierbar>(liste: T[], s: Sortierung, formatName: (typ: T['typ']) => string): T[] {
  if (!s) return liste
  const richtung = s.absteigend ? -1 : 1
  return [...liste].sort((a, b) => {
    if (s.spalte === 'stufe') {
      const ea = a.typ === 'erklaerung', eb = b.typ === 'erklaerung'
      if (ea !== eb) return ea ? 1 : -1
      const d = ea ? 0 : a.stufe - b.stufe
      if (d) return d * richtung
    } else if (s.spalte === 'kompetenz' || s.spalte === 'kc') {
      // ohne Kompetenz immer am Ende (wie Erklärseiten bei der Stufe)
      const va = a[s.spalte] ?? '', vb = b[s.spalte] ?? ''
      if (!va !== !vb) return va ? -1 : 1
      const d = text(va, vb)
      if (d) return d * richtung
    } else {
      const d = s.spalte === 'titel' ? text(a.titel, b.titel) : text(formatName(a.typ), formatName(b.typ))
      if (d) return d * richtung
    }
    return text(a.titel, b.titel)
  })
}

/** Klick auf eine Spalte: dieselbe Spalte dreht die Richtung um, eine andere beginnt aufsteigend */
export const naechsteSortierung = (s: Sortierung, spalte: Spalte): Sortierung =>
  s?.spalte === spalte ? { spalte, absteigend: !s.absteigend } : { spalte, absteigend: false }
