// alt (Übungswiese), auf die Lehrkraft-Ansicht „ruhig“ (lk-*) umgestellt
import { useCallback, useEffect, useState } from 'react'
import { AufgabeBearbeiten } from '../gemeinsam/AufgabeBearbeiten'
import { fehlerText } from '../lib/fehler'
import { gehe } from '../lib/router'
import { supabase } from '../lib/supabase'
import type { Aufgabe, Klasse, LueckentextInhaltSchueler, Paket, Pruefergebnis, Schueler, Stufe, Zuweisung } from '../lib/typen'
import { TYP_NAMEN } from './AufgabenListe'
import { PaketTags, TagAuswahl } from './PaketTags'

type PaketAufgabe = Aufgabe & { inhalt: LueckentextInhaltSchueler }
type Daten = {
  paket: Paket
  inhalt: { aufgabe_id: string; position: number; aufgabe: PaketAufgabe }[]
  alleAufgaben: Pick<Aufgabe, 'id' | 'typ' | 'titel' | 'stufe'>[]
  zuweisungen: Zuweisung[]
  klassen: Klasse[]
  schueler: Pick<Schueler, 'id' | 'klasse_id' | 'pseudonym'>[]
}

const sterne = (s: Stufe) => '★'.repeat(s) + '☆'.repeat(3 - s)

export function PaketDetail({ paketId, vorschau }: { paketId: string; vorschau: boolean }) {
  const [daten, setDaten] = useState<Daten | null>(null)
  const [fehler, setFehler] = useState<string | null>(null)

  const laden = useCallback(async () => {
    const [p, pa, a, z, k, s] = await Promise.all([
      supabase.from('pakete').select('*').eq('id', paketId).single(),
      supabase.from('paket_aufgaben').select('aufgabe_id, position, aufgabe:aufgaben(*)').eq('paket_id', paketId).order('position'),
      supabase.from('aufgaben').select('id, typ, titel, stufe').order('titel'),
      supabase.from('zuweisungen').select('*').eq('paket_id', paketId).order('erstellt_am'),
      supabase.from('klassen').select('id, name, kerncurriculum').order('name'),
      supabase.from('schueler').select('id, klasse_id, pseudonym').order('pseudonym'),
    ])
    const fehlerhaft = [p, pa, a, z, k, s].find((r) => r.error)
    if (fehlerhaft?.error) return setFehler(fehlerText(fehlerhaft.error))
    setDaten({
      paket: p.data as Paket,
      inhalt: pa.data as unknown as Daten['inhalt'],
      alleAufgaben: a.data as Daten['alleAufgaben'],
      zuweisungen: z.data as Zuweisung[],
      klassen: k.data as Klasse[],
      schueler: s.data as Daten['schueler'],
    })
  }, [paketId])

  useEffect(() => {
    void laden()
  }, [laden])

  if (!daten) return fehler ? <p className="lk-hinweis" role="alert">{fehler}</p> : <p className="lk-leise" role="status">Lädt …</p>
  if (vorschau) return <PaketVorschau daten={daten} />

  const { paket, inhalt, alleAufgaben, zuweisungen, klassen, schueler } = daten
  const imPaket = new Set(inhalt.map((i) => i.aufgabe_id))
  const verfuegbar = alleAufgaben.filter((a) => !imPaket.has(a.id))
  const klassenName = (id: string | null) => klassen.find((k) => k.id === id)?.name ?? '?'

  async function ausfuehren(aktion: PromiseLike<{ error: unknown }>) {
    const { error } = await aktion
    if (error) setFehler(fehlerText(error))
    else {
      setFehler(null)
      void laden()
    }
  }

  async function verschieben(index: number, richtung: -1 | 1) {
    const neu = [...inhalt]
    const [eintrag] = neu.splice(index, 1)
    neu.splice(index + richtung, 0, eintrag)
    await ausfuehren(supabase.from('paket_aufgaben').upsert(neu.map((e, i) => ({ paket_id: paket.id, aufgabe_id: e.aufgabe_id, position: i }))))
  }

  return (
    <>
      <a className="lk-zurueck" href="#/lehrkraft/pakete">
        ← Alle Pakete
      </a>
      <PaketKopf paket={paket} onGeaendert={laden} onFehler={setFehler} />
      {fehler && <p className="lk-hinweis" role="alert">{fehler}</p>}

      <section className="lk-abschnitt">
        <h2>Aufgaben in diesem Paket</h2>
        {inhalt.length === 0 ? (
          <p>Noch keine Aufgaben.</p>
        ) : (
          <ol className="lk-liste">
            {inhalt.map((e, i) => (
              <li key={e.aufgabe_id} className="lk-eintrag">
                <span>
                  <a href={`#/lehrkraft/aufgaben/${e.aufgabe_id}`}>{e.aufgabe.titel}</a>
                  <span className="lk-leise">
                    {' '}
                    · {TYP_NAMEN[e.aufgabe.typ]}
                    {e.aufgabe.typ !== 'erklaerung' && <span aria-label={`Stufe ${e.aufgabe.stufe} von 3`}> · {sterne(e.aufgabe.stufe)}</span>}
                  </span>
                </span>
                <span className="lk-knopfreihe">
                  <button type="button" className="lk-knopf" disabled={i === 0} onClick={() => void verschieben(i, -1)} aria-label={`${e.aufgabe.titel} nach oben`}>
                    ↑
                  </button>
                  <button
                    type="button"
                    className="lk-knopf"
                    disabled={i === inhalt.length - 1}
                    onClick={() => void verschieben(i, 1)}
                    aria-label={`${e.aufgabe.titel} nach unten`}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="lk-knopf"
                    onClick={() => void ausfuehren(supabase.from('paket_aufgaben').delete().eq('paket_id', paket.id).eq('aufgabe_id', e.aufgabe_id))}
                  >
                    Entfernen
                  </button>
                </span>
              </li>
            ))}
          </ol>
        )}
        {verfuegbar.length > 0 ? (
          <form
            className="lk-zeile"
            onSubmit={(e) => {
              e.preventDefault()
              const id = new FormData(e.currentTarget).get('aufgabe') as string
              const position = Math.max(-1, ...inhalt.map((x) => x.position)) + 1
              if (id) void ausfuehren(supabase.from('paket_aufgaben').insert({ paket_id: paket.id, aufgabe_id: id, position }))
            }}
          >
            <label>
              Aufgabe hinzufügen
              <select className="lk-feld" name="aufgabe">
                {verfuegbar.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.titel} ({TYP_NAMEN[a.typ]}
                    {a.typ !== 'erklaerung' && `, ${sterne(a.stufe)}`})
                  </option>
                ))}
              </select>
            </label>
            <button className="lk-knopf">Hinzufügen</button>
          </form>
        ) : (
          <p className="lk-leise">
            Alle Ihre Aufgaben sind schon in diesem Paket. <a href="#/lehrkraft/aufgaben/neu">Neue Aufgabe anlegen</a>
          </p>
        )}
        <p className="lk-leise">
          Schüler:innen sehen je Themenbereich nur die Aufgaben ihrer Sterne-Stufe (Erklärseiten sehen alle). Legen Sie
          dieselbe Übung in mehreren Stufen an, bekommt jede:r die passende.
        </p>
        {inhalt.length > 0 && (
          <div className="lk-knopfreihe">
            <a className="lk-knopf" href={`#/lehrkraft/pakete/${paket.id}/vorschau`}>
              Vorschau: Paket wie Schüler:innen durcharbeiten
            </a>
          </div>
        )}
      </section>

      <section className="lk-abschnitt">
        <h2>Zugewiesen an</h2>
        {zuweisungen.length === 0 ? (
          <p>Noch niemandem. Schüler:innen sehen das Paket erst nach dem Zuweisen.</p>
        ) : (
          <ul className="lk-liste">
            {zuweisungen.map((z) => {
              const s = schueler.find((x) => x.id === z.schueler_id)
              return (
                <li key={z.id} className="lk-eintrag">
                  <span>
                    {z.klasse_id ? (
                      <>
                        Klasse <strong>{klassenName(z.klasse_id)}</strong> (alle)
                      </>
                    ) : (
                      <>
                        <strong>{s?.pseudonym}</strong> ({klassenName(s?.klasse_id ?? null)})
                      </>
                    )}
                  </span>
                  <button type="button" className="lk-knopf" onClick={() => void ausfuehren(supabase.from('zuweisungen').delete().eq('id', z.id))}>
                    Zuweisung entfernen
                  </button>
                </li>
              )
            })}
          </ul>
        )}
        <form
          className="lk-zeile"
          onSubmit={(e) => {
            e.preventDefault()
            const wert = new FormData(e.currentTarget).get('ziel') as string
            if (!wert) return
            const [art, id] = wert.split(':')
            void ausfuehren(supabase.from('zuweisungen').insert(art === 'k' ? { paket_id: paket.id, klasse_id: id } : { paket_id: paket.id, schueler_id: id }))
          }}
        >
          <label>
            Zuweisen an
            <select className="lk-feld" name="ziel">
              {klassen.map((k) => (
                <optgroup key={k.id} label={`Klasse ${k.name}`}>
                  <option value={`k:${k.id}`}>Ganze Klasse {k.name}</option>
                  {schueler
                    .filter((s) => s.klasse_id === k.id)
                    .map((s) => (
                      <option key={s.id} value={`s:${s.id}`}>
                        nur {s.pseudonym}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </label>
          <button className="lk-knopf lk-knopf--haupt" disabled={klassen.length === 0}>
            Zuweisen
          </button>
        </form>
      </section>

      <section className="lk-abschnitt">
        <div className="lk-knopfreihe">
          <button
            type="button"
            className="lk-knopf"
            onClick={async () => {
              if (!window.confirm(`Paket „${paket.titel}“ löschen?\n\nDie Aufgaben selbst bleiben erhalten. Schüler:innen sehen das Paket danach nicht mehr.`)) return
              const { error } = await supabase.from('pakete').delete().eq('id', paket.id)
              if (error) setFehler(fehlerText(error))
              else gehe('/lehrkraft/pakete')
            }}
          >
            Paket löschen
          </button>
        </div>
      </section>
    </>
  )
}

function PaketKopf({ paket, onGeaendert, onFehler }: { paket: Paket; onGeaendert: () => void; onFehler: (f: string) => void }) {
  const [bearbeiten, setBearbeiten] = useState(false)
  const [titel, setTitel] = useState(paket.titel)
  const [beschreibung, setBeschreibung] = useState(paket.beschreibung ?? '')
  const [tags, setTags] = useState({ jahrgaenge: paket.jahrgaenge, zweige: paket.zweige })

  if (!bearbeiten) {
    return (
      <>
        <h1>{paket.titel}</h1>
        {paket.beschreibung && <p>{paket.beschreibung}</p>}
        <p>
          <PaketTags jahrgaenge={paket.jahrgaenge} zweige={paket.zweige} />
        </p>
        <div className="lk-knopfreihe">
          <button type="button" className="lk-knopf" onClick={() => setBearbeiten(true)}>
            Titel, Beschreibung, Tags ändern
          </button>
        </div>
      </>
    )
  }
  return (
    <form
      className="lk-abschnitt"
      onSubmit={async (e) => {
        e.preventDefault()
        const { error } = await supabase
          .from('pakete')
          .update({ titel: titel.trim(), beschreibung: beschreibung.trim() || null, ...tags })
          .eq('id', paket.id)
        if (error) return onFehler(fehlerText(error))
        setBearbeiten(false)
        onGeaendert()
      }}
    >
      <div className="lk-zeile">
        <label>
          Titel
          <input className="lk-feld" value={titel} onChange={(e) => setTitel(e.target.value)} required maxLength={120} />
        </label>
        <label>
          Beschreibung für Schüler:innen (freiwillig)
          <input className="lk-feld" value={beschreibung} onChange={(e) => setBeschreibung(e.target.value)} maxLength={300} />
        </label>
      </div>
      <TagAuswahl wert={tags} onChange={setTags} />
      <div className="lk-knopfreihe">
        <button className="lk-knopf lk-knopf--haupt">Speichern</button>
        <button type="button" className="lk-knopf" onClick={() => setBearbeiten(false)}>
          Abbrechen
        </button>
      </div>
    </form>
  )
}

/** Lösung zum Anzeigen aus der Eingabe der Lehrkraft (wie nur_loesung in der Datenbank) */
function loesungAus(a: Aufgabe): Record<number, string[]> {
  return Object.fromEntries(
    a.loesung.teile.flatMap((t) =>
      t.t === 'luecke'
        ? [[t.id, t.loesungen]]
        : t.t === 'auswahl' || t.t === 'versionen'
          ? [[t.id, t.richtig.map((nr) => t.optionen[nr])]]
          : t.t === 'einheit' && t.kategorie
            ? [[t.id, [t.kategorie]]]
            : t.t === 'wort' && t.korrekturen
              ? [[t.id, t.korrekturen]]
              : t.t === 'reihe'
                ? [[t.id, t.loesungen.map((l) => l.join(' '))]]
                : [],
    ),
  )
}

// Vorschau: das Paket so durcharbeiten, wie Schüler:innen es sehen (alle Stufen). Es wird nichts gespeichert.
function PaketVorschau({ daten }: { daten: Daten }) {
  const [index, setIndex] = useState(0)
  const eintrag = daten.inhalt[index]
  if (!eintrag) return <p>Das Paket ist leer.</p>
  const a = eintrag.aufgabe
  let versuche = 0
  return (
    <>
      <a className="lk-zurueck" href={`#/lehrkraft/pakete/${daten.paket.id}`}>
        ← Vorschau beenden
      </a>
      <h1>{daten.paket.titel}</h1>
      <p className="lk-leise">
        Vorschau – Aufgabe {index + 1} von {daten.inhalt.length}. Hier sehen Sie alle Stufen; es wird nichts gespeichert.
      </p>
      <div className="lk-vorschau">
        <AufgabeBearbeiten
          key={a.id}
          aufgabe={{ ...a, versuche: 0, geloest: false, loesung_angesehen: false }}
          pruefen={async (antworten) => {
            const { data, error } = await supabase.rpc('pruefe_aufgabe', { p_typ: a.typ, p_loesung: a.loesung, p_antworten: antworten })
            if (error) throw new Error(fehlerText(error))
            const ergebnis = data as Pruefergebnis
            versuche++
            return { ergebnis, rueckmeldung: ergebnis.richtig ? null : a.rueckmeldung_fehler, versuche }
          }}
          loesungHolen={async () => loesungAus(a)}
          weiter={
            index + 1 < daten.inhalt.length
              ? { text: 'Nächste Aufgabe', ziel: () => setIndex(index + 1) }
              : { text: 'Vorschau beenden', ziel: () => gehe(`/lehrkraft/pakete/${daten.paket.id}`) }
          }
        />
      </div>
      <div className="lk-knopfreihe">
        <button type="button" className="lk-knopf" disabled={index === 0} onClick={() => setIndex(index - 1)}>
          ← Vorherige
        </button>
        <button type="button" className="lk-knopf" disabled={index + 1 >= daten.inhalt.length} onClick={() => setIndex(index + 1)}>
          Überspringen →
        </button>
      </div>
    </>
  )
}
