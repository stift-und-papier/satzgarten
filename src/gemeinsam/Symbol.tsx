// Eigene, einfache Symbole (Linienzeichnung, runde Enden). Immer aria-hidden: Der Text daneben trägt die Bedeutung.
export type SymbolName =
  | 'garten' | 'uebungen' | 'lernweg' | 'sammelbuch' | 'hilfe'
  | 'zurueck' | 'weiter' | 'tipp' | 'stern' | 'haus' | 'shop' | 'erklaerung' | 'einstellungen'

const PFADE: Record<SymbolName, string> = {
  // Marktstand mit Vordach
  shop: 'M4 9l1.5-5h13L20 9Z M4 9c0 1.7 1.3 3 3 3s3-1.3 3-3c0 1.7 1.3 3 2 3s2-1.3 2-3c0 1.7 1.3 3 3 3s3-1.3 3-3 M6 12v8h12v-8 M10 20v-5h4v5',
  // Spross mit zwei Blättern auf Erde
  garten: 'M12 20v-8 M12 13c-4 0-6-2-6-5 3 0 6 1 6 5Z M12 11c0-4 2-6 6-6 0 3-2 6-6 6Z M5 20h14',
  // aufgeschlagenes Heft
  uebungen: 'M12 6c-2-1.5-5-2-8-1.5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5v-13c-3-.5-6 0-8 1.5Z M12 6v13',
  // Berg mit Fahne auf dem Gipfel: der Weg zum Ziel
  lernweg: 'M2 20 9 9l4 5 3-4 6 10Z M9 9V3 M9 3l5 1.8L9 6.6',
  // Album mit Blüte
  sammelbuch: 'M6 3h11a1 1 0 0 1 1 1v16H7a2 2 0 0 1-2-2V5a2 2 0 0 1 1-2Z M5 18a2 2 0 0 1 2-2h11 M12 7.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 1 0 0-3Z M12 6v1.5 M12 10.5V12 M10 9h-1.5 M15.5 9H14',
  // Blatt mit Eselsohr und Zeilen (Erklärseite)
  erklaerung: 'M6 3h9l4 4v14H6Z M15 3v4h4 M9 11h7 M9 14h7 M9 17h5',
  // Fragezeichen im Kreis
  einstellungen: 'M12 9a3 3 0 1 0 0 6 3 3 0 1 0 0-6Z M12 2.5v3 M12 18.5v3 M2.5 12h3 M18.5 12h3 M5.3 5.3l2.1 2.1 M16.6 16.6l2.1 2.1 M5.3 18.7l2.1-2.1 M16.6 7.4l2.1-2.1',
  hilfe: 'M12 3a9 9 0 1 0 0 18 9 9 0 1 0 0-18Z M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7 M12 16.5v.5',
  // Pfeile mit Schaft (deutlicher als nur eine Spitze)
  zurueck: 'M20 12H5 M11 5l-7 7 7 7',
  weiter: 'M4 12h15 M13 5l7 7-7 7',
  // Glühbirne
  tipp: 'M9 17h6 M10 20h4 M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3Z',
  stern: 'M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-3-5.4 3 1.1-6-4.5-4.2 6.1-.8Z',
  haus: 'M4 11l8-7 8 7 M6 9.5V20h12V9.5 M10 20v-5h4v5',
}

export function Symbol({ name, gefuellt = false }: { name: SymbolName; gefuellt?: boolean }) {
  return (
    <svg className="symbol" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d={PFADE[name]} fill={gefuellt ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
