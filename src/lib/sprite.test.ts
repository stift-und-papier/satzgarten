import { describe, expect, it } from 'vitest'
import { einzelbild } from './sprite'

// Blatt mit 4 Spalten und 2 Zeilen zu je 16×24 Pixeln
const blatt = { url: '', breite: 64, hoehe: 48, bildBreite: 16, bildHoehe: 24 }

describe('einzelbild', () => {
  it('zählt zeilenweise von links oben', () => {
    expect(einzelbild(blatt, 0)).toEqual({ x: 0, y: 0 })
    expect(einzelbild(blatt, 3)).toEqual({ x: 48, y: 0 })
    expect(einzelbild(blatt, 4)).toEqual({ x: 0, y: 24 })
    expect(einzelbild(blatt, 7)).toEqual({ x: 48, y: 24 })
  })
  it('lehnt Bilder außerhalb des Blatts ab', () => {
    expect(() => einzelbild(blatt, 8)).toThrow()
    expect(() => einzelbild(blatt, -1)).toThrow()
    expect(() => einzelbild(blatt, 1.5)).toThrow()
  })
})
