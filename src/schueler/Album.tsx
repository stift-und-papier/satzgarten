// „Mein Sammelalbum“ (Aufgabe 41c, Lehrkraft 2026-11-12): Pflanzen, Tiere und Deko, die man schon einmal hatte.
// Noch nicht Gesammeltes als „?“. Was gesammelt ist, rechnet der Server (schueler_album). Papier: Humble Gift Paper UI.
import { useEffect, useState } from 'react'
import { Sprite } from '../gemeinsam/Sprite'
import { Symbol } from '../gemeinsam/Symbol'
import { GRAFIK } from '../grafik'
import { fehlerText } from '../lib/fehler'
import { artikelBild, SORTE } from '../lib/shop'
import { supabase } from '../lib/supabase'

type Eintrag = { id: string; art: 'samen' | 'tier' | 'deko'; gesammelt: boolean; name: string | null }

const SEITEN = [
  { art: 'samen', titel: 'Pflanzen' },
  { art: 'tier', titel: 'Tiere' },
  { art: 'deko', titel: 'Deko' },
] as const

/** Pflanzen als reife Pflanze, Tiere und Deko wie im Shop */
function bild(e: Eintrag) {
  if (e.art === 'samen') return { grafik: GRAFIK.pflanzen, nummer: SORTE[e.id] * 4 + 3 }
  return artikelBild(e.id)
}

export function Album({ token, zurueck }: { token: string; zurueck: string }) {
  const [liste, setListe] = useState<Eintrag[] | null>(null)
  const [fehler, setFehler] = useState<string | null>(null)

  useEffect(() => {
    void supabase.rpc('schueler_album', { p_token: token }).then(({ data, error }) => {
      if (error) setFehler(fehlerText(error))
      else setListe(data as Eintrag[])
    })
  }, [token])

  return (
    <>
      <header className="karte">
        <div className="knopf-reihe">
          <a className="holzknopf" href={zurueck} aria-label="Zurück zur Farm">
            <Symbol name="zurueck" />
          </a>
          <h1>Mein Sammelalbum</h1>
        </div>
        <p>Hier klebt alles, was du schon einmal auf deiner Farm hattest. Was noch fehlt, zeigt ein Fragezeichen.</p>
      </header>
      {!liste ? (
        <p className="karte" role={fehler ? 'alert' : 'status'}>{fehler ?? 'Einen Moment …'}</p>
      ) : (
        SEITEN.map(({ art, titel }) => (
          <section key={art} className="album-seite" aria-label={titel}>
            <h2>{titel}</h2>
            <ul className="album-raster">
              {liste
                .filter((e) => e.art === art)
                .map((e) => {
                  if (!e.gesammelt) {
                    return (
                      <li key={e.id} className="album-platz album-platz--leer">
                        <span className="album-platz__frage" role="img" aria-label="Noch nicht gesammelt">?</span>
                      </li>
                    )
                  }
                  const b = bild(e)
                  return (
                    <li key={e.id} className="album-platz">
                      <Sprite grafik={b.grafik} nummer={b.nummer} mal={b.grafik.bildBreite > 16 ? 2 : 3} />
                      {e.name}
                    </li>
                  )
                })}
            </ul>
          </section>
        ))
      )}
    </>
  )
}
