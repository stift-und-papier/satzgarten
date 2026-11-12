-- Phase 8, Aufgabe 39: Tiere füttern (docs/SPEC-felder.md)
-- Füttern verbraucht 1 Geerntetes; jedes Tier frisst höchstens einmal pro Tag und gibt dann ein Ei (Huhn) bzw. Milch (Kuh).
-- Eier und Milch kann man verkaufen (Ei 10, Milch 20 Münzen). Verkaufs-Münzen zählen fürs Freischalten, gießen aber nicht.

alter table public.shop_artikel drop constraint shop_artikel_art_check;
alter table public.shop_artikel add constraint shop_artikel_art_check check (art in ('samen', 'tier', 'deko', 'feld', 'erzeugnis'));
insert into public.shop_artikel (id, art, name, preis, ab_verdient, bedarf, reihenfolge) values
  ('ei', 'erzeugnis', 'Ei', 10, null, null, 70),
  ('milch', 'erzeugnis', 'Milch', 20, null, null, 71);

alter table public.muenz_ereignisse drop constraint muenz_ereignisse_grund_check;
alter table public.muenz_ereignisse add constraint muenz_ereignisse_grund_check
  check (grund in ('aufgabe', 'erklaerung', 'diktat', 'diktat_besser', 'diktat_fehlerfrei', 'lehrkraft', 'verkauf'));

create table public.fuetterungen (
  tier_id uuid not null references public.besitz (id) on delete cascade,
  tag date not null,
  primary key (tier_id, tag)
);
alter table public.fuetterungen enable row level security;

-- Wachstum: Lehrkraft-Münzen und Verkäufe gießen nicht
create or replace function public.wachstum(p public.pflanzungen) returns integer
language sql stable set search_path = '' as $$
  select (
    select count(*) from public.muenz_ereignisse m
    where m.schueler_id = p.schueler_id and m.grund not in ('lehrkraft', 'verkauf') and m.erstellt_am > p.gepflanzt_am
  )::integer + least(
    (now() at time zone 'Europe/Berlin')::date - (p.gepflanzt_am at time zone 'Europe/Berlin')::date,
    (select a.bedarf / 2 from public.shop_artikel a where a.id = p.sorte)
  )
$$;

create function public.heute() returns date
language sql stable set search_path = '' as $$ select (now() at time zone 'Europe/Berlin')::date $$;

-- farm_daten: zusätzlich jedes Tier einzeln (zum Füttern)
create or replace function public.farm_daten(p_s public.schueler) returns jsonb
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
    'tiere', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', b.id, 'art', b.artikel_id,
        'satt', exists (select 1 from public.fuetterungen f where f.tier_id = b.id and f.tag = public.heute())
      ) order by b.erstellt_am, b.id)
      from public.besitz b join public.shop_artikel a on a.id = b.artikel_id
      where b.schueler_id = p_s.id and a.art = 'tier'
    ), '[]'::jsonb),
    'dinge', coalesce((
      select jsonb_agg(jsonb_build_object('artikel', x.artikel_id, 'anzahl', x.n) order by x.artikel_id)
      from (
        select b.artikel_id, count(*) as n from public.besitz b join public.shop_artikel a on a.id = b.artikel_id
        where b.schueler_id = p_s.id and a.art in ('tier', 'deko') group by b.artikel_id
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

-- Füttern: eigenes Tier, heute noch nicht gefüttert, mit eigenem Geernteten (kein Ei/keine Milch)
create function public.fuettern(p_token text, p_tier uuid, p_sorte text) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_s public.schueler := public.schueler_zum_token(p_token);
  v_tier public.besitz;
  v_futter uuid;
begin
  perform 1 from public.schueler where id = v_s.id for update;
  select b.* into v_tier from public.besitz b join public.shop_artikel a on a.id = b.artikel_id
  where b.id = p_tier and b.schueler_id = v_s.id and a.art = 'tier';
  if not found then raise exception 'Dieses Tier gibt es nicht.' using errcode = 'P0001'; end if;
  if exists (select 1 from public.fuetterungen where tier_id = v_tier.id and tag = public.heute()) then
    raise exception 'Heute ist es schon satt. Morgen frisst es wieder.' using errcode = 'P0001';
  end if;
  select v.id into v_futter from public.vorrat v join public.shop_artikel a on a.id = v.sorte
  where v.schueler_id = v_s.id and v.sorte = p_sorte and a.art = 'samen' and v.verbraucht_am is null
  order by v.erstellt_am limit 1;
  if v_futter is null then raise exception 'Davon hast du nichts geerntet.' using errcode = 'P0001'; end if;
  update public.vorrat set verbraucht_am = now() where id = v_futter;
  insert into public.fuetterungen (tier_id, tag) values (v_tier.id, public.heute());
  insert into public.vorrat (schueler_id, sorte) values (v_s.id, case v_tier.artikel_id when 'huhn' then 'ei' else 'milch' end);
  return public.farm_daten(v_s);
end
$$;

-- Verkaufen: ein Ei oder eine Milch gegen Münzen
create function public.verkaufen(p_token text, p_sorte text) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_s public.schueler := public.schueler_zum_token(p_token);
  v_ding uuid;
  v_preis integer;
begin
  perform 1 from public.schueler where id = v_s.id for update;
  select v.id, a.preis into v_ding, v_preis from public.vorrat v join public.shop_artikel a on a.id = v.sorte
  where v.schueler_id = v_s.id and v.sorte = p_sorte and a.art = 'erzeugnis' and v.verbraucht_am is null
  order by v.erstellt_am limit 1;
  if v_ding is null then raise exception 'Das hast du nicht zum Verkaufen.' using errcode = 'P0001'; end if;
  update public.vorrat set verbraucht_am = now() where id = v_ding;
  insert into public.muenz_ereignisse (schueler_id, grund, schluessel, muenzen) values (v_s.id, 'verkauf', 'verkauf:' || v_ding, v_preis);
  return public.farm_daten(v_s) || jsonb_build_object('kontostand', public.kontostand(v_s.id));
end
$$;

revoke execute on function public.heute(), public.fuettern(text, uuid, text), public.verkaufen(text, text) from public, anon, authenticated;
grant execute on function public.fuettern(text, uuid, text), public.verkaufen(text, text) to anon, authenticated;
