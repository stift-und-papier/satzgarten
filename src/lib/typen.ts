// Zeilen der Datenbank-Tabellen, wie die Lehrkraft-Seiten sie lesen.
import type { Kerncurriculum, STUFEN } from './csv'

export interface Klasse {
  id: string
  name: string
  kerncurriculum: Kerncurriculum
}

export interface Schueler {
  id: string
  klasse_id: string
  pseudonym: string
  token: string
  stufe_manuell: 1 | 2 | 3 | null
}

export interface Kompetenz {
  id: string
  code: string
  kerncurriculum: Kerncurriculum
  bereich: string
  stufe: (typeof STUFEN)[number]
  kompetenz: string
  hinweis: string | null
  kurzname: string | null
  ausgeblendet: boolean
}
