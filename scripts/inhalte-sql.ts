// Übungspakete aus inhalte/*.txt (Lehrkraft 2026-11-12): je Doppeljahrgang, Bereich und Schwierigkeit ein Satz Aufgaben,
// den alle drei Zweige in eigenen Paketen nutzen. Jedes Thema beginnt mit seiner Erklärseite.
// Aufruf: node scripts/inhalte-sql.ts <ausgabe.sql>  → danach: npx supabase db query --linked -f <ausgabe.sql>
// Wiederholbar: feste ids (md5 aus einem Schlüssel), vorhandene Aufgaben werden aktualisiert, Versuche bleiben erhalten.
//
// Aufbau einer Datei (z. B. inhalte/56-wortarten.txt):
//   bereich: Wortarten
//   stufe: 6                                   (6 = 5/6, 8 = 7/8, 10 = 9/10)
//   == Thema | RS-WA-6-01 GYM-WA-6-02          (Kompetenz-Codes; Hauptschule wird aus der Realschule abgeleitet)
//   Erklärtext (Absätze mit Leerzeile)
//   merke: Merksatz
//   beispiel: Beispielsatz mit [hervorgehoben]   (mehrmals)
//   -- 1 | auswahl | Titel                       (1 leicht, 2 mittel, 3 schwer; Optionen nach dem Format:
//                                                 dropdown, korrigieren, merken)
//   anweisung: …   hinweis: …   kategorien: …    (optional, nur am Anfang)
//   Aufgabentext in der Schreibweise des Editors
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { kategorienAus, reihenZuTeilen, textZuTeilen, versionenZuTeilen } from '../src/lib/lueckentext.ts'
import { saetzeTeilen } from '../src/lib/diktat.ts'

const ANWEISUNG: Record<string, string> = {
  lueckentext: 'Ergänze die Lücken.',
  auswahl: 'Tippe die richtige Antwort an.',
  zuordnen: 'Wähle oben eine Kategorie und tippe die passenden Wörter an.',
  fehler: 'Finde die Fehler im Text.',
  reihenfolge: 'Bring die Bausteine in die richtige Reihenfolge.',
  ueberarbeiten: 'Welche Version ist besser? Tippe sie an.',
  diktat: 'Tippe den Text genau ab.',
}
const STUFE_NAME = ['', 'leicht', 'mittel', 'schwer']
const JAHRGAENGE: Record<string, number[]> = { '6': [5, 6], '8': [7, 8], '10': [9, 10] }
const JG_TEXT: Record<string, string> = { '6': '5/6', '8': '7/8', '10': '9/10' }

// Kompetenzen: Hauptschule = Realschule mit gleichem Kurznamen und gleicher Stufe (sonst ohne Entsprechung)
const csv = (f: string) =>
  readFileSync(f, 'utf8').replace(/^﻿/, '').trim().split(/\r?\n/).map((l) => l.split(';'))
const kompetenzen = csv('docs/kompetenzen.csv').slice(1).map(([code, kc, bereich, stufe]) => ({ code, kc, bereich, stufe }))
const kurz = Object.fromEntries(csv('docs/kurznamen.csv').map(([c, k]) => [c, k]))
const HS: Record<string, string> = { 'RS-WA-8-04': 'HS-WA-8-04', 'RS-WA-8-05': 'HS-WA-8-05' }
for (const h of kompetenzen.filter((k) => k.kc === 'Hauptschule')) {
  const r = kompetenzen.find((k) => k.kc === 'Realschule' && k.stufe === h.stufe && kurz[k.code] === kurz[h.code])
  if (r) HS[r.code] ??= h.code
}
const bekannt = new Set(kompetenzen.map((k) => k.code))

type Aufgabe = { schluessel: string; typ: string; titel: string; anweisung: string; hinweis: string | null; stufe: number; loesung: unknown; codes: string[] }
type Thema = { name: string; codes: string[]; erklaerung: Aufgabe | null; aufgaben: Aufgabe[] }
type Pool = { datei: string; bereich: string; stufe: string; themen: Thema[] }

const fehler: string[] = []
function lesen(datei: string): Pool {
  const zeilen = readFileSync(`inhalte/${datei}`, 'utf8').replace(/\r\n/g, '\n').split('\n')
  const kopf = (name: string) => zeilen.find((z) => z.startsWith(name + ':'))?.slice(name.length + 1).trim() ?? ''
  const pool: Pool = { datei, bereich: kopf('bereich'), stufe: kopf('stufe'), themen: [] }
  if (!pool.bereich || !JAHRGAENGE[pool.stufe]) fehler.push(`${datei}: bereich/stufe fehlt`)
  // Abschnitte: == Thema, -- Aufgabe
  let thema: Thema | null = null
  let block: { art: 'thema' | 'aufgabe'; kopf: string; zeilen: string[] } | null = null
  const abschliessen = () => {
    if (!block || !thema) return
    const ort = `${datei} „${block.kopf}“`
    if (block.art === 'thema') {
      let text: string[] = []
      let merke = ''
      const beispiele: string[] = []
      for (const z of block.zeilen) {
        if (z.startsWith('merke:')) merke = z.slice(6).trim()
        else if (z.startsWith('beispiel:')) beispiele.push(z.slice(9).trim())
        else text.push(z)
      }
      text = text.join('\n').trim().split('\n')
      thema.erklaerung = {
        schluessel: `${datei}|erkl|${thema.name}`,
        typ: 'erklaerung',
        titel: `Erklärung: ${thema.name}`,
        anweisung: '',
        hinweis: null,
        stufe: 1,
        loesung: { text: '', gross_klein_beachten: true, teile: [], erklaerung: { text: text.join('\n').trim(), merke, beispiele } },
        codes: thema.codes,
      }
      if (!merke && !text.join('').trim()) fehler.push(`${ort}: Erklärung leer`)
    } else {
      const [sternText, formatText, titel] = block.kopf.split('|').map((s) => s.trim())
      const [typ, ...optionen] = formatText.split(/\s+/)
      const stufe = Number(sternText)
      const z = [...block.zeilen]
      const feld = (name: string) => {
        const i = z.findIndex((x) => x.startsWith(name + ':'))
        if (i < 0) return null
        return z.splice(i, 1)[0].slice(name.length + 1).trim()
      }
      const anweisung = feld('anweisung') ?? ANWEISUNG[typ]
      const hinweis = feld('hinweis')
      const extra = (feld('kategorien') ?? '').split(',').map((s) => s.trim()).filter(Boolean)
      const text = z.join('\n').trim()
      if (![1, 2, 3].includes(stufe) || !ANWEISUNG[typ] || !titel) fehler.push(`${ort}: Kopf falsch`)
      let loesung: unknown
      if (typ === 'diktat') {
        const saetze = saetzeTeilen(text)
        if (!saetze.length) fehler.push(`${ort}: Diktat leer`)
        loesung = { text, gross_klein_beachten: true, teile: [], modus: optionen.includes('merken') ? 'merken' : 'abschreiben', saetze }
      } else {
        const p =
          typ === 'reihenfolge' ? reihenZuTeilen(text) : typ === 'ueberarbeiten' ? versionenZuTeilen(text) : textZuTeilen(text, typ === 'fehler' ? 'fehler' : typ === 'zuordnen')
        for (const f of p.fehler) fehler.push(`${ort}: ${f}`)
        const stellen = p.teile.filter((t) => t.t !== 'text').length
        if (!stellen) fehler.push(`${ort}: keine Stelle zum Bearbeiten`)
        if (typ === 'lueckentext' && !p.teile.some((t) => t.t === 'luecke' || t.t === 'auswahl')) fehler.push(`${ort}: keine Lücke`)
        if (typ === 'auswahl' && !p.teile.some((t) => t.t === 'auswahl')) fehler.push(`${ort}: keine Auswahl`)
        if (typ === 'fehler' && !p.teile.some((t) => t.t === 'wort' && t.korrekturen)) fehler.push(`${ort}: kein Fehler markiert`)
        for (const t of p.teile) if (t.t === 'wort' && t.korrekturen?.includes(t.v)) fehler.push(`${ort}: „${t.v}“ ist als Fehler markiert, aber schon richtig`)
        loesung = {
          text,
          gross_klein_beachten: true,
          darstellung: optionen.includes('dropdown') ? 'dropdown' : 'antippen',
          kategorien: typ === 'zuordnen' ? kategorienAus(p.teile, extra) : undefined,
          ...(typ === 'fehler' ? { korrigieren: optionen.includes('korrigieren'), anzahl_zeigen: true } : {}),
          teile: p.teile,
        }
      }
      thema.aufgaben.push({ schluessel: `${datei}|${titel}`, typ, titel, anweisung, hinweis, stufe, loesung, codes: thema.codes })
    }
    block = null
  }
  for (const zeile of zeilen) {
    if (zeile.startsWith('== ')) {
      abschliessen()
      const [name, codes = ''] = zeile.slice(3).split('|').map((s) => s.trim())
      thema = { name, codes: codes.split(/\s+/).filter(Boolean), erklaerung: null, aufgaben: [] }
      for (const c of thema.codes) if (!bekannt.has(c)) fehler.push(`${datei}: unbekannter Code ${c}`)
      pool.themen.push(thema)
      block = { art: 'thema', kopf: name, zeilen: [] }
    } else if (zeile.startsWith('-- ')) {
      abschliessen()
      block = { art: 'aufgabe', kopf: zeile.slice(3), zeilen: [] }
    } else if (block) block.zeilen.push(zeile)
  }
  abschliessen()
  const titel = pool.themen.flatMap((t) => t.aufgaben.map((a) => a.titel))
  for (const t of new Set(titel)) if (titel.filter((x) => x === t).length > 1) fehler.push(`${datei}: Titel doppelt: ${t}`)
  return pool
}

const pools = readdirSync('inhalte').filter((d) => d.endsWith('.txt')).sort().map(lesen)

// Welche Zweige bekommen ein Paket? Alle, die für Bereich und Stufe (oder 6-10) eine Kompetenz haben.
const ZWEIGE = ['Hauptschule', 'Realschule', 'Gymnasium']
const hatBereich = (kc: string, p: Pool) => kompetenzen.some((k) => k.kc === kc && k.bereich === p.bereich && (k.stufe === p.stufe || k.stufe === '6-10'))

const q = (s: string | null) => (s === null ? 'null' : `'${s.replace(/'/g, "''")}'`)
const id = (schluessel: string) => `md5(${q('wortsalat-inhalt:' + schluessel)})::uuid`
const codesFuer = (codes: string[]) => [...codes, ...codes.map((c) => HS[c]).filter(Boolean)]

let sql = `-- erzeugt von scripts/inhalte-sql.ts – nicht von Hand ändern\nbegin;\n`
sql += `create temp table _lk on commit drop as select id from auth.users order by created_at limit 1;\n`
let anzahlAufgaben = 0
let anzahlPakete = 0
const uebersicht: string[] = []
for (const p of pools) {
  const alle = p.themen.flatMap((t) => [t.erklaerung, ...t.aufgaben]).filter((a): a is Aufgabe => a !== null)
  for (const a of alle) {
    anzahlAufgaben++
    sql += `insert into public.aufgaben (id, owner, typ, titel, anweisung, hinweis, stufe, loesung) values (${id(a.schluessel)}, (select id from _lk), ${q(a.typ)}, ${q(a.titel)}, ${q(a.anweisung)}, ${q(a.hinweis)}, ${a.stufe}, ${q(JSON.stringify(a.loesung))}::jsonb)
  on conflict (id) do update set typ = excluded.typ, titel = excluded.titel, anweisung = excluded.anweisung, hinweis = excluded.hinweis, stufe = excluded.stufe, loesung = excluded.loesung;\n`
    sql += `delete from public.aufgabe_kompetenzen where aufgabe_id = ${id(a.schluessel)};\n`
    const codes = codesFuer(a.codes)
    if (codes.length)
      sql += `insert into public.aufgabe_kompetenzen (aufgabe_id, kompetenz_id) select ${id(a.schluessel)}, k.id from public.kompetenzen k where k.owner = (select id from _lk) and k.code in (${codes.map(q).join(', ')});\n`
  }
  for (const zweig of ZWEIGE.filter((z) => hatBereich(z, p))) {
    for (const stufe of [1, 2, 3]) {
      const reihe: Aufgabe[] = []
      for (const t of p.themen) {
        const auf = t.aufgaben.filter((a) => a.stufe === stufe)
        if (!auf.length) continue
        if (t.erklaerung) reihe.push(t.erklaerung)
        reihe.push(...auf)
      }
      const zahl = reihe.filter((a) => a.typ !== 'erklaerung').length
      if (!zahl) continue
      anzahlPakete++
      const titel = `${p.bereich} ${JG_TEXT[p.stufe]}: ${STUFE_NAME[stufe]}`
      uebersicht.push(`${zweig.padEnd(12)} ${titel.padEnd(42)} ${zahl} Aufgaben`)
      const pid = id(`paket|${p.datei}|${zweig}|${stufe}`)
      sql += `insert into public.pakete (id, owner, titel, beschreibung, jahrgaenge, zweige) values (${pid}, (select id from _lk), ${q(titel)}, ${q(`${p.bereich} für die Jahrgänge ${JG_TEXT[p.stufe]}, ${STUFE_NAME[stufe]}.`)}, '{${JAHRGAENGE[p.stufe].join(',')}}', '{${zweig}}')
  on conflict (id) do update set titel = excluded.titel, beschreibung = excluded.beschreibung, jahrgaenge = excluded.jahrgaenge, zweige = excluded.zweige;\n`
      sql += `delete from public.paket_aufgaben where paket_id = ${pid};\n`
      sql += `insert into public.paket_aufgaben (paket_id, aufgabe_id, position) values ${reihe.map((a, i) => `(${pid}, ${id(a.schluessel)}, ${i})`).join(', ')};\n`
    }
  }
}
sql += `commit;\n`

if (fehler.length) {
  console.error(fehler.join('\n'))
  process.exit(1)
}
const ziel = process.argv[2]
if (ziel) writeFileSync(ziel, sql)
console.log(uebersicht.join('\n'))
console.log(`${pools.length} Dateien, ${anzahlAufgaben} Aufgaben (mit Erklärseiten), ${anzahlPakete} Pakete${ziel ? ' → ' + ziel : ' (nur geprüft)'}`)
