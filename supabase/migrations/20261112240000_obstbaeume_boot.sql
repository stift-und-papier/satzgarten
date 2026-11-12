-- Lehrkraft 2026-11-12: Obstbäume (Orange, Pfirsich, Birne) im Shop: einmal pro Woche erntbar, ohne Gießen, je 3 Früchte.
-- Früchte liegen erst unter dem Baum (einsammeln), dann im Vorrat, verkaufen im Shop. Dazu ein Boot als Deko (liegt im Wasser).
-- Preise von Claude (Bestätigung durch die Lehrkraft offen, siehe docs/SPEC-felder.md). Jeden Baum und das Boot gibt es einmal.

alter table public.shop_artikel drop constraint shop_artikel_art_check;
alter table public.shop_artikel add constraint shop_artikel_art_check check (art in ('samen', 'tier', 'deko', 'feld', 'erzeugnis', 'baum'));

insert into public.shop_artikel (id, art, name, preis, ab_verdient, bedarf, reihenfolge, verkauf) values
  ('orangenbaum',  'baum',      'Orangenbaum',  300,  600, null, 45, null),
  ('pfirsichbaum', 'baum',      'Pfirsichbaum', 350, 1200, null, 46, null),
  ('birnenbaum',   'baum',      'Birnenbaum',   400, 2200, null, 47, null),
  ('orange',       'erzeugnis', 'Orange',         0, null, null, 80, 30),
  ('pfirsich',     'erzeugnis', 'Pfirsich',       0, null, null, 81, 35),
  ('birne',        'erzeugnis', 'Birne',          0, null, null, 82, 40),
  ('boot',         'deko',      'Boot',         120,  600, null, 57, null);

-- Baum: wann zuletzt geerntet (null = noch nie, dann gleich reif)
alter table public.besitz add column geerntet_am timestamptz;
-- Früchte liegen unter dem Baum
alter table public.vorrat drop constraint vorrat_liegt_bei_check;
alter table public.vorrat add constraint vorrat_liegt_bei_check check (liegt_bei ~ '^(feld:\d+|(tier|baum):[0-9a-f-]{36})$');

-- Tage, bis ein Baum wieder trägt (0 = reif): 7 Tage nach der letzten Ernte (Kalendertage, deutsche Zeit)
create function public.baum_tage(p_b public.besitz) returns integer
language sql stable set search_path = '' as $$
  select case when p_b.geerntet_am is null then 0
    else greatest(0, 7 - (public.heute() - (p_b.geerntet_am at time zone 'Europe/Berlin')::date)) end
$$;
revoke execute on function public.baum_tage(public.besitz) from public, anon, authenticated;

-- Kaufen: wie bisher, dazu jeden Baum und das Boot nur einmal
create or replace function public.kaufen(p_token text, p_artikel text) returns jsonb
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
  if (v_a.art = 'baum' or v_a.id = 'boot') and exists (select 1 from public.besitz where schueler_id = v_s.id and artikel_id = v_a.id) then
    raise exception 'Das hast du schon. Davon passt nur eins auf deine Farm.' using errcode = 'P0001';
  end if;
  insert into public.besitz (schueler_id, artikel_id, preis) values (v_s.id, v_a.id, v_a.preis);
  return jsonb_build_object('kontostand', public.kontostand(v_s.id));
end
$$;

-- Farm-Daten wie bisher, dazu die Obstbäume (reif, Tage bis zur nächsten Ernte); Deko enthält das Boot
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
    'baeume', coalesce((
      select jsonb_agg(jsonb_build_object('id', b.id, 'art', b.artikel_id, 'tage', public.baum_tage(b)) order by b.artikel_id)
      from public.besitz b join public.shop_artikel a on a.id = b.artikel_id
      where b.schueler_id = p_s.id and a.art = 'baum'
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

-- Baum ernten: nur eigener, reifer Baum; drei Früchte liegen danach unter dem Baum
create function public.baum_ernten(p_token text, p_baum uuid) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_s public.schueler := public.schueler_zum_token(p_token);
  v_b public.besitz;
  v_frucht text;
begin
  select b.* into v_b from public.besitz b join public.shop_artikel a on a.id = b.artikel_id
  where b.id = p_baum and b.schueler_id = v_s.id and a.art = 'baum' for update of b;
  if not found then raise exception 'Diesen Baum gibt es nicht.' using errcode = 'P0001'; end if;
  if public.baum_tage(v_b) > 0 then
    raise exception 'Der Baum trägt noch keine reifen Früchte.' using errcode = 'P0001';
  end if;
  v_frucht := case v_b.artikel_id when 'orangenbaum' then 'orange' when 'pfirsichbaum' then 'pfirsich' else 'birne' end;
  update public.besitz set geerntet_am = now() where id = v_b.id;
  insert into public.vorrat (schueler_id, sorte, liegt_bei)
    select v_s.id, v_frucht, 'baum:' || v_b.id from generate_series(1, 3);
  return public.farm_daten(v_s);
end
$$;
revoke execute on function public.baum_ernten(text, uuid) from public, anon, authenticated;
grant execute on function public.baum_ernten(text, uuid) to anon, authenticated;

-- Sammelalbum: Obstbäume gehören zu den Pflanzen
create or replace function public.schueler_album(p_token text) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  v_s public.schueler := public.schueler_zum_token(p_token);
begin
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', a.id, 'art', a.art, 'gesammelt', g.ja, 'name', case when g.ja then a.name end
    ) order by array_position(array['samen', 'baum', 'tier', 'deko'], a.art), a.reihenfolge, a.id)
    from public.shop_artikel a
    cross join lateral (
      select exists (select 1 from public.besitz b where b.schueler_id = v_s.id and b.artikel_id = a.id)
          or exists (select 1 from public.vorrat v where v.schueler_id = v_s.id and v.sorte = a.id)
          or exists (select 1 from public.pflanzungen p where p.schueler_id = v_s.id and p.sorte = a.id) as ja
    ) g
    where a.art in ('samen', 'baum', 'tier', 'deko')
  ), '[]'::jsonb);
end
$$;
