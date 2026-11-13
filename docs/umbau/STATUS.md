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

- **Schritt 2 – Analyse Tastenheld, Assets, Lizenz** (2026-11-13): `docs/umbau/analyse-tastenheld.md` und
  `docs/umbau/asset-inventar.md` (nur gelesen, ZIP nur im Scratchpad entpackt, nichts im Browser getestet).
  Kernpunkte: TastenHeld ist reines JS ohne Framework, für Laptops; kein eigener Diktatmodus (nächster: „race“);
  Regen-Modus ohne Fehler bei Landung; keine Töne; keine Lizenzdatei (Erlaubnis des Urhebers).

- **Schritt 3 – Konzept und Plan** (2026-11-13): `docs/umbau/konzept.md`, von Jazz freigegeben (kein Code, nichts getestet).
  Übung = Zeile in `aufgaben` mit Runden in `loesung.runden`; neue Tabelle `durchgaenge`; je fertigem Durchgang ein `versuch`.

- **Schritt 4 – Archivierung** (2026-11-13): Migration `archiv` (Spalte `archiviert` in `aufgaben` und `pakete`).
  404 alte Übungen und alle 180 Pakete archiviert, die 71 Erklärseiten nicht. Nichts gelöscht: danach weiter 475 Aufgaben,
  180 Pakete, 42 Versuche, 2 Zuweisungen; `geaendert_am` der alten Aufgaben unverändert (Trigger beim Markieren aus).
  Server: `schueler_start`, `sichtbare_aufgaben`, `zugewiesene_aufgabe` (also auch Abgeben und Lösung) ohne Archiviertes;
  Erklärseiten der eigenen Lehrkraft sind ohne Paket lesbar; neue Funktion `erklaerungen_liste`.
  Lehrkraft: Aufgabenliste, Paketliste, Aufgabenauswahl im Paket ohne Archiviertes; Paket/Aufgabe per alter Adresse zeigt
  „gibt es nicht mehr oder archiviert“. Schüler:innen: Menüpunkt „Erklärungen“ (Klasse 5/6, 7/8, 9/10 aufklappbar, darin nach
  Bereich), Leerzustand „Hier kommen bald neue Übungen.“ (Übungen und Einstein auf der Startseite).
  **Getestet:** `npm run test:datenbank` → ALLE TESTS BESTANDEN (132), neuer Block 16 (Archiv, 5 Prüfungen); `npm test` 138 bestanden;
  `lint` und `build` ohne Fehler. Browser (Test-Schüler Otter-33, 1024 × 768 und 1180 × 820): Übungen leer mit neuem Satz,
  Erklärungen mit drei Gruppen, Erklärseite „Großschreibung“ geöffnet und gelesen (+5 Münzen, 115 → 120, danach „Gelesen“),
  Startseite mit neuer Begrüßung, Lernweg zeigt die alten Ergebnisse weiter, keine Fehler in der Konsole.
  **Nicht getestet:** Lehrkraft-Ansicht im Browser (braucht die echte Anmeldung der Lehrkraft); in der Datenbank geprüft:
  0 nicht archivierte Pakete, 71 sichtbare Aufgaben (= Erklärseiten).
  Nachtrag (Jazz): Aufgabenliste der Lehrkraft hat im Filter eine Auswahl **„Aufgabenart“** (z. B. nur Erklärungen)
  (`src/lib/filter.ts`, `src/lehrkraft/ListenFilter.tsx`, `src/lehrkraft/AufgabenListe.tsx`). Getestet: tsc, lint, `npm test` 138, build;
  im Browser nicht getestet (Lehrkraft-Anmeldung nötig).

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
- 2026-11-13 (Jazz, Schritt 2, alle Vorschläge mit Änderungen):
  1. **Neu bauen** in Wortsalat (React/TS, Eingabefeld, Server-Wertung); nur kleine Teile aus TastenHeld als TS übernehmen
     und mit Herkunft kennzeichnen (Fehlerzählung `Tracker`, Fall-Logik aus `rain`, fliegender Schuss, Spielschleife).
  2. Monster: Sprout-Sorry-Pack (Gespenst, Spinnen, Mäuse, Fledermäuse), craftpix-Schleime **und Rübchen**
     (`assets/chomp_idle.png`, 32 × 32, animiert). Keine Orks.
  3. Hintergrund: **`assets/Wiese.png`** (1024 × 576, eigentlich WebP), nicht die TastenHeld-Wiese.
  4. Keine Töne.
  5. TastenHeld-Erlaubnis: In `CREDITS.md` nur „Erlaubnis des Urhebers liegt vor“, ohne Namen oder Mail.
  6. Fallende Wörter: **erst einmal kein Modus ganz ohne Zeitdruck**.
- 2026-11-13 (Jazz, Schritt 3): Konzept freigegeben, alle 14 Punkte wie vorgeschlagen (siehe `konzept.md`, Abschnitt 14), außer:
  - Satz bei nicht befreundet: „Das Monster braucht noch etwas Zeit, um Freundschaft zu schließen. Morgen kannst du es noch einmal versuchen!“
  - Hintergrund ist **`assets/orig.png`** (576 × 324), Quelle https://free-game-assets.itch.io/nature-landscapes-free-pixel-art,
    frei verfügbar (ersetzt `Wiese.png` aus Schritt 2).
  - Kurz: Münzen ★ 20/30/40 × Anteil, Freundschaft +10/15/20 einmalig, Wiederholen nur Differenz, Diktat 100 % im Wiederholen +10/15/20;
    6 Runden je Durchgang mit Pool; Abschreiben ein Herz je Wort; Sterne-Aufstieg ab 2 Übungen je Bereich und Stufe;
    Standard-Monster Rübchen; ohne Internet „Nochmal senden“.
- 2026-11-13 (Jazz, Schritt 4): Archivieren per Migration wie vorgeschlagen; **kein** zusätzlicher Export nach `archiv/`
  (Texte in `inhalte/*.txt`, Sicherung lokal); alte Ergebnisse zählen weiter im Lernstand; Menüpunkt „Erklärungen“ zwischen
  Übungen und Lernweg, Erklärseiten bleiben in der Aufgabenliste der Lehrkraft.

## Geänderte Dateien
- Schritt 0: `docs/umbau/STATUS.md`, `docs/umbau/ARBEITSPLAN.md` (neu), `.gitignore`, `CLAUDE.md`
- Schritt 1: `docs/umbau/analyse-wortsalat.md` (neu), `docs/umbau/STATUS.md`
- Schritt 2: `docs/umbau/analyse-tastenheld.md` (neu), `docs/umbau/asset-inventar.md` (neu), `docs/umbau/STATUS.md`

- Schritt 3: `docs/umbau/konzept.md` (neu), `docs/umbau/asset-inventar.md`, `docs/umbau/STATUS.md`
- Schritt 4: `supabase/migrations/20261113140000_archiv.sql` (neu), `supabase/tests/zugriffsregeln.sql`,
  `src/schueler/Erklaerungen.tsx` (neu), `src/schueler/SchuelerBereich.tsx`, `src/schueler/speicher.ts`, `src/schueler/einstein.md`,
  `src/gemeinsam/Symbol.tsx`, `src/design/bausteine.css`, `src/lehrkraft/AufgabenListe.tsx`, `src/lehrkraft/PaketListe.tsx`,
  `src/lehrkraft/PaketDetail.tsx`, `src/lehrkraft/AufgabeEditor.tsx`, `docs/umbau/STATUS.md`

## Offene Fragen
- Lizenztext zu `assets/orig.png` beim Einbau (Schritt 8) in `src/grafik/LIZENZ.md` übernehmen.
- Ganz ohne Zeitdruck bei „Fallende Wörter“ ist zurückgestellt. Steht in Abschnitt B von ARBEITSPLAN.md noch als Wunsch;
  im Konzept (Schritt 3) als „später“ führen.

- Bitte im Browser als Lehrkraft prüfen: Aufgabenliste zeigt nur die 71 Erklärseiten, Paketliste ist leer.
- „Mein Lernweg“ sagt unter „Dein nächster Schritt“ weiter „Mach weiter mit deinen Übungen. Weiter üben“, auch wenn es gerade
  keine Übungen gibt. Erledigt sich mit den neuen Übungen; sonst später anpassen.
- DB-Test Block 15 (Belohnungen, Igel-11) schlug einmal fehl (1 / 1) und lief danach dreimal durch; vermutlich zeitabhängig. Beobachten.
- Erklärungen sind innerhalb einer Klassenstufe alphabetisch nach Bereich geordnet (Rechtschreibung, Satzglieder …).

## Nächster Schritt
- Schritt 5 – Neues Datenmodell und Spiellogik (ohne Oberfläche).
