// Übungsumbau Schritt 8: Spielszene über der Runde (Konzept Abschnitte 10 und 11).
// Wiese, Einstein links, Monster rechts (Ruhe-Animation). Richtige Runde: Einstein wirft, Herz fliegt und trifft.
// Falsche Runde: Herz fliegt vorbei, Einstein erschrickt und bleibt so bis zum nächsten Treffer. Kein Herzzähler.
// Reine Verzierung (aria-hidden): was passiert ist, steht immer auch als Text in der Rückmeldung.
import { useEffect, useState, type CSSProperties } from 'react'
import { Einstein, type Pose } from '../gemeinsam/Einstein'
import { Sprite } from '../gemeinsam/Sprite'
import { GRAFIK } from '../grafik'
import { monster, spielMal } from '../lib/monster'

export type Schuss = { nr: number; treffer: boolean }

type Props = {
  monsterName: string
  /** letzter Schuss (nr startet die Animation neu) */
  schuss: Schuss | null
  /** Herz über dem Kopf */
  befreundet: boolean
  /** Übung beendet: Einstein freut sich (befreundet) oder erklärt */
  ende?: 'freund' | 'morgen'
}

export function Spielszene({ monsterName, schuss, befreundet, ende }: Props) {
  // nach einem Treffer kurz „wirft“, dann wieder normal
  const [wirft, setWirft] = useState(false)
  useEffect(() => {
    if (!schuss?.treffer) return
    setWirft(true)
    const t = window.setTimeout(() => setWirft(false), 500)
    return () => window.clearTimeout(t)
  }, [schuss])

  const pose: Pose = ende === 'freund' ? 'freut-sich' : ende === 'morgen' ? 'erklaert' : schuss && !schuss.treffer ? 'huch' : wirft ? 'schiesst' : 'freundlich'
  const m = monster(monsterName)
  const mal = spielMal(m.grafik)
  const bilder = Math.round(m.grafik.breite / m.grafik.bildBreite)
  const lauf = { '--n': bilder, '--ende': `${-m.grafik.breite * mal}px` } as CSSProperties
  const reaktion = schuss ? (schuss.treffer ? ' spiel__monster--treffer' : ' spiel__monster--daneben') : ''

  return (
    <div className="spiel" aria-hidden="true" style={{ backgroundImage: `url(${GRAFIK.spiel_wiese.url})` }}>
      <div className="spiel__einstein">
        <Einstein pose={pose} mal={3} />
      </div>
      <div key={`monster-${schuss?.nr ?? 'start'}`} className={`spiel__monster${reaktion}`}>
        {befreundet && (
          <span className="spiel__freund">
            <Sprite grafik={GRAFIK.herz} mal={3} />
          </span>
        )}
        <span className="spiel__monster-bild" style={lauf}>
          <Sprite grafik={m.grafik} mal={mal} />
        </span>
      </div>
      {schuss && (
        <span key={`herz-${schuss.nr}`} className={`spiel__herz spiel__herz--${schuss.treffer ? 'treffer' : 'daneben'}`}>
          <Sprite grafik={GRAFIK.herz_flug} mal={3} />
        </span>
      )}
    </div>
  )
}
