import type { ComponentProps } from 'react'

// Eingabefeld für Schüler:innen: Das iPad darf nichts korrigieren, vorschlagen oder großschreiben –
// sonst wäre jede Rechtschreibaufgabe sinnlos. Alle Eingaben der Schüleransicht laufen über dieses Feld.
export function Eingabe(props: ComponentProps<'input'>) {
  return (
    <input
      {...props}
      type="text"
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck={false}
      inputMode="text"
    />
  )
}
