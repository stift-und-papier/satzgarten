# Übungsumbau – Stand

## Erledigt
- **Schritt 0 – Sicherung und Arbeitsumgebung** (2026-11-13)
  - Git geprüft: `main` war sauber und gleich mit GitHub (Commit 5b1de9c).
  - Tag `vor-uebungsumbau` auf 5b1de9c gesetzt, Branch `uebungsumbau` angelegt.
  - Arbeitsplan nach `docs/umbau/ARBEITSPLAN.md` verschoben, Pfade zu Tastenheld und Assets eingetragen.
  - `usability-test/` und `sicherung-*/` in `.gitignore` (nur lokal, nie ins öffentliche Repo).
  - Hinweis in `CLAUDE.md`: beim Übungsumbau zuerst ARBEITSPLAN.md und STATUS.md lesen.
  - Datensicherung: alle 19 Tabellen (Schema `public`) als JSON nach `sicherung-2026-11-13/` (nur lokal, 2,6 MB).
    Zeilenzahl je Tabelle geprüft, z. B. aufgaben 475, pakete 180, paket_aufgaben 1752, versuche 42, schueler 7.
    Nicht gesichert: das Lehrkraft-Konto (Supabase-Anmeldung, liegt außerhalb `public`) – ändert der Umbau nicht.
- **Schritt 1 – Bestandsanalyse** (2026-11-13): `docs/umbau/analyse-wortsalat.md` (nur gelesen: Code und Live-Datenbank,
  nichts im Browser getestet). Kernpunkte: Aufgaben löschen löscht ihre Versuche (cascade) → nur markieren; Erklärseiten
  stecken als `typ = 'erklaerung'` in den alten Paketen; Leseschrift ist heute nur auf dem Gerät gespeichert.

## Datenorte
- **Datenbank Supabase** (Projekt `diwpqkxhmuetdpxxcoar`, Frankfurt): Klassen, Pseudonyme, Aufgaben, Pakete, Zuweisungen,
  Versuche, Lernstände, Münzen, Farm, Besitz. Aufbau nur über `supabase/migrations/` (31 Migrationen).
- **Aufgaben-Quelltexte** im Repo: `inhalte/*.txt` (21 Dateien), eingespielt per `scripts/inhalte-sql.ts`.
- **Auf dem iPad** (localStorage, nur Komfort): Leseschrift, Dunkler Modus, Entwürfe/Warteliste (`src/schueler/speicher.ts`).
- **Tastenheld:** `C:\Users\jrkug\Projekte\TastenHeld-main.zip`, Assets darin unter `TastenHeld-main\assets`.

## Zurück zum alten Stand
- Alter Stand = Tag `vor-uebungsumbau`; alles Neue nur auf Branch `uebungsumbau`; die Webseite baut nur aus `main`.
- Verwerfen: auf `main` wechseln, Branch löschen; Datenbank aus `sicherung-2026-11-13/` zurückspielen.

## Entscheidungen
- 2026-11-13 (Jazz): alle Vorschläge aus Schritt 0 angenommen (Plan verschieben, `usability-test/` ignorieren,
  Datensicherung als JSON lokal, Hinweis in CLAUDE.md). Assets = Ordner in der Tastenheld-ZIP.
- 2026-11-13 (Jazz, Schritt 1, alle Vorschläge angenommen):
  1. Archivieren = Markierung, nie löschen (Versuche/Lernstand bleiben).
  2. Erklärseiten bekommen einen eigenen Menüpunkt „Erklärungen“ für alle Schüler:innen, geordnet nach Doppeljahrgang
     und Thema (genaue Form im Konzept, Schritt 3).
  3. Leseschrift: Haken je Schüler:in durch die Lehrkraft (schaltet ein) **und** weiterhin selbst umschaltbar am Gerät
     (braucht Datenbank-Änderung, vor dem Bauen nochmal Bescheid geben).
  4. „Versuch früher freigeben“ ist ein eigener, sanfter Knopf, der nichts löscht; „Ergebnisse zurücksetzen“ bleibt wie es ist.
  5. `scripts/inhalte-sql.ts` läuft ab dem Umbau nicht mehr (würde Archiviertes zurückholen).
  6. Nach „Prüfen“ zeigt jede Runde sofort die richtige Lösung; „Lösung ansehen“ und „Nochmal prüfen“ entfallen
     (Einzelheiten im Konzept, Schritt 3).

## Geänderte Dateien
- Schritt 0: `docs/umbau/STATUS.md`, `docs/umbau/ARBEITSPLAN.md` (neu), `.gitignore`, `CLAUDE.md`
- Schritt 1: `docs/umbau/analyse-wortsalat.md` (neu), `docs/umbau/STATUS.md`

## Offene Fragen
- keine

## Nächster Schritt
- Schritt 2 – Analyse Tastenheld, Assets, Lizenz (nur lesen).
