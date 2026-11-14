# UI-Umbau der Schüleransicht (Branch `ui-umbau`, ab `d0a01d2` von `uebungsumbau`)

Ziel (Jazz, 2026-11-14): Die Schüleransicht soll wie ein zusammenhängendes Pixelspiel aussehen.
Alle Pixel-Spielinhalte in der Sprout-Lands-Palette.

## Entscheidungen (Jazz, 2026-11-14)

- **Buch:** Sammelalbum und Shop als Buch mit umblätterbaren Seiten (gekauftes Bild „Pixel Book Animation“, umgefärbt).
  Dasselbe Buch in zwei Einbandfarben: Sammelalbum Holzbraun, Shop Grün. Seiten im hellen Ton.
- Das Buch **klappt beim Öffnen der Seite von selbst auf**, danach blättert man. Bei „Bewegung reduzieren“ ohne Bewegung.
- **Pfeile:** weiter in der rechten unteren Ecke, zurück in der linken unteren Ecke (erst ab Seite 2).
- **Lesezeichen** schauen rechts aus dem Buch, **nur mit Bild, ohne Text** (Name für Vorlesehilfen).
  Sammelalbum: Pflanzen, Tiere, Deko, Monster. Shop: Samen, Tiere, Deko, Verkaufen. Die Figur-Auswahl bleibt außerhalb.
- **Shop-Doppelseite:** links Kästchen mit Artikeln, rechts der angetippte Artikel groß mit Name, Preis und „Kaufen“.
- **Sticker:** aus den vorhandenen Bildern per Skript, im Stil der Sprout-Lands-Emojis (farbiger Umriss, heller Kleberand,
  leicht schief eingeklebt).
- **Sammelalbum ohne Fragezeichen:** Fehlendes ist eine blasse leere Klebestelle ohne Bild und Namen.
- **Monster-Sticker**, sobald man sich mit dem Monster **angefreundet** hat.
- **Fragezeichen nur im Shop:** das lila Fragezeichen aus dem Emoji-Blatt, darunter „Kommt, wenn du noch N Münzen verdienst.“
- **Lernseiten** (Übungen, Aufgaben, Lernweg, Hilfe): Rahmen, Knöpfe, Schilder und Menüleiste im Pixel-Look,
  Aufgabentexte ruhig auf hellem Papier in Nunito. Keine Pixel-Schrift.
- **Einstein** auf die Sprout-Lands-Palette umfärben, vorher Vorher-Nachher-Bild zeigen.
- **Dunkler Modus:** Das Buch bleibt immer hell, nur der Hintergrund wird dunkel.
- **Reihenfolge:** 1. Sammelalbum als Muster, 2. Shop, 3. übrige Seiten. Nach jedem Schritt testet Jazz am iPad.

## Stand

- [x] **Schritt 1: Sammelalbum als Buch** (`src/gemeinsam/Buch.tsx`, `src/schueler/Album.tsx`, `src/lib/album.ts`).
  Grafiken aus `scripts/grafik-holen.mjs`: `buch.png` (12 Bilder: zu, aufklappen, offen, vor, zurück), `lesezeichen.png`,
  `sticker.png` (38 Sticker, Nummern in `STICKER_NUMMER`), `reiter_*.png`, `emoji_frage.png`.
  Maße in Buch-Pixeln (`--bp`, 3-fach, unter 900 px Breite 2-fach).
  Von Claude entschieden, bitte prüfen: Sticker der Pflanzen zeigen das Geerntete (wie die Emojis), nicht die Pflanze im Beet.
  Das Holzschild „Mein Sammelalbum“ ist entfallen (sonst passt das Buch bei 1024 × 768 nicht ohne Scrollen);
  der Titel bleibt für Vorlesehilfen. Zurück zur Farm: Haus-Knopf auf der Ecke oben links.
  Lesezeichen in vier Palettenfarben (rot, blau, grün, gelb) sind reine Verzierung, keine Bedeutung.
- [x] **Korrekturen von Jazz (2026-11-14):** Stickervariante „farbiger Umriss + Kleberand“. Sticker in der Pixelgröße des Buchs
  (nicht mehr doppelt groß), je Seite 3 × 3, **ohne Namen** (Name nur für Vorlesehilfen). Lesezeichen kleiner, darauf kleine
  Spielbilder statt Emojis. Offenes Buch **flach** (letztes Bild der Vorlage). Lizenz eingetragen (heondu, itch.io).
- [x] **Farm als Spiel-Oberfläche (Jazz 2026-11-14):** keine Karte mehr um die Farm. Leiste über dem Spielfenster: links Buch-Knopf
  (Sammelalbum), rechts Zahnrad. Zahnrad öffnet „Farm einrichten“: Figur wählen, Deko ein- und ausblenden (Ausblenden merkt sich
  nur das Gerät, `localStorage`). Spielfenster füllt das iPad in der Breite (3-fach = 1008 px, dadurch 720 px hoch: man scrollt ein Stück).
  Wasser außerhalb des Rahmens abgeschnitten, Rahmen rutscht nicht mehr über die Menüleiste. Vorrat als Tafel unter der Farm.
  Offen (Frage an Jazz): Soll die Farm ganz oben stehen, also über Einsteins Begrüßung und „Dein nächster Schritt“?
- [ ] **Migration `album_monster` ist geschrieben, aber noch nicht eingespielt** (`npm run db:push`, danach `npm run test:datenbank`;
  Test in Block 17.4 und 17.6 ergänzt). Bis dahin sind alle Monster-Klebestellen leer.
  Achtung: Nach dem Einspielen kennt die Datenbank eine Migration, die es auf `uebungsumbau` noch nicht gibt.
  `db push` von dort meldet das dann, bis `ui-umbau` zusammengeführt ist.
- [ ] Schritt 2: Shop als Buch (grüner Einband, Fragezeichen-Sticker).
- [ ] Schritt 3: Übungen, Aufgaben, Lernweg, Hilfe, Menüleiste. Einstein umfärben (Vorher-Nachher).

## Arbeitsordner

`ui-umbau` ist in einem eigenen Ordner ausgecheckt: `C:\Users\jrkug\Projekte\wortsalat-ui` (git worktree), damit die
Sitzungen auf `uebungsumbau` im Hauptordner ungestört bleiben. `node_modules` und `assets` sind dort Verknüpfungen
auf den Hauptordner. Entwicklungsserver: `npm run dev -- --port 5175` in diesem Ordner.
