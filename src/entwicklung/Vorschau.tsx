import { LehrkraftRahmen } from '../lehrkraft/LehrkraftRahmen'

// Vorschauseiten mit Beispieldaten (nur `npm run dev`, Adresse #/vorschau/…), ohne Anmeldung und ohne Datenbank.
// #/vorschau/lehrkraft: Rahmen der Lehrkraft-Seiten mit Beispielinhalt.
export default function Vorschau() {
  return (
    <LehrkraftRahmen bereich="klassen" email="lehrkraft@beispiel.de">
      <h1>Klassen</h1>
      <p>Beispielinhalt: Hier legen Sie bald Klassen und Pseudonyme an.</p>
    </LehrkraftRahmen>
  )
}
