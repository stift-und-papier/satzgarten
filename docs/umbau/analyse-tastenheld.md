# Analyse TastenHeld (Schritt 2, nur gelesen)

Quelle: `C:\Users\jrkug\Projekte\TastenHeld-main.zip`, zum Lesen entpackt in den Scratchpad (nicht ins Repo).
Online: https://github.com/ChalkJunkie/TastenHeld. Nichts im Browser gestartet, nichts getestet.

## 1. Stack und Struktur

- Reines HTML, CSS und JavaScript (ES-Module), **kein** Framework, keine Bibliotheken, kein Build. Rund 3 400 Zeilen JS/CSS.
- Für Desktop/Laptop mit Tastatur ab 1366 × 768 gebaut (Chrome, Edge, Firefox). Kein iPad, kein Safari getestet.
- Ordner:
  - `js/engine.js` (277 Zeilen): Inhalte ziehen, Tastendruck bewerten, Statistik (`Tracker`), Sterne.
  - `js/input.js` (151): ein zentraler `keydown`/`keyup`-Listener am Fenster.
  - `js/modes/*.js`: Spielmodi `monster`, `rain`, `race`, `keyhunt`, `story`, dazu `textline.js` (Zeile zum Abtippen).
  - `js/screens/*.js`: Start, Weltkarte, Level-Intro, Spiel, Ergebnis.
  - `js/progress.js`: Spielstand in `localStorage` und als Datei zum Speichern/Laden.
  - `js/keyboard.js`, `hands.js`, `layout.js`: Bildschirmtastatur mit Fingern (10-Finger-Tippen).
  - `data/*.json`: Level, Wortlisten, Geschichte. `tools/pixelart.py`: erzeugt alle Pixelbilder per Programm.
- **Spielschleife** (`screens/game.js`): `requestAnimationFrame`, jeder Modus hat `start()`, `tick(dt)`, `onKey(ev)`,
  `destroy()`. `dt` ist auf 0,1 s begrenzt (kein Sprung nach Tab-Wechsel). Pause gibt die Tastatur wieder frei.

## 2. Eingabe (Tastaturereignisse)

- `input.js` hört am ganzen Fenster auf `keydown`, **ohne Eingabefeld**. Es wandelt jedes Ereignis in ein einheitliches Objekt
  (`char`, `shift`, `caps`, `altGr`, `repeat`, `dead`) und verhindert Browser-Kürzel (Leertaste scrollt nicht usw.).
- Behandelt Windows-Besonderheiten: AltGr (falsches Strg vorweg), Totasten (`^`, `´`) werden **nicht** zusammengesetzt,
  gedrückt gehaltene Tasten zählen nur einmal.
- `engine.js → checkInput`: richtig nur, wenn das Zeichen **genau** stimmt. Feststelltaste oder Umschalt in Kleinbuchstaben-Leveln
  gibt nur einen Hinweis, keinen Fehler.
- **Unterschied zu Wortsalat:** Wortsalat liest Diktate über ein echtes Eingabefeld (`Eingabe.tsx`, Autokorrektur aus) und
  wertet den eingegebenen Text aus. Das ist am iPad mit fester Tastatur sicherer: Safari setzt Totasten und Umlaute selbst zusammen,
  und die Bildschirmtastatur bleibt zu. Den Fenster-Listener von TastenHeld am iPad nutzen hieße: neu testen, wie Safari dort
  `^`, `ß`, Umlaute und Groß/klein meldet.

## 3. „Herz-Schuss“ (in TastenHeld: Zauberstern im Modus `monster`)

- Ein Wuschelmonster (`monster.png`, 40 × 40, **ein** Bild, keine Animation) läuft langsam auf die Figur Tipp zu.
- Jedes fertig getippte Element (Wort oder Satz) schießt einen **Stern** zum Monster (`spell(1)`): Bild fliegt per CSS in 350 ms,
  dann wird das Monster zurückgeschubst (`push 0.2`) und wackelt (`is-hit`).
- In Sätzen gibt jedes fertige **Wort** einen kleinen Stern (`spell(0.5)`, halbe Wirkung).
- Falsches Zeichen: Cursor bleibt stehen und wackelt, das Monster wird kurz schneller (`errorBoost 0.25`, höchstens 1,8-fach,
  beruhigt sich in etwa 5 s).
- Erreicht das Monster die Figur: **kein** Spielende. Es erschrickt, hüpft zurück, Hinweis „Ganz ruhig weitertippen!“.
- Ende: alle Elemente getippt → Monster bekommt ein lächelndes Bild (`monster-freund.png`), Text „Das Monster ist jetzt dein Freund.“
- Parameter in `levels.json`: `monsterSpeed` 0,02 bis 0,025 (Anteil der Strecke je Sekunde), `push` 0,2, `errorBoost` 0,25, `maxBoost` 1,8.
- **Für Wortsalat:** Die Idee „Treffer schiebt das Monster“ passt, aber unser Plan ist anders: Treffer = Herz pro richtiger Runde,
  kein Monster, das näher kommt, kein Zeitdruck. Übernehmen lohnt sich: der fliegende Schuss (Bild + CSS-Variable `--dx`),
  die Treffer-Animation per Klasse neu setzen (`anim()`), das Freund-Bild am Ende.

## 4. Diktatmodus

TastenHeld hat **keinen** eigenen Diktatmodus. Am nächsten kommen:

- **`race`** (Rennen): alle Wörter/Sätze werden zu **einem** Text mit Leerzeichen. Die Zeile läuft als Laufschrift
  (`textline.js`, `ticker: true`, aktuelles Zeichen bei einem Drittel der Breite, wie heute schon im Wortsalat-Abschreiben).
  Richtiges Zeichen → Auto fährt ein Stück. Falsches Zeichen → Zeichen wackelt, Auto stottert, Cursor wartet. Nie zurück.
- **`monster`** im Satz-Modus: Text wird in Elementen gezeigt, „Danach: …“ zeigt das nächste.
- **Was zählt als richtig:** jedes einzelne Zeichen, das genau stimmt (inkl. Leerzeichen und Satzzeichen).
- **Fehler:** pro Zeichenposition höchstens **ein** Fehler, egal wie oft danebengetippt wird (`Tracker.miss`).
  Genauigkeit = beim ersten Versuch richtig ÷ alle versuchten Positionen. Sterne ab 85 / 93 / 98 %.
  Pausen über 3 s zählen nicht fürs Tempo.
- **Wie viele Eingaben ergeben ein Herz?** In TastenHeld: ein kleiner Stern je Wort, ein großer je Element. Eine Regel
  „ein Herz je N richtige Zeichen“ gibt es nicht. Die Zahl N legen wir im Konzept (Schritt 3) fest.
- **Für Wortsalat:** `Tracker` (ein Fehler je Position, Genauigkeit) ist genau die Zählweise für „befreundet ab 95 %“.
  Wortsalat rechnet heute im Diktat anders (Abstand zwischen Texten, `diktat_abstand` in SQL). Das muss im Konzept entschieden werden,
  weil die Münzen auf dem Server berechnet werden.

## 5. Fallende Wörter (Modus `rain`)

- Buchstaben/Wörter fallen als Tropfen in 5 Spuren. **Ziel ist immer der unterste Tropfen**; nur er nimmt Eingaben an.
- Wort ganz getippt → Tropfen platzt (Funken), zählt als geschafft. Mit `confirmSpace` muss man zusätzlich die Leertaste drücken.
- Tropfen landet: **kein Fehler**. Er kommt **einmal** wieder (`MAX_RETRIES = 1`), der Regen wird 15 % langsamer (bis 50 %).
  Drei geschaffte in Folge → wieder 5 % schneller (bis Normaltempo). Ergebnis: geschafft / verpasst.
- Parameter (`levels.json`): `fallSpeed` 0,045 bis 0,055 (Anteil der Höhe je Sekunde, also etwa 18 bis 22 s bis zum Boden),
  `maxOnScreen` 1 oder 2, `spawnGap` 1,0 bis 2,5 s, `confirmSpace` ja/nein.
- **Modus ohne Zeitdruck** gibt es nicht. Möglich wäre: Wort fällt nur bis kurz über den Boden und wartet dort, oder `fallSpeed`
  sehr klein. Entscheidung im Konzept.

## 6. Wiese, Sounds, Unnötiges

- **Wiese:** `assets/pixel/welten/wiese.png`, 444 × 160 Pixel, wird dreifach vergrößert. Himmel mit Wolken und Sonne, Hügel,
  Windmühle rechts, Blumenwiese unten. Im Spiel liegt das Weltbild hinter dem Spielfeld (`.scene__ground` ist ausgeblendet).
  Selbst erzeugt mit `tools/pixelart.py` (keine Fremd-Grafik).
- **Sounds:** TastenHeld hat **keine** Töne.
- **Nicht gebraucht:** Weltkarte, Level, Story, Tastenkunde (`keyhunt`), Bildschirmtastatur mit Händen, XP/Farbthemen,
  Knackpunkte, Spielstand als Datei/`localStorage`, Validator, AltGr-Sonderbehandlung (iPad), Steampunk-Bedienelemente (`ui/*.png`),
  Schriften Jersey 15 und Atkinson Hyperlegible (Wortsalat hat Fraunces, Nunito, OpenDyslexic). Highscores oder Konten gibt es nicht.

## 7. Lizenz

- Die ZIP enthält **keine** Lizenzdatei (kein `LICENSE`). Ohne Lizenz gilt rechtlich: alle Rechte beim Urheber.
- In `CLAUDE.md` und `src/grafik/LIZENZ.md` steht: „Der Urheber hat erlaubt, Ideen, Code und Grafiken zu nutzen.“
  Das ist die Grundlage. Offene Frage: Liegt diese Erlaubnis schriftlich vor (Mail, Nachricht)? Dann im `CREDITS.md` darauf verweisen.
- Die Pixelbilder sind laut README selbst gezeichnet bzw. per Skript erzeugt, keine Grafiken Dritter.
- Schriften: Jersey 15 und Atkinson Hyperlegible unter SIL Open Font License (Lizenztexte liegen bei). Brauchen wir nicht.
- Pflicht laut Arbeitsplan: Beim ersten übernommenen Code oder Bild `CREDITS.md` anlegen und den Code mit Herkunft kennzeichnen.

## 8. Empfehlung: übernehmen oder neu bauen?

**Variante A: TastenHeld-Code direkt übernehmen und anpassen**
- Pro: Spielmodi laufen schon, erprobte Zahlen (Tempo, Rückstoß), weniger Ausdenken.
- Contra: Anderer Aufbau (DOM direkt, eigene Bildschirme) passt nicht zu React. Fenster-Tastatur statt Eingabefeld ist am iPad
  ungetestet (Totasten, Umlaute). Viel Unnötiges müsste herausgeschnitten werden. Punkte werden im Browser gerechnet,
  bei uns rechnet der Server.

**Variante B: Mechanik in Wortsalat neu umsetzen, kleine Teile mit Herkunft übernehmen (Empfehlung)**
- Neu in React/TypeScript gebaut, mit Wortsalats Eingabefeld, Pixel-Look und Server-Wertung.
- Als TypeScript übernommen und mit „Herkunft: TastenHeld“ gekennzeichnet: Zählweise `Tracker` (ein Fehler je Position,
  Genauigkeit), Fall-Logik aus `rain` (unterster Tropfen ist Ziel, Wiederholung, langsamer nach Verpassen), fliegender Schuss
  und Treffer-Animation aus `monster`, Spielschleife mit `dt`-Begrenzung. Die Laufschrift hat Wortsalat schon.
- Pro: passt zum iPad, zum Server und zum Editor; nur das, was wir brauchen.
- Contra: etwas mehr eigene Arbeit; die Zahlen für Tempo usw. müssen am iPad neu ausprobiert werden.
