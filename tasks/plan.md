# Bauplan: Satzgarten

Stand: 9. November 2026 · Grundlage: `docs/SPEC.md` (freigegeben 9. November 2026)
Status: **Entwurf, wartet auf Freigabe der Lehrkraft**
Aufgabenliste mit allen Einzelheiten: `tasks/todo.md`. Beide Dateien ziehen mit der Spec ins neue Projekt um.

## Überblick

Satzgarten wird als **neues Projekt** gebaut. Die alte App „Übungswiese“ läuft so lange weiter. Gebaut wird in
8 Phasen mit 36 kleinen Aufgaben. Nach jeder Phase gibt es einen **Haltepunkt**: Sie testen (meist am iPad) und
geben frei, erst dann geht es weiter.

Bewährtes aus der alten App wird **gezielt übernommen** und nicht neu erfunden:
- der Parser der Schreibweisen mit seinen Tests
- Pseudonyme, Filter, Sortierung, Versionsprüfung
- das Lernstand-Verfahren
- der Aufbau des Datenbank-Tests

## Technische Entscheidungen

1. **Ort:** Ordner `C:\Users\jrkug\Projekte\satzgarten` (nicht in OneDrive). Repo `stift-und-papier/satzgarten`,
   öffentlich. Adresse `https://stift-und-papier.github.io/satzgarten/`.
2. **Eigene, neue Supabase-Datenbank** (Frankfurt). Der kostenlose Tarif erlaubt 2 aktive Projekte: alt + neu passen.
   Die alte Datenbank bleibt bis zur Übernahme (Phase 8) unverändert.
3. **Lösungen getrennt:** Tabelle `aufgaben` mit zwei Feldern:
   - `inhalt`: was Schüler:innen sehen dürfen
   - `loesung`: nur auf dem Server

   Die Funktionen für Schüler:innen lesen `loesung` nur zum Prüfen. Damit entfällt die alte Stolperfalle
   („Feld `text` immer entfernen“). Der DB-Test prüft für **jedes** Format, dass keine Lösung herauskommt.
4. **Je Format eine Prüffunktion** (`pruefe_lueckentext`, `pruefe_auswahl`, …) und eine kurze Verteilerfunktion.
   Ein neues Format bedeutet dann eine neue Datei, nicht drei Änderungen an großen Funktionen.
5. **Bauen in senkrechten Scheiben:** Jedes Format wird einmal ganz durchgebaut, bevor das nächste kommt:
   Editor, Prüfung in der Datenbank, Anzeige für Schüler:innen, Test.
6. **Design früh** (Phase 2): Geschmack ist das größte Risiko für Umbauten. Deshalb legen Sie Stil, Maskottchen und
   Garten mit Entwürfen fest, **bevor** Schülerseiten entstehen. Ein zweiter Design-Durchgang soll nicht nötig werden.
7. **Garten ohne Schummeln** (alles auf dem Server):
   - **Samen** stehen in einer Liste: Wer bekam wann wofür einen Samen? Jeder Grund darf nur einmal vorkommen,
     z. B. ein Samen je Paket. Dadurch gibt es nie doppelte Samen.
   - **Freie Samen** = verdiente minus gepflanzte. Die Zahl wird nicht gespeichert, sondern jedes Mal neu gezählt.
   - **Wachstum** wird ebenfalls gezählt, nicht gespeichert: Wie viele Aufgaben wurden seit dem Pflanzen erledigt?
     Erklärseiten zählen nicht. Daran lässt sich über das Netzwerk nichts verfälschen.
   - Schüler:innen bekommen nur Bildangaben (welche Pflanze, welche Stufe, wie viele Samentüten-Bilder), keine Zahlen
     in Texten.
8. **Texte ohne Programmieren änderbar:** Hilfe (`hilfe.md`) und Maskottchen (`maskottchen.md`) als Markdown.
9. **Keine neuen Bibliotheken** über die bisherigen hinaus: supabase-js, dnd-kit, qrcode.

## Phasen

| Phase | Inhalt | Aufgaben | Haltepunkt |
|---|---|---|---|
| 1 Grundgerüst | Projekt, Veröffentlichung, Datenbank, Test-Gerüst | 1–3 | Leere Seite ist online, DB-Test läuft |
| 2 Design | Stilblatt, Maskottchen, Garten-Entwurf | 4–6 | **Sie geben das Design frei** |
| 3 Klassen & Kompetenzen | Login, Klassen, Pseudonyme, Linkliste, Kompetenzen | 7–10 | Klasse mit Linkliste gedruckt |
| 4 Aufgaben | 7 Formate einzeln, dann Liste mit Filter | 11–18 | Je Format eine Aufgabe in der Vorschau |
| 5 Pakete & Üben | Pakete, Schüleransicht, Abgabe, offline, Stufen, Maskottchen, Hilfe | 19–25 | **iPad-Test mit Testklasse** |
| 6 Lernstand | Berechnung, Heatmap, Einzelansicht, Lernweg, Zurücksetzen | 26–29 | Lernstand stimmt mit Testdaten |
| 7 Garten | Samen, Pflanzen, Wachsen, Sammelbuch | 30–33 | **iPad-Test Garten** |
| 8 Übernahme & Abschluss | Alte Aufgaben holen, Datenschutz, Abnahme | 34–36 | Abnahme nach Spec Abschnitt 10 |

**Was gleichzeitig laufen könnte:** Die Design-Entwürfe (Phase 2) brauchen nichts aus Phase 1, außer der Seite, auf
der man sie ansieht. Alles andere baut aufeinander auf und läuft der Reihe nach. Datenbank-Änderungen gehen nie
gleichzeitig.

## Risiken

| Risiko | Folge | Gegenmittel |
|---|---|---|
| Design gefällt am iPad nicht | hoch | Phase 2 früh, mit Entwürfen am echten iPad; Freigabe vor jeder Schülerseite |
| Ältere iPads (Safari 15) | mittel | Bau-Ziel Safari 15; Haltepunkte am iPad; keine neuen Browser-Funktionen ohne Ersatz |
| Ziehen am iPad hakt (Reihenfolge, Garten) | mittel | Antippen funktioniert immer, Ziehen kommt nur zusätzlich dazu |
| Erkennen „Kompetenz hat sich verbessert“ für Samen | mittel | Regel in **einer** Funktion, mit Testfällen; höchstens 1 Samen je Kompetenz und Kategorie |
| Übernahme der alten Aufgaben (neues Lösungsfeld) | mittel | Umwandlungsskript mit Tests; erst Probelauf, dann echter Lauf |
| Supabase pausiert in den Ferien | niedrig | im Dashboard mit einem Klick wieder starten (Anleitung in README) |
| Supabase-CLI im Terminal der Lehrkraft (Avast) | niedrig | Befehle laufen aus Claudes eigener Shell |
| Datenschutz nicht geklärt | hoch für den Einsatz | Bauen ja, **echte Klassen erst nach Freigabe** durch Schulleitung/DSB |
| Urheberrecht der Referenzbilder | mittel | alles neu zeichnen; `refrences/` kommt nicht ins Repo |

## Offene Fragen (blockieren den Start nicht)

1. **Freischalten im Sammelbuch:** Vorschlag:
   - 4 Pflanzen sind von Anfang an da.
   - Jeder Kompetenzbereich, in dem man übt, schaltet 2 weitere frei.
   - Deko gibt es für abgeschlossene Pakete.

   Entscheiden bis Phase 7.
2. **Samen für Verbesserung:** Vorschlag: höchstens 2 je Kompetenz, je 1 beim ersten „besser“ und beim ersten
   „deutlich besser“. Entscheiden bis Phase 7.
3. **Maskottchen:** Name? Eine Figur oder Auswahl? Entscheiden in Phase 2 (Aufgabe 5).
4. Die übrigen offenen Punkte der Spec (Abschnitt 11) bleiben bestehen.
