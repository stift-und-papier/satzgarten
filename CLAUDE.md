# CLAUDE.md – Projektregeln Wortsalat

## Für wen und wie
- Nutzerin/Nutzer ist eine Deutschlehrkraft (KGS Niedersachsen) **ohne Programmiererfahrung**.
  Jeden Schritt kurz in einfachem Deutsch erklären, Fachwörter vermeiden oder erklären.
- Git, Installationen, Konfiguration selbst übernehmen. Was im Browser selbst zu tun ist: Schritt für Schritt anleiten.
- Arbeiten nach `tasks/todo.md` (Plan: `tasks/plan.md`, Spec: `docs/SPEC.md`, je Baustein `docs/SPEC-<kennung>.md`).
  **Nach jeder Phase (Haltepunkt) stoppen** und testen lassen. Erledigte Aufgaben dort abhaken.
- Fachlich-didaktische, Spiel- und Design-Entscheidungen **erfragen**, nicht raten. Entscheidungen unten protokollieren.
- Vorgänger: „Satzgarten“ (dieses Repo bis 11. November 2026, Übergabe `docs/uebergabe-wortsalat.md`) und
  „Übungswiese“ (`C:\Users\jrkug\Projekte\deutsch-uebungen`, Übergabe `docs/uebergabe-neustart.md`) – Quelle für
  übernommene Dateien (in `tasks/todo.md` mit „alt“ markiert).

## Feste Regeln
- Alle Texte der Oberfläche auf Deutsch, einfache Sprache (Jg. 5–10). Code-Kommentare auf Deutsch.
  Lehrkraft-Ansicht „Sie“, Schüleransicht „du“.
- **Keine** Tracking-, Analyse- oder Werbedienste, **keine** externen Schriften/CDNs.
- **Keine Klarnamen** von Schüler:innen, nur Pseudonyme (z. B. „Fuchs-07“).
- **Keine Geheimnisse ins Repo** (Repo ist öffentlich). Supabase-`anon`/publishable Key darf in den Code,
  `service_role`-Schlüssel und DB-Passwort **nie**.
- **Nie ins Repo:** KC-PDFs (`docs/*.pdf`), Referenzbilder (`refrences/`), Referenz-Texte (`Erklärungen referenz/`),
  die gekauften Asset-Pakete (`assets/`, Lizenz verbietet Weitergabe).
- **Grafiken:** Sprout Lands (gekauft, Cup Nooble), Humble Gift Paper UI und TastenHeld (Erlaubnis für Ideen, Code, Grafiken).
  Nur benutzte Einzelbilder nach `src/grafik/` mit `LIZENZ.md`; Namensnennung in der App
  („Assets – From: Sprout Lands – By: Cup Nooble“). Übernommenen TastenHeld-Code mit Herkunft kennzeichnen.
- Kompetenzen **nicht erfinden** – nur aus `docs/kompetenzen.csv` bzw. durch die Lehrkraft.
- Schüler:innen sehen **nie** absolute Lernstände (kein `--` bis `++`, keine Prozente, Punkte, Noten) – abgesichert in
  der Datenbank. **Münzen** dürfen als Zahl erscheinen; Münzen, Käufe und Wachstum rechnet nur der Server. Keine Ranglisten.
- Lösungen nur in `aufgaben.loesung`; Schüler-Funktionen geben sie nie heraus (DB-Test je Format).
- **Eingabefelder der Schüler:innen ohne Rechtschreibkorrektur** (Autokorrektur, Rechtschreibprüfung, Wortvorschläge,
  automatische Großschreibung aus). iPads haben feste QWERTZ-Tastaturen.
- Figuren erlaubt (Einstein, Spielfigur, Tiere). Fehler nie rot (Pfirsich). Bedeutung nie nur über Farbe.
  Kontrast ≥ 4,5:1, Tippflächen ≥ 48 px, Fließtext ≥ 17 px. Bewegung aus bei „Bewegung reduzieren“.
- Einsatz mit echten Klassen erst nach Datenschutz-Freigabe durch Schulleitung/DSB.

## Technik
- Vite + React + TypeScript, statisch, Bau-Ziel Safari 15. Pfad-Basis `/wortsalat/`.
- GitHub Pages: Repo `stift-und-papier/wortsalat` (öffentlich), Adresse https://stift-und-papier.github.io/wortsalat/,
  Veröffentlichung per GitHub Actions bei Push auf `main`.
- Supabase-Projekt `diwpqkxhmuetdpxxcoar` (kostenlos, Frankfurt `eu-central-1`), RLS überall. Änderungen nur als Migration in `supabase/migrations/`,
  dann `npm run db:push`. CLI per `npx supabase` (v2), Anmeldung per Token (Lehrkraft trägt ihn selbst ein:
  `npx.cmd --prefix <Projektordner> supabase login --token …`, `npx.ps1` ist gesperrt); Befehle aus Claudes Shell
  (im Terminal der Lehrkraft scheitert die CLI, vermutlich Avast).
- Schüler:innen: kein Konto, Link-Token (192 Bit) hinter `#`; Zugriff nur über Datenbankfunktionen mit Token-Prüfung.
- Bibliotheken: supabase-js, @dnd-kit, qrcode. Neue nur nach Rückfrage (auch für Farm/Spielfigur).

## Design (Stilblatt `#/stil` nach der Freigabe am 2026-11-13 entfernt)
- Schüleransicht wird Pixel-Art (Sprout Lands, ganzzahlig vergrößert); Lehrkraft-Ansicht bleibt „ruhig“, in Schulblau #003466 (`--color-lk-*`).
- Pixel-Rahmen (Karte, Knöpfe, gewählt, Rückmeldung, runde Knöpfe) nach den Sprout-Lands-Knöpfen als SVG, dazu Papier/Tinte/Holz/
  Rückmeldung in vier Varianten: erzeugt + kontrastgeprüft von `node scripts/pixel-rahmen.mjs` (Block PIXEL in tokens.css). `--px: 3px` = ein Grafik-Pixel.
- Einzige Token-Datei `src/design/tokens.css` (Farben als Hex wegen Safari 15.0–15.3, aus OKLCH berechnet),
  Bausteine `src/design/bausteine.css` (Schüler:innen), `src/design/lehrkraft.css` (Thema „ruhig“). Symbole: `src/gemeinsam/Symbol.tsx`.
- **Eine Farbe = eine Bedeutung** (Apple-Richtlinien): Holz = bedienen (Knöpfe, Pfeile, Auswahl, aktuelle Seite),
  Himmelblau = Hilfe (Tipp, Hilfe, Einstein), Blattgrün = richtig/geschafft (nie Knöpfe), Pfirsich = nochmal, Sonne = Sterne.
- Jede Farbe in vier Varianten: hell, dunkel (folgt der iPad-Einstellung), mehr Kontrast, dunkel + mehr Kontrast.
  Neue Farben in allen vier Blöcken ergänzen und Kontrast nachrechnen.
- **Farbe im Hintergrund nur für die EINE Hauptaktion** (Apple): runde Knöpfe hell mit farbigem Rand/Symbol
  (Holz = Pfeile/Navigation, Himmelblau = Hilfe), Menü ohne Farbfläche. Linienfarbe nie als Schrift.
- **Fachbegriff-Farben** (eine Palette mit 11 Farben, `--kat-*`, erzeugt + kontrastgeprüft von `node scripts/fachbegriff-farben.mjs`;
  Begriff → Farbe in `src/lib/kategorien.ts`, getestet). Gruppen dürfen Farben teilen (nie gleichzeitig abgefragt).
  Wortarten (Lehrkraft): Nomen blau, Verb rot, Adjektiv grün, Artikel hellblau, Pronomen lila; Claude: Adverb weinrot,
  Präposition gelb, Konjunktion/Subjunktion pink, Numerale petrol, Interjektion/Partikel grau.
  Fälle (Lehrkraft): Nominativ blau, Genitiv gelb, Dativ grün, Akkusativ orange.
  Satzglieder: Subjekt blau, Prädikat rot, Objekte in der Farbe ihres Falls (Akkusativobjekt orange, Dativobjekt grün, Genitivobjekt gelb),
  Adverbiale weinrot, Attribut pink. Zeitformen (Claude, Zeitstrahl kühl → warm):
  Plusquamperfekt lila, Präteritum blau, Perfekt hellblau, Präsens grün, Futur I weinrot, Futur II orange.
  Fachbegriffe in Anweisungen färben sich automatisch (`src/gemeinsam/Anweisung.tsx`, je Aufgabe abschaltbar: `farbig={false}`).
  Markierte Wörter nehmen die Farbe an (`data-farbe`); ohne Farbe bleiben sie neutral (Antippen ohne Fachbegriff).
  Gestrichelt heißt immer „hier schreiben“ (Lücken) – gesperrte Knöpfe sind nur blasser.
- Schriften: Fraunces (h1/h2), Nunito (Text und h3/Anweisungen). Keine Pixel-Schrift.
- Leseschrift für LRS: OpenDyslexic (lokal, OFL), Umschalter `useLeseschrift` (`src/lib/leseschrift.ts`), gespeichert auf dem Gerät.
- Dunkler Modus: folgt dem Gerät, von Hand umschaltbar mit `useDunkel` (`src/lib/thema.ts`), gespeichert auf dem Gerät.
- Prüfen: `node ~/.claude/skills/hallmark/scripts/sloplint.mjs src --genre playful --scope app`.

## Befehle
- `npm run dev` · `npm run build` · `npm run lint` · `npm test`
- `npm run test:datenbank` → Erfolg = „ALLE TESTS BESTANDEN“. **Nach jeder Migration ausführen und erweitern.**

## Rechner der Lehrkraft (Windows 11)
- Projektordner `C:\Users\jrkug\Projekte\wortsalat` (nicht in OneDrive; bis 11. November 2026 hieß er `satzgarten`).
- Git, Node.js LTS, GitHub CLI (`gh`, angemeldet als `stift-und-papier`); Git-Identität mit GitHub-noreply-Adresse.

## Entscheidungen (Protokoll)
- 2026-11-09: Neustart als neues Projekt „Satzgarten“ (Spec `docs/SPEC.md`, Plan `tasks/plan.md` freigegeben).
  Alle drei Zweige, erst eine Lehrkraft, alle 6 Formate + Erklärseite, Sterne-Stufen manuell + automatisch,
  Garten statt Wiese (Samen je Paket und je verbesserter Kompetenz, wachsen durch Üben, 12 Pflanzen + 6 Deko,
  umsetzen/entfernen erlaubt, keine Zahlen), Sammelbuch, Maskottchen (Gartengeist), neues Design nach Referenzbildern.
- 2026-11-09 (Lehrkraft): Hilfe-Knöpfe (Tipp, Fragezeichen) in eigener Farbe (Himmelblau), Pfeile bleiben Holzbraun.
  Farben nach Apple-Richtlinien: eine Bedeutung je Farbe, Varianten für hell/dunkel/mehr Kontrast. Grün ist deshalb nur
  noch „richtig“, Hauptknöpfe und Auswahl sind Holz. Umschalter auf OpenDyslexic für Schüler:innen mit LRS.
- 2026-11-09 (Lehrkraft): Keine Wellenlinie bei markierten Wörtern (wirkt wie „falsch“). Wortarten mit festen Farben
  (s. Design). Apple-Farbregeln angewendet: Farbe im Hintergrund nur für die Hauptaktion, Rollen der Farben nie vertauschen.
- 2026-11-09 (Lehrkraft): Hilfe-Farbe bleibt. Fachbegriffe in Anweisungen in ihrer Farbe statt Erklärsatz.
  Antippen auch farblos möglich. Eigene Farben für Satzglieder und Zeitformen (Überschneidung mit Wortarten erlaubt).
  „Lösung ansehen“ (gesperrt) nicht mehr gestrichelt, damit es nicht wie eine Lücke aussieht.
- 2026-11-09 (Lehrkraft): Orange (zu nah an Pfirsich) → Weinrot, Türkis (zu nah an Artikel) → Petrol. Gewählte Antworten
  sehen aus wie markierte Wortgruppen (helles Feld, Holzrand, Kante). Sterne nach refrences/sterne.jpg (src/gemeinsam/Sterne.tsx),
  ohne „Stufe n von 3“ (nur für Vorlesehilfen). Lehrkraft: Stufe als ★/☆.
- 2026-11-09 (Lehrkraft): Hilfe-Knöpfe doch ohne gelbe Füllung (hell wie alle runden Knöpfe, Rand/Symbol blau).
  Stilblatt freigegeben (Aufgabe 4).
- 2026-11-09 (Lehrkraft): Dunkelmodus auch von Hand umschaltbar (`useDunkel`, `src/lib/thema.ts`; ohne eigene Wahl
  folgt er dem Gerät; tokens.css nutzt `:root[data-thema='dunkel']` statt `prefers-color-scheme`).
  Maskottchen: Entwurf B „Blatthut“ gewählt, heißt **Albert** (`src/gemeinsam/Maskottchen.tsx`, Ausdrücke freundlich, nachdenklich,
  freut-sich, zeigt; `MaskottchenSagt` mit Sprechblase, Rand Himmelblau).
- 2026-11-09 (Lehrkraft): Albert bewegt sich ruhig, nicht ablenkend: blinzelt etwa alle 6 s, atmet langsam;
  aus bei „Bewegung reduzieren“. Nur eine Figur (keine Auswahl für Schüler:innen).
- 2026-11-09 (Lehrkraft): Garten-Entwurf freigegeben (`src/gemeinsam/Garten.tsx`, `src/design/garten.css`) – Haltepunkt 2 erreicht.
  12 Pflanzen = verschiedene Blumen, je Beet eine Blume, vorerst kein Ernten. Deko z. B. Bank, Wimpelkette, Lampe,
  Gartengeräte. Vorschlagslisten in `docs/SPEC.md` (Garten), Bestätigung bei Aufgabe 32.
- 2026-11-11 (Lehrkraft): **Neustart als „Wortsalat“** im selben Repo (umbenannt; Spec `docs/SPEC.md`, Plan `tasks/plan.md`).
  Erst Lernplattform, dann Farm-Spiel (ersetzt den Garten): Münzen für gelöste Aufgaben (als Zahl erlaubt), Shop,
  Spielfigur, Felder mit Ernte, Tiere füttern (Sprechblase mit Herz, keine Fress-Animation), Üben = Gießen.
  Neues Format Diktat (Abschreiben, Merkdiktat mit „gemerkt“) nach TastenHeld. Alle 7 Formate + Diktat, alle drei Zweige.
  Pixel-Look (Sprout Lands, gekauft) für Schüler:innen, Lehrkraft-Ansicht ruhig. Figuren erlaubt. Maskottchen heißt
  **Einstein** (Pixel-Figur nach eigener Vorlage). Rechtschreibkorrektur überall aus. Garten-Entwurf und Albert entfernt.
- 2026-11-11 (Lehrkraft): Lehrkraft-Konto angelegt (Selbst-Registrierung aus), Anmeldung unter /wortsalat/ getestet – Haltepunkt 1 erreicht.
- 2026-11-11 (Lehrkraft): Keine Pixel-Schrift: Überschriften bleiben in Fraunces, Anweisungen (h3, z. B. „Schreibe die Wörter ab.“)
  und Texte in Nunito. Pixel-Schrift aus Sprout Lands hat ohnehin nur Großbuchstaben, keine Umlaute/ß.
- 2026-11-11 (Lehrkraft): **Monster-Kampf** neu: Monster über der Aufgabe kämpft gegen die Spielfigur (Katzen-Bauer, Sprout Lands);
  in zugewiesenen Paketen trifft jede richtige Aufgabe, falsch = verfehlt; Münzen unverändert nach Erfolg; niedliche Monster
  (Sprout, Schleime), Orks für schwerere Stufen. Dazu ein **Buch** mit Freigeschaltetem (Humble Gift – Paper UI).
  Neue Grafik-Pakete: Humble Gift (Weitergabe verboten, Nennung freiwillig), craftpix Orks/Schleime (Lizenz noch prüfen).
  Einzelheiten `docs/SPEC-monster.md`: Figur passiert nie etwas; Lebensbalken ohne Zahlen; Treffer auch im 2. Versuch, nicht nach
  „Lösung ansehen“; besiegt erst wenn alle Aufgaben richtig; ★ Sprout, ★★ Schleim, ★★★ Ork; Buch nur Pflanzen, Tiere, Deko.
  Buch zeigt Noch-nicht-Freigeschaltetes als „?“-Platzhalter. `chomp_idle.png` und Sprechblasen-Emotes sind eigene Werke der Lehrkraft.
- 2026-11-11 (Lehrkraft): **Pixel-Stilblatt freigegeben** (Aufgabe 6): Holzrahmen nach Sprout-Lands-Knöpfen, Farben aus der Palette,
  gewählt = gedrückter Knopf, Münzanzeige, Menü „Farm“ und „Buch“. Stifte behalten einfachen farbigen Rand.
- 2026-11-11 (Lehrkraft): **Einstein** aus eigener Vorlage: Posen freundlich (Begrüßung), lob, freut-sich (Paket geschafft/Monster besiegt),
  huch (Monster taucht auf), erklaert (Tipps und „nochmal versuchen“). Traurige Pose wird **nicht** verwendet (wirkt bestrafend).
  `src/gemeinsam/Einstein.tsx` (`Einstein`, `EinsteinSagt`), Sprechblase im Pixel-Look mit blauem Rand.
- 2026-11-11 (Lehrkraft): Einstein: nur freundlich und erklaert blinzeln, **kein Atmen**; lob winkt (Bild mit geneigtem Arm),
  freut-sich springt, huch zittert (kurz, dann Pause); Größe bleibt (2-fach). Fälle mit Farben: Nominativ blau, Genitiv gelb,
  Dativ grün, Akkusativ orange; Objekte in der Farbe ihres Falls. „Senf“ heißt jetzt „Gelb“ (Fläche kräftiger), Orange neu
  (Fläche kräftig, damit es nicht wie Pfirsich wirkt). Futur II orange statt pink (zu ähnlich zu Futur I).
- 2026-11-11 (Lehrkraft): **Präpositionalobjekt** als Fachbegriff-Farbe entfernt (hat keinen festen Fall); Präposition bleibt gelb.
- 2026-11-11 (Lehrkraft): Einstein mit Bewegungen und neue Fachbegriff-Farben freigegeben – **Haltepunkt 2 erreicht**. Weiter mit Phase 3.
- 2026-11-11 (Lehrkraft): Phase 3 geprüft. **Kurznamen** trägt die Lehrkraft nicht selbst ein: Claude legt sie fest
  (`docs/kurznamen.csv`, Migration per `node scripts/kompetenzen-sql.ts`); die Datenbank erlaubt Lehrkräften nur noch Ausblenden.
  Lehrkraft-Ansicht in **Schulblau #003466** (Menüleiste blau, Hauptknöpfe blau, `--color-lk-*` in allen vier Varianten)
  und mit Schalter „Dunkler Modus“ im Menü (`useDunkel`).
- 2026-11-11 (Lehrkraft): Phase 3 freigegeben – **Haltepunkt 3 erreicht**. Weiter mit Phase 4.
- 2026-11-11 (Claude, Phase 4): Aufgabenformate aus der Übungswiese übernommen (Parser, Prüffunktion, Editor, Liste, Tests).
  Neu: `aufgaben.loesung` = Eingabe der Lehrkraft mit Lösungen; `aufgaben.inhalt` (Schüler-Fassung) erzeugt **nur die Datenbank**
  per Trigger (`inhalt_ohne_loesung`), die App darf `inhalt` nicht schreiben. Stufe als Zahl 1–3 (`stufe`), Lehrkraft sieht ★/☆.
  Fachbegriff-Farben je Aufgabe abschaltbar (`aufgaben.farbig`). Zuordnen-Stifte: Fachbegriffe in ihrer Farbe, eigene Kategorien neutral.
- 2026-11-11 (Lehrkraft, Haltepunkt 4): Lücken bekommen auf Wunsch einen **Hinweis** nach Doppelpunkt (`[Rad fahren : Rad + fahren]`),
  Schüler:innen sehen ihn in Klammern hinter der Lücke wie auf Arbeitsblättern. Fehler „permission denied“ beim erneuten Speichern behoben.
- 2026-11-11 (Lehrkraft): Aufgabenliste zeigt und sortiert auch nach **Kompetenz** (Kurzname) und **KC**; ohne Zuordnung immer am Ende.
  7 Übungsaufgaben (je Format eine, „Übung: …“/„Erklärung: …“) zum Testen angelegt. Phase 4 getestet – **Haltepunkt 4 erreicht**. Weiter mit Phase 5.
- 2026-11-11 (Lehrkraft): **Diktat** (`docs/SPEC-diktat.md`): Abschreiben – Cursor wartet auf das richtige Zeichen; Merkdiktat – Rückmeldung
  am Satzende, Satz mit Fehlern wird neu gemerkt und getippt (erster Versuch zählt). Teilung automatisch nach . ? !, Lehrkraft teilt mit |.
  „Nochmal ansehen“ beliebig oft, löscht die Eingabe. Fehler: Buchstaben, Groß/klein, Satzzeichen (nicht Leerzeichen-Anzahl).
  Geschafft ab 90 % (Hinweis: Verbessern bringt nochmal Münzen), fehlerfrei besonders belohnt. Zählt für den Lernstand mit Kompetenzen.
- 2026-11-11 (Claude, Phase 5): Diktat gebaut (`src/lib/diktat.ts`, `src/gemeinsam/DiktatAnzeige.tsx`, Migration `diktat`).
  Vergleich in TS und SQL gleich (`vereinheitliche`/`diktat_norm`, `abstand`/`diktat_abstand`). Merkdiktat: nach 2 Fehlversuchen
  darf man zum nächsten Satz weiter (sonst kein Ausweg). Übungsaufgaben „Übung: Diktat abschreiben“ und „Übung: Merkdiktat“ angelegt.
- 2026-11-11 (Lehrkraft): Diktat-Rückmeldung nennt die Zahl der Fehler; Merkdiktat zeigt danach den richtigen Text mit markierten Fehlerwörtern.
- 2026-11-11 (Lehrkraft): Merkdiktat wird **nur dort geteilt, wo die Lehrkraft es angibt** (`|` oder Klick zwischen Wörter im Editor);
  Knopf „Nach jedem Satz trennen“ als Hilfe. Schüleransicht zählt „Teil 1 von 3“.
- 2026-11-11 (Lehrkraft): Abschreiben zeigt den Text als **Laufband** in einer Zeile (aktuelles Zeichen bei einem Drittel der Breite, wie TastenHeld).
- 2026-11-11 (Lehrkraft): Diktate am iPad getestet und freigegeben – **Haltepunkt 5 erreicht**. Weiter mit Phase 6 (Pakete und Üben).
- 2026-11-11 (Claude, Phase 6): Pakete, Zuweisungen, Versuche, „Lösung ansehen“, Sterne-Stufen und Schüler-Funktionen aus der Übungswiese
  übernommen (Migration `pakete_ueben`, Regel für den Aufstieg unverändert: 80 % im ersten Versuch bei mindestens 5 Aufgaben je Bereich und Stufe).
  Schüleransicht `src/schueler/` mit Menüleiste unten (Farm, Übungen, Hilfe; Lernweg und Buch kommen in Phase 7/8). Einstein begrüßt,
  erklärt ein Format, solange es noch nie abgegeben wurde, und sagt den Tipp der Lehrkraft (Texte in `src/schueler/einstein.md`).
  Hilfe-Seite mit Namensnennung (Sprout Lands, TastenHeld). Übungspaket „Übung: alle Formate“ der Klasse „Test“ zugewiesen.
- 2026-11-12 (Lehrkraft): Phase 6 am iPad getestet – **Haltepunkt 6 erreicht**. Lernstand wie in der Übungswiese: Stufenfarben
  rot → grün mit Zeichen -- bis ++ (`--color-stufe-*`, nur Lehrkraft), „Mein Lernweg“ mit vier Kategorien in Worten (Texte unter
  Einstellungen), Höchstpunkte ★ 70 / ★★ 85 / ★★★ 100.
- 2026-11-12 (Claude, Phase 7): Migration `lernstand` (Berechnung alt, Schwierigkeit = Sterne-Stufe, KC aus der Klasse),
  Seiten Lernstand der Klasse, Einzelseite zum Drucken, Einstellungen, „Mein Lernweg“ (Menüpunkt Lernweg), Ergebnisse zurücksetzen.
  Klasse „Test“ steht auf Gymnasium, die Übungsaufgaben haben Realschul-Kompetenzen – darum Testklasse „Lernstand-Demo“ (Realschule).
- 2026-11-12 (Lehrkraft): Lernstand der Klasse auch als **große Bereiche** (Umschalter, Standard): Sprache und Sprachgebrauch
  untersuchen (Wortarten, Wortbildung und Wortschatz, Satzglieder und Sätze, Sprachgebrauch), Schreiben (Rechtschreibung, Zeichensetzung,
  Texte überarbeiten), Sich mit Texten und anderen Medien auseinandersetzen (noch ohne Kompetenzen). Großer Bereich = Durchschnitt seiner
  Bereiche, Bereich = Durchschnitt seiner Kompetenzen (`zusammenfassen` in `src/lib/lernstand.ts`). Anhaken, welche großen Bereiche
  sichtbar sind, ▸ klappt die Bereiche auf. „Klasse drucken oder als PDF“ druckt die Tabelle wie am Bildschirm.
- 2026-11-12 (Lehrkraft): Knöpfe „aufklappen ▸ / ◂ zuklappen“ beschriftet. Lehrkraft-Knöpfe: „Lernstand“ Schulblau gefüllt, endgültig
  „Löschen“ (Schüler:in, Klasse, Aufgabe, Paket) rot (`--color-lk-gefahr`, `lk-knopf--gefahr`; Rot nur Lehrkraft), Kopieren/Öffnen/Entfernen weiß.
  „Mein Lernweg“ nach großen Bereichen sortiert, Rückmeldungen farbig: deutlich besser kräftig grün, besser hellgrün,
  dranbleiben Pfirsich, erste Ergebnisse Papier (immer mit Satz, nie Rot).
- 2026-11-12 (Lehrkraft): „Große Bereiche“ heißen in der Lehrkraft-Ansicht **Kernkompetenzen**. „Mein Lernweg“ zeigt je Rückmeldung eine
  Tulpe aus Sprout Lands (`GRAFIK.blume`, 4 Stufen): erste Ergebnisse = Samen, dranbleiben = Sprössling, wird besser = wächst,
  deutlich besser = blüht.
- 2026-11-12 (Lehrkraft): Lernstand mit Kernkompetenzen und Tulpen-Lernweg freigegeben – **Haltepunkt 7 erreicht**. Weiter mit Phase 8.
  Münzen (`docs/SPEC-muenzen.md`): nach Sternen ★ 10 / ★★ 15 / ★★★ 20, im 2. Versuch die Hälfte, nach „Lösung ansehen“ nichts;
  je Aufgabe einmal pro Tag. Erklärseiten einmalig 5 Münzen. Shop schaltet nach insgesamt verdienten Münzen nach und nach frei.
- 2026-11-12 (Lehrkraft): Shop leichter zugänglich: freischalten bei 0 / 150 / 400 / 800 / 1500 verdienten Münzen;
  Samen 10–30, Deko 20–100, Huhn 150, Kuh 300. Spec Münzen und Shop freigegeben (Aufgabe 34).
- 2026-11-12 (Lehrkraft): Doch etwas höher (Mitte): freischalten bei 0 / 200 / 600 / 1200 / 2200; Samen 15–45, Deko 25–150, Huhn 220, Kuh 450.
- 2026-11-12 (Lehrkraft): Lehrkraft kann Münzen vergeben (Klassenseite: Spalte „Münzen“ zum Auswählen, an Ausgewählte oder alle).
  Aufgabe 35 gebaut: Migration `muenzen` (`muenz_ereignisse`, `muenzen_fuer_versuch`, `muenzen_schenken`), Kontostand oben auf
  jeder Schülerseite, „+10 Münzen für dich!“ in der Rückmeldung; Zurücksetzen löscht auch Münzen.
- 2026-11-12 (Lehrkraft): Münzen vergeben per Antippen der Pseudonyme (keine Kästchen in der Tabelle); die Nachricht der Lehrkraft
  ploppt bei Schüler:innen einmal als Fenster „Post von deiner Lehrkraft!“ auf. „Lernstand“-Knöpfe grün (`--color-lk-gut`, 4 Varianten,
  Kontrast 6,5 / 9,9 / 9,3 / 15,1). Lernweg: Emoji hinter dem Satz statt Tulpen-Bild (🌱 erste Ergebnisse, 🌿 dranbleiben, 🪴 besser,
  🌷 deutlich besser). **Kein Gedankenstrich „–“ als Satzzeichen** in Oberflächentexten (Punkt, Komma oder Doppelpunkt statt dessen).
- 2026-11-12 (Lehrkraft, Aufgabe 36): Pflanzen wachsen durch Üben (jede Aufgabe mit Münzen gießt alle Felder) **und** etwas Zeit
  (einmal pro Tag von selbst, höchstens halb). Pausen: nichts welkt, alles wartet. Füttern: Herz + Ei/Milch zum Verkaufen.
  Lernfortschritt („besser“/„deutlich besser“) bringt einmalig besonderen Samen bzw. Deko. Zahlen in `docs/SPEC-felder.md`.
- 2026-11-12 (Claude, Aufgabe 37): Shop gebaut (Migration `shop`: Angebot `shop_artikel` mit Preisen/Grenzen, `besitz`, `kaufen`,
  `schueler_shop`; Bilder in `src/lib/shop.ts`). Menüpunkt „Shop“. 11 Samen im Shop, Tulpe und Rose sowie Katzenblumen nur als
  Belohnung für Lernfortschritt. Statt Zaun (Kachel-Satz, schwer einzeln) gibt es zu Beginn einen Busch. Kauf mit Nachfrage „Ja, kaufen“.
- 2026-11-12 (Claude, Aufgabe 38): Farm auf der Startseite (`src/schueler/Farm.tsx`, Migration `felder`): Felder als Ackerboden-Bild,
  leeres Feld antippen → Samen wählen; reif (Haken) antippen → ernten in den Vorrat. Wachstum nur auf dem Server (`wachstum`),
  Schüler:innen sehen nur das Bild (4 Stufen). Deko und Tiere erscheinen erst mit Aufgabe 39.
- 2026-11-12 (Lehrkraft): **Farm als Landschaft** wie das Sprout-Lands-Titelbild: Insel im Wasser, Felder links oben, Hühnerstall,
  Kuh-Gehege mit Zaun, Bäume, Brunnen und Deko auf festen Plätzen (`src/lib/landschaft.ts`, getestet: nichts überdeckt sich).
  **Spielfigur** (Sprout-Lands-Figur, „Maus“) läuft per Antippen dorthin und tippt Felder an (offene Frage 10: Antippen, Aufgabe 40).
  Hintergrund als Canvas in Originalgröße, ganzzahlig vergrößert (2- bis 4-fach nach Breite). Ohne Figur bleibt alles bedienbar.
- 2026-11-12 (Lehrkraft): Farm größer (21 × 15 Kacheln) und **verspielte Inselform** (Textbild `KARTE` in `src/lib/landschaft.ts`,
  Ränder per „Blob“-Kachelsatz aus den Bitmask-Vorlagen des Pakets). **Acker** zusammenhängend wie im Titelbild. **Hühnerstall** erst
  mit dem ersten Huhn, **Scheune** (von oben, offene Tür, Heu, Wassertrog; aus Wand-, Tür- und Stallteilen) erst mit der ersten Kuh;
  Kuh-Gehege mit Zaun entfällt. Feld oder Tier antippen öffnet ein **Menü** im Papier-Look (UI Pack Basic: Rahmen, Plätze, X-Knopf),
  scrollt bei vielen Gegenständen, schließt mit X, Esc oder Tippen daneben. Aufgabe 39: Füttern mit Geerntetem (einmal pro Tag je Tier,
  Herz-Sprechblase aus den Emotes der Lehrkraft), gibt sofort Ei bzw. Milch; Verkaufen im Vorrat (Ei 10, Milch 20 Münzen, gießt nicht).
- 2026-11-12 (Lehrkraft): Figur läuft **nicht durch Gebäude, Bäume, Deko und Tiere** (Wegsuche `weg` in `landschaft.ts`; Felder sind Boden
  und begehbar, sonst kämen mittlere Felder nicht in Reichweite). **Scheune oben rechts** ohne Tür (offener Durchgang), Heu und Trog hinten
  an der Wand, Kühe davor, Gang frei; loses Heu entfernt. **Hühnerstall unten rechts**. Spielfigur = „test character“ aus dem
  Sprout Lands Sorry Pack (8 Richtungen). **Vorrat** unter der Farm in Kästchen mit Anzahl oben rechts. **Verkaufen nur im Shop**,
  auch Geerntetes. Teurere Samen geben teurere Ernte; Futter-Güte 1 bis 3 gibt Ei/Rosa Ei/Blaues Ei bzw. Milch/Erdbeermilch/
  Blaubeermilch (Preise von Claude, von der Lehrkraft bestätigt; Tabelle in `docs/SPEC-felder.md`). Ein Tier frisst weiter einmal am Tag.
- 2026-11-12 (Lehrkraft): Ernte und Ei/Milch erscheinen erst **in der Spielwelt** (Ernte auf dem Feld bzw. daneben, Ei/Milch neben dem Tier,
  hüpfen leicht) und kommen erst beim **Einsammeln** (antippen, Figur läuft hin) in den Vorrat (`vorrat.liegt_bei`, Funktion `einsammeln`,
  Plätze `ablagePlaetze` in `landschaft.ts`). Liegendes kann man weder füttern noch verkaufen. Es bleibt liegen, bis man es holt.
- 2026-11-12 (Claude, Aufgabe 41b): Monster über der Aufgabe und über der Aufgabenliste des Pakets (`src/schueler/Kampf.tsx`,
  Migration `monster`: `kampf` in `schueler_start`). Monster nach der höchsten Sterne-Stufe der sichtbaren Aufgaben: Rübchen (chomp),
  Schleim, Ork (craftpix, Lizenz geprüft: Nutzung erlaubt, einzelne Bilder wie bei Sprout Lands). Spielfigur links, Lebensbalken ohne
  Zahlen (Holz-/Tintenfarben, kein Grün/Rot), Treffer = Figur springt vor, daneben = Monster hüpft zur Seite, besiegt = verblasst und
  läuft davon. Erklärseiten zählen nicht; nur Erklärseiten = kein Monster.
- 2026-11-12 (Lehrkraft): Nach „Lösung ansehen“ trifft die Aufgabe **ab dem nächsten Tag** wieder (sonst wäre das Monster nie zu besiegen;
  Migration `monster_morgen`). Am selben Tag sagt die Aufgabenseite das statt „Daneben“.
- 2026-11-12 (Lehrkraft): Lebensbalken des Monsters **grün → orange (≤ 50 %) → rot (≤ 25 %)** (Fachbegriff-Farben `--kat-*`;
  bewusste Ausnahme von „Grün nur richtig / nie Rot“, die Länge zeigt es zusätzlich). Schüler:innen schalten **Dunklen Modus** und
  **Leseschrift für LRS** selbst um (Schalter oben auf der Hilfe-Seite). Hilfe beginnt mit „Das fragst du dich vielleicht“.
- 2026-11-12 (Lehrkraft, Aufgabe 41c): Das Buch heißt **„Mein Sammelalbum“**, Knopf auf der Farm (kein Menüpunkt). Gesammelt = schon
  einmal gehabt (gekauft, Belohnung, gepflanzt, geerntet), Rest als „?“ ohne Namen (`schueler_album`, `src/schueler/Album.tsx`).
  Seiten aus Papier-Teilen von Humble Gift (`album_seite.png`, zusammengesetzt in `grafik-holen.mjs`), Papier bleibt im dunklen Modus hell
  (`--color-album-tinte`, 4 Varianten, 10,3 / 14,1 : 1).
- 2026-11-12 (Lehrkraft): Tiere bewegen sich: Kuh läuft in der Scheune hin und her, Hühner laufen ein Stück und picken (`FarmTier.tsx`;
  nur das Bild wandert wenige Pixel, Tippfläche und Hindernisse bleiben fest; still bei „Bewegung reduzieren“).
  Shop „Du hast …“ zählt keine gepflanzten (verbrauchten) Samen mehr (Migration `shop_besitz`).
- 2026-11-12 (Lehrkraft): **Obstbäume** (Orange, Pfirsich, Birne; je einer, wöchentlich 3 Früchte ohne Gießen, Früchte fallen und werden
  eingesammelt) und **Boot** (Deko im Wasser, schaukelt). Migration `obstbaeume_boot`, Plätze `BAUM_PLAETZE`/`BOOT` in `landschaft.ts`;
  Preise von Claude in `docs/SPEC-felder.md` (Bestätigung offen). **Felder einzeln** mit Bild `Soil_Ground_Tile_single` (auf 14 × 14 verkleinert,
  so bleibt zwischen den Feldern ein kleiner Abstand); Pflanzen stehen mitten im Feld. Der zusammenhängende Acker entfällt.
- 2026-11-12 (Lehrkraft): Preise für Obstbäume, Obst und Boot bestätigt. Bäume **wackeln nicht**, bewegen sich nur beim Ernten
  (Früchte fallen); das Obst kommt danach **direkt in den Vorrat** und liegt nicht auf der Karte (Migration `obst_vorrat`).
- 2026-11-12 (Lehrkraft): **Monster-Kampf komplett entfernt** (gefällt nicht; Migration `kampf_weg`, Kampf.tsx, Monster-Bilder und craftpix weg).
  Obstbäume mit dem geraden Standbild. Reifes ohne Haken: Sprechblase an der Figur „X kann geerntet werden!“ bzw.
  „Ich kann heute vieles ernten!“ (Bild „dialog box“ aus dem UI Pack, `dialog_blase.png`), verschwindet beim ersten Tippen.
  „Verkaufen kannst du im Shop.“ unter dem Vorrat entfernt.
  Blase immer links von der Figur; fehlt dort Platz, läuft die Figur zuerst von selbst nach rechts. Figur startet immer bei (10, 6), dort passt die Blase. „Dein nächster Schritt:“ nur mit dem Namen der Aufgabe. Übungen und „Dein nächster Schritt“: Sterne oben rechts im Kasten mit dem Wort „Schwierigkeit“.
- 2026-11-12 (Lehrkraft): **Belohnung für Lernfortschritt** gebaut (Migration `belohnungen`): „besser“ = Samen, abwechselnd Tulpe/Rose;
  „deutlich besser“ = Deko, abwechselnd Katzenblume rosa/blau; Sprung direkt auf „deutlich“ gibt beides. Fenster „Ein Geschenk für deine Farm!“.
- 2026-11-12 (Lehrkraft): **Alte Aufgaben werden nicht übernommen.** Stattdessen Übungspakete je Doppeljahrgang (5/6, 7/8, 9/10), Bereich
  (Zuschnitt je Bereich statt je Kernkompetenz) und Schwierigkeit (leicht ★, mittel ★★, schwer ★★★), je Zweig ein eigenes Paket (180 Pakete).
  Aufgaben aus einem **gemeinsamen Pool** für alle Zweige, mit den passenden Kompetenzen jedes Zweigs verknüpft (Hauptschule über gleiche Kurznamen
  der Realschule). Umfang 5/6: 5, 7/8: 6, 9/10: 8 Aufgaben je Paket (ohne Erklärseiten). Jedes Thema beginnt mit einer Erklärseite (Referenz
  `Erklärungen referenz/`, gekürzt). „Texte und Medien“ vorerst ohne Pakete (keine Kompetenzen). Quelle `inhalte/*.txt`, Skript
  `scripts/inhalte-sql.ts` (prüft mit den Parsern des Editors, feste ids, wiederholbar). Erklärseiten zeigen einzelne Zeilenumbrüche (`.erklaerung__absatz`).
- 2026-11-13 (Lehrkraft): Aufgaben auch in der **Aufgabenliste löschbar** (roter Knopf je Zeile, mit Nachfrage; im Editor gab es ihn schon).
  Aufgaben und Pakete nach **Schulform** filterbar; Spalte „Schulform“ (statt „KC“) = Kerncurricula der Kompetenzen und Zweige der Pakete.
  Zeilenumbrüche im Aufgabentext bleiben sichtbar (`.satz` mit `white-space: pre-line`); Satzzeichen hinter Wörtern/Lücken hängen am Wort
  (`stelle__anhang`). Erklärseiten: Merkkasten Himmelblau hinterlegt (`--color-hilfe-flaeche`, 4 Varianten, Tinte 11,1 bis 16,5 : 1),
  Beispiele kursiv, Fachbegriffe fett (ohne Farbe), markierte Beispielwörter immer dunkel auf Gelb (auch im dunklen Modus).
  „+ Neues Paket“ oben in der Paketliste führt auf eine eigene Seite (`#/lehrkraft/pakete/neu`). Einstellungen als zugeklappte Bereiche.
- 2026-11-13 (Claude, Prüfbericht, Lehrkraft: „Alle 6“): Münzen „einmal pro Tag“ zählen nach dem Ankunftstag beim Server (`gespeichert_am`,
  Migration `muenz_tag_server`), nicht nach dem Datum vom iPad. Warteliste offline überschreibt keine neue Antwort mehr. Editor legt eine
  neue Aufgabe beim erneuten Speichern nicht doppelt an. Veröffentlichung läuft erst nach `lint` und `test`. Stilblatt `#/stil` entfernt.
  DB-Test Block 15 erzeugt seine Lernstand-Daten jetzt selbst (Igel-11 hat nach dem Löschen der alten Übungen keine Versuche mehr).
- 2026-11-13 (Lehrkraft, Usability-Test mit zwei Personas, Bericht `usability-test/ergebnis.md`, nicht im Repo): die drei wichtigsten
  Punkte behoben. Farm-Meldungen stehen **über** der Karte statt darunter (fester Platz, Karte springt nicht; „gepflanzt“ nennt das Gießen).
  Gesperrte Shop-Artikel zeigen „Kommt, wenn du noch N Münzen verdienst.“ (Migration `shop_fehlt`, Grenzen unverändert). Richtige Wiederholung
  ohne Münzen sagt „Für diese Aufgabe gibt es heute keine Münzen mehr.“ Hilfe hat neuen Abschnitt **„Deine Farm“** (Münzen, Shop, Pflanzen,
  Ernten, Tiere, Verkaufen, Lernweg-Pflanzen). Test-Schüler Biber-22, Luchs-44, Igel-11 haben Testdaten aus dem Usability-Test.
- 2026-11-13 (Lehrkraft: „behebe auch die kleineren Punkte“): Nach Ändern aller ↻-Stellen „Gut, du hast etwas geändert. Tippe jetzt auf
  ‚Nochmal prüfen‘.“ Lücken mit nur falscher Groß/klein-Schreibung melden `gross_klein` (Migrationen `gross_klein_hinweis` + `gross_klein_klammer`),
  Rückmeldung „Achte auf Groß- und Kleinschreibung.“ Einstein: „schreib das Passende hinein“; neue Begrüßung `begruessung-neu` (noch nichts gelöst)
  erklärt Münzen, Shop, Gießen. Shop-Kauf von Samen: „Tippe auf der Farm ein leeres Feld an …“. Füttern-Menü erklärt Futter → Ei/Milch, „Neben ihr“
  bei der Kuh. Lernweg erklärt die Pflanzen oben, angefangene Themen offen, ohne „wir“. Markierungen in Erklär-Beispielen ohne Innenabstand.
  Abschreiben: falsches Zeichen färbt den Cursor Pfirsich und sagt „Schau genau hin“. Erklärseite zeigt beim ersten Lesen „Gut gelesen! +5 Münzen“
  und wartet auf „Weiter“. Auswahl-Chips: Haken immer da (unsichtbar), nicht fett, damit nichts verrutscht; jede Auswahl-Gruppe auf hellem Feld.
  Halbe Münzen im 2. Versuch erklärt nur die Hilfe (kein Extra-Satz in der Rückmeldung).
