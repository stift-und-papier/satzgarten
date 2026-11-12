// Monster über der Aufgabe (Aufgabe 41b, docs/SPEC-monster.md). Treffer, „durch“ und Monster-Art rechnet der Server
// (Funktion kampf); hier nur Anzeige. Der Figur passiert nie etwas. Lebensbalken ohne Zahlen, besiegt = läuft davon.
import { useEffect, useRef, useState } from 'react'
import { Sprite } from '../gemeinsam/Sprite'
import { GRAFIK } from '../grafik'
import type { SchuelerPaket } from '../lib/typen'

const MONSTER = {
  1: { name: 'Rübchen', der: 'Das', grafik: GRAFIK.monster_1 },
  2: { name: 'Schleim', der: 'Der', grafik: GRAFIK.monster_2 },
  3: { name: 'Ork', der: 'Der', grafik: GRAFIK.monster_3 },
} as const

// Spielfigur steht und schaut schräg nach rechts vorne (Gesicht sichtbar): Zeile 1 (stehen), Spalte 3
const FIGUR_RECHTS = 8 + 3

// aufgabeId: auf der Seite einer Aufgabe; trifft sie heute nicht (Lösung angesehen), sagen wir das statt „Daneben“
export function Kampf({ paket, aufgabeId }: { paket: SchuelerPaket; aufgabeId?: string }) {
  const k = paket.kampf
  const gesperrt = !!aufgabeId && !!k?.gesperrt.includes(aufgabeId)
  const versuche = paket.aufgaben.reduce((n, a) => n + a.versuche, 0)
  const vorher = useRef({ treffer: k?.treffer ?? 0, versuche })
  const [wurf, setWurf] = useState<{ art: 'treffer' | 'daneben'; nr: number } | null>(null)

  // Neue Abgabe: mehr Treffer = Treffer, sonst daneben
  useEffect(() => {
    const alt = vorher.current
    vorher.current = { treffer: k?.treffer ?? 0, versuche }
    if (!k || versuche <= alt.versuche || (gesperrt && k.treffer <= alt.treffer)) return
    setWurf((w) => ({ art: k.treffer > alt.treffer ? 'treffer' : 'daneben', nr: (w?.nr ?? 0) + 1 }))
  }, [k, versuche, gesperrt])

  if (!k) return null
  const monster = MONSTER[k.monster]
  const besiegt = k.treffer >= k.gesamt
  const leben = 1 - k.treffer / k.gesamt

  return (
    <section className="karte kampf" aria-label="Monster">
      <div className="kampf__buehne" data-wurf={wurf?.art} key={wurf?.nr}>
        <span className="kampf__figur">
          <Sprite grafik={GRAFIK.figur} nummer={FIGUR_RECHTS} mal={3} />
        </span>
        <span className={`kampf__monster${besiegt ? ' kampf__monster--weg' : ''}`}>
          {!besiegt && (
            <span className="kampf__balken" aria-hidden="true">
              <span style={{ width: `${leben * 100}%` }} />
            </span>
          )}
          <Sprite grafik={monster.grafik} mal={3} />
        </span>
      </div>
      <p role="status">
        {wurf?.art === 'treffer' && !besiegt && 'Treffer! '}
        {wurf?.art === 'daneben' && 'Daneben. '}
        {gesperrt && 'Du hast bei dieser Aufgabe die Lösung angesehen. Ab morgen trifft sie wieder. '}
        {besiegt
          ? `Geschafft! ${monster.der} ${monster.name} läuft davon.`
          : k.durch
            ? `${monster.der} ${monster.name} steht noch. Versuch die Aufgaben ohne Haken noch einmal!`
            : `Ein ${monster.name}! Jede richtige Antwort trifft.`}
      </p>
    </section>
  )
}
