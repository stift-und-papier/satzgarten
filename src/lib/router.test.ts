import { describe, expect, it } from 'vitest'
import { pfadAus } from './router'

describe('pfadAus', () => {
  it('zerlegt Schüler- und Lehrkraft-Pfade', () => {
    expect(pfadAus('#/s/abc123/hilfe')).toEqual(['s', 'abc123', 'hilfe'])
    expect(pfadAus('#/lehrkraft/klassen')).toEqual(['lehrkraft', 'klassen'])
  })
  it('liefert für leere Adressen eine leere Liste', () => {
    expect(pfadAus('')).toEqual([])
    expect(pfadAus('#')).toEqual([])
    expect(pfadAus('#/')).toEqual([])
  })
  it('übersetzt Sonderzeichen zurück', () => {
    expect(pfadAus('#/vorschau/%C3%BCbung')).toEqual(['vorschau', 'übung'])
  })
})
