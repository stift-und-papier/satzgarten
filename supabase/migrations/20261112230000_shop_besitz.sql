-- Lehrkraft 2026-11-12: „Du hast …“ im Shop zählt nur, was man noch hat (gepflanzte Samen sind verbraucht).
create or replace function public.schueler_shop(p_token text) returns jsonb
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
        'besitz', (select count(*) from public.besitz b where b.schueler_id = v_s.id and b.artikel_id = a.id and b.verbraucht_am is null)
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
