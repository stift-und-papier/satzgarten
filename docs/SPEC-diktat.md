# SPEC Diktat (Baustein `diktat`, Aufgaben 20–22)

Stand: 11. November 2026. Antworten der Lehrkraft auf die offenen Fragen 3–6 der Spec (`docs/SPEC.md`, Abschnitt 12).

## 1. Was es ist

Achtes Aufgabenformat `diktat` mit zwei Modi, die die Lehrkraft je Aufgabe wählt:

- **Abschreiben:** Der ganze Text steht da, Schüler:innen tippen ihn ab (Vorbild: TastenHeld, Modus „Rennen“).
- **Merkdiktat:** Es erscheint immer ein (Teil-)Satz. Nach „gemerkt“ verschwindet er und wird aus dem Gedächtnis getippt.

Die Lehrkraft fügt den Text im Editor ein (Kachel „Diktat“). Vorschau, Stufe, Kompetenzen, Tipp und Rückmeldung wie bei allen
Formaten. Eingabe immer über `src/gemeinsam/Eingabe.tsx` (keine Autokorrektur, keine Großschreibung, keine Vorschläge).

## 2. Entscheidungen der Lehrkraft

| Frage | Entscheidung |
|---|---|
| 3 Tippfehler | **Abschreiben:** Der Cursor wartet auf das richtige Zeichen (wie TastenHeld); je Zeichen zählt höchstens **ein** Fehler. **Merkdiktat:** freies Tippen (auch Löschen), Rückmeldung erst am Satzende – Warten würde die Schreibweise verraten. |
| 4 Teilung | **Die Lehrkraft bestimmt die Trennstellen** (geändert 11.11.): mit `\|` im Text oder per Klick zwischen zwei Wörter in der Ansicht unter dem Textfeld. Hilfe: Knopf „Nach jedem Satz trennen“ setzt `\|` nach . ? ! (nicht nach Abkürzungen wie „z. B.“). Ohne Trennstelle ist der Text ein Teil. Das `\|` sehen Schüler:innen nie. |
| 4 Nochmal ansehen | Ja, beliebig oft mit „Nochmal ansehen“. Dabei wird das bisher Getippte **gelöscht** (sonst könnte man abschreiben). |
| 5 Fehler | Es zählen **Buchstaben, Groß-/Kleinschreibung und Satzzeichen**. Nicht zählen: die Anzahl der Leerzeichen und Leerzeichen am Anfang/Ende. |
| Satz mit Fehlern (Merkdiktat) | Fehlerstellen werden markiert (Pfirsich, nie rot), der Satz erscheint **wieder zum Merken** und wird neu getippt. **Gewertet wird der erste Versuch** je Satz. |
| Geschafft | **Geschafft ab 90 % richtiger Zeichen** (`anteil >= 0.9`; Merkdiktat: erster Versuch je Satz). Schüler:innen sehen nie Prozente. Unter 100 % erscheint ein Hinweis: „Geschafft! Wenn du es noch genauer schaffst, bekommst du nochmal Münzen.“ **Fehlerfrei (100 %)** wird besonders belohnt: eigene Rückmeldung („Fehlerfrei – super!“, Einstein freut sich) und Extra-Münzen. Unter 90 %: „Nochmal üben“. |
| Münzen (für Phase 8, `docs/SPEC-muenzen.md`) | Münzen beim ersten Geschafft; **erneut Münzen, wenn man sich verbessert** (höherer Anteil als das bisher beste Ergebnis dieses Diktats); **Extra-Münzen für fehlerfrei** (nur einmal je Diktat). Höhe legt Aufgabe 34 fest. |
| 6 Lernstand | **Ja, mit Kompetenzen** wie die anderen Formate. Für den Lernstand zählt der Anteil richtiger Zeichen (`anteil`), nur intern. |

## 3. Vergleich (eine Funktion, gleich in TypeScript und SQL)

Vor dem Vergleich werden beide Texte **vereinheitlicht** (wie `normalisiere`, aber Groß-/Kleinschreibung bleibt):
- Unicode NFC; Leerraum zu einem Leerzeichen, vorn/hinten weg.
- **Typografische Zeichen gelten wie ihre Tastatur-Form** (TastenHeld verbietet sie deshalb ganz): „ “ ” » « → `"`,
  ‚ ‘ ’ › ‹ ´ ` → `'`, – — → `-`, … → `...`, geschütztes Leerzeichen → Leerzeichen.
  So muss niemand ein „ auf der iPad-Tastatur suchen.

**Abschreiben:** Zeichen für Zeichen; das erwartete Zeichen ist erst „erledigt“, wenn es richtig getippt ist.
Ein Fehler je Zeichenstelle. Leerzeichen: Ein zusätzliches Leerzeichen wird ignoriert (zählt nicht als Fehler).
Ergebnis: `fehler` (Anzahl Stellen mit Fehler), `anteil = 1 - fehler / Zeichen`, `richtig = anteil >= 0.9`, `fehlerfrei = fehler = 0`.

**Merkdiktat:** je Satz Vergleich des getippten Satzes mit dem Original (Wort-für-Wort-Abgleich, damit ein fehlendes
Wort nicht alles danach „falsch“ macht). Ergebnis je Satz: `richtig` und die Stellen (Wörter) mit Fehlern zum Markieren.
`anteil` = richtige Zeichen im ersten Versuch / alle Zeichen.

## 4. Daten und Sicherheit

- `aufgaben.loesung`: `{ "modus": "abschreiben" | "merken", "text": "<Eingabe der Lehrkraft mit |>", "saetze": ["…", "…"] }`.
- `aufgaben.inhalt` (Trigger): beim **Abschreiben** der ganze Text (er ist ohnehin sichtbar); beim **Merkdiktat** ebenfalls die Sätze,
  denn sie stehen vor „gemerkt“ auf dem Bildschirm. Eine Geheimhaltung wie bei den anderen Formaten ist hier nicht möglich
  (der Text ist die Lösung) – Regel „Lösungen nur in `loesung`“ gilt sinngemäß: `inhalt` enthält nur, was ohnehin gezeigt wird.
- Prüfung: `pruefe_diktat` auf dem Server (wie `pruefe_aufgabe`). Abschreiben schickt je Zeichenstelle „Fehler ja/nein“
  (das Warten passiert auf dem Gerät), Merkdiktat schickt den Text des ersten Versuchs je Satz.
  *shortcut: Beim Abschreiben vertraut der Server den gemeldeten Fehlern; erst mit Münzen (Phase 8) prüfen, ob das reicht.*

## 5. Bedienung (iPad mit fester QWERTZ-Tastatur)

- **Abschreiben:** Textzeile wie TastenHeld (erledigt = Tinte, aktuelles Zeichen umrandet, Rest blass); bei falschem Zeichen
  wackelt das aktuelle Zeichen kurz (aus bei „Bewegung reduzieren“) und es erscheint ↻ – kein Ton, nie rot. Lange Texte
  laufen zeilenweise mit. Eingabe über ein unsichtbares `Eingabe`-Feld (`input`-Ereignisse, damit Tottasten wie `^` `´` gehen).
- **Merkdiktat:** Satz → „gemerkt“ → leeres Eingabefeld → „Fertig“ (oder Enter) → Rückmeldung → nächster Satz.
  Anzeige „Satz 2 von 5“. „Nochmal ansehen“ löscht die Eingabe.
- Übernommen aus TastenHeld (mit Herkunft gekennzeichnet): Idee der Textzeile (`textline.js`), Regel „ein Fehler je Zeichen“
  (`race.js`), Liste der typografischen Zeichen (`validator.js`).

## 6. Tests

- `src/lib/diktat.test.ts`: Vereinheitlichen (typografische Zeichen, Leerzeichen), Satzteilung (. ? ! und |, Abkürzungen
  wie „z. B.“ nicht teilen), Vergleich Abschreiben und Merkdiktat.
- DB-Test: `inhalt` enthält nur den Text/die Sätze, `pruefe_diktat` bewertet wie die TypeScript-Fassung.
- iPad: falsch getipptes Wort bleibt falsch, Satzanfang bleibt klein, Anführungszeichen „ lässt sich als " tippen.

## 7. Nachtrag (Lehrkraft, 11. November 2026)

- Die Rückmeldung nennt die **Zahl der Fehler** („Du hast 2 Fehler gemacht.“), bei „Geschafft“ und bei „Nochmal üben“.
  Abschreiben: falsch getippte Zeichen; Merkdiktat: Wörter, die im ersten Versuch fehlten oder anders geschrieben waren.
- Beim **Merkdiktat** steht danach der **richtige Text**; die Wörter mit Fehlern sind markiert (Pfirsich, gepunktet, ↻).
