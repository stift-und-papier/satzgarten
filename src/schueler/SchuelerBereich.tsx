// alt (Übungswiese), im Pixel-Look: alles, was Schüler:innen sehen. Zugriff nur über die Datenbank-Funktionen
// mit dem Link-Token (#/s/<token>/…). Antworten ohne Internet warten im Speicher des iPads (speicher.ts).
import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { AufgabeBearbeiten, type PruefAntwort } from '../gemeinsam/AufgabeBearbeiten'
import { EinsteinSagt } from '../gemeinsam/Einstein'
import { Sprite } from '../gemeinsam/Sprite'
import { Sterne } from '../gemeinsam/Sterne'
import { Symbol, type SymbolName } from '../gemeinsam/Symbol'
import { einsteinTexte, formatKennung } from '../lib/einstein'
import { fehlerText, istNetzwerkfehler } from '../lib/fehler'
import { GRAFIK } from '../grafik'
import { gehe } from '../lib/router'
import { artikelBild } from '../lib/shop'
import { supabase } from '../lib/supabase'
import type { Loesung, SchuelerAufgabe, SchuelerPaket, SchuelerStart } from '../lib/typen'
import { neueId } from '../lib/zufall'
import einsteinMd from './einstein.md?raw'
import { Farm } from './Farm'
import { Album } from './Album'
import { Erklaerungen } from './Erklaerungen'
import { Hilfe } from './Hilfe'
import { Lernweg } from './Lernweg'
import { Shop } from './Shop'
import { Einstellungen } from './Einstellungen'
import { UebungSpiel } from './UebungSpiel'
import { monster } from '../lib/monster'
import { leseschriftVorgabe } from '../lib/leseschrift'
import { entwurfLesen, entwurfSpeichern, warteschlangeLesen, warteschlangeSpeichern, type WartenderVersuch } from './speicher'

const EINSTEIN = einsteinTexte(einsteinMd)

type Props = { token: string; pfad: string[] }

export function SchuelerBereich({ token, pfad }: Props) {
  const [daten, setDaten] = useState<SchuelerStart | null>(null)
  const [fehler, setFehler] = useState<string | null>(null)
  const [wartend, setWartend] = useState(() => warteschlangeLesen(token).length)
  const [muenzen, setMuenzen] = useState<number | null>(null)
  const [geschenke, setGeschenke] = useState<Geschenk[]>([])
  const [belohnungen, setBelohnungen] = useState<Belohnung[]>([])
  const [farmStand, setFarmStand] = useState(0) // neu laden, wenn Geschenke dazukamen

  const laden = useCallback(async () => {
    const [start, konto, belohnt] = await Promise.all([
      supabase.rpc('schueler_start', { p_token: token }),
      supabase.rpc('schueler_muenzen', { p_token: token }),
      supabase.rpc('belohnungen_holen', { p_token: token }),
    ])
    if (!belohnt.error) setBelohnungen(belohnt.data as Belohnung[])
    if (start.error) setFehler(fehlerText(start.error))
    else {
      const d = start.data as SchuelerStart
      leseschriftVorgabe(Boolean(d.leseschrift))
      setDaten(d)
      setFehler(null)
    }
    if (!konto.error) {
      const k = konto.data as { kontostand: number; geschenke: Geschenk[] }
      setMuenzen(k.kontostand)
      setGeschenke(k.geschenke)
    }
  }, [token])

  // Wartende Antworten senden, sobald wieder Internet da ist. client_id sorgt dafür, dass jede genau einmal zählt.
  const warteschlangeSenden = useCallback(async () => {
    const liste = warteschlangeLesen(token)
    if (liste.length === 0) return
    const erledigt = new Set<string>()
    for (const v of liste) {
      const { error } = await supabase.rpc('antwort_abgeben', {
        p_token: token,
        p_paket_id: v.paket_id,
        p_aufgabe_id: v.aufgabe_id,
        p_antworten: v.antworten,
        p_client_id: v.client_id,
        p_bearbeitet_am: v.bearbeitet_am,
      })
      // Nur bei Netzwerkproblemen behalten; andere Fehler (z. B. Aufgabe gelöscht) verwerfen.
      if (!(error && istNetzwerkfehler(error))) erledigt.add(v.client_id)
    }
    // Neu lesen: Während des Sendens kann eine weitere Antwort dazugekommen sein, die nicht überschrieben werden darf
    const rest = warteschlangeLesen(token).filter((v) => !erledigt.has(v.client_id))
    warteschlangeSpeichern(token, rest)
    setWartend(rest.length)
    if (erledigt.size > 0) void laden()
  }, [token, laden])

  useEffect(() => {
    void laden()
    void warteschlangeSenden()
    const beiOnline = () => void warteschlangeSenden()
    window.addEventListener('online', beiOnline)
    const timer = window.setInterval(() => void warteschlangeSenden(), 20000)
    return () => {
      window.removeEventListener('online', beiOnline)
      window.clearInterval(timer)
    }
  }, [laden, warteschlangeSenden])

  const basis = `/s/${token}`
  const fenster =
    geschenke.length > 0 ? (
      <GeschenkFenster
        geschenke={geschenke}
        schliessen={() => {
          // .then() nötig: supabase-js sendet die Anfrage erst, wenn jemand auf das Ergebnis wartet
          void supabase.rpc('geschenke_gesehen', { p_token: token, p_ids: geschenke.map((g) => g.id) }).then()
          setGeschenke([])
        }}
      />
    ) : (
      belohnungen.length > 0 && (
        <BelohnungFenster
          belohnungen={belohnungen}
          schliessen={() => {
            void supabase.rpc('belohnungen_gesehen', { p_token: token, p_ids: belohnungen.map((b) => b.id) }).then()
            setBelohnungen([])
            setFarmStand((n) => n + 1)
          }}
        />
      )
    )
  const [bereich, paketId, , aufgabeId] = pfad

  if (!daten) {
    return (
      <Rahmen basis={basis} aktiv="start" menue={false}>
        {fehler ? (
          <div className="karte">
            <h1>Hallo!</h1>
            <p role="alert">{fehler}</p>
            <p>Wenn das so bleibt, frag deine Lehrkraft nach deinem Link.</p>
            <div className="knopf-reihe">
              <button type="button" className="knopf knopf--haupt" onClick={() => void laden()}>
                Noch einmal versuchen
              </button>
            </div>
          </div>
        ) : (
          <p className="karte" role="status">
            Einen Moment …
          </p>
        )}
      </Rahmen>
    )
  }

  const paket = bereich === 'p' ? daten.pakete.find((p) => p.id === paketId) : undefined
  const wartendHinweis = wartend > 0 && (
    <p className="karte" role="status">
      {wartend === 1 ? '1 Antwort wartet' : `${wartend} Antworten warten`} auf Internet und {wartend === 1 ? 'wird' : 'werden'} von selbst gesendet.
    </p>
  )

  if (paket && aufgabeId) {
    const index = paket.aufgaben.findIndex((a) => a.id === aufgabeId)
    const aufgabe = paket.aufgaben[index]
    return (
      <Rahmen basis={basis} aktiv="uebungen" muenzen={muenzen} fenster={fenster}>
        {wartendHinweis}
        <div className="knopf-reihe">
          <a className="holzknopf" href={`#${basis}/p/${paket.id}`} aria-label={`Zurück zu ${paket.titel}`}>
            <Symbol name="zurueck" />
          </a>
          <span className="ort">
            {paket.titel}
            {aufgabe && ` · ${aufgabe.uebung ? 'Übung' : 'Aufgabe'} ${index + 1} von ${paket.aufgaben.length}`}
          </span>
        </div>
        {aufgabe?.uebung ? (
          <UebungSpiel
            key={aufgabe.id}
            token={token}
            paketId={paket.id}
            aufgabe={aufgabe}
            nachAbschluss={() => void laden()}
            figur={daten.figur ?? 'gruen'}
            naechste={paket.aufgaben[index + 1] ? `#${basis}/p/${paket.id}/a/${paket.aufgaben[index + 1].id}` : null}
            zumPaket={`#${basis}/p/${paket.id}`}
          />
        ) : aufgabe ? (
          <AufgabeSeite
            key={aufgabe.id}
            token={token}
            paketId={paket.id}
            aufgabe={aufgabe}
            neuesFormat={!daten.formate_geuebt.includes(aufgabe.typ)}
            nachAbgabe={() => void laden()}
            onWartend={setWartend}
            weiter={
              paket.aufgaben[index + 1]
                ? { text: 'Weiter', ziel: () => gehe(`${basis}/p/${paket.id}/a/${paket.aufgaben[index + 1].id}`) }
                : { text: 'Fertig', ziel: () => gehe(`${basis}/p/${paket.id}`) }
            }
          />
        ) : (
          <p className="karte">Diese Aufgabe gibt es nicht mehr.</p>
        )}
      </Rahmen>
    )
  }

  if (paket) {
    return (
      <Rahmen basis={basis} aktiv="uebungen" muenzen={muenzen} fenster={fenster}>
        {wartendHinweis}
        <header className="karte">
          <div className="knopf-reihe">
            <a className="holzknopf" href={`#${basis}/uebungen`} aria-label="Zurück zu allen Übungen">
              <Symbol name="zurueck" />
            </a>
            <h1>{paket.titel}</h1>
          </div>
          {paket.beschreibung && <p>{paket.beschreibung}</p>}
        </header>
        <ol className="paket-liste">
          {paket.aufgaben.map((a, i) => (
            <li key={a.id}>
              <a className="karte paket-liste__eintrag" href={`#${basis}/p/${paket.id}/a/${a.id}`}>
                {a.uebung ? (
                  <span className="paket-liste__monster">
                    <Sprite grafik={monster(a.monster).grafik} mal={monster(a.monster).grafik.bildHoehe <= 16 ? 2 : 1} />
                    {a.befreundet && (
                      <span className="paket-liste__freund">
                        <Sprite grafik={GRAFIK.herz} mal={1} />
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="paket-liste__nr" aria-hidden="true">
                    {a.geloest ? '✓' : i + 1}
                  </span>
                )}
                <span>
                  <strong>{a.titel}</strong>
                  <br />
                  <span className="leise">{aufgabeStand(a)}</span>
                </span>
                {a.typ !== 'erklaerung' && (
                  <span className="paket-liste__stufe">
                    <span className="leise">Schwierigkeit</span>
                    <Sterne stufe={a.stufe} />
                  </span>
                )}
              </a>
            </li>
          ))}
        </ol>
      </Rahmen>
    )
  }

  if (bereich === 'lernweg') {
    return (
      <Rahmen basis={basis} aktiv="lernweg" muenzen={muenzen} fenster={fenster}>
        <Lernweg token={token} uebungen={`#${basis}/uebungen`} />
      </Rahmen>
    )
  }

  if (bereich === 'shop') {
    return (
      <Rahmen basis={basis} aktiv="shop" muenzen={muenzen} fenster={fenster}>
        <Shop token={token} nachKauf={() => void laden()} />
      </Rahmen>
    )
  }

  if (bereich === 'album') {
    return (
      <Rahmen basis={basis} aktiv="start" muenzen={muenzen} fenster={fenster}>
        <Album token={token} zurueck={`#${basis}`} />
      </Rahmen>
    )
  }

  if (bereich === 'erklaerungen') {
    return (
      <Rahmen basis={basis} aktiv="erklaerungen" muenzen={muenzen} fenster={fenster}>
        {wartendHinweis}
        <Erklaerungen
          token={token}
          basis={basis}
          id={paketId}
          zeigen={(a, nachAbgabe) => (
            <AufgabeSeite
              key={a.id}
              token={token}
              paketId={null}
              aufgabe={a}
              neuesFormat={false}
              nachAbgabe={() => {
                nachAbgabe()
                void laden()
              }}
              onWartend={setWartend}
              weiter={{ text: 'Fertig', ziel: () => gehe(`${basis}/erklaerungen`) }}
            />
          )}
        />
      </Rahmen>
    )
  }

  if (bereich === 'einstellungen') {
    return (
      <Rahmen basis={basis} aktiv="einstellungen" muenzen={muenzen} fenster={fenster}>
        <Einstellungen token={token} figur={daten.figur ?? 'gruen'} nachWahl={() => void laden()} />
      </Rahmen>
    )
  }

  if (bereich === 'hilfe') {
    return (
      <Rahmen basis={basis} aktiv="hilfe" muenzen={muenzen} fenster={fenster}>
        <Hilfe />
      </Rahmen>
    )
  }

  if (bereich === 'uebungen') {
    return (
      <Rahmen basis={basis} aktiv="uebungen" muenzen={muenzen} fenster={fenster}>
        {wartendHinweis}
        <header className="karte">
          <h1>Meine Übungen</h1>
          <p>{daten.pakete.length === 0 ? 'Hier kommen bald neue Übungen.' : 'Such dir eine Übung aus.'}</p>
        </header>
        <PaketListe pakete={daten.pakete} basis={basis} />
      </Rahmen>
    )
  }

  // Startseite (später mit der Farm): Einstein begrüßt, nächster Schritt
  const offen = (a: SchuelerAufgabe) => !a.geloest && !a.morgen
  const naechstesPaket = daten.pakete.find((p) => p.aufgaben.some(offen))
  const naechste = naechstesPaket?.aufgaben.find(offen)
  // Usability-Test 2026-11-13: beim ersten Mal (noch nichts gelöst) erklärt Einstein, wie Üben und Farm zusammenhängen
  const neu = !daten.pakete.some((p) => p.aufgaben.some((a) => a.geloest))
  const gruss = naechste ? (neu ? 'begruessung-neu' : 'begruessung') : daten.pakete.length ? 'begruessung-fertig' : 'begruessung-leer'
  return (
    <Rahmen basis={basis} aktiv="start" muenzen={muenzen} fenster={fenster}>
      {wartendHinweis}
      <EinsteinSagt pose="freundlich">
        <p>{EINSTEIN[gruss]?.replaceAll('{name}', daten.pseudonym)}</p>
      </EinsteinSagt>
      {naechstesPaket && naechste && (
        <section className="karte">
          <div className="kopf-zeile">
            <h2>Dein nächster Schritt:</h2>
            {naechste.typ !== 'erklaerung' && (
              <span className="paket-liste__stufe">
                <span className="leise">Schwierigkeit</span>
                <Sterne stufe={naechste.stufe} />
              </span>
            )}
          </div>
          <p>{naechste.titel}</p>
          <div className="knopf-reihe">
            <a className="knopf knopf--haupt" href={`#${basis}/p/${naechstesPaket.id}/a/${naechste.id}`}>
              Weiter üben
            </a>
            <a className="knopf" href={`#${basis}/uebungen`}>
              Alle Übungen
            </a>
          </div>
        </section>
      )}
      <Farm key={farmStand} token={token} figur={daten.figur ?? 'gruen'} nachFigur={() => void laden()} shop={`#${basis}/shop`} album={`#${basis}/album`} />
    </Rahmen>
  )
}

function aufgabeStand(a: SchuelerAufgabe): string {
  if (a.uebung) return a.morgen ? 'Morgen wieder' : a.angefangen ? 'Angefangen' : a.befreundet ? 'Ihr seid Freunde. Du kannst wieder üben.' : a.versuche > 0 ? 'Du kannst es nochmal versuchen.' : 'Neu'
  if (a.typ === 'erklaerung') return a.geloest ? 'Erklärung gelesen. Du kannst sie jederzeit noch einmal lesen.' : 'Erklärung: Lies sie dir in Ruhe durch.'
  return a.geloest ? 'Geschafft! Du kannst sie noch einmal üben.' : a.versuche > 0 ? 'Angefangen' : 'Neu'
}

function PaketListe({ pakete, basis }: { pakete: SchuelerPaket[]; basis: string }) {
  return (
    <ul className="paket-liste">
      {pakete.map((p) => {
        const geschafft = p.aufgaben.filter((a) => a.geloest).length
        const fertig = geschafft === p.aufgaben.length && p.aufgaben.length > 0
        return (
          <li key={p.id}>
            <a className="karte paket-liste__eintrag" href={`#${basis}/p/${p.id}`}>
              <span className="paket-liste__nr" aria-hidden="true">
                {fertig ? '✓' : <Symbol name="uebungen" />}
              </span>
              <span>
                <strong>{p.titel}</strong>
                {p.beschreibung && (
                  <>
                    <br />
                    {p.beschreibung}
                  </>
                )}
                <br />
                <span className="leise">{fertig ? 'Alle Aufgaben geschafft' : `${geschafft} von ${p.aufgaben.length} Aufgaben geschafft`}</span>
              </span>
            </a>
          </li>
        )
      })}
    </ul>
  )
}

type AufgabeSeiteProps = {
  token: string
  paketId: string | null // null: Erklärseite aus dem Menü „Erklärungen“
  aufgabe: SchuelerAufgabe
  neuesFormat: boolean
  nachAbgabe: () => void
  onWartend: (anzahl: number) => void
  weiter: { text: string; ziel: () => void }
}

function AufgabeSeite({ token, paketId, aufgabe, neuesFormat, nachAbgabe, onWartend, weiter }: AufgabeSeiteProps) {
  // Beim Öffnen festhalten, ob das Format neu ist – sonst verschwände Einsteins Erklärung nach der ersten Abgabe
  const [erklaerung] = useState(() => (neuesFormat ? EINSTEIN[formatKennung(aufgabe.typ, aufgabe.inhalt.modus)] : undefined))
  const [start] = useState(() => entwurfLesen(token, aufgabe.id))

  return (
    <AufgabeBearbeiten
      aufgabe={aufgabe}
      einstein={erklaerung}
      startAntworten={start}
      onAntwortenGeaendert={(antworten) => entwurfSpeichern(token, aufgabe.id, antworten)}
      pruefen={async (antworten) => {
        const versuch: WartenderVersuch = {
          client_id: neueId(),
          paket_id: paketId,
          aufgabe_id: aufgabe.id,
          antworten,
          bearbeitet_am: new Date().toISOString(),
        }
        const { data, error } = await supabase.rpc('antwort_abgeben', {
          p_token: token,
          p_paket_id: versuch.paket_id,
          p_aufgabe_id: versuch.aufgabe_id,
          p_antworten: versuch.antworten,
          p_client_id: versuch.client_id,
          p_bearbeitet_am: versuch.bearbeitet_am,
        })
        if (error) {
          if (istNetzwerkfehler(error)) {
            const liste = [...warteschlangeLesen(token), versuch]
            warteschlangeSpeichern(token, liste)
            onWartend(liste.length)
            return null
          }
          throw new Error(fehlerText(error))
        }
        const antwort = data as PruefAntwort
        if (antwort.ergebnis.richtig) entwurfSpeichern(token, aufgabe.id, null)
        nachAbgabe()
        return antwort
      }}
      loesungHolen={async () => {
        const { data, error } = await supabase.rpc('loesung_anzeigen', { p_token: token, p_paket_id: paketId, p_aufgabe_id: aufgabe.id })
        if (error) throw new Error(fehlerText(error))
        return Object.fromEntries((data as Loesung).luecken.map((l) => [l.id, l.loesungen]))
      }}
      weiter={weiter}
    />
  )
}

const MENUE: { id: 'start' | 'shop' | 'uebungen' | 'erklaerungen' | 'lernweg' | 'einstellungen' | 'hilfe'; symbol: SymbolName; text: string; ziel: string }[] = [
  { id: 'start', symbol: 'garten', text: 'Farm', ziel: '' },
  { id: 'shop', symbol: 'shop', text: 'Shop', ziel: '/shop' },
  { id: 'uebungen', symbol: 'uebungen', text: 'Übungen', ziel: '/uebungen' },
  { id: 'erklaerungen', symbol: 'erklaerung', text: 'Erklärungen', ziel: '/erklaerungen' },
  { id: 'lernweg', symbol: 'lernweg', text: 'Lernweg', ziel: '/lernweg' },
  { id: 'einstellungen', symbol: 'einstellungen', text: 'Einstellungen', ziel: '/einstellungen' },
  { id: 'hilfe', symbol: 'hilfe', text: 'Hilfe', ziel: '/hilfe' },
]

// Seite mit Wiese im Hintergrund und Menüleiste unten (das Buch kommt in Phase 8 dazu)
type Geschenk = { id: string; muenzen: number; nachricht: string | null }

// Münzen von der Lehrkraft: einmal als Fenster mit ihrer Nachricht, „Danke!“ schließt es.
function GeschenkFenster({ geschenke, schliessen }: { geschenke: Geschenk[]; schliessen: () => void }) {
  const summe = geschenke.reduce((n, g) => n + g.muenzen, 0)
  return (
    <div className="fenster-hintergrund">
      <div className="karte fenster" role="dialog" aria-modal="true" aria-labelledby="geschenk-titel">
        <h2 id="geschenk-titel">Post von deiner Lehrkraft!</h2>
        <p className="muenzen-plus">
          <Sprite grafik={GRAFIK.muenze} mal={2} /> +{summe} {summe === 1 ? 'Münze' : 'Münzen'} für dich!
        </p>
        {geschenke
          .filter((g) => g.nachricht)
          .map((g) => (
            <p key={g.id} className="fenster__nachricht">
              „{g.nachricht}“
            </p>
          ))}
        <div className="knopf-reihe">
          {/* eslint-disable-next-line jsx-a11y/no-autofocus -- Fenster: Fokus muss hinein */}
          <button type="button" className="knopf knopf--haupt" autoFocus onClick={schliessen}>
            Danke!
          </button>
        </div>
      </div>
    </div>
  )
}

type Belohnung = { id: string; kompetenz: string; stufe: 'besser' | 'deutlich'; artikel: string; name: string }

// Belohnung für Lernfortschritt (Lehrkraft 2026-11-12): einmal als Fenster, ohne Punkte oder Stufen
function BelohnungFenster({ belohnungen, schliessen }: { belohnungen: Belohnung[]; schliessen: () => void }) {
  return (
    <div className="fenster-hintergrund">
      <div className="karte fenster" role="dialog" aria-modal="true" aria-labelledby="belohnung-titel">
        <h2 id="belohnung-titel">Ein Geschenk für deine Farm!</h2>
        <ul className="belohnung-liste">
          {belohnungen.map((b) => {
            const bild = artikelBild(b.artikel)
            return (
              <li key={b.id}>
                <Sprite grafik={bild.grafik} nummer={bild.nummer} mal={2} />
                <span>
                  Du bist bei <strong>{b.kompetenz}</strong> {b.stufe === 'deutlich' ? 'deutlich besser' : 'besser'} geworden!
                  <br />
                  Dafür bekommst du: <strong>{b.stufe === 'besser' ? `Samen für eine ${b.name}` : b.name}</strong>
                </span>
              </li>
            )
          })}
        </ul>
        <p className="leise">Samen findest du beim Pflanzen, Deko steht gleich auf deiner Farm.</p>
        <div className="knopf-reihe">
          {/* eslint-disable-next-line jsx-a11y/no-autofocus -- Fenster: Fokus muss hinein */}
          <button type="button" className="knopf knopf--haupt" autoFocus onClick={schliessen}>
            Danke!
          </button>
        </div>
      </div>
    </div>
  )
}

function Rahmen({ basis, aktiv, menue = true, muenzen = null, fenster, children }: { basis: string; aktiv: string; menue?: boolean; muenzen?: number | null; fenster?: ReactNode; children: ReactNode }) {
  return (
    <div className="garten-seite">
      <main className="garten-seite__inhalt">
        {muenzen !== null && (
          <p className="muenzen-stand">
            <span className="muenzen" role="img" aria-label={`Du hast ${muenzen} Münzen`}>
              <Sprite grafik={GRAFIK.muenze} mal={2} /> {muenzen}
            </span>
          </p>
        )}
        {children}
      </main>
      {fenster}
      {menue && (
        <nav className="menue" aria-label="Hauptmenü">
          <ul>
            {MENUE.map((m) => (
              <li key={m.id}>
                <a href={`#${basis}${m.ziel}`} aria-current={aktiv === m.id ? 'page' : undefined}>
                  <Symbol name={m.symbol} />
                  {m.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  )
}
