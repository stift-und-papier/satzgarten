// Farm: Felder bepflanzen und ernten (docs/SPEC-felder.md). Wachstum rechnet der Server; hier nur das Bild der Pflanze.
import { useCallback, useEffect, useState } from 'react'
import { Sprite } from '../gemeinsam/Sprite'
import { GRAFIK } from '../grafik'
import { fehlerText } from '../lib/fehler'
import { SORTE, SORTE_NAME, type Farm as FarmDaten } from '../lib/shop'
import { supabase } from '../lib/supabase'

export function Farm({ token, shop }: { token: string; shop: string }) {
  const [daten, setDaten] = useState<FarmDaten | null>(null)
  const [meldung, setMeldung] = useState<string | null>(null)
  const [fehler, setFehler] = useState<string | null>(null)
  const [gewaehlt, setGewaehlt] = useState<number | null>(null) // leeres Feld, für das ein Samen gewählt wird

  const laden = useCallback(async () => {
    const { data, error } = await supabase.rpc('schueler_farm', { p_token: token })
    if (error) setFehler(fehlerText(error))
    else setDaten(data as FarmDaten)
  }, [token])

  useEffect(() => {
    void laden()
  }, [laden])

  async function ausfuehren(rpc: 'pflanzen' | 'ernten', args: Record<string, unknown>, erfolg: string) {
    setFehler(null)
    const { data, error } = await supabase.rpc(rpc, { p_token: token, ...args })
    if (error) return setFehler(fehlerText(error))
    setDaten(data as FarmDaten)
    setGewaehlt(null)
    setMeldung(erfolg)
  }

  if (!daten) return <p className="karte" role={fehler ? 'alert' : 'status'}>{fehler ?? 'Einen Moment …'}</p>

  function feldAntippen(feld: number) {
    const p = daten!.pflanzen.find((x) => x.feld === feld)
    setMeldung(null)
    if (!p) return setGewaehlt(gewaehlt === feld ? null : feld)
    setGewaehlt(null)
    if (p.reif) return void ausfuehren('ernten', { p_feld: feld }, `Geerntet: ${SORTE_NAME[p.sorte]}!`)
    setMeldung(`${SORTE_NAME[p.sorte]} wächst noch. Jede gelöste Aufgabe gießt deine Felder.`)
  }

  return (
    <section className="karte farm">
      <h2>Deine Farm</h2>
      <ul className="farm-felder">
        {Array.from({ length: daten.felder }, (_, feld) => {
          const p = daten.pflanzen.find((x) => x.feld === feld)
          const name = p ? SORTE_NAME[p.sorte] : ''
          const text = !p ? 'leer, antippen zum Pflanzen' : p.reif ? `${name}, reif, antippen zum Ernten` : `${name}, wächst`
          return (
            <li key={feld}>
              <button
                type="button"
                className="farm-feld"
                aria-pressed={gewaehlt === feld}
                aria-label={`Feld ${feld + 1}: ${text}`}
                onClick={() => feldAntippen(feld)}
              >
                <Sprite grafik={GRAFIK.acker} mal={5} />
                {p && (
                  <span className="farm-feld__pflanze">
                    <Sprite grafik={GRAFIK.pflanzen} nummer={SORTE[p.sorte] * 4 + p.bild} mal={4} />
                  </span>
                )}
                {p?.reif && <span className="farm-feld__reif" aria-hidden="true">✓</span>}
              </button>
            </li>
          )
        })}
      </ul>

      {meldung && <p role="status">{meldung}</p>}
      {fehler && <p role="alert">{fehler}</p>}

      {gewaehlt !== null && (
        <div className="farm-auswahl">
          <h3>Was möchtest du auf Feld {gewaehlt + 1} pflanzen?</h3>
          {daten.samen.length === 0 ? (
            <p>
              Du hast noch keine Samen. <a href={shop}>Im Shop</a> gibt es welche.
            </p>
          ) : (
            <div className="knopf-reihe">
              {daten.samen.map((s) => (
                <button
                  key={s.sorte}
                  type="button"
                  className="knopf"
                  onClick={() => void ausfuehren('pflanzen', { p_feld: gewaehlt, p_sorte: s.sorte }, `${SORTE_NAME[s.sorte]} gepflanzt!`)}
                >
                  <Sprite grafik={GRAFIK.saatgut} nummer={SORTE[s.sorte] * 2} mal={2} /> {SORTE_NAME[s.sorte]} ({s.anzahl})
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {daten.vorrat.length > 0 && (
        <>
          <h3>Geerntet</h3>
          <ul className="farm-vorrat">
            {daten.vorrat.map((v) => (
              <li key={v.sorte}>
                <Sprite grafik={GRAFIK.saatgut} nummer={SORTE[v.sorte] * 2 + 1} mal={3} /> {SORTE_NAME[v.sorte]}: {v.anzahl}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
