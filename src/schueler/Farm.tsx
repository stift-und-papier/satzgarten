// Farm als Landschaft (Lehrkraft 2026-11-12): Insel mit Feldern, Stall, Gehege, Bäumen und Deko; die Figur läuft dorthin,
// wo man tippt, und tippt Felder an. Alles bleibt auch ohne Figur bedienbar (Felder sind Knöpfe, Auswahl darunter).
// Wachstum rechnet der Server (docs/SPEC-felder.md); hier nur das Bild der Pflanze.
import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react'
import { Sprite } from '../gemeinsam/Sprite'
import { GRAFIK } from '../grafik'
import { fehlerText } from '../lib/fehler'
import {
  BAEUME, BRUNNEN, DEKO_PLAETZE, FELD_PLAETZE, FIGUR_START, grundKacheln, HUHN_PLAETZE, INSEL, KACHEL, KUH_PLAETZE, SPALTEN, STALL, ZEILEN,
} from '../lib/landschaft'
import { artikelBild, SORTE, SORTE_NAME, type Farm as FarmDaten } from '../lib/shop'
import { einzelbild, type Grafik } from '../lib/sprite'
import { supabase } from '../lib/supabase'

const RICHTUNG = { runter: 0, hoch: 1, links: 2, rechts: 3 } as const
const TEMPO = 60 // Grafik-Pixel pro Sekunde
const ruhig = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function Farm({ token, shop }: { token: string; shop: string }) {
  const [daten, setDaten] = useState<FarmDaten | null>(null)
  const [meldung, setMeldung] = useState<string | null>(null)
  const [fehler, setFehler] = useState<string | null>(null)
  const [gewaehlt, setGewaehlt] = useState<number | null>(null) // leeres Feld, für das ein Samen gewählt wird
  const [mal, setMal] = useState(2)
  const [figur, setFigur] = useState({ x: FIGUR_START.x * KACHEL + 8, y: FIGUR_START.y * KACHEL + 12, richtung: 0, dauer: 0 })
  const rahmen = useRef<HTMLDivElement>(null)
  const leinwand = useRef<HTMLCanvasElement>(null)
  const ankunft = useRef<number>(undefined)

  const laden = useCallback(async () => {
    const { data, error } = await supabase.rpc('schueler_farm', { p_token: token })
    if (error) setFehler(fehlerText(error))
    else setDaten(data as FarmDaten)
  }, [token])

  useEffect(() => {
    void laden()
  }, [laden])

  // Größe: ganzzahlig vergrößern, so groß wie die Breite erlaubt (mindestens 2-fach)
  useEffect(() => {
    const el = rahmen.current
    if (!el) return
    const beob = new ResizeObserver(() => setMal(Math.max(2, Math.min(4, Math.floor(el.clientWidth / (SPALTEN * KACHEL))))))
    beob.observe(el)
    return () => beob.disconnect()
  }, [daten === null])

  // Hintergrund einmal in Originalgröße zeichnen; die Seite vergrößert ihn pixelgenau
  useEffect(() => {
    const ctx = leinwand.current?.getContext('2d')
    if (!ctx) return
    const namen = ['wasser', 'gras', 'gras_deko', 'zaun', 'baum', 'baum_klein', 'stall'] as const
    const bilder = Object.fromEntries(namen.map((n) => [n, Object.assign(new Image(), { src: GRAFIK[n].url })]))
    let aktiv = true
    void Promise.all(Object.values(bilder).map((b) => b.decode())).then(() => {
      if (!aktiv) return
      for (const k of grundKacheln()) {
        const g = GRAFIK[k.grafik]
        const { x, y } = einzelbild(g, k.nummer)
        ctx.drawImage(bilder[k.grafik], x, y, KACHEL, KACHEL, k.x * KACHEL, k.y * KACHEL, KACHEL, KACHEL)
      }
      for (const b of BAEUME) ctx.drawImage(bilder[b.grafik], b.x * KACHEL, b.y * KACHEL)
      ctx.drawImage(bilder.stall, STALL.x * KACHEL, STALL.y * KACHEL)
    })
    return () => {
      aktiv = false
    }
  }, [daten === null])

  useEffect(() => () => window.clearTimeout(ankunft.current), [])

  /** Figur zu (x, y) in Grafik-Pixeln laufen lassen, danach `dann` ausführen */
  function gehe(x: number, y: number, dann?: () => void) {
    const zx = Math.max(INSEL.x0 * KACHEL + 8, Math.min(INSEL.x1 * KACHEL + 8, x))
    const zy = Math.max(INSEL.y0 * KACHEL + 8, Math.min(INSEL.y1 * KACHEL + 12, y))
    const dx = zx - figur.x
    const dy = zy - figur.y
    const dauer = ruhig() ? 0 : Math.round((Math.hypot(dx, dy) / TEMPO) * 1000)
    const richtung = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? RICHTUNG.rechts : RICHTUNG.links) : dy < 0 ? RICHTUNG.hoch : RICHTUNG.runter
    setFigur({ x: zx, y: zy, richtung, dauer })
    window.clearTimeout(ankunft.current)
    ankunft.current = window.setTimeout(() => {
      setFigur((f) => ({ ...f, dauer: 0 }))
      dann?.()
    }, dauer)
  }

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
    if (!p) return setGewaehlt(feld)
    setGewaehlt(null)
    if (p.reif) return void ausfuehren('ernten', { p_feld: feld }, `Geerntet: ${SORTE_NAME[p.sorte]}!`)
    setMeldung(`${SORTE_NAME[p.sorte]} wächst noch. Jede gelöste Aufgabe gießt deine Felder.`)
  }

  function inDieLandschaft(e: MouseEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget && e.target !== leinwand.current) return
    const r = e.currentTarget.getBoundingClientRect()
    gehe((e.clientX - r.left) / mal, (e.clientY - r.top) / mal)
  }

  const px = (kacheln: number) => kacheln * KACHEL * mal
  const anzahl = (id: string) => daten.dinge.find((d) => d.artikel === id)?.anzahl ?? 0
  const deko = daten.dinge.filter((d) => !['huhn', 'kuh', 'brunnen'].includes(d.artikel)).flatMap((d) => Array(d.anzahl).fill(d.artikel) as string[])
  const huehner = Math.min(anzahl('huhn'), HUHN_PLAETZE.length)
  const kuehe = Math.min(anzahl('kuh'), KUH_PLAETZE.length)
  const ebene = (yKacheln: number) => ({ zIndex: Math.round(yKacheln * KACHEL) })

  return (
    <section className="karte farm">
      <h2>Deine Farm</h2>
      <p className="leise">Tippe irgendwohin, dann läuft deine Figur dorthin. Tippe ein Feld an, um zu pflanzen oder zu ernten.</p>
      <div ref={rahmen} className="farm-rahmen">
        <div className="farm-landschaft" style={{ width: px(SPALTEN), height: px(ZEILEN) }} onClick={inDieLandschaft}>
          <canvas ref={leinwand} width={SPALTEN * KACHEL} height={ZEILEN * KACHEL} style={{ width: px(SPALTEN), height: px(ZEILEN) }} aria-hidden="true" />

          {Array.from({ length: Math.min(daten.felder, FELD_PLAETZE.length) }, (_, feld) => {
            const ort = FELD_PLAETZE[feld]
            const p = daten.pflanzen.find((x) => x.feld === feld)
            const name = p ? SORTE_NAME[p.sorte] : ''
            const text = !p ? 'leer, antippen zum Pflanzen' : p.reif ? `${name}, reif, antippen zum Ernten` : `${name}, wächst`
            return (
              <button
                key={feld}
                type="button"
                className="farm-feld"
                style={{ left: px(ort.x), top: px(ort.y), width: px(1), height: px(1), ...ebene(ort.y) }}
                aria-pressed={gewaehlt === feld}
                aria-label={`Feld ${feld + 1}: ${text}`}
                onClick={() => gehe(ort.x * KACHEL + 8, (ort.y + 1) * KACHEL + 10, () => feldAntippen(feld))}
              >
                <Sprite grafik={GRAFIK.acker} mal={mal} />
                {p && (
                  <span className="farm-feld__pflanze">
                    <Sprite grafik={GRAFIK.pflanzen} nummer={SORTE[p.sorte] * 4 + p.bild} mal={mal} />
                  </span>
                )}
                {p?.reif && <span className="farm-feld__reif" aria-hidden="true">✓</span>}
              </button>
            )
          })}

          {anzahl('brunnen') > 0 && <Ding grafik={GRAFIK.brunnen} x={px(BRUNNEN.x)} y={px(BRUNNEN.y)} mal={mal} z={(BRUNNEN.y + 2) * KACHEL} />}
          {deko.slice(0, DEKO_PLAETZE.length).map((id, i) => {
            const b = artikelBild(id)
            return <Ding key={i} grafik={b.grafik} nummer={b.nummer} x={px(DEKO_PLAETZE[i].x)} y={px(DEKO_PLAETZE[i].y)} mal={mal} z={(DEKO_PLAETZE[i].y + 1) * KACHEL} />
          })}
          {HUHN_PLAETZE.slice(0, huehner).map((o, i) => (
            <Ding key={`h${i}`} grafik={GRAFIK.huhn} x={px(o.x)} y={px(o.y)} mal={mal} z={(o.y + 1) * KACHEL} klasse="farm-tier farm-tier--huhn" />
          ))}
          {KUH_PLAETZE.slice(0, kuehe).map((o, i) => (
            <Ding key={`k${i}`} grafik={GRAFIK.kuh} x={px(o.x)} y={px(o.y)} mal={mal} z={(o.y + 2) * KACHEL} klasse="farm-tier farm-tier--kuh" />
          ))}

          <span
            className={`farm-figur${figur.dauer > 0 ? ' farm-figur--laeuft' : ''}`}
            aria-hidden="true"
            style={{
              left: (figur.x - 24) * mal,
              top: (figur.y - 32) * mal,
              width: 48 * mal,
              height: 48 * mal,
              zIndex: Math.round(figur.y),
              transition: `left ${figur.dauer}ms linear, top ${figur.dauer}ms linear`,
              backgroundImage: `url(${GRAFIK.figur.url})`,
              backgroundSize: `${192 * mal}px ${192 * mal}px`,
              backgroundPositionY: -figur.richtung * 48 * mal,
              ['--lauf' as string]: `${-192 * mal}px`,
            }}
          />
        </div>
      </div>

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
              <button type="button" className="knopf" onClick={() => setGewaehlt(null)}>
                Doch nicht
              </button>
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

// Ein Gegenstand in der Landschaft (Deko, Tier); z = untere Kante in Grafik-Pixeln, damit Vorderes vorne liegt
function Ding(props: { grafik: Grafik; nummer?: number; x: number; y: number; mal: number; z: number; klasse?: string }) {
  return (
    <span className={`farm-ding ${props.klasse ?? ''}`} style={{ left: props.x, top: props.y, zIndex: props.z, ['--lauf' as string]: `${-props.grafik.breite * props.mal}px` }}>
      <Sprite grafik={props.grafik} nummer={props.nummer} mal={props.mal} />
    </span>
  )
}
