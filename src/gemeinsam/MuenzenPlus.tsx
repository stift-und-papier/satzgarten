import { GRAFIK } from '../grafik'
import { Sprite } from './Sprite'

// „+15 Münzen“ nach einer Abgabe – die Zahl rechnet allein der Server (antwort_abgeben).
export function MuenzenPlus({ anzahl }: { anzahl?: number }) {
  if (!anzahl) return null
  return (
    <p className="muenzen-plus">
      <Sprite grafik={GRAFIK.muenze} mal={2} /> +{anzahl} {anzahl === 1 ? 'Münze' : 'Münzen'} für dich!
    </p>
  )
}
