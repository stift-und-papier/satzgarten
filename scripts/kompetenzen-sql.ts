// alt (Übungswiese), angepasst: Schreibt aus docs/kompetenzen.csv eine Migration, die alle Kompetenzen
// für jede vorhandene Lehrkraft anlegt. Vorhandene (gleicher Code) bleiben unverändert (Kurznamen gehen nicht verloren).
// Aufruf: node scripts/kompetenzen-sql.ts  → danach npm run db:push
import { readFileSync, writeFileSync } from 'node:fs'
import { kompetenzenAusCsv } from '../src/lib/csv.ts'

const { zeilen, fehler } = kompetenzenAusCsv(readFileSync('docs/kompetenzen.csv', 'utf8'))
if (fehler.length) {
  console.error(fehler.join('\n'))
  process.exit(1)
}

const sql = (wert: string | number | null) =>
  wert === null ? 'null' : typeof wert === 'number' ? String(wert) : `'${wert.replace(/'/g, "''")}'`

const werte = zeilen
  .map((z) => `  (${[z.code, z.kerncurriculum, z.bereich, z.stufe, z.kompetenz, z.hinweis, z.sortierung].map(sql).join(', ')})`)
  .join(',\n')

// shortcut: gilt nur für Lehrkräfte, die es beim Einspielen schon gibt; für spätere Konten das Skript erneut ausführen.
const datei = 'supabase/migrations/20261111120100_kompetenzen_import.sql'
writeFileSync(
  datei,
  `-- Automatisch erzeugt von scripts/kompetenzen-sql.ts aus docs/kompetenzen.csv (${zeilen.length} Kompetenzen).
insert into public.kompetenzen (owner, code, kerncurriculum, bereich, stufe, kompetenz, hinweis, sortierung)
select u.id, v.* from auth.users u cross join (values
${werte}
) as v (code, kerncurriculum, bereich, stufe, kompetenz, hinweis, sortierung)
on conflict (owner, code) do nothing;
`,
)
console.log(`${datei}: ${zeilen.length} Kompetenzen`)
