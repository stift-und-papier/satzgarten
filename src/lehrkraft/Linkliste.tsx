import QRCode from 'qrcode'
import { useEffect, useState } from 'react'
import { fehlerText } from '../lib/fehler'
import { schuelerLink } from '../lib/router'
import { supabase } from '../lib/supabase'
import type { Klasse, Schueler } from '../lib/typen'

// alt (Übungswiese): Druckblatt mit Pseudonym, QR-Code und Link je Schüler:in (zum Scannen mit der iPad-Kamera).
// Die QR-Codes entstehen im Browser – die Links gehen an keinen fremden Dienst.
export function Linkliste({ klasseId }: { klasseId: string }) {
  const [klasse, setKlasse] = useState<Klasse | null>(null)
  const [schueler, setSchueler] = useState<Schueler[]>([])
  const [fehler, setFehler] = useState<string | null>(null)

  useEffect(() => {
    void Promise.all([
      supabase.from('klassen').select('id, name, kerncurriculum').eq('id', klasseId).single(),
      supabase.from('schueler').select('id, klasse_id, pseudonym, token, stufe_manuell').eq('klasse_id', klasseId),
    ]).then(([k, s]) => {
      if (k.error || s.error) return setFehler(fehlerText(k.error ?? s.error))
      setKlasse(k.data as Klasse)
      setSchueler((s.data as Schueler[]).sort((a, b) => a.pseudonym.localeCompare(b.pseudonym, 'de', { numeric: true })))
    })
  }, [klasseId])

  if (fehler) return <p className="lk-hinweis" role="alert">{fehler}</p>
  if (!klasse) return <p className="lk-leise" role="status">Lädt …</p>

  return (
    <>
      <div className="lk-nicht-drucken lk-formular">
        <a className="lk-zurueck" href={`#/lehrkraft/klassen/${klasse.id}`}>← Zurück zur Klasse</a>
        <p className="lk-hinweis">
          Diese Links sind persönlich wie ein Schlüssel: Wer einen hat, kann als diese Person üben. Bitte einzeln verteilen und nicht
          aushängen.
        </p>
        <div>
          <button type="button" className="lk-knopf lk-knopf--haupt" onClick={() => window.print()}>
            Drucken oder als PDF speichern
          </button>
        </div>
        <p className="lk-leise">Zum Ausschneiden: Jede Karte hat einen Rahmen. Als PDF: im Druckfenster „Als PDF speichern“ wählen.</p>
      </div>
      <h1>Persönliche Links der Klasse {klasse.name}</h1>
      <ul className="lk-linkkarten">
        {schueler.map((s) => (
          <li key={s.id} className="lk-linkkarte">
            <QrCode text={schuelerLink(s.token)} beschriftung={`QR-Code für ${s.pseudonym}`} />
            <div>
              <strong className="lk-linkkarte__name">{s.pseudonym}</strong>
              <p className="lk-linkkarte__link">{schuelerLink(s.token)}</p>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}

function QrCode({ text, beschriftung }: { text: string; beschriftung: string }) {
  const [svg, setSvg] = useState('')
  useEffect(() => {
    void QRCode.toString(text, { type: 'svg', margin: 1, errorCorrectionLevel: 'M' }).then(setSvg)
  }, [text])
  // Das SVG stammt aus der QR-Bibliothek und enthält nur Pfade (kein fremder Inhalt).
  return <div className="lk-qr" role="img" aria-label={beschriftung} dangerouslySetInnerHTML={{ __html: svg }} />
}
