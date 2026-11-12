-- Phase 8, Aufgabe 37: Shop (docs/SPEC-muenzen.md, docs/SPEC-felder.md)
-- Das Angebot steht hier (Preise, Freischalt-Grenzen); die Bilder dazu in src/lib/shop.ts (gleiche ids).
-- Kontostand = verdiente Münzen − bezahlte Preise. Freischalten hängt an den insgesamt verdienten Münzen.

create table public.shop_artikel (
  id text primary key,
  art text not null check (art in ('samen', 'tier', 'deko', 'feld')),
  name text not null,
  preis integer not null check (preis >= 0),
  -- ab so vielen verdienten Münzen im Shop; null = nicht zu kaufen (nur als Belohnung für Lernfortschritt)
  ab_verdient integer check (ab_verdient >= 0),
  -- Samen: Wachstumsschritte bis zur Ernte (Spec Felder)
  bedarf integer check (bedarf between 1 and 20),
  reihenfolge integer not null default 0
);
alter table public.shop_artikel enable row level security;
create policy "Alle angemeldeten: Angebot lesen" on public.shop_artikel for select to authenticated using (true);
grant select on public.shop_artikel to authenticated;

insert into public.shop_artikel (id, art, name, preis, ab_verdient, bedarf, reihenfolge) values
  ('feld',        'feld',  'Neues Feld',       40,    0, null,  1),
  ('karotte',     'samen', 'Karotte',          15,    0,    4, 10),
  ('salat',       'samen', 'Salat',            15,    0,    4, 11),
  ('rettich',     'samen', 'Rettich',          20,    0,    4, 12),
  ('tomate',      'samen', 'Tomate',           25,  200,    6, 13),
  ('weizen',      'samen', 'Weizen',           25,  200,    6, 14),
  ('gurke',       'samen', 'Gurke',            30,  200,    6, 15),
  ('blumenkohl',  'samen', 'Blumenkohl',       30,  600,    6, 16),
  ('rote_bete',   'samen', 'Rote Bete',        35,  600,    6, 17),
  ('aubergine',   'samen', 'Aubergine',        40, 1200,    8, 18),
  ('kuerbis',     'samen', 'Kürbis',           45, 1200,    8, 19),
  ('sternfrucht', 'samen', 'Sternfrucht',      45, 2200,    8, 20),
  ('tulpe',       'samen', 'Tulpe',             0, null,    6, 30),
  ('rose',        'samen', 'Rose',              0, null,    6, 31),
  ('huhn',        'tier',  'Huhn',            220,  200, null, 40),
  ('kuh',         'tier',  'Kuh',             450, 1200, null, 41),
  ('busch',       'deko',  'Busch',            25,    0, null, 50),
  ('blume_gelb',  'deko',  'Gelbe Blume',      25,  200, null, 51),
  ('pilz',        'deko',  'Pilze',            30,  200, null, 52),
  ('stein',       'deko',  'Stein',            40,  600, null, 53),
  ('blume_lila',  'deko',  'Lila Blume',       40,  600, null, 54),
  ('pilzhaus',    'deko',  'Pilzhaus',        100, 2200, null, 55),
  ('brunnen',     'deko',  'Brunnen',         150, 2200, null, 56),
  ('katze_rosa',  'deko',  'Katzenblume rosa',  0, null, null, 60),
  ('katze_blau',  'deko',  'Katzenblume blau',  0, null, null, 61);

-- Besitz: jedes gekaufte (oder geschenkte) Stück eine Zeile; preis = bezahlt (0 bei Belohnungen)
create table public.besitz (
  id uuid primary key default gen_random_uuid(),
  schueler_id uuid not null references public.schueler (id) on delete cascade,
  artikel_id text not null references public.shop_artikel (id),
  preis integer not null check (preis >= 0),
  erstellt_am timestamptz not null default now()
);
create index on public.besitz (schueler_id);
alter table public.besitz enable row level security;
create policy "Lehrkraft: Besitz eigener Schüler:innen lesen" on public.besitz
  for select to authenticated
  using (exists (select 1 from public.schueler s where s.id = schueler_id and s.owner = (select auth.uid())));
grant select on public.besitz to authenticated;

create function public.verdient(p_schueler uuid) returns integer
language sql stable set search_path = '' as $$
  select coalesce(sum(muenzen), 0)::integer from public.muenz_ereignisse where schueler_id = p_schueler
$$;

create or replace function public.kontostand(p_schueler uuid) returns integer
language sql stable set search_path = '' as $$
  select public.verdient(p_schueler) - coalesce((select sum(preis) from public.besitz where schueler_id = p_schueler), 0)::integer
$$;

-- Shop für Schüler:innen: freigeschaltetes Angebot mit Preis; Gesperrtes nur als Platzhalter (ohne Name, Preis, Grenze)
create function public.schueler_shop(p_token text) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  v_s public.schueler := public.schueler_zum_token(p_token);
  v_verdient integer := public.verdient(v_s.id);
begin
  return jsonb_build_object(
    'kontostand', public.kontostand(v_s.id),
    'angebot', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', a.id, 'art', a.art, 'name', a.name, 'preis', a.preis,
        'besitz', (select count(*) from public.besitz b where b.schueler_id = v_s.id and b.artikel_id = a.id)
      ) order by a.reihenfolge)
      from public.shop_artikel a where a.ab_verdient <= v_verdient
    ), '[]'::jsonb),
    'gesperrt', coalesce((
      select jsonb_agg(jsonb_build_object('art', a.art) order by a.ab_verdient, a.reihenfolge)
      from public.shop_artikel a where a.ab_verdient > v_verdient
    ), '[]'::jsonb)
  );
end
$$;

-- Kaufen: prüft Freischaltung, Kontostand und Felder-Grenze (4 von Anfang an + höchstens 8 gekaufte)
create function public.kaufen(p_token text, p_artikel text) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_s public.schueler := public.schueler_zum_token(p_token);
  v_a public.shop_artikel;
begin
  -- Sperre je Person: zwei gleichzeitige Käufe können den Kontostand nicht unterlaufen
  perform 1 from public.schueler where id = v_s.id for update;
  select * into v_a from public.shop_artikel where id = p_artikel;
  if not found or v_a.ab_verdient is null or v_a.ab_verdient > public.verdient(v_s.id) then
    raise exception 'Das gibt es im Shop noch nicht.' using errcode = 'P0001';
  end if;
  if public.kontostand(v_s.id) < v_a.preis then
    raise exception 'Dafür reichen deine Münzen noch nicht.' using errcode = 'P0001';
  end if;
  if v_a.art = 'feld' and (select count(*) from public.besitz where schueler_id = v_s.id and artikel_id = 'feld') >= 8 then
    raise exception 'Mehr Felder passen nicht auf deine Farm.' using errcode = 'P0001';
  end if;
  insert into public.besitz (schueler_id, artikel_id, preis) values (v_s.id, v_a.id, v_a.preis);
  return jsonb_build_object('kontostand', public.kontostand(v_s.id));
end
$$;

-- Zurücksetzen löscht auch den Besitz
create or replace function public.ergebnisse_zuruecksetzen(p_schueler uuid[]) returns integer
language plpgsql security definer set search_path = '' as $$
declare
  v_ids uuid[];
begin
  select coalesce(array_agg(id), '{}') into v_ids
  from public.schueler where id = any(p_schueler) and owner = (select auth.uid());
  delete from public.besitz where schueler_id = any(v_ids);
  delete from public.muenz_ereignisse where schueler_id = any(v_ids);
  delete from public.versuche where schueler_id = any(v_ids);
  delete from public.loesung_angesehen where schueler_id = any(v_ids);
  delete from public.schueler_stufen where schueler_id = any(v_ids);
  return cardinality(v_ids);
end
$$;

revoke execute on function public.verdient(uuid), public.schueler_shop(text), public.kaufen(text, text) from public, anon, authenticated;
grant execute on function public.schueler_shop(text), public.kaufen(text, text) to anon, authenticated;
