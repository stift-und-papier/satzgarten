// Fachbegriffe mit Farbe: Wortarten, Satzglieder, Zeitformen.
// Farbwerte in tokens.css (--kat-<farbe>, --kat-<farbe>-flaeche), erzeugt von scripts/fachbegriff-farben.mjs.
// Gruppen dürfen dieselbe Farbe nutzen, weil eine Aufgabe nie zwei Gruppen gleichzeitig abfragt.

export type Farbe = 'blau' | 'rot' | 'gruen' | 'hellblau' | 'lila' | 'weinrot' | 'senf' | 'pink' | 'petrol' | 'grau'
export type Gruppe = 'wortart' | 'satzglied' | 'zeitform'

export interface Kategorie {
  name: string // so wird sie angezeigt
  gruppe: Gruppe
  farbe: Farbe
  formen: string[] // Schreibweisen klein, ohne Umlaute; Endungen -e, -en, -er, -s, -n, -a sind erlaubt
}

export const KATEGORIEN: Kategorie[] = [
  // Wortarten (Nomen, Verb, Adjektiv, Artikel, Pronomen: Vorgabe der Lehrkraft)
  { name: 'Nomen', gruppe: 'wortart', farbe: 'blau', formen: ['nomen', 'nomina', 'substantiv', 'namenwort', 'namenswort'] },
  { name: 'Verb', gruppe: 'wortart', farbe: 'rot', formen: ['verb', 'tunwort', 'tuwort'] },
  { name: 'Adjektiv', gruppe: 'wortart', farbe: 'gruen', formen: ['adjektiv', 'wiewort', 'eigenschaftswort'] },
  { name: 'Artikel', gruppe: 'wortart', farbe: 'hellblau', formen: ['artikel', 'begleiter'] },
  { name: 'Pronomen', gruppe: 'wortart', farbe: 'lila', formen: ['pronom', 'pronomina', 'fuerwort'] },
  { name: 'Adverb', gruppe: 'wortart', farbe: 'weinrot', formen: ['adverb', 'adverbien', 'umstandswort'] },
  { name: 'Präposition', gruppe: 'wortart', farbe: 'senf', formen: ['praeposition', 'verhaeltniswort'] },
  { name: 'Konjunktion', gruppe: 'wortart', farbe: 'pink', formen: ['konjunktion', 'subjunktion', 'bindewort'] },
  { name: 'Numerale', gruppe: 'wortart', farbe: 'petrol', formen: ['numerale', 'numeralia', 'zahlwort'] },
  { name: 'Interjektion', gruppe: 'wortart', farbe: 'grau', formen: ['interjektion', 'ausrufewort', 'partikel'] },

  // Satzglieder (Subjekt wie Nomen blau, Prädikat wie Verb rot)
  { name: 'Subjekt', gruppe: 'satzglied', farbe: 'blau', formen: ['subjekt'] },
  { name: 'Prädikat', gruppe: 'satzglied', farbe: 'rot', formen: ['praedikat'] },
  { name: 'Akkusativobjekt', gruppe: 'satzglied', farbe: 'gruen', formen: ['akkusativobjekt', 'objekt'] },
  { name: 'Dativobjekt', gruppe: 'satzglied', farbe: 'senf', formen: ['dativobjekt'] },
  { name: 'Genitivobjekt', gruppe: 'satzglied', farbe: 'petrol', formen: ['genitivobjekt'] },
  { name: 'Präpositionalobjekt', gruppe: 'satzglied', farbe: 'lila', formen: ['praepositionalobjekt'] },
  {
    name: 'Adverbiale',
    gruppe: 'satzglied',
    farbe: 'weinrot',
    formen: ['adverbial', 'adverbialbestimmung', 'adverbiale bestimmung', 'temporaladverbial', 'lokaladverbial', 'kausaladverbial', 'modaladverbial'],
  },
  { name: 'Attribut', gruppe: 'satzglied', farbe: 'pink', formen: ['attribut'] },

  // Zeitformen auf dem Zeitstrahl: Vergangenheit kühl → Gegenwart grün → Zukunft warm
  { name: 'Plusquamperfekt', gruppe: 'zeitform', farbe: 'lila', formen: ['plusquamperfekt'] },
  { name: 'Präteritum', gruppe: 'zeitform', farbe: 'blau', formen: ['praeteritum', 'imperfekt'] },
  { name: 'Perfekt', gruppe: 'zeitform', farbe: 'hellblau', formen: ['perfekt'] },
  { name: 'Präsens', gruppe: 'zeitform', farbe: 'gruen', formen: ['praesens'] },
  { name: 'Futur I', gruppe: 'zeitform', farbe: 'weinrot', formen: ['futur i', 'futur 1', 'futur'] },
  { name: 'Futur II', gruppe: 'zeitform', farbe: 'pink', formen: ['futur ii', 'futur 2'] },
]

function vereinfachen(text: string): string {
  return text.trim().toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/\s+/g, ' ')
}

/** Kategorie zu einem Begriff aus einer Aufgabe („Verben“, „Subjekt“, „Futur II“) oder null. */
export function kategorieAus(begriff: string): Kategorie | null {
  // Mehrzahl „-wörter“ wie Einzahl behandeln (Zahlwörter → zahlwort)
  const k = vereinfachen(begriff).replace(/woerter$/, 'wort')
  for (const kat of KATEGORIEN) {
    for (const form of kat.formen) {
      if (k === form || (k.startsWith(form) && /^(e|en|er|s|n|a)$/.test(k.slice(form.length)))) return kat
    }
  }
  return null
}

export interface Abschnitt {
  text: string
  kategorie?: Kategorie
}

// Wörter (auch „Futur II“ und „adverbiale Bestimmung“ als ein Begriff)
const BEGRIFF = /futur\s+(?:ii|i|2|1)(?![\p{L}\d])|adverbialen?\s+bestimmung(?:en)?|[\p{L}]+/giu

/** Zerlegt einen Text (z. B. eine Arbeitsanweisung) so, dass Fachbegriffe ihre Farbe bekommen können. */
export function fachbegriffeFaerben(text: string): Abschnitt[] {
  const teile: Abschnitt[] = []
  let rest = 0
  for (const treffer of text.matchAll(BEGRIFF)) {
    const kategorie = kategorieAus(treffer[0])
    if (!kategorie) continue
    const start = treffer.index ?? 0
    if (start > rest) teile.push({ text: text.slice(rest, start) })
    teile.push({ text: treffer[0], kategorie })
    rest = start + treffer[0].length
  }
  if (rest < text.length) teile.push({ text: text.slice(rest) })
  return teile
}
