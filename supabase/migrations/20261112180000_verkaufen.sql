-- Lehrkraft 2026-11-12: Verkaufen läuft über den Shop. Auch Geerntetes lässt sich verkaufen; teurere Samen geben teurere Ernte.
-- Füttern mit besserer Ernte gibt bessere Eier und Milch (drei Güten), die mehr Münzen bringen. Ein Tier frisst einmal am Tag.

alter table public.shop_artikel
  add column verkauf integer check (verkauf between 1 and 1000), -- Verkaufspreis (Ernte und Erzeugnisse)
  add column guete smallint check (guete between 1 and 3);         -- Güte der Ernte bzw. des Erzeugnisses

update public.shop_artikel a set verkauf = v.verkauf, guete = v.guete
from (values
  ('karotte', 20, 1), ('salat', 20, 1), ('rettich', 25, 1),
  ('tomate', 35, 2), ('weizen', 35, 2), ('gurke', 40, 2), ('blumenkohl', 40, 2), ('rote_bete', 45, 2), ('tulpe', 40, 2), ('rose', 40, 2),
  ('aubergine', 55, 3), ('kuerbis', 60, 3), ('sternfrucht', 60, 3),
  ('ei', 25, 1), ('milch', 35, 1)
) as v (id, verkauf, guete)
where a.id = v.id;
update public.shop_artikel set name = 'Milch' where id = 'milch';

insert into public.shop_artikel (id, art, name, preis, ab_verdient, bedarf, reihenfolge, verkauf, guete) values
  ('ei_rosa', 'erzeugnis', 'Rosa Ei', 0, null, null, 72, 50, 2),
  ('ei_blau', 'erzeugnis', 'Blaues Ei', 0, null, null, 73, 80, 3),
  ('milch_erdbeer', 'erzeugnis', 'Erdbeermilch', 0, null, null, 74, 65, 2),
  ('milch_blaubeer', 'erzeugnis', 'Blaubeermilch', 0, null, null, 75, 100, 3);

-- Was man verkaufen kann: alles im Vorrat mit Verkaufspreis
create function public.verkaufs_liste(p_s public.schueler) returns jsonb
language sql stable set search_path = '' as $$
  select jsonb_build_object(
    'kontostand', public.kontostand(p_s.id),
    'vorrat', coalesce((
      select jsonb_agg(jsonb_build_object('sorte', x.sorte, 'name', a.name, 'anzahl', x.n, 'preis', a.verkauf) order by a.reihenfolge)
      from (
        select v.sorte, count(*) as n from public.vorrat v
        where v.schueler_id = p_s.id and v.verbraucht_am is null group by v.sorte
      ) x
      join public.shop_artikel a on a.id = x.sorte
      where a.verkauf is not null
    ), '[]'::jsonb)
  )
$$;

create function public.schueler_verkauf(p_token text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select public.verkaufs_liste(public.schueler_zum_token(p_token))
$$;

-- Füttern: Güte des Futters bestimmt die Güte von Ei bzw. Milch
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
  where v.schueler_id = v_s.id and v.sorte = p_sorte and a.art = 'samen' and v.verbraucht_am is null
  order by v.erstellt_am limit 1;
  if v_futter is null then raise exception 'Davon hast du nichts geerntet.' using errcode = 'P0001'; end if;
  update public.vorrat set verbraucht_am = now() where id = v_futter;
  insert into public.fuetterungen (tier_id, tag) values (v_tier.id, public.heute());
  insert into public.vorrat (schueler_id, sorte) values (v_s.id, case v_tier.artikel_id
    when 'huhn' then (array['ei', 'ei_rosa', 'ei_blau'])[v_guete]
    else (array['milch', 'milch_erdbeer', 'milch_blaubeer'])[v_guete] end);
  return public.farm_daten(v_s);
end
$$;

-- Verkaufen: eins von etwas aus dem Vorrat (Ernte oder Erzeugnis) gegen Münzen; Antwort = neue Verkaufsliste
create or replace function public.verkaufen(p_token text, p_sorte text) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_s public.schueler := public.schueler_zum_token(p_token);
  v_ding uuid;
  v_preis integer;
begin
  perform 1 from public.schueler where id = v_s.id for update;
  select v.id, a.verkauf into v_ding, v_preis from public.vorrat v join public.shop_artikel a on a.id = v.sorte
  where v.schueler_id = v_s.id and v.sorte = p_sorte and a.verkauf is not null and v.verbraucht_am is null
  order by v.erstellt_am limit 1;
  if v_ding is null then raise exception 'Das hast du nicht zum Verkaufen.' using errcode = 'P0001'; end if;
  update public.vorrat set verbraucht_am = now() where id = v_ding;
  insert into public.muenz_ereignisse (schueler_id, grund, schluessel, muenzen) values (v_s.id, 'verkauf', 'verkauf:' || v_ding, v_preis);
  return public.verkaufs_liste(v_s);
end
$$;

revoke execute on function public.verkaufs_liste(public.schueler), public.schueler_verkauf(text) from public, anon, authenticated;
grant execute on function public.schueler_verkauf(text) to anon, authenticated;
