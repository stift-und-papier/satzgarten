-- Sammelalbum (Jazz 2026-11-14): auch Monster, mit denen man sich schon angefreundet hat (art = 'monster', id = aufgaben.monster).
-- Monster, die noch keine Freunde sind, nennt der Server gar nicht. Der Rest bleibt wie in obstbaeume_boot.
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
  ), '[]'::jsonb) || coalesce((
    select jsonb_agg(jsonb_build_object('id', m.monster, 'art', 'monster', 'gesammelt', true, 'name', null) order by m.monster)
    from (
      select distinct a.monster
      from public.durchgaenge d
      join public.aufgaben a on a.id = d.aufgabe_id
      where d.schueler_id = v_s.id and d.befreundet
    ) m
  ), '[]'::jsonb);
end
$$;
