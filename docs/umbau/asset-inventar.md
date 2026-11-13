# Asset-Inventar (Schritt 2, nur gelesen)

Gesichtet: `assets/` im Wortsalat-Projekt (von Git ignoriert, Pakete dürfen nie ins Repo), `src/grafik/` (im Repo, nur Einzelbilder)
und die Bilder in der TastenHeld-ZIP. Größen in Grafik-Pixeln (Breite × Höhe). „Raster“ = Größe eines Einzelbilds.
Raster ohne Klammer sind aus Bildgröße und Ansicht abgelesen; vor dem Ausschneiden in Schritt 7 nachmessen.

## 1. Monster (mit Animations-Bildern)

| Monster | Datei (Paket) | Größe | Raster, Bilder | Lizenz | Passt zum Look? |
|---|---|---|---|---|---|
| Schleim blau/grün/lila (3 Arten) | `free-slime-mobs…/PNG/Slime1–3/Idle/Slime*_Idle_full.png` | 384 × 256 | 64 × 64, 6 Bilder je Richtung, 4 Richtungen | craftpix frei | gut, niedlich |
| Schleim: Treffer, Laufen, Ende | `…/Hurt` 320 × 256, `…/Walk` 512 × 256, `…/Death` 640 × 256 | | 64 × 64, 5 / 8 / 10 Bilder | craftpix frei | |
| Ork 1–3 | `Free-Top-Down-Orc…/PNG/Orc1–3/*_idle/*_idle_full.png` | 256 × 256 | 64 × 64, 4 Bilder, 4 Richtungen; dazu hurt, walk, death | craftpix frei | eher bedrohlich, mit Schwert |
| Gespenst | `Sprout Sorry pack/Early Access/halloween/mobs/chost_spritesheet.png` | 160 × 32 | 16 × 16, etwa 10 Bilder in 2 Reihen | Sprout Lands Sorry Pack | sehr gut (Sprout-Stil) |
| Spinnen (6 Farben) | `…/halloween/mobs/lil_*_spider_spritesheet*.png` | 240 × 48 | 16 × 16, 15 Bilder in 3 Reihen | Sorry Pack | gut |
| Mäuse (schwarz, grau, weiß) | `…/halloween/mobs/little_*_mouse.png` | 208 × 64 | vermutlich 16 × 16 | Sorry Pack | gut, sehr harmlos |
| Fledermaus groß/klein | `Sorry pack/Early Access/Dungeon Pack/enemies/(small_)bat_animations.png` | 192 × 64 | vermutlich 32 × 32 bzw. 16 × 16, fliegt | Sorry Pack | gut |
| Grüner Schleim klein | `…/Dungeon Pack/enemies/small_green_slime_animations.png` | 456 × 304 | unregelmäßig, mehrere Animationen | Sorry Pack | gut, aber sehr klein |
| Frosch | `…/Plant update 2/frog/frog_spritesheet(2).png` | | | Sorry Pack | als freundliches „Monster“ möglich |
| Rübchen (chomp) | `assets/chomp_idle.png` (wieder da) | 128 × 96 | 32 × 32, 4 Bilder je Reihe, 3 Reihen (Blickrichtungen) | eigenes Werk der Lehrkraft | sehr gut |
| TastenHeld-Wuschelmonster | `assets/pixel/monster.png`, `monster-freund.png` (ZIP) | 40 × 40 | je 1 Bild, **keine** Animation | Erlaubnis Urheber | anderer Stil (Steampunk) |

Früher (bis zum Entfernen des Monster-Kampfs) nutzte Wortsalat Rübchen, Schleim und Ork als **ein** Standbild 32 × 32.
Alle Sprout- und craftpix-Monster sind von oben/schräg gezeichnet, nicht von der Seite.

## 2. Einstein-Zustände

`src/grafik/einstein.png` (eigenes Werk der Lehrkraft, Original `assets/einstein-blatt.png`): 416 × 47, **8 Bilder je 52 × 47**.

| Bild | heute benutzt als | für den Umbau |
|---|---|---|
| 0, 1 | freundlich, blinzeln | **normal** ✔ |
| 2, 7 | lob (winkt) | |
| 3 | freut sich (springt) | |
| 4 | huch (erschrocken, offener Mund) | **schockiert** ✔ (vorhanden) |
| 5, 6 | erklärt | |

**Fehlt:** „schießt“ (Einstein schießt ein Herz). Laut Arbeitsplan erzeugen wir es in Schritt 7.

## 3. Herzen

| Datei | Größe | Inhalt | Lizenz |
|---|---|---|---|
| `src/grafik/herz.png` (aus `assets/bubble emotes july update.png`, x 32, y 96) | 16 × 16 | Herz in Sprechblase (heute beim Füttern) | eigenes Werk der Lehrkraft |
| `assets/bubble emotes july update.png` | 192 × 208 | Sprechblasen-Emotes, 16 × 16 | eigenes Werk |
| `Sprout Lands - UI Pack - Premium pack/UI Sprites/Icons/special icons/Hearts.png` | 240 × 384 | viele Herzen in 3 Größen (klein, mittel, groß), voll/halb/leer, rosa und lila, mit und ohne Rand | Sprout Lands Premium |
| `…/special icons/Hearts in wood.png` | 96 × 64 | Herzen im Holzrahmen | Sprout Lands Premium |
| `…/Dialouge UI/Emotes/Teemo … emote animations sprite sheet*.png` | 160 × 480 / 416 × 1472 | animierte Sprechblasen-Emotes | Sprout Lands |

Für das **fliegende Herz**: ein volles Herz aus `Hearts.png`. Für das **Herz über dem befreundeten Monster**: `herz.png` (gibt es schon).

## 4. Wiese / Hintergrund

| Datei | Größe | Herkunft |
|---|---|---|
| **`assets/Wiese.png` (gewählt)** | 1024 × 576 | Herkunft noch offen. Achtung: ist in Wahrheit ein **WebP**-Bild mit Endung `.png`; schon vergrößert (keine ganzzahligen Grafik-Pixel). Himmel, Wolken, Hügel, zwei Büsche, Blumenwiese. Farben hellgrün/türkis. |
| TastenHeld `assets/pixel/welten/wiese.png` | 444 × 160 | TastenHeld (selbst erzeugt, Erlaubnis) |
| `src/grafik/gras.png`, `gras_deko.png` | 176 × 80, 96 × 32 | Sprout Lands (Farm-Boden) |

Die TastenHeld-Wiese ist in einem etwas anderen Pixel-Stil als Sprout Lands (feinere Farbverläufe, Windmühle). Sie wird dreifach vergrößert.
Bei 1024 px Breite passt sie mit Faktor 2 (888 px) oder gestreckt nur unscharf; ganzzahlig vergrößern heißt: Ränder oder wiederholen.

## 5. Schriften

| Schrift | Datei | Lizenz |
|---|---|---|
| Fraunces 600, Nunito 400/800 | `src/design/fonts/*.woff2` | OFL |
| OpenDyslexic Regular/Bold | `src/design/fonts/OpenDyslexic-*.woff2` | OFL |
| (TastenHeld: Jersey 15, Atkinson Hyperlegible) | nicht gebraucht | OFL |

## 6. Töne

TastenHeld hat keine. Im `Sprout Sorry pack/Audio` liegen 22 kurze Töne (`bing`, `bip`, `blup`, `boo`, `flute` …). Wortsalat
nutzt bisher keine Töne. Nur, wenn gewünscht (Frage an Jazz).

## 7. Lizenzen der Pakete (Kurzfassung)

- **Sprout Lands Basic/Premium (Cup Nooble):** verändern und nutzen erlaubt; Paket nie weitergeben; Nennung Pflicht; kein KI-Training.
- **Sprout Lands Sorry Pack:** wie oben, aber **nur nicht-kommerziell** (Schule: passt).
- **craftpix (Schleime, Orks):** https://craftpix.net/file-licenses/ ; nutzen und verändern erlaubt, Grafiken nicht als Grafiken
  weitergeben, Nennung freiwillig. War schon einmal geprüft und eingetragen (Commit 01347e6, später mit dem Monster-Kampf entfernt).
- **Humble Gift:** Paket nicht weitergeben, Nennung freiwillig.
- **TastenHeld:** keine Lizenzdatei, Erlaubnis des Urhebers laut `CLAUDE.md`.
- Regel bleibt: Nur ausgeschnittene Einzelbilder nach `src/grafik/` (per `scripts/grafik-holen.mjs`), Eintrag in `src/grafik/LIZENZ.md`.

## 8. Was fehlt

1. Einstein-Pose **„schießt“** (Schritt 7).
2. Ein Monster **von der Seite** gibt es nicht; alle sind von oben/schräg. Wir nehmen die Richtung „nach vorn/zum Betrachter“
   oder „nach links“ (zur Spielfigur hin).
3. Eine **Freund-Fassung** der Monster gibt es nicht (außer TastenHeld). Lösung laut Plan: Herz-Sprite über dem Kopf.
4. Herkunft und Lizenz von `assets/Wiese.png` stehen noch nirgends (für `src/grafik/LIZENZ.md` nötig).
