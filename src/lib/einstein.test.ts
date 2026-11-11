import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { einsteinTexte, formatKennung } from './einstein'

describe('Einsteins Texte', () => {
  it('liest Kennungen und Absätze, Kopf-Kommentar fällt weg', () => {
    expect(einsteinTexte('<!--\n## nein\n-->\n## a\nEins\nzwei\n\nDrei\n## b\nText')).toEqual({ a: 'Eins zwei\nDrei', b: 'Text' })
  })
  it('die echte Datei: Begrüßung und jedes Format erklärt, nie „falsch“', () => {
    const t = einsteinTexte(readFileSync(new URL('../schueler/einstein.md', import.meta.url), 'utf8'))
    for (const typ of ['lueckentext', 'auswahl', 'zuordnen', 'fehler', 'reihenfolge', 'ueberarbeiten', 'erklaerung'])
      expect(t[formatKennung(typ)], typ).toBeTruthy()
    expect(t[formatKennung('diktat', 'abschreiben')]).toBeTruthy()
    expect(t[formatKennung('diktat', 'merken')]).toBeTruthy()
    expect(t.begruessung).toContain('{name}')
    for (const text of Object.values(t)) expect(text).not.toMatch(/falsch/i)
  })
})
