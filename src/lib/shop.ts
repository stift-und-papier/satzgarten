// Bilder zum Shop-Angebot (ids wie in der Tabelle shop_artikel, Migration `shop`). Preise und Freischalten rechnet nur der Server.
import { GRAFIK } from '../grafik'
import type { Grafik } from './sprite'

export type ArtikelArt = 'samen' | 'tier' | 'deko' | 'feld'
export type Artikel = { id: string; art: ArtikelArt; name: string; preis: number; besitz: number }
export type Shop = { kontostand: number; angebot: Artikel[]; gesperrt: { art: ArtikelArt }[] }

// Zeile der Sorte in GRAFIK.pflanzen und GRAFIK.saatgut (ohne Mais); Namen wie in shop_artikel
export const SORTE: Record<string, number> = {
  karotte: 0, blumenkohl: 1, tomate: 2, aubergine: 3, tulpe: 4, salat: 5, weizen: 6,
  kuerbis: 7, rettich: 8, rose: 9, rote_bete: 10, sternfrucht: 11, gurke: 12,
}
export const SORTE_NAME: Record<string, string> = {
  karotte: 'Karotte', blumenkohl: 'Blumenkohl', tomate: 'Tomate', aubergine: 'Aubergine', tulpe: 'Tulpe', salat: 'Salat',
  weizen: 'Weizen', kuerbis: 'Kürbis', rettich: 'Rettich', rose: 'Rose', rote_bete: 'Rote Bete', sternfrucht: 'Sternfrucht', gurke: 'Gurke',
}

export type Farm = {
  felder: number
  pflanzen: { feld: number; sorte: string; bild: number; reif: boolean }[]
  samen: { sorte: string; anzahl: number }[]
  vorrat: { sorte: string; anzahl: number }[]
  dinge: { artikel: string; anzahl: number }[]
}

/** Bild für die Shop-Karte: Samentüte, Tier, Deko oder Feld (reife Karotte als Zeichen) */
export function artikelBild(id: string): { grafik: Grafik; nummer: number } {
  if (id in SORTE) return { grafik: GRAFIK.saatgut, nummer: SORTE[id] * 2 }
  if (id === 'feld') return { grafik: GRAFIK.pflanzen, nummer: SORTE.karotte * 4 + 3 }
  if (id === 'huhn') return { grafik: GRAFIK.huhn, nummer: 0 }
  if (id === 'kuh') return { grafik: GRAFIK.kuh, nummer: 0 }
  if (id === 'brunnen') return { grafik: GRAFIK.brunnen, nummer: 0 }
  const deko = (GRAFIK as Record<string, Grafik>)[`deko_${id}`]
  if (!deko) throw new Error(`Kein Bild für ${id}`)
  return { grafik: deko, nummer: 0 }
}
