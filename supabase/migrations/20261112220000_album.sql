-- Aufgabe 41c (docs/SPEC-monster.md, Buch): „Mein Sammelalbum“ (Lehrkraft 2026-11-12: Knopf auf der Farm, kein Menüpunkt).
-- Zeigt Pflanzen, Tiere und Deko. Gesammelt = schon einmal gehabt (gekauft, als Belohnung bekommen, gepflanzt oder geerntet).
-- Nicht Gesammeltes ohne Namen (Schüler:innen sehen „?“). Keine Monster, keine Zahlen.
create function public.schueler_album(p_token text) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  v_s public.schueler := public.schueler_zum_token(p_token);
begin
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', a.id, 'art', a.art, 'gesammelt', g.ja, 'name', case when g.ja then a.name end
    ) order by array_position(array['samen', 'tier', 'deko'], a.art), a.reihenfolge, a.id)
    from public.shop_artikel a
    cross join lateral (
      select exists (select 1 from public.besitz b where b.schueler_id = v_s.id and b.artikel_id = a.id)
          or exists (select 1 from public.vorrat v where v.schueler_id = v_s.id and v.sorte = a.id)
          or exists (select 1 from public.pflanzungen p where p.schueler_id = v_s.id and p.sorte = a.id) as ja
    ) g
    where a.art in ('samen', 'tier', 'deko')
  ), '[]'::jsonb);
end
$$;
revoke execute on function public.schueler_album(text) from public, anon, authenticated;
grant execute on function public.schueler_album(text) to anon, authenticated;
