// Übungsumbau Schritt 6: Monster, die die Lehrkraft je Übung wählt (Schlüssel = aufgaben.monster, Standard Rübchen).
import { GRAFIK } from '../grafik'

export const MONSTER = {
  ruebchen: { name: 'Rübchen', grafik: GRAFIK.monster_ruebchen, mal: 2 },
  schleim_gruen: { name: 'Schleim grün', grafik: GRAFIK.monster_schleim_gruen, mal: 2 },
  schleim_blau: { name: 'Schleim blau', grafik: GRAFIK.monster_schleim_blau, mal: 2 },
  schleim_feuer: { name: 'Feuerschleim', grafik: GRAFIK.monster_schleim_feuer, mal: 2 },
  gespenst: { name: 'Gespenst', grafik: GRAFIK.monster_gespenst, mal: 3 },
  spinne_gruen: { name: 'Spinne grün', grafik: GRAFIK.monster_spinne_gruen, mal: 3 },
  spinne_lila: { name: 'Spinne lila', grafik: GRAFIK.monster_spinne_lila, mal: 3 },
  spinne_gold: { name: 'Spinne gold', grafik: GRAFIK.monster_spinne_gold, mal: 3 },
  maus: { name: 'Maus', grafik: GRAFIK.monster_maus, mal: 3 },
  fledermaus: { name: 'Fledermaus', grafik: GRAFIK.monster_fledermaus, mal: 2 },
} as const

export type MonsterName = keyof typeof MONSTER

/** Unbekannter Schlüssel (z. B. später entferntes Monster) → Rübchen */
export const monster = (name: string | null | undefined) => MONSTER[(name ?? '') as MonsterName] ?? MONSTER.ruebchen
