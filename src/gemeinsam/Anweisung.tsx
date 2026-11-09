import { fachbegriffeFaerben } from '../lib/kategorien'

// Arbeitsanweisung einer Aufgabe. Fachbegriffe (Wortarten, Satzglieder, Zeitformen) erscheinen automatisch
// in ihrer Farbe – z. B. „Verben“ rot. Mit farbig={false} bleibt alles einfarbig (Einstellung je Aufgabe).
export function Anweisung({ text, farbig = true }: { text: string; farbig?: boolean }) {
  if (!farbig) return <p>{text}</p>
  return (
    <p>
      {fachbegriffeFaerben(text).map((teil, i) =>
        teil.kategorie ? (
          <span key={i} className="fach-text" data-farbe={teil.kategorie.farbe}>
            {teil.text}
          </span>
        ) : (
          teil.text
        ),
      )}
    </p>
  )
}
