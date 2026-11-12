// Farm als Landschaft (Lehrkraft 2026-11-12): Insel mit Acker, Hühnerstall und Scheune (erst mit dem ersten Tier), Bäumen und Deko.
// Die Figur läuft dorthin, wo man tippt. Feld oder Tier antippen öffnet ein Menü (UI Pack) mit Samen bzw. Futter.
// Alles bleibt auch ohne Figur bedienbar (Felder und Tiere sind Knöpfe). Wachstum und Füttern rechnet der Server.
import { useCallback, useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { Sprite } from '../gemeinsam/Sprite'
import { GRAFIK } from '../grafik'
import { fehlerText } from '../lib/fehler'
import {
  BAEUME, blobTeil, BRUNNEN, DEKO_PLAETZE, FELD_PLAETZE, FIGUR_START, grundKacheln, HEU, HUHN_PLAETZE, istGras, KACHEL, KUH_PLAETZE,
  scheunenKacheln, SPALTEN, STALL, TROG, TUER, ZEILEN,
} from '../lib/landschaft'
import { artikelBild, SORTE, SORTE_NAME, type Farm as FarmDaten } from '../lib/shop'
import { einzelbild, type Grafik } from '../lib/sprite'
import { supabase } from '../lib/supabase'

const RICHTUNG = { runter: 0, hoch: 1, links: 2, rechts: 3 } as const
const TEMPO = 60 // Grafik-Pixel pro Sekunde
const ruhig = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const ERZEUGNIS: Record<string, { name: string; grafik: Grafik; preis: number }> = {
  ei: { name: 'Ei', grafik: GRAFIK.ei, preis: 10 },
  milch: { name: 'Milch', grafik: GRAFIK.milch, preis: 20 },
}
const TIER_NAME: Record<string, string> = { huhn: 'Huhn', kuh: 'Kuh' }

type Menue = { art: 'feld'; feld: number } | { art: 'tier'; id: string }

export function Farm({ token, shop, nachMuenzen }: { token: string; shop: string; nachMuenzen: () => void }) {
  const [daten, setDaten] = useState<FarmDaten | null>(null)
  const [meldung, setMeldung] = useState<string | null>(null)
  const [fehler, setFehler] = useState<string | null>(null)
  const [menue, setMenue] = useState<Menue | null>(null)
  const [herz, setHerz] = useState<string | null>(null) // Tier, über dem gerade ein Herz erscheint
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

  const felder = daten ? Math.min(daten.felder, FELD_PLAETZE.length) : 0
  const huehner = daten?.tiere.filter((t) => t.art === 'huhn').slice(0, HUHN_PLAETZE.length) ?? []
  const kuehe = daten?.tiere.filter((t) => t.art === 'kuh').slice(0, KUH_PLAETZE.length) ?? []

  // Hintergrund in Originalgröße zeichnen (Wasser, Gras, Acker, Stall, Scheune, Bäume); die Seite vergrößert ihn pixelgenau
  useEffect(() => {
    const ctx = leinwand.current?.getContext('2d')
    if (!ctx || !daten) return
    const namen = ['wasser', 'gras', 'gras_deko', 'acker', 'wand', 'tuer_offen', 'heu', 'heu_lose', 'trog', 'baum', 'baum_klein', 'stall'] as const
    const bilder = Object.fromEntries(namen.map((n) => [n, Object.assign(new Image(), { src: GRAFIK[n].url })])) as Record<(typeof namen)[number], HTMLImageElement>
    const kachel = (name: (typeof namen)[number], nummer: number, x: number, y: number) => {
      const q = einzelbild(GRAFIK[name], nummer)
      ctx.drawImage(bilder[name], q.x, q.y, KACHEL, KACHEL, x * KACHEL, y * KACHEL, KACHEL, KACHEL)
    }
    let aktiv = true
    void Promise.all(Object.values(bilder).map((b) => b.decode())).then(() => {
      if (!aktiv) return
      ctx.clearRect(0, 0, SPALTEN * KACHEL, ZEILEN * KACHEL)
      for (const k of grundKacheln()) kachel(k.grafik, k.nummer, k.x, k.y)
      // Acker: zusammenhängend wie im Titelbild
      const istFeld = (x: number, y: number) => FELD_PLAETZE.slice(0, felder).some((o) => o.x === x && o.y === y)
      for (const o of FELD_PLAETZE.slice(0, felder)) kachel('acker', blobTeil(o.x, o.y, istFeld), o.x, o.y)
      if (huehner.length) ctx.drawImage(bilder.stall, STALL.x * KACHEL, STALL.y * KACHEL)
      if (kuehe.length) {
        for (const k of scheunenKacheln()) kachel('wand', k.nummer, k.x, k.y)
        ctx.drawImage(bilder.tuer_offen, TUER.x * KACHEL + 5, TUER.y * KACHEL)
        ctx.drawImage(bilder.heu, HEU.x * KACHEL, HEU.y * KACHEL)
        ctx.drawImage(bilder.trog, TROG.x * KACHEL, TROG.y * KACHEL)
        ctx.drawImage(bilder.heu_lose, (TROG.x + 2) * KACHEL - 8, (TROG.y - 2) * KACHEL)
      }
      for (const b of BAEUME) ctx.drawImage(bilder[b.grafik], b.x * KACHEL, b.y * KACHEL)
    })
    return () => {
      aktiv = false
    }
  }, [daten === null, felder, huehner.length > 0, kuehe.length > 0])

  useEffect(() => () => window.clearTimeout(ankunft.current), [])

  /** Figur zu (x, y) in Grafik-Pixeln laufen lassen, danach `dann` ausführen */
  function gehe(x: number, y: number, dann?: () => void) {
    const dx = x - figur.x
    const dy = y - figur.y
    const dauer = ruhig() ? 0 : Math.round((Math.hypot(dx, dy) / TEMPO) * 1000)
    const richtung = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? RICHTUNG.rechts : RICHTUNG.links) : dy < 0 ? RICHTUNG.hoch : RICHTUNG.runter
    setFigur({ x, y, richtung, dauer })
    window.clearTimeout(ankunft.current)
    ankunft.current = window.setTimeout(() => {
      setFigur((f) => ({ ...f, dauer: 0 }))
      dann?.()
    }, dauer)
  }

  async function ausfuehren(rpc: 'pflanzen' | 'ernten' | 'fuettern' | 'verkaufen', args: Record<string, unknown>, erfolg: string) {
    setFehler(null)
    const { data, error } = await supabase.rpc(rpc, { p_token: token, ...args })
    if (error) return setFehler(fehlerText(error))
    setDaten(data as FarmDaten)
    setMenue(null)
    setMeldung(erfolg)
    return true
  }

  if (!daten) return <p className="karte" role={fehler ? 'alert' : 'status'}>{fehler ?? 'Einen Moment …'}</p>

  function feldAntippen(feld: number) {
    const p = daten!.pflanzen.find((x) => x.feld === feld)
    setMeldung(null)
    if (!p) return setMenue({ art: 'feld', feld })
    if (p.reif) return void ausfuehren('ernten', { p_feld: feld }, `Geerntet: ${SORTE_NAME[p.sorte]}!`)
    setMeldung(`${SORTE_NAME[p.sorte]} wächst noch. Jede gelöste Aufgabe gießt deine Felder.`)
  }

  function inDieLandschaft(e: MouseEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget && e.target !== leinwand.current) return
    const r = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - r.left) / mal
    const y = (e.clientY - r.top) / mal
    if (istGras(Math.floor(x / KACHEL), Math.floor(y / KACHEL))) gehe(x, y) // nicht ins Wasser
  }

  const px = (kacheln: number) => kacheln * KACHEL * mal
  const deko = daten.dinge
    .filter((d) => !['huhn', 'kuh', 'brunnen'].includes(d.artikel))
    .flatMap((d) => Array(d.anzahl).fill(d.artikel) as string[])
  const hatBrunnen = daten.dinge.some((d) => d.artikel === 'brunnen')
  const ernte = daten.vorrat.filter((v) => v.sorte in SORTE)
  const erzeugnisse = daten.vorrat.filter((v) => v.sorte in ERZEUGNIS)

  function tierKnopf(t: { id: string; art: string }, o: { x: number; y: number }, groesse: number) {
    return (
      <button
        key={t.id}
        type="button"
        className="farm-ding farm-tier"
        style={{ left: px(o.x), top: px(o.y), zIndex: (o.y + groesse) * KACHEL, ['--lauf' as string]: `${-(t.art === 'kuh' ? 96 : 64) * mal}px` }}
        aria-label={`${TIER_NAME[t.art]} füttern`}
        onClick={() => gehe(o.x * KACHEL + 8 * groesse, (o.y + groesse) * KACHEL + 6, () => setMenue({ art: 'tier', id: t.id }))}
      >
        <Sprite grafik={t.art === 'kuh' ? GRAFIK.kuh : GRAFIK.huhn} mal={mal} />
        {herz === t.id && (
          <span className="farm-herz">
            <Sprite grafik={GRAFIK.herz} mal={mal} titel="Herz" />
          </span>
        )}
      </button>
    )
  }

  const tier = menue?.art === 'tier' ? daten.tiere.find((t) => t.id === menue.id) : undefined

  return (
    <section className="karte farm">
      <h2>Deine Farm</h2>
      <p className="leise">Tippe irgendwohin, dann läuft deine Figur dorthin. Tippe ein Feld oder ein Tier an.</p>
      <div ref={rahmen} className="farm-rahmen">
        <div className="farm-landschaft" style={{ width: px(SPALTEN), height: px(ZEILEN) }} onClick={inDieLandschaft}>
          <canvas ref={leinwand} width={SPALTEN * KACHEL} height={ZEILEN * KACHEL} style={{ width: px(SPALTEN), height: px(ZEILEN) }} aria-hidden="true" />

          {Array.from({ length: felder }, (_, feld) => {
            const ort = FELD_PLAETZE[feld]
            const p = daten.pflanzen.find((x) => x.feld === feld)
            const name = p ? SORTE_NAME[p.sorte] : ''
            const text = !p ? 'leer, antippen zum Pflanzen' : p.reif ? `${name}, reif, antippen zum Ernten` : `${name}, wächst`
            return (
              <button
                key={feld}
                type="button"
                className="farm-feld"
                style={{ left: px(ort.x), top: px(ort.y), width: px(1), height: px(1), zIndex: (ort.y + 1) * KACHEL }}
                aria-pressed={menue?.art === 'feld' && menue.feld === feld}
                aria-label={`Feld ${feld + 1}: ${text}`}
                onClick={() => gehe(ort.x * KACHEL + 8, (ort.y + 1) * KACHEL + 10, () => feldAntippen(feld))}
              >
                {p && <Sprite grafik={GRAFIK.pflanzen} nummer={SORTE[p.sorte] * 4 + p.bild} mal={mal} />}
                {p?.reif && <span className="farm-feld__reif" aria-hidden="true">✓</span>}
              </button>
            )
          })}

          {hatBrunnen && <Ding grafik={GRAFIK.brunnen} x={px(BRUNNEN.x)} y={px(BRUNNEN.y)} mal={mal} z={(BRUNNEN.y + 2) * KACHEL} />}
          {deko.slice(0, DEKO_PLAETZE.length).map((id, i) => {
            const b = artikelBild(id)
            const o = DEKO_PLAETZE[i]
            return <Ding key={i} grafik={b.grafik} nummer={b.nummer} x={px(o.x)} y={px(o.y)} mal={mal} z={(o.y + 1) * KACHEL} />
          })}
          {huehner.map((t, i) => tierKnopf(t, HUHN_PLAETZE[i], 1))}
          {kuehe.map((t, i) => tierKnopf(t, KUH_PLAETZE[i], 2))}

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

      {menue?.art === 'feld' && (
        <FarmMenue titel={`Feld ${menue.feld + 1}: Was möchtest du pflanzen?`} schliessen={() => setMenue(null)}>
          {daten.samen.length === 0 ? (
            <p>
              Du hast noch keine Samen. <a href={shop}>Im Shop</a> gibt es welche.
            </p>
          ) : (
            <MenueListe>
              {daten.samen.map((s) => (
                <MenuePlatz
                  key={s.sorte}
                  grafik={GRAFIK.saatgut}
                  nummer={SORTE[s.sorte] * 2}
                  name={SORTE_NAME[s.sorte]}
                  anzahl={s.anzahl}
                  waehlen={() => void ausfuehren('pflanzen', { p_feld: menue.feld, p_sorte: s.sorte }, `${SORTE_NAME[s.sorte]} gepflanzt!`)}
                />
              ))}
            </MenueListe>
          )}
        </FarmMenue>
      )}

      {tier && (
        <FarmMenue titel={`${TIER_NAME[tier.art]} füttern`} schliessen={() => setMenue(null)}>
          {tier.satt ? (
            <p>Heute ist es satt und zufrieden. Morgen frisst es wieder.</p>
          ) : ernte.length === 0 ? (
            <p>Ernte zuerst etwas auf deinen Feldern. Dann kannst du füttern.</p>
          ) : (
            <MenueListe>
              {ernte.map((v) => (
                <MenuePlatz
                  key={v.sorte}
                  grafik={GRAFIK.saatgut}
                  nummer={SORTE[v.sorte] * 2 + 1}
                  name={SORTE_NAME[v.sorte]}
                  anzahl={v.anzahl}
                  waehlen={() =>
                    void ausfuehren(
                      'fuettern',
                      { p_tier: tier.id, p_sorte: v.sorte },
                      tier.art === 'huhn' ? 'Das Huhn freut sich und legt ein Ei!' : 'Die Kuh freut sich und gibt Milch!',
                    ).then((ok) => {
                      if (!ok) return
                      setHerz(tier.id)
                      window.setTimeout(() => setHerz(null), 2500)
                    })
                  }
                />
              ))}
            </MenueListe>
          )}
        </FarmMenue>
      )}

      {(ernte.length > 0 || erzeugnisse.length > 0) && (
        <>
          <h3>Dein Vorrat</h3>
          <ul className="farm-vorrat">
            {ernte.map((v) => (
              <li key={v.sorte}>
                <Sprite grafik={GRAFIK.saatgut} nummer={SORTE[v.sorte] * 2 + 1} mal={3} /> {SORTE_NAME[v.sorte]}: {v.anzahl}
              </li>
            ))}
            {erzeugnisse.map((v) => {
              const e = ERZEUGNIS[v.sorte]
              return (
                <li key={v.sorte}>
                  <Sprite grafik={e.grafik} mal={3} /> {e.name}: {v.anzahl}
                  <button
                    type="button"
                    className="knopf"
                    onClick={() =>
                      void ausfuehren('verkaufen', { p_sorte: v.sorte }, `Verkauft: ${e.name}. +${e.preis} Münzen für dich!`).then((ok) => ok && nachMuenzen())
                    }
                  >
                    Verkaufen für {e.preis} Münzen
                  </button>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </section>
  )
}

// Menü im Papier-Look (UI Pack): Titel, X zum Schließen, Inhalt scrollt bei vielen Gegenständen
function FarmMenue({ titel, schliessen, children }: { titel: string; schliessen: () => void; children: ReactNode }) {
  useEffect(() => {
    const taste = (e: KeyboardEvent) => e.key === 'Escape' && schliessen()
    window.addEventListener('keydown', taste)
    return () => window.removeEventListener('keydown', taste)
  }, [schliessen])
  return (
    <div className="fenster-hintergrund" onClick={(e) => e.target === e.currentTarget && schliessen()}>
      <div className="farm-menue" role="dialog" aria-modal="true" aria-label={titel}>
        <div className="farm-menue__kopf">
          <h3>{titel}</h3>
          {/* eslint-disable-next-line jsx-a11y/no-autofocus -- Fenster: Fokus muss hinein */}
          <button type="button" className="farm-menue__zu" onClick={schliessen} aria-label="Menü schließen" autoFocus>
            <Sprite grafik={GRAFIK.knopf_x} mal={3} />
          </button>
        </div>
        <div className="farm-menue__inhalt">{children}</div>
      </div>
    </div>
  )
}

const MenueListe = ({ children }: { children: ReactNode }) => <ul className="farm-menue__liste">{children}</ul>

function MenuePlatz(props: { grafik: Grafik; nummer: number; name: string; anzahl: number; waehlen: () => void }) {
  return (
    <li>
      <button type="button" className="farm-menue__platz" onClick={props.waehlen}>
        <span className="farm-menue__bild">
          <Sprite grafik={props.grafik} nummer={props.nummer} mal={3} />
          <span className="farm-menue__anzahl">{props.anzahl}</span>
        </span>
        {props.name}
      </button>
    </li>
  )
}

// Ein Gegenstand in der Landschaft (Deko); z = untere Kante in Grafik-Pixeln, damit Vorderes vorne liegt
function Ding(props: { grafik: Grafik; nummer?: number; x: number; y: number; mal: number; z: number }) {
  return (
    <span className="farm-ding" style={{ left: props.x, top: props.y, zIndex: props.z }}>
      <Sprite grafik={props.grafik} nummer={props.nummer} mal={props.mal} />
    </span>
  )
}
