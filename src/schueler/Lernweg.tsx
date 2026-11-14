// „Mein Lernweg“ (Startseite, Jazz 2026-11-14): nur die eigene Entwicklung, ohne Stufen, Punkte, Prozente oder Noten.
// Die Datenbank liefert hier gar keine absoluten Werte (schueler_entwicklung).
// Je Kernkompetenz ein Kasten zum Aufklappen mit der Pflanze für den Durchschnitt. Darin die geübten Themen, das zuletzt Geübte oben.
// Links rankt eine Pflanze aus dem Topf hoch: je Thema ein Stück (Zeichnung von Jazz).
import { useEffect, useState } from 'react'
import { Sprite } from '../gemeinsam/Sprite'
import { GRAFIK } from '../grafik'
import { fehlerText } from '../lib/fehler'
import { GROSSE_BEREICHE, grosserBereich } from '../lib/lernstand'
import { SORTE } from '../lib/shop'
import { supabase } from '../lib/supabase'

type Kategorie = 'deutlich' | 'besser' | 'dranbleiben' | 'erste'
type Thema = { name: string; bereich: string; kategorie: Kategorie; geloest: number; zuletzt?: string | null }
type Daten = { kompetenzen: Thema[]; texte: Record<string, string>; naechster_schritt: string | null }

// Wachstum der Tomate (4 Bilder, in allen Stufen gut zu erkennen): Keimling, wächst, rankt, trägt Früchte
const STUFEN: Kategorie[] = ['erste', 'dranbleiben', 'besser', 'deutlich']
const STUFE_TEXT: Record<Kategorie, string> = { erste: 'angefangen', dranbleiben: 'dranbleiben', besser: 'wird besser', deutlich: 'deutlich besser' }

function Pflanze({ art, titel }: { art: Kategorie; titel?: string }) {
  return <Sprite grafik={GRAFIK.pflanzen} nummer={SORTE.tomate * 4 + STUFEN.indexOf(art)} mal={3} titel={titel} />
}

/** Durchschnitt der Themen eines Kastens als Pflanze (gerundet) */
function durchschnitt(themen: { kategorie: Kategorie }[]): Kategorie {
  return STUFEN[Math.round(themen.reduce((s, t) => s + STUFEN.indexOf(t.kategorie), 0) / themen.length)]
}

export function Lernweg({ token }: { token: string }) {
  const [daten, setDaten] = useState<Daten | null>(null)
  const [fehler, setFehler] = useState<string | null>(null)

  useEffect(() => {
    void supabase
      .rpc('schueler_entwicklung', { p_token: token })
      .then(({ data, error }) => (error ? setFehler(fehlerText(error)) : setDaten(data as Daten)))
  }, [token])

  if (fehler) return <p className="karte" role="alert">{fehler}</p>
  if (!daten) return <p className="karte" role="status">Einen Moment …</p>

  // Kernkompetenzen in fester Reihenfolge (wie in der Lehrkraft-Übersicht); darin das zuletzt Geübte zuerst
  const kaesten = [...new Set(daten.kompetenzen.map((k) => grosserBereich(k.bereich)))]
    .sort((a, b) => (GROSSE_BEREICHE as readonly string[]).indexOf(a) - (GROSSE_BEREICHE as readonly string[]).indexOf(b))
    .map((gross) => ({
      gross,
      themen: daten.kompetenzen.filter((k) => grosserBereich(k.bereich) === gross).sort((a, b) => (b.zuletzt ?? '').localeCompare(a.zuletzt ?? '')),
    }))

  return (
    <>
      <header className="karte lernweg-kopf">
        <h1>Mein Lernweg</h1>
        {/* Usability-Test 2026-11-13: die Pflanzen erklären (sonst unklar) */}
        <p>Tippe einen Kasten an. Dann siehst du, was du schon geübt hast. Die Pflanze wächst mit:</p>
        <ul className="lernweg-legende">
          {STUFEN.map((s) => (
            <li key={s}>
              <Pflanze art={s} /> {STUFE_TEXT[s]}
            </li>
          ))}
        </ul>
      </header>

      {kaesten.length === 0 && <p className="karte">Sobald du ein paar Aufgaben bearbeitet hast, siehst du hier deinen Weg.</p>}

      {kaesten.map(({ gross, themen }) => (
        <details key={gross} className="karte lernweg-kasten">
          <summary>
            <span className="lernweg-kasten__name">{gross === 'Weitere' ? 'Weitere Themen' : gross}</span>
            <Pflanze art={durchschnitt(themen)} titel={STUFE_TEXT[durchschnitt(themen)]} />
          </summary>
          <ol className="ranke">
            {themen.map((k, i) => (
              <li key={k.name}>
                {/* oberstes Stück ist die Spitze; die beiden gezeichneten Stücke wechseln sich von unten her ab */}
                <Sprite grafik={GRAFIK.ranke} nummer={((themen.length - 1 - i) % 2) + (i === 0 ? 2 : 0)} mal={3} />
                <div>
                  <p className="ranke__name">
                    {k.name} <Pflanze art={k.kategorie} titel={daten.texte[k.kategorie] ?? STUFE_TEXT[k.kategorie]} />
                  </p>
                  <p>{k.bereich}</p>
                </div>
              </li>
            ))}
            <li className="ranke__topf" aria-hidden="true">
              <Sprite grafik={GRAFIK.ranke_topf} mal={3} />
            </li>
          </ol>
        </details>
      ))}
    </>
  )
}
