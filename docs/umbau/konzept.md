# Konzept Übungsumbau (Schritt 3, Entwurf zur Freigabe)

Stand 2026-11-13. Grundlage: Abschnitt B im Arbeitsplan, Entscheidungen in `STATUS.md`, Analysen aus Schritt 1 und 2.
Alles, was mit **[E n]** markiert ist, steht unten in der Entscheidungsliste (mit Vorschlag).

## 1. Grundidee in einem Satz

Eine **Übung** ist weiterhin eine Zeile in `aufgaben` (ein Format, Sterne, Kompetenzen wie bisher), enthält aber jetzt eine
**Liste von Runden**. Gespielt wird in einem **Durchgang** (einmal pro Kalendertag), jede Runde wird einzeln auf dem Server geprüft,
am Ende schreibt der Server **einen** Eintrag in `versuche`. So laufen Lernstand, Sterne-Aufstieg und KC-Zuordnung fast unverändert weiter.

## 2. Datenmodell Paket → Übung → Runde

**Paket** (`pakete`, unverändert): Titel, Tags Jahrgänge/Zweige, Übungen mit Reihenfolge (`paket_aufgaben`), Zuweisung an Klasse oder Schüler:in.

**Übung** (`aufgaben`, erweitert):

| Feld | neu? | Inhalt |
|---|---|---|
| `typ` | erweitert | wie bisher (`lueckentext`, `auswahl`, `zuordnen`, `fehler`, `reihenfolge`, `ueberarbeiten`, `diktat`, `erklaerung`) plus **`fallende_woerter`** |
| `titel`, `anweisung`, `hinweis`, `stufe` (Sterne), `farbig` | | unverändert |
| Kompetenzen (`aufgabe_kompetenzen`) | | unverändert → KC-Zuordnung bleibt |
| `loesung` | Format neu | `{ "runden": [ R1, R2, … ] }`, jede Runde im **bisherigen** Format des Typs (z. B. ein Lückensatz) |
| `inhalt` | Format neu | erzeugt weiter **nur der Trigger**, je Runde ohne Lösung |
| `monster` | neu | Schlüssel des gewählten Monsters, z. B. `ruebchen`, `schleim_blau`, `gespenst` |
| `runden_je_durchgang` | neu | wie viele Runden ein Durchgang zieht (leer = alle) → Pool [E 6] |
| `spiel` | neu (jsonb) | Einstellungen je Typ: Diktat (Zeichen je Herz), Fallende Wörter (Tempo, gleichzeitig) |
| `archiviert` | neu | ja/nein, siehe Abschnitt 3 |

**Runde**: ein Eintrag in `loesung.runden`. Bei `diktat` (Merkdiktat) = ein Teil, bei `fallende_woerter` = ein Wort,
bei Abschreiben-Diktat gibt es **keine Runden**: der ganze Text ist eine Einheit, Herzen kommen aus dem Tippen (Abschnitt 6).

**Durchgang** (neue Tabelle `durchgaenge`): Schüler:in, Übung, Paket, Tag (Berlin), gezogene Runden (Nummern),
Ergebnis je Runde (richtig ja/nein, Antworten), fertig am, Anteil richtig, befreundet ja/nein, `frei_ab` (Datum, ab dem der nächste
Durchgang erlaubt ist). Nach dem Ende wird daraus ein `versuch` (für Lernstand und Münzen).

**Befreundet** ist eine Übung, sobald **ein** Durchgang ganz richtig war (Diktat: ≥ 95 %). Das bleibt so, auch wenn später ein
schlechterer Durchgang kommt.

**Leseschrift je Schüler:in** (Entscheidung aus Schritt 1): neue Spalte `schueler.leseschrift` (ja/nein, setzt die Lehrkraft);
ist sie an, startet die App mit OpenDyslexic, die Schüler:in kann am Gerät trotzdem umschalten.

## 3. Archivierung

- Neue Spalte `archiviert` in `aufgaben` und `pakete`. Eine Migration setzt sie für **alle** bisherigen Pakete und alle bisherigen
  Aufgaben **außer den 71 Erklärseiten**. Gelöscht wird nichts; Versuche, Münzen, Lernstände bleiben.
- Ausgeblendet wird an **allen** Stellen: `schueler_start`/`sichtbare_aufgaben` (Server), Paketliste, Aufgabenliste, Auswahl im Paket,
  Zuweisen, Klassenseite (Lehrkraft). Die zwei alten Zuweisungen bleiben in der Datenbank, zeigen aber nichts mehr an.
- Schüler:innen ohne Übungen sehen: „Hier kommen bald neue Übungen.“
- Archivierte kann man später wieder sichtbar machen (nur per Migration, kein Knopf) [E 2].
- **Erklärungen:** eigener Menüpunkt „Erklärungen“ für alle Schüler:innen. Liste aller Erklärseiten, geordnet nach Doppeljahrgang
  (aus den Tags der alten Pakete, in denen sie stecken) und darin nach Bereich (Wortarten, Rechtschreibung …). Lesen gibt wie bisher
  einmalig 5 Münzen. Neue Pakete dürfen eine Erklärseite enthalten (steht dann ohne Monster vor den Übungen) [E 3].

## 4. Versuchslogik

- **Ein Durchgang pro Übung und Kalendertag** (Europe/Berlin, Tag vom Server, wie heute bei den Münzen).
- Ein angefangener Durchgang kann **jederzeit** weitergespielt werden (auch am nächsten Tag), bis alle Runden fertig sind.
  Erst wenn er fertig ist, beginnt die Wartezeit bis zum nächsten Kalendertag [E 4].
- Ist die Übung befreundet, kann man sie trotzdem am nächsten Tag wieder spielen (Üben schadet nicht), Münzen nur nach Abschnitt 5.
- **„Versuch früher freigeben“** (Lehrkraft, Klassenseite und Lernstand-Seite der Schüler:in): setzt `frei_ab` auf heute. Löscht nichts.
  Wirkt für eine Schüler:in oder die ganze Klasse, für eine Übung oder alle [E 5].
- „Ergebnisse zurücksetzen“ bleibt wie es ist (löscht Versuche und Münzen).
- **Eine Runde = ein „Prüfen“.** Danach ist die Runde fest, es gibt kein „Nochmal prüfen“ und kein „Lösung ansehen“ mehr. Der Server
  schickt **nach** dem Prüfen die richtige Lösung **dieser** Runde mit, das bisherige Format zeigt sie an (Haken bzw. richtige Form).
- **Ohne Internet** kann eine Runde nicht geprüft werden (die Lösung liegt nur auf dem Server). Dann: freundlicher Hinweis und
  Knopf „Nochmal senden“; die Eingabe bleibt stehen. Die bisherige Warteliste entfällt für Übungen [E 10].

## 5. Münzmodell (Vorschlag mit Beträgen) [E 1]

Heute: je Aufgabe ★ 10 / ★★ 15 / ★★★ 20. Eine Übung ist größer (mehrere Runden), darum:

| | ★ | ★★ | ★★★ |
|---|---|---|---|
| **Grundbetrag** für eine ganz richtige Übung | 20 | 30 | 40 |
| **Teilmünzen** | Grundbetrag × Anteil richtiger Runden, auf ganze Münzen abgerundet (z. B. ★★, 4 von 6 → 20) | | |
| **Freundschaft** (Übung ganz richtig, einmalig je Übung) | +10 | +15 | +20 |

- **Wiederholen nur bei Verbesserung:** Es gibt nur die **Differenz** zum bisher besten Durchgang dieser Übung.
  Beispiel ★★: Tag 1 4 von 6 → 20 Münzen. Tag 2 6 von 6 → 30 − 20 = 10 Münzen + 15 Freundschaft. Tag 3 wieder 6 von 6 → 0.
  So lässt sich die Farm nicht durch Wiederholen füllen.
- **Diktat** (Abschreiben und Merkdiktat): gleiche Tabelle, Anteil = Genauigkeit (Abschnitt 6). Freundschaft ab 95 %.
  **Zusatzmünzen 100 %:** erreicht man 100 % in einem **Wiederholungsversuch**, gibt es einmalig +10 (★), +15 (★★), +20 (★★★).
- **Fallende Wörter:** gleiche Tabelle, Anteil = Wörter richtig beim ersten Fallen.
- Erklärseiten: unverändert einmalig 5 Münzen. Münzen rechnet nur der Server.
- Rückmeldung am Ende: „+25 Münzen für dich!“ wie heute; bei 0 Münzen: „Für diese Übung gibt es heute keine neuen Münzen. Schaffst du alle Runden, bekommst du noch welche.“ (nur wenn noch Münzen möglich sind).

## 6. Diktat

> **Geändert von Jazz in Schritt 6 (2026-11-13):** Diktate zählen immer als Übung und haben **keine Runden** (im Editor kein Reiter).
> Abschreiben: **ein Herz je 10 richtige Zeichen** (statt „ein Herz je Wort“ unten). Merkdiktat: ein Herz je richtig abgeschicktem Teil.

**Abschreiben (weiterlaufender Text)**
- Text läuft wie heute als Laufband, der Cursor wartet auf das richtige Zeichen (wie TastenHeld „race“).
- **Ein Herz je fertig getipptem Wort** [E 7]: Wort ohne Fehler → Herz trifft; Wort mit mindestens einem Fehler → Herz verfehlt,
  Einstein schaut geschockt. Satzzeichen gehören zum Wort davor.
- **Genauigkeit wie TastenHeld:** je Zeichenstelle höchstens ein Fehler. Genauigkeit = Stellen beim ersten Tippen richtig ÷ alle
  Stellen (Leerzeichen zählen mit). **Befreundet ab 95 %.**
- Da der Cursor wartet, ist der Endtext immer richtig. Die App schickt dem Server die Fehlerstellen, der Server rechnet Genauigkeit und
  Münzen. (Eine Schüler:in könnte das theoretisch fälschen; bei Münzen für eine Farm vertretbar.)

**Merkdiktat**
- Jeder Teil ist eine Runde: Text wird gezeigt, verschwindet nach „Gemerkt“ oder **Leertaste**, dann tippen, dann „Prüfen“.
- Teil ganz richtig → Herz trifft; mit Fehler → verfehlt. Danach wird der richtige Teil mit markierten Fehlerwörtern gezeigt (wie heute).
  Kein zweites Tippen desselben Teils mehr.
- Für Freundschaft und Münzen zählt die **Genauigkeit über alle Zeichen** (wie bisher `diktat_abstand`), ab 95 % befreundet.
  So kann ein Merkdiktat mit einem kleinen Fehler trotzdem befreundet sein [E 8].

## 7. Fallende Wörter

- Die Lehrkraft gibt eine Wortliste ein (ein Wort pro Zeile; mehrere Wörter in einer Zeile = eine Wortgruppe). Jedes Wort = eine Runde.
- Wörter fallen über der Wiese, das unterste ist das Ziel (wie TastenHeld). Getippt wird in ein Eingabefeld ohne Autokorrektur;
  der Cursor wartet auf das richtige Zeichen.
- **Treffer:** Wort ganz und **ohne Fehltaste** getippt, bevor es landet → Herz trifft, Wort platzt.
- **Fehlschuss:** Fehltaste im Wort (Wort kann trotzdem fertig getippt werden) oder Wort landet → Herz verfehlt, Einstein geschockt.
  Ein gelandetes Wort kommt **einmal** wieder, der Regen wird etwas langsamer (wie TastenHeld); es zählt aber nicht mehr als richtig.
- **Einstellungen (setzt die Lehrkraft je Übung)** [E 9]: Tempo langsam / mittel / schnell (≈ 25 / 18 / 12 s bis zum Boden),
  gleichzeitig 1 oder 2 Wörter. Schüler:innen stellen nichts ein.
- **Modus ohne Zeitdruck:** zurückgestellt (Entscheidung Schritt 2).

## 8. Wiederholungs-Pool [E 6]

- Hat eine Übung mehr Runden als `runden_je_durchgang`, zieht der Server je Durchgang zufällig, **bevorzugt Runden, die die Schüler:in
  noch nicht hatte oder falsch hatte**. Die App bekommt nur die gezogenen Runden.
- Vorschlag: Standard **6 Runden je Durchgang**; im Editor ein Hinweis „Für Abwechslung beim Wiederholen: mehr Runden eintragen.“
- Diktat (Abschreiben) und Merkdiktat haben keinen Pool (immer der ganze Text).

## 9. Lernstand

- Je fertigem Durchgang **ein** Eintrag in `versuche` mit `anteil_richtig` = Anteil richtiger Runden (Diktat: Genauigkeit).
- `gewertete_versuche` nimmt schon heute je Aufgabe und Tag den **ersten** Versuch: passt ohne Änderung. Punkte = Anteil × Sterne-Punkte.
- **Sterne-Aufstieg** (heute: 80 % im ersten Versuch bei mindestens 5 Aufgaben je Bereich und Stufe): weil eine Übung jetzt etwa
  6 alte Aufgaben ersetzt, Vorschlag **mindestens 2 Übungen** je Bereich und Stufe, 80 % bleibt [E 11].
- Lernweg der Schüler:innen und Lernstand-Seiten der Lehrkraft bleiben, wie sie sind. Kein Herzzähler irgendwo.

## 10. Ablauf der Bildschirme

1. **Start** (wie heute): Einstein, „Dein nächster Schritt“ = nächste offene Übung, Farm.
2. **Übungen**: zugewiesene Pakete. Leer: „Hier kommen bald neue Übungen.“
3. **Paket**: Liste der Übungen, je Zeile Monster-Bild (klein, still), Titel, Sterne; befreundete mit Herz; heute schon gespielt:
   „Morgen wieder“ (mit Monster ohne Herz). Kein Zähler.
4. **Übung = Spiel**: oben die **Spielszene** (Wiese, Einstein links, Monster rechts, ca. 180–220 px hoch), darunter die **Runde**
   im bisherigen Format mit „Prüfen“. Nach dem Prüfen: Herz fliegt (Treffer oder daneben), Lösung erscheint, Knopf „Weiter“.
   Oben klein „Runde 3 von 6“ (das ist kein Herzzähler) [E 12].
5. **Abschluss**: Befreundet → Monster mit Herz über dem Kopf, Einstein freut sich, Münzen. Nicht befreundet → Einstein:
   „Das Monster braucht noch etwas Zeit, um Freundschaft zu schließen. Morgen kannst du es noch einmal versuchen!“ und Münzen.

**Hintergrund der Spielszene:** `assets/orig.png` (576 × 324, Wiese mit Wolken und Hügeln), Quelle
https://free-game-assets.itch.io/nature-landscapes-free-pixel-art (frei verfügbar). Nur dieses Einzelbild kommt später nach
`src/grafik/` mit Eintrag in `LIZENZ.md`. Für die flache Szene wird ein Ausschnitt (unterer Teil mit Hügeln und Gras) ganzzahlig vergrößert.
   Knopf „Zur nächsten Übung“ / „Zurück zum Paket“.

Die Spielszene muss bei 1024 × 768 und 1180 × 820 so klein bleiben, dass die Runde ohne Scrollen passt; Texte zum Lesen und Tippen
bleiben in der normalen Schrift (Nunito oder OpenDyslexic), nicht im Bild.

## 11. Einstein und Monster

- **Einstein**: normal (blinzelt) → bei Treffer kurz **schießend** (≈ 0,5 s, Herz fliegt) → normal. Bei Fehlschuss **geschockt**
  („huch“, Bild 4) und bleibt geschockt, bis das nächste Herz trifft. Am Ende: befreundet → freut sich; sonst erklärt.
- **Monster**: läuft auf der Stelle in seiner Ruhe-Animation (Idle). Treffer → kurz wackeln (bei Schleimen die Hurt-Animation),
  kein Sterben, kein Lebensbalken. Daneben → Herz fliegt vorbei, Monster hüpft kurz. Befreundet → `herz.png` schwebt über dem Kopf.
- Bewegung aus bei „Bewegung reduzieren“: dann Standbilder, Herz erscheint ohne Flug.
- Monster-Auswahl im Editor: Liste mit Vorschaubild (Rübchen, Schleim blau/grün/lila, Gespenst, Spinne in 3 Farben, Maus, Fledermaus).
  Vorschlag ist das Rübchen [E 13].

## 12. Migrationsplan (je Schritt eine Migration, danach `npm run db:push` und `npm run test:datenbank`)

| Schritt | Migration | Inhalt |
|---|---|---|
| 4 | `archiv` | `archiviert` in `aufgaben` und `pakete`, alte setzen (außer Erklärseiten), alle Schüler- und Listen-Abfragen filtern; `erklaerungen_liste` für den neuen Menüpunkt |
| 5 | `uebungen_runden` | neue Spalten (`monster`, `runden_je_durchgang`, `spiel`), Typ `fallende_woerter`, Trigger für `runden`, Tabelle `durchgaenge`, Funktionen `uebung_starten`, `runde_pruefen`, `uebung_beenden`, `versuch_freigeben`, Münzen nach Abschnitt 5, `schueler.leseschrift` |
| 10 | `diktat_runden` | Abschreiben mit Fehlerstellen und Genauigkeit, Merkdiktat als Runden |
| 11 | `fallende_woerter` | Prüfung und Einstellungen für Fallende Wörter |

Die alten Funktionen (`antwort_abgeben`, `loesung_anzeigen`) bleiben bestehen, damit nichts Altes kaputtgeht; die App ruft sie für
neue Übungen nicht mehr auf.

## 13. Teststrategie

- **Datenbank-Test** (`npm run test:datenbank`), je Migration erweitert: Archiviertes erscheint nirgends; Erklärseiten bleiben erreichbar;
  Schüler-Funktionen geben **keine** Lösung heraus, außer der einen Runde **nach** dem Prüfen; eine Runde lässt sich nicht zweimal prüfen;
  zweiter Durchgang am selben Tag abgelehnt, nach Freigabe erlaubt; Münzen: Teilmünzen, Freundschaft einmalig, nur Verbesserung,
  Diktat 95 % und 100 %-Zusatz; Lernstand zählt einen Versuch je Durchgang.
- **Vitest**: Runden im Editor zerlegen/zusammensetzen, Diktat-Genauigkeit (ein Fehler je Stelle), Herz je Wort, Fall-Logik.
- **Browser** bei 1024 × 768 und 1180 × 820: Durchgang von Anfang bis Ende je Format, Leseschrift an, Bewegung reduzieren.
- **iPad mit Tastatur**: nur Jazz (Checkliste Abschnitt D), ich schreibe dazu „nicht getestet“.

## 14. Entscheidungen für Jazz (jeweils mit Vorschlag)

1. **Münzen:** Grundbetrag ★ 20 / ★★ 30 / ★★★ 40 × Anteil richtig; Freundschaft +10 / +15 / +20 einmalig; beim Wiederholen nur die
   Differenz zum besten Durchgang; Diktat-100 %-Zusatz im Wiederholungsversuch +10 / +15 / +20.
2. **Archiv zurückholen** nur per Migration (kein Knopf in der Oberfläche).
3. **Erklärungen**: eigener Menüpunkt, geordnet nach Doppeljahrgang und Bereich; neue Pakete dürfen zusätzlich eine Erklärseite enthalten.
4. **Angefangene Übung** kann man jederzeit fertig spielen; der nächste Durchgang ist erst ab dem Kalendertag nach dem Ende erlaubt.
5. **Früher freigeben** geht für eine Schüler:in oder die ganze Klasse, für eine Übung oder alle Übungen.
6. **Pool:** Standard 6 Runden je Durchgang; bei mehr Runden zieht der Server, bevorzugt neue und früher falsche.
7. **Abschreiben:** ein Herz je fertigem Wort (trifft nur, wenn das Wort ohne Fehler war).
8. **Merkdiktat:** Herz je Teil (nur ganz richtig trifft); befreundet ab 95 % Genauigkeit über alle Zeichen.
9. **Fallende Wörter:** Lehrkraft stellt Tempo (langsam/mittel/schnell) und gleichzeitig (1/2) ein; Fehltaste oder Landen = Fehlschuss;
   gelandetes Wort kommt einmal wieder, zählt aber nicht mehr als richtig.
10. **Ohne Internet** kein Prüfen, sondern „Nochmal senden“; die Warteliste entfällt für Übungen.
11. **Sterne-Aufstieg:** 80 % im ersten Durchgang bei mindestens **2 Übungen** je Bereich und Stufe (statt 5 Aufgaben).
12. **„Runde 3 von 6“** wird angezeigt (Fortschritt, kein Herzzähler).
13. **Standard-Monster** im Editor: Rübchen; die Lehrkraft kann aus allen 10 wählen.
14. **Abschluss-Satz** bei nicht befreundet: „Das Monster braucht noch etwas Zeit, um Freundschaft zu schließen. Morgen kannst du es noch einmal versuchen!“

**Freigegeben** von Jazz am 2026-11-13: alle Vorschläge, Punkt 14 mit dem Satz von Jazz, Hintergrund `assets/orig.png`.
