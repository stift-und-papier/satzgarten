// alt (Übungswiese), auf die Lehrkraft-Ansicht „ruhig“ (lk-*) umgestellt
import { useEffect, useState } from 'react'
import { SterneText } from '../gemeinsam/Sterne'
import { fehlerText } from '../lib/fehler'
import { LEERER_FILTER, passt } from '../lib/filter'
import { naechsteSortierung, sortiere, type Sortierung, type Spalte } from '../lib/sortierung'
import { supabase } from '../lib/supabase'
import { ZWEIGE, type Aufgabe } from '../lib/typen'
import { ListenFilter, useKompetenzen } from './ListenFilter'

export const TYP_NAMEN: Record<Aufgabe['typ'], string> = { lueckentext: 'Lückentext', auswahl: 'Auswahl', zuordnen: 'Zuordnen', fehler: 'Fehler finden', reihenfolge: 'Reihenfolge', ueberarbeiten: 'Sätze verbessern', erklaerung: 'Erklärung', diktat: 'Diktat' }

const SPALTEN: { spalte: Spalte; name: string }[] = [
  { spalte: 'titel', name: 'Titel' },
  { spalte: 'format', name: 'Format' },
  { spalte: 'stufe', name: 'Stufe' },
  { spalte: 'kompetenz', name: 'Kompetenz' },
  { spalte: 'kc', name: 'Schulform' },
]

type AufgabeMitKompetenzen = Pick<Aufgabe, 'id' | 'typ' | 'titel' | 'stufe' | 'geaendert_am'> & {
  aufgabe_kompetenzen: { kompetenz_id: string }[]
  paket_aufgaben: { pakete: { zweige: string[] } | null }[]
}

export function AufgabenListe() {
  const [aufgaben, setAufgaben] = useState<AufgabeMitKompetenzen[] | null>(null)
  const [fehler, setFehler] = useState<string | null>(null)
  const [filter, setFilter] = useState(LEERER_FILTER)
  const kompetenzen = useKompetenzen(setFehler)
  // null = wie geladen (zuletzt geändert zuerst)
  const [sortierung, setSortierung] = useState<Sortierung>(null)

  useEffect(() => {
    void supabase
      .from('aufgaben')
      .select('id, typ, titel, stufe, geaendert_am, aufgabe_kompetenzen(kompetenz_id), paket_aufgaben(pakete(zweige))')
      .eq('archiviert', false) // Übungsumbau: alte Aufgaben sind archiviert (nur Erklärseiten bleiben)
      .order('geaendert_am', { ascending: false })
      .then(({ data, error }) => (error ? setFehler(fehlerText(error)) : setAufgaben(data as unknown as AufgabeMitKompetenzen[])))
  }, [])

  const ids = (a: AufgabeMitKompetenzen) => a.aufgabe_kompetenzen.map((z) => z.kompetenz_id)
  // Schulform = Kerncurricula der Kompetenzen und Zweige der Pakete (Erklärseiten haben nur Pakete), feste Reihenfolge
  const schulformen = (a: AufgabeMitKompetenzen) => {
    const alle = [...ids(a).flatMap((id) => kompetenzen.get(id)?.kerncurriculum ?? []), ...a.paket_aufgaben.flatMap((pa) => pa.pakete?.zweige ?? [])]
    return ZWEIGE.filter((z) => alle.includes(z))
  }
  // Erklärseiten haben nie Kompetenzen – bei „ohne Zuordnung“ gibt es dort nichts nachzuarbeiten
  const gefiltert = aufgaben?.filter(
    (a) =>
      (!filter.art || a.typ === filter.art) &&
      !(filter.jahrgang === 'ohne' && a.typ === 'erklaerung') &&
      passt(a.titel, ids(a), filter, kompetenzen, schulformen(a)),
  )
  // Kurznamen und Kerncurricula der zugeordneten Kompetenzen (zum Anzeigen und Sortieren)
  const zeilen = gefiltert?.map((a) => {
    const ks = ids(a).flatMap((id) => kompetenzen.get(id) ?? [])
    return {
      ...a,
      kompetenz: [...new Set(ks.map((k) => k.kurzname?.trim() || k.kompetenz))].join(', '),
      kc: schulformen(a).join(', '),
    }
  })
  const sortiert = zeilen && sortiere(zeilen, sortierung, (typ) => TYP_NAMEN[typ])
  async function loeschen(a: AufgabeMitKompetenzen) {
    const ok = window.confirm(
      `„${a.titel}“ endgültig löschen?

Sie verschwindet aus allen Paketen, und alle Ergebnisse der Schüler:innen dazu werden gelöscht.`,
    )
    if (!ok) return
    const { error } = await supabase.from('aufgaben').delete().eq('id', a.id)
    if (error) setFehler(fehlerText(error))
    else setAufgaben((alt) => alt?.filter((x) => x.id !== a.id) ?? null)
  }
  const verwendet = [...new Set((aufgaben ?? []).flatMap(ids))].flatMap((id) => kompetenzen.get(id) ?? [])

  return (
    <>
      <h1>Übungen</h1>
      <div className="lk-knopfreihe">
        <a className="lk-knopf lk-knopf--haupt" href="#/lehrkraft/aufgaben/neu">
          + Neue Übung
        </a>
      </div>
      {fehler && <p className="lk-hinweis" role="alert">{fehler}</p>}
      {aufgaben && aufgaben.length > 0 && (
        <ListenFilter
          filter={filter}
          onChange={setFilter}
          verwendet={verwendet}
          treffer={gefiltert?.length ?? 0}
          gesamt={aufgaben.length}
          suchText="Titel …"
          arten={TYP_NAMEN}
        />
      )}
      {gefiltert === undefined ? (
        <p>Lädt …</p>
      ) : aufgaben?.length === 0 ? (
        <p>Noch keine Übungen.</p>
      ) : gefiltert.length === 0 ? (
        <p>Nichts passt zu diesem Filter.</p>
      ) : (
        <div className="lk-rollen">
        <table className="lk-tabelle">
          <thead>
            <tr>
              {SPALTEN.map(({ spalte, name }) => {
                const aktiv = sortierung?.spalte === spalte
                const richtung = aktiv ? (sortierung.absteigend ? 'descending' : 'ascending') : undefined
                return (
                  <th key={spalte} aria-sort={richtung}>
                    <button type="button" className="lk-sortieren" onClick={() => setSortierung(naechsteSortierung(sortierung, spalte))}>
                      {name}
                      <span aria-hidden="true">
                        {aktiv ? (sortierung.absteigend ? '▼' : '▲') : '↕'}
                      </span>
                    </button>
                  </th>
                )
              })}
              <th><span className="lk-unsichtbar">Löschen</span></th>
            </tr>
          </thead>
          <tbody>
            {sortiert?.map((a) => (
              <tr key={a.id}>
                <td>
                  <a href={`#/lehrkraft/aufgaben/${a.id}`}>{a.titel}</a>
                </td>
                <td>{TYP_NAMEN[a.typ]}</td>
                <td>{a.typ !== 'erklaerung' && <SterneText stufe={a.stufe} />}</td>
                <td>{a.kompetenz || <span className="lk-leise">{a.typ === 'erklaerung' ? '–' : 'keine'}</span>}</td>
                <td>{a.kc || <span className="lk-leise">–</span>}</td>
                <td>
                  <button type="button" className="lk-knopf lk-knopf--gefahr" onClick={() => void loeschen(a)} aria-label={`„${a.titel}“ löschen`}>
                    Löschen
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </>
  )
}
