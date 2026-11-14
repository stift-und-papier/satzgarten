// „Mein Sammelalbum“ (Aufgabe 41c, Lehrkraft 2026-11-12): Pflanzen, Tiere und Deko, die man schon einmal hatte.
// Was gesammelt ist, rechnet der Server (schueler_album).
// Jazz 2026-11-14: Stickeralbum als Buch zum Blättern (gemeinsam/Buch.tsx). Gesammeltes klebt als Sticker im Emoji-Stil,
// was fehlt, ist eine blasse leere Klebestelle (kein Fragezeichen, kein Name). Neu: Monster, mit denen man befreundet ist.
import { useEffect, useState } from 'react'
import { Buch, BuchBild } from '../gemeinsam/Buch'
import { GRAFIK, STICKER_NUMMER } from '../grafik'
import { klebestellen, type AlbumArt, type AlbumEintrag as Eintrag } from '../lib/album'
import { fehlerText } from '../lib/fehler'
import type { Grafik } from '../lib/sprite'
import { supabase } from '../lib/supabase'

// Bilder auf den Lesezeichen: Emojis aus dem UI Pack, auf 16 × 16 verkleinert (GRAFIK.reiter: Keimling, Küken, Pilz, Monster, Münze)
const KAPITEL: { arten: AlbumArt[]; titel: string; bild: Grafik; nummer?: number }[] = [
  { arten: ['samen', 'baum'], titel: 'Pflanzen', bild: GRAFIK.reiter, nummer: 0 },
  { arten: ['tier'], titel: 'Tiere', bild: GRAFIK.reiter, nummer: 1 },
  { arten: ['deko'], titel: 'Deko', bild: GRAFIK.reiter, nummer: 2 },
  { arten: ['monster'], titel: 'Monster', bild: GRAFIK.reiter, nummer: 3 },
]
const JE_SEITE = 9

// Jazz 2026-11-14: Sticker ohne Namen darunter (der Name bleibt für Vorlesehilfen)
function Seite({ eintraege }: { eintraege: Eintrag[] }) {
  return (
    <ul className="sticker-raster">
      {eintraege.map((e) =>
        e.gesammelt ? (
          <li key={e.id} className="sticker-platz">
            <BuchBild grafik={GRAFIK.sticker} nummer={STICKER_NUMMER[e.id]} className="sticker" titel={e.name ?? undefined} />
          </li>
        ) : (
          <li key={e.id} className="sticker-platz sticker-platz--leer">
            <span className="sticker-leer" role="img" aria-label="Noch leer" />
          </li>
        ),
      )}
    </ul>
  )
}

export function Album({ token, zurueck }: { token: string; zurueck: string }) {
  const [liste, setListe] = useState<Eintrag[] | null>(null)
  const [fehler, setFehler] = useState<string | null>(null)
  const [[kapitel, seite], setOrt] = useState([0, 0])

  useEffect(() => {
    void supabase.rpc('schueler_album', { p_token: token }).then(({ data, error }) => {
      if (error) setFehler(fehlerText(error))
      else setListe(klebestellen(data as Eintrag[]))
    })
  }, [token])

  const { arten, titel } = KAPITEL[kapitel]
  const eintraege = (liste ?? []).filter((e) => arten.includes(e.art))
  const ab = seite * JE_SEITE * 2
  return (
    <>
      <Buch
        titel="Mein Sammelalbum"
        zurueck={{ href: zurueck, name: 'Zurück zur Farm' }}
        kapitel={KAPITEL}
        aktiv={kapitel}
        seite={seite}
        seiten={Math.max(1, Math.ceil(eintraege.length / (JE_SEITE * 2)))}
        onWechsel={(k, s) => setOrt([k, s])}
        links={
          <section aria-label={titel}>
            <h2>{titel}</h2>
            {liste ? <Seite eintraege={eintraege.slice(ab, ab + JE_SEITE)} /> : <p role={fehler ? 'alert' : 'status'}>{fehler ?? 'Einen Moment …'}</p>}
          </section>
        }
        rechts={<Seite eintraege={eintraege.slice(ab + JE_SEITE, ab + JE_SEITE * 2)} />}
      />
      <p className="leise buch-hinweis">
        {kapitel === 3 ? 'Hier kleben die Monster, mit denen du dich angefreundet hast.' : 'Hier klebt alles, was du schon einmal auf deiner Farm hattest.'}
      </p>
    </>
  )
}
