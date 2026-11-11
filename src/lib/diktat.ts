// Diktat (docs/SPEC-diktat.md): Text vereinheitlichen, in Sätze teilen, vergleichen.
// vereinheitliche und abstand entsprechen den SQL-Funktionen diktat_norm und diktat_abstand (gleiche Ergebnisse!).

// Typografische Zeichen gelten wie ihre Tastatur-Form – Liste nach TastenHeld (js/validator.js, ChalkJunkie/TastenHeld)
const ERSATZ: [RegExp, string][] = [
  [/[„“”»«]/g, '"'],
  [/[‚‘’›‹´`]/g, "'"],
  [/[–—]/g, '-'],
  [/…/g, '...'],
]

/** Für den Vergleich: Unicode NFC, typografische Zeichen → Tastatur, Leerraum zusammenfassen. Groß/klein bleibt. */
export function vereinheitliche(text: string): string {
  let t = text.normalize('NFC')
  for (const [muster, ersatz] of ERSATZ) t = t.replace(muster, ersatz)
  return t.replace(/\s+/g, ' ').trim()
}

// Abkürzungen, nach denen kein Satz endet (klein geschrieben, ohne Punkt); einzelne Buchstaben („z. B.“) ebenso
const ABKUERZUNGEN = new Set(['usw', 'bzw', 'ca', 'nr', 'dr', 'hr', 'fr', 'etc', 'vgl', 'evtl', 'ggf', 'inkl', 'bspw', 'str'])

/** Merkdiktat: Text in (Teil-)Sätze teilen – nach . ? ! (auch mit Anführungszeichen dahinter) und an jedem |. */
export function saetzeTeilen(text: string): string[] {
  const saetze: string[] = []
  for (const block of text.split('|')) {
    let start = 0
    const t = block
    const muster = /[.?!]+["“”»«'’]?(?=\s|$)/g
    for (const treffer of t.matchAll(muster)) {
      const ende = (treffer.index ?? 0) + treffer[0].length
      const wort = /([\p{L}\p{N}]+)[.?!]*["“”»«'’]?$/u.exec(t.slice(start, ende))?.[1] ?? ''
      // „z. B.“, „usw.“, „3.“: kein Satzende
      if (treffer[0] === '.' && (ABKUERZUNGEN.has(wort.toLowerCase()) || [...wort].length === 1 || /^\d+$/.test(wort))) continue
      saetze.push(t.slice(start, ende))
      start = ende
    }
    saetze.push(t.slice(start))
  }
  return saetze.map(vereinheitliche).filter(Boolean)
}

/** Levenshtein-Abstand (Zeichen einfügen, löschen, ersetzen) */
export function abstand(a: string, b: string): number {
  const x = [...a]
  const y = [...b]
  let zeile = Array.from({ length: y.length + 1 }, (_, j) => j)
  for (let i = 1; i <= x.length; i++) {
    const neu = [i]
    for (let j = 1; j <= y.length; j++) neu[j] = Math.min(zeile[j] + 1, neu[j - 1] + 1, zeile[j - 1] + (x[i - 1] === y[j - 1] ? 0 : 1))
    zeile = neu
  }
  return zeile[y.length]
}

/** Merkdiktat: Anteil richtiger Zeichen eines Satzes (0..1) */
export function satzAnteil(soll: string, ist: string): number {
  const s = vereinheitliche(soll)
  if (!s) return 1
  return Math.max(0, 1 - abstand(s, vereinheitliche(ist)) / [...s].length)
}

/** Merkdiktat, nur zur Anzeige: Welche Wörter des Originals fehlen oder sind anders geschrieben? (Wortabgleich) */
export function falscheWoerter(soll: string, ist: string): number[] {
  const s = vereinheitliche(soll).split(' ')
  const i = vereinheitliche(ist).split(' ')
  // längste gemeinsame Teilfolge der Wörter
  const l = Array.from({ length: s.length + 1 }, () => Array<number>(i.length + 1).fill(0))
  for (let a = s.length - 1; a >= 0; a--)
    for (let b = i.length - 1; b >= 0; b--) l[a][b] = s[a] === i[b] ? l[a + 1][b + 1] + 1 : Math.max(l[a + 1][b], l[a][b + 1])
  const falsch: number[] = []
  let a = 0
  let b = 0
  while (a < s.length) {
    if (b < i.length && s[a] === i[b]) {
      a++
      b++
    } else if (b < i.length && l[a][b + 1] >= l[a + 1][b]) b++
    else falsch.push(a++)
  }
  return falsch
}

/** Ergebnisanzeige ohne Zahlen (Schüler:innen sehen nie Prozente) */
export const GESCHAFFT_AB = 0.9
