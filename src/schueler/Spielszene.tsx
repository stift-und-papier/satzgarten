// Übungsumbau Schritt 8: Spielszene über der Runde (Konzept Abschnitte 10 und 11).
// Wiese, Spielfigur links (die in den Einstellungen gewählte; Jazz 2026-11-13 statt Einstein), Monster rechts (Ruhe-Animation).
// Richtige Runde: Figur macht einen Schritt nach vorn, Herz fliegt und trifft. Falsche Runde: Herz fliegt vorbei, die Figur dreht sich
// zu uns und wackelt; so bleibt sie bis zum nächsten Treffer. Befreundet: Figur hüpft. Kein Herzzähler.
// Reine Verzierung (aria-hidden): was passiert ist, steht immer auch als Text in der Rückmeldung.
import { useEffect, useState, type CSSProperties } from 'react'
import { Sprite } from '../gemeinsam/Sprite'
import { GRAFIK } from '../grafik'
import { figur, figurBild } from '../lib/figur'
import { monster, spielMal } from '../lib/monster'

export type Schuss = { nr: number; treffer: boolean }

type Props = {
  figurName: string
  monsterName: string
  /** letzter Schuss (nr startet die Animation neu) */
  schuss: Schuss | null
  /** Herz über dem Kopf */
  befreundet: boolean
  /** Übung beendet: Einstein freut sich (befreundet) oder erklärt */
  ende?: 'freund' | 'morgen'
}

export function Spielszene({ figurName, monsterName, schuss, befreundet, ende }: Props) {
  // nach einem Treffer kurz ein Schritt nach vorn, dann wieder stehen
  const [wirft, setWirft] = useState(false)
  useEffect(() => {
    if (!schuss?.treffer) return
    setWirft(true)
    const t = window.setTimeout(() => setWirft(false), 500)
    return () => window.clearTimeout(t)
  }, [schuss])

  const pose = ende === 'freund' ? 'freut' : ende ? 'vorn' : schuss && !schuss.treffer ? 'huch' : wirft ? 'wirft' : 'steht'
  // Richtung 2 = nach rechts zum Monster, 4 = zu uns; beim Werfen das erste Laufbild
  const bild = pose === 'steht' ? figurBild(2) : pose === 'wirft' ? figurBild(2, 0) : figurBild(4)
  const m = monster(monsterName)
  const mal = spielMal(m.grafik)
  const bilder = Math.round(m.grafik.breite / m.grafik.bildBreite)
  const lauf = { '--n': bilder, '--ende': `${-m.grafik.breite * mal}px` } as CSSProperties
  const reaktion = schuss ? (schuss.treffer ? ' spiel__monster--treffer' : ' spiel__monster--daneben') : ''

  return (
    <div className="spiel spiel-fenster" aria-hidden="true" style={{ backgroundImage: `url(${GRAFIK.spiel_wiese.url})` }}>
      <div className={`spiel__figur spiel__figur--${pose}`}>
        <Sprite grafik={figur(figurName).grafik} nummer={bild} mal={4} />
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
