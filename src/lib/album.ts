// Sammelalbum: Klebestellen aus der Antwort von schueler_album. Monster nennt der Server nur, wenn man mit ihnen befreundet ist.
import { MONSTER } from './monster'

export type AlbumArt = 'samen' | 'baum' | 'tier' | 'deko' | 'monster'
export type AlbumEintrag = { id: string; art: AlbumArt; gesammelt: boolean; name: string | null }

/** Alle Klebestellen: Shop-Dinge vom Server, dazu jedes Monster. Die id ist der Schlüssel in STICKER_NUMMER (Monster: monster_<Name>). */
export function klebestellen(liste: AlbumEintrag[]): AlbumEintrag[] {
  const freunde = new Set(liste.filter((e) => e.art === 'monster').map((e) => e.id))
  return [
    ...liste.filter((e) => e.art !== 'monster'),
    ...Object.entries(MONSTER).map(([id, m]) => ({
      id: `monster_${id}`, art: 'monster' as const, gesammelt: freunde.has(id), name: freunde.has(id) ? m.name : null,
    })),
  ]
}
