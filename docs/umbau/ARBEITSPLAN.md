# Wortsalat – Übungsumbau: Arbeitsplan für Claude Code

> Dieser Plan gehört in den Projektordner, z. B. als `docs/umbau/ARBEITSPLAN.md`.
> Claude Code arbeitet ihn Schritt für Schritt ab. Du sagst nur: **„Lies docs/umbau/ARBEITSPLAN.md und führe Schritt N aus."**
>
> Hinweis: Claude Code hat echten Zugriff auf Dateien und Befehle. Prüfe vor dem Start, dass der Projektordner stimmt.

---

## Hinweise für Jazz (nicht für Claude Code)

**So läuft jeder Schritt ab**
1. Du schreibst: „Lies docs/umbau/ARBEITSPLAN.md und führe Schritt N aus."
2. Claude Code stellt zuerst Rückfragen und wartet auf deine Antworten. Erst danach wird etwas gebaut.
3. Am Ende des Schritts aktualisiert Claude Code `docs/umbau/STATUS.md`, committet auf dem Arbeits-Branch und meldet sich mit der Aufforderung zum Compact.
4. Du gibst `/compact` ein. Das kann Claude Code meines Wissens nicht selbst auslösen, es ist ein Befehl, den nur du eingeben kannst. Empfohlene Variante:
   `/compact Behalte: Abschnitt A und B des Arbeitsplans, Inhalt von docs/umbau/STATUS.md, aktueller Schritt, offene Fragen.`
5. Danach schreibst du: „Weiter mit Schritt N+1."

Weil alles Wichtige in `STATUS.md` und in dieser Datei steht, geht beim Compact nichts verloren. Notfalls kannst du auch `/clear` nehmen und mit „Lies den Arbeitsplan und STATUS.md, dann führe Schritt N aus" neu starten.

**Dein Anteil**
- Schritt 3: Konzept lesen und freigeben.
- Nach Schritt 8 und in Schritt 12: auf einem echten iPad testen (Checkliste am Ende).
- Schritt 7: Bild mit Gemini erzeugen und in den Ordner legen.

---

## A. Grundregeln (gelten in jedem Schritt)

Lies zu Beginn **jedes** Schritts: Abschnitt A, Abschnitt B und `docs/umbau/STATUS.md`.

1. **Erst fragen, dann bauen.** Wenn etwas unklar ist, stelle deine Fragen als nummerierte Liste, jeweils mit einem Vorschlag als Standardantwort. Warte auf meine Antwort, bevor du Code schreibst oder Dateien erstellst. Nichts raten.
2. **Nur der aktuelle Schritt.** Beginne nie den nächsten Schritt. Ändere nichts außerhalb des Umfangs des aktuellen Schritts.
3. **Nichts löschen.** Alte Übungen und Pakete werden nur archiviert, nie gelöscht. Auch sonst: keine Datei und keine Daten löschen.
4. **Stopp und Rückfrage vor:** dem Löschen oder Verschieben von Dateien, neuen Abhängigkeiten (Pakete/Bibliotheken), Änderungen am Datenbankschema oder Speicherformat, Veröffentlichung/Deployment, Push, Merge auf den Hauptbranch.
5. **Arbeitsweise mit Git:** Arbeite ausschließlich auf dem Branch `uebungsumbau`. Der Stand vor dem Umbau ist mit dem Tag `vor-uebungsumbau` gesichert. Am Ende jedes Schritts: committen (deutsche, kurze Nachricht). Niemals auf den Hauptbranch committen, niemals pushen ohne meine Freigabe.
6. **Keine echten Schülerdaten.** Teste nur mit Testdaten. Pseudonymisierung bleibt unverändert.
7. **Nur belegen, was du getestet hast.** Berichte nur, was du tatsächlich ausgeführt oder im Browser gesehen hast. Was du nicht testen konntest, schreibst du als „nicht getestet" mit Grund.
8. **Tests im Browser** mit iPad-Fenstergrößen (mindestens 1024×768 und 1180×820, quer).
9. **Schritt-Abschluss (immer, in dieser Reihenfolge):**
   1. `docs/umbau/STATUS.md` aktualisieren: erledigt, getroffene Entscheidungen, geänderte Dateien, offene Fragen, nächster Schritt.
   2. Auf dem Branch committen.
   3. Mit genau diesem Satz enden und dann stoppen:
      **„✅ Schritt N abgeschlossen. Bitte jetzt `/compact` eingeben und danach ‚Weiter mit Schritt N+1' schreiben."**

---

## B. Festlegungen (verbindlich, von Jazz getroffen)

### Begriffe
- **Paket** = mehrere Übungen.
- **Übung** = eine Übungsart (Aufgabenformat), besteht aus mehreren **Runden**, hat **ein Monster**.
- **Runde** (= Teilübung) = ein Beispiel, eine Eingabe, abgeschlossen mit dem Button „Prüfen". Ausnahme: Diktate.

### Archivierung
- Alle bisherigen Übungen und Übungspakete werden archiviert. Sie erscheinen nirgends mehr: nicht bei Schüler:innen, nicht bei Lehrkräften (auch nicht in Auswahl- oder Zuweisungslisten).
- Sie werden nicht gelöscht. Sie sollen später als Referenz dienen können.
- Die **Erklärungsseiten bleiben für alle Klassenstufen** erhalten und funktionieren weiter.
- Vorschlag (gilt, sofern nicht widersprochen): Bestehende Lernstände, Münzen und Zuweisungsdaten bleiben unverändert erhalten. Wenn Schüler:innen nichts zugewiesen haben, sehen sie einen freundlichen Leerzustand („Hier kommen bald neue Übungen").

### Spielablauf (Standard-Übungen)
- Jede **richtige Runde** schießt ein Herz auf das Monster.
- Bei einer **falschen Eingabe** trifft das Herz nicht. Einstein macht kurz ein geschocktes Gesicht. Beim nächsten Herz, das trifft, schaut er wieder normal.
- Ein Monster gilt als **befreundet**, wenn die Übung vollständig richtig war. Befreundete Monster bekommen ein **Herz-Emoticon über dem Kopf** (Herz-Sprite aus den Assets, kein Systememoji).
- **Münzen:** je nach Grad der Richtigkeit, plus **Extramünzen** für ein vollständig befreundetes Monster am Ende der Übung. Konkrete Beträge schlägt Claude Code in Schritt 3 vor, Jazz entscheidet.
- Ist die Übung nicht komplett richtig, sagt **Einstein**, dass man **morgen noch einmal versuchen** kann, sich anzufreunden (ermutigend, kindgerecht formuliert).
- Die richtige Schreibweise bzw. Lösung wird durch das bisherige Aufgabenformat bereits angezeigt. Dafür wird nichts Neues gebaut.
- **Kein Herzzähler und keine „fehlen noch X Herzen"-Anzeige**, weder für Schüler:innen noch für Lehrkräfte (der Lernstand wird für Lehrkräfte bereits anders dargestellt).

### Wiederholungsversuche
- „Morgen" = der **nächste Kalendertag** (Zeitzone Europe/Berlin).
- Lehrkräfte können Versuche **manuell und früher zurücksetzen**, einfach per Knopfdruck.
- Vorschlag (gilt, sofern nicht widersprochen): Münzen gibt es beim Wiederholen nur für Verbesserung, damit man die Farm nicht durch Wiederholen ausnutzen kann. Beim Wiederholen können andere Beispiele aus einem Pool kommen. Beides im Konzept (Schritt 3) vorschlagen und bestätigen lassen.

### Diktate
- **Diktate mit weiterlaufendem Text** funktionieren wie in Tastenheld: Für eine bestimmte Zahl richtiger Eingaben wird jeweils ein Herz verschossen. Die Zahl und die Zählweise (Zeichen/Wörter) legt Claude Code anhand der Tastenheld-Analyse als Vorschlag vor, Jazz entscheidet.
- Das Monster wird bei **95 % richtigen Eingaben** befreundet. Verbessert man sich im **Wiederholungsversuch auf 100 %**, gibt es Zusatzmünzen.
- **Merkdiktate** laufen wie normale Übungen: Der Text wird eingeblendet und verschwindet erst nach Bestätigung (Button oder Leertaste). Danach wird eingegeben. Eine richtige Eingabe zählt als Herz, eine mit Fehler als Fehlschuss.

### Fallende Wörter (neues Format, wie in Tastenheld)
- Zum Üben der Schreibung schwieriger Wörter.
- **Einstellbar** (z. B. Tempo) und mit einem **Modus ohne Zeitdruck**. Welche Einstellungen es genau gibt und wer sie setzt, klärt Claude Code in Schritt 3 per Vorschlag.
- Alle anderen Aufgabenformate gibt es bereits. Sie werden nur in die neue Struktur (Übung aus Runden) überführt.

### Darstellung und Figuren
- **Einstein** ersetzt den Roboter aus Tastenheld. Zustände: normal, geschockt (beide vorhanden), schießend (muss noch erzeugt werden, siehe Schritt 7).
- **Hintergrund:** die Wiese aus Tastenheld.
- **Monster:** Die Lehrkraft wählt sie pro Übung aus den Monstern im Ordner `assets`. Die Monster bewegen sich (Animations-Assets liegen im Ordner).
- Herz-Sprites sind vorhanden.
- Lesbarkeit der zu lesenden und zu tippenden Texte geht vor dem Pixel-Look. Die Schriftart-Option OpenDyslexic (pro Schüler:in per Haken) muss auch im Spiel für Aufgabentexte wirken.

### Technik
- Alle iPads haben eine Hardware-Tastatur. Eingabe wie in Tastenheld. Autokorrektur, automatische Großschreibung und Rechtschreibprüfung müssen in allen Eingabefeldern ausgeschaltet sein.
- Der **Lehrkrafteditor wird direkt mit angepasst** (Schritt 6, Ergänzungen in 10 und 11).
- Die bestehende Zuordnung zum Kerncurriculum, die Schwierigkeitsstufen (Sterne) und die Lernstand-Anzeige müssen mit den neuen Übungen weiter funktionieren.
- Tastenheld-Code und -Assets dürfen genutzt werden. Die Programmiererin hat ihre Erlaubnis gegeben, das Repo ist öffentlich. Trotzdem: Lizenzdatei prüfen und berichten, und eine `CREDITS.md` anlegen (Quelle, Urheberin, Hinweis auf die Erlaubnis), sobald erstmals Tastenheld-Code oder -Assets übernommen werden.
- Pfad zu Tastenheld: `C:\Users\jrkug\Projekte\TastenHeld-main.zip` (ZIP-Datei)
- Pfad zu den Assets: `C:\Users\jrkug\Projekte\TastenHeld-main.zip\TastenHeld-main\assets` (Ordner in der ZIP-Datei)

---

## C. Arbeitsschritte

### Schritt 0 – Sicherung und Arbeitsumgebung (kein Code ändern)
**Ziel:** Jederzeit zurück zum alten Stand können.
**Aufgaben**
1. Git-Status prüfen. Falls es nicht committete Änderungen gibt: anzeigen und fragen, wie damit umgegangen werden soll.
2. Tag `vor-uebungsumbau` auf den aktuellen Stand setzen, Branch `uebungsumbau` anlegen.
3. Herausfinden, wo die Daten liegen (Dateien, Datenbank, externer Dienst). Fragen, ob vor dem Umbau eine Datensicherung/ein Export gemacht werden soll, und wie.
4. `docs/umbau/` und `docs/umbau/STATUS.md` anlegen (Abschnitte: Erledigt, Entscheidungen, Geänderte Dateien, Offene Fragen, Nächster Schritt).
5. Fragen, ob in `CLAUDE.md` ein Hinweis ergänzt werden soll: „Beim Übungsumbau zuerst docs/umbau/ARBEITSPLAN.md und STATUS.md lesen."
6. Mir in drei einfachen Sätzen erklären, wie ich zum alten Stand zurückkomme.

**Fertig, wenn:** Tag, Branch und STATUS.md existieren und die Rückkehr-Erklärung vorliegt.

---

### Schritt 1 – Bestandsanalyse Wortsalat (nur lesen)
**Ziel:** Verstehen, was es gibt, bevor etwas geändert wird. Ergebnis: `docs/umbau/analyse-wortsalat.md`.
**Aufgaben:** Dokumentiere (mit Dateipfaden)
- Technik/Stack und Projektstruktur
- Datenmodell und Speicherort für Aufgaben, Pakete, Zuweisungen, Ergebnisse, Lernstand, Münzen, Farm
- alle Aufgabenformate: Wie wird eingegeben, wie wird „Prüfen" ausgewertet, wie wird die richtige Lösung angezeigt?
- Lehrkrafteditor (Dateien, Formulare, Pakete, Tags, Sortierung)
- Schüler:innen-Startseite und Navigation zu Übungen
- Erklärungsseiten und alle Verlinkungen von dort zu Übungen
- wo Kerncurriculum-Zuordnung, Sterne-Stufen, Schriftart-Option und Münzvergabe hängen
- Risiken beim Archivieren und Umbauen (z. B. Zuweisungen, Lernstand, Links)

Sammle Rückfragen und stelle sie, bevor du den Schritt abschließt.
**Fertig, wenn:** Analyse liegt vor, nichts wurde geändert.

---

### Schritt 2 – Analyse Tastenheld, Assets, Lizenz (nur lesen)
**Ziel:** Entscheiden können, was aus Tastenheld übernommen wird. Ergebnis: `docs/umbau/analyse-tastenheld.md` und `docs/umbau/asset-inventar.md`.
**Aufgaben**
1. Tastenheld-Ordner: Stack, Struktur, Spielschleife, Eingabeverarbeitung (Tastaturereignisse), wie das „Herz-Schuss"-Prinzip umgesetzt ist.
2. **Diktatmodus:** Wie läuft der Text weiter? Was zählt als richtige Eingabe? Wie viele richtige Eingaben ergeben ein Herz? Wie wird Fehlerverhalten behandelt?
3. **Modus mit fallenden Wörtern/Buchstaben:** Parameter (Tempo, Anzahl, Leben o. Ä.), Spielregeln.
4. Wiese/Hintergrund, Sounds, Teile, die nicht gebraucht werden (z. B. Highscores, Konten).
5. Lizenzdatei und Assets von Dritten prüfen und berichten.
6. Ordner `assets` im Wortsalat-Projekt inventarisieren: Monster (mit Animations-Frames), Einstein-Zustände, Herz-Sprites, Wiese, Schriften. Mit Dateinamen und Bildgrößen. Fehlendes benennen.
7. Empfehlung mit Pro und Contra: Tastenheld-Code direkt übernehmen und anpassen oder die Mechanik in Wortsalat neu umsetzen. Frage mich, welche Variante ich will.

**Fertig, wenn:** Beide Dateien liegen vor und die Empfehlung ist besprochen. Nichts wurde geändert.

---

### Schritt 3 – Konzept und Plan (kein Code, Freigabe durch Jazz)
**Ziel:** Ein freigegebener Entwurf, bevor gebaut wird. Ergebnis: `docs/umbau/konzept.md`.
**Inhalt**
- Datenmodell Paket → Übung → Runde (inkl. Übungsart, Monster, Sterne, Kerncurriculum-Zuordnung, Typ: Standard / Diktat / Merkdiktat / Fallende Wörter)
- Archivierungskonzept
- Versuchslogik: Kalendertag (Europe/Berlin), manueller Reset
- **Münzmodell:** Vorschlag mit konkreten Beträgen (Teilmünzen nach Anteil richtiger Runden, Extramünzen für Freundschaft, Diktat-Zusatzmünzen, Regel „nur bei Verbesserung")
- **Diktat:** Zählweise und Zahl für ein Herz, 95-%-Berechnung
- **Fallende Wörter:** Einstellungen (wer stellt was ein, Tempo, Modus ohne Zeitdruck) und wie Treffer/Fehler auf Herzen und Monster abgebildet werden
- Wiederholungs-Pool (andere Beispiele beim erneuten Versuch)
- Einbindung der Rundenergebnisse in den Lernstand (wie fließt eine Runde in die Kompetenzanzeige?)
- Ablauf der Bildschirme: Startseite → Paket → Übung → Spiel → Abschluss
- Zustände von Einstein (normal → schießend bei Treffer → geschockt bei Fehlschuss → normal beim nächsten Treffer) und Monster (bewegt sich; befreundet mit Herz)
- Migrationsplan und Teststrategie

Beende den Schritt mit einer Liste der Punkte, die ich entscheiden muss, jeweils mit deinem Vorschlag. **Warte auf meine Freigabe.**
**Fertig, wenn:** Ich das Konzept ausdrücklich freigegeben habe.

---

### Schritt 4 – Archivierung der alten Übungen und Pakete
**Ziel:** Alles Alte ist unsichtbar, aber vollständig erhalten.
**Aufgaben**
1. Markierung „archiviert" für alle bisherigen Übungen und Pakete (Daten bleiben unverändert).
2. Archivierte Einträge überall ausblenden: Schüler:innen-Ansicht, Lehrkraft-Ansicht, Auswahl- und Zuweisungslisten, Editor.
3. Leerzustand für Schüler:innen ohne Übungen (kurzer, freundlicher Text).
4. Erklärungsseiten prüfen: für alle Klassenstufen erreichbar, keine kaputten Links zu archivierten Übungen.
5. Frage mich, ob zusätzlich ein Export der archivierten Daten (z. B. JSON) in einen Ordner `archiv/` gelegt werden soll.
6. Frage mich, ob alte Ergebnisse weiter im Lernstand zählen sollen (Vorschlag: ja, bleibt erhalten).

**Fertig, wenn:** Im Browser sind in Schüler:innen- und Lehrkraft-Ansicht keine alten Übungen sichtbar, die Daten sind weiter vorhanden, die Erklärungsseiten funktionieren, Tests sind dokumentiert.

---

### Schritt 5 – Neues Datenmodell und Spiellogik (ohne Oberfläche)
**Ziel:** Fundament für Paket → Übung → Runde.
**Aufgaben**
1. Datenmodell gemäß freigegebenem Konzept umsetzen. Vor Schema- oder Speicherformat-Änderungen: nachfragen.
2. Versuchslogik: ein Versuch pro Schüler:in und Übung, Kalendertag-Regel (Europe/Berlin), Reset-Funktion.
3. Auswertung: Runde richtig/falsch, Freundschaftsstatus (Standard: vollständig richtig; Diktat: 95 %), Münzberechnung inkl. Extramünzen und Regel für Wiederholungen.
4. Rundenergebnisse an den Lernstand anbinden (Kerncurriculum-Zuordnung und Sterne bleiben erhalten).
5. Automatische Tests für Kalendertag-Grenzfälle (z. B. kurz vor/nach Mitternacht), Münzberechnung, Reset, Freundschaftsstatus.

**Fertig, wenn:** Tests laufen und bestehen. Bestehende Daten (Lernstand, Münzen) sind unverändert nutzbar.

---

### Schritt 6 – Lehrkrafteditor anpassen
**Ziel:** Übungen und Pakete in der neuen Struktur erstellen können.
**Aufgaben**
1. Eine Übung aus mehreren Runden zusammenstellen (Eingabe per Tippen und Formular wie bisher), alle bestehenden Aufgabenformate.
2. Monster pro Übung auswählen (mit Vorschau der Monsterbilder aus `assets`).
3. Pakete aus Übungen zusammenstellen (Tags, Sortierung und Filter wie bisher).
4. **Reset-Knopf** pro Schüler:in und Übung (ein Klick, früherer neuer Versuch). Frage mich, ob eine kurze Bestätigung gewünscht ist.
5. Platz für spätere Einstellungen von Diktaten und Fallenden Wörtern vorsehen (Umsetzung in Schritt 10 und 11).
6. Übersichtlichkeit der Lehrkraft-Oberfläche beibehalten.

**Fertig, wenn:** Im Browser kann eine Testübung mit mehreren Runden, Monster und ein Testpaket erstellt und zugewiesen werden, der Reset funktioniert.

---

### Schritt 7 – Asset-Vorbereitung: Einstein „schießend"
**Ziel:** Das fehlende Sprite beschaffen können. Ergebnis: `docs/umbau/bildprompt-einstein-schiessend.md`.
**Aufgaben**
1. Die vorhandenen Einstein-Sprites (normal, geschockt) ansehen. Stil, Größe, Perspektive, Farbpalette, Hintergrund beschreiben.
2. Einen Bildprompt für Google Gemini schreiben, mit dem das Sprite „Einstein schießt ein Herz" im selben Stil entsteht. Dazu kurze Hinweise: Transparenter Hintergrund, gleiche Pixelgröße, gleiche Blickrichtung.
3. Prüfen, ob die Monster-Animationen vollständig sind (Frames) und was fehlt.
4. Bis das Sprite vorliegt, soll im Spiel der normale Einstein als Platzhalter dienen. Sag mir, wie ich die fertige Datei einfügen soll (Dateiname und Ordner).

**Fertig, wenn:** Bildprompt und Einfüge-Anleitung liegen vor. Ich erzeuge das Bild selbst.

---

### Schritt 8 – Spielansicht, Pilot mit einem Aufgabenformat
**Ziel:** Der komplette Spielablauf funktioniert einmal von Anfang bis Ende.
**Aufgaben**
1. Spielbildschirm: Wiese (aus Tastenheld), Einstein, Monster (bewegt sich), Herz-Flug, Button „Prüfen".
2. Treffer: Einstein schießt, Herz trifft. Fehlschuss: Herz trifft nicht, Einstein geschockt, nach dem nächsten Treffer wieder normal.
3. Befreundet: Herz-Emoticon (Sprite) über dem Monsterkopf.
4. Abschluss: Münzen, Extramünzen bei Freundschaft. Wenn nicht vollständig richtig: Einstein sagt, dass man morgen noch einmal versuchen kann. Schlage mir die Formulierung vor.
5. Münzen an das bestehende Farm-System übergeben.
6. Kein Herzzähler und keine Anzeige fehlender Herzen.
7. Eingabefelder: Autokorrektur, Autogroßschreibung, Rechtschreibprüfung aus. OpenDyslexic-Option wirkt auf Aufgabentexte.
8. Pilot nur mit **einem** einfachen Aufgabenformat (Vorschlag: das einfachste vorhandene, bitte vorher bestätigen lassen).
9. `CREDITS.md` anlegen, sobald erstmals Tastenheld-Code/-Assets übernommen werden.

**Fertig, wenn:** Im Browser lässt sich eine Übung mit richtigen und falschen Eingaben komplett durchspielen, Münzen kommen an, der „Morgen noch einmal"-Hinweis erscheint. **Danach testet Jazz auf dem iPad (siehe Checkliste).**

---

### Schritt 9 – Alle bestehenden Aufgabenformate anbinden
**Ziel:** Jedes vorhandene Format arbeitet in der neuen Runden-Struktur.
**Formate:** Lückentext, Auswahl, Wortart/Satzglied zuordnen, Fehler im Text finden, Wörter in Reihenfolge ziehen sowie die Textüberarbeitungs-Formate (Fehler markieren und korrigieren, Sätze per Auswahl verbessern, Satzbausteine umstellen).
**Aufgaben**
1. Pro Format festlegen und mir kurz vorlegen: Eine Runde ist richtig, wenn die gesamte Eingabe richtig ist; jeder Fehler ist ein Fehlschuss. Falls ein Format das nicht sinnvoll abbilden kann: nachfragen.
2. Die bisherige Anzeige der richtigen Lösung beibehalten.
3. Ziehen und Tippen müssen auf dem iPad funktionieren.
4. Pro Format mindestens einen Test im Browser durchführen und dokumentieren.

**Fertig, wenn:** Alle Formate sind spielbar und im Editor anlegbar, Tests dokumentiert.

---

### Schritt 10 – Diktate und Merkdiktate
**Ziel:** Beide Diktatformen wie festgelegt.
**Aufgaben**
1. **Diktat (Text läuft weiter)** wie in Tastenheld: Herz pro festgelegter Zahl richtiger Eingaben, Freundschaft ab 95 %, Zusatzmünzen bei 100 % im Wiederholungsversuch.
2. **Merkdiktat:** Text einblenden, Ausblenden erst nach Bestätigung (Button oder Leertaste), danach Eingabe und Prüfen. Richtig = Herz, mit Fehler = Fehlschuss.
3. Editor-Felder für beide Typen (Text, ggf. Zahl der Eingaben pro Herz) ergänzen.
4. Gut lesbare Schrift für den Diktattext, OpenDyslexic-Option wirkt.
5. Unklarheiten beim Verhalten von Tastenheld vorher mit mir klären.

**Fertig, wenn:** Beide Diktatformen sind im Editor anlegbar und im Browser durchspielbar, Tests dokumentiert.

---

### Schritt 11 – Fallende Wörter
**Ziel:** Neues Format nach Tastenheld-Vorbild.
**Aufgaben**
1. Wortliste pro Übung im Editor.
2. Einstellungen gemäß Konzept: Tempo und weitere Parameter, **Modus ohne Zeitdruck**. Wer stellt was ein? Frage nach, falls im Konzept offen geblieben.
3. Treffer und Fehler auf Herzen/Monster abbilden wie im Konzept festgelegt.
4. Gut lesbare Schrift, OpenDyslexic-Option wirkt.
5. Test im Browser inklusive Modus ohne Zeitdruck.

**Fertig, wenn:** Das Format ist im Editor anlegbar und im Browser in beiden Modi spielbar.

---

### Schritt 12 – Gesamtprüfung und Abschluss
**Ziel:** Alles zusammen funktioniert und ist aufgeräumt.
**Aufgaben**
1. Durchgehender Test: Paket anlegen, zuweisen, als Schüler:in spielen (alle Formate), Münzen, Lernstand, Erklärungsseiten, Archiv, Kalendertag, Reset.
2. Barrierefreiheit: OpenDyslexic im Spiel, Lesbarkeit, Eingabefelder ohne Autokorrektur.
3. `CREDITS.md` und Lizenzhinweise vollständig.
4. Nicht mehr verwendete Dateien auflisten. **Löschen nur nach meiner ausdrücklichen Freigabe.**
5. Kurze Anleitung für Jazz: Wie erstelle ich eine Übung, ein Paket, setze Versuche zurück?
6. Offene Punkte und Vormerkungen für später in STATUS.md.
7. **Kein Merge, kein Deployment ohne meine Freigabe.**

**Fertig, wenn:** Test- und Aufräumbericht liegen vor und ich entschieden habe, ob gemergt wird.

---

## D. Checkliste für Jazz: Test auf dem iPad (nach Schritt 8 und in Schritt 12)

- [ ] Seite öffnen, Übung starten, mit der Tastatur eingeben, ohne dass das iPad Wörter automatisch „verbessert"
- [ ] Layout im Querformat passt, nichts ist abgeschnitten
- [ ] Richtige Runde: Herz trifft; falsche Runde: Herz trifft nicht, Einstein geschockt, danach wieder normal
- [ ] Monster bewegt sich; nach Freundschaft erscheint das Herz über dem Kopf
- [ ] Münzen kommen in der Farm an
- [ ] Nicht komplett richtig: Einstein-Hinweis „morgen nochmal" erscheint
- [ ] Zieh-Aufgaben funktionieren mit dem Finger
- [ ] OpenDyslexic-Haken wirkt auf die Aufgabentexte
- [ ] Merkdiktat: Text verschwindet erst nach Bestätigung (Leertaste und Button)
- [ ] Fallende Wörter: Tempo einstellbar, Modus ohne Zeitdruck läuft
