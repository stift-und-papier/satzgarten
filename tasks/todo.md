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
  - Stand 2026-11-11: Paket-Schrift (Sprout Lands) hat nur Großbuchstaben, keine Umlaute/ß. Entwürfe A–C mit Pixelify Sans und Silkscreen (OFL, lokal). Entschieden: keine Pixel-Schrift. Überschriften Fraunces, Anweisungen (h3) und Texte Nunito.
  - Dateien: `src/design/fonts/*`, `src/design/tokens.css`, Entwurfsseite

- [x] **6 Pixel-Stilblatt** (M) – hängt an 4, 5
  - Akzeptanz: Farben aus der Sprout-Lands-Palette in `tokens.css` (hell, dunkel, mehr Kontrast, dunkel + mehr Kontrast;
    Kontrast ≥ 4,5:1 nachgerechnet); Bausteine im Pixel-Look: Fenster/Karte, Hauptknopf, runder Knopf, Menüleiste unten,
    Lücke, Auswahl, Rückmeldung ✓/↻ (nie rot), Münzanzeige; Fachbegriff-Farben eingebunden; Lehrkraft-Thema bleibt.
  - Prüfen: Seite `#/stil` am iPad (quer, hochkant) und Laptop; Hallmark-Prüfung; Freigabe.
  - Dateien: `src/design/tokens.css`, `src/design/bausteine.css`, `src/stil/Stilblatt.tsx`
  - Stand 2026-11-11: gebaut (`scripts/pixel-rahmen.mjs`, Rahmen nach Sprout-Lands-Knöpfen, alle Kontraste geprüft), freigegeben.

- [x] **7 Einstein** (M) – hängt an 4
  - Akzeptanz: aus den eigenen Vorlagen (`assets/*.jpg`) ein Pixel-Spritesheet mit durchsichtigem Hintergrund
    (Posen nach Absprache, z. B. freundlich, freut sich, nachdenklich, zeigt, erschrocken, traurig); ruhige Bewegung
    (aus bei „Bewegung reduzieren“); Sprechblase aus dem UI-Paket; Figur `aria-hidden`, Sprechblase nicht.
  - Prüfen: Vorschauseite am iPad; Freigabe.
  - Dateien: `src/grafik/einstein.png`, `src/gemeinsam/Einstein.tsx` (ersetzt `Maskottchen.tsx`), `src/design/bausteine.css`
  - Stand 2026-11-11: gebaut aus der eigenen Vorlage (Posen 1–5, Pose 6 „traurig“ weggelassen), Pixel-Sprechblase mit blauem Rand,
    Blinzeln alle 6 s, Atmen; Vorschau im Stilblatt. Freigegeben 2026-11-11.

### Haltepunkt 2
- [x] **Lehrkraft gibt Schrift, Pixel-Stil und Einstein frei.** Ohne Freigabe keine Schülerseiten.

---

## Phase 3: Klassen und Kompetenzen (`klassen`, `kompetenzen`)

- [x] **8 Klassen und Pseudonyme** (M) – hängt an 3
  - Akzeptanz: Tabellen `klassen` (owner, name, kerncurriculum HS/RS/Gym), `schueler` (owner, klasse_id, pseudonym,
    token 192 Bit, stufe_manuell); RLS `owner = auth.uid()`; anlegen/umbenennen/löschen; Pseudonyme automatisch
    („Fuchs-07“) oder aus eigener Liste.
  - Prüfen: DB-Test (Lehrkraft B sieht Klassen von A nicht); Tests Pseudonyme (alt).
  - Dateien: Migration, `src/lehrkraft/KlassenListe.tsx`, `src/lehrkraft/KlasseDetail.tsx`, `src/lib/pseudonyme.ts` (alt)

- [x] **9 Linkliste mit QR-Codes** (S) – hängt an 8
  - Akzeptanz: alle Links einer Klasse mit QR-Code, druckbar (A4, ohne Hintergrund).
  - Prüfen: Druckvorschau; QR-Code am iPad öffnet den richtigen Link.
  - Dateien: `src/lehrkraft/Linkliste.tsx`, Druck-CSS

- [x] **10 Kompetenzen** (M) – hängt an 3
  - Akzeptanz: Tabelle `kompetenzen` (owner, code, kerncurriculum, bereich, stufe, kompetenz, hinweis, kurzname,
    ausgeblendet); Import der 154 Zeilen aus `docs/kompetenzen.csv`; Seite mit Kurzname ändern und Ausblenden.
  - Prüfen: 154 Kompetenzen (Gym 44, RS 56, HS 54); Tests CSV-Lesen (alt).
  - Dateien: Migration, `scripts/kompetenzen-sql.ts` (alt), `src/lehrkraft/Kompetenzen.tsx`, `src/lib/csvLesen.ts` (alt)

  - Stand 2026-11-11: Aufgaben 8–10 gebaut (Migrationen `20261111120000`, `20261111120100`; DB-Test 15 Blöcke), im Browser geprüft.

  - 2026-11-11 nach Rückmeldung: Kurznamen von Claude (docs/kurznamen.csv), Lehrkraft-Ansicht in Schulblau, Schalter „Dunkler Modus“.

### Haltepunkt 3
- [x] Lehrkraft legt eine Testklasse an, druckt die Linkliste, prüft Kompetenzen und Kurznamen. Freigegeben 2026-11-11.

---

## Phase 4: Aufgaben (`aufgaben`)

- [x] **11 Aufgaben-Grundlage, Lückentext, Eingabe ohne Korrektur** (M) – hängt an 10, Haltepunkt 2
  - Akzeptanz: Tabelle `aufgaben` mit getrennten Feldern `inhalt` und `loesung`, `aufgabe_kompetenzen`;
    Verteiler `pruefe_aufgabe` + `pruefe_lueckentext`; Editor mit Format-Kacheln und Live-Vorschau; Parser `[Lösung]`;
    **gemeinsames Eingabefeld** mit `autocorrect="off"`, `autocapitalize="off"`, `spellcheck="false"`, `autocomplete="off"`.
  - Prüfen: Parser-Tests (alt); DB-Test: Token bekommt Aufgabe ohne `loesung`; **iPad mit Tastatur: falsch
    getipptes Wort bleibt falsch, Satzanfang bleibt klein.**
  - Dateien: Migration, `src/lib/lueckentext.ts` (alt), `src/lehrkraft/AufgabeEditor.tsx`, `src/gemeinsam/Eingabe.tsx`, `src/gemeinsam/LueckentextAnzeige.tsx`

- [x] **12 Format Auswahl** (S) – hängt an 11 · `[das | *dass]`, Einfach- und Mehrfachauswahl. Prüfen: Parser-Tests, DB-Test „keine Lösung“, Vorschau.
- [x] **13 Format Fehler finden** (S) – hängt an 11 · `[weis -> weiß]`, nur finden oder finden + eintippen. Prüfen: wie 12.
- [x] **14 Format Zuordnen** (S) – hängt an 11 · `[Der kleine Hund = Subjekt]`, Textmarker-Bedienung. Prüfen: wie 12.
- [x] **15 Format Reihenfolge** (M) – hängt an 11 · Bausteine mit `|`, Varianten, antippen und ziehen (dnd-kit). Prüfen: wie 12 + Ziehen am iPad. · am iPad getestet (Haltepunkt 4).
- [x] **16 Format Sätze verbessern** (S) – hängt an 11 · 2–4 Versionen, Hinweise erst nach dem Prüfen. Prüfen: wie 12; DB-Test Hinweise.
- [x] **17 Erklärseite** (S) – hängt an 11 · Text, Merkkasten, Beispiele; zählt nie für Lernstand. Prüfen: DB-Test `zaehlt_fuer_lernstand = false`. · Seite fertig; der DB-Test `zaehlt_fuer_lernstand = false` folgt mit der Tabelle `versuche` in Aufgabe 25. → erledigt (DB-Block 6.15).

- [x] **18 Aufgabenliste mit Filter und Sortierung** (M) – hängt an 11
  - Akzeptanz: Titelsuche, Jahrgang, Bereich, Kompetenz; Sortieren nach Titel/Format/Stufe.
  - Prüfen: Tests Filter und Sortierung (alt).
  - Dateien: `src/lib/filter.ts` (alt), `src/lib/sortierung.ts` (alt), `src/lehrkraft/AufgabenListe.tsx`

- [x] **19 Fachbegriff-Farben in Anweisungen** (S) – hängt an 11
  - Akzeptanz: `Anweisung.tsx` färbt Fachbegriffe in Aufgaben automatisch, je Aufgabe abschaltbar.
  - Prüfen: vorhandene Tests `kategorien.test.ts`; Vorschau.

### Haltepunkt 4
- [x] Lehrkraft erstellt je Format eine Aufgabe und prüft sie in der Vorschau; iPad korrigiert nichts.

---

## Phase 5: Diktat (`diktat`)

- [x] **20 Spec Diktat** (S)
  - Akzeptanz: `docs/SPEC-diktat.md` beantwortet die offenen Fragen 3–6 der Spec (Rückmeldung bei Tippfehlern,
    Teilung in Sätze, was als Fehler zählt, Lernstand); Blick in den Code von TastenHeld (Modus „Rennen“), was übernommen wird.
  - Prüfen: Freigabe durch die Lehrkraft.

- [x] **21 Diktat Abschreiben** (M) – hängt an 20, 11
  - Akzeptanz: Lehrkraft fügt Text ein (Editor-Kachel „Diktat“); Schüler:innen tippen ihn ab; Prüfung und Rückmeldung
    nach der Spec; Eingabe ohne Korrektur; übernommene Teile aus TastenHeld mit Herkunft gekennzeichnet.
  - Prüfen: Tests für den Textvergleich; DB-Test; iPad mit Tastatur.
  - Dateien: Migration `pruefe_diktat`, `src/lib/diktat.ts` + Test, `src/gemeinsam/DiktatAnzeige.tsx`

- [x] **22 Merkdiktat** (M) – hängt an 21
  - Akzeptanz: Text erscheint (Teil-)Satz für (Teil-)Satz; nach „gemerkt“ verschwindet er und wird eingetippt;
    Regeln zum erneuten Ansehen nach der Spec.
  - Prüfen: Tests der Satzteilung; iPad mit Tastatur.

### Haltepunkt 5
- [x] Lehrkraft legt beide Diktat-Arten an und probiert sie am iPad mit Tastatur aus.

---

## Phase 6: Pakete und Üben (`pakete`, `ueben`)

- [x] **23 Pakete** (M) – hängt an 18, 8 · Tabellen `pakete`, `paket_aufgaben`, `zuweisungen`; Tags; anordnen; zuweisen; Schülervorschau. Prüfen: DB-Test.
- [x] **24 Schüler-Start und „Meine Übungen“** (M) – hängt an 23 · RPC `schueler_start`; Schülerrahmen mit Menüleiste unten; falscher Token → freundliche Meldung. Prüfen: DB-Test; am iPad per QR öffnen.
- [x] **25 Aufgabe bearbeiten und abgeben** (M) – hängt an 24 · RPCs `antwort_abgeben`, `loesung_anzeigen`; Tabellen `versuche`, `loesung_angesehen`; ✓ / ↻; Lösung erst nach 2 Versuchen. Prüfen: DB-Test; am iPad alle Formate.
- [x] **26 Offline-Warteschlange** (S) – hängt an 25 · Entwürfe und Antworten im localStorage; `client_id`. Prüfen: WLAN aus → abgeben → WLAN an → genau ein Versuch. · Doppelt gesendet = ein Versuch (DB-Block 6.11); WLAN-Test am iPad im Haltepunkt.
- [x] **27 Sterne-Stufen** (M) – hängt an 25, 10 · manuell (Vorrang) oder automatisch je Themenbereich. Prüfen: DB-Testfälle.
- [x] **28 Einstein in der Schüleransicht** (M) – hängt an 25, 7 · Begrüßung, Formaterklärung beim ersten Mal, Tipp der Lehrkraft; Texte aus `src/schueler/einstein.md`; nie „falsch“, keine Lösungen. Prüfen: Tests Textdatei; iPad.
- [x] **29 Hilfe-Seite** (S) – hängt an 24 · Fragen aus `src/schueler/hilfe.md` (alt, angepasst); **Namensnennung** Sprout Lands und TastenHeld. Prüfen: Test Parser (alt); iPad.

### Haltepunkt 6
- [x] **iPad-Test mit Testklasse:** Paket zuweisen, per QR öffnen, alle Formate inkl. Diktat, offline abgeben, Stufen prüfen.

---

## Phase 7: Lernstand (`lernstand`)

- [x] **30 Berechnung und Einstellungen** (M) – hängt an 25 · SQL `gewertete_versuche`, `auswertung`, `stand_bis` (Verfahren wie alt); Seite Einstellungen. Prüfen: DB-Testfälle.
- [x] **31 Lernstand der Klasse und Einzelansicht** (M) – hängt an 30 · Heatmap, Einzelansicht mit Verlauf, „Entwicklung drucken“. Prüfen: Testdaten; Druckvorschau.
- [x] **32 „Mein Lernweg“** (M) – hängt an 30 · RPC `schueler_entwicklung` (nur Kategorien). Prüfen: **DB-Test: nie Punkte, Stufen, Prozente.**
- [x] **33 Zurücksetzen und Löschen** (S) – hängt an 31 · RPC `ergebnisse_zuruecksetzen` (später auch Münzen und Farm). Prüfen: DB-Test. · Testdaten: Klasse „Lernstand-Demo“ (Realschule, 4 Pseudonyme, erfundene Versuche der letzten 6 Wochen).

### Haltepunkt 7
- [x] Lehrkraft prüft Heatmap, Einzelansicht und Lernweg mit Testdaten.

---

## Phase 8: Farm (`muenzen`, `shop`, `felder`, `tiere`, `spielfigur`)

- [x] **34 Spec Münzen und Shop** (S) – `docs/SPEC-muenzen.md`: offene Fragen 1, 2, 7 (Münzen je Aufgabe, Schutz gegen Tempo und Raten, Preise, Angebot). Prüfen: Freigabe. · **Diktat-Regeln aus `docs/SPEC-diktat.md` übernehmen:** Münzen ab 90 %, erneut bei Verbesserung, Extra für fehlerfrei.
- [x] **35 Münzen** (M) – hängt an 34, 25 · Tabelle `muenz_ereignisse` (eindeutig je Grund + Bezug); Vergabe in **einer** Funktion; Kontostand gezählt; Münzanzeige. Prüfen: DB-Test: doppelte Abgabe → keine doppelten Münzen; Token kann nichts schreiben.
- [x] **36 Spec Felder und Tiere** (S) – `docs/SPEC-felder.md`: offene Fragen 8, 9, 12 (Wachstumsdauer, Folgen von Nicht-Üben, was Füttern bringt). Prüfen: Freigabe.
- [x] **37 Shop** (M) – hängt an 35 · Angebot aus Sprout-Lands-Grafiken; RPC `kaufen` (prüft Kontostand); Besitz als Liste. Prüfen: DB-Test (kein Kauf ohne Münzen); iPad.
- [x] **38 Felder: pflanzen, gießen, ernten** (M) – hängt an 36, 37 · Farm-Raster aus Kacheln; RPCs `pflanzen`, `ernten`; Wachstum = gelöste Aufgaben seit dem Pflanzen (Gießen), gegossene Kacheln aus dem Pflanzen-Paket. Prüfen: DB-Testfälle Wachstum; iPad.
- [x] **39 Tiere füttern** (M) – hängt an 38 · Tiere aufstellen; RPC `fuettern` (verbraucht Geerntetes); Sprechblase mit Herz über dem Tier. Prüfen: DB-Test; iPad.
- [x] **40 Spec Spielfigur** (S) – `docs/SPEC-spielfigur.md`: offene Frage 10 (Steuerung per Antippen, Pfeiltasten oder beides). Prüfen: Freigabe.
- [x] **41 Spielfigur** (M) – hängt an 40, 38 · Figur aus dem Sprout-Lands-Spritesheet, 4 Richtungen, Bewegung nach der Spec; alles bleibt auch ohne Figur bedienbar; ruhig bei „Bewegung reduzieren“. Prüfen: iPad (flüssig?).

- [x] **41a Spec Monster-Kampf und Buch** (S) – `docs/SPEC-monster.md`: offene Fragen 17–22 (Antworten der Lehrkraft 2026-11-11).
- [x] **41b Monster über der Aufgabe** (M, 2026-11-12 von der Lehrkraft wieder entfernt) – hängt an 41a, 41, 25 · Figur gegen Monster über jeder Paket-Aufgabe; richtig = Treffer (auch 2. Versuch, nicht nach „Lösung ansehen“),
  falsch = verfehlt; Lebensbalken ohne Zahlen; besiegt erst wenn alle Aufgaben richtig, sonst „nochmal versuchen“; ★ Sprout, ★★ Schleim, ★★★ Ork; Treffer rechnet der Server; keine Blut-/Todes-Animation; ruhig bei „Bewegung reduzieren“.
  Prüfen: DB-Test (Treffer nicht erschummelbar, nie Punkte/Prozente für Schüler:innen); iPad.
- [x] **41c Buch** (M) – hängt an 41a · Freigeschaltetes im Papier-Look (Humble Gift). Prüfen: iPad.
- [x] **41d Belohnung für Lernfortschritt** (M) – Samen bei „besser“, Deko bei „deutlich besser“, Fenster „Ein Geschenk für deine Farm!“ (Migration `belohnungen`, DB-Test Block 15).

### Haltepunkt 8
- [ ] **iPad-Test Farm:** Münzen verdienen, kaufen, pflanzen, durch Üben wachsen sehen, ernten, füttern, Figur bewegen, Sammelalbum ansehen, Geschenk für Lernfortschritt.

---

## Phase 9: Übernahme und Abschluss (`uebernahme`)

- [x] **42 Übungspakete statt Übernahme** (L, Lehrkraft 2026-11-12: alte Aufgaben werden nicht übernommen) – je Doppeljahrgang (5/6, 7/8, 9/10), Bereich und Schwierigkeit (leicht/mittel/schwer) ein Paket je Zweig, 180 Pakete, 475 Aufgaben mit Erklärseiten. Quelle `inhalte/*.txt`, Einspielen mit `node scripts/inhalte-sql.ts <datei.sql>` und `npx supabase db query --linked -f <datei.sql>` (wiederholbar). Prüfen: Lehrkraft sieht Pakete durch.
- [ ] **43 Datenschutz und Texte** (S) – `DATENSCHUTZ.md` (alt) angepasst: Münzen, Farm, Diktat; Hilfe-Texte; README „Supabase wieder starten“. Prüfen: Lehrkraft liest gegen.
- [ ] **44 Abnahme** (S) – alle 8 Erfolgskriterien der Spec (Abschnitt 11). Prüfen: Lehrkraft am Laptop und iPad.

### Haltepunkt 9
- [ ] Version 1 abgenommen. Einsatz mit echten Klassen erst nach Datenschutz-Freigabe.
