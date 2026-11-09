-- =====================================================================
-- Aufgabe 2: Grundeinstellungen der Datenbank und erste Tabelle
-- =====================================================================
-- Grundsätze für alles, was später kommt:
-- * Jede Lehrkraft sieht nur Zeilen, deren "owner" sie selbst ist (Row Level Security).
-- * Ohne Anmeldung (anon) gibt es KEINEN Tabellenzugriff. Schüler:innen kommen nur über
--   einzeln freigegebene Funktionen an ihre eigenen Daten (prüfen den Link-Token).
-- * Neue Funktionen darf zunächst niemand aufrufen; Rechte werden einzeln vergeben.

create extension if not exists pgcrypto with schema extensions;

alter default privileges in schema public revoke execute on functions from public, anon, authenticated;
alter default privileges in schema public revoke all on tables from anon;
alter default privileges in schema public revoke all on sequences from anon;

-- Einstellungen je Lehrkraft. Weitere Spalten (Lernstand, Texte) kommen mit den späteren Aufgaben dazu.
create table public.einstellungen (
  owner uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  -- Garten: so viele erledigte Aufgaben braucht eine Pflanze für die nächste Wachstumsstufe
  guesse_je_stufe integer not null default 3 check (guesse_je_stufe between 1 and 20)
);

alter table public.einstellungen enable row level security;
revoke all on public.einstellungen from anon;
create policy "Lehrkraft: eigene Einstellungen" on public.einstellungen
  for all to authenticated
  using (owner = (select auth.uid()))
  with check (owner = (select auth.uid()));
