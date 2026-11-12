// alt (Übungswiese, EinstellungenSeite) im Thema „ruhig“, ohne Blumenwiese: Berechnung des Lernstands und Rückmeldetexte.
import { useEffect, useState, type ChangeEvent } from 'react'
import { fehlerText } from '../lib/fehler'
import type { Einstellungen as EinstellungenTyp, RueckmeldeText } from '../lib/lernstand'
import { supabase } from '../lib/supabase'

const TEXT_FELDER: { feld: RueckmeldeText; titel: string; hilfe: string }[] = [
  { feld: 'deutlich', titel: 'Deutlich besser', hilfe: 'mindestens 2 Stufen besser als beim Vergleich' },
  { feld: 'besser', titel: 'Wird besser', hilfe: 'besser als beim Vergleich' },
  { feld: 'dranbleiben', titel: 'Dranbleiben', hilfe: 'gleich geblieben oder schwächer (wird nie als „schlechter“ gezeigt)' },
  { feld: 'erste', titel: 'Erste Ergebnisse', hilfe: 'noch zu wenige Versuche für eine Aussage' },
  { feld: 'gelungen', titel: 'Was schon gelingt', hilfe: '{anzahl} = Zahl gelöster Aufgaben, {aufgaben} = „Aufgabe“ oder „Aufgaben“' },
  { feld: 'naechster_schritt', titel: 'Nächster Schritt', hilfe: 'dahinter steht der Name der Kompetenz mit dem meisten Übungsbedarf' },
]

type ZahlFeld = Exclude<keyof EinstellungenTyp, 'owner' | 'texte'>

export function Einstellungen() {
  const [e, setE] = useState<EinstellungenTyp | null>(null)
  const [fehler, setFehler] = useState<string | null>(null)
  const [gespeichert, setGespeichert] = useState(false)

  useEffect(() => {
    void supabase
      .from('einstellungen')
      .select('owner, min_versuche, anzahl_letzte, abklingen, punkte_leicht, punkte_mittel, punkte_schwer, grenze_minus, grenze_o, grenze_plus, grenze_plusplus, trend_min_neue, trend_min_diff, vergleich_wochen, texte')
      .single()
      .then(({ data, error }) => (error ? setFehler(fehlerText(error)) : setE(data as EinstellungenTyp)))
  }, [])

  if (!e) return fehler ? <p className="lk-hinweis" role="alert">{fehler}</p> : <p className="lk-leise" role="status">Lädt …</p>

  const text = (feld: RueckmeldeText) => (ev: ChangeEvent<HTMLInputElement>) => setE({ ...e, texte: { ...e.texte, [feld]: ev.target.value } })
  // als Funktion (nicht als Komponente), damit das Feld beim Tippen nicht neu entsteht und den Fokus behält
  const zahl = (feld: ZahlFeld, titel: string, rest: { min?: number; max?: number; step?: number }) => (
    <label key={feld}>
      {titel}
      <input
        className="lk-feld lk-feld--zahl"
        type="number"
        {...rest}
        value={e[feld] ?? ''}
        onChange={(ev) => setE({ ...e, [feld]: ev.target.value === '' ? null : Number(ev.target.value) })}
      />
    </label>
  )

  return (
    <form
      className="lk-formular"
      onSubmit={async (ev) => {
        ev.preventDefault()
        const { owner, ...rest } = e
        const { error } = await supabase.from('einstellungen').update(rest).eq('owner', owner)
        if (error) {
          setFehler(/check|grenzen/i.test(error.message) ? 'Bitte die Grenzen aufsteigend wählen (z. B. 35 < 55 < 70 < 85).' : fehlerText(error))
        } else {
          setFehler(null)
          setGespeichert(true)
          window.setTimeout(() => setGespeichert(false), 2500)
        }
      }}
    >
      <h1>Einstellungen</h1>

      <section className="lk-abschnitt">
        <h2>Rückmeldetexte für „Mein Lernweg“</h2>
        <p className="lk-leise">Schüler:innen sehen nur diese Texte, nie Stufen, Punkte oder Prozente.</p>
        {TEXT_FELDER.map((t) => (
          <label key={t.feld}>
            {t.titel} <span className="lk-leise">({t.hilfe})</span>
            <input className="lk-feld" value={e.texte[t.feld] ?? ''} onChange={text(t.feld)} required maxLength={200} />
          </label>
        ))}
      </section>

      <section className="lk-abschnitt">
        <h2>Berechnung des Lernstands</h2>
        <p className="lk-leise">
          Pro Kompetenz zählen die letzten gewerteten Versuche (pro Aufgabe und Tag nur der erste, nicht nach „Lösung ansehen“).
          Jeder Versuch bringt „Anteil richtig × Höchstpunkte der Sterne-Stufe“. Neuere Versuche zählen mehr. Aus dem Durchschnitt
          (0–100) ergibt sich die Stufe -- bis ++.
        </p>
        <div className="lk-zeile">
          {zahl('min_versuche', 'Mindestanzahl Versuche', { min: 1, max: 50 })}
          {zahl('anzahl_letzte', 'Berücksichtigte letzte Versuche', { min: 3, max: 100 })}
          {zahl('abklingen', 'Gewicht älterer Versuche (0,5–1)', { min: 0.5, max: 1, step: 0.05 })}
        </div>
        <div className="lk-zeile">
          {zahl('punkte_leicht', 'Höchstpunkte bei ★', { min: 1, max: 100 })}
          {zahl('punkte_mittel', 'bei ★★', { min: 1, max: 100 })}
          {zahl('punkte_schwer', 'bei ★★★', { min: 1, max: 100 })}
        </div>
        <p className="lk-leise">Stufengrenzen (ab so vielen Punkten gilt die Stufe):</p>
        <div className="lk-zeile">
          {zahl('grenze_minus', '„-“ ab', { min: 1, max: 100 })}
          {zahl('grenze_o', '„o“ ab', { min: 1, max: 100 })}
          {zahl('grenze_plus', '„+“ ab', { min: 1, max: 100 })}
          {zahl('grenze_plusplus', '„++“ ab', { min: 1, max: 100 })}
        </div>
      </section>

      <section className="lk-abschnitt">
        <h2>Entwicklung (Trend)</h2>
        <p className="lk-leise">
          Ein Trend erscheint nur, wenn seit dem Vergleich genug neue Versuche dazugekommen sind UND sich der Stand deutlich verändert hat.
          So wird Zufall nicht als Fortschritt gedeutet.
        </p>
        <div className="lk-zeile">
          {zahl('trend_min_neue', 'Mindestens neue Versuche', { min: 1, max: 50 })}
          {zahl('trend_min_diff', 'Mindest-Veränderung (Punkte)', { min: 1, max: 100 })}
          {zahl('vergleich_wochen', 'Vergleich mit Stand vor … Wochen (leer = Startstand)', { min: 1, max: 52 })}
        </div>
      </section>

      {fehler && <p className="lk-hinweis" role="alert">{fehler}</p>}
      <div>
        <button className="lk-knopf lk-knopf--haupt">{gespeichert ? '✓ Gespeichert' : 'Speichern'}</button>
      </div>
    </form>
  )
}
