import { createClient } from '@supabase/supabase-js'

// Verbindung zur Datenbank (Supabase-Projekt "satzgarten", Region Frankfurt).
// Adresse und "publishable"-Schlüssel sind öffentlich und dürfen im Code stehen:
// Was gelesen oder geschrieben werden darf, regeln allein die Zugriffsregeln (Row Level Security) in der Datenbank.
// Der geheime "secret"/"service_role"-Schlüssel gehört NIE in diesen Code.
export const SUPABASE_URL = 'https://diwpqkxhmuetdpxxcoar.supabase.co'
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_yXNUcmBtCxh8Qv5jg0tVqw_-t33x1FJ'

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
