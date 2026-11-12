-- Lehrkraft 2026-11-12: Obst liegt nicht auf der Karte, sondern kommt nach der Ernte-Animation gleich in den Vorrat.
create or replace function public.baum_ernten(p_token text, p_baum uuid) returns jsonb
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
  insert into public.vorrat (schueler_id, sorte) select v_s.id, v_frucht from generate_series(1, 3);
  return public.farm_daten(v_s);
end
$$;
