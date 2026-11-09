# Aufgabenliste: Satzgarten

Grundlage: `docs/SPEC.md`, `tasks/plan.md`. Größe: S = 1–2 Dateien, M = 3–5 Dateien.
Für **jede** Aufgabe gilt zusätzlich: `npm test` und `npm run build` laufen fehlerfrei, und nach jeder Migration
läuft `npm run test:datenbank` mit dem Ergebnis „ALLE TESTS BESTANDEN“.
„Alt:“ = Datei aus dem alten Projekt, die übernommen und angepasst wird.

---

## Phase 1: Grundgerüst

- [x] **1 Projekt anlegen und veröffentlichen** (M)
  - Akzeptanz: Ordner `C:\Users\jrkug\Projekte\satzgarten`, Vite + React + TS (Safari 15, Basis `/satzgarten/`),
    Repo `stift-und-papier/satzgarten`, GitHub Actions veröffentlicht bei Push auf `main`; `.gitignore` schließt
    `refrences/`, `docs/*.pdf`, `.env*`, `supabase/.temp` aus; neues `CLAUDE.md` mit den Regeln aus der Spec;
    Spec und Plan liegen in `docs/` bzw. `tasks/`.
  - Prüfen: Seite „Satzgarten“ ist unter `https://stift-und-papier.github.io/satzgarten/` erreichbar.
  - Dateien: `package.json`, `vite.config.ts`, `.github/workflows/veroeffentlichen.yml`, `.gitignore`, `CLAUDE.md`

- [x] **2 Datenbank anlegen mit Test-Gerüst** (M) – hängt an 1
  - Akzeptanz: neues Supabase-Projekt in Frankfurt (Region mit `npx supabase projects list` geprüft), CLI verknüpft,
    erste Migration mit Tabelle `einstellungen` (owner, RLS an) als Probe für das Test-Gerüst; `supabase/tests/zugriffsregeln.sql`
    (Aufbau wie alt: anon / Lehrkraft A / Lehrkraft B / Token, macht alles rückgängig) mit **kurzer Ausgabe**;
    Netzwerktest ohne Anmeldung.
  - Prüfen: `npm run test:datenbank` → „ALLE TESTS BESTANDEN“; `npm test` grün.
  - Dateien: `supabase/migrations/…_start.sql`, `supabase/tests/zugriffsregeln.sql`, `supabase/tests/netzwerk.test.ts`,
    `src/lib/supabase.ts`

- [x] **3 Navigation und Versionsprüfung** (S) – hängt an 1
  - Akzeptanz: Hash-Navigation (`#/s/<token>/…`, `#/lehrkraft/…`, `#/vorschau/…` nur im Entwicklungsmodus);
    Versionsprüfung lädt beim Öffnen einmal neu und zeigt sonst „Neu laden“.
  - Prüfen: Tests für den Router; nach einer Veröffentlichung zeigt das iPad die neue Version.
  - Dateien: `src/lib/router.ts` (alt), `src/lib/version.ts` (alt), `src/App.tsx`

### Haltepunkt 1
- [ ] Seite online, DB-Test grün, Lehrkraft hat die Adresse am iPad geöffnet.

---

## Phase 2: Design (vor allen Schülerseiten)

- [x] **4 Stilblatt** (M) – hängt an 3
  - Akzeptanz: `src/design/tokens.css` (Creme, Wiesengrün, Holzbraun, Pfirsich; Kontrast ≥ 4,5:1 nachgerechnet),
    Bausteine Karte, Pillenknopf, runder Holzknopf, Menüleiste unten, Lücke, Auswahl, Rückmeldung ✓/↻;
    nur lokale Schriften; Vorschauseite `#/vorschau/stil` mit allen Bausteinen; Lehrkraft-Thema „ruhig“.
  - Prüfen: Lehrkraft sieht die Seite am iPad und am Laptop, gibt frei oder nennt Änderungen.
  - Dateien: `src/design/tokens.css`, `src/design/bausteine.css`, `src/design/lehrkraft.css`, `src/entwicklung/Vorschau.tsx`

- [x] **5 Maskottchen** (M) – hängt an 4
  - Akzeptanz: 3 eigene Entwürfe eines Gartengeists (SVG, keine Kopie der Referenz); Lehrkraft wählt einen
    (und klärt Name, eine Figur oder Auswahl); danach 4 Ausdrücke (freundlich, nachdenklich, freut sich, zeigt);
    Sprechblasen-Baustein; `aria-hidden` für die Figur.
  - Prüfen: Vorschauseite `#/vorschau/maskottchen`; Freigabe der Lehrkraft.
  - Dateien: `src/design/maskottchen/*.svg`, `src/gemeinsam/Maskottchen.tsx`, `src/design/bausteine.css`

- [x] **6 Garten-Entwurf** (M) – hängt an 4
  - Akzeptanz: Szene von oben (Wiese, Zaun, Weg, 6 Beete), 1 Pflanze in 4 Stufen (Samen, Spross, Pflanze, Blüte),
    Korb mit Samentüten-Bildern, 1 Deko-Ding, 1 Sammelbuch-Seite mit „?“-Platzhaltern; keine Gesichter.
    Nur Anzeige mit Beispieldaten, noch ohne Datenbank.
  - Prüfen: `#/vorschau/garten` am iPad (quer und hochkant); Freigabe der Lehrkraft.
  - Dateien: `src/design/garten/*.svg`, `src/gemeinsam/Garten.tsx`, `src/design/garten.css`

### Haltepunkt 2
- [x] **Lehrkraft gibt Stil, Maskottchen und Garten frei.** Ohne Freigabe keine Schülerseiten.

---

## Phase 3: Klassen und Kompetenzen

- [ ] **7 Login der Lehrkraft** (M) – hängt an 2, 4
  - Akzeptanz: Anmelden/Abmelden per E-Mail und Passwort, Seitenrahmen Lehrkraft (Seitenleiste, Leiste unten ≤ 900 px),
    geschützte Seiten leiten zur Anmeldung.
  - Prüfen: Anmelden mit dem Konto der Lehrkraft; DB-Test: anon sieht nichts.
  - Dateien: `src/lehrkraft/Anmeldung.tsx`, `src/lehrkraft/LehrkraftRahmen.tsx`, `src/App.tsx`

- [ ] **8 Klassen und Pseudonyme** (M) – hängt an 7
  - Akzeptanz: Tabellen `klassen` (owner, name, kerncurriculum HS/RS/Gym), `schueler` (owner, klasse_id, pseudonym,
    token 192 Bit, stufe_manuell); RLS `owner = auth.uid()`; Klasse anlegen/umbenennen/löschen; Pseudonyme
    automatisch („Fuchs-07“) oder aus eigener Liste.
  - Prüfen: DB-Test (Lehrkraft B sieht Klassen von A nicht); Tests Pseudonyme (alt).
  - Dateien: Migration, `src/lehrkraft/KlassenListe.tsx`, `src/lehrkraft/KlasseDetail.tsx`, `src/lib/pseudonyme.ts` (alt)

- [ ] **9 Linkliste mit QR-Codes** (S) – hängt an 8
  - Akzeptanz: Liste aller Links einer Klasse mit QR-Code, druckbar (A4, ohne Hintergrund).
  - Prüfen: Druckvorschau im Browser; QR-Code am iPad scannen öffnet den richtigen Link.
  - Dateien: `src/lehrkraft/Linkliste.tsx`, Druck-CSS

- [ ] **10 Kompetenzen** (M) – hängt an 7
  - Akzeptanz: Tabelle `kompetenzen` (owner, code, kerncurriculum, bereich, stufe, kompetenz, hinweis, kurzname,
    ausgeblendet); Import der 154 Zeilen aus `docs/kompetenzen.csv` per Skript; Seite mit Kurzname ändern und Ausblenden.
  - Prüfen: 154 Kompetenzen (Gym 44, RS 56, HS 54) sichtbar; Tests CSV-Lesen (alt).
  - Dateien: Migration, `scripts/kompetenzen-sql.ts` (alt), `src/lehrkraft/Kompetenzen.tsx`, `src/lib/csvLesen.ts` (alt)

### Haltepunkt 3
- [ ] Lehrkraft legt eine Testklasse an, druckt die Linkliste, prüft Kompetenzen und Kurznamen.

---

## Phase 4: Aufgaben (ein Format nach dem anderen)

- [ ] **11 Aufgaben-Grundlage + Lückentext** (M) – hängt an 10
  - Akzeptanz: Tabelle `aufgaben` mit getrennten Feldern `inhalt` und `loesung`, `aufgabe_kompetenzen`;
    Verteiler `pruefe_aufgabe` + `pruefe_lueckentext`; Editor mit Format-Kacheln, Abschnitten (Inhalt / Einordnen / Extras)
    und Live-Vorschau; Parser `[Lösung]`, `/` für Alternativen.
  - Prüfen: Parser-Tests (alt); DB-Test: Token bekommt Aufgabe **ohne** `loesung`; Prüfung liefert ✓/↻ je Lücke.
  - Dateien: Migration, `src/lib/lueckentext.ts` (alt), `src/lehrkraft/AufgabeEditor.tsx`, `src/gemeinsam/LueckentextAnzeige.tsx`

- [ ] **12 Format Auswahl** (S) – hängt an 11
  - Akzeptanz: `[das | *dass]`, Einfach- und Mehrfachauswahl, antippen oder Dropdown; Schüler:innen erfahren nur, ob mehrere richtig sind.
  - Prüfen: Parser-Tests; DB-Test „keine Lösung“; Vorschau.
  - Dateien: Migration `pruefe_auswahl`, Parser, Anzeige

- [ ] **13 Format Fehler finden** (S) – hängt an 11
  - Akzeptanz: `[weis -> weiß]`, „nur finden“ oder „finden + eintippen“, „Finde N Fehler“; nicht gefundene Fehler ohne Ort.
  - Prüfen: wie 12.
  - Dateien: Migration `pruefe_fehler`, Parser, Anzeige

- [ ] **14 Format Zuordnen** (S) – hängt an 11
  - Akzeptanz: `[Der kleine Hund = Subjekt]`, Bedienung wie Textmarker, Ablenker antippbar.
  - Prüfen: wie 12.
  - Dateien: Migration `pruefe_zuordnen`, Parser, Anzeige

- [ ] **15 Format Reihenfolge** (M) – hängt an 11
  - Akzeptanz: `Gestern | bin ich | ins Kino | gegangen.`, weitere Lösungen darunter, Satzart, Varianten, gemischte
    Bausteine ohne verräterische Großschreibung/Schlusszeichen; antippen **und** ziehen (dnd-kit).
  - Prüfen: wie 12, zusätzlich Ziehen am iPad.
  - Dateien: Migration `pruefe_reihenfolge`, Parser, `src/gemeinsam/ReiheAnzeige.tsx` (alt)

- [ ] **16 Format Sätze verbessern** (S) – hängt an 11
  - Akzeptanz: Kontext, 2–4 Versionen, eine mit `*`, Hinweise erst nach dem Prüfen.
  - Prüfen: wie 12; DB-Test: Hinweise nicht vor der Abgabe.
  - Dateien: Migration `pruefe_ueberarbeiten`, Parser, `src/gemeinsam/VersionenAnzeige.tsx` (alt)

- [ ] **17 Erklärseite** (S) – hängt an 11
  - Akzeptanz: Text, Merkkasten, Beispiele mit `[Wort]`; „Verstanden – weiter“; zählt nie für Lernstand und gießt nie.
  - Prüfen: Vorschau; DB-Test `zaehlt_fuer_lernstand = false`.
  - Dateien: Migration, Editor-Teil, `src/gemeinsam/ErklaerSeite.tsx`

- [ ] **18 Aufgabenliste mit Filter und Sortierung** (M) – hängt an 11
  - Akzeptanz: Titelsuche, Jahrgang (aus Kompetenzen), Bereich, Kompetenz; Sortieren nach Titel/Format/Stufe.
  - Prüfen: Tests Filter und Sortierung (alt).
  - Dateien: `src/lib/filter.ts` (alt), `src/lib/sortierung.ts` (alt), `src/lehrkraft/AufgabenListe.tsx`, `src/lehrkraft/ListenFilter.tsx` (alt)

### Haltepunkt 4
- [ ] Lehrkraft erstellt je Format eine Aufgabe selbst und prüft sie in der Vorschau.

---

## Phase 5: Pakete und Üben

- [ ] **19 Pakete** (M) – hängt an 18, 8
  - Akzeptanz: Tabellen `pakete` (mit `jahrgaenge`, `zweige`), `paket_aufgaben`, `zuweisungen`; anlegen, Tags,
    Aufgaben anordnen, an Klasse oder einzelne Schüler:innen zuweisen; Schülervorschau.
  - Prüfen: DB-Test (Tags nur erlaubte Werte, fremde Pakete unsichtbar).
  - Dateien: Migration, `src/lehrkraft/PaketListe.tsx`, `src/lehrkraft/PaketDetail.tsx`, `src/lehrkraft/PaketTags.tsx` (alt)

- [ ] **20 Schüler-Start und „Meine Übungen“** (M) – hängt an 19, Haltepunkt 2
  - Akzeptanz: RPC `schueler_start` (prüft Token, liefert Pseudonym und zugewiesene Pakete); Schülerrahmen mit
    Menüleiste unten; Seite „Meine Übungen“; falscher Token → freundliche Meldung.
  - Prüfen: DB-Test (Token A sieht nichts von B); am iPad per QR-Code öffnen.
  - Dateien: Migration, `src/schueler/SchuelerRahmen.tsx`, `src/schueler/Uebungen.tsx`, `src/schueler/Start.tsx`

- [ ] **21 Aufgabe bearbeiten und abgeben** (M) – hängt an 20
  - Akzeptanz: RPC `antwort_abgeben` und `loesung_anzeigen`; Tabelle `versuche`, `loesung_angesehen`;
    Rückmeldung ✓ grün / ↻ Pfirsich; Lösung erst nach 2 Versuchen, danach zählt nichts mehr für den Lernstand.
  - Prüfen: DB-Test (Lösung vor 2 Versuchen verweigert); am iPad alle Formate einmal abgeben.
  - Dateien: Migration, `src/schueler/AufgabeSeite.tsx`, `src/gemeinsam/AufgabeBearbeiten.tsx`

- [ ] **22 Offline-Warteschlange** (S) – hängt an 21
  - Akzeptanz: Entwürfe und nicht gesendete Antworten im localStorage; `client_id` verhindert doppelte Abgaben.
  - Prüfen: WLAN aus → abgeben → WLAN an → genau ein Versuch in der DB.
  - Dateien: `src/schueler/speicher.ts` (alt), `src/schueler/AufgabeSeite.tsx`

- [ ] **23 Sterne-Stufen** (M) – hängt an 21, 10
  - Akzeptanz: `stufe_manuell` (Vorrang) oder Automatik je Themenbereich (`stufen_regel`: 80 %, mind. 5, nur Aufstieg);
    `sichtbare_aufgaben`; Lehrkraft stellt Stufe je Schüler:in ein.
  - Prüfen: DB-Testfälle für Aufstieg und Vorrang; Sterne in der Schüleransicht.
  - Dateien: Migration, `src/gemeinsam/Sterne.tsx`, `src/lehrkraft/StufenFeld.tsx`

- [ ] **24 Maskottchen in der Schüleransicht** (M) – hängt an 21, 5
  - Akzeptanz: Begrüßung und nächster Schritt; Formaterklärung beim ersten Öffnen (gemerkt im localStorage), danach
    per Knopf; Tipp der Lehrkraft auf Antippen; Satz zur Rückmeldung; Texte aus `src/schueler/maskottchen.md`;
    sagt nie „falsch“, nie Punkte, keine Lösungen.
  - Prüfen: Tests für das Lesen der Textdatei; am iPad jedes Format einmal ansehen.
  - Dateien: `src/schueler/maskottchen.md`, `src/lib/maskottchenTexte.ts`, `src/gemeinsam/Maskottchen.tsx`, `src/schueler/AufgabeSeite.tsx`

- [ ] **25 Hilfe-Seite** (S) – hängt an 20
  - Akzeptanz: aufklappbare Fragen aus `src/schueler/hilfe.md` (alt, angepasst an Garten und Maskottchen).
  - Prüfen: Test des Parsers (alt); Seite am iPad.
  - Dateien: `src/schueler/hilfe.md`, `src/lib/hilfe.ts` (alt), `src/schueler/Hilfe.tsx`

### Haltepunkt 5
- [ ] **iPad-Test mit Testklasse:** Paket zuweisen, per QR öffnen, alle Formate bearbeiten, offline abgeben, Stufen prüfen.

---

## Phase 6: Lernstand

- [ ] **26 Berechnung und Einstellungen** (M) – hängt an 21
  - Akzeptanz: `einstellungen` je Lehrkraft; SQL `gewertete_versuche`, `auswertung`, `stand_bis` (Verfahren wie alt);
    Seite Einstellungen.
  - Prüfen: DB-Testfälle mit festen Versuchen → erwartete Stufe und Trend.
  - Dateien: Migration (alt: `lernstand.sql` als Vorlage), `src/lehrkraft/EinstellungenSeite.tsx`

- [ ] **27 Lernstand der Klasse und Einzelansicht** (M) – hängt an 26
  - Akzeptanz: Heatmap Schüler:innen × Kompetenzen (`--` bis `++` mit Symbol), Einzelansicht mit Verlauf und Trend,
    „Entwicklung drucken“.
  - Prüfen: mit Testdaten am Laptop; Druckvorschau.
  - Dateien: `src/lehrkraft/KlassenLernstand.tsx`, `src/lehrkraft/SchuelerLernstand.tsx`, Druck-CSS

- [ ] **28 „Mein Lernweg“** (M) – hängt an 26, Haltepunkt 2
  - Akzeptanz: RPC `schueler_entwicklung` (nur Kategorien, Anzahl gelöster Aufgaben, nächster Schritt); Seite nach
    Bereich gruppiert, nächster Schritt oben.
  - Prüfen: **DB-Test: Token bekommt nie Punkte, Stufen oder Prozente.**
  - Dateien: Migration, `src/schueler/Lernweg.tsx`

- [ ] **29 Zurücksetzen und Löschen** (S) – hängt an 27
  - Akzeptanz: RPC `ergebnisse_zuruecksetzen` je Schüler:in/Klasse (löscht Versuche, Lösungsansichten, Auto-Stufen –
    später auch Garten); Schüler:in/Klasse löschen; Löschen-Knöpfe in Pflaume mit Rückfrage.
  - Prüfen: DB-Test: danach keine Versuche mehr, Pseudonym und Link bleiben.
  - Dateien: Migration, `src/lehrkraft/KlasseDetail.tsx`

### Haltepunkt 6
- [ ] Lehrkraft prüft Heatmap, Einzelansicht und Lernweg mit Testdaten.

---

## Phase 7: Garten

- [ ] **30 Samen verdienen** (M) – hängt an 28, 19
  - Akzeptanz: Tabelle `samen` (schueler, grund, bezug, Zeitpunkt; eindeutig je Grund + Bezug); Samen bei
    abgeschlossenem Paket und bei Verbesserung einer Kompetenz (Regel in **einer** Funktion); RPC `garten_lesen`
    liefert nur Bildangaben.
  - Prüfen: DB-Test: doppelte Abgabe ergibt keinen zweiten Samen; Token kann keine Samen schreiben.
  - Dateien: Migration, `supabase/tests/zugriffsregeln.sql`

- [ ] **31 Pflanzen, Umsetzen, Entfernen** (M) – hängt an 30, 6
  - Akzeptanz: Tabelle `beete` (schueler, platz, pflanze, gepflanzt_am); RPCs `pflanzen`, `umsetzen`, `entfernen`
    (prüfen Token, freie Samen, freien Platz); Entferntes zurück in den Korb; Bedienung per Antippen.
  - Prüfen: DB-Test (ohne Samen kein Pflanzen; fremder Token verboten); am iPad pflanzen.
  - Dateien: Migration, `src/schueler/GartenSeite.tsx`, `src/gemeinsam/Garten.tsx`

- [ ] **32 Wachsen durch Üben** (S) – hängt an 31
  - Akzeptanz: Wachstumsstufe = erledigte Aufgaben seit dem Pflanzen ÷ Güsse je Stufe (Einstellung, Standard 3),
    Erklärseiten zählen nicht; Garten welkt nie.
  - Prüfen: DB-Testfälle (0, 3, 6, 9 Aufgaben → Stufe 0–3).
  - Dateien: Migration, `src/gemeinsam/Garten.tsx`

- [ ] **33 Sammelbuch und Freischalten** (M) – hängt an 31
  - Akzeptanz: 12 Blumen + 6 Deko-Dinge (eigene SVGs; Liste in docs/SPEC.md, Garten); Regel zum Freischalten (offene Frage 1 im Plan);
    Seite „Sammelbuch“ mit „?“-Platzhaltern; Menüpunkt; Zurücksetzen leert den Garten.
  - Prüfen: am iPad; DB-Test Zurücksetzen.
  - Dateien: `src/design/garten/*.svg`, `src/schueler/Sammelbuch.tsx`, Migration

### Haltepunkt 7
- [ ] **iPad-Test Garten:** Samen verdienen, pflanzen, wachsen sehen, Sammelbuch – nirgends eine Zahl.

---

## Phase 8: Übernahme und Abschluss

- [ ] **34 Alte Aufgaben, Pakete und Kurznamen übernehmen** (M) – hängt an 33
  - Akzeptanz: Export aus der alten Datenbank (nur Aufgaben, Pakete, Kompetenz-Kurznamen – **keine** Schülerdaten);
    Skript wandelt `inhalt` in `inhalt` + `loesung` um; Probelauf, dann echter Lauf.
  - Prüfen: Tests des Umwandlungsskripts; Anzahl alt = neu; Stichprobe je Format in der Vorschau.
  - Dateien: `scripts/uebernahme.ts`, `scripts/uebernahme.test.ts`

- [ ] **35 Datenschutz und Texte** (S) – hängt an 33
  - Akzeptanz: `DATENSCHUTZ.md` (alt) angepasst: neue Tabellen (Samen, Beete), Maskottchen speichert nichts;
    Hilfe-Text Teil B gleich halten; README mit „Supabase wieder starten“.
  - Prüfen: Lehrkraft liest gegen.
  - Dateien: `DATENSCHUTZ.md`, `src/schueler/hilfe.md`, `README.md`

- [ ] **36 Abnahme** (S) – hängt an 34, 35
  - Akzeptanz: alle 8 Erfolgskriterien der Spec (Abschnitt 10) nachweislich erfüllt.
  - Prüfen: Lehrkraft geht die Liste am Laptop und iPad durch.

### Haltepunkt 8
- [ ] Version 1 abgenommen. Einsatz mit echten Klassen erst nach Datenschutz-Freigabe.
