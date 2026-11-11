# Aufgabenliste: Wortsalat

Grundlage: `docs/SPEC.md`, `tasks/plan.md`. Größe: S = 1–2 Dateien, M = 3–5 Dateien.
Für **jede** Aufgabe gilt zusätzlich: `npm test`, `npm run lint` und `npm run build` laufen fehlerfrei, und nach jeder
Migration läuft `npm run test:datenbank` mit dem Ergebnis „ALLE TESTS BESTANDEN“.
„Alt:“ = Datei aus der Übungswiese (`C:\Users\jrkug\Projekte\deutsch-uebungen`), die übernommen und angepasst wird.
Die alte Satzgarten-Liste steht im Git-Verlauf (Commit `bb6e9e6`); ihre erledigten Aufgaben 1–6 sind die Grundlage.

---

## Phase 1: Umbenennen (`umbenennen`)

- [x] **1 Repo und Adresse umbenennen** (M)
  - Akzeptanz: GitHub-Repo `stift-und-papier/wortsalat` (per `gh repo rename`), `git remote` angepasst;
    Pfad-Basis `/wortsalat/` in `vite.config.ts`; Paketname, Seitentitel, README; Veröffentlichung läuft.
  - Prüfen: `https://stift-und-papier.github.io/wortsalat/` zeigt die App; Lauf in GitHub Actions grün.
  - Dateien: `vite.config.ts`, `package.json`, `index.html`, `README.md`

- [x] **2 Texte, Regeln und Aufräumen** (M) – hängt an 1
  - Akzeptanz: „Satzgarten“ → „Wortsalat“ in allen Oberflächentexten; `CLAUDE.md` neu gefasst (Name, Einstein,
    Pixel-Look, Figuren erlaubt, Münzen als Zahlen, Tastatur, Korrektur aus, Lizenzen, Entscheidungsprotokoll fortgeführt);
    Garten-Entwurf (`Garten.tsx`, `garten.css`, `GartenVorschau.tsx`, Garten-Tokens) und Albert-Vorschau entfernt;
    Albert (`Maskottchen.tsx`) ebenfalls entfernt; die Sprechblase bleibt für Einstein.
  - Prüfen: `grep -ri satzgarten src` findet nichts mehr außer im Protokoll; Bauen, Tests und Hallmark-Prüfung grün.
  - Dateien: `CLAUDE.md`, `src/App.tsx`, `src/stil/*`, `src/design/tokens.css`, `src/lehrkraft/LehrkraftRahmen.tsx`

- [x] **3 Lehrkraft-Konto und Anmeldung testen** (S) – hängt an 1
  - Akzeptanz: Lehrkraft legt ihr Konto im Supabase-Dashboard an (Selbst-Registrierung aus, „Auto Confirm User“),
    Anzeigename des Supabase-Projekts „wortsalat“; Anmelden und Abmelden unter der neuen Adresse klappt.
  - Prüfen: Lehrkraft meldet sich am Laptop und am iPad an.
  - Dateien: keine (Anleitung Schritt für Schritt)

### Haltepunkt 1
- [x] Seite läuft unter `/wortsalat/`, Anmeldung klappt, nirgends steht mehr „Satzgarten“.
  Danach (am Ende einer Sitzung): Projektordner in `C:\Users\jrkug\Projekte\wortsalat` umbenennen (Lehrkraft im Explorer).
  Erste Frage der nächsten Sitzung: Liegt das Projekt in `…\wortsalat`? Dann weiter mit Phase 2.

---

## Phase 2: Design (`design`)

- [x] **4 Grafik-Ordner und Sprite-Baustein** (M) – hängt an 2
  - Akzeptanz: Skript `scripts/grafik-holen.mjs` schneidet benannte Bilder aus `assets/` (lokal) nach `src/grafik/`;
    `src/grafik/LIZENZ.md` (Sprout Lands, Cup Nooble; TastenHeld); Baustein `Sprite` zeigt ein Bild bzw. Einzelbild
    eines Spritesheets ganzzahlig vergrößert und scharf (`image-rendering: pixelated`); nur benutzte Bilder im Repo.
  - Prüfen: Test für die Auswahl eines Einzelbilds; `git status` zeigt nichts aus `assets/`.
  - Dateien: `scripts/grafik-holen.mjs`, `src/grafik/LIZENZ.md`, `src/gemeinsam/Sprite.tsx`, `src/lib/sprite.ts` + Test

- [x] **5 Schrift mit Umlauten** (S) – hängt an 4
  - Akzeptanz: 2–3 Entwürfe nebeneinander (z. B. Pixel-Schrift mit selbst gezeichneten Ä Ö Ü ä ö ü ß, eine lokale,
    frei lizenzierte Pixel-Schrift mit Umlauten, eine ruhige Textschrift zu Pixel-Überschriften); Lehrkraft wählt;
    Lesbarkeit für LRS (Leseschrift bleibt umschaltbar).
  - Prüfen: Entwurfsseite am iPad (`#/stil/schrift`); Satz mit allen Umlauten und ß; Freigabe.
  - Stand 2026-11-11: Paket-Schrift (Sprout Lands) hat nur Großbuchstaben, keine Umlaute/ß. Entwürfe A–C mit Pixelify Sans und Silkscreen (OFL, lokal). Gewählt: B (Pixelify Sans nur für h1/h2), Entwurfsseite und Silkscreen entfernt.
  - Dateien: `src/design/fonts/*`, `src/design/tokens.css`, Entwurfsseite

- [ ] **6 Pixel-Stilblatt** (M) – hängt an 4, 5
  - Akzeptanz: Farben aus der Sprout-Lands-Palette in `tokens.css` (hell, dunkel, mehr Kontrast, dunkel + mehr Kontrast;
    Kontrast ≥ 4,5:1 nachgerechnet); Bausteine im Pixel-Look: Fenster/Karte, Hauptknopf, runder Knopf, Menüleiste unten,
    Lücke, Auswahl, Rückmeldung ✓/↻ (nie rot), Münzanzeige; Fachbegriff-Farben eingebunden; Lehrkraft-Thema bleibt.
  - Prüfen: Seite `#/stil` am iPad (quer, hochkant) und Laptop; Hallmark-Prüfung; Freigabe.
  - Dateien: `src/design/tokens.css`, `src/design/bausteine.css`, `src/stil/Stilblatt.tsx`

- [ ] **7 Einstein** (M) – hängt an 4
  - Akzeptanz: aus den eigenen Vorlagen (`assets/*.jpg`) ein Pixel-Spritesheet mit durchsichtigem Hintergrund
    (Posen nach Absprache, z. B. freundlich, freut sich, nachdenklich, zeigt, erschrocken, traurig); ruhige Bewegung
    (aus bei „Bewegung reduzieren“); Sprechblase aus dem UI-Paket; Figur `aria-hidden`, Sprechblase nicht.
  - Prüfen: Vorschauseite am iPad; Freigabe.
  - Dateien: `src/grafik/einstein.png`, `src/gemeinsam/Einstein.tsx` (ersetzt `Maskottchen.tsx`), `src/design/bausteine.css`

### Haltepunkt 2
- [ ] **Lehrkraft gibt Schrift, Pixel-Stil und Einstein frei.** Ohne Freigabe keine Schülerseiten.

---

## Phase 3: Klassen und Kompetenzen (`klassen`, `kompetenzen`)

- [ ] **8 Klassen und Pseudonyme** (M) – hängt an 3
  - Akzeptanz: Tabellen `klassen` (owner, name, kerncurriculum HS/RS/Gym), `schueler` (owner, klasse_id, pseudonym,
    token 192 Bit, stufe_manuell); RLS `owner = auth.uid()`; anlegen/umbenennen/löschen; Pseudonyme automatisch
    („Fuchs-07“) oder aus eigener Liste.
  - Prüfen: DB-Test (Lehrkraft B sieht Klassen von A nicht); Tests Pseudonyme (alt).
  - Dateien: Migration, `src/lehrkraft/KlassenListe.tsx`, `src/lehrkraft/KlasseDetail.tsx`, `src/lib/pseudonyme.ts` (alt)

- [ ] **9 Linkliste mit QR-Codes** (S) – hängt an 8
  - Akzeptanz: alle Links einer Klasse mit QR-Code, druckbar (A4, ohne Hintergrund).
  - Prüfen: Druckvorschau; QR-Code am iPad öffnet den richtigen Link.
  - Dateien: `src/lehrkraft/Linkliste.tsx`, Druck-CSS

- [ ] **10 Kompetenzen** (M) – hängt an 3
  - Akzeptanz: Tabelle `kompetenzen` (owner, code, kerncurriculum, bereich, stufe, kompetenz, hinweis, kurzname,
    ausgeblendet); Import der 154 Zeilen aus `docs/kompetenzen.csv`; Seite mit Kurzname ändern und Ausblenden.
  - Prüfen: 154 Kompetenzen (Gym 44, RS 56, HS 54); Tests CSV-Lesen (alt).
  - Dateien: Migration, `scripts/kompetenzen-sql.ts` (alt), `src/lehrkraft/Kompetenzen.tsx`, `src/lib/csvLesen.ts` (alt)

### Haltepunkt 3
- [ ] Lehrkraft legt eine Testklasse an, druckt die Linkliste, prüft Kompetenzen und Kurznamen.

---

## Phase 4: Aufgaben (`aufgaben`)

- [ ] **11 Aufgaben-Grundlage, Lückentext, Eingabe ohne Korrektur** (M) – hängt an 10, Haltepunkt 2
  - Akzeptanz: Tabelle `aufgaben` mit getrennten Feldern `inhalt` und `loesung`, `aufgabe_kompetenzen`;
    Verteiler `pruefe_aufgabe` + `pruefe_lueckentext`; Editor mit Format-Kacheln und Live-Vorschau; Parser `[Lösung]`;
    **gemeinsames Eingabefeld** mit `autocorrect="off"`, `autocapitalize="off"`, `spellcheck="false"`, `autocomplete="off"`.
  - Prüfen: Parser-Tests (alt); DB-Test: Token bekommt Aufgabe ohne `loesung`; **iPad mit Tastatur: falsch
    getipptes Wort bleibt falsch, Satzanfang bleibt klein.**
  - Dateien: Migration, `src/lib/lueckentext.ts` (alt), `src/lehrkraft/AufgabeEditor.tsx`, `src/gemeinsam/Eingabe.tsx`, `src/gemeinsam/LueckentextAnzeige.tsx`

- [ ] **12 Format Auswahl** (S) – hängt an 11 · `[das | *dass]`, Einfach- und Mehrfachauswahl. Prüfen: Parser-Tests, DB-Test „keine Lösung“, Vorschau.
- [ ] **13 Format Fehler finden** (S) – hängt an 11 · `[weis -> weiß]`, nur finden oder finden + eintippen. Prüfen: wie 12.
- [ ] **14 Format Zuordnen** (S) – hängt an 11 · `[Der kleine Hund = Subjekt]`, Textmarker-Bedienung. Prüfen: wie 12.
- [ ] **15 Format Reihenfolge** (M) – hängt an 11 · Bausteine mit `|`, Varianten, antippen und ziehen (dnd-kit). Prüfen: wie 12 + Ziehen am iPad.
- [ ] **16 Format Sätze verbessern** (S) – hängt an 11 · 2–4 Versionen, Hinweise erst nach dem Prüfen. Prüfen: wie 12; DB-Test Hinweise.
- [ ] **17 Erklärseite** (S) – hängt an 11 · Text, Merkkasten, Beispiele; zählt nie für Lernstand. Prüfen: DB-Test `zaehlt_fuer_lernstand = false`.

- [ ] **18 Aufgabenliste mit Filter und Sortierung** (M) – hängt an 11
  - Akzeptanz: Titelsuche, Jahrgang, Bereich, Kompetenz; Sortieren nach Titel/Format/Stufe.
  - Prüfen: Tests Filter und Sortierung (alt).
  - Dateien: `src/lib/filter.ts` (alt), `src/lib/sortierung.ts` (alt), `src/lehrkraft/AufgabenListe.tsx`

- [ ] **19 Fachbegriff-Farben in Anweisungen** (S) – hängt an 11
  - Akzeptanz: `Anweisung.tsx` färbt Fachbegriffe in Aufgaben automatisch, je Aufgabe abschaltbar.
  - Prüfen: vorhandene Tests `kategorien.test.ts`; Vorschau.

### Haltepunkt 4
- [ ] Lehrkraft erstellt je Format eine Aufgabe und prüft sie in der Vorschau; iPad korrigiert nichts.

---

## Phase 5: Diktat (`diktat`)

- [ ] **20 Spec Diktat** (S)
  - Akzeptanz: `docs/SPEC-diktat.md` beantwortet die offenen Fragen 3–6 der Spec (Rückmeldung bei Tippfehlern,
    Teilung in Sätze, was als Fehler zählt, Lernstand); Blick in den Code von TastenHeld (Modus „Rennen“), was übernommen wird.
  - Prüfen: Freigabe durch die Lehrkraft.

- [ ] **21 Diktat Abschreiben** (M) – hängt an 20, 11
  - Akzeptanz: Lehrkraft fügt Text ein (Editor-Kachel „Diktat“); Schüler:innen tippen ihn ab; Prüfung und Rückmeldung
    nach der Spec; Eingabe ohne Korrektur; übernommene Teile aus TastenHeld mit Herkunft gekennzeichnet.
  - Prüfen: Tests für den Textvergleich; DB-Test; iPad mit Tastatur.
  - Dateien: Migration `pruefe_diktat`, `src/lib/diktat.ts` + Test, `src/gemeinsam/DiktatAnzeige.tsx`

- [ ] **22 Merkdiktat** (M) – hängt an 21
  - Akzeptanz: Text erscheint (Teil-)Satz für (Teil-)Satz; nach „gemerkt“ verschwindet er und wird eingetippt;
    Regeln zum erneuten Ansehen nach der Spec.
  - Prüfen: Tests der Satzteilung; iPad mit Tastatur.

### Haltepunkt 5
- [ ] Lehrkraft legt beide Diktat-Arten an und probiert sie am iPad mit Tastatur aus.

---

## Phase 6: Pakete und Üben (`pakete`, `ueben`)

- [ ] **23 Pakete** (M) – hängt an 18, 8 · Tabellen `pakete`, `paket_aufgaben`, `zuweisungen`; Tags; anordnen; zuweisen; Schülervorschau. Prüfen: DB-Test.
- [ ] **24 Schüler-Start und „Meine Übungen“** (M) – hängt an 23 · RPC `schueler_start`; Schülerrahmen mit Menüleiste unten; falscher Token → freundliche Meldung. Prüfen: DB-Test; am iPad per QR öffnen.
- [ ] **25 Aufgabe bearbeiten und abgeben** (M) – hängt an 24 · RPCs `antwort_abgeben`, `loesung_anzeigen`; Tabellen `versuche`, `loesung_angesehen`; ✓ / ↻; Lösung erst nach 2 Versuchen. Prüfen: DB-Test; am iPad alle Formate.
- [ ] **26 Offline-Warteschlange** (S) – hängt an 25 · Entwürfe und Antworten im localStorage; `client_id`. Prüfen: WLAN aus → abgeben → WLAN an → genau ein Versuch.
- [ ] **27 Sterne-Stufen** (M) – hängt an 25, 10 · manuell (Vorrang) oder automatisch je Themenbereich. Prüfen: DB-Testfälle.
- [ ] **28 Einstein in der Schüleransicht** (M) – hängt an 25, 7 · Begrüßung, Formaterklärung beim ersten Mal, Tipp der Lehrkraft; Texte aus `src/schueler/einstein.md`; nie „falsch“, keine Lösungen. Prüfen: Tests Textdatei; iPad.
- [ ] **29 Hilfe-Seite** (S) – hängt an 24 · Fragen aus `src/schueler/hilfe.md` (alt, angepasst); **Namensnennung** Sprout Lands und TastenHeld. Prüfen: Test Parser (alt); iPad.

### Haltepunkt 6
- [ ] **iPad-Test mit Testklasse:** Paket zuweisen, per QR öffnen, alle Formate inkl. Diktat, offline abgeben, Stufen prüfen.

---

## Phase 7: Lernstand (`lernstand`)

- [ ] **30 Berechnung und Einstellungen** (M) – hängt an 25 · SQL `gewertete_versuche`, `auswertung`, `stand_bis` (Verfahren wie alt); Seite Einstellungen. Prüfen: DB-Testfälle.
- [ ] **31 Lernstand der Klasse und Einzelansicht** (M) – hängt an 30 · Heatmap, Einzelansicht mit Verlauf, „Entwicklung drucken“. Prüfen: Testdaten; Druckvorschau.
- [ ] **32 „Mein Lernweg“** (M) – hängt an 30 · RPC `schueler_entwicklung` (nur Kategorien). Prüfen: **DB-Test: nie Punkte, Stufen, Prozente.**
- [ ] **33 Zurücksetzen und Löschen** (S) – hängt an 31 · RPC `ergebnisse_zuruecksetzen` (später auch Münzen und Farm). Prüfen: DB-Test.

### Haltepunkt 7
- [ ] Lehrkraft prüft Heatmap, Einzelansicht und Lernweg mit Testdaten.

---

## Phase 8: Farm (`muenzen`, `shop`, `felder`, `tiere`, `spielfigur`)

- [ ] **34 Spec Münzen und Shop** (S) – `docs/SPEC-muenzen.md`: offene Fragen 1, 2, 7 (Münzen je Aufgabe, Schutz gegen Tempo und Raten, Preise, Angebot). Prüfen: Freigabe.
- [ ] **35 Münzen** (M) – hängt an 34, 25 · Tabelle `muenz_ereignisse` (eindeutig je Grund + Bezug); Vergabe in **einer** Funktion; Kontostand gezählt; Münzanzeige. Prüfen: DB-Test: doppelte Abgabe → keine doppelten Münzen; Token kann nichts schreiben.
- [ ] **36 Spec Felder und Tiere** (S) – `docs/SPEC-felder.md`: offene Fragen 8, 9, 12 (Wachstumsdauer, Folgen von Nicht-Üben, was Füttern bringt). Prüfen: Freigabe.
- [ ] **37 Shop** (M) – hängt an 35 · Angebot aus Sprout-Lands-Grafiken; RPC `kaufen` (prüft Kontostand); Besitz als Liste. Prüfen: DB-Test (kein Kauf ohne Münzen); iPad.
- [ ] **38 Felder: pflanzen, gießen, ernten** (M) – hängt an 36, 37 · Farm-Raster aus Kacheln; RPCs `pflanzen`, `ernten`; Wachstum = gelöste Aufgaben seit dem Pflanzen (Gießen), gegossene Kacheln aus dem Pflanzen-Paket. Prüfen: DB-Testfälle Wachstum; iPad.
- [ ] **39 Tiere füttern** (M) – hängt an 38 · Tiere aufstellen; RPC `fuettern` (verbraucht Geerntetes); Sprechblase mit Herz über dem Tier. Prüfen: DB-Test; iPad.
- [ ] **40 Spec Spielfigur** (S) – `docs/SPEC-spielfigur.md`: offene Frage 10 (Steuerung per Antippen, Pfeiltasten oder beides). Prüfen: Freigabe.
- [ ] **41 Spielfigur** (M) – hängt an 40, 38 · Figur aus dem Sprout-Lands-Spritesheet, 4 Richtungen, Bewegung nach der Spec; alles bleibt auch ohne Figur bedienbar; ruhig bei „Bewegung reduzieren“. Prüfen: iPad (flüssig?).

### Haltepunkt 8
- [ ] **iPad-Test Farm:** Münzen verdienen, kaufen, pflanzen, durch Üben wachsen sehen, ernten, füttern, Figur bewegen.

---

## Phase 9: Übernahme und Abschluss (`uebernahme`)

- [ ] **42 Alte Aufgaben, Pakete und Kurznamen übernehmen** (M) – Export aus der Übungswiese (keine Schülerdaten); Skript trennt `inhalt` und `loesung`; Probelauf, dann echter Lauf. Prüfen: Tests des Skripts; Anzahl alt = neu.
- [ ] **43 Datenschutz und Texte** (S) – `DATENSCHUTZ.md` (alt) angepasst: Münzen, Farm, Diktat; Hilfe-Texte; README „Supabase wieder starten“. Prüfen: Lehrkraft liest gegen.
- [ ] **44 Abnahme** (S) – alle 8 Erfolgskriterien der Spec (Abschnitt 11). Prüfen: Lehrkraft am Laptop und iPad.

### Haltepunkt 9
- [ ] Version 1 abgenommen. Einsatz mit echten Klassen erst nach Datenschutz-Freigabe.
