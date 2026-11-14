// Auswahl der Spielfigur (in der Datenbank, gilt auf jedem iPad). Steht im Fenster „Farm einrichten“ (Zahnrad auf der Farm).
// Jazz 2026-11-14: Die Seite „Einstellungen“ gibt es nicht mehr: Leseschrift ist immer an, der Dunkel-Schalter steht oben auf jeder Seite.
import { useState } from 'react'
import { Sprite } from '../gemeinsam/Sprite'
import { FIGUREN, figurBild, type FigurName } from '../lib/figur'
import { fehlerText } from '../lib/fehler'
import { supabase } from '../lib/supabase'

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
