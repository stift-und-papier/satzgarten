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
- **Grafiken:** Sprout Lands (gekauft, Cup Nooble), Humble Gift Paper UI, craftpix Orks/Schleime und TastenHeld (Erlaubnis für Ideen, Code, Grafiken).
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

## Design (Übergang: Stilblatt „Gartenheft“ unter `#/stil`, wird in Phase 2 zum Pixel-Look)
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
