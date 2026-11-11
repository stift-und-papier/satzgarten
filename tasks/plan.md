# Bauplan: Wortsalat

Stand: 11. November 2026 · Grundlage: `docs/SPEC.md` (freigegeben 11. November 2026)
Status: **Entwurf, wartet auf Freigabe der Lehrkraft**
Aufgabenliste mit allen Einzelheiten: `tasks/todo.md`. Der alte Satzgarten-Plan steht im Git-Verlauf (Commit `bb6e9e6`).

## Überblick

Wortsalat entsteht **im bestehenden Projekt**, das zuerst umbenannt wird. Gebaut wird in **9 Phasen mit 44 kleinen
Aufgaben**, in der Reihenfolge der Bausteine aus der Spec. Nach jeder Phase gibt es einen **Haltepunkt**: Sie testen
(meist am iPad mit Tastatur) und geben frei, erst dann geht es weiter.

**Was aus Satzgarten bleibt** (fertig und geprüft): Grundgerüst, Veröffentlichung, Datenbank mit Test-Gerüst,
Navigation, Versionsprüfung, Leseschrift, Dunkelmodus, Fachbegriff-Farben, Lehrkraft-Thema „ruhig“,
Anmeldung der Lehrkraft. **Was wegfällt:** Garten-Zeichnungen, Albert als SVG, die Entwurfsseiten unter `#/stil/…`.

## Technische Entscheidungen

1. **Umbenennen zuerst** (Phase 1): GitHub-Repo, Adresse `/wortsalat/`, Texte und `CLAUDE.md`. GitHub leitet die
   alte Repo-Adresse weiter; die alte Seite `…/satzgarten/` verschwindet. Der Projektordner auf Ihrem Rechner wird
   ganz am Ende einer Sitzung umbenannt (eine laufende Sitzung arbeitet in ihm). Die Datenbank bleibt dieselbe,
   nur ihr Anzeigename im Supabase-Dashboard ändert sich.
2. **Pixel-Grafiken als Einzelbilder:** Ein kleines Skript schneidet benutzte Bilder aus den Paketen in `assets/`
   und legt sie in `src/grafik/` ab (mit `LIZENZ.md`). Ins Repo kommt nie ein ganzes Paket.
   Angezeigt werden sie ganzzahlig vergrößert und ohne Weichzeichnen.
3. **Design wieder früh** (Phase 2): Pixel-Stilblatt, Schrift mit Umlauten und Einstein werden festgelegt und
   freigegeben, **bevor** Schülerseiten entstehen.
4. **Lösungen getrennt, je Format eine Prüffunktion** (wie in Satzgarten geplant). Das Diktat wird ein Format wie
   die anderen und nutzt Editor, Prüfung und DB-Test mit.
5. **Eingabefelder ohne Korrektur:** ein gemeinsamer Baustein für alle Schüler-Eingabefelder, der Autokorrektur,
   Rechtschreibprüfung, Wortvorschläge und automatische Großschreibung abschaltet. Früher iPad-Test in Phase 4.
6. **Bausteine mit offenen Regeln bekommen zuerst eine eigene kurze Spec** (Diktat, Münzen + Shop, Felder + Tiere,
   Spielfigur). Sie beantworten die offenen Fragen der Spec und werden von Ihnen freigegeben, bevor gebaut wird.
7. **Farm ohne Schummeln:** Münzen sind eine Ereignisliste in der Datenbank (wer bekam wann wofür Münzen, jeder Grund
   nur einmal). Kontostand, Besitz und Wachstum werden gezählt, nicht als Zahl gespeichert, die man über das Netzwerk
   ändern könnte. Kaufen, Pflanzen, Ernten, Füttern gehen nur über geprüfte Datenbankfunktionen.
8. **Farm ohne Spiel-Bibliothek** (Vorschlag aus der Spec): Spielfeld als Raster aus Pixel-Kacheln mit React und CSS;
   die Spielfigur bewegt sich per CSS-Transform. Erst wenn das am iPad nicht flüssig läuft, fragen wir nach einer Bibliothek.
9. **Keine neuen Bibliotheken** ohne Rückfrage (bisher: supabase-js, dnd-kit, qrcode).

## Phasen

| Phase | Inhalt | Aufgaben | Haltepunkt |
|---|---|---|---|
| 1 Umbenennen | Repo, Adresse, Texte, Aufräumen, Ihr Lehrkraft-Konto | 1–3 | Seite läuft unter `/wortsalat/`, Anmeldung klappt |
| 2 Design | Grafik-Ordner, Schrift, Pixel-Stilblatt, Einstein | 4–7 | **Sie geben das Design frei** |
| 3 Klassen & Kompetenzen | Klassen, Pseudonyme, Linkliste, Kompetenzen | 8–10 | Klasse mit Linkliste gedruckt |
| 4 Aufgaben | 7 Formate einzeln, Eingabe ohne Korrektur, Liste mit Filter | 11–19 | Je Format eine Aufgabe in der Vorschau; iPad korrigiert nichts |
| 5 Diktat | Spec, Abschreiben, Merkdiktat | 20–22 | Diktat am iPad mit Tastatur |
| 6 Pakete & Üben | Pakete, Schüleransicht, Abgabe, offline, Stufen, Einstein, Hilfe | 23–29 | **iPad-Test mit Testklasse** |
| 7 Lernstand | Berechnung, Heatmap, Lernweg, Zurücksetzen | 30–33 | Lernstand stimmt mit Testdaten |
| 8 Farm | Specs, Münzen, Shop, Felder, Gießen und Ernten, Tiere, Spielfigur | 34–41 | **iPad-Test Farm** |
| 9 Übernahme & Abschluss | Alte Aufgaben holen, Datenschutz-Texte, Abnahme | 42–44 | Abnahme nach Spec Abschnitt 11 |

**Gleichzeitig möglich:** Phase 2 (Design) braucht aus Phase 1 nur die Umbenennung. Die Bausteine der Farm-Specs
(Aufgaben 34, 36, 40) können Sie schon früher beantworten, wenn Sie möchten. Datenbank-Änderungen laufen nie gleichzeitig.

## Risiken

| Risiko | Folge | Gegenmittel |
|---|---|---|
| Pixel-Design wirkt am iPad zu klein oder unruhig | hoch | Phase 2 früh am echten iPad; ganzzahlige Vergrößerung, Tippflächen ≥ 48 px |
| Keine Schrift mit Umlauten im Pixel-Stil | mittel | Aufgabe 5: Entwürfe (eigene Umlaute ergänzen oder ruhige Textschrift) |
| Safari korrigiert trotz Abschaltung | mittel | gemeinsamer Eingabe-Baustein, früher Test (Aufgabe 11); notfalls iPad-Einstellung |
| Farm lenkt vom Üben ab / belohnt Raten | hoch | Münz-Regeln in eigener Spec (Aufgabe 34) mit Ihrer Freigabe; Regeln auf dem Server |
| Spielfigur am iPad ruckelt | mittel | einfache Technik zuerst; Figur ist zusätzlich, alles bleibt per Antippen bedienbar |
| Lizenz der Grafiken | mittel | nur Einzelbilder ins Repo, `LIZENZ.md`, Namensnennung in der App; `assets/` ignoriert |
| Umbenennen bricht Links/Lesezeichen | niedrig | noch keine echten Nutzer:innen; GitHub leitet das Repo weiter |
| Supabase pausiert in den Ferien | niedrig | im Dashboard mit einem Klick wieder starten (Anleitung in README) |
| Datenschutz nicht geklärt | hoch für den Einsatz | Bauen ja, **echte Klassen erst nach Freigabe** durch Schulleitung/DSB |

## Offene Fragen

Die offenen Fragen der Spec (Abschnitt 12) werden in den Bausteinen beantwortet, zu denen sie gehören:
Schrift → Aufgabe 5, Diktat → Aufgabe 20, Münzen und Shop → Aufgabe 34, Felder und Tiere → Aufgabe 36,
Spielfigur → Aufgabe 40. Datenschutz → mit Schulleitung/DSB, spätestens vor Haltepunkt 9.
