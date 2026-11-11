// Texte, die Einstein sagt (src/schueler/einstein.md): „## kennung“ und darunter der Text.

export function einsteinTexte(md: string): Record<string, string> {
  const texte: Record<string, string> = {}
  let kennung = ''
  for (const zeile of md.replace(/<!--[\s\S]*?-->/g, '').split(/\r?\n/)) {
    if (zeile.startsWith('## ')) texte[(kennung = zeile.slice(3).trim())] = ''
    else if (kennung) texte[kennung] += zeile.trim() ? (texte[kennung] && !texte[kennung].endsWith('\n') ? ' ' : '') + zeile.trim() : texte[kennung] ? '\n' : ''
  }
  for (const k in texte) texte[k] = texte[k].trim()
  return texte
}

/** Kennung der Format-Erklärung (Diktat je Modus) */
export function formatKennung(typ: string, modus?: string): string {
  return typ === 'diktat' ? `diktat-${modus ?? 'abschreiben'}` : typ
}
