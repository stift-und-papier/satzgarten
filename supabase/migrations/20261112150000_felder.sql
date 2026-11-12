-- Phase 8, Aufgabe 38: Felder – pflanzen, gießen, ernten (docs/SPEC-felder.md)
-- Wachstum: jede Münz-Gutschrift für Üben (nicht die der Lehrkraft) seit dem Pflanzen gießt +1,
-- dazu +1 je Kalendertag seit dem Pflanzen, höchstens die Hälfte des Bedarfs. Nichts welkt.
-- Schüler:innen bekommen nur das Bild (0–3) und „reif“, nie die Schritte.

alter table public.besitz add column verbraucht_am timestamptz; -- Samen: beim Pflanzen verbraucht

create table public.pflanzungen (
  id uuid primary key default gen_random_uuid(),
  schueler_id uuid not null references public.schueler (id) on delete cascade,
  feld smallint not null check (feld between 0 and 11),
  sorte text not null references public.shop_artikel (id),
  gepflanzt_am timestamptz not null default now(),
  unique (schueler_id, feld)
);

-- Geerntetes (später zum Füttern)
create table public.vorrat (
  id uuid primary key default gen_random_uuid(),
  schueler_id uuid not null references public.schueler (id) on delete cascade,
  sorte text not null references public.shop_artikel (id),
  erstellt_am timestamptz not null default now(),
  verbraucht_am timestamptz
);
create index on public.vorrat (schueler_id);

-- Kein Zugriff von außen; nur über die Funktionen unten
alter table public.pflanzungen enable row level security;
alter table public.vorrat enable row level security;

-- Wachstumsschritte einer Pflanzung (nur intern)
create function public.wachstum(p public.pflanzungen) returns integer
language sql stable set search_path = '' as $$
  select (
    select count(*) from public.muenz_ereignisse m
    where m.schueler_id = p.schueler_id and m.grund <> 'lehrkraft' and m.erstellt_am > p.gepflanzt_am
  )::integer + least(
    (now() at time zone 'Europe/Berlin')::date - (p.gepflanzt_am at time zone 'Europe/Berlin')::date,
    (select a.bedarf / 2 from public.shop_artikel a where a.id = p.sorte)
  )
$$;

create function public.farm_daten(p_s public.schueler) returns jsonb
language sql stable set search_path = '' as $$
  select jsonb_build_object(
    'felder', 4 + (select count(*) from public.besitz b where b.schueler_id = p_s.id and b.artikel_id = 'feld'),
    'pflanzen', coalesce((
      select jsonb_agg(jsonb_build_object(
        'feld', p.feld, 'sorte', p.sorte,
        'bild', case when w.schritte >= a.bedarf then 3 else least(2, w.schritte * 3 / a.bedarf) end,
        'reif', w.schritte >= a.bedarf
      ) order by p.feld)
      from public.pflanzungen p
      join public.shop_artikel a on a.id = p.sorte
      cross join lateral (select public.wachstum(p) as schritte) w
      where p.schueler_id = p_s.id
    ), '[]'::jsonb),
    'samen', coalesce((
      select jsonb_agg(jsonb_build_object('sorte', x.artikel_id, 'anzahl', x.n) order by x.artikel_id)
      from (
        select b.artikel_id, count(*) as n from public.besitz b join public.shop_artikel a on a.id = b.artikel_id
        where b.schueler_id = p_s.id and a.art = 'samen' and b.verbraucht_am is null group by b.artikel_id
      ) x
    ), '[]'::jsonb),
    'vorrat', coalesce((
      select jsonb_agg(jsonb_build_object('sorte', x.sorte, 'anzahl', x.n) order by x.sorte)
      from (
        select v.sorte, count(*) as n from public.vorrat v
        where v.schueler_id = p_s.id and v.verbraucht_am is null group by v.sorte
      ) x
    ), '[]'::jsonb)
  )
$$;

create function public.schueler_farm(p_token text) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin
  return public.farm_daten(public.schueler_zum_token(p_token));
end
$$;

-- Pflanzen: freies Feld, eigener unverbrauchter Samen dieser Sorte
create function public.pflanzen(p_token text, p_feld integer, p_sorte text) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_s public.schueler := public.schueler_zum_token(p_token);
  v_samen uuid;
begin
  perform 1 from public.schueler where id = v_s.id for update;
  if p_feld is null or p_feld < 0
     or p_feld >= 4 + (select count(*) from public.besitz where schueler_id = v_s.id and artikel_id = 'feld') then
    raise exception 'Dieses Feld gibt es nicht.' using errcode = 'P0001';
  end if;
  if exists (select 1 from public.pflanzungen where schueler_id = v_s.id and feld = p_feld) then
    raise exception 'Auf diesem Feld wächst schon etwas.' using errcode = 'P0001';
  end if;
  select b.id into v_samen from public.besitz b join public.shop_artikel a on a.id = b.artikel_id
  where b.schueler_id = v_s.id and b.artikel_id = p_sorte and a.art = 'samen' and b.verbraucht_am is null
  order by b.erstellt_am limit 1;
  if v_samen is null then
    raise exception 'Diesen Samen hast du nicht.' using errcode = 'P0001';
  end if;
  update public.besitz set verbraucht_am = now() where id = v_samen;
  insert into public.pflanzungen (schueler_id, feld, sorte) values (v_s.id, p_feld, p_sorte);
  return public.farm_daten(v_s);
end
$$;

-- Ernten: nur reife Pflanzen; das Geerntete kommt in den Vorrat, das Feld wird frei
create function public.ernten(p_token text, p_feld integer) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_s public.schueler := public.schueler_zum_token(p_token);
  v_p public.pflanzungen;
begin
  select * into v_p from public.pflanzungen where schueler_id = v_s.id and feld = p_feld for update;
  if not found or public.wachstum(v_p) < (select bedarf from public.shop_artikel where id = v_p.sorte) then
    raise exception 'Hier gibt es noch nichts zu ernten.' using errcode = 'P0001';
  end if;
  delete from public.pflanzungen where id = v_p.id;
  insert into public.vorrat (schueler_id, sorte) values (v_s.id, v_p.sorte);
  return public.farm_daten(v_s);
end
$$;

-- Zurücksetzen löscht auch Felder und Vorrat
create or replace function public.ergebnisse_zuruecksetzen(p_schueler uuid[]) returns integer
language plpgsql security definer set search_path = '' as $$
declare
  v_ids uuid[];
begin
  select coalesce(array_agg(id), '{}') into v_ids
  from public.schueler where id = any(p_schueler) and owner = (select auth.uid());
  delete from public.pflanzungen where schueler_id = any(v_ids);
  delete from public.vorrat where schueler_id = any(v_ids);
  delete from public.besitz where schueler_id = any(v_ids);
  delete from public.muenz_ereignisse where schueler_id = any(v_ids);
  delete from public.versuche where schueler_id = any(v_ids);
  delete from public.loesung_angesehen where schueler_id = any(v_ids);
  delete from public.schueler_stufen where schueler_id = any(v_ids);
  return cardinality(v_ids);
end
$$;

revoke execute on function public.wachstum(public.pflanzungen), public.farm_daten(public.schueler),
  public.schueler_farm(text), public.pflanzen(text, integer, text), public.ernten(text, integer)
  from public, anon, authenticated;
grant execute on function public.schueler_farm(text), public.pflanzen(text, integer, text), public.ernten(text, integer)
  to anon, authenticated;
