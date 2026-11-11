-- =====================================================================
-- Phase 3: Klassen, Schüler:innen (Pseudonyme mit Link-Token), Kompetenzen
-- =====================================================================
-- Schüler:innen kommen NICHT direkt an diese Tabellen (anon hat keine Rechte). Später gibt es
-- einzelne Funktionen, die den Link-Token prüfen.

-- Zufälliger Link-Token: 24 Byte = 192 Bit, URL-tauglich (32 Zeichen).
create function public.neuer_token() returns text
language sql volatile set search_path = '' as $$
  select translate(encode(extensions.gen_random_bytes(24), 'base64'), '+/', '-_')
$$;

create table public.klassen (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (length(btrim(name)) between 1 and 60),
  -- An der KGS hat jede Klasse genau einen Zweig.
  kerncurriculum text not null check (kerncurriculum in ('Gymnasium', 'Realschule', 'Hauptschule')),
  erstellt_am timestamptz not null default now()
);
create index on public.klassen (owner);

create table public.schueler (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references auth.users (id) on delete cascade,
  klasse_id uuid not null references public.klassen (id) on delete cascade,
  pseudonym text not null check (length(btrim(pseudonym)) between 1 and 40),
  token text not null unique default public.neuer_token() check (length(token) >= 32),
  -- Sterne-Stufe von der Lehrkraft fest eingestellt (1–3); null = automatisch
  stufe_manuell smallint check (stufe_manuell between 1 and 3),
  erstellt_am timestamptz not null default now(),
  unique (klasse_id, pseudonym)
);
create index on public.schueler (owner);

-- Kompetenzen gehören einer Lehrkraft (Kurznamen und Ausblenden sind ihre eigene Wahl).
create table public.kompetenzen (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references auth.users (id) on delete cascade,
  code text not null check (length(btrim(code)) between 1 and 40), -- aus der CSV, z. B. "GYM-RE-6-03"
  kerncurriculum text not null check (kerncurriculum in ('Gymnasium', 'Realschule', 'Hauptschule')),
  bereich text not null check (length(btrim(bereich)) between 1 and 80),
  -- Ende Jahrgang 6, 8, 10 oder "6-10" (gilt über alle Stufen). Hauptschule 9/10 steht als "10".
  stufe text not null check (stufe in ('6', '8', '10', '6-10')),
  kompetenz text not null check (length(btrim(kompetenz)) between 1 and 1000),
  hinweis text,
  kurzname text check (length(kurzname) <= 60), -- schülerfreundlich, z. B. "s-Laute"
  ausgeblendet boolean not null default false,
  sortierung integer not null default 0,
  unique (owner, code)
);

-- ---------- Zugriffsregeln ----------
alter table public.klassen enable row level security;
alter table public.schueler enable row level security;
alter table public.kompetenzen enable row level security;
revoke all on public.klassen, public.schueler, public.kompetenzen from anon;
-- Kompetenzen kommen nur aus der CSV; die Lehrkraft ändert Kurzname und Ausblenden, legt aber keine an.
revoke insert, delete on public.kompetenzen from authenticated;
revoke update on public.kompetenzen from authenticated;
grant update (kurzname, ausgeblendet) on public.kompetenzen to authenticated;

create policy "Lehrkraft: eigene Klassen" on public.klassen
  for all to authenticated
  using (owner = (select auth.uid()))
  with check (owner = (select auth.uid()));

create policy "Lehrkraft: eigene Schüler:innen" on public.schueler
  for all to authenticated
  using (owner = (select auth.uid()))
  with check (
    owner = (select auth.uid())
    and exists (select 1 from public.klassen k where k.id = klasse_id and k.owner = (select auth.uid()))
  );

create policy "Lehrkraft: eigene Kompetenzen" on public.kompetenzen
  for all to authenticated
  using (owner = (select auth.uid()))
  with check (owner = (select auth.uid()));

-- Standardwert für den Token beim Anlegen
grant execute on function public.neuer_token() to authenticated;
