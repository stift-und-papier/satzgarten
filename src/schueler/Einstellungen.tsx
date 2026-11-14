// Übungsumbau (Jazz, 2026-11-13): Reiter „Einstellungen“ für Schüler:innen: Spielfigur (in der Datenbank, gilt auf jedem iPad),
// Dunkler Modus und Leseschrift (auf diesem Gerät; vorher oben auf der Hilfe-Seite).
import { useState } from 'react'
import { Sprite } from '../gemeinsam/Sprite'
import { FIGUREN, figurBild, type FigurName } from '../lib/figur'
import { fehlerText } from '../lib/fehler'
import { useLeseschrift } from '../lib/leseschrift'
import { supabase } from '../lib/supabase'
import { useDunkel } from '../lib/thema'

/** Auswahl der Spielfigur; auch im Fenster „Farm einrichten“ (Zahnrad auf der Farm, Jazz 2026-11-14) */
export function FigurWahl({ token, figur, nachWahl }: { token: string; figur: string; nachWahl: () => void }) {
  const [gewaehlt, setGewaehlt] = useState(figur)
  const [fehler, setFehler] = useState<string | null>(null)

  async function waehlen(name: FigurName) {
    const vorher = gewaehlt
    setGewaehlt(name)
    setFehler(null)
    const { error } = await supabase.rpc('figur_waehlen', { p_token: token, p_figur: name })
    if (error) {
      setGewaehlt(vorher)
      setFehler(fehlerText(error))
    } else nachWahl()
  }

  return (
    <>
      <div className="figur-wahl" role="group" aria-label="Figur wählen">
        {(Object.keys(FIGUREN) as FigurName[]).map((name) => (
          <button key={name} type="button" className="chip figur-wahl__knopf" aria-pressed={gewaehlt === name} onClick={() => void waehlen(name)}>
            <Sprite grafik={FIGUREN[name].grafik} nummer={figurBild(4)} mal={3} />
            <span>
              <span className={gewaehlt === name ? 'chip__haken' : 'chip__haken chip__haken--aus'} aria-hidden="true">
                ✓{' '}
              </span>
              {FIGUREN[name].name}
            </span>
          </button>
        ))}
      </div>
      {fehler && <p role="alert">{fehler}</p>}
    </>
  )
}

export function Einstellungen({ token, figur, nachWahl }: { token: string; figur: string; nachWahl: () => void }) {
  const [lrs, setLrs] = useLeseschrift()
  const [dunkel, setDunkel] = useDunkel()

  return (
    <>
      <header className="karte">
        <h1>Einstellungen</h1>
      </header>
      <section className="karte">
        <h2>Deine Figur</h2>
        <p>Sie läuft auf deiner Farm und hilft dir in den Übungen.</p>
        <FigurWahl token={token} figur={figur} nachWahl={nachWahl} />
      </section>
      <section className="karte">
        <h2>Ansicht</h2>
        <p>Das gilt nur auf diesem Gerät.</p>
        <div className="knopf-reihe">
          <button type="button" role="switch" aria-checked={dunkel} className="schalter" onClick={() => setDunkel(!dunkel)}>
            <span className="schalter__bahn" aria-hidden="true">
              <span className="schalter__knopf" />
            </span>
            Dunkler Modus
          </button>
          <button type="button" role="switch" aria-checked={lrs} className="schalter" onClick={() => setLrs(!lrs)}>
            <span className="schalter__bahn" aria-hidden="true">
              <span className="schalter__knopf" />
            </span>
            Leseschrift für LRS
          </button>
        </div>
      </section>
    </>
  )
}
