// Zeilen der Datenbank-Tabellen, wie die Lehrkraft-Seiten sie lesen.
import type { Kerncurriculum, STUFEN } from './csv'

export interface Klasse {
  id: string
  name: string
  kerncurriculum: Kerncurriculum
}

export interface Schueler {
  id: string
  klasse_id: string
  pseudonym: string
  token: string
  stufe_manuell: 1 | 2 | 3 | null
  /** Übungsumbau: Leseschrift (OpenDyslexic) von der Lehrkraft eingeschaltet */
  leseschrift?: boolean
}

export interface Kompetenz {
  id: string
  code: string
  kerncurriculum: Kerncurriculum
  bereich: string
  stufe: (typeof STUFEN)[number]
  kompetenz: string
  hinweis: string | null
  kurzname: string | null
  ausgeblendet: boolean
}

// ---- Aufgaben (alt: Übungswiese, src/lib/typen.ts) ----

export type Stufe = 1 | 2 | 3
export type AufgabenTyp = 'lueckentext' | 'auswahl' | 'zuordnen' | 'fehler' | 'reihenfolge' | 'ueberarbeiten' | 'erklaerung' | 'diktat'

/** Erklärseite: Erklärtext (Absätze durch Leerzeile), Merkkasten, Beispielsätze ([Wort] = hervorgehoben) */
export type Erklaerung = { text: string; merke: string; beispiele: string[] }

export type TextTeil = { t: 'text'; v: string }
/** hinweis: erscheint in Klammern hinter der Lücke, z. B. „(Rad + fahren)“ */
export type LueckenTeil = { t: 'luecke'; id: number; loesungen: string[]; hinweis?: string }
/** Auswahl-Stelle: Möglichkeiten und die Nummern der richtigen (mehrere = Mehrfachauswahl) */
export type AuswahlTeil = { t: 'auswahl'; id: number; optionen: string[]; richtig: number[] }
/** Antippbare Einheit beim Zuordnen (Wort oder Wortgruppe); kategorie null = gehört zu keiner Kategorie */
export type EinheitTeil = { t: 'einheit'; id: number; v: string; kategorie: string | null }
/** Antippbares Wort beim Fehlerfinden (mit anhängenden Satzzeichen); korrekturen null = fehlerfrei */
export type WortTeil = { t: 'wort'; id: number; v: string; korrekturen: string[] | null }
/** Baustein zum Ordnen: k = zufällige Kennung (verrät die Reihenfolge nicht), v = Text */
export type Baustein = { k: string; v: string }
/** Satz zum Ordnen: loesungen = alle richtigen Reihenfolgen, zeichen erst bei richtiger Lösung sichtbar,
 *  varianten = so viele verschiedene Reihenfolgen sind gefordert */
export type ReiheTeil = { t: 'reihe'; id: number; satzart: string; zeichen: string; varianten: number; bausteine: Baustein[]; loesungen: string[][] }
/** Sätze verbessern: richtig = Nummer der besseren Version, hinweise = Begründung je Version (erst nach dem Prüfen) */
export type VersionenTeil = { t: 'versionen'; id: number; kontext: string; optionen: string[]; richtig: number[]; hinweise: string[] }
export type LueckentextTeil = TextTeil | LueckenTeil | AuswahlTeil | EinheitTeil | WortTeil | ReiheTeil | VersionenTeil

export type Darstellung = 'antippen' | 'dropdown'

/** Spalte aufgaben.loesung: alles, was die Lehrkraft eingibt (mit Lösungen). Schüler:innen bekommen sie nie. */
export type LueckentextInhalt = {
  /** Eingabetext der Lehrkraft mit [Klammern] – nur für die Bearbeitung */
  text: string
  gross_klein_beachten: boolean
  darstellung?: Darstellung
  /** Zuordnen: Kategorien („Stifte“) */
  kategorien?: string[]
  /** Fehler finden: richtige Form eintippen lassen / Anzahl der Fehler anzeigen */
  korrigieren?: boolean
  anzahl_zeigen?: boolean
  teile: LueckentextTeil[]
  erklaerung?: Erklaerung
  /** nur beim Diktat: Art und (Teil-)Sätze (docs/SPEC-diktat.md) */
  modus?: 'abschreiben' | 'merken'
  saetze?: string[]
  /** Übungsumbau: eine Übung besteht aus Runden, jede Runde im bisherigen Format (Diktat: genau eine, ohne Runden-Reiter) */
  runden?: LueckentextInhalt[]
}

/** Spalte aufgaben.inhalt: Schüler-Fassung ohne Lösungen (erzeugt die Datenbank; Vorschau: ohneLoesung) */
export type ReiheOhneLoesung = { t: 'reihe'; id: number; satzart?: string; zeichen?: string; varianten?: number; bausteine: Baustein[] }
export type VersionenOhneLoesung = { t: 'versionen'; id: number; kontext?: string; optionen: string[] }
export type AuswahlTeilOhneLoesung = { t: 'auswahl'; id: number; optionen: string[]; mehrfach: boolean }
export type LueckentextInhaltSchueler = {
  darstellung?: Darstellung
  kategorien?: string[]
  korrigieren?: boolean
  anzahl_fehler?: number | null
  erklaerung?: Erklaerung
  /** nur beim Diktat: Art und (Teil-)Sätze (docs/SPEC-diktat.md) */
  modus?: 'abschreiben' | 'merken'
  saetze?: string[]
  teile: (
    | TextTeil
    | { t: 'luecke'; id: number; hinweis?: string }
    | AuswahlTeilOhneLoesung
    | { t: 'einheit'; id: number; v: string }
    | { t: 'wort'; id: number; v: string }
    | ReiheOhneLoesung
    | VersionenOhneLoesung
  )[]
  /** Übungsumbau: Schüler-Fassung je Runde */
  runden?: LueckentextInhaltSchueler[]
}

/** Antwort je Stelle: Text (Lücke, Kategorie, Verbesserung), Nummern (Auswahl), true (Fehler markiert),
 *  Kennungen (Reihenfolge, bei mehreren Varianten je Variante eine Liste) */
export type Antwort = string | number[] | boolean | string[] | string[][]
export type Antworten = Record<string, Antwort>

export interface Aufgabe {
  id: string
  typ: AufgabenTyp
  titel: string
  anweisung: string
  farbig: boolean
  hinweis: string | null
  rueckmeldung_fehler: string | null
  stufe: Stufe
  loesung: LueckentextInhalt
  geaendert_am: string
  /** Übungsumbau: Monster (src/lib/monster.ts) und Runden je Durchgang (leer = alle) */
  monster: string
  runden_je_durchgang: number | null
}

export type Pruefergebnis = {
  /** id null = nicht gefundener Fehler (Stelle wird bewusst nicht verraten) */
  luecken: { id: number | null; richtig: boolean; positionen?: boolean[]; variante?: number; hinweise?: string[]; /** nur Groß/klein falsch */ gross_klein?: boolean }[]
  anteil: number
  /** Diktat: ohne einen Fehler (besonders belohnt) */
  fehlerfrei?: boolean
  richtig: boolean
}

/** Aufgabe, wie Schüler:innen (und die Vorschau) sie sehen */
export type SchuelerAufgabe = {
  id: string
  typ: AufgabenTyp
  titel: string
  anweisung: string
  farbig: boolean
  hinweis: string | null
  stufe: Stufe
  inhalt: LueckentextInhaltSchueler
  versuche: number
  geloest: boolean
  loesung_angesehen: boolean
  // Übungsumbau: Übungen (mit Runden) holen ihren Inhalt über uebung_starten; inhalt ist dann leer
  uebung?: boolean
  monster?: string
  befreundet?: boolean
  angefangen?: boolean
  /** heute schon gespielt, wieder frei ab morgen */
  morgen?: boolean
}

/** Antwort von uebung_starten */
export type Durchgang =
  | { status: 'morgen'; monster: string; befreundet: boolean }
  | {
      status: 'offen'
      durchgang: string
      typ: AufgabenTyp
      monster: string
      befreundet: boolean
      runden: { nr: number; inhalt: LueckentextInhaltSchueler }[]
      gespielt: { nr: number; richtig: boolean; ergebnis: Pruefergebnis; loesung: Loesung }[]
    }

/** Antwort von runde_pruefen; abschluss nur nach der letzten Runde (keine Prozente für Schüler:innen) */
export type RundeErgebnis = {
  ergebnis: Pruefergebnis
  richtig: boolean
  loesung: Loesung
  fertig: boolean
  abschluss?: { befreundet: boolean; neu_befreundet: boolean; muenzen: number; kontostand: number } | null
}

// ---- Pakete (alt: Übungswiese) ----

// Tags eines Pakets (nur Lehrkraft): einzelne Jahrgänge und Schulzweige, je mehrere möglich
export const JAHRGAENGE = [5, 6, 7, 8, 9, 10] as const
export const ZWEIGE = ['Hauptschule', 'Realschule', 'Gymnasium'] as const
export type Zweig = (typeof ZWEIGE)[number]

export type Paket = {
  id: string
  titel: string
  beschreibung: string | null
  jahrgaenge: number[]
  zweige: Zweig[]
  erstellt_am: string
}

export type Zuweisung = {
  id: string
  paket_id: string
  klasse_id: string | null
  schueler_id: string | null
  erstellt_am: string
}

// ---- Antworten der Schüler-Funktionen ----

export type SchuelerPaket = {
  id: string
  titel: string
  beschreibung: string | null
  aufgaben: SchuelerAufgabe[]
}

/** formate_geuebt: Formate, die schon einmal abgegeben wurden (Einstein erklärt nur neue) */
export type SchuelerStart = { pseudonym: string; leseschrift?: boolean; figur?: string; formate_geuebt: AufgabenTyp[]; pakete: SchuelerPaket[] }

export type Loesung = { luecken: { id: number; loesungen: string[] }[] }
