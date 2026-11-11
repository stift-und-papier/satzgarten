# Spec: Wortsalat (Neustart, bisher „Satzgarten“)

Stand: 11. November 2026 · Status: **freigegeben von der Lehrkraft am 11. November 2026**
Grundlage: `docs/uebergabe-wortsalat.md` (Bestand, Assets, Entscheidungen), Antworten der Lehrkraft vom 11. November 2026.
Die alte Satzgarten-Spec steht im Git-Verlauf (Commit `bb6e9e6`).

„**Entschieden**“ = von der Lehrkraft festgelegt. „**Vorschlag**“ = von Claude, noch zu bestätigen.

---

## 0. Annahmen und Grundentscheidungen

**Entschieden (11. November 2026)**
1. **Umbenennen statt neu anlegen:** Das bestehende Projekt wird zu „wortsalat“ (GitHub-Repo, Adresse
   `https://stift-und-papier.github.io/wortsalat/`, Ordner, Texte). Verlauf und Datenbank bleiben.
2. **Reihenfolge:** erst die Lernplattform (Klassen, Aufgaben, Üben, Lernstand), danach das Farm-Spiel.
3. **Lehrkraft-Ansicht** bleibt ruhig und sachlich. Die **Schüleransicht** wird Pixel-Art (Sprout Lands).
4. **Formate:** alle 7 bisherigen (Lückentext, Auswahl, Fehler finden, Zuordnen, Reihenfolge, Sätze verbessern,
   Erklärseite) **plus Diktat**.
5. **Alle drei Zweige** (HS, RS, Gym).
6. **Geräte:** Schüler:innen am iPad (Safari 15+) mit **fester QWERTZ-Tastatur**; Lehrkraft am Laptop.
7. **Rechtschreibkorrektur** ist in allen Eingabefeldern aus.
8. **Maskottchen** heißt **Einstein** (Pixel-Figur nach eigener Vorlage).
9. **Erlaubt:** Pixel-Look, Figuren (Spielfigur, Tiere), **Münzen als Zahlen**.
10. **Grafiken:** gekaufte Sprout-Lands-Pakete und TastenHeld (Erlaubnis für Ideen, Code, Grafiken).
    Ins Repo kommen nur benutzte Einzelbilder mit Lizenzhinweis; `assets/` bleibt lokal.

**Übernommen aus Satzgarten / Übungswiese (bewährt, unverändert gültig)**
- Technik: Vite + React + TypeScript, GitHub Pages (öffentliches Repo), Supabase Frankfurt, RLS überall.
- Schülerzugang per Link-Token (192 Bit) hinter `#`, kein Konto, nur Pseudonyme.
- Prüfung der Antworten auf dem Server; Lösungen in eigener Spalte `loesung`.
- Lernstand-Verfahren (letzte 10 Versuche, Grenzen 35/55/70/85, ab 4 Versuchen) als einstellbarer Startpunkt.
- Kompetenzbereiche Rechtschreibung, Grammatik, Textüberarbeitung; Kompetenzen nur aus `docs/kompetenzen.csv`.
- Lösung erst nach 2 Versuchen; danach zählt nichts mehr für den Lernstand.
- Schüler:innen sehen **nie absolute Lernstände** (keine Punkte, Prozente, Noten für das Lernen).
- Eine Lehrkraft zum Start (Datenmodell mit `owner` für später mehrere).

---

## 1. Ziel

Wortsalat ist eine Übungsplattform für Deutsch in der Sek I (KGS Niedersachsen). Die Lehrkraft erstellt Aufgaben,
bündelt sie zu Paketen und weist sie zu. Schüler:innen üben am iPad über ihren Link und bekommen sofort Rückmeldung.
Daraus entsteht ein Lernstand je Kompetenz, den die Lehrkraft als Entwicklung sieht.

Zur Motivation hat jede:r Schüler:in eine **eigene Farm**: Für gelöste Aufgaben gibt es Münzen, damit kauft man Samen,
Tiere und Dinge. Üben „gießt“ die Pflanzen.

---

## 2. Bausteine (Capability Map) – freigegeben

Jeder Baustein wird einzeln beschrieben (eigene kurze Spec `docs/SPEC-<kennung>.md`), gebaut und am iPad getestet.
Die Kennungen bleiben fest.

| Kennung | Was es leistet | Baut auf |
|---|---|---|
| `umbenennen` | Repo, Adresse, Ordner, Texte, `CLAUDE.md` auf „Wortsalat“; Albert → Einstein; Satzgarten-Entwurfsseiten entfernen | – |
| `design` | Pixel-Stil der Schüleransicht (Sprout Lands): Knöpfe, Fenster, Schrift **mit Umlauten**, Einstein als Spritesheet, Grafik-Ordner mit Lizenz; Lehrkraft-Thema ruhig | umbenennen |
| `klassen` | Lehrkraft-Login (vorhanden), Klassen mit KC, Pseudonyme, Linkliste mit QR-Codes, Löschen | umbenennen |
| `kompetenzen` | 154 Kompetenzen aus der CSV, Kurznamen, Ausblenden | klassen |
| `aufgaben` | 7 Formate, Editor mit Vorschau, Prüfung auf dem Server, Liste mit Filter | kompetenzen |
| `diktat` | 8. Format: Lehrkraft fügt Text ein; Modus **Abschreiben** und Modus **Merkdiktat** („gemerkt“) | aufgaben |
| `pakete` | Pakete, Reihenfolge, Tags, Zuweisung, Schülervorschau | aufgaben, klassen |
| `ueben` | Schüleransicht: Meine Übungen, Aufgabe bearbeiten, Rückmeldung, offline, Sterne-Stufen, Einstein, Hilfe | pakete, design |
| `lernstand` | Berechnung, Heatmap, Einzelansicht, Druck, Einstellungen; Schüler: Lernweg | ueben |
| `muenzen` | Münzen für gelöste Aufgaben, fälschungssicher auf dem Server (Ereignisliste, jeder Grund nur einmal) | ueben |
| `shop` | Mit Münzen Samen, Tiere und Dinge kaufen | muenzen, design |
| `felder` | Samen auf Feldern pflanzen, Wachsen durch Üben („Gießen“), Ernten | shop |
| `tiere` | Tiere halten und mit Geerntetem füttern; beim Füttern Sprechblase mit Herz | felder |
| `spielfigur` | Frei bewegliche Spielfigur auf der Farm | felder |
| `uebernahme` | Aufgaben, Pakete, Kurznamen aus der alten Übungswiese holen | aufgaben, pakete, kompetenzen |

**Bau-Reihenfolge:** umbenennen → design, klassen → kompetenzen → aufgaben → diktat → pakete → ueben → lernstand →
muenzen → shop → felder → tiere, spielfigur → uebernahme

`diktat` kommt direkt nach den anderen Formaten, damit es denselben Editor und dieselbe Prüfung nutzt.
`design` läuft früh, weil Geschmack das größte Umbau-Risiko ist (Erfahrung aus zwei Neustarts).

---

## 3. Funktionen der ersten Version (Abnahmekriterien)

### Lehrkraft (wie in Satzgarten geplant)
- Anmelden mit E-Mail/Passwort (Konto legt die Lehrkraft im Supabase-Dashboard an).
- Klasse mit KC (HS, RS, Gym) anlegen; Pseudonyme automatisch („Fuchs-07“) oder aus eigener Liste; Linkliste mit QR drucken.
- Aufgaben in allen 8 Formaten anlegen, mit Schwierigkeit (1–3 Sterne), Kompetenzen und Live-Vorschau.
- Aufgaben filtern und sortieren; Pakete anlegen, ordnen, taggen, zuweisen.
- Lernstand der Klasse (Heatmap) und je Schüler:in ansehen und drucken.
- Ergebnisse zurücksetzen (setzt auch Münzen und Farm zurück), Schüler:innen und Klassen löschen.

### Diktat (neu)
- Die Lehrkraft **fügt einen Text ein**.
- **Abschreiben:** Der Text steht da, Schüler:innen tippen ihn ab (Vorbild: TastenHeld, Modus „Rennen“).
- **Merkdiktat:** Es erscheint immer ein (Teil-)Satz. Nach „gemerkt“ verschwindet er und wird aus dem Gedächtnis eingetippt.
- Rechtschreibkorrektur, Wortvorschläge und automatische Großschreibung sind aus.
- Einzelheiten (Rückmeldung bei Tippfehlern, Teilung in Sätze, Bewertung) klärt `docs/SPEC-diktat.md` (offene Fragen 3–6).

### Schüler:innen
- Link öffnen → Startseite mit der eigenen Farm, ohne Anmeldung.
- Zugewiesene Pakete sehen (nur Aufgaben der eigenen Sterne-Stufe), Aufgaben abgeben, Rückmeldung je Lücke (✓ / ↻, nie rot).
- Lösung erst nach 2 Versuchen. Ohne Internet: Antwort wird gespeichert und später genau einmal geprüft.
- Mein Lernweg: nur Entwicklung (deutlich besser / besser / dranbleiben / erste Ergebnisse).
- Einstein begrüßt, erklärt jedes Format beim ersten Mal, sagt den Tipp der Lehrkraft. Er sagt nie „falsch“ und verrät nie Lösungen.

### Farm (ersetzt den Garten) – Wünsche der Lehrkraft im Wortlaut
- **Münzen:** „Für gelöste Aufgaben erhalten Schüler:innen Münzen.“ Münzen dürfen als Zahl erscheinen.
- **Shop:** „Mit Münzen kaufen sie Tiere, Pflanzen und weitere Dinge für ihre Farm.“
- **Spielfigur:** „Eine kleine Spielfigur ist frei beweglich.“
- **Pflanzen und Ernte:** „Samen werden auf Feldern eingepflanzt und später geerntet.“
- **Tiere:** „Mit geernteten Produkten werden Tiere gefüttert.“ Beim Füttern erscheint über dem Tier eine
  **Sprechblase mit Herz** (keine Fress-Animation).
- **Gießen:** „Übungen dienen als ‚Gießen‘: Wer übt, hilft den gepflanzten Samen beim Wachsen.“
- Münzen, Wachstum und Besitz rechnet der **Server** (nicht über das Netzwerk zu erschummeln).
- Alles auch per Antippen bzw. Tastatur bedienbar; Bewegung aus bei „Bewegung reduzieren“.
- Regeln zu Preisen, Wachstumsdauer, Folgen von Nicht-Üben usw.: offene Fragen 1–2 und 7–10, festgelegt in den
  Specs von `muenzen`, `shop`, `felder`, `tiere`, `spielfigur`.

### Monster-Kampf (neu, Lehrkraft 2026-11-11) – Wünsche im Wortlaut bzw. sinngemäß
- „Das Monster erscheint über der Aufgabe und kämpft gegen die Figur der Schüler“ (die Spielfigur, Katzen-Bauer aus Sprout Lands).
- Gekämpft wird beim Bearbeiten **zugewiesener Aufgabenpakete**. **Jede richtige Aufgabe trifft** das Monster,
  bei falscher Eingabe **verfehlt** man es (nie rot, nie bestrafend).
- **Münzen** hängen wie gehabt vom Erfolg beim Erledigen der Aufgabe ab (Kampf ändert daran nichts).
- Monster: niedlich (Sprout-Rübchen, Schleime) und für **schwerere Stufen** auch Orks (craftpix).
- Keine Blut- oder Todes-Animation (ruhig, Jg. 5); Bewegung aus bei „Bewegung reduzieren“. Offene Fragen 17–22.

### Buch (Sammlung)
- Ein Buch zeigt, was man schon freigeschaltet hat (Grafiken: Humble Gift – Paper UI). Was genau hineinkommt: offene Frage 21.

### Nicht in der ersten Version
Mehrere Lehrkräfte, Aufgabenbibliothek, PDF/Word-Import, Elternansicht, automatisches Löschen, CSV-Import über die Oberfläche.

---

## 4. Design

- **Schüleransicht:** Pixel-Art aus Sprout Lands (16-px-Raster, ganzzahlig vergrößert, ohne Weichzeichnen).
  Knöpfe, Fenster und Symbole aus dem UI-Paket. Texte in einer gut lesbaren Schrift **mit Umlauten und ß**
  (die Sprout-Lands-Schriften haben keine).
- **Lehrkraft-Ansicht:** ruhig und sachlich (vorhandenes Thema `lehrkraft.css`).
- **Bleibt gültig:** Kontrast ≥ 4,5:1, Tippflächen ≥ 48 px, Fließtext ≥ 17 px, Bedeutung nie nur über Farbe,
  Fehler nie rot (Pfirsich), Leseschrift für LRS, dunkler Modus, „Bewegung reduzieren“.
- **Fachbegriff-Farben** (Wortarten, Satzglieder, Zeitformen) bleiben (`scripts/fachbegriff-farben.mjs`).
- **Fällt weg:** handgezeichnete SVG-Gartengrafiken, Albert als SVG, Regel „keine Figuren außer Maskottchen“.
- **Namensnennung** in der App (z. B. Hilfe-Seite): „Assets – From: Sprout Lands – By: Cup Nooble“; TastenHeld nach Wunsch der Programmiererin.

---

## 5. Technik

| Teil | Wahl |
|---|---|
| Oberfläche | Vite 8, React 19, TypeScript 7, statisch, Ziel Safari 15, Pfad-Basis `/wortsalat/` |
| Bibliotheken | supabase-js, @dnd-kit, qrcode. **Vorschlag:** Farm und Spielfigur ohne Spiel-Bibliothek (React + CSS/Canvas); neue Bibliothek nur nach Rückfrage |
| Datenbank | Supabase (bestehendes Projekt, kostenlos, Frankfurt), RLS überall, Änderungen nur als Migration |
| Hosting | GitHub Pages, Veröffentlichung per GitHub Actions bei Push auf `main` |
| Grafiken | benutzte Einzelbilder in `src/grafik/` mit `LIZENZ.md`; Pakete nur lokal in `assets/` (ignoriert) |

## 6. Befehle

```
Entwickeln:   npm run dev
Bauen:        npm run build          (tsc -b && vite build)
Prüfen:       npm run lint           (oxlint)
Tests:        npm test               (vitest run)
DB-Tests:     npm run test:datenbank (Erfolg = „ALLE TESTS BESTANDEN“)
DB ändern:    neue Datei in supabase/migrations/, dann npm run db:push
Design:       node ~/.claude/skills/hallmark/scripts/sloplint.mjs src --genre playful --scope app
```

## 7. Ordner

```
src/lehrkraft/   Seiten der Lehrkraft
src/schueler/    Seiten der Schüler:innen (nur Datenbankfunktionen mit Token)
src/farm/        Farm, Shop, Tiere, Spielfigur (Schüleransicht)
src/gemeinsam/   Aufgaben-Darstellung für Schüleransicht und Vorschau, Einstein
src/lib/         Logik ohne Oberfläche + *.test.ts daneben
src/design/      Tokens, Bausteine, Schriften
src/grafik/      benutzte Pixel-Grafiken + LIZENZ.md
supabase/        Migrationen und Tests
docs/            Specs (SPEC.md + SPEC-<kennung>.md), Übergaben, Kompetenz-CSV
```

## 8. Code-Stil

Namen und Kommentare auf Deutsch, kleine Funktionen in `src/lib/` mit Test daneben.

```ts
// Prüft, ob eine Antwort zu einer der erlaubten Lösungen passt (Leerzeichen am Rand zählen nicht).
export function passt(antwort: string, loesungen: string[]): boolean {
  const a = antwort.trim()
  return loesungen.some((l) => l.trim() === a)
}
```

Oberfläche: Lehrkraft „Sie“, Schüler:innen „du“, einfache Sprache.

## 9. Tests

- **Logik** (`npm test`): Parser, Pseudonyme, Filter, Lernstand-Regeln, Diktat-Vergleich, Münz- und Wachstumsregeln.
- **Zugriffsregeln** (`npm run test:datenbank`) nach jeder Migration: anon, Lehrkraft A/B, Schüler-Token.
  Muss zeigen: keine Lösungen, keine absoluten Lernstände für Schüler-Token; Münzen, Käufe und Wachstum
  nicht über das Netzwerk fälschbar; doppelte Abgabe bringt keine doppelten Münzen.
- **iPad-Test** durch die Lehrkraft am Ende jedes Bausteins (mit fester Tastatur).

## 10. Grenzen

**Immer**
- Nach jedem Baustein stoppen und testen lassen; Entscheidungen in `CLAUDE.md` protokollieren.
- Nach jeder Migration den DB-Test laufen lassen und erweitern.
- Lizenzhinweise für jede übernommene Grafik bzw. jeden übernommenen Code (Sprout Lands, TastenHeld).

**Vorher fragen**
- Didaktische Regeln, Spielregeln (Preise, Wachstum, Folgen), Design, Datenmodell, neue Bibliotheken.

**Nie**
- Klarnamen, Tracking, Werbung, externe Schriften/CDNs.
- Geheimnisse ins Repo; `assets/`, KC-PDFs, Referenzbilder, Referenz-Texte ins Repo.
- Absolute Lernstände für Schüler:innen; Ranglisten.
- Kompetenzen erfinden.
- Einsatz mit echten Klassen vor der Datenschutz-Freigabe durch Schulleitung/DSB.

## 11. Erfolgskriterien (Version 1 ist fertig, wenn …)

1. Die Seite läuft unter `…/wortsalat/`; nirgends steht mehr „Satzgarten“ oder „Albert“.
2. Die Lehrkraft legt eine Klasse an, druckt die Linkliste, erstellt je Format (auch Diktat) eine Aufgabe, bündelt
   sie und weist sie zu – ohne Hilfe von Claude.
3. Eine Schülerin bearbeitet am iPad mit Tastatur alle Formate; beim Diktat korrigiert das iPad nichts automatisch.
4. Offline abgegebene Antworten kommen genau einmal an.
5. Sie verdient Münzen, kauft im Shop, pflanzt, sieht durch Üben Wachstum, erntet, füttert ein Tier (Herz-Sprechblase)
   und bewegt die Spielfigur. Der DB-Test belegt: nichts davon lässt sich über das Netzwerk erschummeln.
6. Nirgends sieht sie einen absoluten Lernstand (Punkte, Prozente, Noten); Münzen sind die einzige Zahl.
7. `npm test` und `npm run test:datenbank` bestehen.
8. Aufgaben, Pakete und Kurznamen der Übungswiese sind übernommen.

---

## 12. Offene Fragen

**Klären wir in der Spec des jeweiligen Bausteins** (blockieren die Freigabe dieser Gesamt-Spec nicht)
1. `muenzen`: Wie viele Münzen bringt welche Aufgabe? Wie verhindern wir, dass Tempo oder Raten belohnt wird
   (z. B. nur erster Versuch, jede Aufgabe einmal, nichts nach „Lösung ansehen“)?
2. `muenzen`: Bringen Erklärseiten und Diktate Münzen?
3. `diktat`: Wartet der Cursor bei einem falschen Zeichen (wie TastenHeld) oder kommt die Rückmeldung am Satzende?
4. `diktat`: Wer teilt den Text für das Merkdiktat in (Teil-)Sätze? Darf man den Satz nochmal ansehen?
5. `diktat`: Was zählt als Fehler (Großschreibung, Satzzeichen, Leerzeichen)?
6. `diktat`: Zählt das Diktat für den Lernstand, und zu welchen Kompetenzen?
7. `shop`: Preise; was es zu kaufen gibt; wird nach und nach mehr freigeschaltet?
8. `felder`: Wie viele Übungen bis zur Ernte? Wächst etwas auch ohne Üben? Was passiert ohne Üben (Ferien, Krankheit)?
9. `tiere`: Was bringt Füttern sonst noch (Eier, Milch …)? Was passiert ohne Füttern?
10. `spielfigur`: Steuerung – Antippen eines Ziels, Pfeiltasten der Tastatur oder beides?
11. ~~`design`: Welche Textschrift?~~ Entschieden 2026-11-11: keine Pixel-Schrift (Fraunces + Nunito).
12. `lernstand`: Hängt das Wachstum nur vom Üben ab (Fleiß) oder auch vom Lernfortschritt?

**Monster-Kampf** (Spec `docs/SPEC-monster.md`)
17. Greift das Monster die Figur auch an? Hat die Figur Herzen, die sie verlieren kann – oder passiert ihr nie etwas?
18. Wann ist ein Monster besiegt: nach allen Aufgaben des Pakets oder nach einer festen Zahl Treffer?
    Was passiert, wenn das Paket fertig ist, das Monster aber noch nicht besiegt (geht weg, bleibt bis zum nächsten Mal)?
19. **Regel-Konflikt:** Sichtbare Treffer je Paket (z. B. 7 von 10) wirken wie Punkte. Schüler:innen dürfen aber keine
    absoluten Lernstände sehen. Wie zeigen wir den Kampf, ohne dass daraus eine Punktzahl wird?
20. Was heißt „schwerere Stufe“: die Sterne-Stufe der Schülerin/des Schülers oder eine Stufe, die die Lehrkraft je Paket einstellt?
21. Zählt ein Treffer auch beim zweiten Versuch? Und nach „Lösung ansehen“?
22. Kommen besiegte Monster ins Buch? Was kommt sonst ins Buch (Pflanzen, Tiere, Monster, Pakete)?

**Mit Schulleitung/DSB (vor dem Einsatz mit echten Klassen)**
13. Supabase/GitHub (US-Firmen, Server Frankfurt) zulässig? Auftragsverarbeitungsvertrag?
14. Verzeichnis von Verarbeitungstätigkeiten, Datenschutz-Folgenabschätzung? Neue Spieldaten (Münzen, Farm) nötig und zulässig?
15. Speicherdauer und Löschung; Informationsblatt für Schüler:innen und Eltern.
16. Eltern: eigene Ansicht oder nur Ausdruck?
