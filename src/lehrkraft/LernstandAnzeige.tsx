// alt (Übungswiese), im Thema „ruhig“: Bausteine des Lernstands – nur für die Lehrkraft.
import { datum, STUFEN, trendPfeil, trendText, type Auswertung, type Einstellungen } from '../lib/lernstand'

// Feld in der Heatmap: Farbe UND Zeichen (für Farbsehschwäche und Schwarz-Weiß-Druck).
export function StufenFeld({ a, titel }: { a: Pick<Auswertung, 'stufe' | 'trend_gueltig' | 'trend_punkte'> | undefined; titel?: string }) {
  if (!a || a.stufe === null)
    return (
      <span className="lk-stufe lk-stufe--wenig" title="noch nicht genug Daten">
        –
      </span>
    )
  const s = STUFEN[a.stufe]
  return (
    <span className="lk-stufe" style={{ background: s.farbe, color: s.text }} title={titel ?? `Stufe ${s.symbol}`}>
      {s.symbol}
      {a.trend_gueltig && <small>{trendPfeil(a)}</small>}
    </span>
  )
}

// Stufenbalken: Füllung bis zur Stufe (20 % … 100 %) mit Zeichen, Strich für den Startstand, Trend als Text.
export function StufenStreifen({ a, e, name }: { a: Auswertung; e: Einstellungen; name: string }) {
  const s = a.stufe === null ? null : STUFEN[a.stufe]
  const beschreibung = `${name}: ${s ? `Stufe ${s.symbol}` : 'noch nicht genug Daten'}. ${trendText(a, e)}`
  return (
    <div className="lk-streifen">
      <span className="lk-streifen__name">{name}</span>
      <div className="lk-streifen__bahn" role="img" aria-label={beschreibung}>
        {s && a.stufe !== null ? (
          <div className="lk-streifen__fuellung" style={{ width: `${(a.stufe + 1) * 20}%`, background: s.farbe, color: s.text }}>
            {s.symbol}
          </div>
        ) : (
          <div className="lk-streifen__leer">noch nicht genug Daten</div>
        )}
        {a.start_stufe !== null && (
          <div className="lk-streifen__start" style={{ left: `calc(${(a.start_stufe + 1) * 20}% - 2px)` }} title={`Startstand ${STUFEN[a.start_stufe].symbol}`} />
        )}
      </div>
      <span className="lk-leise">
        <b aria-hidden="true">{trendPfeil(a)} </b>
        {trendText(a, e)}
      </span>
    </div>
  )
}

// Verlaufskurve des Stands (nach jedem gewerteten Versuch), mit Stufengrenzen und Datum je Versuch.
export function Verlauf({ a, e }: { a: Auswertung; e: Einstellungen }) {
  const punkte = a.verlauf ?? []
  if (punkte.length < 2) return null
  const breite = 340
  const kurve = 80 // Höhe des Kurvenbereichs, darunter Platz für die Daten
  const x = (i: number) => 18 + (i / (punkte.length - 1)) * (breite - 36)
  const y = (p: number) => kurve - 4 - (p / 100) * (kurve - 8)
  const linie = punkte.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.punkte).toFixed(1)}`).join(' ')
  // Datum unter jedem Versuch. Wird es eng, stehen die Daten versetzt in zwei Zeilen;
  // erst bei sehr vielen Versuchen wird nur noch jedes n-te Datum beschriftet (das letzte immer).
  const abstand = (breite - 36) / (punkte.length - 1)
  const zweiZeilen = abstand < 40
  const jedes = Math.max(1, Math.ceil(40 / (abstand * (zweiZeilen ? 2 : 1))))
  const kurz = (zeit: string) => new Date(zeit).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
  const beschriftet = punkte
    .map((_, i) => i)
    .filter((i) => i === punkte.length - 1 || (i % jedes === 0 && punkte.length - 1 - i >= jedes))
  const zeile = new Map(beschriftet.map((i, nr) => [i, zweiZeilen ? nr % 2 : 0]))
  const hoehe = kurve + (zweiZeilen ? 32 : 20)
  return (
    <svg className="lk-verlauf" viewBox={`0 0 ${breite} ${hoehe}`} role="img" aria-label="Verlauf des Lernstands mit Datum">
      {[e.grenze_minus, e.grenze_o, e.grenze_plus, e.grenze_plusplus].map((g) => (
        <line key={g} x1="0" x2={breite} y1={y(g)} y2={y(g)} className="lk-verlauf__grenze" />
      ))}
      <path d={linie} className="lk-verlauf__linie" />
      {punkte.map((p, i) => {
        const z = zeile.get(i)
        return (
          <g key={i}>
            <circle cx={x(i)} cy={y(p.punkte)} r="2.8" className="lk-verlauf__punkt">
              <title>{datum(p.zeit)}</title>
            </circle>
            {z !== undefined && (
              <>
                <line x1={x(i)} x2={x(i)} y1={kurve} y2={kurve + 4 + z * 12} className="lk-verlauf__grenze" />
                <text x={x(i)} y={kurve + 15 + z * 12} className="lk-verlauf__datum" textAnchor="middle">
                  {kurz(p.zeit)}
                </text>
              </>
            )}
          </g>
        )
      })}
    </svg>
  )
}

export function Legende() {
  return (
    <p className="lk-legende">
      <span>Stufen:</span>
      {STUFEN.map((s) => (
        <span key={s.symbol} className="lk-stufe" style={{ background: s.farbe, color: s.text }}>
          {s.symbol}
        </span>
      ))}
      <span>
        <span className="lk-stufe lk-stufe--wenig">–</span> noch nicht genug Daten
      </span>
      <span>
        <span className="lk-stufe" style={{ background: STUFEN[3].farbe, color: STUFEN[3].text }}>
          +<small>↗</small>
        </span>{' '}
        mit Trend
      </span>
    </p>
  )
}
