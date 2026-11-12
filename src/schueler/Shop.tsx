// Shop: mit Münzen Samen, Tiere, Deko und Felder kaufen (docs/SPEC-muenzen.md). Prüfen und Abziehen macht der Server (kaufen).
import { useCallback, useEffect, useState } from 'react'
import { Sprite } from '../gemeinsam/Sprite'
import { GRAFIK } from '../grafik'
import { fehlerText } from '../lib/fehler'
import { artikelBild, type Artikel, type ArtikelArt, type Shop as ShopDaten } from '../lib/shop'
import { supabase } from '../lib/supabase'

const BEREICHE: { art: ArtikelArt; titel: string }[] = [
  { art: 'samen', titel: 'Samen' },
  { art: 'tier', titel: 'Tiere' },
  { art: 'deko', titel: 'Deko' },
  { art: 'feld', titel: 'Felder' },
]

export function Shop({ token, nachKauf }: { token: string; nachKauf: () => void }) {
  const [daten, setDaten] = useState<ShopDaten | null>(null)
  const [fehler, setFehler] = useState<string | null>(null)
  const [meldung, setMeldung] = useState<string | null>(null)
  const [frage, setFrage] = useState<string | null>(null) // id des Artikels, der gerade bestätigt wird
  const [beschaeftigt, setBeschaeftigt] = useState(false)

  const laden = useCallback(async () => {
    const { data, error } = await supabase.rpc('schueler_shop', { p_token: token })
    if (error) setFehler(fehlerText(error))
    else setDaten(data as ShopDaten)
  }, [token])

  useEffect(() => {
    void laden()
  }, [laden])

  async function kaufen(a: Artikel) {
    setBeschaeftigt(true)
    setFehler(null)
    const { error } = await supabase.rpc('kaufen', { p_token: token, p_artikel: a.id })
    setBeschaeftigt(false)
    setFrage(null)
    if (error) return setFehler(fehlerText(error))
    setMeldung(`Gekauft: ${a.name}! Das kommt bald auf deine Farm.`)
    await laden()
    nachKauf()
  }

  if (!daten) return <p className="karte" role={fehler ? 'alert' : 'status'}>{fehler ?? 'Einen Moment …'}</p>

  return (
    <>
      <header className="karte">
        <h1>Shop</h1>
        <p>Kauf dir etwas für deine Farm. Je mehr du übst, desto mehr gibt es hier.</p>
      </header>
      {meldung && (
        <p className="rueckmeldung rueckmeldung--richtig" role="status">
          <span className="rueckmeldung__zeichen" aria-hidden="true">✓</span>
          {meldung}
        </p>
      )}
      {fehler && (
        <p className="rueckmeldung rueckmeldung--nochmal" role="alert">
          <span className="rueckmeldung__zeichen" aria-hidden="true">!</span>
          {fehler}
        </p>
      )}
      {BEREICHE.map(({ art, titel }) => {
        const angebot = daten.angebot.filter((a) => a.art === art && a.preis > 0)
        const gesperrt = daten.gesperrt.filter((g) => g.art === art).length
        if (angebot.length === 0 && gesperrt === 0) return null
        return (
          <section key={art} className="karte">
            <h2>{titel}</h2>
            <ul className="shop-raster">
              {angebot.map((a) => {
                const bild = artikelBild(a.id)
                const fehlt = a.preis - daten.kontostand
                return (
                  <li key={a.id} className="shop-artikel">
                    <Sprite grafik={bild.grafik} nummer={bild.nummer} mal={bild.grafik.bildBreite > 16 ? 2 : 4} />
                    <strong>{a.name}</strong>
                    <span className="muenzen-preis">
                      <Sprite grafik={GRAFIK.muenze} mal={1} /> {a.preis}
                    </span>
                    {a.besitz > 0 && <span className="leise">Du hast {a.besitz}.</span>}
                    {frage === a.id ? (
                      <span className="knopf-reihe">
                        <button type="button" className="knopf knopf--haupt" disabled={beschaeftigt} onClick={() => void kaufen(a)}>
                          Ja, kaufen
                        </button>
                        <button type="button" className="knopf" onClick={() => setFrage(null)}>
                          Doch nicht
                        </button>
                      </span>
                    ) : fehlt > 0 ? (
                      <span className="leise">Noch {fehlt} Münzen sammeln</span>
                    ) : (
                      <button type="button" className="knopf" onClick={() => setFrage(a.id)}>
                        Kaufen
                      </button>
                    )}
                  </li>
                )
              })}
              {Array.from({ length: gesperrt }, (_, i) => (
                <li key={`?${i}`} className="shop-artikel shop-artikel--gesperrt">
                  <span className="shop-artikel__frage" aria-hidden="true">?</span>
                  <span className="leise">Kommt, wenn du weiter übst.</span>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </>
  )
}
