import { useCallback, useEffect, useState } from 'react'
import { KERNCURRICULA, type Kerncurriculum } from '../lib/csv'
import { fehlerText } from '../lib/fehler'
import { gehe } from '../lib/router'
import { supabase } from '../lib/supabase'
import type { Klasse } from '../lib/typen'

type KlasseMitAnzahl = Klasse & { schueler: { count: number }[] }

// alt (Übungswiese), angepasst: Liste der Klassen und „Neue Klasse“.
export function KlassenListe() {
  const [klassen, setKlassen] = useState<KlasseMitAnzahl[] | null>(null)
  const [name, setName] = useState('')
  const [kc, setKc] = useState<Kerncurriculum | ''>('')
  const [fehler, setFehler] = useState<string | null>(null)

  const laden = useCallback(async () => {
    const { data, error } = await supabase.from('klassen').select('id, name, kerncurriculum, schueler(count)').order('name')
    if (error) setFehler(fehlerText(error))
    else setKlassen(data as KlasseMitAnzahl[])
  }, [])

  useEffect(() => {
    void laden()
  }, [laden])

  return (
    <>
      <h1>Klassen</h1>
      {fehler && <p className="lk-hinweis" role="alert">{fehler}</p>}
      {klassen === null ? (
        <p className="lk-leise" role="status">Lädt …</p>
      ) : klassen.length === 0 ? (
        <p>Noch keine Klassen. Legen Sie unten die erste an.</p>
      ) : (
        <ul className="lk-liste">
          {klassen.map((k) => (
            <li key={k.id}>
              <a className="lk-eintrag" href={`#/lehrkraft/klassen/${k.id}`}>
                <strong>{k.name}</strong>
                <span className="lk-leise">
                  {k.schueler[0]?.count ?? 0} Schüler:innen · {k.kerncurriculum}
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}

      <form
        className="lk-zeile"
        onSubmit={async (e) => {
          e.preventDefault()
          const { data, error } = await supabase.from('klassen').insert({ name: name.trim(), kerncurriculum: kc }).select('id').single()
          if (error) return setFehler(fehlerText(error))
          gehe(`/lehrkraft/klassen/${data.id}`)
        }}
      >
        <label>
          Neue Klasse
          <input className="lk-feld" value={name} onChange={(e) => setName(e.target.value)} placeholder="z. B. 7b (2026/27)" required maxLength={60} />
        </label>
        <label>
          Kerncurriculum
          <select className="lk-feld" value={kc} onChange={(e) => setKc(e.target.value as Kerncurriculum)} required>
            <option value="">bitte wählen</option>
            {KERNCURRICULA.map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </label>
        <button className="lk-knopf lk-knopf--haupt">Anlegen</button>
      </form>
    </>
  )
}
