// Wortarten und ihre Farben (Farbwerte in tokens.css: --wa-<schluessel>, --wa-<schluessel>-flaeche).
// Schreibt die Lehrkraft in einer Aufgabe eine Kategorie wie „Nomen“, „Substantive“ oder „Verben“,
// bekommt sie automatisch die Farbe ihrer Wortart. Andere Kategorien (z. B. „Subjekt“) bleiben ohne Wortart-Farbe.

export type Wortart =
  | 'nomen' | 'verb' | 'adjektiv' | 'artikel' | 'pronomen'
  | 'adverb' | 'praeposition' | 'konjunktion' | 'numerale' | 'interjektion'

/** Anzeigename je Wortart (so steht er unter dem Wort und in der Legende). */
export const WORTART_NAME: Record<Wortart, string> = {
  nomen: 'Nomen',
  verb: 'Verb',
  adjektiv: 'Adjektiv',
  artikel: 'Artikel',
  pronomen: 'Pronomen',
  adverb: 'Adverb',
  praeposition: 'Präposition',
  konjunktion: 'Konjunktion',
  numerale: 'Numerale',
  interjektion: 'Interjektion',
}

// Wortstämme (klein, ohne Umlaute) → Wortart. Subjunktion teilt sich die Farbe mit Konjunktion, Partikel mit Interjektion.
const STAEMME: [string, Wortart][] = [
  ['nomen', 'nomen'], ['nomina', 'nomen'], ['substantiv', 'nomen'], ['namenwort', 'nomen'], ['namenswort', 'nomen'],
  ['verb', 'verb'], ['tunwort', 'verb'], ['tuwort', 'verb'],
  ['adjektiv', 'adjektiv'], ['wiewort', 'adjektiv'], ['eigenschaftswort', 'adjektiv'],
  ['artikel', 'artikel'], ['begleiter', 'artikel'],
  ['pronom', 'pronomen'], ['pronomina', 'pronomen'], ['fuerwort', 'pronomen'],
  ['adverb', 'adverb'], ['adverbien', 'adverb'], ['umstandswort', 'adverb'],
  ['praeposition', 'praeposition'], ['verhaeltniswort', 'praeposition'],
  ['konjunktion', 'konjunktion'], ['subjunktion', 'konjunktion'], ['bindewort', 'konjunktion'],
  ['numerale', 'numerale'], ['numeralia', 'numerale'], ['zahlwort', 'numerale'],
  ['interjektion', 'interjektion'], ['ausrufewort', 'interjektion'], ['partikel', 'interjektion'],
]

function vereinfachen(text: string): string {
  return text.trim().toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
}

/** Wortart zu einer Kategorie aus der Aufgabe, oder null, wenn es keine Wortart ist. */
export function wortartAus(kategorie: string): Wortart | null {
  // Mehrzahl „-wörter“ wie Einzahl behandeln (Zahlwörter → zahlwort)
  const k = vereinfachen(kategorie).replace(/woerter$/, 'wort')
  // ganze Kategorie muss eine Wortart sein (mit Endungen wie „-e“, „-en“, „-er“), nicht nur ein Teil davon
  for (const [stamm, art] of STAEMME) {
    if (k === stamm || (k.startsWith(stamm) && /^(e|en|er|s|n|a)$/.test(k.slice(stamm.length)))) return art
  }
  return null
}
