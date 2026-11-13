// Übungsumbau (Jazz, 2026-11-13): Spielfiguren zur Wahl (Reiter „Einstellungen“). Namen bewusst ohne Geschlecht.
// Alle drei haben denselben Aufbau wie figur.png: Spalten = 8 Richtungen (0 hoch, 2 rechts, 4 runter, 6 links),
// Zeilen = Laufbild 1, Stehen, Laufbild 2 (je 16 × 32). Schlüssel = schueler.figur in der Datenbank.
import { GRAFIK } from '../grafik'

export const FIGUREN = {
  gruen: { name: 'Grün', grafik: GRAFIK.figur },
  blau: { name: 'Blau', grafik: GRAFIK.figur_blau },
  katze: { name: 'Katze', grafik: GRAFIK.figur_katze },
} as const

export type FigurName = keyof typeof FIGUREN

/** Unbekannt oder noch nicht geladen → Grün */
export const figur = (name: string | null | undefined) => FIGUREN[(name ?? '') as FigurName] ?? FIGUREN.gruen

/** Einzelbild-Nummer im Blatt (Sprite zählt zeilenweise) */
export const figurBild = (richtung: number, zeile: 0 | 1 | 2 = 1) => zeile * 8 + richtung
