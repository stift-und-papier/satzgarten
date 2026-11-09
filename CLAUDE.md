# CLAUDE.md – Projektregeln Satzgarten

## Für wen und wie
- Nutzerin/Nutzer ist eine Deutschlehrkraft (KGS Niedersachsen) **ohne Programmiererfahrung**.
  Jeden Schritt kurz in einfachem Deutsch erklären, Fachwörter vermeiden oder erklären.
- Git, Installationen, Konfiguration selbst übernehmen. Was im Browser selbst zu tun ist: Schritt für Schritt anleiten.
- Arbeiten nach `tasks/todo.md` (Plan: `tasks/plan.md`, Spec: `docs/SPEC.md`). **Nach jeder Phase (Haltepunkt) stoppen**
  und testen lassen. Erledigte Aufgaben dort abhaken.
- Fachlich-didaktische und Design-Entscheidungen **erfragen**, nicht raten. Entscheidungen unten protokollieren.
- Vorgänger-Projekt: `C:\Users\jrkug\Projekte\deutsch-uebungen` („Übungswiese“) – Quelle für übernommene Dateien
  (in `tasks/todo.md` mit „alt“ markiert). Übergabe: `docs/uebergabe-neustart.md`.

## Feste Regeln
- Alle Texte der Oberfläche auf Deutsch, einfache Sprache (Jg. 5–10). Code-Kommentare auf Deutsch.
  Lehrkraft-Ansicht „Sie“, Schüleransicht „du“.
- **Keine** Tracking-, Analyse- oder Werbedienste, **keine** externen Schriften/CDNs.
- **Keine Klarnamen** von Schüler:innen, nur Pseudonyme (z. B. „Fuchs-07“).
- **Keine Geheimnisse ins Repo** (Repo ist öffentlich). Supabase-`anon`/publishable Key darf in den Code,
  `service_role`-Schlüssel und DB-Passwort **nie**.
- KC-PDFs (`docs/*.pdf`) und Referenzbilder (`refrences/`) nie ins Repo. Grafiken immer **selbst neu zeichnen**.
- Kompetenzen **nicht erfinden** – nur aus `docs/kompetenzen.csv` bzw. durch die Lehrkraft.
- Schüler:innen sehen **nie** absolute Lernstände (kein `--` bis `++`, keine Prozente, Punkte, Noten) und **keine
  Belohnungszahlen** (Samen) – abgesichert in der Datenbank, nicht nur in der Oberfläche.
- Lösungen nur in `aufgaben.loesung`; Schüler-Funktionen geben sie nie heraus (DB-Test je Format).
- Gesichter/Figuren nur beim Maskottchen. Fehler nie rot (Pfirsich). Bedeutung nie nur über Farbe.
  Kontrast ≥ 4,5:1, Tippflächen ≥ 48 px, Fließtext ≥ 17 px.
- Einsatz mit echten Klassen erst nach Datenschutz-Freigabe durch Schulleitung/DSB.

## Technik
- Vite + React + TypeScript, statisch, Bau-Ziel Safari 15. Pfad-Basis `/satzgarten/`.
- GitHub Pages: Repo `stift-und-papier/satzgarten` (öffentlich), Adresse https://stift-und-papier.github.io/satzgarten/,
  Veröffentlichung per GitHub Actions bei Push auf `main`.
- Supabase-Projekt `diwpqkxhmuetdpxxcoar` („satzgarten“, kostenlos, Frankfurt `eu-central-1`), RLS überall. Änderungen nur als Migration in `supabase/migrations/`,
  dann `npm run db:push`. CLI per `npx supabase` (v2), Anmeldung per Token (Lehrkraft trägt ihn selbst ein:
  `npx.cmd --prefix C:/Users/jrkug/Projekte/satzgarten supabase login --token …`, `npx.ps1` ist gesperrt); Befehle aus Claudes Shell
  (im Terminal der Lehrkraft scheitert die CLI, vermutlich Avast).
- Schüler:innen: kein Konto, Link-Token (192 Bit) hinter `#`; Zugriff nur über Datenbankfunktionen mit Token-Prüfung.
- Bibliotheken: supabase-js, @dnd-kit, qrcode. Neue nur nach Rückfrage.

## Design „Gartenheft“ (Stilblatt `#/stil`, wird nach Freigabe entfernt)
- Einzige Token-Datei `src/design/tokens.css` (Farben als Hex wegen Safari 15.0–15.3, aus OKLCH berechnet),
  Bausteine `src/design/bausteine.css` (Schüler:innen), `src/design/lehrkraft.css` (Thema „ruhig“). Symbole: `src/gemeinsam/Symbol.tsx`.
- **Eine Farbe = eine Bedeutung** (Apple-Richtlinien): Holz = bedienen (Knöpfe, Pfeile, Auswahl, aktuelle Seite),
  Himmelblau = Hilfe (Tipp, Hilfe, Maskottchen), Blattgrün = richtig/geschafft (nie Knöpfe), Pfirsich = nochmal, Sonne = Sterne.
- Jede Farbe in vier Varianten: hell, dunkel („Abendgarten“, folgt der iPad-Einstellung), mehr Kontrast, dunkel + mehr Kontrast.
  Neue Farben in allen vier Blöcken ergänzen und Kontrast nachrechnen.
- **Farbe im Hintergrund nur für die EINE Hauptaktion** (Apple): runde Knöpfe hell mit farbigem Rand/Symbol
  (Holz = Pfeile/Navigation, Himmelblau = Hilfe), Menü ohne Farbfläche. Linienfarbe nie als Schrift.
- **Fachbegriff-Farben** (eine Palette mit 10 Farben, `--kat-*`, erzeugt + kontrastgeprüft von `node scripts/fachbegriff-farben.mjs`;
  Begriff → Farbe in `src/lib/kategorien.ts`, getestet). Gruppen dürfen Farben teilen (nie gleichzeitig abgefragt).
  Wortarten (Lehrkraft): Nomen blau, Verb rot, Adjektiv grün, Artikel hellblau, Pronomen lila; Claude: Adverb orange,
  Präposition senf, Konjunktion/Subjunktion pink, Numerale türkis, Interjektion/Partikel grau.
  Satzglieder (Claude): Subjekt blau, Prädikat rot, Akkusativobjekt grün, Dativobjekt senf, Genitivobjekt türkis,
  Präpositionalobjekt lila, Adverbiale orange, Attribut pink. Zeitformen (Claude, Zeitstrahl kühl → warm):
  Plusquamperfekt lila, Präteritum blau, Perfekt hellblau, Präsens grün, Futur I orange, Futur II pink.
  Fachbegriffe in Anweisungen färben sich automatisch (`src/gemeinsam/Anweisung.tsx`, je Aufgabe abschaltbar: `farbig={false}`).
  Markierte Wörter nehmen die Farbe an (`data-farbe`); ohne Farbe bleiben sie neutral (Antippen ohne Fachbegriff).
  Gestrichelt heißt immer „hier schreiben“ (Lücken) – gesperrte Knöpfe sind nur blasser.
- Leseschrift für LRS: OpenDyslexic (lokal, OFL), Umschalter `useLeseschrift` (`src/lib/leseschrift.ts`), gespeichert auf dem Gerät.
- Prüfen: `node ~/.claude/skills/hallmark/scripts/sloplint.mjs src --genre playful --scope app`.

## Befehle
- `npm run dev` · `npm run build` · `npm run lint` · `npm test`
- `npm run test:datenbank` → Erfolg = „ALLE TESTS BESTANDEN“. **Nach jeder Migration ausführen und erweitern.**

## Rechner der Lehrkraft (Windows 11)
- Projektordner `C:\Users\jrkug\Projekte\satzgarten` (nicht in OneDrive).
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
