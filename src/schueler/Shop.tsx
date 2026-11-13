// Shop: mit Münzen Samen, Tiere, Deko und Felder kaufen (docs/SPEC-muenzen.md). Prüfen und Abziehen macht der Server (kaufen).
// Oben: Geerntetes, Eier und Milch verkaufen (Lehrkraft 2026-11-12: Verkaufen nur im Shop). Preise kommen vom Server.
import { useCallback, useEffect, useState } from 'react'
import { Sprite } from '../gemeinsam/Sprite'
import { GRAFIK } from '../grafik'
import { fehlerText } from '../lib/fehler'
import { artikelBild, vorratDing, type Artikel, type ArtikelArt, type Shop as ShopDaten } from '../lib/shop'
import { supabase } from '../lib/supabase'

type Verkauf = { kontostand: number; vorrat: { sorte: string; name: string; anzahl: number; preis: number }[] }

const BEREICHE: { art: ArtikelArt; titel: string }[] = [
  { art: 'samen', titel: 'Samen' },
  { art: 'tier', titel: 'Tiere' },
  { art: 'baum', titel: 'Obstbäume' },
  { art: 'deko', titel: 'Deko' },
  { art: 'feld', titel: 'Felder' },
]

export function Shop({ token, nachKauf }: { token: string; nachKauf: () => void }) {
  const [daten, setDaten] = useState<ShopDaten | null>(null)
  const [fehler, setFehler] = useState<string | null>(null)
  const [meldung, setMeldung] = useState<string | null>(null)
  const [frage, setFrage] = useState<string | null>(null) // id des Artikels, der gerade bestätigt wird
  const [beschaeftigt, setBeschaeftigt] = useState(false)
  const [verkauf, setVerkauf] = useState<Verkauf | null>(null)

  const laden = useCallback(async () => {
    const [shop, liste] = await Promise.all([
      supabase.rpc('schueler_shop', { p_token: token }),
      supabase.rpc('schueler_verkauf', { p_token: token }),
    ])
    const error = shop.error ?? liste.error
    if (error) return setFehler(fehlerText(error))
    setDaten(shop.data as ShopDaten)
    setVerkauf(liste.data as Verkauf)
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

  async function verkaufen(v: Verkauf['vorrat'][number]) {
    setBeschaeftigt(true)
    setFehler(null)
    const { error } = await supabase.rpc('verkaufen', { p_token: token, p_sorte: v.sorte })
    setBeschaeftigt(false)
    if (error) return setFehler(fehlerText(error))
    setMeldung(`Verkauft: ${v.name}. +${v.preis} Münzen für dich!`)
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
      {verkauf && verkauf.vorrat.length > 0 && (
        <section className="karte">
          <h2>Verkaufen</h2>
          <p>Bessere Ernte bringt mehr Münzen. Füttere deine Tiere damit, dann geben sie besondere Eier und Milch.</p>
          <ul className="shop-raster">
            {verkauf.vorrat.map((v) => {
              const d = vorratDing(v.sorte)
              return (
                <li key={v.sorte} className="shop-artikel">
                  <span className="farm-menue__bild farm-menue__bild--oben">
                    <Sprite grafik={d.grafik} nummer={d.nummer} mal={3} />
                    <span className="farm-menue__anzahl">{v.anzahl}</span>
                  </span>
                  <strong>{v.name}</strong>
                  <span className="muenzen-preis">
                    <Sprite grafik={GRAFIK.muenze} mal={1} /> {v.preis}
                  </span>
                  <button type="button" className="knopf" disabled={beschaeftigt} onClick={() => void verkaufen(v)}>
                    Verkaufen
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      )}
      {BEREICHE.map(({ art, titel }) => {
        const angebot = daten.angebot.filter((a) => a.art === art && a.preis > 0)
        const gesperrt = daten.gesperrt.filter((g) => g.art === art)
        if (angebot.length === 0 && gesperrt.length === 0) return null
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
              {gesperrt.map((g, i) => (
                <li key={`?${i}`} className="shop-artikel shop-artikel--gesperrt">
                  <span className="shop-artikel__frage" aria-hidden="true">?</span>
                  {/* Usability-Test 2026-11-13: sagen, wie weit es noch ist (verdiente Münzen, Ausgeben zählt nicht) */}
                  <span className="leise">Kommt, wenn du noch {g.fehlt} Münzen verdienst.</span>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </>
  )
}
