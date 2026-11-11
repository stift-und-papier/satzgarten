// Erzeugt die Fachbegriff-Farben (Wortarten, Satzglieder, Zeitformen) in src/design/tokens.css (zwischen WORTARTEN-START/-ENDE)
// für hell, dunkel, mehr Kontrast und dunkel + mehr Kontrast – und prüft jeden Kontrast.
// Aufruf: node scripts/wortarten-farben.mjs   (bricht ab, wenn ein Kontrast zu niedrig ist)
import fs from 'node:fs'

// Zehn Farbplätze (OKLCH-Farbton und Sättigung). Welche Wortart, welches Satzglied, welche Zeitform welchen Platz
// bekommt, steht in src/lib/kategorien.ts. Vorgaben der Lehrkraft: Nomen blau, Verb rot, Adjektiv grün,
// Artikel hellblau, Pronomen lila.
const WORTARTEN = {
  blau: { h: 262, c: 0.16 },
  rot: { h: 27, c: 0.18 },
  gruen: { h: 142, c: 0.15 },
  hellblau: { h: 228, c: 0.10, hell: true },
  lila: { h: 305, c: 0.15 },
  weinrot: { h: 8, c: 0.13, dunkel: true }, // dunkler als Rot (Adverb gehört zum Verb), weit weg von Pfirsich
  senf: { h: 95, c: 0.12 },
  pink: { h: 350, c: 0.15 },
  petrol: { h: 180, c: 0.10 },               // zwischen Grün und Hellblau
  grau: { h: 60, c: 0.01 },
}

// [Text-Helligkeit, Flächen-Helligkeit, Flächen-Sättigung] je Modus
const MODI = {
  hell: { tinte: 0.45, flaeche: 0.93, fc: 0.045, papier: [0.925, 0.045, 85] },
  dunkel: { tinte: 0.84, flaeche: 0.33, fc: 0.06, papier: [0.26, 0.015, 50] },
  mehr: { tinte: 0.36, flaeche: 0.94, fc: 0.05, papier: [0.99, 0.01, 90] },
  dunkelMehr: { tinte: 0.92, flaeche: 0.26, fc: 0.06, papier: [0.16, 0.02, 60] },
}

function linear(L, C, h) {
  const a = C * Math.cos((h * Math.PI) / 180), b = C * Math.sin((h * Math.PI) / 180)
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s]
    .map((x) => Math.min(1, Math.max(0, x)))
}
const hex = (L, C, h) => '#' + linear(L, C, h).map((x) => Math.round((x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055) * 255).toString(16).padStart(2, '0')).join('')
const Y = (L, C, h) => { const [r, g, b] = linear(L, C, h); return 0.2126 * r + 0.7152 * g + 0.0722 * b }
const kontrast = (a, b) => { const [x, y] = [Y(...a), Y(...b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05) }

const fehler = []
function block(modus) {
  const m = MODI[modus]
  return Object.entries(WORTARTEN).map(([name, w]) => {
    // Hellblau bleibt heller als Blau, dunkle Modi sind ohnehin hell
    const lichtModus = modus === 'hell' || modus === 'mehr'
    // Hellblau heller als Blau; Weinrot dunkler als Rot (Schrift dunkler, Fläche etwas kräftiger)
    const L = w.hell && lichtModus ? m.tinte + 0.05 : w.dunkel && lichtModus ? m.tinte - 0.1 : w.dunkel ? m.tinte + 0.04 : m.tinte
    const fL = w.dunkel ? (lichtModus ? m.flaeche - 0.04 : m.flaeche - 0.06) : m.flaeche
    const tinte = [L, w.c, w.h], flaeche = [fL, w.c < 0.05 ? 0.008 : m.fc, w.h]
    for (const [was, grund] of [['Papier', m.papier], ['Fläche', flaeche]]) {
      const k = kontrast(tinte, grund)
      if (k < 4.5) fehler.push(`${modus} ${name} auf ${was}: ${k.toFixed(2)}`)
    }
    return `    --kat-${name}: ${hex(...tinte)};\n    --kat-${name}-flaeche: ${hex(...flaeche)};`
  }).join('\n')
}

const css = `/* WORTARTEN-START – erzeugt von scripts/wortarten-farben.mjs, nicht von Hand ändern.
   --kat-<farbe> = Schrift und Rahmen (mind. 4,5:1 auf Papier und auf der eigenen Fläche), --kat-<farbe>-flaeche = Kästchen. */
:root {
${block('hell').replaceAll('\n    ', '\n  ').replace(/^ {4}/, '  ')}
}
:root[data-thema='dunkel'] {
${block('dunkel').replaceAll('\n    ', '\n  ').replace(/^ {4}/, '  ')}
}
@media (prefers-contrast: more) {
  :root {
${block('mehr')}
  }
}
@media (prefers-contrast: more) {
  :root[data-thema='dunkel'] {
${block('dunkelMehr')}
  }
}
/* WORTARTEN-ENDE */`

if (fehler.length) {
  console.error('Kontrast zu niedrig:\n' + fehler.join('\n'))
  process.exit(1)
}
const datei = new URL('../src/design/tokens.css', import.meta.url)
const alt = fs.readFileSync(datei, 'utf8')
const neu = alt.includes('/* WORTARTEN-START')
  ? alt.replace(/\/\* WORTARTEN-START[\s\S]*?WORTARTEN-ENDE \*\//, css)
  : alt.trimEnd() + '\n\n' + css + '\n'
fs.writeFileSync(datei, neu)
console.log('Fachbegriff-Farben geschrieben, alle Kontraste ≥ 4,5:1.')
