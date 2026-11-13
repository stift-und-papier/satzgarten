// alt (Übungswiese), im Pixel-Look: Seite „Hilfe“. Die Texte stehen in hilfe.md (ohne Code änderbar).
import { fettTeile, hilfeLesen, type Block } from '../lib/hilfe'
import text from './hilfe.md?raw'

const ABSCHNITTE = hilfeLesen(text)

const mitFett = (t: string) => fettTeile(t).map((teil, i) => (i % 2 ? <strong key={i}>{teil}</strong> : teil))

function BlockAnzeige({ block }: { block: Block }) {
  if (block.art === 'absatz') return <p>{mitFett(block.text)}</p>
  return (
    <ul>
      {block.punkte.map((p, i) => (
        <li key={i}>{mitFett(p)}</li>
      ))}
    </ul>
  )
}

export function Hilfe() {
  return (
    <>
      <header className="karte">
        <h1>Hilfe</h1>
        <p>Tippe auf eine Frage, dann klappt die Antwort auf.</p>
      </header>
      {ABSCHNITTE.map((a) => (
        <section key={a.titel} className="karte">
          <h2>{a.titel}</h2>
          {a.eintraege.map((e) => (
            <details key={e.frage} className="hilfe-eintrag">
              <summary>{e.frage}</summary>
              {e.bloecke.map((b, i) => (
                <BlockAnzeige key={i} block={b} />
              ))}
            </details>
          ))}
        </section>
      ))}
    </>
  )
}
