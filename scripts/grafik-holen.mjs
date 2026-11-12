// Schneidet benannte Einzelbilder aus den gekauften Grafik-Paketen (nur lokal in assets/) nach src/grafik/
// und schreibt die Liste src/grafik/index.ts (Name → Datei und Größe).
// Aufruf: node scripts/grafik-holen.mjs
// Vorher die ZIP-Dateien nach assets/entpackt/ auspacken. Ins Repo kommen nur die ausgeschnittenen Bilder,
// nie die Pakete selbst (Lizenz verbietet Weitergabe).
import { createRequire } from 'node:module'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'

// pngjs kommt mit qrcode mit; deshalb keine eigene Bibliothek nötig.
const { PNG } = createRequire(import.meta.url)('pngjs')

const UI = 'assets/entpackt/Sprout Lands - UI Pack - Premium pack/UI Sprites/'
const SPRITES = 'assets/entpackt/Sprout Lands - Sprites - premium pack/'
const UI_BASIS = 'assets/entpackt/Sprout Lands - UI Pack - Basic pack/Sprite sheets/'

// Was wir benutzen. x, y, breite, hoehe = Ausschnitt in Pixeln (ohne Angabe: ganzes Bild).
// bildBreite/bildHoehe: Größe eines Einzelbilds, wenn der Ausschnitt mehrere Bilder (Spritesheet) enthält.
const BILDER = [
  { name: 'muenze', datei: UI + 'Icons/special icons/coins.png', x: 36, y: 20, breite: 24, hoehe: 24 },
  // Einstein: eigene Zeichnung der Lehrkraft (assets/1794384222202.jpg), am 2026-11-11 auf ihr Pixelraster
  // (6,715 Bildpunkte je Pixel) verkleinert, Hintergrund entfernt. Bilder: freundlich, blinzelt, lob, freut sich, huch, erklärt,
  // erklärt mit Augen zu, lob mit geneigtem Arm (Winken).
  { name: 'einstein', datei: 'assets/einstein-blatt.png', bildBreite: 52, bildHoehe: 47 }, // 8 Bilder
  // Farm (Phase 8). Nummern der Einzelbilder stehen in src/lib/shop.ts.
  // Ohne Mais (Zeilen 0–1, doppelt hoch): Samentüte (Spalte 0) und Geerntetes (Spalte 1), Zeilen = Sorten wie bei „pflanzen“
  { name: 'saatgut', datei: SPRITES + 'Objects/Items/farming-Plants-items.png', x: 0, y: 32, breite: 32, hoehe: 208, bildBreite: 16, bildHoehe: 16 },
  // Pflanzen: je Zeile eine Sorte, Spalten 0–3 = Wachstumsstufen
  { name: 'pflanzen', datei: SPRITES + 'Objects/Farming Plants.png', x: 0, y: 32, breite: 64, hoehe: 208, bildBreite: 16, bildHoehe: 16 },
  // Deko: nur die benutzten Einzelbilder
  ...[
    ['deko_busch', 3, 2], ['deko_blume_gelb', 2, 3], ['deko_pilz', 2, 0], ['deko_stein', 5, 1], ['deko_blume_lila', 2, 4],
    ['deko_pilzhaus', 6, 0], ['deko_katze_rosa', 7, 3], ['deko_katze_blau', 7, 4],
  ].map(([name, sp, ze]) => ({ name, datei: SPRITES + 'Objects/Mushrooms, Flowers, Stones.png', x: sp * 16, y: ze * 16, breite: 16, hoehe: 16 })),
  // Ackerboden und Gras als „Blob“-Kachelsatz (11 × 5 Teile je Nachbarschaft, Zuordnung in src/lib/landschaft.ts)
  { name: 'acker', datei: SPRITES + 'Tilesets/ground tiles/New tiles/Darker_Soil_Ground_Tiles.png', x: 0, y: 0, breite: 176, hoehe: 80, bildBreite: 16, bildHoehe: 16 },
  { name: 'gras', datei: SPRITES + 'Tilesets/ground tiles/New tiles/Grass_tiles_v2.png', x: 0, y: 0, breite: 176, hoehe: 80, bildBreite: 16, bildHoehe: 16 },
  // Scheune von oben (offenes Dach wie im Titelbild): Wand-Rahmen (9 Teile), offene Tür, Heu, Wassertrog
  { name: 'wand', datei: SPRITES + 'Tilesets/Building parts/Wooden_House_Walls_Tilset.png', x: 0, y: 0, breite: 48, hoehe: 48, bildBreite: 16, bildHoehe: 16 },
  { name: 'tuer_offen', datei: SPRITES + 'Tilesets/Building parts/door animation sprites.png', x: 204, y: 16, breite: 22, hoehe: 16 },
  { name: 'heu', datei: SPRITES + 'Tilesets/Building parts/Animal Structures/Barn structures.png', x: 0, y: 32, breite: 32, hoehe: 16 },
  { name: 'heu_lose', datei: SPRITES + 'Tilesets/Building parts/Animal Structures/Barn structures.png', x: 16, y: 48, breite: 16, hoehe: 16 },
  { name: 'trog', datei: SPRITES + 'Tilesets/Building parts/Animal Structures/Water tray.png', x: 0, y: 0, breite: 32, hoehe: 16 },
  // Herz-Sprechblase: eigenes Werk der Lehrkraft (bubble emotes)
  { name: 'herz', datei: 'assets/bubble emotes july update.png', x: 32, y: 96, breite: 16, hoehe: 16 },
  // Menü (UI Pack Basic): Papierrahmen, Platz für einen Gegenstand, Schließen-Knopf
  { name: 'menue_rahmen', datei: UI_BASIS + 'Setting menu.png', x: 139, y: 12, breite: 106, hoehe: 122 },
  { name: 'menue_platz', datei: UI_BASIS + 'Sprite sheet for Basic Pack.png', x: 11, y: 59, breite: 26, hoehe: 28 },
  { name: 'knopf_x', datei: UI_BASIS + 'Sprite sheet for Basic Pack.png', x: 839, y: 5, breite: 18, hoehe: 20 },
  // Landschaft der Farm: Wasser, Grasinsel (9 Teile: Ecken, Ränder, Mitte), Grasdeko, Bäume, Stall, Figur
  { name: 'wasser', datei: SPRITES + 'Tilesets/ground tiles/Water.png', x: 0, y: 0, breite: 16, hoehe: 16 },
  { name: 'gras_deko', datei: SPRITES + 'Tilesets/ground tiles/New tiles/simpel versions/Grass_tiles_v2_simple.png', x: 0, y: 48, breite: 96, hoehe: 32, bildBreite: 16, bildHoehe: 16 },
  { name: 'baum', datei: SPRITES + 'Objects/Trees, stumps and bushes.png', x: 16, y: 0, breite: 32, hoehe: 32 },
  { name: 'baum_klein', datei: SPRITES + 'Objects/Trees, stumps and bushes.png', x: 0, y: 0, breite: 16, hoehe: 32 },
  { name: 'stall', datei: SPRITES + 'Tilesets/Building parts/Animal Structures/Chikcen_Houses.png', x: 48, y: 80, breite: 48, hoehe: 48 },
  // Spielfigur: Zeilen = runter, hoch, links, rechts; je 4 Laufbilder
  { name: 'figur', datei: SPRITES + 'Characters/Basic Charakter Spritesheet.png', bildBreite: 48, bildHoehe: 48 },
  { name: 'brunnen', datei: SPRITES + 'Objects/Water well.png' },
  { name: 'huhn', datei: SPRITES + 'Animals/Chicken/chicken default.png', x: 0, y: 0, breite: 64, hoehe: 16, bildBreite: 16, bildHoehe: 16 },
  { name: 'kuh', datei: SPRITES + 'Animals/Cow/Light cow animations.png', x: 0, y: 0, breite: 96, hoehe: 32, bildBreite: 32, bildHoehe: 32 },
  { name: 'ei', datei: SPRITES + 'Objects/Items/egg-items.png', x: 0, y: 0, breite: 16, hoehe: 16 },
  { name: 'milch', datei: SPRITES + 'Objects/Items/milk-items.png', x: 0, y: 16, breite: 16, hoehe: 16 },
]

mkdirSync('src/grafik', { recursive: true })
const liste = []
for (const b of BILDER) {
  const quelle = PNG.sync.read(readFileSync(b.datei))
  const x = b.x ?? 0, y = b.y ?? 0
  const breite = b.breite ?? quelle.width, hoehe = b.hoehe ?? quelle.height
  if (x + breite > quelle.width || y + hoehe > quelle.height) throw new Error(`${b.name}: Ausschnitt liegt außerhalb des Bildes`)
  const ziel = new PNG({ width: breite, height: hoehe })
  PNG.bitblt(quelle, ziel, x, y, breite, hoehe, 0, 0)
  writeFileSync(`src/grafik/${b.name}.png`, PNG.sync.write(ziel))
  liste.push({ name: b.name, breite, hoehe, bildBreite: b.bildBreite ?? breite, bildHoehe: b.bildHoehe ?? hoehe })
  console.log(`${b.name}.png  ${breite}×${hoehe}`)
}

const zeilen = liste.map((g) => `import ${g.name} from './${g.name}.png'`)
zeilen.push('', 'export const GRAFIK = {')
for (const g of liste)
  zeilen.push(`  ${g.name}: { url: ${g.name}, breite: ${g.breite}, hoehe: ${g.hoehe}, bildBreite: ${g.bildBreite}, bildHoehe: ${g.bildHoehe} },`)
zeilen.push('} as const', '')
writeFileSync(
  'src/grafik/index.ts',
  '// Automatisch erzeugt von scripts/grafik-holen.mjs – nicht von Hand ändern.\n' + zeilen.join('\n'),
)
