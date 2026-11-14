// Shop: mit Münzen Samen, Tiere, Deko und Felder kaufen (docs/SPEC-muenzen.md). Prüfen und Abziehen macht der Server (kaufen).
// Geerntetes, Eier und Milch verkaufen (Lehrkraft 2026-11-12: Verkaufen nur im Shop). Preise kommen vom Server.
// Jazz 2026-11-14: der Shop ist ein Buch mit grünem Einband (gemeinsam/Buch.tsx). Links die Ware in Kästchen, rechts das
// angetippte Stück groß mit Name, Preis und „Kaufen“. Lesezeichen: Pflanzen, Tiere, Deko, Verkaufen.
// Was noch gesperrt ist, zeigt das Fragezeichen aus dem Emoji-Blatt (nur hier, nicht im Sammelalbum).
import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Buch, BuchBild } from '../gemeinsam/Buch'
import { Sprite } from '../gemeinsam/Sprite'
import { GRAFIK } from '../grafik'
import { fehlerText } from '../lib/fehler'
import { artikelBild, vorratDing, type Artikel, type ArtikelArt, type Shop as ShopDaten } from '../lib/shop'
import type { Grafik } from '../lib/sprite'
import { supabase } from '../lib/supabase'

type Ware = { sorte: string; name: string; anzahl: number; preis: number }
type Verkauf = { kontostand: number; vorrat: Ware[] }
// Was in einem Kästchen liegt: ein Artikel, ein gesperrter Platz oder etwas aus dem Vorrat zum Verkaufen
type Posten =
  | { key: string; art: 'artikel'; a: Artikel }
  | { key: string; art: 'gesperrt'; fehlt: number }
  | { key: string; art: 'ware'; v: Ware }

const KAPITEL: { titel: string; arten: ArtikelArt[]; bild: Grafik; nummer?: number }[] = [
  { titel: 'Pflanzen', arten: ['samen', 'baum', 'feld'], bild: GRAFIK.saatgut },
  { titel: 'Tiere', arten: ['tier'], bild: GRAFIK.huhn },
  { titel: 'Deko', arten: ['deko'], bild: GRAFIK.deko_pilz },
  { titel: 'Verkaufen', arten: [], bild: GRAFIK.ei },
]
const VERKAUFEN = 3
const JE_SEITE = 9

/** Vielfaches eines Buch-Pixels, damit auch 32er- und 48er-Bilder ins Kästchen (klein) bzw. auf die rechte Seite (groß) passen */
const mal = (g: Grafik, gross: boolean) => (gross ? 32 / g.bildBreite : g.bildBreite <= 16 ? 1 : g.bildBreite <= 32 ? 2 / 3 : 1 / 3)

function bild(p: Posten): { grafik: Grafik; nummer: number } {
  if (p.art === 'artikel') return artikelBild(p.a.id)
  if (p.art === 'ware') return vorratDing(p.v.sorte)
  return { grafik: GRAFIK.emoji_frage, nummer: 0 }
}

export function Shop({ token, nachKauf }: { token: string; nachKauf: () => void }) {
  const [daten, setDaten] = useState<ShopDaten | null>(null)
  const [fehler, setFehler] = useState<string | null>(null)
  const [meldung, setMeldung] = useState<string | null>(null)
  const [frage, setFrage] = useState(false) // „Ja, kaufen“ wird gerade erfragt
  const [beschaeftigt, setBeschaeftigt] = useState(false)
  const [verkauf, setVerkauf] = useState<Verkauf | null>(null)
  const [[kapitel, seite], setOrt] = useState([0, 0])
  const [gewaehlt, setGewaehlt] = useState<string | null>(null) // key des angetippten Kästchens

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
    setFrage(false)
    if (error) return setFehler(fehlerText(error))
    // Usability-Test 2026-11-13: Samen erscheinen nicht von selbst, man pflanzt sie
    setMeldung(
      a.art === 'samen'
        ? `Gekauft: ${a.name}! Tippe auf der Farm ein leeres Feld an, dann kannst du sie pflanzen.`
        : `Gekauft: ${a.name}! Schau auf deine Farm, dort ist es jetzt.`,
    )
    await laden()
    nachKauf()
  }

  async function verkaufen(v: Ware) {
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

  const { titel, arten } = KAPITEL[kapitel]
  const alle: Posten[] =
    kapitel === VERKAUFEN
      ? (verkauf?.vorrat ?? []).map((v) => ({ key: `v:${v.sorte}`, art: 'ware', v }))
      : [
          ...daten.angebot.filter((a) => arten.includes(a.art) && a.preis > 0).map((a): Posten => ({ key: a.id, art: 'artikel', a })),
          ...daten.gesperrt.filter((g) => arten.includes(g.art)).map((g, i): Posten => ({ key: `?${g.art}${i}`, art: 'gesperrt', fehlt: g.fehlt })),
        ]
  const posten = alle.slice(seite * JE_SEITE, (seite + 1) * JE_SEITE)
  const wahl = posten.find((p) => p.key === gewaehlt) ?? posten[0]

  let rechts: ReactNode = null
  if (wahl?.art === 'artikel') {
    const a = wahl.a
    const fehlt = a.preis - daten.kontostand
    rechts = (
      <>
        <h2>{a.name}</h2>
        <span className="muenzen-preis">
          <Sprite grafik={GRAFIK.muenze} mal={1} /> {a.preis}
        </span>
        {a.besitz > 0 && <span>Du hast {a.besitz}.</span>}
        {frage ? (
          <>
            <button type="button" className="knopf knopf--haupt" disabled={beschaeftigt} onClick={() => void kaufen(a)}>
              Ja, kaufen
            </button>
            <button type="button" className="knopf" onClick={() => setFrage(false)}>
              Doch nicht
            </button>
          </>
        ) : fehlt > 0 ? (
          <span>Noch {fehlt} Münzen sammeln</span>
        ) : (
          <button type="button" className="knopf knopf--haupt" onClick={() => setFrage(true)}>
            Kaufen
          </button>
        )}
      </>
    )
  } else if (wahl?.art === 'ware') {
    const v = wahl.v
    rechts = (
      <>
        <h2>{v.name}</h2>
        <span className="muenzen-preis">
          <Sprite grafik={GRAFIK.muenze} mal={1} /> {v.preis}
        </span>
        <span>Du hast {v.anzahl}.</span>
        <button type="button" className="knopf knopf--haupt" disabled={beschaeftigt} onClick={() => void verkaufen(v)}>
          Verkaufen
        </button>
      </>
    )
  } else if (wahl) {
    // Usability-Test 2026-11-13: sagen, wie weit es noch ist (verdiente Münzen, Ausgeben zählt nicht)
    rechts = <span>Kommt, wenn du noch {wahl.fehlt} Münzen verdienst.</span>
  }

  return (
    <>
      <Buch
        titel="Shop"
        gruen
        kapitel={KAPITEL}
        aktiv={kapitel}
        seite={seite}
        seiten={Math.max(1, Math.ceil(alle.length / JE_SEITE))}
        onWechsel={(k, s) => {
          setOrt([k, s])
          setGewaehlt(null)
          setFrage(false)
        }}
        links={
          <section aria-label={titel}>
            <h2>{titel}</h2>
            {posten.length === 0 ? (
              <p>{kapitel === VERKAUFEN ? 'Du hast gerade nichts zu verkaufen. Ernte etwas auf deiner Farm.' : 'Hier gibt es gerade nichts.'}</p>
            ) : (
              <ul className="shop-kaestchen">
                {posten.map((p) => {
                  const b = bild(p)
                  const name = p.art === 'artikel' ? p.a.name : p.art === 'ware' ? p.v.name : 'Noch gesperrt'
                  return (
                    <li key={p.key}>
                      <button
                        type="button"
                        aria-label={name}
                        aria-pressed={p.key === wahl?.key}
                        onClick={() => {
                          setGewaehlt(p.key)
                          setFrage(false)
                        }}
                      >
                        <BuchBild grafik={b.grafik} nummer={b.nummer} mal={mal(b.grafik, false)} />
                        {p.art === 'ware' && <span className="farm-menue__anzahl">{p.v.anzahl}</span>}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        }
        rechts={
          wahl && (
            <div className="shop-wahl" aria-live="polite">
              <BuchBild grafik={bild(wahl).grafik} nummer={bild(wahl).nummer} mal={mal(bild(wahl).grafik, true)} />
              {rechts}
            </div>
          )
        }
      />
      {meldung && !fehler && (
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
      {!meldung && !fehler && <p className="leise buch-hinweis">Je mehr du übst, desto mehr gibt es hier.</p>}
    </>
  )
}
