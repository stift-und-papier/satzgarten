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
const MOBS = 'assets/entpackt/Sprout Sorry pack/Early Access/halloween/mobs/'
const SCHLEIM = 'assets/entpackt/free-slime-mobs-pixel-art-top-down-sprite-pack/PNG/'
const PAPIER ='assets/entpackt/Humble Gift - Paper UI System/Humble Gift - Paper UI System v1.1/Sprites/Paper UI Pack/Plain/1 Paper/'

// Zusammengesetzte Bilder: Teile (je 32×32) an Stellen (Spalte, Zeile) übereinander legen.
// Sammelalbum-Seite (Humble Gift Paper UI): Papier 1–9 als 3×3, darüber Zierecken (11, 13, 15, 17) und Randlinien (10, 12, 14, 16).
// Wird in CSS als border-image (je 32 px Rand) gestreckt.
const ZUSAMMEN = [
  {
    name: 'album_seite', breite: 96, hoehe: 96,
    teile: [
      ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n, i) => ({ datei: PAPIER + n + '.png', sp: i % 3, ze: Math.floor(i / 3) })),
      { datei: PAPIER + '10.png', sp: 0, ze: 1 }, { datei: PAPIER + '12.png', sp: 1, ze: 0 },
      { datei: PAPIER + '14.png', sp: 2, ze: 1 }, { datei: PAPIER + '16.png', sp: 1, ze: 2 },
      { datei: PAPIER + '11.png', sp: 0, ze: 0 }, { datei: PAPIER + '13.png', sp: 2, ze: 0 },
      { datei: PAPIER + '15.png', sp: 2, ze: 2 }, { datei: PAPIER + '17.png', sp: 0, ze: 2 },
    ],
  },
]

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
  { name: 'monster_ruebchen', datei: 'assets/chomp_idle.png', x: 0, y: 0, breite: 128, hoehe: 32, bildBreite: 32, bildHoehe: 32 },
  ...[['gruen', 1], ['blau', 2], ['feuer', 3]].map(([farbe, n]) => ({
    name: `monster_schleim_${farbe}`, datei: `${SCHLEIM}Slime${n}/Idle/Slime${n}_Idle_full.png`,
    x: 0, y: 12, breite: 384, hoehe: 32, bildBreite: 64, bildHoehe: 32,
  })),
  { name: 'monster_gespenst', datei: MOBS + 'chost_spritesheet.png', x: 0, y: 0, breite: 160, hoehe: 16, bildBreite: 16, bildHoehe: 16, spiegeln: true },
  ...['green', 'purple', 'golden'].map((farbe) => ({
    name: `monster_spinne_${{ green: 'gruen', purple: 'lila', golden: 'gold' }[farbe]}`, datei: `${MOBS}lil_${farbe}_spider_spritesheet.png`,
    x: 0, y: 0, breite: 240, hoehe: 16, bildBreite: 16, bildHoehe: 16, spiegeln: true,
  })),
  // Übungsumbau Schritt 8: Spielszene. Wiese = unterer Teil von assets/orig.png (craftpix, Nature Landscapes),
  // fliegendes Herz = mittleres volles Herz aus Sprout Lands UI Premium (Hearts.png). Fledermaus ohne das sitzende erste Bild.
  { name: 'spiel_wiese', datei: 'assets/orig.png', x: 0, y: 186, breite: 576, hoehe: 90 },
  { name: 'herz_flug', datei: UI + 'Icons/special icons/Hearts.png', x: 58, y: 9, breite: 13, hoehe: 11 },
  { name: 'monster_maus', datei: MOBS + 'little_grey_mouse.png', x: 0, y: 16, breite: 208, hoehe: 16, bildBreite: 16, bildHoehe: 16, spiegeln: true },
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

// Spielfigur „Blau“ (Jazz, 2026-11-13: von der Lehrkraft umgefärbte Sprout-Lands-Figur, als großes Bild 1024 × 768 mit weißem Grund).
// Gleicher Aufbau wie figur.png (8 Richtungen × 3 Bilder je 16 × 32), aber 8-fach, leicht verschoben und unscharf. Darum: je Einzelbild
// den Versatz des 8er-Rasters suchen (kleinste Streuung in den Blöcken), Blockmitte nehmen (Median), Hintergrund und graue Ränder
// durchsichtig, Farben bündeln (seltene der nächsten zuordnen), alleinstehende Pixel entfernen.
function figurAusGrossbild(datei) {
  const p = PNG.sync.read(readFileSync(datei))
  const K = 8, SP = 8, ZE = 3, BW = 16, BH = 32
  const px = (x, y) => {
    x = Math.max(0, Math.min(p.width - 1, x)); y = Math.max(0, Math.min(p.height - 1, y))
    const i = (y * p.width + x) * 4
    return [p.data[i], p.data[i + 1], p.data[i + 2]]
  }
  const abstand = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2])
  const bloecke = []
  for (let r = 0; r < ZE; r++)
    for (let c = 0; c < SP; c++) {
      const zx = c * BW * K, zy = r * BH * K
      let best = null
      for (let oy = 0; oy < K; oy++)
        for (let ox = 0; ox < K; ox++) {
          let v = 0
          for (let by = 0; by < BH - 1; by++)
            for (let bx = 0; bx < BW - 1; bx++) {
              const m = px(zx + ox + bx * K + 4, zy + oy + by * K + 4)
              for (const [dx, dy] of [[1, 1], [6, 1], [1, 6], [6, 6]]) v += abstand(px(zx + ox + bx * K + dx, zy + oy + by * K + dy), m)
            }
          if (!best || v < best.v) best = { v, ox, oy }
        }
      for (let by = 0; by < BH; by++)
        for (let bx = 0; bx < BW; bx++) {
          const werte = []
          for (let dy = 2; dy < 6; dy++) for (let dx = 2; dx < 6; dx++) werte.push(px(zx + best.ox + bx * K + dx, zy + best.oy + by * K + dy))
          bloecke.push({ x: c * BW + bx, y: r * BH + by, f: [0, 1, 2].map((k) => werte.map((w) => w[k]).sort((a, b) => a - b)[8]) })
        }
    }
  const grau = (f) => Math.min(...f) > 120 && Math.max(...f) - Math.min(...f) < 40
  const zentren = []
  for (const b of bloecke) {
    if (grau(b.f)) continue
    let z = zentren.find((z) => abstand(z.f, b.f) < 48)
    if (!z) zentren.push((z = { f: b.f, n: 0, s: [0, 0, 0] }))
    z.n++
    z.s = z.s.map((s, k) => s + b.f[k])
  }
  zentren.forEach((z) => (z.f = z.s.map((s) => Math.round(s / z.n))))
  const farben = zentren.filter((z) => z.n >= 30)
  const ziel = new PNG({ width: SP * BW, height: ZE * BH })
  ziel.data.fill(0)
  for (const b of bloecke) {
    if (grau(b.f)) continue
    const z = farben.reduce((m, z) => (abstand(z.f, b.f) < abstand(m.f, b.f) ? z : m))
    const i = (b.y * ziel.width + b.x) * 4
    ziel.data.set([...z.f, 255], i)
  }
  // alleinstehende Pixel (höchstens ein Nachbar) entfernen, zweimal
  for (let runde = 0; runde < 2; runde++) {
    const alt = Buffer.from(ziel.data)
    const voll = (x, y) => x >= 0 && y >= 0 && x < ziel.width && y < ziel.height && alt[(y * ziel.width + x) * 4 + 3] > 0
    for (let y = 0; y < ziel.height; y++)
      for (let x = 0; x < ziel.width; x++)
        if (voll(x, y) && [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) => voll(x + dx, y + dy)).length <= 1) ziel.data[(y * ziel.width + x) * 4 + 3] = 0
  }
  return ziel
}
{
  const ziel = figurAusGrossbild('assets/Female character.png')
  writeFileSync('src/grafik/figur_blau.png', PNG.sync.write(ziel))
  liste.push({ name: 'figur_blau', breite: ziel.width, hoehe: ziel.height, bildBreite: 16, bildHoehe: 32 })
  console.log('figur_blau.png  128×96 (aus Großbild)')
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

for (const z of ZUSAMMEN) {
  const ziel = new PNG({ width: z.breite, height: z.hoehe })
  for (const t of z.teile) {
    const q = PNG.sync.read(readFileSync(t.datei))
    for (let y = 0; y < q.height; y++)
      for (let x = 0; x < q.width; x++) {
        const si = (y * q.width + x) * 4
        if (!q.data[si + 3]) continue // durchsichtig: darunter bleibt sichtbar
        const di = ((t.ze * 32 + y) * z.breite + t.sp * 32 + x) * 4
        for (let c = 0; c < 4; c++) ziel.data[di + c] = q.data[si + c]
      }
  }
  writeFileSync(`src/grafik/${z.name}.png`, PNG.sync.write(ziel))
  liste.push({ name: z.name, breite: z.breite, hoehe: z.hoehe, bildBreite: z.breite, bildHoehe: z.hoehe })
  console.log(`${z.name}.png  ${z.breite}×${z.hoehe} (zusammengesetzt)`)
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
