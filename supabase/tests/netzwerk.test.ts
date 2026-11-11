import { describe, expect, it } from 'vitest'
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from '../../src/lib/supabase'

// Prüft die Zugriffsregeln "von außen" – genau so, wie es jemand mit dem öffentlichen
// Schlüssel aus der App (z. B. über die Entwicklerwerkzeuge des Browsers) versuchen könnte.
// Läuft gegen die echte Datenbank, liest und schreibt aber nichts.
// Neue Tabellen und Funktionen hier ergänzen.

const kopf = { apikey: SUPABASE_PUBLISHABLE_KEY, 'Content-Type': 'application/json' }

async function holen(pfad: string, optionen: RequestInit = {}) {
  const antwort = await fetch(`${SUPABASE_URL}${pfad}`, { ...optionen, headers: { ...kopf, ...optionen.headers } })
  return { status: antwort.status, text: await antwort.text() }
}

describe('Zugriff ohne Anmeldung über das Netzwerk', () => {
  const tabellen = ['einstellungen', 'klassen', 'schueler', 'kompetenzen', 'aufgaben', 'aufgabe_kompetenzen', 'pakete', 'paket_aufgaben', 'zuweisungen', 'versuche', 'loesung_angesehen', 'schueler_stufen']

  it.each(tabellen)('Tabelle %s ist nicht lesbar', async (tabelle) => {
    const { status } = await holen(`/rest/v1/${tabelle}?select=*`)
    expect([401, 403]).toContain(status)
  })

  it.each(tabellen)('in Tabelle %s kann man nicht schreiben', async (tabelle) => {
    const { status } = await holen(`/rest/v1/${tabelle}`, { method: 'POST', body: '{}' })
    expect([401, 403]).toContain(status)
  })
})
