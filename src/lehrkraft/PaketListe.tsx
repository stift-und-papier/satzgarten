// alt (Übungswiese), auf die Lehrkraft-Ansicht „ruhig“ (lk-*) umgestellt
import { useEffect, useState } from 'react'
import { fehlerText } from '../lib/fehler'
import { LEERER_FILTER, passt } from '../lib/filter'
import { gehe } from '../lib/router'
import { supabase } from '../lib/supabase'
import type { Paket } from '../lib/typen'
import { ListenFilter, useKompetenzen } from './ListenFilter'
import { PaketTags, TagAuswahl } from './PaketTags'

// Kompetenzen eines Pakets = die seiner Aufgaben
type PaketMitAnzahl = Paket & {
  paket_aufgaben: { aufgaben: { aufgabe_kompetenzen: { kompetenz_id: string }[] } | null }[]
  zuweisungen: { count: number }[]
}

export function PaketListe() {
  const [pakete, setPakete] = useState<PaketMitAnzahl[] | null>(null)
  const [fehler, setFehler] = useState<string | null>(null)
  const [filter, setFilter] = useState(LEERER_FILTER)
  const kompetenzen = useKompetenzen(setFehler)

  useEffect(() => {
    void supabase
      .from('pakete')
      .select('*, paket_aufgaben(aufgaben(aufgabe_kompetenzen(kompetenz_id))), zuweisungen(count)')
      .eq('archiviert', false) // Übungsumbau: alte Pakete sind archiviert
      .order('erstellt_am', { ascending: false })
      .then(({ data, error }) => (error ? setFehler(fehlerText(error)) : setPakete(data as PaketMitAnzahl[])))
  }, [])

  const ids = (p: PaketMitAnzahl) => [...new Set(p.paket_aufgaben.flatMap((pa) => pa.aufgaben?.aufgabe_kompetenzen.map((z) => z.kompetenz_id) ?? []))]
  const gefiltert = pakete?.filter((p) => passt(p.titel, ids(p), filter, kompetenzen, p.zweige))
  const verwendet = [...new Set((pakete ?? []).flatMap(ids))].flatMap((id) => kompetenzen.get(id) ?? [])

  return (
    <>
      <h1>Pakete</h1>
      <p className="lk-leise">Ein Paket bündelt mehrere Übungen. Pakete weisen Sie Klassen oder einzelnen Schüler:innen zu.</p>
      <div className="lk-knopfreihe">
        <a className="lk-knopf lk-knopf--haupt" href="#/lehrkraft/pakete/neu">
          + Neues Paket
        </a>
      </div>
      {fehler && <p className="lk-hinweis" role="alert">{fehler}</p>}
      {pakete && pakete.length > 0 && (
        <ListenFilter filter={filter} onChange={setFilter} verwendet={verwendet} treffer={gefiltert?.length ?? 0} gesamt={pakete.length} suchText="Paketname …" />
      )}
      {gefiltert === undefined ? (
        <p className="lk-leise" role="status">Lädt …</p>
      ) : pakete?.length === 0 ? (
        <p>Noch keine Pakete. Legen Sie mit „Neues Paket“ das erste an.</p>
      ) : gefiltert.length === 0 ? (
        <p>Kein Paket passt zu diesem Filter.</p>
      ) : (
        <ul className="lk-liste">
          {gefiltert.map((p) => (
            <li key={p.id}>
              <a className="lk-eintrag" href={`#/lehrkraft/pakete/${p.id}`}>
                <strong>{p.titel}</strong>
                <span className="lk-leise">
                  {p.paket_aufgaben.length} Übungen ·{' '}
                  {(p.zuweisungen[0]?.count ?? 0) === 0 ? 'noch nicht zugewiesen' : `${p.zuweisungen[0].count}× zugewiesen`}
                </span>
                <PaketTags jahrgaenge={p.jahrgaenge} zweige={p.zweige} />
              </a>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

// Eigene Seite: Titel und Tags festlegen; danach geht es zum Paket, wo die Aufgaben hinzukommen
export function NeuesPaket() {
  const [titel, setTitel] = useState('')
  const [tags, setTags] = useState<Pick<Paket, 'jahrgaenge' | 'zweige'>>({ jahrgaenge: [], zweige: [] })
  const [fehler, setFehler] = useState<string | null>(null)

  return (
    <>
      <a className="lk-zurueck" href="#/lehrkraft/pakete">
        ← Alle Pakete
      </a>
      <h1>Neues Paket</h1>
      <p className="lk-leise">Geben Sie dem Paket einen Namen. Danach wählen Sie die Übungen aus.</p>
      {fehler && <p className="lk-hinweis" role="alert">{fehler}</p>}
      <form
        className="lk-abschnitt"
        onSubmit={async (e) => {
          e.preventDefault()
          const { data, error } = await supabase.from('pakete').insert({ titel: titel.trim(), ...tags }).select('id').single()
          if (error) setFehler(fehlerText(error))
          else gehe(`/lehrkraft/pakete/${data.id}`)
        }}
      >
        <div className="lk-zeile">
          <label>
            Titel
            <input className="lk-feld" value={titel} onChange={(e) => setTitel(e.target.value)} placeholder="z. B. das oder dass, Übung 1" required maxLength={120} />
          </label>
        </div>
        <TagAuswahl wert={tags} onChange={setTags} />
        <div className="lk-knopfreihe">
          <button className="lk-knopf lk-knopf--haupt">Anlegen und Übungen wählen</button>
        </div>
      </form>
    </>
  )
}
