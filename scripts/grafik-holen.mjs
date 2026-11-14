// Schneidet benannte Einzelbilder aus den gekauften Grafik-Paketen (nur lokal in assets/) nach src/grafik/
// und schreibt die Liste src/grafik/index.ts (Name → Datei und Größe).
// Aufruf: node scripts/grafik-holen.mjs
// Vorher die ZIP-Dateien nach assets/entpackt/ auspacken. Ins Repo kommen nur die ausgeschnittenen Bilder,
// nie die Pakete selbst (Lizenz verbietet Weitergabe).
import { createRequire } from 'node:module'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'

// pngjs kommt mit qrcode mit; deshalb keine eigene Bibliothek nötig.
const { PNG } = createRequire(import.meta.url)('pngjs')

// Sprout-Lands-Farbpalette (97 Farben, aus dem Premium-Paket). Jazz 2026-11-13: Grafiken, die nicht aus Sprout Lands stammen
// (blaue Figur, Schleime, Rübchen), bekommen nur Farben aus dieser Palette, damit alles zusammenpasst.
const PALETTE = (() => {
  const p = PNG.sync.read(readFileSync('assets/entpackt/Sprout Lands - Sprites - premium pack/Sprout Lands color pallet/Sprout Lands defautlt palette.png'))
  const farben = new Map()
  for (let i = 0; i < p.data.length; i += 4) if (p.data[i + 3] > 0) farben.set(p.data.readUIntBE(i, 3), [p.data[i], p.data[i + 1], p.data[i + 2]])
  return [...farben.values()]
})()
// Abstand nach „redmean“ (berücksichtigt, dass das Auge Grün stärker sieht als Blau)
function farbAbstand(a, b) {
  const r = (a[0] + b[0]) / 2, dr = a[0] - b[0], dg = a[1] - b[1], db = a[2] - b[2]
  return (2 + r / 256) * dr * dr + 4 * dg * dg + (2 + (255 - r) / 256) * db * db
}
const naechsteFarbe = (f) => PALETTE.reduce((m, p) => (farbAbstand(p, f) < farbAbstand(m, f) ? p : m))
/** Jeden sichtbaren Bildpunkt auf die nächste Palettenfarbe setzen (Durchsichtigkeit bleibt). */
function aufPalette(bild) {
  for (let i = 0; i < bild.data.length; i += 4) if (bild.data[i + 3] > 0) bild.data.set(naechsteFarbe([bild.data[i], bild.data[i + 1], bild.data[i + 2]]), i)
}

const UI = 'assets/entpackt/Sprout Lands - UI Pack - Premium pack/UI Sprites/'
const SPRITES = 'assets/entpackt/Sprout Lands - Sprites - premium pack/'
const UI_BASIS = 'assets/entpackt/Sprout Lands - UI Pack - Basic pack/Sprite sheets/'
const MOBS = 'assets/entpackt/Sprout Sorry pack/Early Access/halloween/mobs/'
const SCHLEIM = 'assets/entpackt/free-slime-mobs-pixel-art-top-down-sprite-pack/PNG/'
const EMOJI = 'assets/entpackt/Sprout Lands - UI Pack - Basic pack/emojis-free/Emoji_Spritesheet_Free.png'

// Was wir benutzen. x, y, breite, hoehe = Ausschnitt in Pixeln (ohne Angabe: ganzes Bild).
// bildBreite/bildHoehe: Größe eines Einzelbilds, wenn der Ausschnitt mehrere Bilder (Spritesheet) enthält.
const BILDER = [
  { name: 'muenze', datei: UI + 'Icons/special icons/coins.png', x: 36, y: 20, breite: 24, hoehe: 24 },
  // Einstein: eigene Zeichnung der Lehrkraft (assets/1794384222202.jpg), am 2026-11-11 auf ihr Pixelraster
  // (6,715 Bildpunkte je Pixel) verkleinert, Hintergrund entfernt. Bilder: freundlich, blinzelt, lob, freut sich, huch, erklärt,
  // erklärt mit Augen zu, lob mit geneigtem Arm (Winken).
  // Jazz 2026-11-14: Einstein in den Farben der Sprout-Lands-Palette (Vorher-Nachher-Bild gezeigt und freigegeben)
  { name: 'einstein', datei: 'assets/einstein-blatt.png', bildBreite: 52, bildHoehe: 47, palette: true }, // 8 Bilder
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
  { name: 'gras', datei: SPRITES + 'Tilesets/ground tiles/New tiles/Grass_tiles_v2.png', x: 0, y: 0, breite: 176, hoehe: 80, bildBreite: 16, bildHoehe: 16 },
  // Scheune von oben (offenes Dach wie im Titelbild): Wand-Rahmen (9 Teile), offene Tür, Heu, Wassertrog
  { name: 'wand', datei: SPRITES + 'Tilesets/Building parts/Wooden_House_Walls_Tilset.png', x: 0, y: 0, breite: 48, hoehe: 48, bildBreite: 16, bildHoehe: 16 },
  { name: 'heu', datei: SPRITES + 'Tilesets/Building parts/Animal Structures/Barn structures.png', x: 0, y: 32, breite: 32, hoehe: 16 },
  { name: 'trog', datei: SPRITES + 'Tilesets/Building parts/Animal Structures/Water tray.png', x: 0, y: 0, breite: 32, hoehe: 16 },
  // Herz-Sprechblase: eigenes Werk der Lehrkraft (bubble emotes)
  // Sprechblase der Figur auf der Farm (Dialouge UI, „dialog box“): 30 × 28, Spitze links unten
  { name: 'dialog_blase', datei: UI + 'Dialouge UI/dialog box.png', x: 7, y: 11, breite: 30, hoehe: 28 },
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
  // Spielfigur (Lehrkraft 2026-11-12: „test character“ aus dem Sprout Sorry pack): Spalten = 8 Richtungen (hoch, rechts oben, rechts,
  // rechts unten, runter, links unten, links, links oben), Zeilen = Laufbild 1, Stehen, Laufbild 2
  { name: 'figur', datei: 'assets/entpackt/Sprout Sorry pack/Tests/free_character_spritesheet_by-cupnooble.png', bildBreite: 16, bildHoehe: 32 },
  { name: 'brunnen', datei: SPRITES + 'Objects/Water well.png' },
  { name: 'huhn', datei: SPRITES + 'Animals/Chicken/chicken default.png', x: 0, y: 0, breite: 128, hoehe: 48, bildBreite: 16, bildHoehe: 16 },
  { name: 'kuh', datei: SPRITES + 'Animals/Cow/Light cow animations.png', x: 0, y: 0, breite: 256, hoehe: 64, bildBreite: 32, bildHoehe: 32 },
  // Erzeugnisse in drei Güten (je nach Futter): Ei, rosa Ei, blaues Ei; Milch, Erdbeermilch, Blaubeermilch
  { name: 'ei', datei: SPRITES + 'Objects/Items/egg-items.png', x: 0, y: 0, breite: 16, hoehe: 16 },
  { name: 'ei_rosa', datei: SPRITES + 'Objects/Items/egg-items.png', x: 32, y: 0, breite: 16, hoehe: 16 },
  { name: 'ei_blau', datei: SPRITES + 'Objects/Items/egg-items.png', x: 64, y: 0, breite: 16, hoehe: 16 },
  { name: 'milch', datei: SPRITES + 'Objects/Items/milk-items.png', x: 0, y: 16, breite: 16, hoehe: 16 },
  { name: 'milch_erdbeer', datei: SPRITES + 'Objects/Items/milk-items.png', x: 0, y: 112, breite: 16, hoehe: 16 },
  { name: 'milch_blaubeer', datei: SPRITES + 'Objects/Items/milk-items.png', x: 0, y: 80, breite: 16, hoehe: 16 },
  // Obstbäume (Lehrkraft 2026-11-12): je 48 × 48, Zeile 0 im Wind wiegen (6 Bilder), Zeile 1 Früchte fallen (12 Bilder);
  // ohne Früchte (nach der Ernte) dieselbe Bewegung aus dem Blatt ohne Obst
  { name: 'baum_orange', datei: SPRITES + 'Objects/Tree animations/tree_orange_sprites.png', x: 0, y: 0, breite: 576, hoehe: 192, bildBreite: 48, bildHoehe: 48 },
  { name: 'baum_pfirsich', datei: SPRITES + 'Objects/Tree animations/tree_peach_sprites.png', x: 0, y: 0, breite: 576, hoehe: 192, bildBreite: 48, bildHoehe: 48 },
  { name: 'baum_birne', datei: SPRITES + 'Objects/Tree animations/tree_pear_sprites.png', x: 0, y: 0, breite: 576, hoehe: 192, bildBreite: 48, bildHoehe: 48 },
  { name: 'baum_ohne_obst', datei: SPRITES + 'Objects/Tree animations/tree_sprites.png', x: 0, y: 0, breite: 48, hoehe: 48, bildBreite: 48, bildHoehe: 48 },
  // Früchte: 0 Apfel, 1 Orange, 2 Birne, 3 Pfirsich
  { name: 'fruechte', datei: SPRITES + 'Objects/Items/fruit-n-berries-items.png', x: 0, y: 0, breite: 64, hoehe: 16, bildBreite: 16, bildHoehe: 16 },
  // Boot (Deko), am Ufer festgebunden, schaukelt im Wasser (2 Bilder)
  { name: 'deko_boot', datei: SPRITES + 'Objects/Boats.png', x: 0, y: 0, breite: 96, hoehe: 32, bildBreite: 48, bildHoehe: 32 },
  // Monster für die Übungen (Übungsumbau Schritt 6): je die Ruhe-Animation mit Blick nach vorn, eine Zeile.
  // Rübchen: eigenes Werk der Lehrkraft; Schleime: craftpix (64 × 64, oben/unten leeren Rand abgeschnitten); Rest: Sprout Sorry Pack.
  { name: 'monster_ruebchen', datei: 'assets/chomp_idle.png', x: 0, y: 0, breite: 128, hoehe: 32, bildBreite: 32, bildHoehe: 32, palette: true },
  ...[['gruen', 1], ['blau', 2], ['feuer', 3]].map(([farbe, n]) => ({
    name: `monster_schleim_${farbe}`, datei: `${SCHLEIM}Slime${n}/Idle/Slime${n}_Idle_full.png`,
    x: 0, y: 12, breite: 384, hoehe: 32, bildBreite: 64, bildHoehe: 32, palette: true,
  })),
  { name: 'monster_gespenst', datei: MOBS + 'chost_spritesheet.png', x: 0, y: 0, breite: 160, hoehe: 16, bildBreite: 16, bildHoehe: 16, spiegeln: true },
  ...['green', 'purple', 'golden'].map((farbe) => ({
    name: `monster_spinne_${{ green: 'gruen', purple: 'lila', golden: 'gold' }[farbe]}`, datei: `${MOBS}lil_${farbe}_spider_spritesheet.png`,
    x: 0, y: 0, breite: 240, hoehe: 16, bildBreite: 16, bildHoehe: 16, spiegeln: true,
  })),
  // Übungsumbau Schritt 8: Spielszene. Wiese = unterer Teil von assets/orig.png (craftpix, Nature Landscapes),
  // fliegendes Herz = mittleres volles Herz aus Sprout Lands UI Premium (Hearts.png). Fledermaus ohne das sitzende erste Bild.
  // Jazz 2026-11-14: Wiese in den Farben der Sprout-Lands-Palette, flacher (68 Zeilen), damit Rahmen und Runde ohne Scrollen passen
  { name: 'spiel_wiese', datei: 'assets/orig.png', x: 0, y: 204, breite: 576, hoehe: 68, palette: true },
  // Spielfenster (Jazz 2026-11-14, Vorschlag D): Holzrahmen mit Pfosten aus dem UI Pack Premium, als border-image (Ränder 16/17)
  { name: 'rahmen_spiel', datei: UI + 'ALL UI ASSETS on one sheet.png', x: 587, y: 12, breite: 58, hoehe: 57 },
  // helle Tafel (Settings-Menü ohne Schrift) für Shop und Sammelalbum, als border-image (Rand 5)
  { name: 'tafel', datei: UI + 'Other UI sprites/Setting menu.png', x: 139, y: 12, breite: 106, hoehe: 122 },
  { name: 'herz_flug', datei: UI + 'Icons/special icons/Hearts.png', x: 58, y: 9, breite: 13, hoehe: 11 },
  { name: 'monster_maus', datei: MOBS + 'little_grey_mouse.png', x: 0, y: 16, breite: 208, hoehe: 16, bildBreite: 16, bildHoehe: 16, spiegeln: true },
  // Emojis (UI Pack Basic, emojis-free, Zellen 32 × 32): Bilder auf den Lesezeichen im Buch und Fragezeichen im Shop (Jazz 2026-11-14)
  ...[['emoji_frage', 3, 7]]
    .map(([name, sp, ze]) => ({ name, datei: EMOJI, x: sp * 32, y: ze * 32, breite: 32, hoehe: 32 })),
  // Schiebeschalter für den dunklen Modus (UI Settings Buttons): Bahn aus (dunkel) und an (grün), dazu der helle Knopf, der hin und her gleitet (Jazz 2026-11-14)
  { name: 'schalter_bahn_aus', datei: UI + 'Other UI sprites/UI Settings Buttons.png', x: 2, y: 121, breite: 28, hoehe: 14 },
  { name: 'schalter_bahn_an', datei: UI + 'Other UI sprites/UI Settings Buttons.png', x: 34, y: 121, breite: 28, hoehe: 14 },
  { name: 'schalter_knopf', datei: UI + 'Other UI sprites/UI Settings Buttons.png', x: 7, y: 86, breite: 18, hoehe: 19 },
  // kleiner Holzrahmen um die Pflanzen-Symbole im Lernweg (Character Backdrop-frame a3, nur das Quadrat), als border-image (Rand 5)
  { name: 'symbol_rahmen', datei: UI + 'Dialouge UI/Character Backdrop-frame/backdrops_a3.png', x: 11, y: 11, breite: 26, hoehe: 26 },
  { name: 'monster_fledermaus', datei: 'assets/entpackt/Sprout Sorry pack/Early Access/Dungeon Pack/enemies/bat_animations.png', x: 32, y: 0, breite: 128, hoehe: 32, bildBreite: 32, bildHoehe: 32 },
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
  // spiegeln: jedes Einzelbild waagerecht umdrehen (Monster schauen im Original nach rechts, sollen zur Figur links schauen; Jazz, Schritt 8)
  if (b.palette) aufPalette(ziel)
  if (b.spiegeln) {
    const bw = b.bildBreite ?? breite
    const kopie = Buffer.from(ziel.data)
    for (let yy = 0; yy < hoehe; yy++)
      for (let xx = 0; xx < breite; xx++) {
        const links = xx - (xx % bw)
        const von = (yy * breite + links + bw - 1 - (xx % bw)) * 4
        kopie.copy(ziel.data, (yy * breite + xx) * 4, von, von + 4)
      }
  }
  writeFileSync(`src/grafik/${b.name}.png`, PNG.sync.write(ziel))
  liste.push({ name: b.name, breite, hoehe, bildBreite: b.bildBreite ?? breite, bildHoehe: b.bildHoehe ?? hoehe })
  console.log(`${b.name}.png  ${breite}×${hoehe}`)
}

// Verkleinert (nächster Bildpunkt): Feld aus Soil_Ground_Tile_single (47 × 46) auf 14 × 14, damit zwischen Feldern
// (je eine Kachel, 16 × 16) ein kleiner Abstand bleibt (Lehrkraft 2026-11-12)
const KLEINER = [{ name: 'feld', datei: 'assets/Soil_Ground_Tile_single.png', breite: 14, hoehe: 14 }]
for (const n of KLEINER) {
  const q = PNG.sync.read(readFileSync(n.datei))
  const ziel = new PNG({ width: n.breite, height: n.hoehe })
  for (let y = 0; y < n.hoehe; y++)
    for (let x = 0; x < n.breite; x++) {
      const sx = Math.min(q.width - 1, Math.floor(((x + 0.5) * q.width) / n.breite))
      const sy = Math.min(q.height - 1, Math.floor(((y + 0.5) * q.height) / n.hoehe))
      for (let c = 0; c < 4; c++) ziel.data[(y * n.breite + x) * 4 + c] = q.data[(sy * q.width + sx) * 4 + c]
    }
  writeFileSync(`src/grafik/${n.name}.png`, PNG.sync.write(ziel))
  liste.push({ name: n.name, breite: n.breite, hoehe: n.hoehe, bildBreite: n.breite, bildHoehe: n.hoehe })
  console.log(`${n.name}.png  ${n.breite}×${n.hoehe} (verkleinert)`)
}

// Spielfigur „Blau“ (Jazz, 2026-11-13, Variante 2): die Sprout-Lands-Figur (figur.png) umgefärbt, Haare blau, Shirt lila,
// nur Farben aus der Sprout-Lands-Palette. (Die vorher aus „assets/Female character.png“ zurückgerechnete Fassung ist in der Git-Geschichte.)
{
  const q = PNG.sync.read(readFileSync('assets/entpackt/Sprout Sorry pack/Tests/free_character_spritesheet_by-cupnooble.png'))
  const umfaerben = {
    0x645552: 0x4a588e, 0x705f5b: 0x577297, 0x7b6762: 0x658ca1, 0x8c7369: 0x7ba6b4, 0x9d866f: 0x8cbfc2, // Haare
    0x78a158: 0x694a87, 0x8db15d: 0x7b568c, 0xa4c263: 0x90689f, 0xc0d470: 0xa77bb3, 0xd2e077: 0xc89dd1, // Shirt
  }
  for (let i = 0; i < q.data.length; i += 4) if (q.data[i + 3] > 0 && umfaerben[q.data.readUIntBE(i, 3)]) q.data.writeUIntBE(umfaerben[q.data.readUIntBE(i, 3)], i, 3)
  writeFileSync('src/grafik/figur_blau.png', PNG.sync.write(q))
  liste.push({ name: 'figur_blau', breite: q.width, hoehe: q.height, bildBreite: 16, bildHoehe: 32 })
  console.log(`figur_blau.png  ${q.width}×${q.height} (umgefärbt)`)
}

// Spielfigur „Katze“ (Jazz, 2026-11-13): Basic Charakter aus Sprout Lands (48 × 48, Reihen runter/hoch/links/rechts, Spalten 0–1 stehen,
// 2–3 laufen). Umgebaut auf den Aufbau von figur.png (8 Richtungen × Zeilen Laufbild 1 / Stehen / Laufbild 2, je 16 × 32),
// Ausschnitt x 16–31, y 0–31 (Füße unten wie bei den anderen Figuren). Schrägen nehmen die Seitenansicht.
{
  const q = PNG.sync.read(readFileSync(SPRITES + 'Characters/Basic Charakter Spritesheet.png'))
  const reiheFuer = [1, 3, 3, 3, 0, 2, 2, 2] // hoch, rechts oben, rechts, rechts unten, runter, links unten, links, links oben
  const spalteFuer = [2, 0, 3] // Laufbild 1, Stehen, Laufbild 2
  const ziel = new PNG({ width: 128, height: 96 })
  ziel.data.fill(0)
  reiheFuer.forEach((r, richtung) => spalteFuer.forEach((c, zeile) => PNG.bitblt(q, ziel, c * 48 + 16, r * 48, 16, 32, richtung * 16, zeile * 32)))
  writeFileSync('src/grafik/figur_katze.png', PNG.sync.write(ziel))
  liste.push({ name: 'figur_katze', breite: 128, hoehe: 96, bildBreite: 16, bildHoehe: 32 })
  console.log('figur_katze.png  128×96 (umgebaut)')
}

// ---------- Buch für Sammelalbum und Shop (Jazz 2026-11-14): „Pixel Book Animation“ (gekauft), auf die Sprout-Lands-Palette umgefärbt.
// Ein Streifen mit 12 Bildern (je 248 × 216): 0 zu, 1–2 klappt auf, 3 offen (flach, letztes Bild der Vorlage; Jazz), 4–6 Seite blättert nach links, 7 offen,
// 8–10 Seite blättert zurück, 11 offen. Das offene Buch liegt im Bild bei x 2–245, y 49–213 (Maße in src/design/bausteine.css).
{
  const q = PNG.sync.read(readFileSync('assets/entpackt/Pixel Book Animation/Book_Sheet.png'))
  const B = 248, H = 216, folge = [0, 1, 2, 14, 3, 4, 5, 14, 5, 4, 3, 14]
  const ziel = new PNG({ width: B * folge.length, height: H })
  ziel.data.fill(0)
  folge.forEach((n, i) => PNG.bitblt(q, ziel, (n % 4) * 256 + 4, Math.floor(n / 4) * 256 + 20, B, H, i * B, 0))
  // Farben von Hand zugeordnet (die nächste Palettenfarbe machte den Einband grau und die Seiten rosa):
  // Einband in den Holztönen des Spielfenster-Rahmens, Seiten heller als die Tafel, Ecken gold.
  const farben = {
    0x663931: 0xaa7959, 0xa1786a: 0xc49a6c, 0xb8958a: 0xdcb98a, 0x5b2b2b: 0x90625d, 0x4f1c24: 0x795e53, 0x3d0c19: 0x6b4b5b, 0x57320d: 0x6b4b5b, // Einband
    0xecddc0: 0xf3e5c2, 0xe7d5b4: 0xe8cfa6, 0xe1cda8: 0xe8cfa6, 0xd6c39e: 0xdcb98a, 0xcab894: 0xc49a6c, 0xbead8a: 0xc49a6c, // Seiten und Schatten
    0xb2a280: 0xdcb98a, 0x8f7559: 0xc49a6c, // Seitenkanten unten, Schild auf dem Deckel
    0xcfaf46: 0xd4c169, 0xd6bf78: 0xeae178, 0xa86d19: 0xb09643, 0xbd933a: 0xbfa954, 0xb88d39: 0xbfa954, 0xded9b6: 0xf3f2c0, // Ecken
  }
  // Shop: dasselbe Buch mit beerenrotem Einband (Jazz 2026-11-14: Grün war auf der Wiese zu schlecht zu sehen), sonst gleich
  const rot = { 0x663931: 0xa35b70, 0xa1786a: 0xaf6776, 0xb8958a: 0xbd757e, 0x5b2b2b: 0x865161, 0x4f1c24: 0x865161, 0x3d0c19: 0x6b4b5b }
  for (const [name, einband] of [['buch', {}], ['buch_rot', rot]]) {
    const bild = new PNG({ width: ziel.width, height: H })
    ziel.data.copy(bild.data)
    for (let i = 0; i < bild.data.length; i += 4) {
      if (!bild.data[i + 3]) continue
      const alt = bild.data.readUIntBE(i, 3)
      const neu = einband[alt] ?? farben[alt]
      if (neu === undefined) throw new Error('Buch: Farbe #' + alt.toString(16) + ' ist nicht zugeordnet')
      bild.data.writeUIntBE(neu, i, 3)
    }
    writeFileSync('src/grafik/' + name + '.png', PNG.sync.write(bild))
    liste.push({ name, breite: ziel.width, hoehe: H, bildBreite: B, bildHoehe: H })
  }
  console.log(`buch.png  ${ziel.width}×${H} (umgefärbt)`)
}

// Bilder auf den Lesezeichen (Jazz 2026-11-14): Emojis aus dem UI Pack (Zellen 32 × 32), auf die halbe Größe verkleinert, damit sie
// aufs Lesezeichen passen: je 2 × 2 Bildpunkte werden einer (Mittel der sichtbaren, dann nächste Palettenfarbe).
// reiter.png: 0 Keimling (Pflanzen), 1 Küken (Tiere), 2 Pilz (Deko), 3 Monster, 4 Münze (Verkaufen)
{
  const q = PNG.sync.read(readFileSync(EMOJI))
  const zellen = [[0, 12], [0, 17], [3, 12], [0, 10], [1, 8]]
  const ziel = new PNG({ width: 16 * zellen.length, height: 16 })
  ziel.data.fill(0)
  zellen.forEach(([sp, ze], n) => {
    for (let y = 0; y < 16; y++)
      for (let x = 0; x < 16; x++) {
        const sichtbar = []
        for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
          const i = ((ze * 32 + y * 2 + dy) * q.width + sp * 32 + x * 2 + dx) * 4
          if (q.data[i + 3] > 127) sichtbar.push([q.data[i], q.data[i + 1], q.data[i + 2]])
        }
        if (sichtbar.length < 2) continue
        const mittel = [0, 1, 2].map((c) => sichtbar.reduce((sum, f) => sum + f[c], 0) / sichtbar.length)
        ziel.data.set([...naechsteFarbe(mittel), 255], (y * ziel.width + n * 16 + x) * 4)
      }
  })
  writeFileSync('src/grafik/reiter.png', PNG.sync.write(ziel))
  liste.push({ name: 'reiter', breite: ziel.width, hoehe: 16, bildBreite: 16, bildHoehe: 16 })
  console.log('reiter.png  ' + ziel.width + '×16 (Emojis verkleinert)')
}

// Lesezeichen (Reiter am Buchrand): selbst gezeichnete Bänder mit Schwalbenschwanz in vier Palettenfarben (rot, blau, grün, gelb)
{
  const B = 40, H = 20
  const farben = [[196, 88, 84], [92, 142, 190], [116, 164, 92], [226, 182, 84]]
  const ziel = new PNG({ width: B * farben.length, height: H })
  ziel.data.fill(0)
  const drin = (x, y) => x >= 0 && y >= 0 && y < H && x <= B - 1 - Math.round(5 * (1 - Math.abs(y - (H - 1) / 2) / ((H - 1) / 2)))
  farben.forEach((farbe, n) => {
    const mitte = naechsteFarbe(farbe), dunkel = naechsteFarbe(farbe.map((c) => c * 0.55)), hell = naechsteFarbe(farbe.map((c) => Math.min(255, c * 1.15 + 24)))
    for (let y = 0; y < H; y++)
      for (let x = 0; x < B; x++) {
        if (!drin(x, y)) continue
        const kante = !drin(x + 1, y) || !drin(x, y - 1) || !drin(x, y + 1)
        ziel.data.set([...(kante ? dunkel : y === 1 ? hell : mitte), 255], (y * ziel.width + n * B + x) * 4)
      }
  })
  writeFileSync('src/grafik/lesezeichen.png', PNG.sync.write(ziel))
  liste.push({ name: 'lesezeichen', breite: ziel.width, hoehe: H, bildBreite: B, bildHoehe: H })
  console.log(`lesezeichen.png  ${ziel.width}×${H} (gezeichnet)`)
}

// ---------- Sticker fürs Sammelalbum (Jazz 2026-11-14): aus den schon ausgeschnittenen Bildern, im Stil der Sprout-Lands-Emojis.
// Der dunkle Umriss wird farbig (dunklerer Ton der Fläche daneben), rundherum ein heller Kleberand (1 Pixel). Gleiche Pixelgröße wie das Buch,
// damit nichts über die Seite ragt. Alle Sticker in einem Blatt mit gleich großen Zellen; Nummern in STICKER_NUMMER.
// Reihen der Sorten wie SORTE in src/lib/shop.ts.
const SORTEN = ['karotte', 'blumenkohl', 'tomate', 'aubergine', 'tulpe', 'salat', 'weizen', 'kuerbis', 'rettich', 'rose', 'rote_bete', 'sternfrucht', 'gurke']
const STICKER = [
  ...SORTEN.map((id, i) => [id, 'saatgut', i * 2 + 1]), // das Geerntete
  ['orangenbaum', 'baum_orange', 0], ['pfirsichbaum', 'baum_pfirsich', 0], ['birnenbaum', 'baum_birne', 0],
  ['huhn', 'huhn', 0], ['kuh', 'kuh', 0], ['brunnen', 'brunnen', 0], ['boot', 'deko_boot', 0],
  ...['busch', 'blume_gelb', 'pilz', 'stein', 'blume_lila', 'pilzhaus', 'katze_rosa', 'katze_blau'].map((id) => [id, 'deko_' + id, 0]),
  ...['ruebchen', 'schleim_gruen', 'schleim_blau', 'schleim_feuer', 'gespenst', 'spinne_gruen', 'spinne_lila', 'spinne_gold', 'maus', 'fledermaus']
    .map((id) => ['monster_' + id, 'monster_' + id, 0]),
]
const hellste = PALETTE.reduce((m, p) => (p[0] + p[1] + p[2] > m[0] + m[1] + m[2] ? p : m))
const helligkeit = (f) => 0.3 * f[0] + 0.59 * f[1] + 0.11 * f[2]
function sticker(name, nummer) {
  const g = liste.find((l) => l.name === name)
  if (!g) throw new Error(`Sticker: Bild ${name} fehlt`)
  const q = PNG.sync.read(readFileSync(`src/grafik/${name}.png`))
  const spalten = g.breite / g.bildBreite
  const fx = (nummer % spalten) * g.bildBreite, fy = Math.floor(nummer / spalten) * g.bildHoehe
  const da = (x, y) => x >= 0 && y >= 0 && x < g.bildBreite && y < g.bildHoehe && q.data[((fy + y) * q.width + fx + x) * 4 + 3] > 127
  const farbe = (x, y) => { const i = ((fy + y) * q.width + fx + x) * 4; return [q.data[i], q.data[i + 1], q.data[i + 2]] }
  let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1
  for (let y = 0; y < g.bildHoehe; y++) for (let x = 0; x < g.bildBreite; x++) if (da(x, y)) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y) }
  const w = x1 - x0 + 1, h = y1 - y0 + 1, mal = 1, R = 1
  const amRand = (x, y) => da(x, y) && (!da(x - 1, y) || !da(x + 1, y) || !da(x, y - 1) || !da(x, y + 1))
  const bild = new PNG({ width: w * mal + 2 * R, height: h * mal + 2 * R })
  bild.data.fill(0)
  const voll = (X, Y) => X >= 0 && Y >= 0 && X < bild.width && Y < bild.height && bild.data[(Y * bild.width + X) * 4 + 3] === 255
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++) {
      if (!da(x, y)) continue
      let f = farbe(x, y)
      if (amRand(x, y)) {
        const innen = []
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (da(x + dx, y + dy) && !amRand(x + dx, y + dy)) innen.push(farbe(x + dx, y + dy))
        if (innen.length) {
          const mittel = [0, 1, 2].map((c) => innen.reduce((s, p) => s + p[c], 0) / innen.length)
          if (helligkeit(f) < helligkeit(mittel)) f = naechsteFarbe(mittel.map((c) => c * 0.72))
        }
      }
      for (let dy = 0; dy < mal; dy++) for (let dx = 0; dx < mal; dx++) bild.data.set([...f, 255], (((y - y0) * mal + dy + R) * bild.width + (x - x0) * mal + dx + R) * 4)
    }
  // Kleberand: alles Durchsichtige, das höchstens R Pixel (rund gemessen) neben dem Bild liegt. Erst sammeln, dann färben,
  // damit der Rand nicht selbst als Bild zählt.
  const rand = []
  for (let Y = 0; Y < bild.height; Y++)
    for (let X = 0; X < bild.width; X++) {
      if (voll(X, Y)) continue
      let nah = false
      for (let dy = -R; dy <= R && !nah; dy++) for (let dx = -R; dx <= R; dx++) if (dx * dx + dy * dy <= R * R + 1 && voll(X + dx, Y + dy)) { nah = true; break }
      if (nah) rand.push((Y * bild.width + X) * 4)
    }
  for (const i of rand) bild.data.set([...hellste, 255], i)
  return bild
}
{
  const bilder = STICKER.map(([, name, nummer]) => sticker(name, nummer))
  const B = Math.max(...bilder.map((b) => b.width)), H = Math.max(...bilder.map((b) => b.height))
  const ziel = new PNG({ width: B * bilder.length, height: H })
  ziel.data.fill(0)
  bilder.forEach((b, i) => PNG.bitblt(b, ziel, 0, 0, b.width, b.height, i * B + Math.floor((B - b.width) / 2), Math.floor((H - b.height) / 2)))
  writeFileSync('src/grafik/sticker.png', PNG.sync.write(ziel))
  liste.push({ name: 'sticker', breite: ziel.width, hoehe: H, bildBreite: B, bildHoehe: H })
  console.log(`sticker.png  ${ziel.width}×${H} (${bilder.length} Sticker)`)
}

// ---------- Rankpflanze im Lernweg: eigene Zeichnung von Jazz (2026-11-14), aus ihrem Screenshot auf das Pixelraster zurückgerechnet
// (assets/ranke_a.png, ranke_b.png, ranke_topf.png), Farben aus der Sprout-Lands-Palette.
// ranke.png: 4 Bilder je 20 × 24, der Stiel steht immer in Spalte 9 und reicht bis zur Unterkante.
// 0/1 = Stück A/B mitten in der Ranke (Stiel auch bis zur Oberkante), 2/3 = Stück A/B als Spitze. Der Topf (19 breit) steht darunter.
{
  const lies = (n) => PNG.sync.read(readFileSync(`assets/${n}.png`))
  const a = lies('ranke_a'), b = lies('ranke_b'), topf = lies('ranke_topf')
  // die drei Farben aus Stück A (Stück B hat vom Verkleinern Zwischentöne)
  const farbenA = []
  for (let i = 0; i < a.data.length; i += 4) {
    const f = [a.data[i], a.data[i + 1], a.data[i + 2]]
    if (a.data[i + 3] && !farbenA.some((g) => g.join() === f.join())) farbenA.push(f)
  }
  const B = 20, H = 24, STIEL = 9
  const ziel = new PNG({ width: B * 4, height: H })
  ziel.data.fill(0)
  ;[[a, 6], [b, 8]].forEach(([q, stiel], n) => {
    const da = (x, y) => q.data[(y * q.width + x) * 4 + 3] > 127
    const farbe = (x, y) => { const i = (y * q.width + x) * 4; const f = [q.data[i], q.data[i + 1], q.data[i + 2]]; return farbenA.reduce((m, g) => (farbAbstand(g, f) < farbAbstand(m, f) ? g : m)) }
    let oben = 0, unten = q.height - 1
    while (!da(stiel, oben)) oben++
    while (!da(stiel, unten)) unten--
    const stielFarbe = farbe(stiel, unten)
    for (const bild of [n, n + 2]) {
      const setze = (x, y, f) => ziel.data.set([...f, 255], (y * ziel.width + bild * B + x) * 4)
      for (let y = 0; y < q.height; y++) for (let x = 0; x < q.width; x++) if (da(x, y)) setze(x + STIEL - stiel, y, farbe(x, y))
      for (let y = unten + 1; y < H; y++) setze(STIEL, y, stielFarbe)
      if (bild < 2) for (let y = 0; y < oben; y++) setze(STIEL, y, stielFarbe)
    }
  })
  aufPalette(ziel)
  // Topf: nur die warmen Holz- und Orangetöne der Palette (die nächste Palettenfarbe machte die dunklen Stellen grau)
  const warm = [0x795e53, 0x90625d, 0xaa7959, 0xba7c54, 0xd79e61, 0xeeba77, 0xf2cf8c].map((f) => [f >> 16, (f >> 8) & 255, f & 255])
  for (let i = 0; i < topf.data.length; i += 4) {
    if (topf.data[i + 3] < 128) { topf.data[i + 3] = 0; continue }
    const f = [topf.data[i], topf.data[i + 1], topf.data[i + 2]]
    topf.data.set([...warm.reduce((m, g) => (farbAbstand(g, f) < farbAbstand(m, f) ? g : m)), 255], i)
  }
  writeFileSync('src/grafik/ranke.png', PNG.sync.write(ziel))
  writeFileSync('src/grafik/ranke_topf.png', PNG.sync.write(topf))
  liste.push({ name: 'ranke', breite: ziel.width, hoehe: H, bildBreite: B, bildHoehe: H })
  liste.push({ name: 'ranke_topf', breite: topf.width, hoehe: topf.height, bildBreite: topf.width, bildHoehe: topf.height })
  const i = (H - 1) * ziel.width * 4 + STIEL * 4
  console.log(`ranke.png  ${ziel.width}×${H}, ranke_topf.png  ${topf.width}×${topf.height} (Stielfarbe #${ziel.data.readUIntBE(i, 3).toString(16)})`)
}

const zeilen = liste.map((g) => `import ${g.name} from './${g.name}.png'`)
zeilen.push('', 'export const GRAFIK = {')
for (const g of liste)
  zeilen.push(`  ${g.name}: { url: ${g.name}, breite: ${g.breite}, hoehe: ${g.hoehe}, bildBreite: ${g.bildBreite}, bildHoehe: ${g.bildHoehe} },`)
zeilen.push('} as const', '', '/** Nummer des Stickers im Blatt GRAFIK.sticker (Schlüssel: Shop-Artikel bzw. monster_<Name>) */',
  `export const STICKER_NUMMER: Record<string, number> = { ${STICKER.map(([id], i) => `${id}: ${i}`).join(', ')} }`, '')
writeFileSync(
  'src/grafik/index.ts',
  '// Automatisch erzeugt von scripts/grafik-holen.mjs – nicht von Hand ändern.\n' + zeilen.join('\n'),
)
