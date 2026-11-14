// „Mein Lernweg“ (Startseite, Jazz 2026-11-14): nur die eigene Entwicklung, ohne Stufen, Punkte, Prozente oder Noten.
// Die Datenbank liefert hier gar keine absoluten Werte (schueler_entwicklung).
// Je Kernkompetenz ein Kasten zum Aufklappen mit der Pflanze für den Durchschnitt. Darin die geübten Übungen, das zuletzt Geübte oben.
// Links rankt eine Pflanze aus dem Topf hoch: je Übung ein Stück (Zeichnung von Jazz). Übung antippen führt zur Übung.
import { useEffect, useState } from 'react'
import { Sprite } from '../gemeinsam/Sprite'
import { GRAFIK } from '../grafik'
import { fehlerText } from '../lib/fehler'
import { GROSSE_BEREICHE, grosserBereich } from '../lib/lernstand'
import { supabase } from '../lib/supabase'

type Kategorie = 'deutlich' | 'besser' | 'dranbleiben' | 'erste'
type Thema = { name: string; bereich: string; kategorie: Kategorie; geloest: number; zuletzt?: string | null }
type Uebung = { aufgabe_id: string; titel: string; kompetenz: string; bereich: string; zuletzt: string | null }
type Daten = { kompetenzen: Thema[]; uebungen?: Uebung[]; texte: Record<string, string>; naechster_schritt: string | null }

// Jazz 2026-11-14: wieder die Emoji-Pflanzen (besser zu erkennen als die Pixelbilder), jede in einem kleinen Holzrahmen
// (Character Backdrop aus dem UI Pack): keimt → wächst → wird groß → blüht
const STUFEN: Kategorie[] = ['erste', 'dranbleiben', 'besser', 'deutlich']
const STUFE_TEXT: Record<Kategorie, string> = { erste: 'angefangen', dranbleiben: 'dranbleiben', besser: 'wird besser', deutlich: 'deutlich besser' }
const EMOJI: Record<Kategorie, string> = { erste: '🌱', dranbleiben: '🌿', besser: '🪴', deutlich: '🌻' } // Sonnenblume statt Tulpe: auf dem braunen Rahmen besser zu sehen (Jazz)

/** Mit titel liest die Vorlesehilfe die Bedeutung vor; ohne titel ist das Symbol Verzierung (der Text steht daneben). */
function Pflanze({ art, titel }: { art: Kategorie; titel?: string }) {
  return (
    <span className="pflanze-symbol" role={titel ? 'img' : undefined} aria-label={titel} aria-hidden={titel ? undefined : true}>
      {EMOJI[art]}
    </span>
  )
}

/** Durchschnitt der Themen eines Kastens als Pflanze (gerundet) */
function durchschnitt(themen: { kategorie: Kategorie }[]): Kategorie {
  return STUFEN[Math.round(themen.reduce((s, t) => s + STUFEN.indexOf(t.kategorie), 0) / themen.length)]
}

export function Lernweg({ token, ziel }: { token: string; ziel: (aufgabeId: string) => string | null }) {
  const [daten, setDaten] = useState<Daten | null>(null)
  const [fehler, setFehler] = useState<string | null>(null)

  useEffect(() => {
    void supabase
      .rpc('schueler_entwicklung', { p_token: token })
      .then(({ data, error }) => (error ? setFehler(fehlerText(error)) : setDaten(data as Daten)))
  }, [token])

  if (fehler) return <p className="karte" role="alert">{fehler}</p>
  if (!daten) return <p className="karte" role="status">Einen Moment …</p>

  // Kernkompetenzen in fester Reihenfolge (wie in der Lehrkraft-Übersicht). Die Übungen kommen vom Server schon „zuletzt geübt zuerst“.
  // Das Pflanzen-Symbol einer Übung ist das ihres Themas.
  // shortcut: Solange die Migration lernweg_zuletzt nicht eingespielt ist, fehlt uebungen; dann stehen dort die Themen (ohne Antippen).
  const alle: Uebung[] = daten.uebungen ?? daten.kompetenzen.map((k) => ({ aufgabe_id: k.name, titel: k.name, kompetenz: k.bereich, bereich: k.bereich, zuletzt: null }))
  const kategorie = new Map(daten.kompetenzen.map((k) => [k.name, k.kategorie]))
  const kaesten = [...new Set(daten.kompetenzen.map((k) => grosserBereich(k.bereich)))]
    .sort((a, b) => (GROSSE_BEREICHE as readonly string[]).indexOf(a) - (GROSSE_BEREICHE as readonly string[]).indexOf(b))
    .map((gross) => ({
      gross,
      themen: daten.kompetenzen.filter((k) => grosserBereich(k.bereich) === gross),
      uebungen: alle.filter((u) => grosserBereich(u.bereich) === gross),
    }))

  return (
    <>
      <header className="pixel-schild">
        <h1>Mein Lernweg</h1>
      </header>
      {/* Legende als eigene Box: erklärt die Pflanzen (Usability-Test 2026-11-13: sonst unklar) */}
      <ul className="karte lernweg-legende" aria-label="Was die Pflanzen bedeuten">
        {STUFEN.map((s) => (
          <li key={s}>
            <Pflanze art={s} /> {STUFE_TEXT[s]}
          </li>
        ))}
      </ul>

      {kaesten.length === 0 && <p className="karte">Sobald du ein paar Aufgaben bearbeitet hast, siehst du hier deinen Weg.</p>}

      {kaesten.map(({ gross, themen, uebungen }) => (
        <details key={gross} className="karte lernweg-kasten">
          <summary>
            <Pflanze art={durchschnitt(themen)} titel={STUFE_TEXT[durchschnitt(themen)]} />
            <span className="lernweg-kasten__name">{gross === 'Weitere' ? 'Weitere Themen' : gross}</span>
          </summary>
          <ol className="ranke">
            {uebungen.map((u, i) => {
              const art = kategorie.get(u.kompetenz) ?? kategorie.get(u.titel) ?? 'erste'
              const href = ziel(u.aufgabe_id)
              const text = (
                <>
                  <span className="ranke__name">{u.titel}</span>
                  <span>{u.kompetenz}</span>
                </>
              )
              return (
                <li key={u.aufgabe_id}>
                  {/* oberstes Stück ist die Spitze; die beiden gezeichneten Stücke wechseln sich von unten her ab */}
                  <Sprite grafik={GRAFIK.ranke} nummer={((uebungen.length - 1 - i) % 2) + (i === 0 ? 2 : 0)} mal={3} />
                  {/* antippen führt zur Übung, solange sie noch in einem Paket der Klasse steckt */}
                  {href ? (
                    <a className="ranke__text" href={href}>
                      {text}
                    </a>
                  ) : (
                    <span className="ranke__text">{text}</span>
                  )}
                  {/* Symbole rechts in einer Spalte untereinander */}
                  <Pflanze art={art} titel={daten.texte[art] ?? STUFE_TEXT[art]} />
                </li>
              )
            })}
            <li className="ranke__topf" aria-hidden="true">
              <Sprite grafik={GRAFIK.ranke_topf} mal={3} />
            </li>
          </ol>
        </details>
      ))}
    </>
  )
}
