# Bildprompt: Einstein „schießt ein Herz“ (Schritt 7)

Entschieden von Jazz (2026-11-13): Einstein **wirft** das Herz mit ausgestrecktem Arm nach rechts (keine Waffe, kein Bogen),
**ohne Herz im Bild** (das fliegende Herz zeichnet das Spiel), **ein einziges Bild**, Prompt auf Englisch.

## 1. So sieht Einstein heute aus

Datei `src/grafik/einstein.png` (Original `assets/einstein-blatt.png`, eigenes Werk der Lehrkraft): 8 Bilder nebeneinander, je **52 × 47 Pixel**.

- **Figur:** kleines, rundlich-eckiges Steinwesen (hellgrau), kurze Arme und zwei kurze Beine. Haar wie ein grüner Blätterhelm
  mit zwei kleinen gelben Blüten, oben ein Stiel mit roter Blume.
- **Gesicht:** zwei schwarze Punktaugen mit weißem Glanzpunkt, kleiner Mund, rosa Wangen nur angedeutet.
- **Stil:** Pixel-Art, harte Kanten, **keine** Kantenglättung, keine halbdurchsichtigen Pixel, **schwarze Umrisslinie** 1 Pixel,
  einfache Schattierung mit 2 bis 3 Stufen je Farbe.
- **Perspektive:** frontal, schaut zum Betrachter. Füße stehen unten im Bild.
- **Hintergrund:** durchsichtig.
- **Farben (15 auf dem ganzen Blatt, die wichtigsten):** Stein `#bac9cc`, Stein-Schatten `#8d9ca1`, Stein-Licht `#d6e1e5`,
  Umriss `#010101`, Blätter `#59a451`, Blätter dunkel `#357845`, Blätter hell `#76c46e`, Blume rot `#bd394b` / `#cf5658`,
  Blüten gelb `#f6de43` / `#e4bc41`, Weiß `#fefefe`, Mund innen `#240000`.

## 2. Vorlagebild für Gemini

`assets/einstein-vorlage-gross.png` (880 × 408, 8-fach vergrößert, durchsichtig): links Einstein normal, rechts Einstein erschrocken.
Der Ordner `assets/` kommt nie ins Repo; das Bild ist nur zum Hochladen bei Gemini.

## 3. Prompt (bei Gemini zusammen mit dem Vorlagebild hochladen)

```
I am uploading a pixel art sprite sheet of my own character "Einstein": a small, cute grey stone creature
with a green leaf "hair" helmet, two tiny yellow blossoms in the leaves and a red flower on a stem on top.

Please draw ONE new sprite of exactly this character in exactly the same style:
- Pose: Einstein throws something to the right. His right arm (on the right side of the image) is stretched out
  straight to the right at shoulder height, the hand open as if he has just let go. The other arm swings back a little.
  His body leans slightly to the right. Happy, determined face: eyes open, small smile. Both feet stay on the ground.
- Do NOT draw a heart, a weapon, a bow, motion lines, sparkles or any other object. Only the character.
- Same view as the reference: facing the viewer (front view), not turned sideways.
- Same proportions, same colors, same 1-pixel black outline, same simple shading as the reference.
- Real pixel art: hard square pixels, no anti-aliasing, no blur, no gradients, no semi-transparent pixels.
- The character should fit in a grid of 52 pixels wide and 47 pixels high. Draw it as a large image
  where every sprite pixel is a clean square block of 8 x 8 screen pixels (416 x 376 pixels in total).
- Transparent background (PNG). No ground, no shadow, no frame, no text.
```

**Wenn das Ergebnis nicht passt**, eine dieser Nachbesserungen nachschieben:
- „Keep the exact same colors as the reference image. Use only these colors: #bac9cc, #8d9ca1, #d6e1e5, #010101, #59a451, #357845, #76c46e, #bd394b, #f6de43, #fefefe.“
- „The pixels are blurry. Make every pixel a sharp square block, no anti-aliasing.“
- „Remove the heart / the lines. Only the character.“
- „The background must be transparent, not white or checkered.“ (Ein grau-weißes Karomuster im Bild ist **kein** echter
  durchsichtiger Hintergrund. Dann bitte trotzdem speichern, ich entferne es in Schritt 8.)

## 4. Hinweise

- **Durchsichtiger Hintergrund:** Gemini liefert oft weißen Hintergrund oder ein gemaltes Karomuster. Das ist nicht schlimm:
  Ich stelle den Hintergrund beim Einbau frei.
- **Gleiche Pixelgröße:** Das Bild darf größer sein. Ich verkleinere es beim Einbau auf genau 52 × 47 Grafik-Pixel und
  setze jeden Pixel auf die nächste Farbe aus Einsteins Farben. Wichtig ist nur: klare Pixel-Blöcke, Figur ganz im Bild.
- **Gleiche Blickrichtung:** frontal wie die anderen Bilder. Der Arm zeigt nach rechts, weil das Monster im Spiel rechts steht.

## 5. So fügen Sie die fertige Datei ein

1. Bei Gemini das Bild herunterladen (PNG).
2. Umbenennen in **`einstein-schiessend.png`**.
3. Ablegen im Ordner **`C:\Users\jrkug\Projekte\wortsalat\assets\`** (neben `einstein-blatt.png`).
4. Mir Bescheid sagen. Ich schneide es zu, gleiche die Farben an und lege es per `scripts/grafik-holen.mjs`
   nach `src/grafik/einstein_schiessend.png` (Eintrag in `src/grafik/LIZENZ.md`: eigenes Werk der Lehrkraft).

**Bis dahin** zeigt das Spiel (Schritt 8) beim Treffer den **normalen Einstein** (Bild 0) als Platzhalter.

## 6. Monster-Animationen (Prüfung)

Geprüft: die 10 ausgeschnittenen Ruhe-Animationen aus `scripts/grafik-holen.mjs` und die Original-Blätter (Pixel je Einzelbild gezählt).

| Monster | Bilder | vollständig? | Hinweis |
|---|---|---|---|
| Rübchen | 4 (Reihe 1 von 3) | ja | Reihe 2 schaut nach links, Reihe 3 nach hinten |
| Schleim grün, blau, Feuer | 6 | ja | haben als einzige eine **Hurt**-Animation (5 Bilder) für Treffer |
| Gespenst | 10 | ja | einige Bilder gleich (Pause in der Animation, gewollt) |
| Spinne grün, lila, gold | 15 | ja | schaut **nach rechts** → im Spiel spiegeln |
| Maus | 13 | ja | schaut **nach rechts** → im Spiel spiegeln |
| Fledermaus | 5 | ja | **Bild 1 ist eine sitzende Haltung** → ruckt in der Schleife; nur Bilder 2–5 nutzen |

Es fehlt nichts, was den Bau blockiert. Treffer-Reaktion außer bei Schleimen: kurz wackeln (Konzept Abschnitt 11).
Fledermaus und Spiegeln werden in Schritt 8 umgesetzt (Jazz, 2026-11-13).
