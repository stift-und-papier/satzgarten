// „Mein Sammelalbum“ (Aufgabe 41c, Lehrkraft 2026-11-12): Pflanzen, Tiere und Deko, die man schon einmal hatte.
// Noch nicht Gesammeltes als „?“. Was gesammelt ist, rechnet der Server (schueler_album). Papier: Humble Gift Paper UI.
// Jazz 2026-11-14: Buch mit Holzumschlag (Spielfenster-Rahmen), Reiter je Seite, Dinge in Inventar-Plätzen.
import { useEffect, useState } from 'react'
import { Sprite } from '../gemeinsam/Sprite'
import { Symbol } from '../gemeinsam/Symbol'
import { GRAFIK } from '../grafik'
import { fehlerText } from '../lib/fehler'
import { artikelBild, SORTE } from '../lib/shop'
import { supabase } from '../lib/supabase'

type Eintrag = { id: string; art: 'samen' | 'baum' | 'tier' | 'deko'; gesammelt: boolean; name: string | null }

const SEITEN: { arten: Eintrag['art'][]; titel: string }[] = [
  { arten: ['samen', 'baum'], titel: 'Pflanzen' },
  { arten: ['tier'], titel: 'Tiere' },
  { arten: ['deko'], titel: 'Deko' },
]

/** Pflanzen als reife Pflanze, Tiere und Deko wie im Shop */
function bild(e: Eintrag) {
  if (e.art === 'samen') return { grafik: GRAFIK.pflanzen, nummer: SORTE[e.id] * 4 + 3 }
  return artikelBild(e.id)
}

export function Album({ token, zurueck }: { token: string; zurueck: string }) {
  const [liste, setListe] = useState<Eintrag[] | null>(null)
  const [fehler, setFehler] = useState<string | null>(null)
  const [seite, setSeite] = useState(0)

  useEffect(() => {
    void supabase.rpc('schueler_album', { p_token: token }).then(({ data, error }) => {
      if (error) setFehler(fehlerText(error))
      else setListe(data as Eintrag[])
    })
  }, [token])

  const { arten, titel } = SEITEN[seite]
  return (
    <>
      <header className="pixel-schild">
        <div className="knopf-reihe">
          <a className="holzknopf" href={zurueck} aria-label="Zurück zur Farm">
            <Symbol name="zurueck" />
          </a>
          <h1>Mein Sammelalbum</h1>
        </div>
      </header>
      {!liste ? (
        <p className="karte" role={fehler ? 'alert' : 'status'}>{fehler ?? 'Einen Moment …'}</p>
      ) : (
        <div className="album-buch">
          <div className="pixel-reiter" role="group" aria-label="Seite wählen">
            {SEITEN.map((s, i) => (
              <button key={s.titel} type="button" className="chip" aria-pressed={i === seite} onClick={() => setSeite(i)}>
                {s.titel}
              </button>
            ))}
          </div>
          <section className="album-seite" aria-label={titel}>
            <h2>{titel}</h2>
            <p>Hier klebt alles, was du schon einmal auf deiner Farm hattest. Was noch fehlt, zeigt ein Fragezeichen.</p>
            <ul className="album-raster">
              {liste
                .filter((e) => arten.includes(e.art))
                .map((e) => {
                  if (!e.gesammelt) {
                    return (
                      <li key={e.id} className="album-platz album-platz--leer">
                        <span className="farm-menue__bild">
                          <span className="album-platz__frage" role="img" aria-label="Noch nicht gesammelt">?</span>
                        </span>
                      </li>
                    )
                  }
                  const b = bild(e)
                  return (
                    <li key={e.id} className="album-platz">
                      <span className="farm-menue__bild">
                        <Sprite grafik={b.grafik} nummer={b.nummer} mal={b.grafik.bildBreite > 16 ? 2 : 3} />
                      </span>
                      {e.name}
                    </li>
                  )
                })}
            </ul>
          </section>
        </div>
      )}
    </>
  )
}
