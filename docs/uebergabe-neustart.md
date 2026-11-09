# Übergabe für den Neustart – „Übungswiese“ (deutsch-uebungen)

Stand: 9. November 2026. Erstellt aus dem Projektordner `C:\Users\jrkug\Projekte\deutsch-uebungen`.

**Grundlage:** Quellcode, `CLAUDE.md`, `README.md`, `ROADMAP.md`, `DATENSCHUTZ.md` und der lokale Auftrag
`claude-code-prompt.md`. Dazu kommen 19 Datenbank-Migrationen, die Tests und 42 Git-Commits (7.–9. November 2026).

**[unsicher]:** Aussagen, die sich im Projekt nicht direkt belegen lassen, tragen diese Markierung.

**Nicht geprüft:** Die echte Datenbank (Supabase) habe ich nicht geöffnet. Ihr Inhalt fehlt also in diesem Dokument
(Klassen, Pseudonyme, Antworten).

**Zugangsdaten:**
- Im Ordner liegt kein Passwort.
- Der öffentliche Supabase-Schlüssel steht in `src/lib/supabase.ts`: Daten enthalten. Er darf laut Projektregeln öffentlich sein.
- Die Verknüpfung mit dem Supabase-Projekt steht in `supabase/.temp/linked-project.json`: Daten enthalten. Diese Datei wird nicht hochgeladen.

**Echte Schüler:innendaten:** Ich habe keine gefunden. Die Tests verwenden nur ausgedachte Kennungen wie `TEST_token_a1_…`.

---

## 1. Zweck und Zielbild

**Was die Website leisten sollte** (laut Auftrag `claude-code-prompt.md`):
- Eine Übungsplattform für **Rechtschreibung, Grammatik und Textüberarbeitung** im Fach Deutsch, Sek I, Niedersachsen (KGS mit Haupt-, Real- und Gymnasialzweig).
- Die Lehrkraft erstellt Aufgaben und bündelt sie zu **Aufgabenpaketen**.
- Sie weist die Pakete Klassen oder einzelnen Schüler:innen zu.
- Schüler:innen bearbeiten die Aufgaben auf dem **iPad (Safari)** über einen **persönlichen Link**, ohne eigenes Konto.
- Die App wertet jede Antwort automatisch aus. Freie Texte und eine Bewertung von Hand sind ausdrücklich nicht vorgesehen.
- Daraus entsteht ein **Lernstand pro Schüler:in und Kompetenz**, ausgerichtet an den **Kerncurricula Deutsch** (HS, RS, Gym).
- Er wird **im Verlauf** gezeigt, also als Entwicklung über die Zeit.

**Wer die Website nutzt:**

| Gruppe | Rolle (belegt) |
|---|---|
| **Lehrkraft** | Hauptnutzerin. Meldet sich mit E-Mail und Passwort an. Erstellt Klassen (nur Pseudonyme), Aufgaben und Pakete, verteilt Links und sieht den Lernstand. |
| **Schüler:innen** | Öffnen ihren persönlichen Link. Üben, bekommen sofort Rückmeldung und sehen **nur ihre eigene Entwicklung**, nie Noten, Punkte oder Stufen. |
| **Eltern** | Keine eigene Ansicht. In `DATENSCHUTZ.md` (Teil B) werden sie aber als Leser:innen der Datenschutz-Kurzfassung angesprochen. Die Lehrkraft kann eine Entwicklung für **Beratungsgespräche** drucken. |
| **Weitere Lehrkräfte** | Noch nicht. Das Datenmodell ist darauf vorbereitet: Jede Zeile gehört einer Lehrkraft. Die Aufgabenbibliothek zum Teilen ist geplant (ROADMAP 3). |
| **Schulleitung / Datenschutzbeauftragte** | Leser:innen von `DATENSCHUTZ.md`, Teil A. |

**Leitgedanken des Auftrags:**
- Keine Klarnamen.
- Keine absoluten Lernstände für Schüler:innen, und das abgesichert in der Datenbank, nicht nur in der Oberfläche.
- Ermutigende, nie beschämende Rückmeldung.
- Kein Ranking.
- Einfache Sprache für Jahrgang 5–10.
- Die App soll auch bei wackligem WLAN funktionieren.
- Kein Tracking.

---

## 2. Bisherige Schritte (chronologisch, mit Ergebnis)

Alle Schritte stammen aus dem Git-Verlauf. Das Projekt entstand an drei Tagen.

**7. November 2026 – Aufbau und Kern**

1. **Einrichtung (Etappe 0).** Ergebnis:
   - Ein Grundgerüst der App.
   - Automatische Veröffentlichung auf GitHub Pages.
   - README und Projektregeln (`CLAUDE.md`).
2. **Datenbank bei Supabase.** Das erste Projekt lag versehentlich in London und wurde in Frankfurt neu angelegt. Ergebnis:
   - Tabellen und Zugriffsregeln.
   - Funktionen für den Schülerzugang.
   - Ein Test der Zugriffsregeln.
3. **Kern (Etappe 1).** Ergebnis:
   - Lehrkraft-Login.
   - Klassen mit Pseudonymen.
   - Persönliche Links und eine Linkliste.
   - Format Lückentext.
   - Pakete und Zuweisung.
   - Gespeicherte Antworten.
4. **Lernstand (Etappe 2).** Ergebnis:
   - Kompetenzen aus `docs/kompetenzen.csv` importiert.
   - Berechnung des Lernstands.
   - Heatmap für die Klasse und eine Einzelansicht.
   - Eigene Einstellungen der Lehrkraft.
   - Eine Entwicklungsansicht für Schüler:innen.
5. **Nachbesserungen.** Ergebnis:
   - Das Kerncurriculum (KC) wird pro **Klasse** gewählt statt pro Schüler:in.
   - Die Linkliste bekommt QR-Codes.
   - Die Verlaufskurve zeigt ein Datum je Versuch.
   - „Entwicklung drucken“ ersetzt „Neuer Link“.
6. **Design „Übungswiese“ eingebaut** (Grundlage: Entwürfe im lokalen Ordner `design/`).
7. **Weitere Formate (Etappe 3).** Ergebnis:
   - Auswahl, Zuordnen, Fehler finden.
   - Reihenfolge (zunächst nur in der Datenbank).
   - Eine Versionsprüfung, damit iPads neue Versionen laden.

**8. November 2026 – Ausbau und Gestaltung**

8. **Gestaltung und Formate.** Ergebnis:
   - Pixel-Icons und eine **Blumenwiese** auf der Schüler-Startseite.
   - Format Reihenfolge fertig, auch mit Ziehen am iPad.
   - Reihenfolge erweitert: Satzart, mehrere Varianten, keine verräterischen Großbuchstaben.
   - Format **Sätze verbessern** (Versionen mit Begründungshinweisen).
9. **Bedienung verbessert.** Ergebnis:
   - Der Lernweg der Schüler:innen ist entschlackt.
   - Der Editor hat Format-Kacheln, Abschnitte und eine Live-Vorschau.
   - Neue **Erklärseite** im Paket.
10. **Stufen als Sterne.** Ergebnis:
    - Die Stufe steigt automatisch je Themenbereich.
    - Eine von der Lehrkraft eingestellte Stufe hat Vorrang.
11. **Filter.** Aufgaben und Pakete lassen sich filtern nach Titel, Jahrgang (aus den Kompetenzen), Bereich und Kompetenz.
12. **Ergebnisse zurücksetzen** (je Schüler:in und je Klasse). Außerdem entstand `DATENSCHUTZ.md`.
13. **Hilfe-Seite** für Schüler:innen, mit Texten aus `src/schueler/hilfe.md`.
14. **Design-Update in zwei Phasen.** Davor gab es eine Sicherung (Commit `06ed838`, Branch `design-update`). Ergebnis:
    - Die Schüleransicht hat einen 16-Bit-„Pixel“-Look.
    - Die Lehrkraft-Ansicht ist „ruhig“ und sachlich.
    - Danach wurde aufgeräumt.
    - Die Überschriften der Schüleransicht sind auf Wunsch wieder in Fraunces.

**9. November 2026 – Roadmap**

15. **ROADMAP 1.** Die Aufgabenliste lässt sich sortieren nach Titel, Format und Stufe.
16. **ROADMAP 2.** Pakete tragen Tags für Jahrgang (5–10) und Zweig (HS/RS/Gym).
17. **ROADMAP 3: Aufgabenbibliothek.** Vorgemerkt, aber nicht gebaut. Sie wartet auf die Entscheidung, wie weitere Lehrkräfte Konten bekommen.

---

## 3. Aktueller Stand

### 3.1 Funktionen, die vorhanden sind (laut Code und Notizen)

**Lehrkraft** (Bereich `#/lehrkraft/…`)

**Klassen**
- Anlegen, umbenennen und löschen.
- Kerncurriculum je Klasse.
- Pseudonyme automatisch als „Tier-Nummer“ oder aus einer eigenen Liste.
- Schüler:innen löschen.
- Ergebnisse zurücksetzen, einzeln oder für die ganze Klasse.

**Links**
- Eine Linkliste mit QR-Codes, druckbar als PDF über den Browser (`#/lehrkraft/klassen/<id>/links`).

**Aufgaben**
- Liste mit Filter und Sortierung.
- Editor mit Format-Kacheln, den Abschnitten Inhalt, Einordnen und Extras, und Live-Vorschau.
- 7 Formate plus Erklärseite:

| Format (intern) | Kurzbeschreibung |
|---|---|
| `lueckentext` | `[Lösung]`, Alternativen mit `/` |
| `auswahl` | `[das \| *dass]`, antippen oder Dropdown, Einfach- und Mehrfachauswahl |
| `zuordnen` | `[Der kleine Hund = Subjekt]`, Bedienung wie ein Textmarker |
| `fehler` | `[weis -> weiß]`, nur finden oder finden und verbessern |
| `reihenfolge` | Bausteine mit `\|`, Varianten, Ziehen oder Antippen |
| `ueberarbeiten` | „Sätze verbessern“: 2–4 Versionen mit Hinweisen |
| `erklaerung` | Erklärseite mit Text, Merkkasten und Beispielen; zählt nie für den Lernstand |

**Pakete**
- Anlegen mit Tags (Jahrgang, Zweig).
- Aufgaben anordnen.
- Zuweisen an eine Klasse oder an einzelne Schüler:innen.
- Schülervorschau (`#/lehrkraft/pakete/<id>/vorschau`).

**Kompetenzen**
- Liste je Lehrkraft, importiert aus der CSV.
- Kurznamen für die Schüleransicht.
- Ausblenden möglich.

**Lernstand**
- Heatmap der Klasse (Schüler:innen × Kompetenzen).
- Einzelansicht mit Balken `--` bis `++`, Symbol, Startmarke, Trend und Verlaufskurve.
- Druckansicht „Entwicklung drucken“.

**Einstellungen**
- Parameter der Berechnung (Grenzen, Gewichte, Mindestzahl an Versuchen und mehr).
- Texte der Rückmeldekategorien.
- Faktoren der Blumenwiese.

**Schüler:innen** (Bereich `#/s/<token>/…`)
- **Start:** Blumenwiese. Die Blumen wachsen mit der Entwicklung und welken nie. Dazu kommt ein „nächster Schritt“.
- **Meine Übungen:** zugewiesene Pakete. Es erscheinen nur Aufgaben der eigenen Sterne-Stufe.
- **Aufgabe bearbeiten:**
  - Sofortrückmeldung je Lücke oder Platz: ✓ grün, ↻ Pfirsich, nie rot.
  - Die Lösung lässt sich erst nach 2 Versuchen ansehen.
  - Ohne Internet bleibt die Antwort in einer Warteschlange.
- **Mein Lernweg:** Entwicklung in vier Kategorien („deutlich besser“, „besser“, „dranbleiben“, „erste Ergebnisse“) und ein nächster Schritt.
- **Hilfe:** aufklappbare Fragen und Antworten aus `src/schueler/hilfe.md`.

### 3.2 Seiten (Hash-Navigation, `src/App.tsx`, `src/lib/router.ts`)

**Lehrkraft:**
- `#/lehrkraft/klassen`, `/klassen/<id>`, `/klassen/<id>/lernstand`, `/klassen/<id>/links`
- `/schueler/<id>`, `/schueler/<id>/drucken`
- `/aufgaben`, `/aufgaben/<id>`, `/aufgaben/neu-<typ>`
- `/pakete`, `/pakete/<id>`, `/pakete/<id>/vorschau`
- Kompetenzen und Einstellungen

**Schüler:innen:** `#/s/<token>` (Start), `/uebungen`, `/entwicklung`, `/hilfe`, dazu die Aufgabenseite.

**Nur in der Entwicklung:** `#/vorschau…` mit Beispieldaten ohne Anmeldung. Diese Seiten sind nicht in der veröffentlichten App.

### 3.3 Datenmodell (Supabase / PostgreSQL, Migrationen in `supabase/migrations/`)

| Tabelle | Inhalt (gekürzt) |
|---|---|
| `klassen` | owner, name, kerncurriculum |
| `schueler` | owner, klasse_id, pseudonym, token (192 Bit, Klartext), kerncurriculum (vom Trigger aus der Klasse), stufe_manuell, wiese_blumen |
| `aufgaben` | owner, typ, titel, anweisung, hinweis, rueckmeldung_fehler, schwierigkeit (leicht/mittel/schwer = 1–3 Sterne), inhalt (JSON mit Lösungen) |
| `pakete` | owner, titel, beschreibung, jahrgaenge[], zweige[] |
| `paket_aufgaben` | Paket ↔ Aufgabe mit Position |
| `zuweisungen` | Paket → Klasse **oder** Schüler:in |
| `versuche` | jede Abgabe: Antworten, Ergebnis, Anteil richtig, `zaehlt_fuer_lernstand`, Zeitpunkte, client_id (gegen doppelte Abgaben aus der Warteschlange) |
| `loesung_angesehen` | wer welche Lösung angesehen hat |
| `kompetenzen` | je Lehrkraft: code, kerncurriculum, bereich, stufe (6/8/10/6-10), kompetenz, hinweis, kurzname, ausgeblendet |
| `aufgabe_kompetenzen` | Aufgabe ↔ Kompetenz |
| `einstellungen` | Parameter des Lernstands und Rückmeldetexte, je Lehrkraft |
| `schueler_stufen` | automatische Sterne-Stufe je Schüler:in und Themenbereich |

**Zugriff:**
- **Lehrkraft:** direkte Tabellenzugriffe. Row Level Security (RLS) lässt nur die eigenen Zeilen durch (`owner = auth.uid()`).
- **Schüler:innen:** kein Tabellenzugriff. Sie nutzen nur Datenbankfunktionen, die den Token prüfen:
  - `schueler_start`
  - `antwort_abgeben`
  - `loesung_anzeigen`
  - `schueler_entwicklung`
  - `schueler_wiese`
- **Prüfung der Antworten:** in der Datenbank (`pruefe_aufgabe`). Schüler:innen erhalten Aufgaben ohne Lösungen (`inhalt_ohne_loesung`).
- **Lernstand:** wird in SQL berechnet (`auswertung`, `stand_bis`, `gewertete_versuche`, `lernstand_klasse`, `lernstand_schueler`).

### 3.4 Was funktioniert – was ist unfertig oder fehlerhaft?

**Belegt funktionsfähig** (automatische Tests und Prüfungen in den Arbeitssitzungen):
- `npm test`: 84 Tests bestanden (letzter Lauf am 9. November 2026). Sie prüfen:
  - die Lückentext-Schreibweise
  - die Pseudonyme
  - den Filter
  - die Sortierung
  - das Hilfe-Format
  - den CSV-Import
  - den Netzwerkzugriff ohne Anmeldung
- `npm run test:datenbank`: 41 Prüfblöcke zu den Zugriffsregeln, als anonymer Zugriff und als zwei verschiedene Lehrkräfte. Ergebnis: „ALLE TESTS BESTANDEN“.
- Die Veröffentlichung über GitHub Actions läuft. Der letzte Lauf (Commit `d59aafd`) war erfolgreich.

**Unfertig / offen** (belegt in `CLAUDE.md` und `ROADMAP.md`):
- Den **iPad-Test der Sterne-Stufen** hat die Lehrkraft noch nicht gemacht.
- ROADMAP 1 und 2 (Sortierung, Tags): Der **Test durch die Lehrkraft** steht aus.
- ROADMAP 3 **Aufgabenbibliothek:** nicht gebaut. Es fehlt die Entscheidung zu den Konten für Lehrkräfte.
- **Mehrere Lehrkräfte** und **Aufgaben teilen:** nur vorbereitet (`owner`-Spalten), nicht nutzbar.
- **Import aus PDF/Word:** nicht begonnen.
- **Schullogo:** fehlt. Der Platz `logo-platz` ist reserviert.
- Laut Auftrag sollen Kompetenzen „später auch per CSV-Import“ in die App kommen. Bisher läuft der Import über das Skript `scripts/kompetenzen-sql.ts`, nicht über die Oberfläche.
- **Keine automatische Löschung** von Daten. Alles löscht die Lehrkraft von Hand (`DATENSCHUTZ.md`).

**Bewusst vereinfacht** (im Code mit `shortcut:` markiert):
- `20261108170000_format_erklaerung.sql`: Die alte Prüffunktion bleibt unter neuem Namen bestehen. Sie soll beim nächsten Umbau zusammengeführt werden.
- `20261108180000_stufen_automatik.sql`: Gehört eine Aufgabe zu mehreren Themenbereichen, zählt für die Stufe nur der alphabetisch erste.

**Bekannte Fehler:** Im Projekt sind keine offenen Fehler notiert. Das heißt nicht, dass es keine gibt **[unsicher]**:
- Einen Einsatz mit einer echten Klasse kann ich nicht belegen **[unsicher]**.
- Ein Test der Oberfläche auf echten iPads ist nur teilweise belegt.

---

## 4. Technik

**Stack**
- **Frontend:** Vite 8, React 19, TypeScript 7. Statisch gebaut, Ziel Safari 15 (ältere iPads).
- **Bibliotheken:**
  - `@supabase/supabase-js` (Datenbankzugriff)
  - `@dnd-kit/*` (Ziehen und Ablegen mit Touch)
  - `qrcode` (QR-Codes der Linkliste)
- **Werkzeuge:** Vitest (Tests), oxlint (Codeprüfung), Supabase CLI v2 (`npm run db:push`, `npm run test:datenbank`).
- **Schriften:** lokal, kein CDN. Fraunces (Überschriften), Nunito (Text), Pixelify Sans (Knöpfe der Schüleransicht). Alle unter OFL-Lizenz.

**Struktur**

| Ordner | Inhalt |
|---|---|
| `src/App.tsx`, `src/lib/router.ts` | Hash-Navigation. Der Token steht hinter `#`, deshalb geht er nicht an den Server von GitHub Pages. |
| `src/lehrkraft/` | Seiten der Lehrkraft |
| `src/schueler/` | Seiten der Schüler:innen. `speicher.ts` hält Entwürfe und die Offline-Warteschlange im localStorage. |
| `src/gemeinsam/` | Darstellung der Aufgaben (für Schüler:innen und die Vorschau), Blumenwiese, Sterne |
| `src/lib/` | Logik ohne Oberfläche, z. B. Parser der Aufgaben-Schreibweise (`lueckentext.ts`), Filter, Sortierung, Pseudonyme, CSV, Versionsprüfung, Icon-Zuordnung |
| `src/design/` | Tokens, Bausteine (`bundle.css`), Themen „Pixel“ (`pixel.css`) und „Ruhig“ (`lehrkraft.css`), Wiese, Icons, Schriften |
| `src/entwicklung/Vorschau.tsx` | Beispieldaten, nur im Entwicklungsmodus |
| `supabase/migrations/` | 19 SQL-Dateien, insgesamt etwa 2.550 Zeilen |
| `supabase/tests/` | `zugriffsregeln.sql` (DB-Test), `netzwerk.test.ts` |
| `scripts/kompetenzen-sql.ts` | macht aus der CSV SQL für den Import |

**Umfang:** etwa 9.900 Zeilen TypeScript/CSS in `src/`.

**Hosting und Deployment**
- Die App liegt auf **GitHub Pages**: Repo `stift-und-papier/deutsch-uebungen`, **öffentlich**, Adresse `https://stift-und-papier.github.io/deutsch-uebungen/`.
- **Veröffentlichung:** automatisch bei jedem Push auf `main`, über `.github/workflows/veroeffentlichen.yml`.
- **Versionsprüfung** (`src/lib/version.ts`): Safari hielt alte Versionen bis zu 10 Minuten im Speicher. Deshalb vergleicht die App den Namen der Programmdatei und bietet „Neu laden“ an.

**Datenspeicherung**
- **Server:** Supabase, kostenloser Tarif, Frankfurt (`eu-central-1`). Das Projekt pausiert nach etwa einer Woche ohne Nutzung.
- **Gerät:** Der localStorage hält Entwürfe, nicht gesendete Antworten und die zuletzt gesehene Blumenzahl. Bei der Lehrkraft liegt dort auch die Anmeldesitzung.
- **Im Repo:** keine Schülerdaten und keine Geheimnisse. Die KC-PDFs, `design/` und `claude-code-prompt.md` werden absichtlich nicht hochgeladen (`.gitignore`).

---

## 5. Bisherige Entscheidungen und ihre Gründe

Alle Gründe sind im Projekt belegt, vor allem in `CLAUDE.md`, Abschnitt „Entscheidungen (Protokoll)“.

| Entscheidung | Erkennbarer Grund |
|---|---|
| React statt Svelte | Bewährtes Ziehen-und-Ablegen mit Touch für das iPad |
| **Öffentliches** statt privates Repo (Auftrag: privat) | GitHub Pages braucht bei privatem Repo ein Bezahlkonto. Unbedenklich, weil keine Daten und Geheimnisse im Code liegen. |
| Supabase in Frankfurt (erstes Projekt in London verworfen) | Rechtsraum EU / DSGVO |
| Prüfung der Antworten auf dem Server | Lösungen bleiben in der Datenbank, Ergebnisse sind fälschungssicher. Folge: Offline wird erst später geprüft. |
| Link-Token mit 192 Bit, im Klartext gespeichert | Die Linkliste lässt sich jederzeit neu drucken |
| Schülerzugriff nur über Datenbankfunktionen | Absolute Stände sind auch über das Netzwerk nicht abrufbar (Auftrag). Test 1.13 prüft das. |
| KC pro Klasse statt pro Schüler:in | Es gibt keine gemischten Klassen (Lehrkraft) |
| Kompetenz-Kürzel in der Oberfläche ausgeblendet; Kurzname plus KC-Wortlaut | Wunsch der Lehrkraft |
| Lernstand: letzte 10 gewertete Versuche, je Aufgabe und Tag nur der erste, Höchstpunkte 70/85/100, Abklingfaktor 0,85, Grenzen 35/55/70/85, ab 4 Versuchen; Trend erst ab 4 neuen Versuchen und 15 Punkten Unterschied | Vorschlag von Claude, von der Lehrkraft bestätigt. Zufall soll nicht als Fortschritt erscheinen (Auftrag). |
| „Schlechter“ sehen Schüler:innen nie, stattdessen „dranbleiben“ | Ermutigende Rückmeldung (Auftrag) |
| Lösung erst nach 2 Versuchen; danach zählen Versuche nicht mehr für den Lernstand | Didaktische Entscheidung der Lehrkraft |
| **Stufen als Sterne und automatischer Aufstieg** je Themenbereich (80 % richtig im ersten Versuch, mindestens 5 Aufgaben); eine manuelle Stufe hat Vorrang | Didaktische Entscheidung der Lehrkraft. **Abweichung vom Auftrag**, dort stand „kein automatisches Anpassen“. |
| Gestaltung der Formate (Schreibweisen, keine Hinweise durch Großschreibung, Hinweise bei „Sätze verbessern“ erst nach dem Prüfen, kein „Auswählen“ bei „Fehler finden“) | Didaktische Entscheidungen der Lehrkraft, damit Aufgaben die Lösung nicht verraten |
| Erklärseite zählt nie für den Lernstand | Sie ist keine Leistung |
| Blumenwiese aus der Entwicklung, gespeicherter Höchststand, welkt nie, keine Zahl sichtbar | Motivation ohne absolute Stände und ohne Beschämung |
| Zwei Looks aus einer Token-Datei („Pixel“ für Schüler:innen, „Ruhig“ für die Lehrkraft); Überschriften wieder Fraunces | Wunsch der Lehrkraft beim Design-Update |
| Fehler nie rot, sondern Pfirsich; Bedeutung nie nur über Farbe | Gestaltungsregeln (nicht beschämen, Farbsehschwäche) |
| Bibliothek: Übernahme als **Kopie** | Entscheidung der Lehrkraft (9. November 2026) |
| Konten für weitere Lehrkräfte: **später entscheiden** | Entscheidung der Lehrkraft (9. November 2026) |
| Supabase-Anmeldung per Zugangsschlüssel statt Browser-Login | Der Browser-Login scheiterte auf diesem Rechner. Vermutlich stört die HTTPS-Prüfung von Avast **[unsicher, so im Projekt vermerkt]**. |

---

## 6. Was hat sich bewährt, was war problematisch?

**Bewährt (übernehmen)**
- **Schülerzugang ohne Konto:** zufälliger Link, nur Pseudonyme, Token hinter `#`. Das ist datensparsam und für Klassen leicht zu verteilen (QR-Code).
- **Sicherheit in der Datenbank statt in der Oberfläche:**
  - RLS für die Lehrkraft.
  - Für Schüler:innen nur geprüfte Funktionen.
  - Prüfung auf dem Server.
  - Dazu ein **automatischer Test der Zugriffsregeln** (41 Blöcke), der alles wieder rückgängig macht.
- **Trennung „Lernstand für die Lehrkraft“ / „Entwicklung für Schüler:innen“** mit eigener Funktion (`schueler_entwicklung`).
- **Text-Schreibweise für Aufgaben** (`[Lösung]`, `[a | *b]`, `[x -> y]`, `[x = Kategorie]`, `|`-Bausteine): schnell zu tippen und getestet.
- **Offline-Warteschlange** mit `client_id`, damit eine Abgabe nicht doppelt zählt.
- **Versionsprüfung** gegen veraltete Safari-Seiten.
- **Projektregeln und Entscheidungsprotokoll** in `CLAUDE.md`. Dadurch konnte jede neue Sitzung sofort weiterarbeiten.
- **Arbeiten in kleinen Etappen** mit Test durch die Lehrkraft.
- **`DATENSCHUTZ.md`** in zwei Teilen (Schulleitung/DSB und einfache Sprache).

**Problematisch (beim Neustart vermeiden oder früher klären)**
- **Hohes Tempo, viele Umbauten:** 42 Commits in drei Tagen und zwei komplette Design-Durchgänge an einem Tag. Didaktische Regeln wurden mehrfach nachgeschärft (z. B. Reihenfolge, Stufen). Ein Teil davon wäre mit einer Planungsphase vorab entfallen **[unsicher, Einschätzung]**.
- **Viel Logik in SQL:** Jedes neue Format braucht Zweige in drei Datenbankfunktionen (`pruefe_aufgabe`, `inhalt_ohne_loesung`, `nur_loesung`). Das ist sicher, aber aufwendig zu ändern. Das Feld `text` enthält Lösungen und muss immer entfernt werden, eine Stolperfalle.
- **Abweichungen vom Auftrag erst im Lauf entschieden:** öffentliches Repo, automatische Stufen. Beides ist begründet, aber für einen Neustart früh festzulegen.
- **Mehrere Lehrkräfte:** Die Struktur ist vorbereitet, aber die **Konten-Frage ist offen**. Sie blockiert die Bibliothek.
- **Kostenloser Supabase-Tarif pausiert** nach etwa einer Woche ohne Nutzung, zum Beispiel in den Ferien.
- **Rechner der Lehrkraft:** Supabase-Befehle funktionierten im Terminal der Lehrkraft nicht, vermutlich wegen Avast **[unsicher]**. Sie liefen nur über Claudes eigene Shell.
- **Die Ausgabe des Datenbank-Tests wird abgeschnitten.** Das Ergebnis lässt sich nur indirekt prüfen.
- **Rechtliches ungeklärt:** Supabase und GitHub sind US-Firmen. Der Auftragsverarbeitungsvertrag ist laut `DATENSCHUTZ.md` „durch die Schule zu prüfen“. Ob das passiert ist, ist nicht belegt **[unsicher]**.

**Empfehlung für den Neustart** (Einschätzung **[unsicher]**, Entscheidung bei Ihnen)
- **Übernehmen:**
  - das Zugangs- und Sicherheitskonzept
  - die Trennung von Lernstand und Entwicklung
  - die Aufgaben-Schreibweisen
  - das Verfahren des Lernstands als Ausgangspunkt
  - die Gestaltungsregeln
  - `DATENSCHUTZ.md` als Vorlage
  - den Test der Zugriffsregeln als Idee
- **Neu entscheiden:**
  - Konten-Modell für Lehrkräfte (vor allem anderen)
  - Hosting und Vertragslage
  - Wo die Prüflogik lebt (SQL oder ein anderer Weg)
  - Umfang der Aufgabenformate (alle 7 oder weniger zum Start)
  - Design nur einmal festlegen

---

## 7. Wiederverwendbares

| Was | Wo | Hinweis |
|---|---|---|
| Kompetenzraster (154 Kompetenzen: Gym 44, RS 56, HS 54; Bereiche, Stufe Ende Jg. 6/8/10/6-10, KC-nahe Formulierungen) | `docs/kompetenzen.csv` (Trennzeichen `;`) | Von der Lehrkraft erstellt. Bekannte Auffälligkeiten, absichtlich unverändert: HS-Hinweise an RS-Zeilen, das/dass unter Zeichensetzung. |
| Kurznamen der Kompetenzen für Schüler:innen | Datenbank, Tabelle `kompetenzen.kurzname` | Vorschläge von Claude; nur in der DB, nicht im Repo **[unsicher, ob vollständig geprüft]** |
| Ursprünglicher Auftrag (sehr ausführlich) | `claude-code-prompt.md` (nur lokal) | Gute Vorlage für die neuen Anforderungen |
| Projektregeln und Entscheidungsprotokoll | `CLAUDE.md` | Vorlage für das neue `CLAUDE.md` |
| Datenschutz-Texte (Teil A für SL/DSB, Teil B in einfacher Sprache) | `DATENSCHUTZ.md` | Bei neuem Datenmodell anpassen |
| Hilfe-Texte für Schüler:innen (Fragen und Antworten) | `src/schueler/hilfe.md` | Antworten passen zum heutigen Verhalten der App |
| Rückmeldetexte (Kategorien, „Übe als Nächstes:“) | Migration `20261107150000_lernstand.sql` (Standard der Tabelle `einstellungen`) | Von der Lehrkraft änderbar |
| Lernstand-Verfahren mit Parametern | `CLAUDE.md` (Entscheidung vom 7. November) und SQL-Funktion `auswertung` | Erklärbar und einstellbar |
| Regel für Stufen-Aufstieg | `stufen_regel()` in `20261108180000_stufen_automatik.sql` | 80 %, mindestens 5 Aufgaben |
| Schreibweisen der Aufgabenformate und ihr Parser | `src/lib/lueckentext.ts` mit 37 Tests | Kann fast unverändert übernommen werden **[unsicher, abhängig vom neuen Stack]** |
| Pseudonym-Erzeugung (Tier-Nummer) | `src/lib/pseudonyme.ts` | Klein, getestet |
| Test der Zugriffsregeln (Aufbau als Idee) | `supabase/tests/zugriffsregeln.sql` | Prüft anon, Lehrkraft A, Lehrkraft B, Schüler-Token |
| Design: Tokens, Bausteine, zwei Themen, Pixel-Icons (24 SVG), Hintergründe, Schriften mit Lizenzen | `src/design/`; Quelle `design/` (nur lokal, enthält den Schulnamen) | Bildinventar in `_muster/bildinventar.md` (108 Bilder) |
| Blumenwiese (Szene, Plätze) | `src/gemeinsam/Blumenwiese.tsx`, `src/design/wiese/slots.json`, `src/design/wiese.css` | Motivationsidee ohne Zahlen |
| Ideen und Wünsche | `ROADMAP.md`, `CLAUDE.md` („To-do für weitere Etappen“) | Bibliothek, Editor, PDF/Word-Import |
| Kerncurricula als PDF | `docs/*.pdf` (nur lokal) | Urheberrecht: nicht veröffentlichen |

---

## 8. Offene Fragen für die Planungsphase

Die Fragen sind in Alltagssprache formuliert. Wichtig: Sie arbeiten vorwiegend im **Gymnasialzweig**. Bisher war die App
für alle drei Zweige gebaut.

**Anforderungen**
1. **Ziel:** Bleibt der Schwerpunkt bei Rechtschreibung, Grammatik und Textüberarbeitung? Oder soll die neue Website die Lernstandsentwicklung breiter abbilden, z. B. auch Lesen, Schreiben oder Ergebnisse aus Klassenarbeiten?
2. **Nur Gymnasium oder alle Zweige?** Davon hängen das Kompetenzraster und die Tags ab.
3. **Alle 7 Aufgabenformate zum Start** oder zuerst wenige?
4. **Sterne-Stufen:** automatisch, manuell oder beides wie bisher?
5. **Gehören Eltern dazu?** Zum Beispiel ein Ausdruck für das Elterngespräch (gibt es schon) oder eine eigene Ansicht (gibt es nicht)?
6. **Wie wichtig sind Blumenwiese und Pixel-Look** im Verhältnis zu einer schlichten Oberfläche?
7. **Mehrere Lehrkräfte:** Wer bekommt ein Konto? Wer legt Konten an? Soll es Fachgruppen geben, und wird geteilt?
8. **Import aus PDF oder Word:** Ist er noch gewünscht?

**Datenschutz** (DSGVO, Niedersachsen)

Diese Punkte sind im Projekt nicht geklärt **[unsicher]** und müssen mit Schulleitung und DSB geklärt werden:

9. Ist die **Nutzung eines US-Anbieters** (Supabase, GitHub) mit Serverstandort Frankfurt für die Schule zulässig?
   - Gibt es einen **Auftragsverarbeitungsvertrag**?
   - Wer schließt ihn ab: Sie persönlich oder die Schule bzw. der Schulträger?
10. Muss die Verarbeitung ins **Verzeichnis von Verarbeitungstätigkeiten** der Schule? Braucht es eine **Datenschutz-Folgenabschätzung**? (Lernstände sind sensible Bildungsdaten **[unsicher]**.)
11. Gelten **Vorgaben des Landes Niedersachsen** für digitale Lernwerkzeuge oder für die Verarbeitung durch Lehrkräfte? Etwa eine Genehmigung durch die Schulleitung, die Nutzung privater Geräte, das Schulgesetz §31 **[unsicher]**. Ist **IServ** oder die **Niedersächsische Bildungscloud** die bevorzugte Umgebung? (IServ wurde im Auftrag ausgeschlossen, weil dort keine eigenen Web-Apps laufen.)
12. Reichen **Pseudonyme** aus, wenn die Lehrkraft die Zuordnung zur Person auf Papier führt?
13. **Speicherdauer und Löschung:** Soll die App am Schuljahresende **automatisch löschen**? Bisher gibt es nur Löschen von Hand.
14. **Informationspflicht:** Bekommen Schüler:innen und Eltern ein Informationsblatt? Braucht es eine Einwilligung? (Vorlage: `DATENSCHUTZ.md`, Teil B.)

**Datenhaltung**

15. Bleibt **Supabase** (kostenloser Tarif pausiert) oder kommt ein anderer Anbieter bzw. ein Schul- oder Landesserver?
16. Soll die Datenbank **gesichert** werden (Backups)? Wer darf sie wiederherstellen?
17. Wird der **Quellcode wieder öffentlich**? Bei GitHub Pages ist das kostenlos nur mit öffentlichem Repo möglich.
18. Sollen **Daten aus dem alten Projekt übernommen** werden (Aufgaben, Kompetenzen, Kurznamen) oder fängt alles neu an?

**Bedienung durch Lehrkräfte**

19. **Auf welchem Gerät** erstellen Sie Aufgaben (Laptop, iPad)? Wie viel Zeit soll eine Aufgabe höchstens kosten?
20. **Text-Schreibweise** (`[Lösung]`) oder lieber Formulare zum Anklicken? Bisher gibt es beides gemischt.
21. **Wie sollen Links verteilt werden** (Ausdruck, QR-Code, IServ-Nachricht)?
22. **Wie viel Lernstand-Statistik** brauchen Sie wirklich (Heatmap, Verlauf, Trend)?
23. **Wer pflegt die App**, wenn etwas kaputtgeht? Wie viel Technik wollen Sie selbst übernehmen?

---

## 9. Vorschlag einer Gliederung für die Planungsphase

1. **Ziel und Umfang festlegen**
   - Für wen (Gym oder alle Zweige, eine oder mehrere Lehrkräfte, Eltern ja oder nein)?
   - Welche Kompetenzbereiche?
   - Was gehört zur ersten Version, was ausdrücklich nicht?
2. **Datenschutz und Rahmen klären**, vor der Technik
   - Gespräch mit Schulleitung und DSB.
   - Anbieter, Vertrag (AVV), Verzeichnis, Löschfristen, Informationsblatt.
   - Vorgaben des Landes prüfen.
3. **Konten- und Rollenmodell entscheiden**
   - Lehrkraft-Konten, Schülerzugang (Link-Token beibehalten?), Teilen und Bibliothek.
4. **Didaktisches Modell festlegen**
   - Kompetenzraster (CSV prüfen und kürzen).
   - Lernstand-Verfahren und Rückmeldekategorien.
   - Stufen und Aufstieg.
   - Was Schüler:innen sehen und was nicht.
5. **Aufgabenformate priorisieren**
   - Reihenfolge der Formate.
   - Schreibweise oder Formular.
   - Rückmeldung je Format.
6. **Bedienung entwerfen**
   - Wichtigste Abläufe der Lehrkraft: Klasse anlegen, Aufgabe erstellen, zuweisen, Lernstand ansehen.
   - Wichtigste Abläufe der Schüler:innen.
   - Ein Design, einmal festgelegt.
7. **Technik wählen**
   - Hosting und Datenbank.
   - Wo die Antworten geprüft werden.
   - Offline-Verhalten.
   - Backups.
   - Was aus dem alten Projekt übernommen wird (siehe Abschnitt 7).
8. **Etappenplan mit Testpunkten**
   - Kleine Etappen, jede mit einem Test auf dem iPad.
   - Der Test der Zugriffsregeln von Anfang an.
9. **Übergang vom alten Projekt**
   - Wie lange läuft die alte App parallel?
   - Was passiert mit vorhandenen Daten?
   - Löschen am Ende.
