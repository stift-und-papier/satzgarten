# Spec: Monster-Kampf und Buch (`monster`, `buch`)

Antworten der Lehrkraft vom 11. November 2026 (offene Fragen 17–22 der `docs/SPEC.md`).

## Monster-Kampf

| Frage | Entscheidung |
|---|---|
| Wo? | Über der Aufgabe, nur in **zugewiesenen Paketen**. Das Monster steht der Spielfigur gegenüber (Katzen-Bauer, Sprout Lands). |
| Treffer | Jede **richtig gelöste Aufgabe** trifft, auch beim **zweiten Versuch**. Falsch = verfehlt. Nach **„Lösung ansehen“** gibt es keinen Treffer für diese Aufgabe. |
| Figur | Der Figur **passiert nie etwas** (keine Herzen, kein Verlieren). |
| Anzeige | Das Monster hat einen **Lebensbalken ohne Zahlen und Werte**. Er wird mit jeder richtigen Antwort kürzer. Keine Trefferzahl, keine Prozente. |
| Besiegt | Wenn **alle Aufgaben des Pakets richtig** erledigt sind. Ist das Paket mit falschen Antworten durch, kommt eine freundliche Meldung, es **nochmal zu versuchen**; das Monster bleibt stehen. |
| Schwere | Nach der **Sterne-Stufe**: ★ = Sprout-Wesen (z. B. Rübchen „chomp“), ★★ = Schleim, ★★★ = Ork. |
| Münzen | Unverändert nach Erfolg beim Erledigen der Aufgabe (Spec `muenzen`). Der Kampf bringt keine eigenen Münzen. |
| Ruhe | Keine Blut- oder Todes-Animation (besiegt = Monster verblasst/läuft weg). Keine Fehlerfarbe Rot. Bewegung aus bei „Bewegung reduzieren“. |
| Sicherheit | Treffer und „besiegt“ rechnet der **Server** aus den Versuchen; über das Netzwerk nicht zu erschummeln. |
| Buch | Besiegte Monster kommen **nicht** ins Buch. |

Hinweis: Der Lebensbalken zeigt nur den Fortschritt im **aktuellen Paket**, keinen Lernstand. Die Lehrkraft hat ihn ausdrücklich
ohne Zahlen gewünscht; das ist mit der Regel „keine Punkte, Prozente, Noten“ vereinbar.

## Buch

- Zeigt die **Pflanzen, Tiere und Dekorationsgegenstände**, die man schon freigeschaltet hat (Papier-Look, Humble Gift – Paper UI).
- Keine Monster, keine Zahlen außer Münzen (falls Preise gezeigt werden).
- Noch offen (klären bei Aufgabe 41c): Erscheinen noch nicht freigeschaltete Dinge als Platzhalter („?“)?

## Grafiken

| Paket | Herkunft | Lizenz |
|---|---|---|
| Sprout Lands | gekauft, Cup Nooble | Weitergabe des Pakets verboten, Namensnennung Pflicht |
| Humble Gift – Paper UI | Humble Pixel (itch.io) | Weitergabe verboten, Nennung freiwillig (@Humblepixel) |
| Orks, Schleime | craftpix.net (frei) | Lizenz-Seite craftpix.net/file-licenses – **vor Übernahme prüfen** |
| `chomp_idle.png`, `bubble emotes july update.png` | frei, itch.io | **Urheber und Lizenz noch klären** (Link zur itch.io-Seite) |
