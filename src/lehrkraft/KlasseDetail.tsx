import { useCallback, useEffect, useState } from 'react'
import { KERNCURRICULA, type Kerncurriculum } from '../lib/csv'
import { fehlerText } from '../lib/fehler'
import { erzeugePseudonyme, pseudonymListeLesen } from '../lib/pseudonyme'
import { gehe, schuelerLink } from '../lib/router'
import { supabase } from '../lib/supabase'
import type { Klasse, Schueler } from '../lib/typen'

// alt (Übungswiese), gekürzt: Klasse umbenennen, KC wählen, Pseudonyme anlegen/umbenennen/löschen, Sterne-Stufe fest einstellen.
// Dazu Lernstand (Phase 7) und „Ergebnisse zurücksetzen“ (alt).
export function KlasseDetail({ klasseId }: { klasseId: string }) {
  const [klasse, setKlasse] = useState<Klasse | null>(null)
  const [schueler, setSchueler] = useState<Schueler[]>([])
  const [fehler, setFehler] = useState<string | null>(null)
  const [meldung, setMeldung] = useState<string | null>(null)
  const [klassenname, setKlassenname] = useState('')
  const [anzahl, setAnzahl] = useState(25)
  const [liste, setListe] = useState('')
  const [modus, setModus] = useState<'automatisch' | 'liste'>('automatisch')

  const laden = useCallback(async () => {
    const [k, s] = await Promise.all([
      supabase.from('klassen').select('id, name, kerncurriculum').eq('id', klasseId).single(),
      supabase.from('schueler').select('id, klasse_id, pseudonym, token, stufe_manuell').eq('klasse_id', klasseId),
    ])
    if (k.error || s.error) return setFehler(fehlerText(k.error ?? s.error))
    setKlasse(k.data as Klasse)
    setKlassenname((k.data as Klasse).name)
    setSchueler((s.data as Schueler[]).sort((a, b) => a.pseudonym.localeCompare(b.pseudonym, 'de', { numeric: true })))
  }, [klasseId])

  useEffect(() => {
    void laden()
  }, [laden])

  // Führt eine Änderung aus; bei Erfolg Meldung zeigen und neu laden.
  async function aendern(auftrag: PromiseLike<{ error: unknown }>, erfolg?: string) {
    const { error } = await auftrag
    if (error) return setFehler(fehlerText(error))
    setFehler(null)
    setMeldung(erfolg ?? null)
    void laden()
  }

  function hinzufuegen(namen: string[], doppelt: string[] = []) {
    const uebersprungen = doppelt.length ? ` Übersprungen, weil schon vorhanden: ${doppelt.join(', ')}` : ''
    if (namen.length === 0) return setMeldung(`Niemand angelegt.${uebersprungen}`)
    return aendern(
      supabase.from('schueler').insert(namen.map((pseudonym) => ({ klasse_id: klasseId, pseudonym }))),
      `${namen.length} Schüler:innen angelegt.${uebersprungen}`,
    )
  }

  function umbenennen(s: Schueler, neu: string) {
    if (!neu.trim() || neu.trim() === s.pseudonym) return
    void aendern(supabase.from('schueler').update({ pseudonym: neu.trim() }).eq('id', s.id), `Umbenannt in ${neu.trim()}.`)
  }

  function loeschen(s: Schueler) {
    if (!window.confirm(`${s.pseudonym} wirklich löschen?\n\nDer Link funktioniert dann nicht mehr, alle Ergebnisse sind endgültig weg.`)) return
    void aendern(supabase.from('schueler').delete().eq('id', s.id), `${s.pseudonym} gelöscht.`)
  }

  // alt (Übungswiese): Ergebnisse zurücksetzen – Pseudonym, Link und fest eingestellte Stufe bleiben.
  function zuruecksetzen(liste: Schueler[], erfolg: string) {
    void aendern(supabase.rpc('ergebnisse_zuruecksetzen', { p_schueler: liste.map((s) => s.id) }), erfolg)
  }

  function einzelnZuruecksetzen(s: Schueler) {
    const ok = window.confirm(
      `Ergebnisse von ${s.pseudonym} zurücksetzen?\n\nAlle Antworten werden endgültig gelöscht, die Sterne-Stufe beginnt wieder bei einem Stern (außer einer fest eingestellten). Pseudonym und Link bleiben.`,
    )
    if (ok) zuruecksetzen([s], `Ergebnisse von ${s.pseudonym} zurückgesetzt.`)
  }

  function klasseZuruecksetzen() {
    if (!klasse) return
    const eingabe = window.prompt(
      `Die Ergebnisse aller ${schueler.length} Schüler:innen der Klasse „${klasse.name}“ zurücksetzen?\n\nAlle Antworten werden endgültig gelöscht, die Sterne-Stufen beginnen wieder bei einem Stern (außer fest eingestellten). Pseudonyme und Links bleiben. Zur Bestätigung den Klassennamen eintippen:`,
    )
    if (eingabe?.trim() === klasse.name) zuruecksetzen(schueler, `Ergebnisse der Klasse „${klasse.name}“ zurückgesetzt.`)
  }

  async function klasseLoeschen() {
    if (!klasse) return
    const eingabe = window.prompt(
      `Die Klasse „${klasse.name}“ mit allen ${schueler.length} Schüler:innen und allen Ergebnissen endgültig löschen?\n\nZur Bestätigung den Klassennamen eintippen:`,
    )
    if (eingabe?.trim() !== klasse.name) return
    const { error } = await supabase.from('klassen').delete().eq('id', klasse.id)
    if (error) setFehler(fehlerText(error))
    else gehe('/lehrkraft/klassen')
  }

  async function linkKopieren(s: Schueler) {
    try {
      await navigator.clipboard.writeText(schuelerLink(s.token))
      setMeldung(`Link von ${s.pseudonym} kopiert.`)
    } catch {
      window.prompt('Link zum Kopieren:', schuelerLink(s.token))
    }
  }

  if (!klasse) return fehler ? <p className="lk-hinweis" role="alert">{fehler}</p> : <p className="lk-leise" role="status">Lädt …</p>
  const vorhanden = schueler.map((s) => s.pseudonym)

  return (
    <>
      <a className="lk-zurueck" href="#/lehrkraft/klassen">← Alle Klassen</a>
      <h1>Klasse {klasse.name}</h1>
      {fehler && <p className="lk-hinweis" role="alert">{fehler}</p>}
      {meldung && <p className="lk-erfolg" role="status">{meldung}</p>}

      <form
        className="lk-zeile"
        onSubmit={(e) => {
          e.preventDefault()
          void aendern(supabase.from('klassen').update({ name: klassenname.trim() }).eq('id', klasse.id), 'Name gespeichert.')
        }}
      >
        <label>
          Name der Klasse
          <input className="lk-feld" value={klassenname} onChange={(e) => setKlassenname(e.target.value)} required maxLength={60} />
        </label>
        <button className="lk-knopf" disabled={klassenname.trim() === klasse.name}>Umbenennen</button>
        <label>
          Kerncurriculum
          <select
            className="lk-feld"
            value={klasse.kerncurriculum}
            onChange={(e) =>
              void aendern(supabase.from('klassen').update({ kerncurriculum: e.target.value as Kerncurriculum }).eq('id', klasse.id), 'Kerncurriculum gespeichert.')
            }
          >
            {KERNCURRICULA.map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </label>
      </form>

      {schueler.length === 0 ? (
        <p>Noch keine Schüler:innen in dieser Klasse. Legen Sie unten welche an.</p>
      ) : (
        <>
          <div className="lk-zeile">
            <a className="lk-knopf lk-knopf--haupt" href={`#/lehrkraft/klassen/${klasse.id}/links`}>
              Linkliste mit QR-Codes
            </a>
            <a className="lk-knopf lk-knopf--haupt" href={`#/lehrkraft/klassen/${klasse.id}/lernstand`}>
              Lernstand der Klasse
            </a>
          </div>
          <div className="lk-rollen">
            <table className="lk-tabelle">
              <thead>
                <tr>
                  <th>Pseudonym</th>
                  <th>Sterne-Stufe</th>
                  <th>Link</th>
                  <th>Ergebnisse</th>
                  <th><span className="lk-unsichtbar">Löschen</span></th>
                </tr>
              </thead>
              <tbody>
                {schueler.map((s) => (
                  <tr key={s.id}>
                    <td>
                      {/* Ändern und mit Enter oder Antippen außerhalb speichern; key setzt das Feld nach dem Laden zurück */}
                      <input
                        key={s.pseudonym}
                        className="lk-feld lk-feld--schmal"
                        aria-label={`Pseudonym ${s.pseudonym} ändern`}
                        defaultValue={s.pseudonym}
                        maxLength={40}
                        onBlur={(e) => umbenennen(s, e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                      />
                    </td>
                    <td>
                      <select
                        className="lk-feld"
                        aria-label={`Sterne-Stufe von ${s.pseudonym}`}
                        value={s.stufe_manuell ?? ''}
                        onChange={(e) =>
                          void aendern(supabase.from('schueler').update({ stufe_manuell: e.target.value ? Number(e.target.value) : null }).eq('id', s.id))
                        }
                      >
                        <option value="">automatisch</option>
                        <option value="1">★ fest</option>
                        <option value="2">★★ fest</option>
                        <option value="3">★★★ fest</option>
                      </select>
                    </td>
                    <td>
                      <div className="lk-knopfreihe">
                        <button type="button" className="lk-knopf" onClick={() => void linkKopieren(s)}>
                          Kopieren
                        </button>
                        <a className="lk-knopf" href={schuelerLink(s.token)} target="_blank" rel="noreferrer">
                          Öffnen
                        </a>
                      </div>
                    </td>
                    <td>
                      <div className="lk-knopfreihe">
                        <a className="lk-knopf lk-knopf--haupt" href={`#/lehrkraft/schueler/${s.id}`}>
                          Lernstand
                        </a>
                        <button type="button" className="lk-knopf" onClick={() => einzelnZuruecksetzen(s)}>
                          Zurücksetzen
                        </button>
                      </div>
                    </td>
                    <td>
                      <button type="button" className="lk-knopf lk-knopf--gefahr" onClick={() => loeschen(s)}>
                        Löschen
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="lk-leise">
            Pseudonym antippen, ändern und mit Enter speichern. Sterne-Stufe „automatisch“: alle beginnen mit einem Stern und steigen
            selbst auf. Eine feste Stufe gilt, bis Sie wieder „automatisch“ wählen.
          </p>
        </>
      )}

      <section className="lk-abschnitt">
        <h2>Schüler:innen hinzufügen</h2>
        <p className="lk-leise">Bitte nur Pseudonyme, keine echten Namen. Wer welches Pseudonym hat, notieren Sie außerhalb der App.</p>
        <div className="lk-reiter" role="group" aria-label="Art der Pseudonyme">
          <button type="button" className="lk-knopf" aria-pressed={modus === 'automatisch'} onClick={() => setModus('automatisch')}>
            Automatisch erzeugen
          </button>
          <button type="button" className="lk-knopf" aria-pressed={modus === 'liste'} onClick={() => setModus('liste')}>
            Eigene Liste
          </button>
        </div>
        {modus === 'automatisch' ? (
          <form
            className="lk-zeile"
            onSubmit={(e) => {
              e.preventDefault()
              void hinzufuegen(erzeugePseudonyme(anzahl, vorhanden))
            }}
          >
            <label>
              Anzahl
              <input className="lk-feld lk-feld--zahl" type="number" min={1} max={40} value={anzahl} onChange={(e) => setAnzahl(Number(e.target.value))} required />
            </label>
            <button className="lk-knopf lk-knopf--haupt">Pseudonyme erzeugen (z. B. Fuchs-07)</button>
          </form>
        ) : (
          <form
            className="lk-formular"
            onSubmit={(e) => {
              e.preventDefault()
              const { neu, doppelt } = pseudonymListeLesen(liste, vorhanden)
              void hinzufuegen(neu, doppelt)
              setListe('')
            }}
          >
            <label>
              Ein Pseudonym pro Zeile
              <textarea className="lk-feld" rows={6} value={liste} onChange={(e) => setListe(e.target.value)} placeholder={'Komet-1\nKomet-2\nKomet-3'} required />
            </label>
            <div>
              <button className="lk-knopf lk-knopf--haupt">Hinzufügen</button>
            </div>
          </form>
        )}
      </section>

      <section className="lk-abschnitt">
        <h2>Ergebnisse zurücksetzen</h2>
        <p className="lk-leise">
          Zum Beispiel am Schuljahresende: Löscht alle Antworten der Klasse endgültig. Sterne-Stufen beginnen wieder bei einem Stern (fest
          eingestellte bleiben). Pseudonyme und Links bleiben.
        </p>
        <div>
          <button type="button" className="lk-knopf" disabled={schueler.length === 0} onClick={klasseZuruecksetzen}>
            Ergebnisse der Klasse „{klasse.name}“ zurücksetzen
          </button>
        </div>
      </section>

      <section className="lk-abschnitt">
        <h2>Klasse löschen</h2>
        <p className="lk-leise">Löscht die Klasse, alle Schüler:innen und alle Ergebnisse endgültig.</p>
        <div>
          <button type="button" className="lk-knopf lk-knopf--gefahr" onClick={() => void klasseLoeschen()}>
            Klasse „{klasse.name}“ löschen
          </button>
        </div>
      </section>
    </>
  )
}
