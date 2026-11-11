// Erzeugt die Pixel-Rahmen der Schüleransicht (Karte, Knöpfe, Rückmeldung) als kleine SVG-Bilder
// und die Flächen- und Schriftfarben dazu – für hell, dunkel, mehr Kontrast und dunkel + mehr Kontrast.
// Form nach den Sprout-Lands-Knöpfen (Cup Nooble), Farben aus der Sprout-Lands-Palette (dunkel davon abgeleitet).
// Prüft jeden Kontrast (Schrift ≥ 4,5:1, Ränder ≥ 3:1) und schreibt den Block PIXEL-START … PIXEL-ENDE in tokens.css.
// Aufruf: node scripts/pixel-rahmen.mjs   (bricht ab, wenn ein Kontrast zu niedrig ist)
import fs from 'node:fs'

// Eckige Form (Karte, Knopf): R = Rand, F = Fläche, H = Lichtkante, S = Schattenkante, D = dunkle Unterkante.
// Die 5. Zeile und 5. Spalte sind die Mitte, die gestreckt wird (Schnitt 4 / 4 / 6 / 4).
const ECKIG = [
  '   RRR   ',
  '  RFHFR  ',
  ' RFHHHFR ',
  'RFHHFHHFR',
  'RHHFFFHHR',
  'DFHHFHHFD',
  'DSFHHHFSD',
  'DSSFHFSSD',
  ' DSSSSSD ',
  '  DSSSD  ',
  '   DDD   ',
]
// Gedrückter bzw. gewählter Knopf: dunklere Fläche, ohne Schattenkante (Schnitt 4 / 4 / 5 / 4).
const GEDRUECKT = [
  '   RRR   ',
  '  RFHFR  ',
  ' RFHHHFR ',
  'RFHHFHHFR',
  'RHHFFFHHR',
  'DHHFFFHHD',
  'DFHHFHHFD',
  ' DFHHHFD ',
  '  DFHFD  ',
  '   DDD   ',
]
// Runder Knopf (18×20 Pixel), Hintergrund für ein Symbol.
const RUND = [
  '      RRRRRR      ',
  '    RRHHHHHHRR    ',
  '   RFHHHHHHHHFR   ',
  '  RFHHFFFFFFHHFR  ',
  ' RFHHFFFFFFFFHHFR ',
  ' RHHFFFFFFFFFFHHR ',
  'RHHFFFFFFFFFFFFHHR',
  'RHHFFFFFFFFFFFFHHR',
  'RHHFFFFFFFFFFFFHHR',
  'RHHFFFFFFFFFFFFHHR',
  'RHHFFFFFFFFFFFFHHR',
  'DSHHFFFFFFFFFFHHSD',
  'DSFHHFFFFFFFFHHFSD',
  'DSSFHHFFFFFFHHFSSD',
  ' DSSFHHHHHHHHFSSD ',
  ' DSSSSHHHHHHSSSSD ',
  '  DSSSSSSSSSSSSD  ',
  '   DSSSSSSSSSSD   ',
  '    DDSSSSSSDD    ',
  '      DDDDDD      ',
]

function svg(form, farben) {
  let rechtecke = ''
  form.forEach((zeile, y) => {
    for (let x = 0; x < zeile.length; ) {
      const z = zeile[x]
      let b = 1
      while (zeile[x + b] === z) b++
      if (z !== ' ') rechtecke += `<rect x='${x}' y='${y}' width='${b}' height='1' fill='${farben[z]}'/>`
      x += b
    }
  })
  const code = `<svg xmlns='http://www.w3.org/2000/svg' width='${form[0].length}' height='${form.length}' shape-rendering='crispEdges'>${rechtecke}</svg>`
  return `url("data:image/svg+xml,${code.replaceAll('<', '%3C').replaceAll('>', '%3E').replaceAll('#', '%23')}")`
}

// Je Modus: Schrift (tinte), Hintergrund (wiese) und die Farben der Rahmen.
const MODI = {
  hell: {
    tinte: '#3d281a', wiese: '#c0d470',
    karte: { R: '#90625d', F: '#f3e5c2', H: '#faf2dc', S: '#dcb98a', D: '#754c60' },
    knopf: { R: '#90625d', F: '#e8cfa6', H: '#f3e5c2', S: '#c49a6c', D: '#754c60' },
    gewaehlt: { R: '#90625d', F: '#dcb98a', H: '#e8cfa6', D: '#754c60' },
    haupt: { R: '#754c60', F: '#c49a6c', H: '#dcb98a', S: '#aa7959', D: '#6b4b5b' },
    hilfe: { R: '#4a588e', F: '#e8cfa6', H: '#f3e5c2', S: '#7ba6b4', D: '#4a588e' },
    richtig: { R: '#566560', F: '#d6f1cd', H: '#e8f7e2', S: '#aed499', D: '#566560', tinte: '#18491c' },
    nochmal: { R: '#8a4a70', F: '#f3d8c5', H: '#f9eadf', S: '#e8b5ac', D: '#8a4a70', tinte: '#7c350e' },
  },
  dunkel: {
    tinte: '#f1eadc', wiese: '#27321c',
    karte: { R: '#b2a486', F: '#2f2520', H: '#3b302a', S: '#241c18', D: '#120c09' },
    knopf: { R: '#c4bc93', F: '#4a3d35', H: '#5a4a40', S: '#2f2520', D: '#120c09' },
    gewaehlt: { R: '#c4bc93', F: '#3a2f29', H: '#4a3d35', D: '#120c09' },
    haupt: { R: '#e8cfa6', F: '#7b5a3e', H: '#90693f', S: '#4e3826', D: '#120c09' },
    hilfe: { R: '#92b2d4', F: '#4a3d35', H: '#5a4a40', S: '#2f3a52', D: '#120c09' },
    richtig: { R: '#82a884', F: '#193c1b', H: '#22492a', S: '#10291a', D: '#08140a', tinte: '#b9eeba' },
    nochmal: { R: '#d99a9a', F: '#512e1a', H: '#5e3822', S: '#3a2012', D: '#1a0d06', tinte: '#ffd3b2' },
  },
  mehr: {
    tinte: '#1c0e05', wiese: '#c0d470',
    karte: { R: '#3d281a', F: '#fefcf4', H: '#fefcf4', S: '#e8cfa6', D: '#1c0e05' },
    knopf: { R: '#3d281a', F: '#f3e5c2', H: '#fefcf4', S: '#c49a6c', D: '#1c0e05' },
    gewaehlt: { R: '#3d281a', F: '#e8cfa6', H: '#f3e5c2', D: '#1c0e05' },
    haupt: { R: '#1c0e05', F: '#c49a6c', H: '#dcb98a', S: '#754c60', D: '#1c0e05' },
    hilfe: { R: '#2c3870', F: '#f3e5c2', H: '#fefcf4', S: '#577297', D: '#1c0e05' },
    richtig: { R: '#012d07', F: '#d6f1cd', H: '#e8f7e2', S: '#97bb8e', D: '#012d07', tinte: '#012d07' },
    nochmal: { R: '#541600', F: '#f3d8c5', H: '#f9eadf', S: '#d99a9a', D: '#541600', tinte: '#541600' },
  },
  dunkelMehr: {
    tinte: '#fffbf4', wiese: '#27321c',
    karte: { R: '#edd2b5', F: '#140b05', H: '#140b05', S: '#2a1f18', D: '#030101' },
    knopf: { R: '#edd2b5', F: '#2a1f18', H: '#3b2e25', S: '#140b05', D: '#030101' },
    gewaehlt: { R: '#edd2b5', F: '#1f160f', H: '#2a1f18', D: '#030101' },
    haupt: { R: '#fff3d8', F: '#5e4430', H: '#6e523a', S: '#3b2a1c', D: '#030101' },
    hilfe: { R: '#8fd5fd', F: '#2a1f18', H: '#3b2e25', S: '#1a2a40', D: '#030101' },
    richtig: { R: '#a9fea0', F: '#0c2410', H: '#12301a', S: '#08180b', D: '#030101', tinte: '#d5ffd5' },
    nochmal: { R: '#ffb1a2', F: '#2d140a', H: '#3a1c10', S: '#1e0c05', D: '#030101', tinte: '#ffead3' },
  },
}

const lin = (h) => [1, 3, 5].map((i) => { const c = parseInt(h.slice(i, i + 2), 16) / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4 })
const Y = (h) => { const [r, g, b] = lin(h); return 0.2126 * r + 0.7152 * g + 0.0722 * b }
const kontrast = (a, b) => { const [x, y] = [Y(a), Y(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05) }

// Fachbegriff-Farben je Modus aus tokens.css (Reihenfolge der Blöcke: hell, dunkel, mehr, dunkel + mehr)
const datei = 'src/design/tokens.css'
const alt = fs.readFileSync(datei, 'utf8')
const katBloecke = alt.slice(alt.indexOf('WORTARTEN-START'), alt.indexOf('WORTARTEN-ENDE')).split('}').filter((b) => b.includes('--kat-'))
const katFarben = katBloecke.map((b) => [...b.matchAll(/--kat-([a-z]+): (#[0-9a-f]{6})/g)].filter((m) => !m[1].endsWith('flaeche')))

const fehler = []
const pruefe = (modus, was, a, b, mindest) => { const k = kontrast(a, b); if (k < mindest) fehler.push(`${modus}: ${was} ${k.toFixed(2)} < ${mindest}`) }
Object.entries(MODI).forEach(([modus, m], i) => {
  pruefe(modus, 'Schrift auf Karte', m.tinte, m.karte.F, 4.5)
  pruefe(modus, 'Schrift auf Knopf', m.tinte, m.knopf.F, 4.5)
  pruefe(modus, 'Schrift auf Hauptknopf', m.tinte, m.haupt.F, 4.5)
  pruefe(modus, 'Schrift auf gewähltem Knopf', m.tinte, m.gewaehlt.F, 4.5)
  pruefe(modus, 'Richtig-Schrift', m.richtig.tinte, m.richtig.F, 4.5)
  pruefe(modus, 'Nochmal-Schrift', m.nochmal.tinte, m.nochmal.F, 4.5)
  for (const k of ['knopf', 'gewaehlt', 'haupt', 'hilfe']) pruefe(modus, `Rand ${k} auf Karte`, m[k].R, m.karte.F, 3)
  pruefe(modus, 'Rand Karte auf Wiese', m.karte.R, m.wiese, 3)
  pruefe(modus, 'Hilfe-Rand auf Knopf', m.hilfe.R, m.hilfe.F, 3)
  for (const [, name, farbe] of katFarben[i]) pruefe(modus, `Fachbegriff ${name} auf Karte`, farbe, m.karte.F, 4.5)
})
if (fehler.length) {
  console.error('Kontrast zu niedrig:\n' + fehler.join('\n'))
  process.exit(1)
}

const block = (m) => `
  --color-wiese: ${m.wiese};
  --color-papier: ${m.karte.F};
  --color-papier-2: ${m.knopf.F};
  --color-tinte: ${m.tinte};
  --color-holz: ${m.karte.R};
  --color-holz-schatten: ${m.karte.D};
  --color-richtig-flaeche: ${m.richtig.F};
  --color-richtig-tinte: ${m.richtig.tinte};
  --color-nochmal-flaeche: ${m.nochmal.F};
  --color-nochmal-tinte: ${m.nochmal.tinte};
  --rahmen-karte: ${svg(ECKIG, m.karte)};
  --rahmen-knopf: ${svg(ECKIG, m.knopf)};
  --rahmen-gewaehlt: ${svg(GEDRUECKT, m.gewaehlt)};
  --rahmen-haupt: ${svg(ECKIG, m.haupt)};
  --rahmen-richtig: ${svg(ECKIG, m.richtig)};
  --rahmen-nochmal: ${svg(ECKIG, m.nochmal)};
  --rund-knopf: ${svg(RUND, m.knopf)};
  --rund-hilfe: ${svg(RUND, m.hilfe)};`

const css = `/* PIXEL-START – erzeugt von scripts/pixel-rahmen.mjs, nicht von Hand ändern.
   Rahmen nach den Sprout-Lands-Knöpfen (Cup Nooble) als SVG, dazu die Flächen- und Schriftfarben, die sie brauchen. */
:root {${block(MODI.hell)}
}
:root[data-thema='dunkel'] {${block(MODI.dunkel)}
}
@media (prefers-contrast: more) {
  :root {${block(MODI.mehr)}
  }
}
@media (prefers-contrast: more) {
  :root[data-thema='dunkel'] {${block(MODI.dunkelMehr)}
  }
}
/* PIXEL-ENDE */
`
const anfang = alt.indexOf('/* PIXEL-START')
const neu = anfang < 0 ? alt.trimEnd() + '\n\n' + css : alt.slice(0, anfang) + css + alt.slice(alt.indexOf('/* PIXEL-ENDE */') + '/* PIXEL-ENDE */\n'.length)
fs.writeFileSync(datei, neu)
console.log('Pixel-Rahmen geschrieben, alle Kontraste geprüft.')
