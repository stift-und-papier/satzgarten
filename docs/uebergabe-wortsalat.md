# Übergabe für den Neustart – „Wortsalat“ (bisher „Satzgarten“)

Stand: 11. November 2026. Erstellt aus dem Projektordner `C:\Users\jrkug\Projekte\satzgarten`.

**Grundlage:**
- Quellcode in `src/`, `CLAUDE.md`, `README.md`, `docs/SPEC.md`, `tasks/plan.md`, `tasks/todo.md`.
- Die eine Datenbank-Migration und die Tests.
- 19 Git-Commits (alle vom 9. November 2026).
- Der Ordner `assets/`: 5 ZIP-Pakete und 3 Bilder. Die ZIPs habe ich nur in einen Zwischenordner außerhalb des Projekts entpackt.

**Vorgänger:** Satzgarten ist selbst schon ein Neustart. Der Vorgänger heißt „Übungswiese“ (`C:\Users\jrkug\Projekte\deutsch-uebungen`).
Dessen Übergabe liegt unverändert in `docs/uebergabe-neustart.md`. Wo dieses Dokument „alt“ sagt, ist die Übungswiese gemeint.

**Kennzeichnung:** **[unsicher]** steht bei allem, was sich im Projekt nicht direkt belegen lässt.
**[Vorhaben]** steht bei Ihren neuen Plänen, die noch nicht umgesetzt sind.

**Nicht geprüft:** Die echte Datenbank (Supabase) habe ich nicht geöffnet.

**Ergänzt am 11. November 2026** mit den Antworten der Lehrkraft. Die Entscheidungen sind in Abschnitt 7 gesammelt („Entscheidungen vom 11. November 2026“).

**Zugangsdaten:**
- Ein Passwort liegt nicht im Ordner.
- Der öffentliche Supabase-Schlüssel steht in `src/lib/supabase.ts`: Daten enthalten. Er darf laut Projektregeln öffentlich sein.
- Die Verknüpfung mit dem Supabase-Projekt liegt in `supabase/.temp/`: Daten enthalten. Dieser Ordner wird nicht hochgeladen.

**Echte Schüler:innendaten:** keine gefunden. Es gibt nur Beispiel-Pseudonyme wie „Fuchs-07“ (`src/stil/Stilblatt.tsx`)
und ausgedachte Test-Adressen (`supabase/tests/zugriffsregeln.sql`).

---

## 1. Projekt und Zielbild

**Name:** Der neue Name ist **„Wortsalat“** **[Vorhaben]**. Bisher steht überall „Satzgarten“: Ordner, Repo, Adresse, Code und Texte.

### Was die Website leisten soll (belegt in `docs/SPEC.md`)

- Es ist eine **Übungsplattform für Deutsch in der Sek I**: Rechtschreibung, Grammatik und Textüberarbeitung.
  Ziel sind die Kerncurricula Niedersachsen für den Haupt-, Real- und Gymnasialzweig.
- Die **Lehrkraft** erstellt Aufgaben, fasst sie zu Paketen zusammen und weist sie Klassen oder einzelnen Schüler:innen zu.
- **Schüler:innen** üben am iPad über einen **persönlichen Link** und brauchen kein Konto. Sie sind nur mit einem Pseudonym erfasst.
  Nach jeder Antwort bekommen sie sofort eine Rückmeldung.
- Aus den Antworten entsteht ein **Lernstand je Schüler:in und Kompetenz**, gezeigt als Entwicklung über die Zeit.
- **Motivation:** Bisher ist ein eigener **Garten** geplant, der durch Üben wächst. Er soll ohne Zahlen und ohne Noten auskommen.
  Das Maskottchen begleitet die Schüler:innen. Bisher heißt es **Albert**, künftig **„Einstein“** **[Vorhaben]**.

### Wer die Website nutzt

| Gruppe | Rolle laut Projekt |
|---|---|
| Lehrkraft | Zunächst eine einzige Lehrkraft, mit E-Mail und Passwort. Mehrere Lehrkräfte sind vorbereitet, aber erst „später“ geplant. |
| Schüler:innen | Jahrgang 5–10, am iPad, ohne Konto. Sie sehen nur ihre eigene Entwicklung, nie Punkte, Stufen oder Noten. |
| Eltern | Bisher **keine eigene Ansicht**. Für Gespräche gibt es den Ausdruck „Entwicklung drucken“ (`docs/SPEC.md`, Annahme 9). Ob Eltern im neuen Projekt dazukommen, ist offen **[unsicher]**. |

### Ihre neuen Vorhaben [Vorhaben]

1. Das Projekt heißt künftig **„Wortsalat“**.
2. Die Gartenfunktion wird zu einem **Farm-Spiel** umgebaut (Einzelheiten in Abschnitt 7).
3. UI-Design und Grafiken kommen aus dem Ordner **`assets/`** (Inventar in Abschnitt 8).
4. Es kommt ein neuer Übungsmodus **„Diktat“** dazu, angelehnt an TastenHeld (Einzelheiten in Abschnitt 7a).

**Zweige** (entschieden 11. November 2026): Wortsalat ist weiter für **alle drei Zweige** gedacht (Haupt-, Real- und Gymnasialzweig),
obwohl Sie selbst vorwiegend im Gymnasialzweig unterrichten.

---

## 2. Bisherige Schritte (chronologisch, mit Ergebnis)

Die Schritte stammen aus dem Git-Verlauf und aus `tasks/todo.md`. Alles geschah am **9. November 2026**.

**Vorgeschichte:** Die Übungswiese entstand vom 7. bis 9. November 2026 (Einzelheiten in `docs/uebergabe-neustart.md`).
Am 9. November fiel die Entscheidung für einen Neustart als „Satzgarten“.

| Nr. | Schritt | Ergebnis |
|---|---|---|
| 1 | Grundgerüst (Aufgabe 1) | Das Projekt ist angelegt und automatisch unter `https://stift-und-papier.github.io/satzgarten/` veröffentlicht. Spec und Bauplan liegen bei. |
| 2 | Navigation und Versionsprüfung (Aufgabe 3) | Die Seitenadressen funktionieren. iPads laden neue Versionen. |
| 3 | Datenbank (Aufgabe 2) | Ein neues Supabase-Projekt in Frankfurt mit einer ersten Tabelle `einstellungen`. Dazu ein Test der Zugriffsregeln und ein Netzwerktest. |
| 4 | Stilblatt „Gartenheft“ (Aufgabe 4) | Farben, Knöpfe, Karten, Fachbegriff-Farben, Leseschrift für LRS und dunkler „Abendgarten“. Nach mehreren Runden **freigegeben**. |
| 5 | Maskottchen (Aufgabe 5) | Aus drei Entwürfen wurde Entwurf B gewählt: der Blatthut, Name **Albert**. Er hat 4 Ausdrücke, blinzelt und atmet ruhig. **Freigegeben.** |
| 6 | Garten-Entwurf (Aufgabe 6) | Zaun, Korb mit Samentüten, Bank, Weg, 6 Beete, eine Sonnenblume in 4 Stufen und ein Sammelbuch. Nur zum Ansehen, ohne Datenbank. **Freigegeben** (Haltepunkt 2). |
| 7 | Anmeldung der Lehrkraft (Aufgabe 7) | Anmeldeseite und Rahmen des Lehrkraft-Bereichs sind gebaut und veröffentlicht. Das Lehrkraft-Konto ist **noch nicht angelegt** (Stand 11. November), deshalb fehlt der Test. Die Aufgabe ist nicht abgehakt. |
| 8 | Aufräumen | Versehentlich hochgeladene Referenz-Texte sind aus dem gesamten Git-Verlauf auf GitHub entfernt. Die Regel „nie ins Repo“ ist ergänzt. |

**Nicht begonnen** (laut `tasks/todo.md`): Aufgaben 8–36.
Das sind Klassen, Kompetenzen, alle Aufgabenformate, Pakete, Üben, Lernstand, die Gartenlogik, die Übernahme aus der alten App und die Abnahme.

---

## 3. Aktueller Stand

### 3.1 Seiten (Hash-Navigation, `src/App.tsx`)

| Adresse | Inhalt | Zustand |
|---|---|---|
| `#/` | Platzhalter „Hier entsteht der Satzgarten.“ | nur Text |
| `#/s/…` | Platzhalter der Schüleransicht | nur Text, keine Token-Prüfung |
| `#/lehrkraft/…` | Anmeldung (E-Mail + Passwort). Danach ein Rahmen mit Menü (Klassen, Aufgaben, Pakete, Kompetenzen, Einstellungen) und Abmelden | Menüpunkte zeigen nur „kommt bald“ |
| `#/stil` | Stilblatt mit allen Bausteinen, Schalter für Leseschrift und Abendgarten | zur Design-Prüfung, soll später entfernt werden |
| `#/stil/maskottchen` | Albert mit 4 Ausdrücken und Sprechblase | zur Design-Prüfung |
| `#/stil/garten` | Garten-Entwurf mit Beispieldaten | zur Design-Prüfung |
| `#/vorschau/…` | Lehrkraft-Rahmen mit Beispielinhalt | nur beim Entwickeln, nicht veröffentlicht |

### 3.2 Datenmodell

Belegt ist nur **eine Migration**: `supabase/migrations/20261109180000_start.sql`.
- **Grundsätze:**
  - Ohne Anmeldung gibt es keinen Tabellenzugriff.
  - Neue Datenbankfunktionen sind zunächst für niemanden aufrufbar.
  - Row Level Security ist an.
- **Tabelle `einstellungen`:** `owner` (Lehrkraft) und `guesse_je_stufe` (Standard 3, erlaubt 1–20).
  Mehr Spalten gibt es noch nicht.
- Alle weiteren Tabellen sind nur **geplant** (`tasks/todo.md`, `tasks/plan.md`):
  - `klassen`, `schueler`, `kompetenzen`
  - `aufgaben` (mit getrennter Spalte `loesung`)
  - `pakete`, `zuweisungen`, `versuche`
  - `samen`, `beete`

### 3.3 Was funktioniert, was ist unfertig oder fehlerhaft?

**Funktioniert:**
- Die Veröffentlichung über GitHub Actions. Der letzte Lauf (Commit `6ebb3d9`) war erfolgreich.
- Laut letzter Arbeitssitzung: `npm test` mit 13 Tests (Router, Fachbegriff-Farben), Bauen, Codeprüfung (oxlint) und die Design-Prüfung (Hallmark).
- Der Datenbank-Test bestand bei Aufgabe 2 („ALLE TESTS BESTANDEN“). Danach wurde die Datenbank nicht mehr geändert.

**Unfertig:**
- Die Anmeldung ist nicht getestet: Das Lehrkraft-Konto ist noch nicht angelegt.
  Beim Anlegen ist auch die Selbst-Registrierung im Supabase-Dashboard abzuschalten.
- Haltepunkt 1 („Lehrkraft hat die Adresse am iPad geöffnet“) ist in `tasks/todo.md` nicht abgehakt.
- Die „mehr Kontrast“-Varianten von Albert und Garten sind nicht geprüft. Dasselbe gilt für den Garten auf echten iPad-Größen (quer und hochkant).
- Alle fachlichen Funktionen fehlen noch (Abschnitt 2, „Nicht begonnen“).

**Bekannte Fehler:** keine notiert.

**Hinweis Dateien:** Der Ordner `assets/` steht **nicht** in `.gitignore` und ist bisher nicht hochgeladen.
Würde er versehentlich hochgeladen, wären die Asset-Pakete öffentlich weitergegeben. Das verbietet ihre Lizenz (Abschnitt 8).

---

## 4. Technik

| Teil | Stand (belegt) |
|---|---|
| Oberfläche | Vite 8, React 19, TypeScript 7. Statisch gebaut, Ziel Safari 15, Pfad-Basis `/satzgarten/` (`vite.config.ts`). |
| Bibliotheken | `@supabase/supabase-js`, `@dnd-kit/*` (installiert, noch nicht benutzt), `qrcode` (installiert, noch nicht benutzt). |
| Werkzeuge | Vitest, oxlint, Supabase CLI v2. Dazu das Skript `scripts/fachbegriff-farben.mjs`, das die Farbpalette erzeugt und den Kontrast prüft. |
| Schriften | Lokal und unter OFL-Lizenz: Fraunces (Überschriften), Nunito (Text), OpenDyslexic (Leseschrift). |
| Hosting | GitHub Pages. Repo `stift-und-papier/satzgarten` ist **öffentlich**. Veröffentlichung bei Push auf `main` (`.github/workflows/veroeffentlichen.yml`). |
| Datenbank | Supabase, kostenloser Tarif, Frankfurt (`eu-central-1`), Projekt „satzgarten“. Der Gratis-Tarif pausiert nach etwa einer Woche ohne Nutzung (aus der alten Übergabe). |
| Speicher im Gerät | localStorage: Leseschrift an/aus, Hell/Dunkel. Bei der Lehrkraft auch die Anmeldesitzung. |
| Zielgeräte | Schüler:innen: iPad mit Safari 15+ und fester QWERTZ-Tastatur (Lehrkraft, 11. November 2026). Lehrkraft: Laptop (Spec, Annahme 8). |
| Umfang | Etwa 2.100 Zeilen in `src/` und `supabase/`. |

**Ordner:**
- `src/lehrkraft/`: Anmeldung, Rahmen.
- `src/gemeinsam/`: Albert, Garten-Bausteine, Sterne, Symbole, Anweisung mit Fachbegriff-Farben.
- `src/lib/`: Router, Version, Thema, Leseschrift, Kategorien, Fehlertexte, Supabase.
- `src/design/`: Tokens, Bausteine, Lehrkraft- und Garten-CSS, Schriften.
- `src/stil/`: Vorschauseiten.
- `supabase/`: Migration und Tests.
- `docs/`: Spec, Kompetenz-CSV (154 Zeilen), alte Übergabe.

**Besonderheiten am Rechner der Lehrkraft (aus `CLAUDE.md`):**
- Die Supabase-CLI läuft nur aus Claudes Shell. Im Terminal der Lehrkraft scheitert sie, vermutlich wegen Avast **[unsicher]**.
- `npx.ps1` ist gesperrt.

---

## 5. Bisherige Entscheidungen und erkennbare Gründe

Belegt in `CLAUDE.md` (Protokoll), `docs/SPEC.md` und `tasks/plan.md`.

| Entscheidung | Erkennbarer Grund |
|---|---|
| Neustart als eigenes Projekt, Technik wie bei der Übungswiese | bewährt und kostenlos (Spec, Annahme 1) |
| Repo öffentlich | GitHub Pages ist kostenlos nur mit öffentlichem Repo. Keine Daten und keine Geheimnisse im Code. |
| Lösungen in eigener Spalte `loesung` | Die alte Stolperfalle (Lösungen im Feld `text`) soll entfallen. |
| Je Aufgabenformat eine Prüffunktion in der Datenbank | Ein neues Format soll weniger Aufwand machen als in der alten App. |
| Schülerzugang per Link-Token (192 Bit) hinter `#`, nur Pseudonyme | Datensparsam. Der Token geht nicht an den Server von GitHub Pages. |
| Keine absoluten Lernstände und keine Belohnungszahlen für Schüler:innen, abgesichert in der Datenbank | ermutigend, nicht beschämend, fälschungssicher |
| Design zuerst (Phase 2), mit Freigabe vor allen Schülerseiten | In der alten App gab es zwei Design-Durchgänge an einem Tag. |
| **Pixel-Look entfällt** (Spec 3a); stattdessen gemütlich und handgezeichnet, mit eigenen SVGs | Neue Richtung nach den Referenzbildern. Urheberrecht: alles selbst zeichnen. |
| Eine Farbe = eine Bedeutung (Apple-Richtlinien): Holz = bedienen, Himmelblau = Hilfe, Grün = richtig, Pfirsich = nochmal | Klarheit. Fehler nie rot. |
| Fachbegriff-Farben (Wortarten, Satzglieder, Zeitformen) mit fester Zuordnung | Wunsch der Lehrkraft. Einige Farben hat Claude ergänzt. |
| Leseschrift OpenDyslexic zum Umschalten | Schüler:innen mit LRS |
| Abendgarten (dunkel) folgt dem Gerät und ist von Hand umschaltbar | Wunsch der Lehrkraft |
| Maskottchen Albert, nur eine Figur, ruhige Bewegung, aus bei „Bewegung reduzieren“ | Wunsch der Lehrkraft: nicht ablenkend |
| Gesichter und Figuren nur beim Maskottchen | Gestaltungsregel aus der Spec |
| Garten: Samen je abgeschlossenem Paket und je verbesserter Kompetenz, nicht je Aufgabe. Wachsen durch Üben, welkt nie, keine Zahlen. 12 Blumen und 6 Deko-Dinge, vorerst kein Ernten. | Fleiß zeigen statt Lernstand. Kein Druck, nichts zum Schummeln. |
| Konten legt nur die Lehrkraft im Supabase-Dashboard an, keine Selbst-Registrierung | Sicherheit |
| Referenzbilder, KC-PDFs und Referenz-Texte nie ins Repo | Urheberrecht |

---

## 6. Bisherige Gartenfunktion

### 6.1 Was es gibt (Code)

**`src/gemeinsam/Garten.tsx`** (148 Zeilen) enthält eigene SVG-Zeichnungen, alle `aria-hidden`:
- `Pflanze`: eine Sonnenblume in 4 Stufen (`samen`, `spross`, `pflanze`, `bluete`).
- `Beet`: ein Knopf mit Vorlesetext („Beet 3: Sonnenblume, Spross“). **Antippen tut noch nichts.**
- `Samentuete` und `Korb`: Samen als Bild, nie als Zahl.
- `Bank`, `Zaun` (SVG-Muster), `Weg` (Trittsteine).

**`src/design/garten.css`** (91 Zeilen) setzt die Szene zusammen:
- Wiese mit Zaun, Hof, Weg und Beet-Raster: 3 Beete nebeneinander, auf schmalen Geräten 2.
- Wachstumsreihe und Sammelbuch-Raster mit „?“-Platzhaltern.
- Farben kommen aus `tokens.css` (`--color-erde`, `--color-pflanze` …), in hell und dunkel.

**`src/stil/GartenVorschau.tsx`** zeigt alles mit Beispieldaten: 6 Beete, 2 Tüten und ein Sammelbuch mit 18 Plätzen.

**Datenbank:** Es gibt nur `einstellungen.guesse_je_stufe` (Standard 3).

### 6.2 Wie es funktionieren sollte (nur geplant, `tasks/plan.md` Nr. 7, Aufgaben 30–33)

- **Samen** stehen als Liste von Ereignissen in der Datenbank: Wer bekam wann wofür einen Samen?
  Jeder Grund zählt nur einmal, zum Beispiel ein Samen je Paket.
- **Freie Samen** werden jedes Mal neu gezählt: verdiente minus gepflanzte. Die Zahl wird nicht gespeichert.
- **Wachstum** = erledigte Aufgaben seit dem Pflanzen ÷ `guesse_je_stufe`. Erklärseiten zählen nicht.
- Aufrufe nur über Datenbankfunktionen mit Token-Prüfung: `garten_lesen`, `pflanzen`, `umsetzen`, `entfernen`.
  Schüler:innen bekommen nur Bildangaben.
- „Ergebnisse zurücksetzen“ leert auch den Garten.

### 6.3 Was davon für das Farm-Spiel übernehmbar ist (Einschätzung)

| Teil | Übernehmbar? |
|---|---|
| Idee „Belohnung als Ereignisliste in der Datenbank, jeder Grund nur einmal, Bestand wird gezählt statt gespeichert“ | **Ja, als Muster für Münzen.** Schützt gegen Schummeln über das Netzwerk und gegen doppelte Gutschriften. |
| „Wachsen = erledigte Aufgaben seit dem Pflanzen“ und `guesse_je_stufe` | **Ja**, das passt direkt zu „Übungen dienen als Gießen“. |
| Sammelbuch mit „?“-Platzhaltern | Ja, falls gewünscht **[unsicher]**. Ihre Farm-Wünsche nennen es nicht. |
| Albert (SVG, Ausdrücke, Sprechblase) | Ja als Figur, aber **Stilbruch** zum Pixel-Look der Assets. Im Ordner `assets/` liegt eine Pixel-Fassung (Abschnitt 8). |
| Bedienung per Antippen mit Vorlesetexten (`aria-label`) | Ja, als Regel |
| SVG-Zeichnungen (Sonnenblume, Korb, Bank, Zaun, Weg) und `garten.css` | Eher nicht, wenn die Farm die Pixel-Grafiken aus `assets/` nutzt **[unsicher]**. |
| Garten-Farben in `tokens.css` | Eher nicht. Die Assets bringen eine eigene Palette mit. |

---

## 7. Vorhaben Farm-Spiel [Vorhaben]

Ihre Wünsche aus dem Auftrag, nach Spielmechaniken geordnet. Den Wortlaut habe ich übernommen und **nichts ergänzt**.

| Mechanik | Ihr Wunsch |
|---|---|
| **Münzen** | „Für gelöste Aufgaben erhalten Schüler:innen Münzen.“ |
| **Shop** | „Mit Münzen kaufen sie Tiere, Pflanzen und weitere Dinge für ihre Farm.“ |
| **Spielfigur** | „Eine kleine Spielfigur ist frei beweglich.“ |
| **Pflanzen und Ernte** | „Samen werden auf Feldern eingepflanzt und später geerntet.“ |
| **Tiere und Futter** | „Mit geernteten Produkten werden Tiere gefüttert.“ |
| **Gießen durch Übungen** | „Übungen dienen als ‚Gießen‘: Wer übt, hilft den gepflanzten Samen beim Wachsen.“ |
| **Grafik** | „UI-Design und Assets liegen im Ordner ‚assets‘.“ |

### Entscheidungen vom 11. November 2026 (Lehrkraft)

| Thema | Entscheidung |
|---|---|
| Zweige | Die App ist für **alle drei Zweige** (HS, RS, Gym). |
| Maskottchen | Albert heißt künftig **„Einstein“**. |
| Look | Der **Pixel-Look ist erlaubt**. |
| Figuren | **Figuren dürfen auftreten** (Spielfigur, Tiere). |
| Grafiken | Die Sprout-Lands-Pakete sind **gekauft**. Die drei JPGs sind **selbst erstellte Vorlagen** und müssen noch passend umgewandelt werden (z. B. in Pixel-Spritesheets mit durchsichtigem Hintergrund). |
| Zahlen | **Münzen dürfen als Zahlen** erscheinen. |
| Tiere füttern | **Keine Fress-Animation.** Stattdessen erscheint über dem Tier eine **Sprechblase mit Herz**. |
| Lehrkraft-Konto | Noch nicht angelegt. |
| Diktat-Modus | Neuer Übungsmodus nach dem Vorbild TastenHeld (Abschnitt 7a). Laut Lehrkraft dürfen Ideen, Code und Grafiken von TastenHeld genutzt werden. |
| Geräte | Alle iPads haben eine feste Tastatur mit QWERTZ-Belegung. |
| Rechtschreibkorrektur | Im ganzen Programm **ausgeschaltet**. |

### Wo das Vorhaben bisherigen Entscheidungen widerspricht

Das sind keine Fehler. Diese Punkte müssen Sie in der Planung **bewusst neu entscheiden**.
Durchgestrichen ist, was am 11. November entschieden wurde.

1. ~~**Zahlen:** Bisher gilt „keine Belohnungszahlen“.~~ Münzen dürfen Zahlen sein.
   **Noch offen:** Gilt das Verbot weiter für Lernstände (Punkte, Prozente, Noten)? Und was ist mit Preisen im Shop?
2. **Wofür es Belohnung gibt:** Bisher gibt es Samen je **Paket** und je **verbesserter Kompetenz**, ausdrücklich „nicht je einzelne Aufgabe“.
   Neu: Münzen „für gelöste Aufgaben“.
3. **Ernten:** Bisher heißt es „vorerst kein Ernten“. Neu ist Ernte ein Kern des Spiels, laut Ihrer Beschreibung gewünscht.
4. ~~**Figuren:** Bisher gilt „Gesichter/Figuren nur beim Maskottchen“.~~ Figuren sind jetzt erlaubt.
5. ~~**Look:** Bisher heißt es „Der Pixel-Look entfällt“.~~ Pixel-Look ist erlaubt.
   ~~„Grafiken immer selbst neu zeichnen“~~ gilt nicht mehr für die gekauften Pakete und die eigenen Vorlagen.
6. **Bedienung:** Bisher ist es „bedienbar ohne Ziehen, Antippen reicht“. Eine frei bewegliche Figur braucht eine eigene Steuerung am iPad.
7. **Name:** „Satzgarten“ steht im Repo-Namen, in der Adresse, in `vite.config.ts`, im Datenbankprojekt, in den Texten und in `CLAUDE.md`.
   Dazu kommt die Umbenennung von Albert in Einstein (Code, Texte, `CLAUDE.md`).

---

## 7a. Vorhaben Diktat-Modus [Vorhaben, 11. November 2026]

### Ihr Wunsch (Wortlaut)

> „Es soll zudem einen neuen Diktate Übungsmodus geben, angelehnt an https://github.com/ChalkJunkie/TastenHeld.
> Dort soll man als Lehrkraft Texte einfügen können, die die Schüler dann abtippen müssen, wie bei dem Spiel Tastenheld.
> Ein Modus soll auch sein, dass immer ein (Teil-)Satz erscheint, der nachdem man ‚gemerkt‘ drückt, verschwindet und dann eingetippt werden muss.“

| Teil | Ihr Wunsch |
|---|---|
| Texte | Die Lehrkraft **fügt Texte ein**. |
| Modus 1: Abschreiben | Schüler:innen **tippen den Text ab**, wie bei TastenHeld. |
| Modus 2: Merkdiktat | Es erscheint immer **ein (Teil-)Satz**. Nach Tippen auf **„gemerkt“** verschwindet er und muss **aus dem Gedächtnis eingetippt** werden. |

### Was TastenHeld ist (geprüft am 11. November 2026, Repo-Seite und GitHub-Daten)

- **Zweck:** ein Tipptrainer für das Zehn-Finger-Schreiben für Klasse 5. Pixel-Art-Look, die Spielfigur ist der Roboter „Tipp“.
- **Geräte:** Laptop oder PC ab 1366 × 768 mit echter Tastatur. **Für iPads ist es nicht gedacht.**
- **Daten:** kein Server und keine Anmeldung. Der Spielstand bleibt im Browser oder wird als Datei gespeichert.
- **Modi:**
  - „Regen“: Buchstaben fallen herab.
  - „Monster“: Fertige Wörter schubsen ein Monster zurück, ein Game Over gibt es nicht.
  - „Rennen“: fortlaufender Text abtippen. Das kommt Ihrem Modus 1 am nächsten.
  - Dazu „Tastenkunde“ und eine Geschichte.
- **Rückmeldung bei Tippfehlern:**
  - Bei einem falschen Zeichen **wartet der Cursor auf das richtige Zeichen**. Je Zeichen zählt höchstens ein Fehler.
  - Die Rückmeldung kommt über Farbe, Symbol und Text, ohne Töne.
- **Bewertung:**
  - **Sterne nur für Genauigkeit**, nicht für Tempo. Die Schwellen liegen bei 85, 93 und 98 %.
  - Das Tempo bringt nur Bonuspunkte. Pausen über 3 Sekunden zählen nicht.
  - Es gibt keine Ranglisten.
- **Texte:** Die Texte stehen in JSON-Dateien im Repo. Eine Eingabe für Lehrkräfte in der Oberfläche gibt es dort nicht.
- **Technik:** reines HTML, CSS und JavaScript, veröffentlicht auf GitHub Pages.
- **Lizenz:** Das Repo hat **keine Lizenz** (GitHub meldet „keine“).
  **Laut Lehrkraft (11. November 2026) erlaubt die Programmiererin von TastenHeld die Nutzung von Ideen, Code und Grafiken.**
  Ob sie dafür genannt werden möchte, ist offen.
  Empfehlung: die Erlaubnis schriftlich aufbewahren, zum Beispiel als E-Mail, weil das Repo öffentlich ist.
  Übernommene Teile im Code mit ihrer Herkunft kennzeichnen.

### Was zu bedenken ist (Einschätzung)

- **Tastatur** (entschieden 11. November 2026): Alle iPads der Schule haben eine **fest angebaute Tastatur mit deutscher QWERTZ-Belegung**.
  Das Tippen auf einer echten Tastatur wie bei TastenHeld passt also. Die Bildschirmtastatur muss nicht eingeplant werden.
- **Rechtschreibkorrektur** (entschieden 11. November 2026): In Wortsalat ist die **Rechtschreibkorrektur ausgeschaltet**.
  Das gilt für das ganze Programm, also für jedes Eingabefeld der Schüler:innen, nicht nur für das Diktat.
  - Technisch: Autokorrektur, Rechtschreibprüfung (rote Unterstreichung), Wortvorschläge und automatische Großschreibung
    werden je Eingabefeld abgeschaltet.
  - Ob Safari 15 mit fester Tastatur das in allen Fällen befolgt, muss am iPad getestet werden **[unsicher]**.
    Falls nicht, müsste die Korrektur zusätzlich in den Einstellungen der iPads abgeschaltet werden.
- **Bisherige Regeln, die hier gelten** (aus `CLAUDE.md` und Spec):
  - Prüfung und Lösungen bleiben auf dem Server.
  - Fehler nie rot.
  - Schüler:innen sehen keine absoluten Lernstände.
  - Beim Merkdiktat steht der Text vor dem „gemerkt“ sichtbar auf dem Bildschirm. Beim Abschreiben ist er die ganze Zeit sichtbar.
    Der Text ist hier also selbst die Lösung. Eine Absicherung wie bei den anderen Formaten ist deshalb höchstens während der Merkphase sinnvoll.
- **Bisherige Aufgabenformate:** Diktat wäre ein neues, achtes Format neben Lückentext, Auswahl usw.
  Es braucht eine eigene Prüfung, eigene Rückmeldung und eine Zuordnung zu Kompetenzen.

---

## 8. Inventar des Ordners `assets/`

### 8.1 Übersicht

| Datei | Typ | Inhalt | Auflösung | Mögliche Verwendung |
|---|---|---|---|---|
| `1794384222202.jpg` | JPG-Bild | Pixel-Figur im Stil von Albert: grauer, eckiger Körper, grüner Blatthut mit roter Blüte. 6 Posen: freundlich winkend, lachend, springend vor Freude, erschrocken, neutral winkend und traurig ohne Hut (Blätter fliegen weg). Magenta-Hintergrund. | 1235 × 864 | **Selbst erstellte Vorlage** für Einstein (bisher Albert) als Pixel-Maskottchen. Muss noch umgewandelt werden: Es ist ein JPG ohne durchsichtigen Hintergrund und ohne festes Raster, also **kein Spritesheet**. |
| `1794384436086~2.jpg` | JPG-Bild | Ausschnitt: dieselbe Figur, eine Pose (lächelnd, Hut mit Blüte) | 128 × 171 | wie oben |
| `5975f36110cdccdbf40be8fa71f0ecab.jpg` | JPG-Bild | Pixel-UI: aufgeschlagenes Buch. Links 12 leere Fächer und ein Textfeld, rechts Felder für Bilder und Text. Oben 4 Reiter (Schwerter, Buch, Zahnrad, Diskette), rechts 5 Lesezeichen (Brief mit ?, Sprechblase, Geschenk, Stern, Rucksack). | 630 × 400 | **Selbst erstellte Vorlage** für Inventar, Shop oder Sammelbuch. Muss noch umgewandelt werden. |
| `Sprout Lands - Sprites - Basic pack.zip` | ZIP, 43 Dateien | Kostenlose Grundversion: Figur, Huhn, Kuh, Werkzeuge, Möbel, Pflanzen, Wege, Zäune, Boden-Kacheln, Wasser, Holzhaus | Kacheln 16 px, Figur 48 px | weitgehend in der Premium-Version enthalten |
| `Sprout Lands - Sprites - premium pack.zip` | ZIP, 176 Dateien | Hauptpaket (Details in 8.2) | 16-px-Raster | Farm, Tiere, Pflanzen, Figur |
| `Sprout Lands - UI Pack - Basic pack.zip` | ZIP, 47 Dateien | Kostenlose UI-Grundversion | 16-px-Raster | in der Premium-Version enthalten |
| `Sprout Lands - UI Pack - Premium pack.zip` | ZIP, 200 Dateien | UI-Paket (Details in 8.3) | 16-px-Raster | Knöpfe, Fenster, Symbole, Münzen |
| `Sprout Sorry pack.zip` | ZIP, 152 Dateien | Zusatzpaket „Early Access“: Pflanzen v2 (auch „gegossen“), Bienen, Frosch, Truhen, Möbel, Picknick, Biome, Dorfhäuser, Winter, Halloween, Höhle, Angeln. Dazu 22 Geräusche (WAV) und Test-Figuren. | 16-px-Raster | Erweiterungen, Geräusche |

**Urheber aller ZIP-Pakete:** Cup Nooble („Sprout Lands“). Die Lizenz steht in der jeweiligen `read_me.txt` (8.5).

### 8.2 Sprites (Premium + Sorry Pack)

| Bereich | Dateien (Auswahl) | Inhalt | Format |
|---|---|---|---|
| Spielfigur | `Characters/Premium Charakter Spritesheet.png` | Kleine cremefarbene Figur mit Öhrchen, lila Kontur. 4 Richtungen: Stehen, Gehen, Hacke, Axt, Gießkanne. | 384 × 1152, Einzelbilder 48 × 48 (8 × 24) |
| | `Characters/Basic Charakter Spritesheet.png`, `Tools.png`, `water from wateringcan frames.png` | Gehen in 4 Richtungen, Werkzeuge, Wasserstrahl der Gießkanne | 192 × 192, 96 × 96, 432 × 144 |
| | `Tests/teemo 8 directions.png` (Sorry) | Figur in 8 Richtungen | 128 × 48 |
| Feldpflanzen | `Objects/Farming Plants.png` | 15 Sorten je Saat + 4 Wachstumsstufen, z. B. Mais, Möhre, Blumenkohl, Tomate, Aubergine, Salat, Weizen, Kürbis, Rübe, Gurke | 80 × 240 (16-px-Kacheln) |
| | `Plant update 2/Farming Plants v2.png` und **`… v2 watered.png`** (Sorry) | 33 Reihen, auch Sonnenblume, Ananas, Kohl. **Eigene „gegossen“-Variante.** | je 112 × 528 |
| Ernte-Gegenstände | `Objects/Items/All items.png` | Samentüten je Sorte, Ernte (Gemüse, Obst), Werkzeuge, Holz, Steine, Eier, Milch- und Marmeladengläser | 128 × 240 (16 px) |
| | `Farming Plants items.png`, `fruit and berries items.png`, `milk-items.png`, `egg-items.png` | einzelne Sammelbilder | 16-px-Kacheln |
| Tiere | `Animals/Chicken/*` | Huhn in 5 Farben: laufen, picken, sitzen, schlafen, Herzchen | je 128 × 432 |
| | `Animals/Chicken_Baby/*`, `Animals/Chicken_Egg/*` | Küken (5 Farben), schlüpfendes Ei | 128 × 304, 160 × 288 |
| | `Animals/Cow/*`, `Animals/Cow_Baby/*` | Kuh und Kalb in 5 Farben: laufen, liegen, **Gras fressen**, Herzchen | 256 × 256, 256 × 288 |
| | Sorry: `Bee/*`, `frog/*` | Biene, Bienenstock, Brot-/Marmelade-/Honig-Gegenstände, Frosch | 16–32 px |
| Tierbauten | `Animal Structures/Chikcen_Houses.png`, `Barn structures.png`, `Water tray.png` | Hühnerhäuser in 6 Dachfarben, Stallteile, Wassertrog | 384 × 176, 48 × 64, 96 × 16 |
| Bäume | `Tree animations/*` | Bäume mit Äpfeln, Orangen, Pfirsichen, Birnen; Fallen-Animation | 576 × 240 u. a. |
| Natur und Deko | `Mushrooms, Flowers, Stones.png`, `Trees, stumps and bushes.png`, `Water Objects.png`, `Water well.png`, `Piknik *`, `signs*.png`, `Boats.png`, `work station.png` | Blumen (darunter Sonnenblume), Pilze, Steine, Büsche, Brunnen, Picknick, Schilder, Boote, Werkbank | 16–192 px |
| Bauten | `Tilesets/Building parts/*` | Zäune, Tore (animiert), Wege, Steinweg, Brücke, Holzhaus (Dach/Wände), Türen, Briefkasten (animiert), Truhe, Möbel | 16-px-Kacheln |
| Boden | `Tilesets/ground tiles/New tiles/*` | Gras, dunkles Gras, Erde, Stein, Hügel und Hänge, Büsche, Wasser (4 Bilder Animation). Dazu Vorschaubilder und Bitmask-Vorlagen für automatisches Kacheln. | 176 × 112 u. a., Vorschau 2240 × 1344 |
| Farbpalette | `Sprout Lands color pallet/*` | Standardpalette: 12 Reihen Verläufe von Lila bis Grau, warm und pastellig (PNG + Aseprite) | 16 × 7 px, Ausschnitt 236 × 371 |
| Quelldateien | `*.aseprite`, Vorschau-GIFs | zum Bearbeiten in Aseprite, Animationen zur Ansicht | – |

### 8.3 UI (Premium UI Pack)

| Bereich | Dateien | Inhalt |
|---|---|---|
| Gesamtübersicht | `UI Sprites/ALL UI ASSETS on one sheet.png` (896 × 896) | alle UI-Teile auf einem Blatt |
| Knöpfe | `buttons/square/*`, `buttons/round/*`, `Icon Buttons Spritesheet.png` | eckige Holz- und Papierknöpfe in mehreren Größen, runde farbige Knöpfe, Symbolknöpfe, jeweils normal und gedrückt |
| Symbole | `Icons/All Icons.png` (256 × 320), `white icons.png` | etwa 40 Symbole in 4 Farbstufen (weiß, hell, braun, grün): z. B. Zahnrad, ?, Stern, Pokal, Haken, X, Play, Herz, $, Einkaufswagen, Lautsprecher, Haus, Plus/Minus, Pfote, Ein/Aus |
| **Münzen** | `Icons/special icons/coins.png` (128 × 48) | goldene Münze, klein und groß, 4 Randvarianten |
| Sterne, Herzen, Stimmung | `stars.png`, `stars in wood.png`, `Hearts.png`, `Hearts in wood.png`, `*Happines-Sadness icons.png` | Sterne und Herzen in Stufen; Gesichter froh bis traurig |
| Fenster und Dialoge | `Dialouge UI/*`, `Character Backdrop-frame/*`, `Setting menu.png` | Dialogkästen in 3 Größen, „weiter“-Anzeiger, Rahmen für Figurenbilder, Einstellungsmenü |
| Sprechblasen und Emotes | `emojis/speech_bubble_*.png` (6 Farben, je 448 × 192), `Emoji spritesheet.png`, `Teemo … emote animations` | Sprechblasen, Emoji-Gesichter, animierte Gefühlsanzeigen der Figur |
| Inventar | `emoji style ui/Inventory_*` | Inventar-Fächer, Herzleisten, Rahmen; helle und dunkle Variante |
| Sonstiges | `Sliders/*`, `Selectors/*`, `Xs and check marks/*`, `Stamina circle …`, `Weather_*`, `Thermometer_UI*`, `Mouse sprites/*`, `UI Big Play Button.png` | Schieberegler, Auswahlrahmen, Haken und X, Ausdauer-Kreis, Wetter, Mauszeiger, Play-Knopf |
| **Schriften** | `fonts/Font files TTF/pixelFont-*-sproutLands.ttf` (5 Schriften + 1 im Basic Pack) | Pixel-Schriften 5 × 4 bis 8 × 14. **Keine Umlaute und kein ß**: Geprüft sind alle 6 Dateien. Sie enthalten nur A–Z, a–z, Ziffern und einige Satzzeichen. |

### 8.4 Einschätzung: Was decken die Assets ab, was fehlt?

| Spielelement | Abgedeckt? |
|---|---|
| Münzen | **Ja**: Münzbild, Symbole $ und Einkaufswagen |
| Shop | **Teilweise**: Fenster, Knöpfe, Inventar-Fächer, Schilder und die Buch-Vorlage (JPG). Ein eigenes Laden-Gebäude oder ein Verkaufsstand fehlt **[unsicher, nicht jede Datei einzeln geöffnet]**. |
| Spielfigur | **Ja**: 4 Richtungen mit Gehen, Hacken und Gießen. 8 Richtungen nur als Test-Figur im Sorry Pack. |
| Felder, Pflanzen, Ernte | **Ja, sehr gut**: Ackerboden, 15–33 Sorten in Stufen, Samentüten, Erntegegenstände, gegossene Variante |
| Tiere | **Teilweise**: Huhn, Küken, Kuh, Kalb, Biene, Frosch. Weitere Tierarten fehlen. |
| Futter | **Ja**, nach der Entscheidung vom 11. November: Über dem Tier erscheint eine Sprechblase mit Herz, eine Fress-Animation ist nicht nötig. Sprechblasen (6 Farben) und Herzen liegen im UI-Paket. Huhn und Kuh haben außerdem eigene Herzchen-Animationen. Ernteprodukte gibt es als Gegenstände. |
| Tierprodukte | Eier, Milch, Honig |
| Gießen | **Ja**: Gießkanne, Wasserstrahl, gegossene Pflanzen |
| Deko | **Ja, viel**: Zäune, Wege, Brücke, Brunnen, Bäume, Blumen, Möbel, Truhen, Schilder, Briefkasten, Picknick |
| Maskottchen Einstein (bisher Albert) als Pixel-Figur | **Nur als eigene Bildvorlage** (2 JPGs). Ein Spritesheet mit Animation muss daraus noch entstehen. |
| Deutsche Schrift | **Fehlt**: Die Pixel-Schriften haben keine Umlaute und kein ß. |
| Dunkelmodus, mehr Kontrast | **Fehlt**: Die Assets gibt es nur in einer Fassung. Das UI-Paket hat eine hellere und eine dunklere Inventar-Variante. |
| Lehrkraft-Oberfläche | nicht Teil der Assets; braucht sie auch nicht |
| Geräusche | 22 kurze WAV-Effekte (Sorry Pack). Ob sie gewünscht sind, ist offen. |

**Technisch zu beachten:**
- Pixel-Grafiken müssen in ganzen Vielfachen vergrößert werden (16 px → 48 oder 64 px), ohne Weichzeichnen.
- Ein Einzelbild im 16-px-Raster ist auf dem iPad sehr klein. Es muss mindestens dreifach vergrößert werden, damit Tippflächen ≥ 48 px erreicht werden.

### 8.5 Lizenz (aus den `read_me.txt` der Pakete)

| Paket | Gewerbliche Nutzung | Bearbeiten | Weitergabe des Pakets selbst | Namensnennung |
|---|---|---|---|---|
| Sprites Premium, UI Premium | erlaubt | erlaubt | **verboten**, auch verändert | **Pflicht** („Assets – From: Sprout Lands – By: Cup Nooble“) |
| Sprites Basic, Sorry Pack | **nur nicht-gewerblich** | erlaubt | verboten | Pflicht |
| UI Basic | nur nicht-gewerblich | erlaubt | verboten | nicht ausdrücklich genannt |

**Für alle Pakete gilt außerdem:**
- Kein Einsatz für NFTs und kein KI-Training.
- Open-Source-Projekte sind erlaubt, „mit Hinweis auf Cup Nooble und die Lizenzbedingungen“.

**Gekauft** sind laut Lehrkraft die Sprout-Lands-Pakete (11. November 2026). Die Basic-Pakete und das Sorry Pack haben eigene, engere Lizenzen (nur nicht-gewerblich).
Für ein Schulprojekt ohne Einnahmen reicht das vermutlich **[unsicher]**.

**Weg für die Website** (Einschätzung **[unsicher]**, keine Rechtsberatung):
- Die ZIP-Pakete und der ganze Ordner `assets/` kommen in `.gitignore` und **nie** ins Repo.
- Die Website wird bei GitHub aus dem Repo gebaut. Was nur in `.gitignore` steht, fehlt deshalb auf der veröffentlichten Seite.
- Deshalb kommen **nur die tatsächlich benutzten Einzelbilder** in einen eigenen Projektordner, zum Beispiel `src/grafik/`.
  Dazu gehören eine Lizenzdatei und die Namensnennung („Assets – From: Sprout Lands – By: Cup Nooble“) in der App, etwa auf der Hilfe-Seite.
- Die Lizenz erlaubt ausdrücklich, eigene Projekte mit den Assets zu veröffentlichen, auch als Open Source, mit diesem Hinweis.
  Verboten ist, das **Paket selbst** weiterzugeben.
- Ob ein öffentliches Repo mit einzelnen Bildern schon als „Weitergabe“ gilt, lässt sich beim Urheber sicher klären. Er bietet das in der `read_me.txt` an (Discord).

---

## 9. Bewährtes und Problematisches

**Bewährt – übernehmen** (Einschätzung, Entscheidung bei Ihnen):
- **Sicherheit in der Datenbank:**
  - RLS.
  - Schüler:innen nur über Funktionen mit Token-Prüfung.
  - Prüfung der Antworten auf dem Server.
  - Lösungen in eigener Spalte.
  - Ein Test der Zugriffsregeln ab der ersten Migration.
- **Schülerzugang ohne Konto:** Link-Token hinter `#`, Pseudonyme, QR-Codes.
- **Belohnung als Ereignisliste:** Jeder Grund zählt nur einmal, der Bestand wird gezählt. Gut geeignet für Münzen und Wachstum.
- **Arbeiten mit Haltepunkten und Freigaben**, dazu das Entscheidungsprotokoll in `CLAUDE.md`.
- **Erst Design festlegen, dann Seiten bauen.** Phase 2 hat Umbauten vermieden.
- **Barrierearmut:**
  - Kontrast ≥ 4,5:1, Tippflächen ≥ 48 px.
  - Bedeutung nie nur über Farbe.
  - Fehler nie rot.
  - Vorlesetexte.
  - Leseschrift für LRS, „Bewegung reduzieren“.
- **Fachbegriff-Farben** mit Skript und Kontrastprüfung, sofern sie zum neuen Look passen **[unsicher]**.
- **Versionsprüfung** gegen veraltete Seiten in Safari.
- Aus der alten Übungswiese: Parser der Aufgaben-Schreibweise, Pseudonyme, Lernstand-Verfahren (`docs/uebergabe-neustart.md`, Abschnitt 7).

**Problematisch – nicht übernehmen oder neu klären:**
- **Zwei Neustarts in kurzer Zeit:** Übungswiese → Satzgarten → Wortsalat.
  Fachlich ist im Satzgarten noch nichts gebaut (Abschnitt 2). Der Verlust ist also klein, aber das Design wird zum dritten Mal neu festgelegt.
- **Das freigegebene Design passt nicht zu den Assets:**
  - Bisher: handgezeichnet, SVG, Fraunces und Nunito.
  - Neu: Pixel-Art im 16-px-Raster.
  - `tokens.css`, `bausteine.css`, `garten.css` und Albert als SVG müssten neu gedacht werden.
- **Regeln in `CLAUDE.md` und der Spec, die am 11. November geändert wurden** (Abschnitt 7): Zahlen bei Münzen, Figuren, Pixel-Look, gekaufte Grafiken.
  Diese Regeln müssen beim Neustart in `CLAUDE.md` und Spec angepasst werden.
- **Pixel-Schrift ohne Umlaute:** Für deutsche Texte ungeeignet, wenn sie nicht ergänzt wird.
- **Eigene Vorlagen (JPG) sind noch keine nutzbaren Grafiken:** Sie müssen in Pixel-Spritesheets umgewandelt werden.
- **Kostenloser Supabase-Tarif pausiert** in den Ferien.
- **Datenschutz ungeklärt:** Der Einsatz mit echten Klassen ist erst nach Freigabe durch Schulleitung und DSB erlaubt.

---

## 10. Offene Fragen für die Planungsphase

Die Fragen sind in Alltagssprache formuliert. Mit „Spiel“ ist die Farm gemeint, mit „Üben“ die Deutschaufgaben.

### Pädagogik
1. **Tempo und Raten:** Wie verhindern wir, dass schnelles Klicken oder bloßes Raten Münzen bringt? Mögliche Stellschrauben:
   - nur der erste Versuch zählt
   - eine Aufgabe bringt nur einmal etwas
   - nichts nach „Lösung ansehen“
   - eine Obergrenze je Tag
   - Münzen je Paket statt je Aufgabe

   Was davon passt zu Ihrem Unterricht?
2. **Wie viele Münzen bringt welche Aufgabe?** Gleich viel für alle? Mehr für schwierigere Aufgaben (Sterne-Stufe)?
   Gibt es etwas für Erklärseiten? Bisher zählen sie nie.
3. **Lernstand und Wachstum:** Soll das Wachstum der Pflanzen nur vom Üben abhängen, also vom Fleiß? Oder auch vom Lernfortschritt?
   Bisher galt: Der Garten zeigt Fleiß, keinen Lernstand.
4. ~~Sollen Schüler:innen Zahlen sehen?~~ Münzen als Zahlen sind erlaubt (11. November).
   **Noch offen:** Gilt das Verbot weiter für Lernstände (Punkte, Prozente, Noten)? Was zeigen Preise im Shop?
5. **Vergleich unter Schüler:innen:** Bisher gibt es keine Ranglisten. Bleibt das so, auch wenn Farmen sichtbar unterschiedlich groß werden?
6. **Ablenkung:** Wie viel Spielzeit ist im Unterricht erwünscht? Darf die Farm nur nach dem Üben geöffnet werden?
7. **Einstein (bisher Albert):** Er wird zur Pixel-Figur nach Ihrer Vorlage. Offen ist noch:
   Wer wandelt die Vorlage in ein Spritesheet um? Welche Posen und welche Bewegung (blinzeln, atmen) bleiben?

### Spielbalance
8. **Münzwirtschaft:** Was kostet ein Samen, ein Huhn, eine Kuh, eine Deko? Wie lange soll man für das erste Tier üben?
9. **Wachstumsdauer:** Wie viele Übungen braucht eine Pflanze bis zur Ernte? Bisher waren 3 „Güsse“ je Stufe vorgeschlagen.
   Wächst etwas auch ohne Üben, also mit der Zeit?
10. **Folgen, wenn man nicht übt:** Bisher galt: Der Garten welkt nie, nichts geht verloren.
    Was passiert jetzt mit ungegossenen Pflanzen und ungefütterten Tieren, zum Beispiel in den Ferien oder bei Krankheit?
11. **Tiere füttern:** Beim Füttern erscheint eine Sprechblase mit Herz (11. November).
    Offen ist: Was bringt das Füttern sonst noch (Eier, Milch …)? Und was passiert, wenn man nicht füttert?
12. **Ende und Wachstum der Farm:** Gibt es ein Ziel, mehr Felder, neue Gebiete? Was passiert am Schuljahresende mit der Farm?
13. **Zurücksetzen:** Wenn Sie Ergebnisse zurücksetzen, ist dann auch die Farm weg? So war es bisher.

### Technik
14. **Spielfigur am iPad:** Wie wird die Figur gesteuert? Zum Beispiel tippt man auf eine Stelle und die Figur läuft hin, oder es gibt Pfeiltasten auf dem Bildschirm.
    Muss alles auch ohne Figur bedienbar bleiben (Barrierefreiheit, „Bewegung reduzieren“)?
15. **Felder im Browser:** Wie groß ist die Farm? Passt sie auf einen Bildschirm, oder kann man sie verschieben?
    Hoch- und Querformat? Ältere iPads (Safari 15)?
16. **Speicherung des Spielstands:** Alles auf dem Server, damit nichts verloren geht und niemand schummelt? Oder Teile nur auf dem iPad?
    Was passiert, wenn mehrere Schüler:innen ein iPad teilen? Was passiert ohne WLAN?
17. **Neue Bibliothek nötig?** Ein Spielfeld mit Figur lässt sich mit eigenem Code bauen oder mit einer Spiel-Bibliothek.
    Bisher sind neue Bibliotheken nur nach Rückfrage erlaubt.
18. **Schrift:** Pixel-Schrift ergänzen (Umlaute selbst zeichnen) oder für Texte eine normale Schrift nehmen?
19. **Grafik-Lizenz:** Die Pakete sind gekauft. Offen ist: Nur benutzte Einzelbilder ins öffentliche Repo, wie in Abschnitt 8.5 beschrieben?
    Oder vorher beim Urheber nachfragen?
20. **Umbenennung:** Neues Repo und neue Adresse (`…/wortsalat/`)? Neues oder umbenanntes Datenbankprojekt?
    Was passiert mit dem bisherigen Satzgarten und der alten Übungswiese?

### Datenschutz
21. **DSGVO:** Spielstände, Münzen und Übungszeiten sind neue Daten über Schüler:innen. Lassen sie Rückschlüsse auf Verhalten zu (wann, wie lange gespielt)?
    Was davon wird wirklich gebraucht?
22. **Schüler:innendaten:** Bleibt es bei Pseudonymen und Link ohne Konto? Wer führt die Zuordnungsliste?
23. **Vorgaben des Landes Niedersachsen:**
    - Ist eine Genehmigung durch die Schulleitung nötig?
    - Muss die Verarbeitung ins Verzeichnis von Verarbeitungstätigkeiten?
    - Braucht es eine Datenschutz-Folgenabschätzung?
    - Gibt es Vorgaben zu Lern-Apps mit Spielelementen **[unsicher]**?
24. **Speicherort:** Supabase und GitHub sind US-Firmen mit Servern in Frankfurt. Ist das für die Schule zulässig?
    Wer schließt den Auftragsverarbeitungsvertrag ab? Wann wird gelöscht, zum Beispiel am Schuljahresende?
25. **Informationen:** Welches Informationsblatt bekommen Schüler:innen und Eltern? Braucht es eine Einwilligung?

### Diktat-Modus
26. **Tippfehler:** Soll der Cursor wie bei TastenHeld beim falschen Zeichen warten? Oder tippt man den ganzen (Teil-)Satz und bekommt erst danach Rückmeldung?
    Beim Merkdiktat ist das ein großer Unterschied: Wartet der Cursor, verrät er jeden Fehler sofort.
27. **Merkdiktat:** Wer teilt den Text in (Teil-)Sätze, die Lehrkraft oder die App? Darf man sich den Satz nochmal ansehen? Wenn ja, wie oft?
    Wie lange bleibt er höchstens sichtbar?
28. **Was zählt als Fehler?** Groß- und Kleinschreibung, Satzzeichen, doppelte Leerzeichen?
29. **Bewertung:** Zählt das Diktat für den Lernstand? Zu welchen Kompetenzen? Bringt es Münzen bzw. „gießt“ es? Wenn ja, wie, ohne Tempo zu belohnen?
30. ~~Gerät?~~ Entschieden am 11. November: Alle iPads haben eine feste QWERTZ-Tastatur. Die Rechtschreibkorrektur ist im ganzen Programm aus.
31. **Vorlesen:** Ein klassisches Diktat wird vorgelesen. Ihr Wunsch beschreibt Abschreiben und Merken, kein Vorlesen. Bleibt das so?

### Bedienung durch Lehrkräfte
32. **Was stellt die Lehrkraft am Spiel ein?** Zum Beispiel Münzen je Aufgabe, Preise, Wachstumsdauer, Spiel an oder aus je Klasse.
    Wie viel davon soll überhaupt einstellbar sein?
33. **Was sieht die Lehrkraft von der Farm?** Nichts, eine Übersicht oder die Farm einzelner Schüler:innen?
34. **Eltern:** Bekommen Eltern etwas zu sehen, zum Beispiel einen Ausdruck oder eine Ansicht?
35. **Aufwand:** Wie viel Zeit soll eine Aufgabe höchstens kosten? Bleibt die Text-Schreibweise (`[Lösung]`)?

---

## 11. Vorschlag einer Gliederung für die Planungsphase

1. **Ziel und Umfang neu festlegen**
   - Name „Wortsalat“ und Einstein. Zielgruppe: alle Zweige (entschieden). Eltern ja oder nein.
   - Was gehört zur ersten Version: erst das Üben und der Lernstand, dann das Spiel? Oder beides zusammen?
2. **Widersprüche zu alten Regeln entscheiden** (Abschnitt 7)
   - Offen: Belohnung je Aufgabe oder je Paket, Bedienung der Figur, Zahlen bei Lernständen.
   - Entschieden am 11. November: Münzen als Zahlen, Figuren, Pixel-Look, gekaufte Grafiken.
   - Danach `CLAUDE.md` und die Spec anpassen.
3. **Pädagogisches Modell des Spiels**
   - Schutz gegen Tempo und Raten.
   - Münzen je Aufgabe oder Paket.
   - Zusammenhang Üben → Gießen → Wachstum.
   - Folgen von Nicht-Üben, Ferien.
4. **Diktat-Modus festlegen** (Abschnitt 7a)
   - Abschreiben und Merkdiktat, Rückmeldung bei Tippfehlern, Bewertung.
   - Früh am iPad mit fester Tastatur testen, ob die Rechtschreibkorrektur wirklich aus ist.
   - Erlaubnis von TastenHeld schriftlich aufbewahren (Ideen, Code, Grafiken). Klären, ob eine Namensnennung gewünscht ist.
5. **Spielregeln und Balance**
   - Preisliste, Wachstumsdauer, Tiere und Futter, Ziele.
   - Was die Lehrkraft einstellen kann.
6. **Datenschutz und Rahmen**
   - Gespräch mit Schulleitung und DSB: neue Spieldaten, Speicherort, AVV, Löschfristen, Informationsblatt.
7. **Grafik und Lizenz**
   - Eigene Vorlagen (Einstein, Buch) in Pixel-Spritesheets umwandeln.
   - Was ins Repo darf (nur benutzte Einzelbilder), Namensnennung.
   - Schrift mit Umlauten.
8. **Design neu festlegen** (einmal, mit Freigabe)
   - Pixel-Look der Schüleransicht.
   - Ob die Lehrkraft-Ansicht „ruhig“ bleibt.
   - Albert als Pixel-Figur.
   - Barrierefreiheit (Kontrast, Tippflächen, dunkel, „Bewegung reduzieren“) mit Pixel-Grafiken.
9. **Technik entscheiden**
   - Spielfeld und Figur im Browser, Steuerung am iPad.
   - Speicherung des Spielstands (Server, fälschungssicher).
   - Offline-Verhalten, ältere iPads, eventuell neue Bibliothek.
   - Umbenennung von Repo, Adresse und Datenbank.
10. **Übernahme aus Satzgarten und Übungswiese**
   - Sicherheitskonzept, Test der Zugriffsregeln, Router, Versionsprüfung.
   - Kompetenz-CSV, Parser und Lernstand-Verfahren (alt).
   - Was wird gelöscht?
11. **Etappenplan mit Haltepunkten**
    - Kleine Schritte, jeder mit iPad-Test.
    - Spiel und Üben als getrennte, einzeln testbare Bausteine.
