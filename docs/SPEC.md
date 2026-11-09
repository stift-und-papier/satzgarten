# Spec: Satzgarten (Neustart der „Übungswiese“)

Stand: 9. November 2026 · Status: **Entwurf, wartet auf Freigabe der Lehrkraft**
Grundlage: `docs/uebergabe-neustart.md`, Referenzbilder in `refrences/` und Antworten der Lehrkraft vom 9. November 2026.

> Diese Datei liegt vorerst im alten Projekt und zieht ins neue Projekt **Satzgarten** um, sobald es angelegt ist.

---

## 0. Annahmen (von der Lehrkraft bestätigt am 9. November 2026)

1. **Technik wie bisher:** Vite + React + TypeScript, GitHub Pages, Supabase (Frankfurt). Grund: bewährt, kostenlos.
   Die Datenschutz-Klärung (Abschnitt 9) ist **Voraussetzung vor dem Einsatz mit echten Klassen**, nicht vor dem Bauen.
2. **Repo wieder öffentlich** (GitHub Pages kostenlos nur so). Keine Daten, keine Geheimnisse im Code.
3. **Prüfung der Antworten bleibt auf dem Server** (in der Datenbank). Neu: Lösungen liegen in einer **eigenen Spalte**
   `loesung`, getrennt vom Aufgabeninhalt. So kann keine Lösung mehr versehentlich an Schüler:innen gehen
   (bisherige Stolperfalle: Feld `text`).
4. **Aufgaben-Schreibweise** (`[Lösung]`, `[das | *dass]`, `[weis -> weiß]`, `[Hund = Subjekt]`, `|`-Bausteine)
   bleibt; der Parser `src/lib/lueckentext.ts` wird mit seinen Tests übernommen.
5. **Schülerzugang** wie bisher: persönlicher Link (Token 192 Bit hinter `#`), kein Konto, nur Pseudonyme.
6. **Lernstand-Verfahren** wie bisher (letzte 10 Versuche, 70/85/100, Abklingfaktor 0,85, Grenzen 35/55/70/85,
   ab 4 Versuchen) als einstellbarer Startpunkt.
7. **Kompetenzbereiche** bleiben Rechtschreibung, Grammatik, Textüberarbeitung (kein Lesen/Schreiben, keine Klassenarbeiten).
8. **Lehrkraft arbeitet am Laptop**, Schüler:innen am iPad (Safari 15+).
9. **Eltern** bekommen keine eigene Ansicht; „Entwicklung drucken“ bleibt für Gespräche.
10. **Kein PDF/Word-Import** in der ersten Version.

---

## 1. Ziel

Eine Übungsplattform für Deutsch (Sek I, KGS Niedersachsen, **Haupt-, Real- und Gymnasialzweig**).
Die Lehrkraft erstellt Aufgaben, bündelt sie zu Paketen und weist sie Klassen oder einzelnen Schüler:innen zu.
Schüler:innen üben am iPad über einen persönlichen Link und bekommen sofort Rückmeldung.
Aus den Antworten entsteht ein **Lernstand je Schüler:in und Kompetenz** (nach Kerncurriculum), gezeigt als Entwicklung.

**Nutzer:innen der ersten Version**
- **Eine Lehrkraft** (Konto mit E-Mail/Passwort). Mehrere Lehrkräfte und Teilen: später, aber das Datenmodell
  hat von Anfang an eine `owner`-Spalte.
- **Schüler:innen** Jg. 5–10, ohne Konto.

**Was der Neustart besser machen soll** (aus der Übergabe)
- Erst planen, dann bauen: didaktische Regeln und Design **einmal** festlegen.
- Abweichungen vom Auftrag früh entscheiden (hier: öffentliches Repo, automatische Stufen – beide bestätigt).
- Neue Aufgabenformate mit weniger Aufwand in der Datenbank ergänzen.

---

## 2. Bausteine (Capability Map)

Die Website besteht aus mehreren Teilen, die man einzeln bauen und testen kann. Jeder Teil bekommt später
eine eigene, kurze Spec (`SPEC-<kennung>.md`). Kennungen bleiben fest.

| Kennung | Was es leistet | Baut auf |
|---|---|---|
| `grundgeruest` | Projekt, Veröffentlichung, Datenbank-Anbindung, Test der Zugriffsregeln, Versionsprüfung | – |
| `klassen` | Lehrkraft-Login, Klassen mit KC (HS/RS/Gym), Pseudonyme, Links + QR-Liste, Löschen, Ergebnisse zurücksetzen | grundgeruest |
| `kompetenzen` | Kompetenzraster aus CSV (154), Kurznamen, Ausblenden; Import der alten Kurznamen | grundgeruest |
| `aufgaben` | 6 Formate + Erklärseite, Editor (Format-Kacheln, Live-Vorschau), Prüfung auf dem Server, Liste mit Filter/Sortierung | kompetenzen |
| `pakete` | Pakete mit Tags (Jahrgang, Zweig), Reihenfolge, Zuweisung an Klasse/Schüler:in, Schülervorschau | aufgaben, klassen |
| `ueben` | Schüleransicht: Meine Übungen, Aufgabe bearbeiten, Rückmeldung, Lösung nach 2 Versuchen, Offline-Warteschlange, Sterne-Stufen | pakete |
| `lernstand` | Berechnung, Heatmap, Einzelansicht, Druck, Einstellungen; Schüler: Lernweg | ueben |
| `garten` | Eigener Garten jeder Schülerin/jedes Schülers: Samen durch Üben verdienen, selbst in Beete pflanzen, Pflanzen wachsen nach und nach; Sammelbuch | ueben, lernstand, design |
| `design` | Neues Design der Schüleransicht nach den Referenzbildern (siehe 3a); Lehrkraft-Ansicht „ruhig“ | – (läuft parallel, wird vor `ueben` festgelegt) |
| `uebernahme` | Aufgaben, Pakete und Kurznamen aus der alten Datenbank ins neue Projekt holen | aufgaben, pakete, kompetenzen |

**Bau-Reihenfolge:** grundgeruest → klassen, kompetenzen → aufgaben → pakete → (design festgelegt) → ueben →
lernstand → garten → uebernahme

---

## 3. Funktionen der ersten Version (Abnahmekriterien)

### Lehrkraft
- Anmelden mit E-Mail/Passwort.
- Klasse anlegen mit KC (HS, RS oder Gym), Pseudonyme automatisch („Fuchs-07“) oder aus eigener Liste.
- Linkliste mit QR-Codes drucken.
- Aufgabe in einem der Formate anlegen: **Lückentext, Auswahl, Fehler finden, Zuordnen, Reihenfolge, Sätze verbessern,
  Erklärseite** – mit Schwierigkeit (1–3 Sterne) und Kompetenzen; Live-Vorschau wie bei Schüler:innen.
- Aufgaben filtern (Titel, Jahrgang, Bereich, Kompetenz) und sortieren (Titel, Format, Stufe).
- Paket anlegen, Aufgaben anordnen, Tags setzen, einer Klasse oder einzelnen Schüler:innen zuweisen.
- Stufe je Schüler:in festlegen (hat Vorrang vor der Automatik).
- Lernstand der Klasse (Heatmap) und je Schüler:in (`--` bis `++` mit Symbol, Verlauf) ansehen und drucken.
- Ergebnisse zurücksetzen, Schüler:innen und Klassen löschen.

### Schüler:innen
- Link öffnen → Startseite mit **eigenem Garten**, ohne Anmeldung.
- Zugewiesene Pakete sehen; nur Aufgaben der eigenen Sterne-Stufe (Automatik: 80 % im ersten Versuch, mind. 5 Aufgaben,
  je Themenbereich, nur Aufstieg).
- Aufgabe abgeben → Rückmeldung je Lücke/Platz (✓ grün, ↻ Pfirsich, nie rot).
- Lösung erst nach 2 Versuchen ansehbar; danach zählen Versuche nicht mehr für den Lernstand.
- Ohne Internet: Antwort wird gespeichert und später geprüft, nie doppelt gezählt.
- Mein Lernweg: nur Entwicklung (deutlich besser / besser / dranbleiben / erste Ergebnisse), nie Punkte, Stufen, Noten.
- Hilfe-Seite (Texte aus einer Markdown-Datei).

### Garten (ersetzt die Blumenwiese)
- Jede:r hat einen kleinen Garten (Blick von oben, Beete, Zaun, Wege – wie `refrences/garten 2.jpg` und `garten 3.jpg`).
  Am Anfang: wenige leere Beete.
- **Samen verdienen** (entschieden 9. November 2026): **1 Samen je abgeschlossenem Paket** und **1 Samen, wenn sich
  eine Kompetenz verbessert** („besser“ oder „deutlich besser“). Nicht je einzelne Aufgabe. Das rechnet der **Server**
  (fälschungssicher).
- Samen sieht man **nur als Bild** (z. B. Samentüten im Korb), **nie als Zahl**.
- Man wählt selbst eine Pflanze aus den eigenen Samen und tippt auf ein freies Beet → sie wird gepflanzt.
- **Wachsen durch Üben** (entschieden): Jede erledigte Aufgabe „gießt“ alle wachsenden Pflanzen einmal.
  Gepflanztes wächst in Stufen (Samen → Spross → Pflanze → Blüte/Ernte); je Stufe sind einige Güsse nötig
  (Vorschlag: 3, von der Lehrkraft einstellbar). Erklärseiten gießen nicht.
- **Umfang zum Start** (entschieden): **12 Pflanzen + 6 Deko-Dinge**. Neue Sorten und Deko werden nach und nach
  freigeschaltet (z. B. je Kompetenzbereich).
- **Umsetzen und Entfernen** erlaubt (entschieden). Entferntes geht zurück in den Korb, nichts geht verloren.
- Der Garten **welkt nie**. Neue Beete oder Deko (Bank, Kiste, Gießkanne …) kommen nach und nach dazu.
- **Sammelbuch:** eigene Seite mit allen Pflanzen und Dingen. Schon Gefundenes ist bunt mit Namen,
  Fehlendes als „?“-Platzhalter (wie `refrences/0ca7bfba….jpg`).
- Kein Bezug zu Noten oder Stufen. Der Garten zeigt Fleiß, keinen Lernstand.
- Bedienbar ohne Ziehen (antippen reicht). Ziehen darf zusätzlich gehen.
- „Ergebnisse zurücksetzen“ durch die Lehrkraft setzt auch den Garten zurück (wie bisher die Wiese).

### Nicht in der ersten Version
Mehrere Lehrkräfte, Aufgabenbibliothek, PDF/Word-Import, Elternansicht, automatisches Löschen, CSV-Import über die Oberfläche.

---

## 3a. Design der Schüleransicht (Richtung aus den Referenzbildern)

Der Pixel-Look entfällt. Neue Richtung: **gemütlich, handgezeichnet, warm**.
- **Farben:** Creme- und Beigetöne als Kartenfläche, sanftes Wiesengrün, Holzbraun als Kontur, warme Akzente
  (Orange, Gelb). Fehler weiter in Pfirsich, nie Rot.
- **Karten:** cremefarben mit weicher, dunkelbrauner Kontur und großen Rundungen (wie Papier/Holzrahmen).
- **Knöpfe:** runde „Holzknöpfe“ mit hellem Symbol für Navigation; breite Pillenknöpfe für Hauptaktionen
  („Prüfen“, „Weiter“).
- **Menü:** Leiste unten mit Symbol + Wort (Start/Garten, Meine Übungen, Mein Lernweg, Sammelbuch, Hilfe)
  wie in `refrences/Neon Underpass.jpeg`.
- **Zeichnungen:** Pflanzen, Beete, Dinge – **keine Gesichter**. Einzige Ausnahme: das Maskottchen (3b).
- Weiterhin: Text nie direkt auf dem Hintergrund, Kontrast ≥ 4,5:1, Tippflächen ≥ 48 px, Bedeutung nie nur über Farbe.
- **Urheberrecht:** Die Referenzbilder sind fremde Werke (z. B. Freepik-Wasserzeichen, Canva-Vorlage). Sie dienen nur als
  Stimmung. Alle Grafiken für Satzgarten werden **neu gezeichnet** (eigene SVGs); die Referenzbilder kommen **nicht ins Repo**.
- Die genaue Gestaltung wird im Baustein `design` mit Entwürfen festgelegt und von der Lehrkraft freigegeben.

## 3b. Maskottchen (Wunsch der Lehrkraft, 9. November 2026)

Ein kleiner **Gartengeist** begleitet die Schüler:innen. Stil wie `refrences/maskottchen.jpg`: rund, weich,
durchscheinend oder erdig, mit Blüte oder Kleeblatt auf dem Kopf, einfaches freundliches Gesicht (Punktaugen,
kleiner Mund), keine Arme voller Details.
- **Eigene Figur, neu gezeichnet** – die Referenz (Künstlerin „ellie vs BEAR“) ist nur Stimmung, nichts wird kopiert.
- **Nur in der Schüleransicht.** Spricht in einer Sprechblase (Text auf Karte, wie alle Texte), Ansprache „du“,
  einfache Sprache.
- **Aufgaben:**
  - begrüßt auf der Startseite und nennt den nächsten Schritt,
  - erklärt beim ersten Mal jedes Aufgabenformat kurz, wie es geht (danach über einen Knopf wieder abrufbar),
  - sagt den Tipp der Lehrkraft (Feld „Tipp“ der Aufgabe), wenn man ihn antippt,
  - begleitet Erklärseiten und die Rückmeldung („Fast! Schau dir die Lücken mit ↻ nochmal an.“),
  - erklärt Garten und Sammelbuch beim ersten Besuch.
- **Regeln:** sagt nie „falsch“, nennt nie Punkte, Prozente oder Stufen, verrät nie Lösungen.
  Bedeutung steht immer im Text, nicht nur im Gesichtsausdruck. Das Maskottchen ist `aria-hidden`, die Sprechblase nicht.
- **Ausdrücke:** wenige feste Bilder (z. B. freundlich, nachdenklich, freut sich, zeigt auf etwas) als SVG;
  keine Animation nötig (höchstens sanft, abschaltbar über „Bewegung reduzieren“).
- **Texte** (Formaterklärungen, Begrüßungen, Rückmeldesätze) liegen in einer Markdown-Datei wie die Hilfe und sind
  ohne Programmieren änderbar.
- Gehört zu den Bausteinen `design` (Zeichnung) und `ueben` (Sprechblasen).

## 4. Technik

| Teil | Wahl |
|---|---|
| Oberfläche | Vite 8, React 19, TypeScript 7, statisch gebaut, Ziel Safari 15 |
| Bibliotheken | `@supabase/supabase-js`, `@dnd-kit/*` (Ziehen am iPad), `qrcode` – keine weiteren ohne Rückfrage |
| Datenbank | Supabase, kostenloser Tarif, Frankfurt (`eu-central-1`), RLS überall an |
| Hosting | GitHub Pages, Veröffentlichung per GitHub Actions bei Push auf `main` |
| Schriften | nur lokal (kein CDN) |
| Werkzeuge | Vitest, oxlint, Supabase CLI v2 (Anmeldung per Token, Befehle aus Claudes Shell) |

## 5. Befehle

```
Entwickeln:   npm run dev
Bauen:        npm run build          (tsc -b && vite build)
Prüfen:       npm run lint           (oxlint)
Tests:        npm test               (vitest run)
DB-Tests:     npm run test:datenbank (Erfolg = „ALLE TESTS BESTANDEN“)
DB ändern:    neue Datei in supabase/migrations/, dann npm run db:push
```

## 6. Ordner

```
src/lehrkraft/   Seiten der Lehrkraft (Anmeldung, direkte Tabellenzugriffe über RLS)
src/schueler/    Seiten der Schüler:innen (nur Datenbankfunktionen mit Token)
src/gemeinsam/   Aufgaben-Darstellung für Schüleransicht und Vorschau
src/lib/         Logik ohne Oberfläche (Parser, Filter, Pseudonyme, Router) + *.test.ts daneben
src/design/      Tokens, Bausteine, Schriften, Icons
supabase/migrations/  Datenbank nur über Migrationen
supabase/tests/       Test der Zugriffsregeln (SQL) + Netzwerktest
docs/            Specs, Kompetenz-CSV (KC-PDFs nur lokal)
```

## 7. Code-Stil

Wie im alten Projekt: Namen und Kommentare auf Deutsch, kleine Funktionen in `src/lib/` mit Test daneben.

```ts
// Prüft, ob eine Antwort zu einer der erlaubten Lösungen passt (Leerzeichen am Rand zählen nicht).
export function passt(antwort: string, loesungen: string[]): boolean {
  const a = antwort.trim();
  return loesungen.some((l) => l.trim() === a);
}
```

Oberfläche: Lehrkraft „Sie“, Schüler:innen „du“, einfache Sprache, Fließtext ≥ 17 px, Tippflächen ≥ 48 px,
Kontrast ≥ 4,5:1, Bedeutung nie nur über Farbe.

## 8. Tests

- **Logik** (`npm test`): Parser jeder Schreibweise, Pseudonyme, Filter, Sortierung, Lernstand-Regeln.
- **Zugriffsregeln** (`npm run test:datenbank`) **ab der ersten Migration**: anon, Lehrkraft A, Lehrkraft B, Schüler-Token.
  Muss u. a. zeigen: Schüler:innen bekommen nie Lösungen, nie absolute Stände, nie fremde Daten.
  Die Ausgabe soll kurz genug sein, dass sie nicht abgeschnitten wird.
- **Netzwerktest** ohne Anmeldung (`supabase/tests/netzwerk.test.ts`).
- **iPad-Test durch die Lehrkraft** am Ende jeder Etappe.

## 9. Grenzen

**Immer**
- Nach jeder Etappe stoppen und testen lassen.
- Nach jeder Migration den DB-Test laufen lassen und erweitern.
- Neue Formate: Prüfung, Ausgabe ohne Lösung und Lösung anzeigen auf dem Server ergänzen + Test.
- `DATENSCHUTZ.md` und Hilfe-Texte anpassen, wenn sich gespeicherte Daten oder Verhalten ändern.

**Vorher fragen**
- Didaktische Regeln (Rückmeldung, Stufen, Lernstand, was Schüler:innen sehen).
- Änderungen am Datenmodell, neue Bibliotheken, andere Anbieter.
- Design-Entscheidungen.

**Nie**
- Klarnamen, Tracking, Werbung, externe Schriften/CDNs.
- `service_role`-Schlüssel oder DB-Passwort ins Repo; KC-PDFs ins Repo.
- Absolute Lernstände für Schüler:innen (abgesichert in der Datenbank).
- Kompetenzen erfinden.
- Einsatz mit echten Klassen, bevor der Datenschutz geklärt ist.
- Zahlen zur Belohnung (Samen, Münzen, Punkte) in der Schüleransicht; Gesichter/Figuren in Grafiken (außer dem Maskottchen).
- Referenzbilder ins Repo oder Grafiken daraus kopieren.

## 10. Erfolgskriterien (Version 1 ist fertig, wenn …)

1. Die Lehrkraft legt eine Klasse an, druckt die Linkliste, erstellt je Format eine Aufgabe, bündelt sie in einem
   Paket und weist es zu – ohne Hilfe von Claude.
2. Eine Schülerin öffnet den Link am iPad, bearbeitet alle Formate (auch Ziehen bei Reihenfolge), sieht Rückmeldung
   und ihren Lernweg.
3. Mit WLAN aus abgegebene Antworten kommen nach dem Wiederverbinden genau einmal an.
4. `npm test` und `npm run test:datenbank` bestehen; der DB-Test belegt: keine Lösungen und keine absoluten Stände
   für Schüler-Token.
5. Die Aufgaben, Pakete und Kurznamen aus der alten App sind übernommen.
6. Die Schüleransicht entspricht dem neuen Design, das die Lehrkraft freigegeben hat.
7. Eine Schülerin verdient durch Üben Samen, pflanzt sie selbst ein, sieht sie wachsen und findet sie im Sammelbuch –
   ohne dass irgendwo eine Zahl erscheint. Der DB-Test belegt: Samen lassen sich nicht über das Netzwerk „erschummeln“.
8. Das Maskottchen erklärt jedes Format beim ersten Öffnen und zeigt auf Wunsch den Tipp – ohne Lösungen zu verraten.

---

## 11. Offene Fragen

**Projekt:** Name **Satzgarten** (entschieden 9. November 2026). Vorschlag: Repo `stift-und-papier/satzgarten`,
Adresse `https://stift-und-papier.github.io/satzgarten/`.

**Kann während des Baus geklärt werden**
1. Wie viele Güsse je Wachstumsstufe (Vorschlag 3)? Wodurch genau wird Neues freigeschaltet?
2. Maskottchen: Name? Eine Figur für alle, oder dürfen Schüler:innen eine aus 3–4 Varianten wählen?
3. Wie viel Lernstand-Statistik brauchen Sie wirklich (Heatmap, Verlauf, Trend)?
4. Aufgaben weiter per Schreibweise (`[Lösung]`) – oder zusätzlich Formulare zum Anklicken?
5. Läuft die alte App parallel weiter, und wann wird ihre Datenbank gelöscht?
6. Backups der Datenbank: ja/nein, wer stellt wieder her?

**Mit Schulleitung/DSB (vor dem Einsatz mit echten Klassen)**
7. Supabase/GitHub (US-Firmen, Server Frankfurt) zulässig? Auftragsverarbeitungsvertrag – wer schließt ihn ab?
8. Verzeichnis von Verarbeitungstätigkeiten, Datenschutz-Folgenabschätzung nötig?
9. Reichen Pseudonyme mit Zuordnungsliste auf Papier?
10. Speicherdauer und Löschung am Schuljahresende; Informationsblatt für Schüler:innen und Eltern.
