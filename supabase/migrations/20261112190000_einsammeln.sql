-- Lehrkraft 2026-11-12: Geerntetes und Eier/Milch erscheinen erst in der Spielwelt (beim Feld bzw. beim Tier)
-- und kommen erst ins Inventar, wenn man sie einsammelt.

-- liegt_bei: null = eingesammelt (im Vorrat); sonst 'feld:<Nummer>' oder 'tier:<id>' (liegt dort auf der Farm)
alter table public.vorrat add column liegt_bei text check (liegt_bei ~ '^(feld:\d+|tier:[0-9a-f-]{36})$');

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
        where v.schueler_id = p_s.id and v.verbraucht_am is null and v.liegt_bei is null group by v.sorte
      ) x
    ), '[]'::jsonb),
    'liegen', coalesce((
      select jsonb_agg(jsonb_build_object('id', v.id, 'sorte', v.sorte, 'bei', v.liegt_bei) order by v.erstellt_am, v.id)
      from public.vorrat v
      where v.schueler_id = p_s.id and v.verbraucht_am is null and v.liegt_bei is not null
    ), '[]'::jsonb)
  )
$$;

create or replace function public.ernten(p_token text, p_feld integer) returns jsonb
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
  insert into public.vorrat (schueler_id, sorte, liegt_bei) values (v_s.id, v_p.sorte, 'feld:' || p_feld);
  return public.farm_daten(v_s);
end
$$;

create or replace function public.fuettern(p_token text, p_tier uuid, p_sorte text) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_s public.schueler := public.schueler_zum_token(p_token);
  v_tier public.besitz;
  v_futter uuid;
  v_guete smallint;
begin
  perform 1 from public.schueler where id = v_s.id for update;
  select b.* into v_tier from public.besitz b join public.shop_artikel a on a.id = b.artikel_id
  where b.id = p_tier and b.schueler_id = v_s.id and a.art = 'tier';
  if not found then raise exception 'Dieses Tier gibt es nicht.' using errcode = 'P0001'; end if;
  if exists (select 1 from public.fuetterungen where tier_id = v_tier.id and tag = public.heute()) then
    raise exception 'Heute ist es schon satt. Morgen frisst es wieder.' using errcode = 'P0001';
  end if;
  select v.id, a.guete into v_futter, v_guete from public.vorrat v join public.shop_artikel a on a.id = v.sorte
  where v.schueler_id = v_s.id and v.sorte = p_sorte and a.art = 'samen' and v.verbraucht_am is null and v.liegt_bei is null
  order by v.erstellt_am limit 1;
  if v_futter is null then raise exception 'Davon hast du nichts geerntet.' using errcode = 'P0001'; end if;
  update public.vorrat set verbraucht_am = now() where id = v_futter;
  insert into public.fuetterungen (tier_id, tag) values (v_tier.id, public.heute());
  insert into public.vorrat (schueler_id, sorte, liegt_bei) values (v_s.id, case v_tier.artikel_id
    when 'huhn' then (array['ei', 'ei_rosa', 'ei_blau'])[v_guete]
    else (array['milch', 'milch_erdbeer', 'milch_blaubeer'])[v_guete] end, 'tier:' || v_tier.id);
  return public.farm_daten(v_s);
end
$$;

-- Einsammeln: etwas, das auf der eigenen Farm liegt, kommt in den Vorrat
create function public.einsammeln(p_token text, p_ding uuid) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_s public.schueler := public.schueler_zum_token(p_token);
begin
  update public.vorrat set liegt_bei = null
  where id = p_ding and schueler_id = v_s.id and verbraucht_am is null and liegt_bei is not null;
  if not found then raise exception 'Das liegt hier nicht (mehr).' using errcode = 'P0001'; end if;
  return public.farm_daten(v_s);
end
$$;

-- Verkaufen nur Eingesammeltes
create or replace function public.verkaufs_liste(p_s public.schueler) returns jsonb
language sql stable set search_path = '' as $$
  select jsonb_build_object(
    'kontostand', public.kontostand(p_s.id),
    'vorrat', coalesce((
      select jsonb_agg(jsonb_build_object('sorte', x.sorte, 'name', a.name, 'anzahl', x.n, 'preis', a.verkauf) order by a.reihenfolge)
      from (
        select v.sorte, count(*) as n from public.vorrat v
        where v.schueler_id = p_s.id and v.verbraucht_am is null and v.liegt_bei is null group by v.sorte
      ) x
      join public.shop_artikel a on a.id = x.sorte
      where a.verkauf is not null
    ), '[]'::jsonb)
  )
$$;

create or replace function public.verkaufen(p_token text, p_sorte text) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_s public.schueler := public.schueler_zum_token(p_token);
  v_ding uuid;
  v_preis integer;
begin
  perform 1 from public.schueler where id = v_s.id for update;
  select v.id, a.verkauf into v_ding, v_preis from public.vorrat v join public.shop_artikel a on a.id = v.sorte
  where v.schueler_id = v_s.id and v.sorte = p_sorte and a.verkauf is not null and v.verbraucht_am is null and v.liegt_bei is null
  order by v.erstellt_am limit 1;
  if v_ding is null then raise exception 'Das hast du nicht zum Verkaufen.' using errcode = 'P0001'; end if;
  update public.vorrat set verbraucht_am = now() where id = v_ding;
  insert into public.muenz_ereignisse (schueler_id, grund, schluessel, muenzen) values (v_s.id, 'verkauf', 'verkauf:' || v_ding, v_preis);
  return public.verkaufs_liste(v_s);
end
$$;

revoke execute on function public.einsammeln(text, uuid) from public, anon, authenticated;
grant execute on function public.einsammeln(text, uuid) to anon, authenticated;
