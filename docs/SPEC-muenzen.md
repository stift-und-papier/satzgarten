# Spec: Münzen und Shop (`muenzen`, `shop`)

Antworten der Lehrkraft vom 2026-11-12 auf die offenen Fragen 1, 2 und 7. Zahlen (Preise, Freischalt-Grenzen) sind
Vorschläge von Claude und gelten nach Freigabe.

## Münzen

| Grund | Münzen | Wie oft |
|---|---|---|
| Aufgabe richtig im 1. Versuch | ★ 10 · ★★ 15 · ★★★ 20 | je Aufgabe **einmal pro Tag** |
| Aufgabe richtig im 2. Versuch | die Hälfte (★ 5 · ★★ 8 · ★★★ 10) | je Aufgabe einmal pro Tag |
| nach „Lösung ansehen“ | keine | – |
| Erklärseite zum ersten Mal angesehen | 5 | einmal je Erklärseite |
| Diktat geschafft (ab 90 %) | 30 | einmal je Diktat |
| Diktat verbessert (mehr richtig als das bisher beste Ergebnis, ab 90 %) | 10 | bei jeder Verbesserung |
| Diktat fehlerfrei | 20 extra | einmal je Diktat |

- „Tag“ = Kalendertag in Deutschland (Europe/Berlin). Es zählt der erste Versuch des Tages; wer eine Aufgabe am selben
  Tag noch einmal löst, bekommt nichts.
- Gegen Raten: der 2. Versuch bringt nur die Hälfte, nach „Lösung ansehen“ gibt es nichts. Gegen Tempo: Wiederholen
  bringt höchstens einmal am Tag Münzen.
- Jede Münz-Gutschrift ist ein Eintrag in `muenz_ereignisse` mit eindeutigem Schlüssel (Grund + Aufgabe + Tag).
  Doppelte Abgabe (z. B. offline nachgereicht) bringt keine doppelten Münzen. Nur **eine** Datenbankfunktion vergibt
  Münzen; der Kontostand ist die Summe der Ereignisse minus Käufe.
- Schüler:innen sehen den Kontostand und nach der Abgabe „+15 Münzen“. Keine Ranglisten, kein Vergleich mit anderen.
- „Ergebnisse zurücksetzen“ setzt Münzen, Besitz und Farm mit zurück.

## Shop

- Angebot aus den Sprout-Lands-Grafiken: Samen (15 Sorten aus „Farming Plants“), Tiere (Huhn, Kuh), Deko (Zaun,
  Schilder, Blumen, Steine, Brunnen, Picknick …).
- **Nach und nach freischalten** nach den insgesamt **verdienten** Münzen (Ausgeben nimmt nichts weg):

| Insgesamt verdient | Neu im Shop |
|---|---|
| 0 | 3 Samen, Zaun |
| 300 | 3 weitere Samen, Huhn, erste Deko |
| 800 | 3 weitere Samen, mehr Deko |
| 1500 | 3 weitere Samen, Kuh |
| 3000 | letzte Samen, Brunnen und große Deko |

- Preise (Vorschlag): Samen 20–60, Deko 30–200, Huhn 300, Kuh 600. Ein Paket mit 10 Aufgaben bringt etwa 100–200 Münzen.
- Noch nicht Freigeschaltetes erscheint als „?“ mit dem Satz „Kommt, wenn du weiter übst.“ (keine Zahl bis zur Grenze).
- Kaufen nur über die Datenbankfunktion `kaufen` (prüft Freischaltung und Kontostand). Besitz ist eine Liste.
