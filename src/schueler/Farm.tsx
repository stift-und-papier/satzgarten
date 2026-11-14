// Farm als Landschaft (Lehrkraft 2026-11-12): Insel mit Acker, Hühnerstall und Scheune (erst mit dem ersten Tier), Bäumen und Deko.
// Die Figur läuft dorthin, wo man tippt. Feld oder Tier antippen öffnet ein Menü (UI Pack) mit Samen bzw. Futter.
// Alles bleibt auch ohne Figur bedienbar (Felder und Tiere sind Knöpfe). Wachstum und Füttern rechnet der Server.
import { useCallback, useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { Sprite } from '../gemeinsam/Sprite'
import { Symbol } from '../gemeinsam/Symbol'
import { GRAFIK } from '../grafik'
import { fehlerText } from '../lib/fehler'
import { figur as figurAus } from '../lib/figur'
import {
  ablagePlaetze, BAEUME, BAUM_PLAETZE, BOOT, BRUNNEN, DEKO_PLAETZE, FELD_PLAETZE, FIGUR_START, grundKacheln, HEU, hindernisse, HUHN_PLAETZE, istGras, KACHEL,
  KUH_PLAETZE, nebenan, scheunenKacheln, SPALTEN, STALL, tierFlaeche, TROG, weg, ZEILEN, type Ort,
} from '../lib/landschaft'
import { artikelBild, DEKO_NAME, OBSTBAUM, SORTE, SORTE_NAME, vorratDing, type Farm as FarmDaten } from '../lib/shop'
import { einzelbild, type Grafik } from '../lib/sprite'
import { supabase } from '../lib/supabase'
import { FigurWahl } from './Einstellungen'
import { FarmTier } from './FarmTier'

const TEMPO = 50 // Grafik-Pixel pro Sekunde
const ruhig = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const TIER_NAME: Record<string, string> = { huhn: 'Huhn', kuh: 'Kuh' }
// Mitte einer Kachel, Füße der Figur etwas unterhalb der Mitte
const mitte = (o: Ort) => ({ x: o.x * KACHEL + 8, y: o.y * KACHEL + 12 })
/** Spalte im Figurenbild: 0 hoch, 1 rechts oben, 2 rechts, … 6 links, 7 links oben */
const richtungZu = (dx: number, dy: number) => (Math.round(Math.atan2(dx, -dy) / (Math.PI / 4)) + 8) % 8

type Menue = { art: 'feld'; feld: number } | { art: 'tier'; id: string }
// shortcut: ausgeblendete Deko merkt sich nur dieses Gerät (wie Dunkler Modus). Soll es auf jedem iPad gelten, in die Datenbank (wie figur).
const DEKO_AUS = 'wortsalat-farm-deko-aus'

export function Farm({ token, shop, album, figur: figurName, nachFigur }: { token: string; shop: string; album: string; figur: string; nachFigur: () => void }) {
  const [daten, setDaten] = useState<FarmDaten | null>(null)
  const [meldung, setMeldung] = useState<string | null>(null)
  const [fehler, setFehler] = useState<string | null>(null)
  const [menue, setMenue] = useState<Menue | null>(null)
  const [herz, setHerz] = useState<string | null>(null) // Tier, über dem gerade ein Herz erscheint
  const [faellt, setFaellt] = useState<string | null>(null) // Obstbaum, von dem gerade die Früchte fallen
  const [mal, setMal] = useState(2)
  const [figur, setFigur] = useState({ ...mitte(FIGUR_START), richtung: 4, dauer: 0 })
  const rahmen = useRef<HTMLDivElement>(null)
  const leinwand = useRef<HTMLCanvasElement>(null)
  const ankunft = useRef<number>(undefined)
  const [blase, setBlase] = useState(true) // Sprechblase „… kann geerntet werden!“, bis man zum ersten Mal tippt
  const [blasenBreite, setBlasenBreite] = useState(0) // gemessen, in Grafik-Pixeln
  const [einrichten, setEinrichten] = useState(false) // Fenster hinter dem Zahnrad: Figur und Deko
  const [dekoAus, setDekoAus] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(DEKO_AUS) ?? '[]') as string[]
    } catch {
      return []
    }
  })

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
    const namen = ['wasser', 'gras', 'gras_deko', 'feld', 'wand', 'heu', 'trog', 'baum', 'baum_klein', 'stall'] as const
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
      // Felder einzeln (Lehrkraft 2026-11-12): Ackerstück 14 × 14 mitten in der Kachel, so bleibt ringsum ein kleiner Abstand
      for (const o of FELD_PLAETZE.slice(0, felder)) ctx.drawImage(bilder.feld, o.x * KACHEL + 1, o.y * KACHEL + 1)
      if (huehner.length) ctx.drawImage(bilder.stall, STALL.x * KACHEL, STALL.y * KACHEL)
      if (kuehe.length) {
        for (const k of scheunenKacheln()) kachel('wand', k.nummer, k.x, k.y)
        ctx.drawImage(bilder.heu, HEU.x * KACHEL, HEU.y * KACHEL)
        ctx.drawImage(bilder.trog, TROG.x * KACHEL, TROG.y * KACHEL)
      }
      for (const b of BAEUME) ctx.drawImage(bilder[b.grafik], b.x * KACHEL, b.y * KACHEL)
    })
    return () => {
      aktiv = false
    }
  }, [daten === null, felder, huehner.length > 0, kuehe.length > 0])

  useEffect(() => () => window.clearTimeout(ankunft.current), [])

  // Lehrkraft 2026-11-12: Die Blase steht immer links von der Figur. Fehlt dort Platz, läuft die Figur zuerst nach rechts.
  const blasenPlatz = blasenBreite + 8
  useEffect(() => {
    if (!blase || !blasenBreite || figur.dauer > 0 || figur.x >= blasenPlatz) return
    gehe((o) => mitte(o).x >= blasenPlatz, undefined, true)
  }, [blase, blasenPlatz])

  /**
   * Figur auf kürzestem Weg um Hindernisse herum zur nächsten Kachel laufen lassen, für die `ziel` gilt; danach `dann`.
   * Gibt es keinen Weg, passiert `dann` sofort (alles bleibt bedienbar).
   */
  function gehe(ziel: (o: Ort) => boolean, dann?: () => void, vonSelbst = false) {
    window.clearTimeout(ankunft.current)
    if (!vonSelbst) setBlase(false)
    const start = { x: Math.floor(figur.x / KACHEL), y: Math.floor(figur.y / KACHEL) }
    const pfad = weg(start, ziel, besetzt)
    if (!pfad) return dann?.()
    // nur Knickpunkte anlaufen
    const punkte = pfad.filter((o, i) => {
      const vor = i ? pfad[i - 1] : start
      const nach = pfad[i + 1]
      return !nach || nach.x - o.x !== o.x - vor.x || nach.y - o.y !== o.y - vor.y
    })
    const schritt = (i: number, von: { x: number; y: number }) => {
      if (i === punkte.length) {
        setFigur((f) => ({ ...f, dauer: 0 }))
        return dann?.()
      }
      const p = mitte(punkte[i])
      const dauer = ruhig() ? 0 : Math.round((Math.hypot(p.x - von.x, p.y - von.y) / TEMPO) * 1000)
      setFigur({ ...p, richtung: richtungZu(p.x - von.x, p.y - von.y), dauer })
      ankunft.current = window.setTimeout(() => schritt(i + 1, p), dauer)
    }
    schritt(0, figur)
  }

  async function ausfuehren(rpc: 'pflanzen' | 'ernten' | 'fuettern' | 'einsammeln', args: Record<string, unknown>, erfolg: string | ((neu: FarmDaten) => string)) {
    setFehler(null)
    const { data, error } = await supabase.rpc(rpc, { p_token: token, ...args })
    if (error) return setFehler(fehlerText(error))
    setDaten(data as FarmDaten)
    setMenue(null)
    setMeldung(typeof erfolg === 'string' ? erfolg : erfolg(data as FarmDaten))
    return true
  }

  if (!daten) return <p className="karte" role={fehler ? 'alert' : 'status'}>{fehler ?? 'Einen Moment …'}</p>

  function feldAntippen(feld: number) {
    const p = daten!.pflanzen.find((x) => x.feld === feld)
    setMeldung(null)
    if (!p) return setMenue({ art: 'feld', feld })
    if (p.reif) return void ausfuehren('ernten', { p_feld: feld }, `Geerntet! ${SORTE_NAME[p.sorte]} liegt jetzt beim Feld. Tippe es an zum Einsammeln.`)
    setMeldung(`${SORTE_NAME[p.sorte]} wächst noch. Jede gelöste Aufgabe gießt deine Felder.`)
  }

  function inDieLandschaft(e: MouseEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget && e.target !== leinwand.current) return
    const r = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - r.left) / mal
    const y = (e.clientY - r.top) / mal
    const ziel = { x: Math.floor(x / KACHEL), y: Math.floor(y / KACHEL) }
    if (istGras(ziel.x, ziel.y) && !besetzt.has(`${ziel.x},${ziel.y}`)) gehe((o) => o.x === ziel.x && o.y === ziel.y)
  }

  const px = (kacheln: number) => kacheln * KACHEL * mal
  // Deko lässt sich im Fenster „Farm einrichten“ ausblenden (gekauft bleibt sie)
  const dekoArten = daten.dinge.map((d) => d.artikel).filter((id) => !['huhn', 'kuh'].includes(id))
  const dinge = daten.dinge.filter((d) => !dekoAus.includes(d.artikel))
  const deko = dinge
    .filter((d) => !['huhn', 'kuh', 'brunnen', 'boot'].includes(d.artikel))
    .flatMap((d) => Array(d.anzahl).fill(d.artikel) as string[])
    .slice(0, DEKO_PLAETZE.length)
  const hatBrunnen = dinge.some((d) => d.artikel === 'brunnen')
  const hatBoot = dinge.some((d) => d.artikel === 'boot')
  function dekoSchalten(id: string) {
    const neu = dekoAus.includes(id) ? dekoAus.filter((x) => x !== id) : [...dekoAus, id]
    setDekoAus(neu)
    try {
      localStorage.setItem(DEKO_AUS, JSON.stringify(neu))
    } catch {
      // Speicher gesperrt (privater Modus): gilt dann nur, bis die Seite neu lädt
    }
  }
  const baeume = daten.baeume.filter((b) => BAUM_PLAETZE[b.art])
  const besetzt = hindernisse({
    deko: deko.length, brunnen: hatBrunnen, huehner: huehner.length, kuehe: kuehe.length, obstbaeume: baeume.map((b) => b.art),
  })
  const ernte = daten.vorrat.filter((v) => v.sorte in SORTE)
  // Was auf der Farm liegt: Ernte beim Feld, Ei/Milch beim Tier (Plätze rechnet ablagePlaetze, nichts überdeckt sich)
  const tierOrt = new Map<string, Ort[]>([
    ...huehner.map((t, i) => [`tier:${t.id}`, tierFlaeche(HUHN_PLAETZE[i], 1)] as const),
    ...kuehe.map((t, i) => [`tier:${t.id}`, tierFlaeche(KUH_PLAETZE[i], 2)] as const),
    ...baeume.map((b) => [`baum:${b.id}`, tierFlaeche(BAUM_PLAETZE[b.art], 2)] as const),
  ])
  const bepflanzt = new Set(daten.pflanzen.map((p) => `${FELD_PLAETZE[p.feld].x},${FELD_PLAETZE[p.feld].y}`))
  const liegenOrte = ablagePlaetze(
    daten.liegen.map((d) => (d.bei.startsWith('feld:') ? [FELD_PLAETZE[Number(d.bei.slice(5))]] : (tierOrt.get(d.bei) ?? [FIGUR_START]))),
    besetzt,
    bepflanzt,
  )

  // Wie weit das Bild wandern darf: eine Kuh allein in der Scheune nutzt die ganze Breite (der Platz daneben ist dann gesperrt,
  // siehe hindernisse), zwei Kühe drinnen nur wenig; draußen und Hühner ein kleines Stück.
  const bereich = (art: string, i: number): [number, number] =>
    art === 'huhn' ? [-6, 6] : i >= 2 ? [-8, 8] : kuehe.length === 1 ? [0, 2 * KACHEL] : i === 0 ? [-2, 4] : [-4, 2]

  // Obstbaum ernten (Lehrkraft 2026-11-12): Früchte fallen einmal herunter, danach sind die 3 Früchte im Vorrat (nichts liegt herum)
  async function baumErnten(id: string, name: string, fruechte: string) {
    setFehler(null)
    setMeldung(null)
    setFaellt(id)
    const [{ data, error }] = await Promise.all([
      supabase.rpc('baum_ernten', { p_token: token, p_baum: id }),
      new Promise((fertig) => window.setTimeout(fertig, ruhig() ? 0 : 1200)),
    ])
    setFaellt(null)
    if (error) return setFehler(fehlerText(error))
    setDaten(data as FarmDaten)
    setMeldung(`Geerntet! 3 ${fruechte} vom ${name} sind jetzt in deinem Vorrat.`)
  }

  // Obstbaum: steht still (mit Obst, wenn reif); nur beim Ernten bewegt er sich
  function baumKnopf(b: { id: string; art: string; tage: number }) {
    const o = BAUM_PLAETZE[b.art]
    const info = OBSTBAUM[b.art]
    const reif = b.tage === 0
    const zeile =
      faellt === b.id
        ? { grafik: info.grafik, nummer: 36, bilder: 12 }
        : reif
          ? { grafik: info.grafik, nummer: 0, bilder: 1 }
          : { grafik: GRAFIK.baum_ohne_obst, nummer: 0, bilder: 1 }
    const wann = b.tage === 1 ? 'morgen' : `in ${b.tage} Tagen`
    return (
      <button
        key={b.id}
        type="button"
        className="farm-ding farm-baum"
        style={{ left: px(o.x), top: px(o.y), width: px(2), height: px(2), zIndex: (o.y + 2) * KACHEL }}
        aria-label={reif ? `${info.name}: reif, antippen zum Ernten` : `${info.name}: trägt ${wann} wieder Früchte`}
        onClick={() =>
          gehe(nebenan(tierFlaeche(o, 2)), () => {
            if (!reif) return setMeldung(`Der ${info.name} trägt ${wann} wieder Früchte. Du kannst Obstbäume einmal pro Woche ernten.`)
            void baumErnten(b.id, info.name, info.fruechte)
          })
        }
      >
        <span
          className="farm-baum__bild"
          data-faellt={faellt === b.id || undefined}
          style={{ left: -8 * mal, top: -12 * mal, ['--bilder' as string]: zeile.bilder, ['--lauf' as string]: `${-zeile.bilder * 48 * mal}px` }}
        >
          <Sprite key={zeile.grafik.url + zeile.nummer} grafik={zeile.grafik} nummer={zeile.nummer} mal={mal} />
        </span>
      </button>
    )
  }

  function tierKnopf(t: { id: string; art: string }, o: { x: number; y: number }, groesse: number, i: number) {
    return (
      <button
        key={t.id}
        type="button"
        className="farm-ding farm-tier"
        style={{ left: px(o.x), top: px(o.y), zIndex: (o.y + groesse) * KACHEL }}
        aria-label={`${TIER_NAME[t.art]} füttern`}
        onClick={() => gehe(nebenan(tierFlaeche(o, groesse)), () => setMenue({ art: 'tier', id: t.id }))}
      >
        <FarmTier art={t.art === 'kuh' ? 'kuh' : 'huhn'} mal={mal} von={bereich(t.art, i)[0]} bis={bereich(t.art, i)[1]} />
        {herz === t.id && (
          <span className="farm-herz">
            <Sprite grafik={GRAFIK.herz} mal={mal} titel="Herz" />
          </span>
        )}
      </button>
    )
  }

  const tier = menue?.art === 'tier' ? daten.tiere.find((t) => t.id === menue.id) : undefined

  // Lehrkraft 2026-11-12: statt Haken sagt die Figur, was reif ist
  const reifes = [
    ...daten.pflanzen.filter((p) => p.feld < felder && p.reif).map((p) => SORTE_NAME[p.sorte]),
    ...daten.baeume.filter((b) => b.tage === 0 && b.art in BAUM_PLAETZE).map((b) => OBSTBAUM[b.art].name),
  ]
  const blasenText = reifes.length > 1 ? 'Ich kann heute vieles ernten!' : reifes.length ? `${reifes[0]} kann geerntet werden!` : null

  return (
    // Jazz 2026-11-14: Spiel-Oberfläche statt Karte. Leiste (Sammelalbum, Zahnrad), Spielfenster in voller Breite, Vorrat als Tafel.
    <section className="farm" style={{ ['--farm-breite' as string]: `${px(SPALTEN)}px` }}>
      <div className="farm-leiste">
        <a className="holzknopf" href={album} aria-label="Mein Sammelalbum">
          <Symbol name="sammelbuch" />
        </a>
        <h2>Deine Farm</h2>
        <button type="button" className="holzknopf" aria-label="Farm einrichten" onClick={() => setEinrichten(true)}>
          <Symbol name="einstellungen" />
        </button>
      </div>
      {/* Usability-Test 2026-11-13: Meldungen stehen über der Karte (unter ihr waren sie am iPad außer Sicht); fester Platz, damit die Karte nicht springt */}
      <div className="farm-meldung">
        {fehler ? (
          <p role="alert">{fehler}</p>
        ) : (
          <p role="status" className={meldung ? undefined : 'leise'}>
            {meldung ?? 'Tippe irgendwohin, dann läuft deine Figur dorthin. Tippe ein Feld, ein Tier oder einen Obstbaum an.'}
          </p>
        )}
      </div>
      <div ref={rahmen} className="farm-rahmen">
        {/* Jazz 2026-11-14: Holzrahmen wie ein Spielfenster; liegt über dem äußeren Wasserstreifen der Karte (bausteine.css) */}
        <div className="spiel-fenster">
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
                onClick={() => gehe(nebenan([ort]), () => feldAntippen(feld))}
              >
                {p && <Sprite grafik={GRAFIK.pflanzen} nummer={SORTE[p.sorte] * 4 + p.bild} mal={mal} />}
              </button>
            )
          })}

          {hatBoot && (
            <span className="farm-ding farm-boot" style={{ left: px(BOOT.x), top: px(BOOT.y), zIndex: BOOT.y * KACHEL, ['--lauf' as string]: `${-96 * mal}px` }}>
              <Sprite grafik={GRAFIK.deko_boot} mal={mal} />
            </span>
          )}
          {baeume.map((b) => baumKnopf(b))}
          {hatBrunnen && <Ding grafik={GRAFIK.brunnen} x={px(BRUNNEN.x)} y={px(BRUNNEN.y)} mal={mal} z={(BRUNNEN.y + 2) * KACHEL} />}
          {deko.map((id, i) => {
            const b = artikelBild(id)
            const o = DEKO_PLAETZE[i]
            return <Ding key={i} grafik={b.grafik} nummer={b.nummer} x={px(o.x)} y={px(o.y)} mal={mal} z={(o.y + 1) * KACHEL} />
          })}
          {huehner.map((t, i) => tierKnopf(t, HUHN_PLAETZE[i], 1, i))}
          {kuehe.map((t, i) => tierKnopf(t, KUH_PLAETZE[i], 2, i))}
          {daten.liegen.map((d, i) => {
            const o = liegenOrte[i]
            const ding = vorratDing(d.sorte)
            return (
              <button
                key={d.id}
                type="button"
                className="farm-ding farm-liegt"
                style={{ left: px(o.x), top: px(o.y), width: px(1), height: px(1), zIndex: (o.y + 1) * KACHEL + 1 }}
                aria-label={`${ding.name} einsammeln`}
                onClick={() =>
                  gehe(
                    (z) => z.x === o.x && z.y === o.y,
                    () => void ausfuehren('einsammeln', { p_ding: d.id }, `Eingesammelt: ${ding.name}. Es liegt jetzt in deinem Vorrat.`),
                  )
                }
              >
                <Sprite grafik={ding.grafik} nummer={ding.nummer} mal={mal} />
              </button>
            )
          })}

          <span
            className={`farm-figur${figur.dauer > 0 ? ' farm-figur--laeuft' : ''}`}
            aria-hidden="true"
            style={{
              left: (figur.x - 8) * mal,
              top: (figur.y - 30) * mal,
              width: 16 * mal,
              height: 32 * mal,
              zIndex: Math.round(figur.y),
              transition: `left ${figur.dauer}ms linear, top ${figur.dauer}ms linear`,
              backgroundImage: `url(${figurAus(figurName).grafik.url})`, // gewählte Figur (Einstellungen)
              backgroundSize: `${128 * mal}px ${96 * mal}px`,
              backgroundPositionX: -figur.richtung * 16 * mal,
              backgroundPositionY: -32 * mal, // Stehen (mittlere Zeile)
              ['--lauf' as string]: `${-96 * mal}px`,
            }}
          />

          {blase && blasenText && (
            <span
              className="farm-blase"
              ref={(el) => {
                const b = el ? Math.ceil(el.offsetWidth / mal) : 0
                if (b && b !== blasenBreite) setBlasenBreite(b)
              }}
              style={{
                ['--bild' as string]: `url(${GRAFIK.dialog_blase.url})`,
                right: (SPALTEN * KACHEL - figur.x + 6) * mal,
                top: (figur.y - 22) * mal,
                // erst zeigen, wenn die Figur steht und links genug Platz ist
                visibility: figur.dauer === 0 && figur.x >= blasenPlatz ? undefined : 'hidden',
              }}
            >
              {blasenText}
            </span>
          )}
        </div>
        </div>
      </div>


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
                  waehlen={() => void ausfuehren('pflanzen', { p_feld: menue.feld, p_sorte: s.sorte }, `${SORTE_NAME[s.sorte]} gepflanzt! Jede gelöste Aufgabe gießt deine Felder.`)}
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
            <>
            <p>Gib {tier.art === 'huhn' ? 'dem Huhn' : 'der Kuh'} etwas aus deinem Vorrat. Dafür bekommst du {tier.art === 'huhn' ? 'ein Ei' : 'Milch'}.</p>
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
                      (neu) => {
                        // das Neueste, was jetzt beim Tier liegt (Ei bzw. Milch in der Güte des Futters)
                        const ding = neu.liegen.filter((x) => x.bei === `tier:${tier.id}`).at(-1)
                        const was = ding ? vorratDing(ding.sorte).name : tier.art === 'huhn' ? 'Ei' : 'Milch'
                        return `${tier.art === 'huhn' ? 'Das Huhn freut sich. Neben ihm' : 'Die Kuh freut sich. Neben ihr'} liegt jetzt: ${was}. Tippe es an zum Einsammeln.`
                      },
                    ).then((ok) => {
                      if (!ok) return
                      setHerz(tier.id)
                      window.setTimeout(() => setHerz(null), 2500)
                    })
                  }
                />
              ))}
            </MenueListe>
            </>
          )}
        </FarmMenue>
      )}

      {einrichten && (
        <FarmMenue titel="Farm einrichten" schliessen={() => setEinrichten(false)}>
          <h4>Deine Figur</h4>
          <FigurWahl token={token} figur={figurName} nachWahl={nachFigur} />
          <h4>Deko auf der Farm</h4>
          {dekoArten.length === 0 ? (
            <p>
              Du hast noch keine Deko. <a href={shop}>Im Shop</a> gibt es welche.
            </p>
          ) : (
            <div className="farm-deko-wahl">
              {dekoArten.map((id) => (
                <button key={id} type="button" role="switch" aria-checked={!dekoAus.includes(id)} className="schalter" onClick={() => dekoSchalten(id)}>
                  <span className="schalter__bahn" aria-hidden="true">
                    <span className="schalter__knopf" />
                  </span>
                  {DEKO_NAME[id] ?? id}
                </button>
              ))}
            </div>
          )}
        </FarmMenue>
      )}

      <div className="pixel-tafel farm-vorrat-tafel">
        <h3>Dein Vorrat</h3>
        {daten.vorrat.length === 0 ? (
          <p>Noch leer. Was du erntest und einsammelst, liegt hier.</p>
        ) : (
          <ul className="farm-vorrat">
            {daten.vorrat.map((v) => {
              const d = vorratDing(v.sorte)
              return (
                <li key={v.sorte}>
                  <span className="farm-menue__bild">
                    <Sprite grafik={d.grafik} nummer={d.nummer} mal={3} />
                    <span className="farm-menue__anzahl">{v.anzahl}</span>
                  </span>
                  {d.name}
                </li>
              )
            })}
          </ul>
        )}
      </div>
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
