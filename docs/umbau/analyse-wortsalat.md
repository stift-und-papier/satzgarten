# Bestandsanalyse Wortsalat (Schritt 1, 2026-11-13)

Stand: Commit 5b1de9c (Tag `vor-uebungsumbau`). Nur gelesen, nichts geändert. Zahlen aus der Live-Datenbank vom 2026-11-13.

## 1. Technik und Projektstruktur

- **Stack:** Vite 8 + React 19 + TypeScript 7, statische Seite (GitHub Pages, `/wortsalat/`), Bau-Ziel Safari 15.
  Bibliotheken: `@supabase/supabase-js`, `@dnd-kit/*` (Ziehen), `qrcode`. Tests: vitest (`src/**/*.test.ts`), oxlint,
  Datenbank-Test `supabase/tests/zugriffsregeln.sql` (1140 Zeilen, `npm run test:datenbank`).
- **Server:** Supabase (Postgres, Frankfurt). Alle Logik mit Lösungen, Münzen, Wachstum läuft in SQL-Funktionen
  (`security definer`), aufgebaut aus 31 Migrationen in `supabase/migrations/`.
- **Adressen** (Hash-Router `src/lib/router.ts`, Einstieg `src/App.tsx`):
  - `#/s/<token>/…` Schüleransicht (`src/schueler/SchuelerBereich.tsx`)
  - `#/lehrkraft/…` Lehrkraft (`src/lehrkraft/LehrkraftRahmen.tsx`)
  - `#/vorschau` nur beim Entwickeln (`src/entwicklung/Vorschau.tsx`)
- **Ordner:**
  - `src/lib/` Logik ohne Oberfläche (Parser `lueckentext.ts`, `diktat.ts`, `lernstand.ts`, `landschaft.ts`, `shop.ts`, `kategorien.ts`, …)
  - `src/gemeinsam/` Bausteine für beide Ansichten (Aufgaben-Anzeige, Einstein, Sterne, Symbole, Sprite)
  - `src/schueler/` Schüleransicht (Farm, Shop, Album, Lernweg, Hilfe, Texte `einstein.md`, `hilfe.md`)
  - `src/lehrkraft/` Lehrkraft-Seiten
  - `src/design/` `tokens.css`, `bausteine.css`, `lehrkraft.css`, `garten.css`, Schriften (Fraunces, Nunito, OpenDyslexic)
  - `src/grafik/` benutzte Einzelbilder (Sprout Lands, Humble Gift, eigene) mit `LIZENZ.md`, Liste `index.ts`
  - `scripts/` Erzeuger (Farben, Pixel-Rahmen, Grafik holen, `inhalte-sql.ts`, `kompetenzen-sql.ts`)
  - `inhalte/*.txt` Quelltexte der Übungspakete (21 Dateien)

## 2. Datenmodell (alles in Supabase, Schema `public`)

| Tabelle | Inhalt | Zeilen |
|---|---|---|
| `aufgaben` | eine Aufgabe = ein Format; `typ`, `titel`, `anweisung`, `hinweis`, `stufe` (1–3 Sterne), `farbig`, `loesung` (jsonb, Eingabe der Lehrkraft mit Lösungen), `inhalt` (jsonb, Schüler-Fassung ohne Lösungen, **nur per Trigger** `aufgabe_vorbereiten` → `inhalt_ohne_loesung`) | 475 |
| `aufgabe_kompetenzen` | Aufgabe ↔ Kompetenz (KC-Zuordnung) | 1438 |
| `kompetenzen` | Kompetenzen aus `docs/kompetenzen.csv` mit Kurzname, Bereich, KC | 154 |
| `pakete` | `titel`, `beschreibung`, Tags `jahrgaenge[]`, `zweige[]` | 180 |
| `paket_aufgaben` | Paket ↔ Aufgabe mit `position` | 1752 |
| `zuweisungen` | Paket → Klasse **oder** Schüler:in | 2 |
| `versuche` | jede Abgabe: `antworten`, `ergebnis`, `anteil_richtig`, `richtig`, `zaehlt_fuer_lernstand`, `paket_id`, Zeitstempel | 42 |
| `loesung_angesehen` | wer bei welcher Aufgabe „Lösung ansehen“ gedrückt hat | 0 |
| `schueler_stufen` | automatische Sterne-Stufe je Schüler:in und Bereich | 2 |
| `schueler` | Pseudonym, Token, `stufe_manuell` | 7 |
| `einstellungen` | Lernstand-Regeln und Texte der Lehrkraft | 1 |
| `muenz_ereignisse` | jede Münzbuchung (Grund, Schlüssel gegen Doppelbuchung) | 57 |
| `shop_artikel`, `besitz`, `pflanzungen`, `vorrat`, `fuetterungen`, `belohnungen` | Farm und Shop | 38 / 37 / 10 / 19 / 3 / 7 |

Aufgaben nach Format: Auswahl 144, Lückentext 71, Erklärung 71, Überarbeiten 60, Zuordnen 58, Fehler 52, Diktat 10, Reihenfolge 9.
Zuweisungen: „Sprachgebrauch 7/8: leicht“ → Klasse Test, „Rechtschreibung 7/8: leicht“ → Klasse Lernstand-Demo.

**Löschregeln (wichtig für die Archivierung):** Wird eine Aufgabe gelöscht, löscht die Datenbank automatisch auch ihre
`versuche`, `loesung_angesehen`, `paket_aufgaben` und `aufgabe_kompetenzen` (cascade). Wird ein Paket gelöscht, fallen
`zuweisungen` und `paket_aufgaben` weg, `versuche.paket_id` wird leer. Münzbuchungen bleiben, verlieren aber den Bezug zum Versuch.

Typen im Code: `src/lib/typen.ts` (`Aufgabe`, `LueckentextInhalt`, `Pruefergebnis`, `SchuelerAufgabe`, `Paket`, `Zuweisung`).

## 3. Aufgabenformate

Gemeinsames Gerüst: `src/gemeinsam/AufgabeBearbeiten.tsx` → `AufgabeUeben` (alle Formate außer Diktat und Erklärung),
`DiktatAufgabe` (`DiktatAnzeige.tsx`), `ErklaerSeite`. Eine Aufgabe enthält **mehrere Stellen** (Lücken, Auswahlen, Wörter, Sätze),
die zusammen mit **einem** „Prüfen“ abgegeben werden. Die Lehrkraft schreibt alles als Text mit `[Klammern]`; Parser `src/lib/lueckentext.ts`.

| Format (`typ`) | Eingabe | Anzeige-Datei |
|---|---|---|
| `lueckentext` | Tippen in Lücken (`Eingabe.tsx`), optional Hinweis „(Rad + fahren)“ | `LueckentextAnzeige.tsx` |
| `auswahl` | Chips antippen oder Dropdown, ein- oder mehrfach | `LueckentextAnzeige.tsx` (`Auswahl`) |
| `zuordnen` | Stift (Kategorie) wählen, Wörter antippen | `LueckentextAnzeige.tsx` |
| `fehler` | falsche Wörter antippen, optional richtige Form eintippen | `LueckentextAnzeige.tsx` |
| `reihenfolge` | Bausteine ziehen oder antippen (dnd-kit), ggf. mehrere Varianten | `ReiheAnzeige.tsx` |
| `ueberarbeiten` | bessere Satzversion wählen, Hinweise erst nach dem Prüfen | `VersionenAnzeige.tsx` |
| `diktat` | Abschreiben (Laufband, Cursor wartet aufs richtige Zeichen) oder Merkdiktat (Teil zeigen → merken → tippen) | `DiktatAnzeige.tsx`, `src/lib/diktat.ts` |
| `erklaerung` | nur lesen, „Weiter“ | `AufgabeBearbeiten.tsx` (`ErklaerSeite`) |

**Prüfen:** Die App schickt die Antworten an `antwort_abgeben` (Server). Der prüft mit `pruefe_aufgabe` / `pruefe_diktat` /
`pruefe_reihe` gegen `aufgaben.loesung`, speichert einen `versuch`, bucht Münzen (`muenzen_fuer_versuch`), aktualisiert die Stufe
(`stufen_aktualisieren`) und gibt nur zurück: je Stelle richtig/nicht richtig (Fehlerfinden: nicht gefundene Fehler ohne Ort),
Anteil, Rückmeldung, Münzen. Der gleiche Vergleich steckt für die Vorschau der Lehrkraft in TypeScript (`src/lib/lueckentext.ts`, `diktat.ts`).
Ohne Internet landet der Versuch in einer Warteliste auf dem iPad (`src/schueler/speicher.ts`).

**Ablauf heute:** Falsche Stellen bekommen ↻, richtige werden gesperrt, man ändert und drückt „Nochmal prüfen“ – beliebig oft.

**Richtige Lösung anzeigen:** **Nicht automatisch.** Nur über den Knopf „Lösung ansehen“ (mit Nachfrage) → `loesung_anzeigen`,
danach keine Münzen und zählt nicht für den Lernstand. Ausnahme Merkdiktat: zeigt nach dem Tippen den richtigen Text mit markierten Fehlerwörtern.
Abschreiben braucht keine Lösungsanzeige (Cursor wartet).

**Eingabefelder:** Alle Schülereingaben laufen über `src/gemeinsam/Eingabe.tsx` (Autokorrektur, Großschreibung, Rechtschreibprüfung, Vorschläge aus). Geprüft: auch Diktat nutzt es.

## 4. Lehrkraft-Editor

- **Aufgaben:** Liste `src/lehrkraft/AufgabenListe.tsx` (Filter `ListenFilter.tsx` nach Format, Kompetenz, Schulform; Sortierung
  `src/lib/sortierung.ts` nach Titel, Format, Sterne, Kompetenz, KC; Löschen je Zeile). Neu: `FormatWahl.tsx` → `AufgabeEditor.tsx`
  (960 Zeilen): Titel, Anweisung, Sterne-Stufe (`StufenFeld`), Fachbegriff-Farben an/aus, Hinweis (Tipp), Rückmeldung bei Fehler,
  Kompetenzen (`KompetenzAuswahl.tsx`), Text mit `[Klammern]` je Format, Diktat-Teilung, Vorschau mit Probe-Prüfen (`pruefe_aufgabe`).
- **Pakete:** `PaketListe.tsx`, `NeuesPaket` (in `PaketDetail.tsx`), `PaketDetail.tsx`: Aufgaben hinzufügen/entfernen, ordnen
  (Position), Tags Jahrgänge/Zweige (`PaketTags.tsx`), Zuweisen an Klasse oder Schüler:in, Vorschau, Löschen.
- **Klassen:** `KlassenListe.tsx`, `KlasseDetail.tsx` (Pseudonyme, manuelle Stufe, Münzen schenken, **Ergebnisse zurücksetzen**
  → `ergebnisse_zuruecksetzen` löscht Versuche **und** Münzen der Ausgewählten), `Linkliste.tsx` (QR-Links).
- **Lernstand:** `Lernstand.tsx`, `LernstandAnzeige.tsx`, `Einstellungen.tsx`, `Kompetenzen.tsx`.
- **Inhalte in großer Zahl** kommen nicht über den Editor, sondern per Skript `scripts/inhalte-sql.ts` aus `inhalte/*.txt`
  (feste ids, `on conflict do update`, löscht und schreibt `paket_aufgaben` neu).

## 5. Schüler-Startseite und Weg zu den Übungen

`SchuelerBereich.tsx` lädt `schueler_start` (Pseudonym, Pakete mit sichtbaren Aufgaben), `schueler_muenzen`, `belohnungen_holen`.
- **Start (`#/s/<token>`):** Einstein begrüßt (Texte `einstein.md`), Kasten „Dein nächster Schritt“ (erste ungelöste Aufgabe), darunter die Farm.
- **Menü unten:** Farm, Shop, Übungen, Lernweg, Hilfe. Album über Knopf auf der Farm.
- **Übungen (`/uebungen`):** Liste der zugewiesenen Pakete („2 von 5 Aufgaben geschafft“); leer: „Für dich gibt es gerade keine Übungen …“.
- **Paket (`/p/<paket>`):** nummerierte Aufgabenliste mit Stand und Sternen.
- **Aufgabe (`/p/<paket>/a/<aufgabe>`):** „Aufgabe n von m“, Zurück, „Weiter“/„Fertig“ zur nächsten Aufgabe des Pakets.
- **Welche Aufgaben sichtbar sind**, entscheidet der Server (`sichtbare_aufgaben`): alle Erklärseiten plus je Bereich nur die
  Aufgaben **einer** Sterne-Stufe (der höchsten bis zur Stufe der Schüler:in im Bereich).

## 6. Erklärseiten

- Erklärseiten sind **keine eigenen Seiten**, sondern Aufgaben mit `typ = 'erklaerung'` (71 Stück) **innerhalb der Pakete**
  (612 Verknüpfungen, jedes Thema beginnt mit einer). Inhalt in `loesung.erklaerung` (Text, Merkkasten, Beispiele).
- Erreichbar nur über ein zugewiesenes Paket. Von dort gibt es **keine eigenen Links** zu Übungen, nur „Weiter“ zur nächsten Aufgabe im Paket.
- Erstes Lesen gibt einmalig 5 Münzen (`muenzen_fuer_versuch`, Grund `erklaerung`).

## 7. Wo hängen …

- **KC-Zuordnung:** `aufgabe_kompetenzen`; KC der Schüler:in kommt aus der Klasse (`klassen.kerncurriculum`, `schueler_kc`);
  Bereich einer Aufgabe = `aufgabe_bereich`. Lernstand rechnet je Kompetenz aus `versuche` (`gewertete_versuche`, `auswertung`,
  `lernstand_klasse`, `lernstand_schueler`), Anzeige `src/lib/lernstand.ts`. Lernweg der Schüler:innen: `schueler_entwicklung`, `Lernweg.tsx`.
- **Sterne-Stufen:** `aufgaben.stufe`; Stufe der Schüler:in: `stufe_manuell` oder automatisch `schueler_stufen` (Aufstieg 80 % im
  ersten Versuch bei mindestens 5 Aufgaben je Bereich und Stufe, `stufe_aufstieg`/`stufen_aktualisieren`). Wirkt auf Sichtbarkeit
  (`sichtbare_aufgaben`), Münzen (★ 10 / ★★ 15 / ★★★ 20) und Lernstand-Punkte (70/85/100).
- **Schriftart OpenDyslexic:** `src/lib/leseschrift.ts` setzt `data-leseschrift='lrs'` am `<html>`, `tokens.css` tauscht die Schrift.
  Schalter auf der Hilfe-Seite, **gespeichert nur auf dem Gerät** (localStorage), nicht je Schüler:in in der Datenbank.
  Wirkt auf alle HTML-Texte; Text in einem Canvas würde es nicht automatisch übernehmen.
- **Münzvergabe:** nur Server, `muenzen_fuer_versuch` (heute einmal pro Aufgabe und Tag, 2. Versuch des Tages halb, nach „Lösung
  ansehen“ nichts; Diktat ab 90 % 30, besser 10, fehlerfrei 20; Erklärseite 5), Kalendertag Europe/Berlin (`heute()`, `gespeichert_am`).
  Kontostand `kontostand`/`schueler_muenzen`, verdient `verdient` (schaltet Shop frei), Geschenke `muenzen_schenken`.

## 8. Risiken beim Archivieren und Umbauen

1. **Nicht löschen, sonst verschwindet der Lernstand.** Löschen einer Aufgabe löscht ihre Versuche (cascade) → Lernstand,
   Lernweg und Belohnungen würden sich ändern. Archivieren muss eine Markierung sein (z. B. Spalte `archiviert`), kein Löschen.
2. **Erklärseiten hängen in den alten Paketen.** Werden alle alten Pakete ausgeblendet, sind auch die 71 Erklärseiten nicht mehr
   erreichbar. Sie brauchen einen neuen Ort (eigene Liste oder in den neuen Paketen).
3. **Zuweisungen:** zwei bestehende Zuweisungen zeigen auf alte Pakete. Ausblenden muss in `schueler_start` und in allen
   Lehrkraft-Listen (`PaketListe`, `PaketDetail`-Auswahl, `AufgabenListe`, `KlasseDetail`) greifen, sonst tauchen Archivierte doch auf.
4. **Skript `inhalte-sql.ts`** würde archivierte Aufgaben/Pakete bei erneutem Ausführen wieder überschreiben (`on conflict do update`).
   Es dürfte die Archiv-Markierung nicht anfassen – oder nicht mehr laufen.
5. **Lernstand und Münzen hängen an `versuche` je Aufgabe.** Das neue Modell (Übung aus Runden) muss festlegen, ob ein Versuch je
   Runde oder je Übung gespeichert wird; davon hängen `gewertete_versuche`, Sterne-Aufstieg (zählt Aufgaben) und Münzen ab.
6. **Sterne-Auswahl im Paket** (`sichtbare_aufgaben` zeigt je Bereich nur eine Stufe) muss zum neuen Aufbau passen.
7. **„Lösung ansehen“ und „Nochmal prüfen“** passen nicht zu „eine Runde = ein Prüfen“. Plan sagt „Lösung wird schon angezeigt“ –
   das stimmt heute nur nach „Lösung ansehen“ und beim Merkdiktat.
8. **Lehrkraft-Reset:** „Ergebnisse zurücksetzen“ löscht heute Versuche **und** Münzen. Für „Versuch früher freigeben“ braucht es
   einen sanfteren Knopf, der nichts löscht.
9. **Offline-Warteliste** (`speicher.ts`) speichert Versuche je Aufgabe; muss zum neuen Speicherformat passen, sonst gehen Antworten verloren.
10. **Monster gab es schon einmal** (Migration `20261112200000_monster.sql`, entfernt in `…260000_kampf_weg.sql`, Spec
    `docs/SPEC-monster.md`). Nützlich als Vorlage; Lizenzen der Orks/Schleime damals craftpix (Bilder wurden entfernt).
11. **DB-Test** `zugriffsregeln.sql` prüft u. a., dass Schüler-Funktionen keine Lösungen herausgeben – muss für neue Funktionen erweitert werden.
